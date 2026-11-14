"use server";

import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { enderecoEmLinha, type PedidoLoja } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";
import {
  ARQUIVO_SUPERFRETE, cancelarEtiqueta, configSuperfrete, criarEtiqueta, etiquetaPaga, imprimirEtiqueta, infoEtiqueta, pagarEtiqueta,
  servicoValido, testarTokenSuperfrete, type ConfigSuperfrete, type Remetente,
} from "@/lib/superfrete";

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
  const dim = (k: string, min: number, max: number, padrao: number) => { const v = n(k); return Number.isFinite(v) && v >= min && v <= max ? v : padrao; };
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
      peso_g: Math.round(dim("peso_g", 1, 30000, 1000)), altura_cm: dim("altura_cm", 0.4, 100, 5), largura_cm: dim("largura_cm", 8, 100, 25), comprimento_cm: dim("comprimento_cm", 13, 100, 30),
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


/* ------------------------------------------------------------------ SuperFrete (etiquetas) */

/** Admin: salva o token e o remetente do SuperFrete (só no servidor). */
export async function salvarSuperfrete(_: Estado, form: FormData): Promise<Estado> {
  await admin();
  const atual = configSuperfrete();
  const t = (k: string) => String(form.get(k) ?? "").trim();
  const token = t("token") || atual?.token || "";
  const sandbox = form.get("sandbox") === "on";
  const remetente: Remetente = {
    nome: t("nome").slice(0, 100), documento: t("documento").replace(/\D/g, ""), cep: t("cep").replace(/\D/g, ""), rua: t("rua").slice(0, 50),
    numero: t("numero").slice(0, 10), complemento: t("complemento").slice(0, 20), bairro: t("bairro").slice(0, 50), cidade: t("cidade").slice(0, 50), uf: t("uf").toUpperCase(),
  };
  const servico = Number(form.get("servico")) || 1;
  if (!servicoValido(servico)) return { erro: "Escolha o serviço padrão." };
  if (!token) return { erro: "Cole o token do SuperFrete." };
  if (remetente.nome.split(/\s+/).length < 2) return { erro: "Informe o nome completo do remetente." };
  if (![11, 14].includes(remetente.documento.length)) return { erro: "CPF (11 dígitos) ou CNPJ (14 dígitos) do remetente." };
  if (remetente.cep.length !== 8 || !remetente.rua || !remetente.cidade || !/^[A-Z]{2}$/.test(remetente.uf)) return { erro: "Preencha o endereço completo do remetente (CEP, rua, cidade e UF)." };
  const erro = await testarTokenSuperfrete(token, sandbox);
  if (erro) return { erro };
  await writeFile(ARQUIVO_SUPERFRETE, JSON.stringify({ token, sandbox, servico, remetente, salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_SUPERFRETE, 0o600).catch(() => {});
  revalidatePath("/admin/envios");
  revalidatePath("/admin/loja");
  return { ok: true, msg: `Conectado ao SuperFrete ✓${sandbox ? " (modo de teste: as etiquetas não valem para envio)" : ""}` };
}

type PedidoEtiqueta = PedidoLoja & {
  etiqueta_id: string | null; etiqueta_status: string | null; etiqueta_servico: number | null; etiqueta_url: string | null; etiqueta_preco: number | null;
  loja_produtos: { peso_g: number | null; altura_cm: number | null; largura_cm: number | null; comprimento_cm: number | null } | null;
};

/** Depois de criada: tenta pagar (se ainda estiver no carrinho), lê o rastreio e pega o PDF. */
async function concluirEtiqueta(supabase: Awaited<ReturnType<typeof admin>>["supabase"], cfg: ConfigSuperfrete, p: { id: number; rastreio: string | null }, etiquetaId: string): Promise<Estado> {
  let aviso = "";
  let info = await infoEtiqueta(cfg, etiquetaId);
  if (info.status === "pending") {
    try {
      await pagarEtiqueta(cfg, etiquetaId);
      info = await infoEtiqueta(cfg, etiquetaId);
    } catch (e) {
      aviso = ` Não foi paga: ${(e as Error).message} Adicione saldo na carteira do SuperFrete (ou pague por lá) e clique em "Atualizar etiqueta".`;
    }
  }
  const url = etiquetaPaga(info.status) ? await imprimirEtiqueta(cfg, etiquetaId).catch(() => null) : null;
  await supabase.from("loja_pedidos").update({
    etiqueta_status: info.status, etiqueta_preco: info.preco, etiqueta_url: url,
    ...(info.rastreio && !p.rastreio ? { rastreio: info.rastreio } : {}),
  }).eq("id", p.id);
  revalidar();
  if (info.status === "canceled") return { erro: "Esta etiqueta foi cancelada no SuperFrete. Gere outra." };
  if (!etiquetaPaga(info.status)) return { erro: `Etiqueta criada no carrinho do SuperFrete.${aviso}` };
  return { ok: true, msg: `Etiqueta gerada${info.preco ? ` (${info.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})` : ""}${info.rastreio ? ` · rastreio ${info.rastreio}` : ""}.${url ? " Clique em Imprimir etiqueta." : " O PDF fica pronto em instantes: clique em Atualizar etiqueta."}` };
}

/** Admin: um clique gera a etiqueta (cria, paga com o saldo SuperFrete e traz o PDF e o rastreio). */
export async function gerarEtiqueta(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const cfg = configSuperfrete();
  if (!cfg) return { erro: "Conecte o SuperFrete em Configurações › Envios." };
  const id = Number(form.get("id"));
  const servico = Number(form.get("servico")) || cfg.servico || 1;
  if (!servicoValido(servico)) return { erro: "Escolha PAC, SEDEX, Mini Envios ou Loggi." };
  const { data } = await supabase.from("loja_pedidos").select("*, loja_produtos(peso_g, altura_cm, largura_cm, comprimento_cm)").eq("id", id).maybeSingle();
  const p = data as PedidoEtiqueta | null;
  if (!p || !["pago", "enviado"].includes(p.status)) return { erro: "Só pedidos pagos recebem etiqueta." };
  if (p.etiqueta_id && p.etiqueta_status !== "canceled") return concluirEtiqueta(supabase, cfg, p, p.etiqueta_id);
  if (!p.cpf || p.cpf.length !== 11) return { erro: "O pedido está sem o CPF de quem recebe. Peça o CPF ao aluno e anote na observação." };

  // reserva antes de criar lá fora: dois cliques não geram duas etiquetas
  const { data: reserva, error: erroReserva } = await supabase.rpc("loja_reservar_etiqueta", { p_pedido: id, p_servico: servico });
  if (erroReserva) return { erro: erroReserva.message.includes("loja_reservar_etiqueta") ? "Rode o SQL 0057_superfrete.sql no Supabase." : "Não foi possível reservar a etiqueta." };
  if (!reserva) return { erro: "A etiqueta deste pedido já está sendo gerada. Aguarde alguns segundos e atualize a página." };

  const dims = p.loja_produtos ?? { peso_g: 1000, altura_cm: 5, largura_cm: 25, comprimento_cm: 30 };
  let etiquetaId: string;
  try {
    etiquetaId = await criarEtiqueta(cfg, {
      pedido: p.id, nome: p.nome, cpf: p.cpf, email: p.email, telefone: p.telefone, endereco: p.endereco,
      produto: p.produto_nome, quantidade: p.quantidade, valorUnitario: Number(p.valor_itens) / p.quantidade,
      pacote: {
        altura: Number(dims.altura_cm ?? 5) * p.quantidade, largura: Number(dims.largura_cm ?? 25),
        comprimento: Number(dims.comprimento_cm ?? 30), pesoG: Number(dims.peso_g ?? 1000) * p.quantidade,
      },
    }, servico);
  } catch (e) {
    await supabase.from("loja_pedidos").update({ etiqueta_status: null }).eq("id", id);
    revalidar();
    return { erro: `O SuperFrete recusou: ${(e as Error).message}` };
  }
  await supabase.from("loja_pedidos").update({ etiqueta_id: etiquetaId, etiqueta_status: "pending" }).eq("id", id);
  try {
    return await concluirEtiqueta(supabase, cfg, p, etiquetaId);
  } catch (e) {
    revalidar();
    return { erro: `Etiqueta criada no SuperFrete (nº ${etiquetaId}), mas houve um erro ao concluir: ${(e as Error).message} Clique em Atualizar etiqueta.` };
  }
}

export async function atualizarEtiqueta(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const cfg = configSuperfrete();
  if (!cfg) return { erro: "Conecte o SuperFrete em Configurações › Envios." };
  const { data } = await supabase.from("loja_pedidos").select("id, rastreio, etiqueta_id").eq("id", Number(form.get("id"))).maybeSingle();
  if (!data?.etiqueta_id) return { erro: "Este pedido ainda não tem etiqueta." };
  try {
    return await concluirEtiqueta(supabase, cfg, data as { id: number; rastreio: string | null }, data.etiqueta_id as string);
  } catch (e) {
    return { erro: (e as Error).message };
  }
}

export async function cancelarEtiquetaPedido(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const cfg = configSuperfrete();
  if (!cfg) return { erro: "Conecte o SuperFrete em Configurações › Envios." };
  const { data } = await supabase.from("loja_pedidos").select("id, etiqueta_id, rastreio, status").eq("id", Number(form.get("id"))).maybeSingle();
  if (!data?.etiqueta_id) return { erro: "Este pedido não tem etiqueta." };
  try {
    await cancelarEtiqueta(cfg, data.etiqueta_id as string, `Pedido ${data.id} da loja Cabin Crew`);
  } catch (e) {
    return { erro: `O SuperFrete não cancelou: ${(e as Error).message}` };
  }
  await supabase.from("loja_pedidos").update({
    etiqueta_id: null, etiqueta_status: "canceled", etiqueta_url: null, etiqueta_preco: null,
    ...(data.status === "pago" ? { rastreio: null } : {}),
  }).eq("id", data.id);
  revalidar();
  return { ok: true, msg: "Etiqueta cancelada no SuperFrete. Se já estava paga, o valor volta para a carteira conforme as regras do SuperFrete." };
}
