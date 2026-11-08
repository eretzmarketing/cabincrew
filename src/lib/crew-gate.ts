import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { exigirLogin } from "@/lib/supabase/server";

/**
 * Crew Select: exige login, o acesso liberado no painel e a foto de perfil.
 * Administradores sempre entram. A foto só é cobrada depois que o SQL 0018 foi rodado.
 */
export async function exigirCrewSelect(destino: string) {
  const ctx = await exigirLogin(destino);
  const { crew_select_aberto } = await getConfig();
  const liberado = crew_select_aberto || ctx.profile.is_admin;
  if (!ctx.profile.is_admin && "avatar_em" in ctx.profile && !ctx.profile.avatar_em) {
    redirect(`/conta?foto=1&next=${encodeURIComponent(destino)}`);
  }
  return { ...ctx, liberado };
}
