import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/app/actions";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acesso suspenso", robots: { index: false } };

export default async function BloqueadoPage() {
  const { profile } = await getUser();
  if (!profile?.bloqueado) redirect("/");
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-soft px-6 py-16">
      <div className="flex max-w-[520px] flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center">
        <span aria-hidden="true" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl">🔒</span>
        <h1 className="font-display text-2xl font-extrabold">Seu acesso está suspenso</h1>
        <p className="text-[16px] leading-relaxed text-ink-2">
          Sua conta foi bloqueada pela equipe da Cabin Crew. Se você acha que isso é um engano, fale com a gente para resolver.
        </p>
        <form action={sair}>
          <button className="min-h-12 cursor-pointer rounded-full bg-navy px-6 font-semibold text-white">Sair da conta</button>
        </form>
      </div>
    </main>
  );
}
