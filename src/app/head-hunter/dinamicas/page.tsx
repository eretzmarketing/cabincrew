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

export default async function DinamicasPage({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q = "" } = await searchParams;
  const { supabase, liberado } = await exigirCrewSelect("/head-hunter/dinamicas");
  if (!liberado) redirect("/head-hunter");

  const [{ data: cats }, { data: dins }, { data: mod7 }] = await Promise.all([
    supabase.from("dinamicas_categorias").select("id, slug, titulo, descricao").eq("ativo", true).order("ordem"),
    supabase.from("dinamicas").select("id, categoria_id, titulo, objetivo, materiais, como_realizada, como_se_destacar").eq("ativo", true).order("ordem"),
    supabase.from("modulos").select("id").eq("recurso", "dinamicas").maybeSingle(),
  ]);
  const categorias = (cats ?? []) as Categoria[];
  const todas = (dins ?? []) as Dinamica[];
  const atual = categorias.find((c) => c.slug === cat);
  const busca = q.trim().toLowerCase();
  const lista = todas.filter(
    (d) =>
      (!atual || d.categoria_id === atual.id) &&
      (!busca || [d.titulo, d.objetivo, d.como_realizada].some((t) => t?.toLowerCase().includes(busca))),
  );
  const conta = new Map<number, number>();
  todas.forEach((d) => d.categoria_id && conta.set(d.categoria_id, (conta.get(d.categoria_id) ?? 0) + 1));
  const link = (slug?: string) => `/head-hunter/dinamicas${slug ? `?cat=${slug}` : ""}`;
  const chip = (ativo: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold ${
      ativo ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"
    }`;

  return (
    <main className="bg-soft px-6 py-10 pb-20">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
        {mod7 && <Link href={`/head-hunter/modulo/${mod7.id}`} className="text-sm font-semibold text-muted hover:text-navy">← Módulo 07 · Dinâmicas de Grupo</Link>}
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] leading-tight font-extrabold">Biblioteca de dinâmicas</h1>
          <p className="text-[17px] leading-relaxed text-ink-2">
            {todas.length} dinâmicas usadas em seleções, com o objetivo de cada uma, como acontece e como se destacar.
          </p>
        </div>

        <form role="search" className="flex gap-2">
          {atual && <input type="hidden" name="cat" value={atual.slug} />}
          <label htmlFor="busca-din" className="sr-only">Buscar dinâmica</label>
          <input id="busca-din" name="q" defaultValue={q} placeholder="Buscar por nome ou objetivo" className="min-h-12 flex-1 rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px]" />
          <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Buscar</button>
        </form>

        <nav aria-label="Categorias" className="flex gap-2 overflow-x-auto pb-1">
          <Link href={link()} className={chip(!atual)} aria-current={!atual ? "page" : undefined}>Todas <span className="opacity-70">{todas.length}</span></Link>
          {categorias.map((c) => (
            <Link key={c.id} href={link(c.slug)} className={chip(atual?.id === c.id)} aria-current={atual?.id === c.id ? "page" : undefined}>
              {c.titulo} <span className="opacity-70">{conta.get(c.id) ?? 0}</span>
            </Link>
          ))}
        </nav>
        {atual?.descricao && <p className="text-[15px] text-ink-2">{atual.descricao}</p>}

        {lista.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">Nenhuma dinâmica encontrada.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lista.map((d) => (
              <li key={d.id}>
                <details className="group rounded-[20px] border border-line bg-white open:shadow-[0_10px_30px_-18px_rgba(49,57,80,.4)]">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-display text-[17px] font-bold">{d.titulo}</span>
                      {d.objetivo && <span className="text-sm text-muted">{d.objetivo}</span>}
                    </span>
                    <span className="shrink-0 text-xl text-muted transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <div className="flex flex-col gap-4 border-t border-[#eceef3] px-5 py-5 text-[15px] leading-relaxed">
                    {d.materiais && <p><strong className="text-navy">Materiais: </strong>{d.materiais}</p>}
                    {d.como_realizada && (
                      <div className="flex flex-col gap-1"><strong className="text-navy">Como acontece</strong><p className="whitespace-pre-line text-ink-2">{d.como_realizada}</p></div>
                    )}
                    {d.como_se_destacar && (
                      <div className="flex flex-col gap-1 rounded-xl border border-brand-line bg-brand-soft px-4 py-3">
                        <strong className="text-[#b0002a]">Como se destacar</strong>
                        <p className="whitespace-pre-line">{d.como_se_destacar}</p>
                      </div>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
