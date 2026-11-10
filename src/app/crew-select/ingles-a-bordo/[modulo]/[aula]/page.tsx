import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import InglesAula from "@/components/InglesAula";
import { TODAS_AULAS, acharAula, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberada, carregarIngles } from "@/lib/ingles-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; aula: string }> }): Promise<Metadata> {
  const { modulo, aula } = await params;
  const r = acharAula(Number(modulo), Number(aula));
  return { title: r ? `${r.aula.titulo} · Inglês a bordo` : "Inglês a bordo", robots: { index: false } };
}

export default async function AulaInglesPage({ params }: { params: Promise<{ modulo: string; aula: string }> }) {
  const { modulo, aula } = await params;
  if (!/^\d+$/.test(modulo) || !/^\d+$/.test(aula)) notFound();
  const r = acharAula(Number(modulo), Number(aula));
  if (!r) notFound();
  const { supabase, user, profile, liberado } = await exigirCrewSelect(`/crew-select/ingles-a-bordo/${modulo}/${aula}`);
  if (!liberado) redirect("/crew-select");
  const { audios, progresso, comProgresso } = await carregarIngles(supabase, user.id);
  const chave = chaveAula(r.aula);
  if (!aulaLiberada(chave, progresso, profile.is_admin || !comProgresso)) redirect(`/crew-select/ingles-a-bordo/${modulo}`);

  const i = TODAS_AULAS.findIndex((a) => chaveAula(a) === chave);
  const prox = TODAS_AULAS[i + 1];
  const a = r.aula;

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src={a.foto} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[900px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href={`/crew-select/ingles-a-bordo/${modulo}`} className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Módulo {r.modulo.numero} · {r.modulo.titulo}</Link>
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#ffb3c4] uppercase">Aula {chave} · {a.minutos} min</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">{a.titulo}</h1>
          <p lang="en" className="text-[18px] font-semibold text-[#d7dbe6]">{a.tituloEn}</p>
          <p className="max-w-[680px] rounded-2xl bg-white/10 px-4 py-3 text-[16px] leading-relaxed"><strong>🎯 Objetivo:</strong> {a.objetivo}</p>
        </div>
      </section>
      <div className="mx-auto flex max-w-[900px] flex-col gap-6 px-4 pt-6 md:px-6">
        <p className="text-[17px] leading-relaxed text-ink-2">{a.intro}</p>
        <InglesAula
          aula={a}
          chave={chave}
          audio={audios[chave]}
          notaAnterior={progresso[chave]?.nota}
          logado={comProgresso}
          proxima={prox ? { href: `/crew-select/ingles-a-bordo/${prox.modulo}/${prox.numero}`, titulo: prox.titulo } : undefined}
        />
      </div>
    </main>
  );
}
