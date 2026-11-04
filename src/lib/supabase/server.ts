import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/** Cliente Supabase para Server Components, Server Actions e Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component: o proxy renova a sessão.
          }
        },
      },
    },
  );
}

/** Usuário logado (ou null) e o perfil dele — uma consulta por requisição. */
export const getUser = cache(async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("apelido, is_admin, pontos, nome, whatsapp, escola")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile };
});

/** Exige login (e, opcionalmente, ser administrador). */
export async function exigirLogin(destino: string, admin = false) {
  const ctx = await getUser();
  if (!ctx.user || !ctx.profile) redirect(`/entrar?modo=entrar&next=${encodeURIComponent(destino)}`);
  if (admin && !ctx.profile.is_admin) redirect("/crew-select");
  return { ...ctx, user: ctx.user, profile: ctx.profile };
}
