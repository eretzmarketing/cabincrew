"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TIPOS_REQUISITO } from "@/lib/ia-curriculo-tipos";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const CAMINHO = "/admin/head-hunter/curriculo";

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx.supabase;
}

/** Cria ou edita um requisito / palavra-chave da análise de currículo. */
export async function salvarRequisito(_: Estado, form: FormData): Promise<Estado> {
  const supabase = await admin();
  const id = Number(form.get("id") || 0);
  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const tipo = String(form.get("tipo") ?? "palavra");
  const termos = [...new Set(String(form.get("termos") ?? "").split(/[,;\n]+/).map((t) => t.trim()).filter((t) => t.length >= 2).map((t) => t.slice(0, 60)))].slice(0, 30);
  const validade = String(form.get("validade") ?? "").trim();
  const validade_meses = validade ? Number(validade) : null;
  const instrucao = String(form.get("instrucao") ?? "").trim().slice(0, 500) || null;
  if (nome.length < 2) return { erro: "Digite o nome." };
  if (!(tipo in TIPOS_REQUISITO)) return { erro: "Escolha o tipo." };
  if (validade_meses !== null && (!Number.isInteger(validade_meses) || validade_meses < 1 || validade_meses > 120)) return { erro: "A validade mínima vai de 1 a 120 meses (ou deixe em branco)." };
  const dados = { nome, tipo, termos: termos.length ? termos : [nome], validade_meses, instrucao, atualizado_em: new Date().toISOString() };
  const { error } = id
    ? await supabase.from("cv_requisitos").update(dados).eq("id", id)
    : await supabase.from("cv_requisitos").insert({ ...dados, ordem: Number(form.get("ordem") || 500) });
  if (error) return { erro: error.code === "23505" ? "Já existe um item com esse nome." : error.message.includes("cv_requisitos") ? "Falta rodar o SQL 0065_curriculo_requisitos.sql no Supabase." : "Não foi possível salvar." };
  revalidatePath(CAMINHO);
  return { ok: true, msg: id ? "Salvo ✓" : "Adicionado ✓" };
}

/** Pausar / ativar / excluir. */
export async function acaoRequisito(form: FormData) {
  const supabase = await admin();
  const id = Number(form.get("id"));
  const acao = String(form.get("acao"));
  if (acao === "excluir") await supabase.from("cv_requisitos").delete().eq("id", id);
  else await supabase.from("cv_requisitos").update({ ativo: acao === "ativar", atualizado_em: new Date().toISOString() }).eq("id", id);
  revalidatePath(CAMINHO);
}
