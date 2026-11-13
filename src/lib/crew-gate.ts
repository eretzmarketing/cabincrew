import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { exigirLogin } from "@/lib/supabase/server";

export type Acesso = { status: "ativo" | "concluido" | "revogado"; liberado_em: string; encerrado_em: string | null } | null;

/**
 * Head Hunter: exige login, o acesso (compra aprovada, ou "liberado para todos" no admin) e a foto de perfil.
 * Administradores sempre entram. A foto só é cobrada depois que o SQL 0018 foi rodado.
 */
export async function exigirCrewSelect(destino: string) {
  const ctx = await exigirLogin(destino);
  const { crew_select_aberto } = await getConfig();
  const { data, error } = await ctx.supabase.from("acessos").select("status, liberado_em, encerrado_em").eq("user_id", ctx.user.id).eq("produto", "head-hunter").maybeSingle();
  const acesso = (error ? null : data) as Acesso;
  const liberado = ctx.profile.is_admin || crew_select_aberto || acesso?.status === "ativo";
  if (liberado && !ctx.profile.is_admin && "avatar_em" in ctx.profile && !ctx.profile.avatar_em) {
    redirect(`/conta?foto=1&next=${encodeURIComponent(destino)}`);
  }
  return { ...ctx, liberado, acesso, pago: acesso?.status === "ativo" };
}
