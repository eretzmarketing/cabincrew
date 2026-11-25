"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const FALTA_SQL = "Falta rodar o SQL 0076_escolas.sql no Supabase.";
const limpar = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, 120);

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}
function atualizar() {
  revalidatePath("/admin/configuracoes/escolas");
  revalidatePath("/admin/usuarios/escolas");
  revalidatePath("/entrar");
  revalidatePath("/conta");
}

/** Cola várias escolas, uma por linha. Ignora repetidas (sem diferenciar maiúsculas). */
export async function adicionarEscolas(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const linhas = String(form.get("lista") ?? "").split(/\r?\n/).map((l) => limpar(l.replace(/^[\s•\-*\d.)]+(?=\S)/, ""))).filter((l) => l.length >= 2);
  if (!linhas.length) return { erro: "Cole pelo menos uma escola (uma por linha)." };
  if (linhas.length > 2000) return { erro: "No máximo 2.000 escolas por vez." };
  const { data: atuais, error } = await supabase.from("escolas").select("nome");
  if (error) return { erro: FALTA_SQL };
  const ja = new Set((atuais ?? []).map((e) => (e.nome as string).toLowerCase()));
  const novas: string[] = [];
  for (const l of linhas) {
    const k = l.toLowerCase();
    if (!ja.has(k)) { ja.add(k); novas.push(l); }
  }
  if (novas.length) {
    const { error: e2 } = await supabase.from("escolas").insert(novas.map((nome) => ({ nome })));
    if (e2) return { erro: "Não foi possível salvar. Tente de novo." };
  }
  atualizar();
  const rep = linhas.length - novas.length;
  return { ok: true, msg: `${novas.length} ${novas.length === 1 ? "escola adicionada" : "escolas adicionadas"} ✓${rep ? ` (${rep} já ${rep === 1 ? "estava" : "estavam"} na lista)` : ""}` };
}

/** Renomeia uma escola (e, se marcado, corrige o nome nos alunos já cadastrados). */
export async function renomearEscola(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const de = String(form.get("de") ?? "");
  const para = limpar(String(form.get("para") ?? ""));
  if (para.length < 2) return { erro: "Digite o nome da escola." };
  if (para === de) return { ok: true, msg: "Nada mudou." };
  const { data, error } = await supabase.rpc("admin_renomear_escola", { p_de: de, p_para: para, p_alunos: form.get("alunos") === "on" });
  if (error) return { erro: error.message.includes("já existe") ? "Já existe uma escola com esse nome." : error.message.includes("admin_renomear_escola") ? FALTA_SQL : "Não foi possível renomear." };
  atualizar();
  revalidatePath("/admin/usuarios");
  const n = Number(data ?? 0);
  return { ok: true, msg: `Renomeada ✓${n ? ` (${n} ${n === 1 ? "aluno atualizado" : "alunos atualizados"})` : ""}` };
}

/** Exclui uma ou várias escolas da lista do cadastro. Os alunos já cadastrados não mudam. */
export async function excluirEscolas(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const nomes = [...new Set(form.getAll("nome").map(String))].slice(0, 5000);
  if (!nomes.length) return { erro: "Marque pelo menos uma escola." };
  for (let i = 0; i < nomes.length; i += 200) {
    const { error } = await supabase.from("escolas").delete().in("nome", nomes.slice(i, i + 200));
    if (error) return { erro: "Não foi possível excluir agora." };
  }
  atualizar();
  return { ok: true, msg: `${nomes.length} ${nomes.length === 1 ? "escola excluída" : "escolas excluídas"} da lista ✓` };
}
