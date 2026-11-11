import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MODULOS_INGLES, NOTA_MINIMA, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberada, carregarIngles } from "@/lib/ingles-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Inglês a bordo · Head Hunter", robots: { index: false } };

export default async function ModuloInglesPage({ params }: { params: Promise<{ modulo: string }> }) {
  const { modulo } = await params;
  const m = MODULOS_INGLES.find((x) => String(x.numero) === modulo);
  if (!m || !m.aulas.length) notFound();
  const { supabase, user, profile, liberado } = await exigirCrewSelect(`/head-hunter/ingles-a-bordo/${modulo}`);
  if (!liberado) redirect("/head-hunter");
  const { progresso, comProgresso } = await carregarIngles(supabase, user.id);
  const livre = profile.is_admin || !comProgresso;

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src={m.foto} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="relative mx-auto flex max-w-[900px] flex-col gap-3 px-6 pt-8 pb-12">
          <Link href="/head-hunter/ingles-a-bordo" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Inglês a bordo</Link>
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#ffb3c4] uppercase">Módulo {m.numero}</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">{m.titulo}</h1>
          <p lang="en" className="text-[17px] font-semibold text-[#d7dbe6]">{m.tituloEn}</p>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#e3e6ee]">{m.resumo}</p>
        </div>
      </section>

      <ol className="mx-auto flex max-w-[900px] flex-col gap-3 px-4 pt-8 md:px-6">
        {m.aulas.map((a) => {
          const k = chaveAula(a);
          const p = progresso[k];
          const aberta = aulaLiberada(k, progresso, livre);
          const corpo = (
            <>
              <span className="relative hidden h-[84px] w-[130px] shrink-0 overflow-hidden rounded-xl sm:block">
                <Image src={a.foto} alt="" fill sizes="130px" className={`object-cover ${aberta ? "" : "grayscale"}`} />
              </span>
              <span aria-hidden="true" className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display font-bold sm:hidden ${p?.concluida ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft"}`}>
                {p?.concluida ? "✓" : aberta ? a.numero : "🔒"}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-muted">Aula {k} · {a.minutos} min</span>
                <strong className="font-display text-[18px] leading-snug">{a.titulo}</strong>
                <span lang="en" className="text-[14px] text-ink-2">{a.tituloEn}</span>
              </span>
              <span className="shrink-0 text-right text-[13px] font-semibold">
                {p?.concluida ? <span className="rounded-full bg-[#e5f6ec] px-3 py-1 text-[#0f6b3a]">✓ {p.nota}%</span>
                  : p ? <span className="rounded-full bg-brand-soft px-3 py-1 text-brand-deep">{p.nota}% · precisa {NOTA_MINIMA}%</span>
                  : aberta ? <span className="text-brand-strong">Começar →</span>
                  : <span className="text-muted">🔒 Conclua a anterior</span>}
              </span>
            </>
          );
          return (
            <li key={k}>
              {aberta ? (
                <Link href={`/head-hunter/ingles-a-bordo/${m.numero}/${a.numero}`} className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-3 pr-5 text-navy hover:border-navy">{corpo}</Link>
              ) : (
                <div aria-disabled="true" className="flex items-center gap-4 rounded-[20px] border border-line bg-white/60 p-3 pr-5 text-navy">{corpo}</div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
