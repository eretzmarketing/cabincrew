import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { EntrarForm } from "@/components/forms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next, erro } = await searchParams;
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/forum";
  const { user } = await getUser();
  if (user) redirect(destino);

  return (
    <main className="flex min-h-[calc(100vh-200px)] bg-soft">
      <div className="relative hidden flex-1 md:block">
        <Image src="/img/relato.jpg" alt="" fill priority sizes="50vw" className="object-cover object-[35%_center]" />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[32px] font-extrabold tracking-[-0.01em]">Entrar ou criar conta</h1>
            <p className="text-base leading-relaxed text-ink-2">
              Sem senha: enviamos um link de acesso para o seu e-mail. Se for a primeira vez, sua conta é criada
              automaticamente.
            </p>
          </div>
          {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">O link expirou ou já foi usado. Peça um novo.</p>}
          <EntrarForm next={destino} />
          <p className="text-sm text-muted">Ao entrar, você concorda com as regras do fórum e a política de privacidade.</p>
        </div>
      </div>
    </main>
  );
}
