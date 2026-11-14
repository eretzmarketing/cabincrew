"use server";

import { revalidatePath } from "next/cache";
import { enderecoEmLinha, type PedidoLoja } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

function revalidar() {
  revalidatePath("/admin/loja", "layout");
  revalidatePath("/loja", "layout");
  revalidatePath("/conta/pedidos");
}

/* ------------------------------------------------------------------ pedidos */

/** Admin: pedido postado nos Correios. Grava o rastreio e avisa o aluno no WhatsApp. */
export async function marcarEnviado(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  const rastreio = String(form.get("rastreio") ?? "").toUpperCase().replace(/\s+/g, "").slice(0, 40);
  const avisar = form.get("avisar") === "on";
  if (!id) return { erro: "Pedido inválido." };
  if (rastreio.length < 8) return { erro: "Informe o código de rastreio (ex.: AB123456789BR)." };
  const { data, error } = await supabase.from("loja_pedidos").update({ status: "enviado", rastreio, enviado_em: new Date().toISOString() })
    .eq("id", id).in("status", ["pago", "enviado"]).select("*").maybeSingle();
  if (error || !data) return { erro: "Só pedidos pagos podem ser marcados como enviados." };
  const p = data as PedidoLoja;
  let aviso = "";
  if (avisar && p.telefone) {
    const { data: modelo } = await supabase.from("whatsapp_modelos").select("texto, ativo").eq("evento", "loja_enviado").maybeSingle();
    if (modelo?.ativo && modelo.texto) {
      const texto = preencher(modelo.texto, { nome: p.nome.split(" ")[0], pedido: p.id, produto: `${p.quantidade > 1 ? `${p.quantidade}× ` : ""}${p.produto_nome}`, rastreio, endereco: enderecoEmLinha(p.endereco) });
      const r = await enviarWhatsapp(p.telefone, texto);
      await supabase.from("whatsapp_envios").insert({ user_id: p.user_id, evento: "manual", ref: `loja-enviado-${p.id}-${Date.now()}`, telefone: p.telefone, texto, status: r.ok ? "enviada" : r.status, erro: r.ok ? null : r.erro });
      aviso = r.ok ? " Aviso enviado no WhatsApp." : ` O WhatsApp não foi enviado: ${r.erro}`;
    }
  }
  revalidar();
  return { ok: true, msg: `Pedido nº ${p.id} marcado como enviado.${aviso}` };
}

export async function alterarStatusPedido(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  const acao = String(form.get("acao") ?? "");
  if (!id) return;
  const agora = new Date().toISOString();
  if (acao === "entregue") await supabase.from("loja_pedidos").update({ status: "entregue", entregue_em: agora }).eq("id", id).eq("status", "enviado");
  if (acao === "cancelar") await supabase.from("loja_pedidos").update({ status: "cancelado" }).eq("id", id).eq("status", "aguardando");
  if (acao === "voltar-pago") await supabase.from("loja_pedidos").update({ status: "pago", entregue_em: null }).eq("id", id).in("status", ["enviado", "entregue"]);
  revalidar();
}

export async function salvarObservacaoPedido(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  if (!id) return;
  await supabase.from("loja_pedidos").update({ observacao: String(form.get("observacao") ?? "").trim().slice(0, 1000) || null }).eq("id", id);
  revalidar();
}

/* ------------------------------------------------------------------ produtos */

function lerProduto(form: FormData) {
  const n = (k: string) => Number(String(form.get(k) ?? "").replace(/\./g, "").replace(",", "."));
  const nome = String(form.get("nome") ?? "").trim().slice(0, 120);
  const preco = n("preco");
  const precoDe = String(form.get("preco_de") ?? "").trim() ? n("preco_de") : null;
  const desconto = String(form.get("desconto_pix") ?? "").trim() ? n("desconto_pix") : 0;
  const frete = String(form.get("frete") ?? "").trim() ? n("frete") : 0;
  const estoque = String(form.get("estoque") ?? "").trim() ? Math.max(0, Math.round(n("estoque"))) : null;
  const imagens = String(form.get("imagens") ?? "").split("\n").map((x) => x.trim()).filter((x) => /^(\/|https:\/\/)[^\s"'<>]+$/.test(x)).slice(0, 10);
  if (nome.length < 2) return { erro: "Dê um nome ao produto." } as const;
  if (!(preco >= 1)) return { erro: "Informe o preço." } as const;
  if (desconto < 0 || desconto > 50) return { erro: "O desconto no Pix vai de 0 a 50%." } as const;
  if (frete < 0 || Number.isNaN(frete)) return { erro: "Frete inválido." } as const;
  return {
    dados: {
      nome, preco, preco_de: precoDe && precoDe > preco ? precoDe : null, desconto_pix: desconto, frete, estoque, imagens,
      resumo: String(form.get("resumo") ?? "").trim().slice(0, 300) || null,
      descricao: String(form.get("descricao") ?? "").trim().slice(0, 5000) || null,
      prazo: String(form.get("prazo") ?? "").trim().slice(0, 200) || "Postagem em até 3 dias úteis após o pagamento. Entrega pelos Correios em todo o Brasil.",
      ordem: Math.round(n("ordem")) || 0, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString(),
    },
  } as const;
}

export async function salvarProdutoLoja(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const slug = String(form.get("slug") ?? "");
  const r = lerProduto(form);
  if ("erro" in r) return { erro: r.erro };
  const { error } = await supabase.from("loja_produtos").update(r.dados).eq("slug", slug);
  if (error) return { erro: "Não foi possível salvar." };
  revalidar();
  return { ok: true, msg: "Produto salvo ✓" };
}

export async function criarProdutoLoja(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const r = lerProduto(form);
  if ("erro" in r) return { erro: r.erro };
  const base = r.dados.nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "produto";
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data } = await supabase.from("loja_produtos").select("slug").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  const { error } = await supabase.from("loja_produtos").insert({ slug, ...r.dados });
  if (error) return { erro: error.message.includes("loja_produtos") ? "Rode o SQL 0055_loja.sql no Supabase." : "Não foi possível criar." };
  revalidar();
  return { ok: true, msg: "Produto criado ✓" };
}

export async function excluirProdutoLoja(form: FormData) {
  const { supabase } = await admin();
  const slug = String(form.get("slug") ?? "");
  await supabase.from("loja_produtos").update({ excluido: true, ativo: false }).eq("slug", slug);
  revalidar();
}

