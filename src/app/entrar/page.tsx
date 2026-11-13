import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CadastroForm, EntrarForm, EsqueciForm } from "@/components/forms";
import { getUser } from "@/lib/supabase/server";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Entrar ou criar conta", robots: { index: false } };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string; modo?: string; equipe?: string; conta?: string }>;
}) {
  const { next, erro, modo, equipe, conta } = await searchParams;
  const { manutencao } = await getConfig();
  const soEquipe = manutencao && equipe !== undefined; // em manutenção: só login da equipe, sem cadastro
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/head-hunter";
  const { user } = await getUser();
  if (user) redirect(destino);

  const qs = (m: string) => `/entrar?modo=${m}${soEquipe ? "&equipe" : ""}${next ? `&next=${encodeURIComponent(destino)}` : ""}`;
  const aba = soEquipe ? (modo === "esqueci" ? "esqueci" : "entrar") : modo === "entrar" || modo === "esqueci" ? modo : "cadastro";
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
          {conta === "excluida" ? (
            <div role="status" className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-7">
              <span aria-hidden="true" className="text-4xl">✈︎</span>
              <h1 className="font-display text-[26px] leading-tight font-extrabold">Sua conta foi excluída</h1>
              <p className="text-[16px] leading-relaxed text-ink-2">Seus dados foram apagados e você não vai mais receber avisos no WhatsApp. Obrigado por ter voado com a gente. Se quiser voltar um dia, é só criar uma conta nova.</p>
              <Link href="/" className="font-semibold">Ir para o início</Link>
            </div>
          ) : aba === "esqueci" ? (
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
                  {soEquipe ? "Acesso da equipe" : aba === "cadastro" ? "Crie sua conta grátis" : "Bem-vindo de volta"}
                </h1>
                <p className="text-base leading-relaxed text-ink-2">
                  {aba === "cadastro"
                    ? "Leva menos de um minuto e você já começa o Head Hunter."
                    : "Entre com o e-mail e a senha do seu cadastro."}
                </p>
              </div>
              {!soEquipe && <nav aria-label="Entrar ou criar conta" className="flex gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <Link href={qs("cadastro")} className={tab(aba === "cadastro")} aria-current={aba === "cadastro" ? "page" : undefined}>Criar conta</Link>
                <Link href={qs("entrar")} className={tab(aba === "entrar")} aria-current={aba === "entrar" ? "page" : undefined}>Entrar</Link>
              </nav>}
              {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">O link expirou ou já foi usado. Peça um novo.</p>}
              {aba === "cadastro" ? <CadastroForm next={destino} /> : <EntrarForm next={destino} esqueciHref={qs("esqueci")} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
