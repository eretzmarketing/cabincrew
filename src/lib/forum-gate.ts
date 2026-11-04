import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config";
import { getUser } from "@/lib/supabase/server";

/** O fórum só aparece quando está ligado no painel (administradores sempre veem, para revisar). */
export async function exigirForum() {
  const [{ forum_ativo }, { profile }] = await Promise.all([getConfig(), getUser()]);
  if (!forum_ativo && !profile?.is_admin) notFound();
  return { forumAtivo: forum_ativo };
}
