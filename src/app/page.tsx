import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

/** Página inicial: quem está logado vai para o Head Hunter; quem não está, para o login. */
export default async function Home() {
  const { user } = await getUser();
  redirect(user ? "/head-hunter" : "/entrar?modo=entrar");
}
