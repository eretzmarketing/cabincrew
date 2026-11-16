import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Para onde o aluno vai depois de entrar (ou ao abrir o site já logado), sem empurrar a compra:
 * quem tem o Head Hunter vai para o painel do curso; quem tem outro curso vai para Minha conta;
 * quem ainda não comprou nada vai para os Simulados ANAC, que são grátis.
 */
export default async function Inicio() {
  const { supabase, user, profile } = await getUser();
  if (!user) redirect("/entrar?modo=entrar");
  if (profile?.is_admin || (await getConfig()).crew_select_aberto) redirect("/head-hunter");
  const { data } = await supabase.from("acessos").select("produto, status, expira_em").eq("user_id", user.id).eq("status", "ativo");
  const ativos = ((data ?? []) as { produto: string; expira_em: string | null }[]).filter((a) => !a.expira_em || Date.parse(a.expira_em) > Date.now());
  if (ativos.some((a) => a.produto === "head-hunter")) redirect("/head-hunter");
  if (ativos.length) redirect("/conta");
  redirect("/simulados-anac");
}
