"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizarCupom } from "@/lib/cupons";
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
  const produtos = form.getAll("produtos").map(String).filter((x) => /^[a-z0-9-]{2,40}$/.test(x));
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
