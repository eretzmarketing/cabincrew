import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Dinâmicas de grupo · Head Hunter", robots: { index: false } };

type Categoria = { id: number; slug: string; titulo: string; descricao: string | null };
type Dinamica = {
  id: string;
  categoria_id: number | null;
  titulo: string;
  objetivo: string | null;
  materiais: string | null;
  como_realizada: string | null;
  como_se_destacar: string | null;
};

/** Ícone de cada categoria (traço, 24x24). Categorias novas usam o ícone padrão. */
const ICONES: Record<string, string> = {
  "quebra-gelo": "M9.9 3.5 11 7.6a2 2 0 0 0 1.4 1.4l4.1 1.1-4.1 1.1a2 2 0 0 0-1.4 1.4L9.9 16.7l-1.1-4.1a2 2 0 0 0-1.4-1.4L3.3 10.1l4.1-1.1a2 2 0 0 0 1.4-1.4zM19 3v4M21 5h-4M5 18v2M6 19H4",
  "trabalho-em-equipe": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  comunicacao: "M9 18h6M10 22h4M15.1 14c.2-1 .7-1.7 1.4-2.5A5.9 5.9 0 0 0 18 7.5a6 6 0 0 0-12 0c0 1.5.6 2.9 1.5 4 .7.8 1.2 1.5 1.4 2.5",
  "resolucao-de-problemas": "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  inovacao: "M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5",
  autoconhecimento: "M19 14c1.5-1.4 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 7z",
  lideranca: "M11.6 3.3a.5.5 0 0 1 .9 0l2.9 5.6a1 1 0 0 0 1.5.3l4.3-3.7a.5.5 0 0 1 .8.5l-2.8 10.3a1 1 0 0 1-1 .7H5.8a1 1 0 0 1-1-.7L2 6a.5.5 0 0 1 .8-.5l4.3 3.7a1 1 0 0 0 1.5-.3zM5 21h14",
  energizadores: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  encerramento: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  planejamento: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9zM12 11h4M12 16h4M8 11h.01M8 16h.01",
};
const PADRAO = "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9";

function Icone({ slug, className = "h-7 w-7" }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICONES[slug] ?? PADRAO} />
    </svg>
  );
}

const Seta = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1"><path d="m9 18 6-6-6-6" /></svg>
);

/** Card de uma dinâmica: abre para mostrar materiais, como acontece e como se destacar. */
function CardDinamica({ d, categoria }: { d: Dinamica; categoria?: Categoria }) {
  return (
    <li>
      <details className="group h-full rounded-[20px] border border-line bg-white transition open:border-brand-line open:shadow-[0_18px_40px_-24px_rgba(209,0,48,.45)] hover:border-[#cfd4df]">
        <summary className="flex min-h-[88px] cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            {categoria && (
              <span className="flex items-center gap-1.5 text-[12px] font-bold tracking-[.06em] text-brand-strong uppercase">
                <Icone slug={categoria.slug} className="h-3.5 w-3.5" />{categoria.titulo}
              </span>
            )}
            <span className="font-display text-[18px] leading-snug font-bold text-navy">{d.titulo}</span>
            {d.objetivo && <span className="text-[15px] leading-relaxed text-ink-2">{d.objetivo}</span>}
          </span>
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-xl text-navy transition group-open:rotate-45 group-open:bg-brand-strong group-open:text-white" aria-hidden="true">+</span>
        </summary>
        <div className="flex flex-col gap-4 border-t border-[#eceef3] px-5 pt-4 pb-5 text-[15px] leading-relaxed">
          {d.materiais && (
            <div className="flex gap-3">
              <span className="mt-0.5 text-lg" aria-hidden="true">🧰</span>
              <p><strong className="text-navy">Materiais: </strong>{d.materiais}</p>
            </div>
          )}
          {d.como_realizada && (
            <div className="flex gap-3">
              <span className="mt-0.5 text-lg" aria-hidden="true">🎯</span>
              <div className="flex flex-col gap-0.5"><strong className="text-navy">Como acontece</strong><p className="whitespace-pre-line text-ink-2">{d.como_realizada}</p></div>
            </div>
          )}
          {d.como_se_destacar && (
            <div className="flex gap-3 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3.5">
              <span className="mt-0.5 text-lg" aria-hidden="true">⭐</span>
              <div className="flex flex-col gap-0.5"><strong className="text-[#b0002a]">Como se destacar</strong><p className="whitespace-pre-line text-navy">{d.como_se_destacar}</p></div>
            </div>
          )}
        </div>
      </details>
    </li>
  );
}

export default async function DinamicasPage({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q = "" } = await searchParams;
  const { supabase, liberado } = await exigirCrewSelect("/head-hunter/dinamicas");
  if (!liberado) redirect("/head-hunter");

  const [{ data: cats }, { data: dins }, { data: mod }] = await Promise.all([
    supabase.from("dinamicas_categorias").select("id, slug, titulo, descricao").eq("ativo", true).order("ordem"),
    supabase.from("dinamicas").select("id, categoria_id, titulo, objetivo, materiais, como_realizada, como_se_destacar").eq("ativo", true).order("ordem"),
    supabase.from("modulos").select("id, titulo").eq("recurso", "dinamicas").eq("curso", "head-hunter").limit(1).maybeSingle(),
  ]);
  const categorias = (cats ?? []) as Categoria[];
  // dinâmicas de categoria oculta também ficam escondidas
  const todas = ((dins ?? []) as Dinamica[]).filter((d) => categorias.some((c) => c.id === d.categoria_id));
  const atual = categorias.find((c) => c.slug === cat);
  const busca = q.trim().toLowerCase();
  const conta = new Map<number, number>();
  todas.forEach((d) => d.categoria_id && conta.set(d.categoria_id, (conta.get(d.categoria_id) ?? 0) + 1));
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const lista = todas.filter(
    (d) => (!atual || d.categoria_id === atual.id) && (!busca || [d.titulo, d.objetivo, d.como_realizada, d.como_se_destacar].some((t) => t?.toLowerCase().includes(busca))),
  );
  const visaoCategorias = !atual && !busca;

  return (
    <main className="bg-soft pb-20">
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_90%_at_95%_0%,rgba(239,0,54,.3),transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col gap-4 px-6 pt-8 pb-10">
          {mod && <Link href={`/head-hunter/modulo/${mod.id}`} className="self-start text-sm font-semibold text-[#d7dbe6] hover:text-white">← {mod.titulo}</Link>}
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Dinâmicas de grupo</h1>
          <p className="max-w-[720px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Conheça as dinâmicas usadas nas seleções antes de entrar na sala: o objetivo de cada uma, como acontece e, principalmente, <strong className="text-white">como se destacar</strong> diante do avaliador.
          </p>
          <form role="search" action="/head-hunter/dinamicas" className="mt-2 flex max-w-[640px] gap-2">
            {atual && <input type="hidden" name="cat" value={atual.slug} />}
            <label htmlFor="busca-din" className="sr-only">Buscar dinâmica</label>
            <input id="busca-din" name="q" defaultValue={q} placeholder={atual ? `Buscar em ${atual.titulo}` : "Buscar dinâmica pelo nome ou objetivo"}
              className="min-h-12 min-w-0 flex-1 rounded-full border-0 bg-white px-5 text-[16px] text-navy placeholder:text-[#8a90a2]" />
            <button className="min-h-12 shrink-0 cursor-pointer rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">Buscar</button>
          </form>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pt-8 md:px-6">
        {visaoCategorias ? (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categorias.filter((c) => conta.get(c.id)).map((c) => (
                <li key={c.id}>
                  <Link href={`/head-hunter/dinamicas?cat=${c.slug}`}
                    className="group flex h-full flex-col items-center gap-3 rounded-[22px] border border-line bg-white px-5 pt-7 pb-5 text-center transition hover:-translate-y-0.5 hover:border-brand-line hover:shadow-[0_18px_40px_-24px_rgba(209,0,48,.5)]">
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                      <Icone slug={c.slug} />
                      <span className="absolute -top-2.5 -right-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-strong px-2 text-[13px] font-bold text-white ring-4 ring-white" aria-label={`${conta.get(c.id)} dinâmicas`}>{conta.get(c.id)}</span>
                    </span>
                    <strong className="font-display text-[18px] leading-snug text-navy group-hover:text-brand-strong">{c.titulo}</strong>
                    {c.descricao && <span className="text-[15px] leading-relaxed text-ink-2">{c.descricao}</span>}
                    <span className="mt-auto flex w-full items-center justify-center gap-1 border-t border-[#eceef3] pt-4 font-semibold text-brand-strong">Ver atividades <Seta /></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="grid gap-4 rounded-[22px] border border-line bg-white p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
              <span className="text-4xl" aria-hidden="true">👀</span>
              <div className="flex flex-col gap-2">
                <strong className="font-display text-[19px] text-navy">O que o avaliador observa em qualquer dinâmica</strong>
                <ul className="grid gap-x-8 gap-y-1.5 text-[15px] text-ink-2 sm:grid-cols-2">
                  <li>✓ Escuta: deixa o outro falar e aproveita as ideias</li>
                  <li>✓ Comunicação clara, calma e educada</li>
                  <li>✓ Liderança sem dominar o grupo</li>
                  <li>✓ Foco no cliente e na segurança</li>
                  <li>✓ Postura, sorriso e respeito ao tempo</li>
                  <li>✓ Saber perder, ceder e chegar a consenso</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <Link href="/head-hunter/dinamicas" className="self-start text-sm font-semibold text-navy hover:text-brand-strong">← Todas as categorias</Link>
              {atual && (
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong"><Icone slug={atual.slug} /></span>
                  <div className="flex flex-col">
                    <h2 className="font-display text-[26px] leading-tight font-extrabold">{atual.titulo}</h2>
                    {atual.descricao && <p className="text-[15px] text-ink-2">{atual.descricao}</p>}
                  </div>
                </div>
              )}
              {busca && <p className="text-[15px] text-ink-2">{lista.length ? `Resultados para “${q.trim()}”` : `Nenhuma dinâmica encontrada para “${q.trim()}”.`}</p>}
              {atual && (
                <nav aria-label="Outras categorias" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                  {categorias.filter((c) => conta.get(c.id)).map((c) => (
                    <Link key={c.id} href={`/head-hunter/dinamicas?cat=${c.slug}`} aria-current={c.id === atual.id ? "page" : undefined}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[14px] font-semibold ${c.id === atual.id ? "border-brand-strong bg-brand-strong text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
                      <Icone slug={c.slug} className="h-4 w-4" />{c.titulo}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            {lista.length > 0 ? (
              <ul className="grid items-start gap-4 md:grid-cols-2">
                {lista.map((d) => <CardDinamica key={d.id} d={d} categoria={atual ? undefined : porId.get(d.categoria_id ?? -1)} />)}
              </ul>
            ) : !busca && (
              <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">Nenhuma dinâmica nesta categoria.</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
