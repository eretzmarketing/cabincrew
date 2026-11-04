import { getConfig } from "@/lib/config";
import { exigirLogin } from "@/lib/supabase/server";

/** Crew Select: exige login e o acesso liberado no painel (administradores sempre entram). */
export async function exigirCrewSelect(destino: string) {
  const ctx = await exigirLogin(destino);
  const { crew_select_aberto } = await getConfig();
  const liberado = crew_select_aberto || ctx.profile.is_admin;
  return { ...ctx, liberado };
}
