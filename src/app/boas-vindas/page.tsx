import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Check } from "@/components/icons";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Boas-vindas", robots: { index: false } };

/** Primeira tela depois do cadastro: mostra o que já é grátis, sem empurrar a compra. */
export default async function BoasVindas({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const { profile } = await exigirLogin("/boas-vindas");
  const nome = (profile.nome ?? profile.apelido ?? "").split(" ")[0];
  const continuar = next && next.startsWith("/") && !next.startsWith("//") && next !== "/boas-vindas" ? next : null;

  return (
    <main className="bg-soft pb-16">
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_90%_at_90%_0%,rgba(239,0,54,.32),transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[860px] flex-col items-center gap-4 px-6 pt-14 pb-24 text-center">
          <span className="text-5xl" aria-hidden="true">✈️</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[44px]">Boas-vindas à Cabin Crew{nome ? `, ${nome}` : ""}!</h1>
          <p className="max-w-[600px] text-[18px] leading-relaxed text-[#d7dbe6]">Sua conta está pronta. E você já pode começar a treinar agora mesmo, de graça.</p>
        </div>
      </section>

      <div className="mx-auto -mt-14 flex max-w-[860px] flex-col gap-6 px-4 md:px-6">
        <section className="relative flex flex-col gap-5 rounded-[28px] border-2 border-brand-line bg-white p-6 shadow-[0_30px_60px_-35px_rgba(35,42,61,.6)] md:p-9">
          <span className="self-start rounded-full bg-[#e5f6ec] px-3.5 py-1.5 text-[14px] font-bold text-[#0f6b3a]">🎁 Liberado na sua conta · Grátis</span>
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[26px] leading-tight font-extrabold md:text-[32px]">Simulados da banca ANAC</h2>
            <p className="text-[17px] leading-relaxed text-ink-2">Treine para a prova teórica de comissário(a) como se fosse o dia da prova. Sem pagar nada e quantas vezes quiser.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Segurança e Emergência, Legislação, Primeiros Socorros e Conhecimentos Técnicos",
              "Prova completa com cronômetro, como no dia da prova",
              "Gabarito imediato ou no final: você escolhe",
              "Gabarito comentado e desempenho por bloco",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-[16px] leading-snug">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5f6ec] text-[#0f6b3a]"><Check size={15} /></span>{t}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link href="/simulados-anac" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand-strong px-8 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Fazer meu primeiro simulado <Arrow /></Link>
            {continuar && <Link href={continuar} className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-navy px-7 font-display font-bold text-navy hover:bg-navy hover:text-white">Continuar de onde parei</Link>}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 md:p-8">
          <h2 className="font-display text-[20px] font-extrabold">Por onde começar</h2>
          <ol className="flex flex-col gap-4">
            {[
              ["Faça um simulado por bloco", "São 20 questões em 30 minutos. Você descobre o seu nível em cada tema da prova."],
              ["Revise o que errou", "O gabarito comentado explica cada questão. Depois, refaça o bloco e veja a evolução."],
              ["Quando quiser ir além", "A seleção das companhias tem outras etapas: testes online, dinâmica, vídeo e entrevista. Quando for a hora, conheça o Head Hunter."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display font-extrabold text-white">{i + 1}</span>
                <div className="flex flex-col gap-0.5"><strong className="font-display text-[17px]">{t}</strong><p className="text-[15px] leading-relaxed text-ink-2">{d}</p></div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eceef3] pt-4 text-[15px] font-semibold">
            <Link href="/cursos" className="text-navy underline">Conhecer os cursos</Link>
            <Link href="/conta" className="text-navy underline">Minha conta</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
