import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CadastroForm, EntrarForm, EsqueciForm } from "@/components/forms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entrar ou criar conta", robots: { index: false } };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string; modo?: string }>;
}) {
  const { next, erro, modo } = await searchParams;
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/crew-select";
  const { user } = await getUser();
  if (user) redirect(destino);

  const qs = (m: string) => `/entrar?modo=${m}${next ? `&next=${encodeURIComponent(destino)}` : ""}`;
  const aba = modo === "entrar" || modo === "esqueci" ? modo : "cadastro";
  const tab = (ativo: boolean) =>
    `flex-1 min-h-12 inline-flex items-center justify-center rounded-full font-display text-[15px] font-bold ${
      ativo ? "bg-navy text-white" : "text-navy hover:bg-[#eceef3]"
    }`;

  return (
    <main className="flex min-h-[calc(100vh-200px)] bg-soft">
      <div className="relative hidden flex-1 md:block">
        <Image src="/img/hero.jpg" alt="" fill priority sizes="50vw" className="object-cover object-[18%_center]" />
      </div>
      <div className="flex flex-1 items-start justify-center px-6 py-12 md:items-center">
        <div className="flex w-full max-w-[440px] flex-col gap-6">
          {aba === "esqueci" ? (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-[30px] font-extrabold">Criar nova senha</h1>
                <p className="text-base leading-relaxed text-ink-2">Enviaremos um link para o seu e-mail.</p>
              </div>
              <EsqueciForm />
              <Link href={qs("entrar")} className="text-sm font-semibold">← Voltar para entrar</Link>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-[30px] font-extrabold tracking-[-0.01em]">
                  {aba === "cadastro" ? "Crie sua conta grátis" : "Bem-vindo de volta"}
                </h1>
                <p className="text-base leading-relaxed text-ink-2">
                  {aba === "cadastro"
                    ? "Leva menos de um minuto e você já começa o Crew Select."
                    : "Entre com o e-mail e a senha do seu cadastro."}
                </p>
              </div>
              <nav aria-label="Entrar ou criar conta" className="flex gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <Link href={qs("cadastro")} className={tab(aba === "cadastro")} aria-current={aba === "cadastro" ? "page" : undefined}>Criar conta</Link>
                <Link href={qs("entrar")} className={tab(aba === "entrar")} aria-current={aba === "entrar" ? "page" : undefined}>Entrar</Link>
              </nav>
              {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">O link expirou ou já foi usado. Peça um novo.</p>}
              {aba === "cadastro" ? <CadastroForm next={destino} /> : <EntrarForm next={destino} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
