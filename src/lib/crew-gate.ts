import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { exigirLogin } from "@/lib/supabase/server";

export type Acesso = { status: "ativo" | "concluido" | "revogado"; liberado_em: string; encerrado_em: string | null; concluido_em?: string | null; expira_em?: string | null } | null;
export type Curso = "head-hunter" | "english";

/**
 * Curso pago (Head Hunter ou Flight Attendant English): exige login, o acesso ao curso (compra aprovada,
 * liberação do admin ou "cursos liberados para todos") e a foto de perfil. Administradores sempre entram.
 */
export async function exigirCurso(curso: Curso, destino: string) {
  const ctx = await exigirLogin(destino);
  const { crew_select_aberto } = await getConfig();
  const { data, error } = await ctx.supabase.from("acessos").select("*").eq("user_id", ctx.user.id).eq("produto", curso).maybeSingle();
  let acesso = (error ? null : data) as Acesso;
  // acesso reservado pelo admin para o e-mail desta conta (cortesia, Pix direto, curso presencial)
  if (!error && !acesso && !ctx.profile.is_admin) {
    const { data: resgatou } = await ctx.supabase.rpc("hh_resgatar_acesso");
    // (consulta diferente da primeira: a leitura idêntica viria da memória da página)
    if (resgatou) acesso = (await ctx.supabase.from("acessos").select("status, liberado_em, encerrado_em, concluido_em, expira_em, motivo").eq("user_id", ctx.user.id).eq("produto", curso).maybeSingle()).data as Acesso;
  }
  // depois de concluir o curso, o acesso continua até expira_em (dias extras para revisar)
  const expirou = !!acesso?.expira_em && Date.parse(acesso.expira_em) <= Date.now();
  const pago = acesso?.status === "ativo" && !expirou;
  const liberado = ctx.profile.is_admin || crew_select_aberto || pago;
  if (liberado && !ctx.profile.is_admin && "avatar_em" in ctx.profile && !ctx.profile.avatar_em) {
    redirect(`/conta?foto=1&next=${encodeURIComponent(destino)}`);
  }
  return { ...ctx, liberado, acesso, pago, encerrado: acesso?.status === "concluido" || (acesso?.status === "ativo" && expirou) };
}

/** Head Hunter */
export const exigirCrewSelect = (destino: string) => exigirCurso("head-hunter", destino);

/** Cursos ativos do aluno (para mostrar o que ele já tem e o que pode comprar). */
export async function cursosDoAluno(supabase: Awaited<ReturnType<typeof exigirLogin>>["supabase"], userId: string) {
  const { data } = await supabase.from("acessos").select("produto, status, expira_em").eq("user_id", userId);
  const ativos = new Set<string>();
  for (const a of (data ?? []) as { produto: string; status: string; expira_em: string | null }[]) {
    if (a.status === "ativo" && (!a.expira_em || Date.parse(a.expira_em) > Date.now())) ativos.add(a.produto);
  }
  return ativos;
}
