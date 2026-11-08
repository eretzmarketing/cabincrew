import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressoParte } from "@/components/EntrevistaIngles";
import { chavePergunta } from "@/lib/entrevista-ingles";
import { carregarEntrevista } from "@/lib/entrevista-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Entrevista em inglês · Crew Select", robots: { index: false } };

export default async function EntrevistaInglesPage() {
  const { supabase, liberado } = await exigirCrewSelect("/crew-select/entrevista-ingles");
  if (!liberado) redirect("/crew-select");
  const { partes: PARTES } = await carregarEntrevista(supabase);
  const TOTAL_PERGUNTAS = PARTES.reduce((s, p) => s + p.perguntas.length, 0);

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src="/img/entrevista/entrevista.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col gap-4 px-6 pt-8 pb-14">
          <Link href="/crew-select" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Crew Select</Link>
          <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Módulo 08 · Entrevistas</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[48px]">Entrevista em <span className="text-[#ff5a7a]">inglês</span></h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            A entrevista em inglês costuma acontecer logo no começo da seleção, e falar não basta: é preciso falar bem.
            Aqui você treina {TOTAL_PERGUNTAS} perguntas reais, em {PARTES.length} partes, com áudio, tradução e respostas-modelo revisadas.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/crew-select/entrevista-ingles/treino" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">🎙 Simular uma entrevista</Link>
            <a href="#partes" className="inline-flex min-h-12 items-center rounded-full border-2 border-white/60 px-6 font-semibold text-white hover:bg-white/10">Estudar por partes</a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pt-10 md:px-6">
        <section className="grid gap-3 md:grid-cols-3">
          {[
            ["🔊", "Ouça cada pergunta", "Pronúncia em inglês americano, na velocidade de uma entrevista."],
            ["📝", "Compare com o modelo", "Respostas-modelo corretas. Os trechos em amarelo são para você trocar pelos seus dados."],
            ["🎙", "Simule a entrevista", "Perguntas sorteadas, cronômetro e gravação da sua resposta para você se ouvir."],
          ].map(([i, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-line bg-white p-5">
              <span aria-hidden="true" className="text-2xl">{i}</span>
              <span className="flex flex-col gap-1"><strong className="font-display">{t}</strong><span className="text-[14px] text-ink-2">{d}</span></span>
            </div>
          ))}
        </section>

        <section aria-labelledby="como-e" className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6 md:p-8">
          <h2 id="como-e" className="font-display text-2xl font-extrabold">Como é a entrevista em inglês</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              ["Ela avalia sua fluência", "Muitas companhias fazem a entrevista em inglês logo no começo da seleção. Entre dezenas de candidatos com a mesma formação, um bom inglês pode ser o seu diferencial."],
              ["Primeiro, o quebra-gelo", "O entrevistador começa com perguntas pessoais para conhecer você. Quanto mais você falar, melhor: conte experiências, viagens, livros que leu, e mostre que é uma pessoa sociável e educada."],
              ["Depois, carreira e mundo", "Em seguida vêm vida profissional, idiomas e viagens. O entrevistador quer ver o quanto você já está perto do estilo de vida de um tripulante."],
              ["Por fim, temperamento e situações", "Perguntas sobre personalidade e casos a bordo. Seja sincero(a) e lembre sempre das prioridades da profissão: segurança, conforto e bem-estar dos passageiros e da tripulação."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white">{i + 1}</span>
                <span className="flex flex-col gap-1"><strong className="font-display">{t}</strong><span className="text-[15px] leading-relaxed text-ink-2">{d}</span></span>
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">
            <strong>Dica de ouro:</strong> seu vocabulário em inglês deve ser tão cuidadoso quanto o seu português. Frases completas, educadas e sem gírias.
          </p>
        </section>

        <section id="partes"aria-labelledby="titulo-partes" className="flex scroll-mt-6 flex-col gap-5">
          <h2 id="titulo-partes" className="font-display text-2xl font-extrabold">As {PARTES.length} partes da entrevista</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTES.map((p) => (
              <li key={p.slug}>
                <Link href={`/crew-select/entrevista-ingles/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <Image src={p.foto} alt={p.fotoAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-display text-xs font-bold">Parte {p.numero}</span>
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-5">
                    <strong className="font-display text-lg leading-tight">{p.titulo}</strong>
                    <span lang="en" className="text-[13px] font-semibold text-muted">{p.tituloEn}</span>
                    <span className="text-[14px] leading-relaxed text-ink-2">{p.resumo}</span>
                    <span className="mt-auto pt-2"><ProgressoParte ids={p.perguntas.map((_, i) => chavePergunta(p, i))} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
