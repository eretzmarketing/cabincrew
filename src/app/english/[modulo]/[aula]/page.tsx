import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CursoPlayer from "@/components/CursoPlayer";
import InglesAula from "@/components/InglesAula";
import { TODAS_AULAS, acharAula, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberada, carregarIngles } from "@/lib/ingles-dados";
import { exigirCurso } from "@/lib/crew-gate";
import { navegacaoIngles } from "@/lib/curso-navegacao";

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; aula: string }> }): Promise<Metadata> {
  const { modulo, aula } = await params;
  const r = acharAula(Number(modulo), Number(aula));
  return { title: r ? `${r.aula.titulo} · Flight Attendant English` : "Flight Attendant English", robots: { index: false } };
}

export default async function AulaInglesPage({ params }: { params: Promise<{ modulo: string; aula: string }> }) {
  const { modulo, aula } = await params;
  if (!/^\d+$/.test(modulo) || !/^\d+$/.test(aula)) notFound();
  const r = acharAula(Number(modulo), Number(aula));
  if (!r) notFound();
  const { supabase, user, profile, liberado } = await exigirCurso("english", `/english/${modulo}/${aula}`);
  if (!liberado) redirect("/english");
  const { audios, progresso, comProgresso } = await carregarIngles(supabase, user.id);
  const chave = chaveAula(r.aula);
  if (!aulaLiberada(chave, progresso, profile.is_admin || !comProgresso)) redirect(`/english/${modulo}`);

  const i = TODAS_AULAS.findIndex((a) => chaveAula(a) === chave);
  const prox = TODAS_AULAS[i + 1];
  const a = r.aula;
  const nav = navegacaoIngles(progresso, profile.is_admin || !comProgresso, { chave });
  const { anterior, proxima } = nav;
  const feita = !!progresso[chave]?.concluida;

  return (
    <CursoPlayer curso="Flight Attendant English" voltar={{ href: "/english", rotulo: "Flight Attendant English" }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total}
      rodape={
        <>
          {anterior ? <Link href={anterior.href} className="inline-flex min-h-12 items-center rounded-full px-3 font-semibold text-navy hover:bg-soft">← <span className="ml-1 hidden sm:inline">Anterior</span></Link> : <span />}
          {feita && proxima && !proxima.bloqueada ? (
            <Link href={proxima.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-display font-bold text-white hover:bg-navy-deep">Próxima aula →</Link>
          ) : feita ? (
            <span className="inline-flex min-h-12 items-center rounded-full border-2 border-[#0f6b3a] bg-[#e5f6ec] px-5 font-semibold text-[#0f6b3a]">✓ Aula concluída</span>
          ) : (
            <a href="#quiz" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Fazer o quiz para concluir ↓</a>
          )}
        </>
      }>
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-[24px] bg-navy text-white">
          <Image src={a.foto} alt="" fill priority sizes="(min-width: 1024px) 880px, 100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" aria-hidden="true" />
          <div className="relative flex flex-col gap-3 px-6 pt-10 pb-8 md:px-9">
            <span className="font-display text-sm font-bold tracking-[.08em] text-[#ffb3c4] uppercase">Módulo {r.modulo.numero} · Aula {chave} · {a.minutos} min</span>
            <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">{a.titulo}</h1>
            <p lang="en" className="text-[18px] font-semibold text-[#d7dbe6]">{a.tituloEn}</p>
            <p className="max-w-[680px] rounded-2xl bg-white/10 px-4 py-3 text-[16px] leading-relaxed"><strong>🎯 Objetivo:</strong> {a.objetivo}</p>
          </div>
        </section>
        <p className="text-[17px] leading-relaxed text-ink-2">{a.intro}</p>
        <InglesAula
          aula={a}
          chave={chave}
          audio={audios[chave]}
          notaAnterior={progresso[chave]?.nota}
          logado={comProgresso}
          proxima={prox ? { href: `/english/${prox.modulo}/${prox.numero}`, titulo: prox.titulo } : undefined}
        />
      </div>
    </CursoPlayer>
  );
}
