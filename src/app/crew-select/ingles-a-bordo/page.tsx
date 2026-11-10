import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MODULOS_INGLES, TODAS_AULAS, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberada, carregarIngles } from "@/lib/ingles-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Inglês a bordo · Crew Select", robots: { index: false } };

export default async function InglesABordoPage() {
  const { supabase, user, profile, liberado } = await exigirCrewSelect("/crew-select/ingles-a-bordo");
  if (!liberado) redirect("/crew-select");
  const { progresso, comProgresso } = await carregarIngles(supabase, user.id);
  const livre = profile.is_admin || !comProgresso;

  const feitas = TODAS_AULAS.filter((a) => progresso[chaveAula(a)]?.concluida).length;
  const total = TODAS_AULAS.length;
  const pct = total ? Math.round((feitas / total) * 100) : 0;
  const proxima = TODAS_AULAS.find((a) => !progresso[chaveAula(a)]?.concluida);

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src="/img/ingles/cena-01.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="relative mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-8 px-6 pt-8 pb-14">
          <div className="flex max-w-[640px] flex-col gap-4">
            <Link href="/crew-select" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Crew Select</Link>
            <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Curso de inglês operacional</span>
            <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[48px]">Inglês <span className="text-[#ff5a7a]">a bordo</span></h1>
            <p className="text-[17px] leading-relaxed text-[#e3e6ee]">
              O inglês que o comissário usa de verdade, do briefing ao desembarque. Ouça diálogos, pratique a fala, escreva e
              teste o que aprendeu em cada aula.
            </p>
          </div>
          <div className="flex w-full max-w-[320px] flex-col gap-3 rounded-[20px] bg-white/10 p-6 backdrop-blur">
            <div className="flex items-end justify-between">
              <span className="text-sm text-[#d7dbe6]">Seu progresso</span>
              <span className="font-display text-3xl font-extrabold">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20" aria-hidden="true"><div className="h-2.5 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
            <span className="text-sm text-[#d7dbe6]">{feitas} de {total} aulas concluídas</span>
            {proxima && (
              <Link href={`/crew-select/ingles-a-bordo/${proxima.modulo}/${proxima.numero}`} className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">
                {feitas ? "Continuar" : "Começar a primeira aula"} →
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pt-10 md:px-6">
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["🎧", "Ouça", "Diálogos de situações reais a bordo."],
            ["🎤", "Fale", "O site ouve você e mostra o que precisa melhorar."],
            ["✍️", "Escreva", "Ditado, lacunas e frases para montar."],
            ["✅", "Avance", `Quiz no fim de cada aula libera a próxima.`],
          ].map(([i, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
              <span aria-hidden="true" className="text-2xl">{i}</span>
              <span className="flex flex-col gap-0.5"><strong className="font-display">{t}</strong><span className="text-[14px] text-ink-2">{d}</span></span>
            </div>
          ))}
        </section>

        <section aria-labelledby="mods" className="flex flex-col gap-5">
          <h2 id="mods" className="font-display text-2xl font-extrabold">Os {MODULOS_INGLES.length} módulos do voo</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS_INGLES.map((m) => {
              const n = m.aulas.length;
              const f = m.aulas.filter((a) => progresso[chaveAula(a)]?.concluida).length;
              const aberto = n > 0 && aulaLiberada(chaveAula(m.aulas[0]), progresso, livre);
              const conteudo = (
                <>
                  <span className="relative block aspect-[16/9] overflow-hidden">
                    <Image src={m.foto} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px" className={`object-cover transition duration-300 ${n ? "group-hover:scale-[1.03]" : "grayscale-[60%]"}`} />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-display text-xs font-bold text-navy">Módulo {m.numero}</span>
                    {n === 0 && <span className="absolute top-3 right-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">Em breve</span>}
                    {n > 0 && !aberto && <span className="absolute top-3 right-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">🔒 Bloqueado</span>}
                  </span>
                  <span className="flex flex-1 flex-col gap-1.5 p-5">
                    <strong className="font-display text-lg leading-tight">{m.titulo}</strong>
                    <span lang="en" className="text-[13px] font-semibold text-muted">{m.tituloEn}</span>
                    <span className="text-[14px] leading-relaxed text-ink-2">{m.resumo}</span>
                    {n > 0 && (
                      <span className="mt-auto flex flex-col gap-1.5 pt-3">
                        <span className="h-1.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-brand" style={{ width: `${Math.round((f / n) * 100)}%` }} /></span>
                        <span className="text-[13px] text-muted">{f} de {n} aulas</span>
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <li key={m.numero}>
                  {n > 0 ? (
                    <Link href={`/crew-select/ingles-a-bordo/${m.numero}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">{conteudo}</Link>
                  ) : (
                    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy opacity-80">{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
