"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { INTERVALOS } from "@/lib/campanhas";
import { normalizarCupom } from "@/lib/cupons";
import { normalizarTelefone } from "@/lib/telefone";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

/** "2026-11-30" no horário de Brasília: início do dia (ou fim do dia, para a validade). */
function dia(v: string, fimDoDia: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return new Date(`${v}T${fimDoDia ? "23:59:59" : "00:00:00"}-03:00`).toISOString();
}

/** Admin: cria ou edita um cupom. */
export async function salvarCupom(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user } = await admin();
  const original = normalizarCupom(String(form.get("original") ?? ""));
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  const tipo = String(form.get("tipo")) === "valor" ? "valor" : "percentual";
  const valor = Number(String(form.get("valor") ?? "").replace(/\./g, "").replace(",", "."));
  const limite = String(form.get("limite_usos") ?? "").trim();
  const produtos = form.getAll("produtos").map(String).filter((x) => /^[a-z0-9-]{2,40}$/.test(x) || /^loja:([a-z0-9-]{2,60}|\*)$/.test(x));
  const inicio = String(form.get("inicio") ?? "");
  const fim = String(form.get("fim") ?? "");
  if (codigo.length < 3) return { erro: "O código precisa ter pelo menos 3 letras ou números (ex.: ESCOLA10)." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Informe o valor do desconto." };
  if (tipo === "percentual" && valor >= 100) return { erro: "O desconto em % vai até 99%. Para acesso grátis, use Adicionar aluno › Cortesia." };
  if (limite && (!/^\d+$/.test(limite) || Number(limite) < 1)) return { erro: "A quantidade de usos precisa ser um número (ou deixe em branco para ilimitado)." };
  const dInicio = inicio ? dia(inicio, false) : null;
  const dFim = fim ? dia(fim, true) : null;
  if (dInicio && dFim && dFim < dInicio) return { erro: "A data final é antes da inicial." };

  const dados = {
    codigo, tipo, valor: Math.round(valor * 100) / 100,
    parceiro: String(form.get("parceiro") ?? "").trim().slice(0, 120) || null,
    observacao: String(form.get("observacao") ?? "").trim().slice(0, 500) || null,
    produtos: produtos.length ? produtos : null, limite_usos: limite ? Number(limite) : null,
    inicio: dInicio, fim: dFim, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString(),
  };
  if (original) {
    if (original !== codigo) {
      const { count } = await supabase.from("compras").select("id", { count: "exact", head: true }).eq("cupom", original);
      if (count) return { erro: "Este cupom já foi usado em compras: o código não pode mudar (crie um novo)." };
    }
    const { error } = await supabase.from("cupons").update(dados).eq("codigo", original);
    if (error) return { erro: error.code === "23505" ? "Já existe um cupom com esse código." : "Não foi possível salvar." };
  } else {
    const { error } = await supabase.from("cupons").insert({ ...dados, criado_por: user!.id });
    if (error) return { erro: error.code === "23505" ? "Já existe um cupom com esse código." : error.message.includes("cupons") ? "Rode o SQL 0047_cupons.sql no Supabase." : "Não foi possível criar o cupom." };
  }
  revalidatePath("/admin/cupons");
  redirect(`/admin/cupons?salvo=${codigo}#${codigo}`);
}

export async function alternarCupom(form: FormData) {
  const { supabase } = await admin();
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  await supabase.from("cupons").update({ ativo: form.get("ativo") === "1", updated_at: new Date().toISOString() }).eq("codigo", codigo);
  revalidatePath("/admin/cupons");
}

/** Exclui um cupom que nunca foi usado; se já foi usado, apenas desativa (o histórico das compras fica). */
export async function excluirCupom(form: FormData) {
  const { supabase } = await admin();
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  const { count } = await supabase.from("compras").select("id", { count: "exact", head: true }).eq("cupom", codigo);
  if (count) await supabase.from("cupons").update({ ativo: false }).eq("codigo", codigo);
  else await supabase.from("cupons").delete().eq("codigo", codigo);
  revalidatePath("/admin/cupons");
}

/**
 * Admin: envia o cupom pelo WhatsApp da Cabin Crew (Wawp) para alunos escolhidos e/ou números digitados.
 * Uma pessoa: envia na hora. Várias: vira uma campanha com intervalo entre as mensagens (protege o número).
 */
export async function enviarCupomWhatsapp(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user } = await admin();
  const codigo = normalizarCupom(String(form.get("codigo") ?? ""));
  const mensagem = String(form.get("mensagem") ?? "").trim();
  let ids: string[] = [];
  try { ids = (JSON.parse(String(form.get("ids") ?? "[]")) as string[]).filter((x) => /^[0-9a-f-]{36}$/i.test(x)); } catch { /* vazio */ }
  const linhas = String(form.get("telefones") ?? "").split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);
  if (!codigo) return { erro: "Cupom inválido." };
  if (mensagem.length < 5 || mensagem.length > 3000) return { erro: "Escreva a mensagem (até 3.000 caracteres)." };
  if (!mensagem.includes(codigo) && !mensagem.includes("cupom=")) return { erro: "A mensagem precisa ter o código do cupom ou o link." };

  const invalidos = linhas.filter((l) => !normalizarTelefone(l));
  if (invalidos.length) return { erro: `Número inválido: ${invalidos.slice(0, 3).join(", ")}. Use DDD + número (ex.: 11 98177-7605) ou +DDI para outros países.` };

  let dest: { user_id: string | null; nome: string; telefone: string }[] = [];
  if (ids.length) {
    const { data } = await supabase.rpc("admin_publico_campanha");
    const sel = new Set(ids);
    dest = ((data ?? []) as { id: string; nome: string | null; whatsapp: string | null; bloqueado: boolean }[])
      .filter((p) => sel.has(p.id) && p.whatsapp && !p.bloqueado)
      .map((p) => ({ user_id: p.id, nome: p.nome ?? "", telefone: p.whatsapp! }));
  }
  for (const l of linhas) dest.push({ user_id: null, nome: "", telefone: normalizarTelefone(l)! });
  const vistos = new Set<string>();
  dest = dest.filter((d) => { const k = d.telefone.replace(/\D/g, ""); if (vistos.has(k)) return false; vistos.add(k); return true; });
  if (!dest.length) return { erro: "Escolha pelo menos um aluno (com WhatsApp) ou digite um número." };

  // uma pessoa: envia agora
  if (dest.length === 1) {
    const d = dest[0];
    const texto = preencher(mensagem, { nome: d.nome.split(" ")[0] || "" }).replace(/(Olá|Oi), !/g, "$1!");
    const r = await enviarWhatsapp(d.telefone, texto);
    await supabase.from("whatsapp_envios").insert({ user_id: d.user_id, evento: "manual", ref: `cupom-${codigo}-${Date.now()}`, telefone: d.telefone, texto, status: r.ok ? "enviada" : r.status, erro: r.ok ? null : r.erro });
    revalidatePath("/admin/whatsapp");
    return r.ok ? { ok: true, msg: `Cupom enviado para ${d.nome || d.telefone} ✓` } : { erro: `Não foi enviado: ${r.erro}` };
  }

  // várias: campanha com intervalo
  const intervalo = INTERVALOS.find((i) => i.id === String(form.get("intervalo"))) ?? INTERVALOS[1];
  const { data: c, error } = await supabase.from("whatsapp_campanhas").insert({
    nome: `Cupom ${codigo}`, texto: mensagem, imagem: null, fonte: linhas.length ? "manual" : "alunos", filtros: { cupom: codigo },
    intervalo_min: intervalo.min, intervalo_max: intervalo.max, status: "pausada", total: dest.length, criado_por: user!.id,
  }).select("id").single();
  if (error || !c) return { erro: error?.message.includes("fonte") ? "Rode o SQL 0047_cupons.sql (versão atualizada) no Supabase." : "Não foi possível montar o envio." };
  for (let i = 0; i < dest.length; i += 500) {
    const { error: e2 } = await supabase.from("whatsapp_campanha_envios").insert(dest.slice(i, i + 500).map((d) => ({ campanha_id: c.id, ...d })));
    if (e2) return { erro: "Não foi possível montar a lista de envio." };
  }
  revalidatePath("/admin/campanhas");
  redirect(`/admin/campanhas/${c.id}`);
}
