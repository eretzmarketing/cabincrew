import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { exigirLogin } from "@/lib/supabase/server";

export type Acesso = { status: "ativo" | "concluido" | "revogado"; liberado_em: string; encerrado_em: string | null; concluido_em?: string | null; expira_em?: string | null } | null;

/**
 * Head Hunter: exige login, o acesso (compra aprovada, ou "liberado para todos" no admin) e a foto de perfil.
 * Administradores sempre entram. A foto só é cobrada depois que o SQL 0018 foi rodado.
 */
export async function exigirCrewSelect(destino: string) {
  const ctx = await exigirLogin(destino);
  const { crew_select_aberto } = await getConfig();
  const { data, error } = await ctx.supabase.from("acessos").select("*").eq("user_id", ctx.user.id).eq("produto", "head-hunter").maybeSingle();
  let acesso = (error ? null : data) as Acesso;
  // acesso reservado pelo admin para o e-mail desta conta (cortesia, Pix direto, curso presencial)
  if (!error && !acesso && !ctx.profile.is_admin) {
    const { data: resgatou } = await ctx.supabase.rpc("hh_resgatar_acesso");
    // (consulta diferente da primeira: a leitura idêntica viria da memória da página)
    if (resgatou) acesso = (await ctx.supabase.from("acessos").select("status, liberado_em, encerrado_em, concluido_em, expira_em, motivo").eq("user_id", ctx.user.id).eq("produto", "head-hunter").maybeSingle()).data as Acesso;
  }
  // depois de concluir a jornada, o acesso continua até expira_em (dias extras para revisar)
  const expirou = !!acesso?.expira_em && Date.parse(acesso.expira_em) <= Date.now();
  const pago = acesso?.status === "ativo" && !expirou;
  const liberado = ctx.profile.is_admin || crew_select_aberto || pago;
  if (liberado && !ctx.profile.is_admin && "avatar_em" in ctx.profile && !ctx.profile.avatar_em) {
    redirect(`/conta?foto=1&next=${encodeURIComponent(destino)}`);
  }
  return { ...ctx, liberado, acesso, pago, encerrado: acesso?.status === "concluido" || (acesso?.status === "ativo" && expirou) };
}
