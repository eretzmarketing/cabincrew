"use server";

import { revalidatePath } from "next/cache";
import { chaveAula } from "@/lib/ingles-a-bordo";
import { cursoIdioma, infoCursos } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const UUID = /^[0-9a-f-]{36}$/i;
const cursoExiste = async (slug: string) => (await infoCursos()).some((c) => c.slug === slug);

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

function revalidar(id: string) {
  revalidatePath("/admin/head-hunter/alunos");
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
}

export type DadosGestao = {
  acessos: { produto: string; status: string; expira_em: string | null; concluido_em: string | null }[];
  hh: { id: number; titulo: string; feitas: number; total: number }[];
  en: { id: number; titulo: string; feitas: number; total: number }[];
  es: { id: number; titulo: string; feitas: number; total: number }[];
  cursos: { slug: string; nome: string }[];
  secoes: { curso: string; titulo: string; mods: { id: number; titulo: string; feitas: number; total: number }[] }[];
};

/** Dados do painel "Editar aluno": cursos e progresso por módulo. */
export async function dadosGestaoAluno(id: string): Promise<DadosGestao | null> {
  const { supabase } = await admin();
  if (!UUID.test(id)) return null;
  const [{ data: acs }, { data: mods }, { data: auls }, { data: prog }, { data: ing }, { data: esp }] = await Promise.all([
    supabase.from("acessos").select("produto, status, expira_em, concluido_em").eq("user_id", id),
    supabase.from("modulos").select("id, titulo, ordem, curso").order("ordem"),
    supabase.from("aulas").select("id, modulo_id"),
    supabase.from("progresso").select("aula_id").eq("user_id", id),
    supabase.from("ingles_progresso").select("aula, concluida").eq("user_id", id),
    supabase.from("espanhol_progresso").select("aula, concluida").eq("user_id", id),
  ]);
  const feitas = new Set(((prog ?? []) as { aula_id: string }[]).map((p) => p.aula_id));
  const porModulo = new Map<number, { total: number; feitas: number }>();
  for (const a of (auls ?? []) as { id: string; modulo_id: number }[]) {
    const m = porModulo.get(a.modulo_id) ?? { total: 0, feitas: 0 };
    m.total++; if (feitas.has(a.id)) m.feitas++;
    porModulo.set(a.modulo_id, m);
  }
  const espOk = new Set(((esp ?? []) as { aula: string; concluida: boolean }[]).filter((x) => x.concluida).map((x) => x.aula));
  const ingOk = new Set(((ing ?? []) as { aula: string; concluida: boolean }[]).filter((x) => x.concluida).map((x) => x.aula));
  const [{ modulos: MODULOS_INGLES }, { modulos: MODULOS_ESPANHOL }, cursos] = await Promise.all([cursoIdioma("english"), cursoIdioma("spanish"), infoCursos()]);
  const doCurso = (slug: string) => ((mods ?? []) as { id: number; titulo: string; curso?: string }[])
    .filter((m) => (m.curso ?? "head-hunter") === slug)
    .map((m) => ({ id: m.id, titulo: m.titulo, ...(porModulo.get(m.id) ?? { total: 0, feitas: 0 }) }));
  const hh = doCurso("head-hunter");
  const en = MODULOS_INGLES.map((m) => ({ id: m.numero, titulo: `${m.numero}. ${m.titulo}`, total: m.aulas.length, feitas: m.aulas.filter((a) => ingOk.has(chaveAula(a))).length }));
  const es = MODULOS_ESPANHOL.map((m) => ({ id: m.numero, titulo: `${m.numero}. ${m.titulo}`, total: m.aulas.length, feitas: m.aulas.filter((a) => espOk.has(chaveAula(a))).length }));
  return {
    acessos: (acs ?? []) as DadosGestao["acessos"], hh, en, es,
    cursos: cursos.map((c) => ({ slug: c.slug, nome: c.titulo })),
    secoes: cursos.map((c) => ({ curso: c.slug, titulo: `Módulos do ${c.titulo}`, mods: c.slug === "english" ? en : c.slug === "spanish" ? es : doCurso(c.slug) })),
  };
}

export async function resetarModuloAluno(id: string, curso: string, modulo: number): Promise<Estado> {
  const { supabase } = await admin();
  if (!UUID.test(id) || !(await cursoExiste(curso)) || !Number.isInteger(modulo)) return { erro: "Dados inválidos." };
  const { data, error } = await supabase.rpc("admin_resetar_modulo", { p_user: id, p_curso: curso, p_modulo: modulo });
  if (error) return { erro: error.message.includes("admin_resetar_modulo") ? "Rode o SQL 0048_gestao_alunos.sql no Supabase." : "Não foi possível resetar." };
  revalidar(id);
  return { ok: true, msg: `Módulo resetado (${data ?? 0} registro(s) apagado(s)).` };
}

/** Suspende (pausa) ou reativa o acesso a um curso; remover encerra de vez. */
export async function alterarCursoAluno(id: string, curso: string, acao: "suspender" | "reativar" | "remover"): Promise<Estado> {
  const { supabase } = await admin();
  if (!UUID.test(id) || !(await cursoExiste(curso))) return { erro: "Dados inválidos." };
  const agora = new Date().toISOString();
  const dados = acao === "suspender" ? { status: "suspenso", motivo: "suspenso pelo administrador", encerrado_em: agora }
    : acao === "reativar" ? { status: "ativo", motivo: "reativado pelo administrador", encerrado_em: null }
    : { status: "revogado", motivo: "removido pelo administrador", encerrado_em: agora };
  const { error } = await supabase.from("acessos").update(dados).eq("user_id", id).eq("produto", curso);
  if (error) return { erro: error.message.includes("check") ? "Rode o SQL 0048_gestao_alunos.sql no Supabase." : "Não foi possível alterar." };
  revalidar(id);
  return { ok: true, msg: acao === "suspender" ? "Acesso suspenso." : acao === "reativar" ? "Acesso reativado." : "Aluno removido do curso." };
}

/** Estende o acesso de quem já concluiu (dias de revisão) ou ficou com o acesso vencido. */
export async function prorrogarCursoAluno(id: string, curso: string, dias: number): Promise<Estado> {
  const { supabase } = await admin();
  if (!UUID.test(id) || !(await cursoExiste(curso)) || ![7, 15, 30, 60, 90].includes(dias)) return { erro: "Dados inválidos." };
  const { data: ac } = await supabase.from("acessos").select("expira_em").eq("user_id", id).eq("produto", curso).maybeSingle();
  if (!ac) return { erro: "Este aluno não tem acesso a este curso. Use Adicionar ao curso." };
  const base = Math.max(Date.now(), ac.expira_em ? Date.parse(ac.expira_em as string) : Date.now());
  const expira = new Date(base + dias * 86400000).toISOString();
  const { error } = await supabase.from("acessos").update({ status: "ativo", expira_em: expira, encerrado_em: null, motivo: `prorrogado ${dias} dias pelo administrador` }).eq("user_id", id).eq("produto", curso);
  if (error) return { erro: "Não foi possível prorrogar." };
  revalidar(id);
  return { ok: true, msg: `Acesso prorrogado até ${new Date(expira).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.` };
}

export async function banirAluno(id: string, banir: boolean): Promise<Estado> {
  const { supabase } = await admin();
  if (!UUID.test(id)) return { erro: "Aluno inválido." };
  const { error } = await supabase.rpc("admin_bloquear_usuario", { p_user: id, p_bloquear: banir });
  if (error) return { erro: error.message.includes("administrador") || error.message.includes("própria") ? error.message : "Não foi possível alterar." };
  revalidar(id);
  return { ok: true, msg: banir ? "Aluno banido: não consegue mais usar a plataforma." : "Banimento removido." };
}

export async function excluirAluno(id: string, motivo: string, confirmacao: string): Promise<Estado> {
  const { supabase } = await admin();
  if (!UUID.test(id)) return { erro: "Aluno inválido." };
  if (confirmacao.trim().toUpperCase() !== "EXCLUIR") return { erro: "Digite EXCLUIR para confirmar." };
  const { error } = await supabase.rpc("admin_excluir_usuario", { p_user: id, p_motivo: motivo.trim().slice(0, 500) || null });
  if (error) return { erro: error.message.includes("administrador") || error.message.includes("própria") ? error.message : "Não foi possível excluir." };
  // a lista é atualizada quando o admin fecha o aviso (senão o aviso some junto com a linha)
  revalidatePath("/admin/contas-excluidas");
  return { ok: true, msg: "Conta excluída. O registro ficou em Usuários › Contas excluídas." };
}
