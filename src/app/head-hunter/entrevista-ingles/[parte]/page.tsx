import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListaPerguntas } from "@/components/EntrevistaIngles";
import { carregarEntrevista } from "@/lib/entrevista-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Entrevista em inglês · Head Hunter", robots: { index: false } };

export default async function ParteEntrevista({ params }: { params: Promise<{ parte: string }> }) {
  const { parte: slug } = await params;
  const { supabase, liberado } = await exigirCrewSelect(`/head-hunter/entrevista-ingles/${slug}`);
  if (!liberado) redirect("/head-hunter");
  const { partes: PARTES } = await carregarEntrevista(supabase);
  const parte = PARTES.find((p) => p.slug === slug);
  if (!parte) notFound();
  const anterior = PARTES[parte.numero - 2];
  const proxima = PARTES[parte.numero];

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src={parte.foto} alt="" fill priority sizes="100vw" className="object-cover object-[center_20%] opacity-30" />
        <div className="relative mx-auto flex max-w-[860px] flex-col gap-3 px-6 pt-8 pb-12">
          <Link href="/head-hunter/entrevista-ingles" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Entrevista em inglês</Link>
          <span className="font-display text-sm font-bold tracking-[.1em] text-[#ffb3c4] uppercase">Parte {parte.numero} de {PARTES.length}</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">{parte.titulo}</h1>
          <p lang="en" className="font-semibold text-[#d7dbe6]">{parte.tituloEn}</p>
          <p className="max-w-[640px] text-[16px] leading-relaxed text-[#e3e6ee]">{parte.resumo}</p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 pt-8 md:px-6">
        <ListaPerguntas parte={parte} />
        <nav aria-label="Outras partes" className="flex flex-wrap justify-between gap-3">
          {anterior ? <Link href={`/head-hunter/entrevista-ingles/${anterior.slug}`} className="inline-flex min-h-12 items-center rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">← Parte {anterior.numero}: {anterior.titulo}</Link> : <span />}
          {proxima && <Link href={`/head-hunter/entrevista-ingles/${proxima.slug}`} className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep">Parte {proxima.numero}: {proxima.titulo} →</Link>}
        </nav>
      </div>
    </main>
  );
}
