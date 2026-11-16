import type { Metadata } from "next";
import Link from "next/link";
import { acaoCategoriaDinamica, acaoDinamica } from "@/app/dinamicas-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { CategoriaForm, DinamicaForm, type DinamicaAdmin } from "@/components/DinamicasAdminForms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dinâmicas" };
export const dynamic = "force-dynamic";

type Cat = { id: number; slug: string; titulo: string; descricao: string | null; ordem: number; ativo: boolean };
const mini = "min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-semibold";

export default async function AdminDinamicas({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase } = await getUser();
  const [{ data: cats }, { data: dins }] = await Promise.all([
    supabase.from("dinamicas_categorias").select("id, slug, titulo, descricao, ordem, ativo").order("ordem"),
    supabase.from("dinamicas").select("id, categoria_id, titulo, objetivo, materiais, como_realizada, como_se_destacar, ordem, ativo").order("ordem").order("titulo"),
  ]);
  const categorias = (cats ?? []) as Cat[];
  const todas = (dins ?? []) as DinamicaAdmin[];
  const busca = q.trim().toLowerCase();
  const filtradas = busca ? todas.filter((d) => [d.titulo, d.objetivo].some((t) => t?.toLowerCase().includes(busca))) : todas;
  const semCategoria = filtradas.filter((d) => !categorias.some((c) => c.id === d.categoria_id));
  const grupos: { c: Cat | null; lista: DinamicaAdmin[] }[] = [
    ...categorias.map((c) => ({ c, lista: filtradas.filter((d) => d.categoria_id === c.id) })),
    ...(semCategoria.length ? [{ c: null, lista: semCategoria }] : []),
  ];

  return (
    <>
      <Link href="/admin/cursos/head-hunter" className="text-sm font-semibold text-muted hover:text-navy">← Head Hunter</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${todas.filter((d) => d.ativo).length} de ${todas.length} visíveis para os alunos na biblioteca de dinâmicas. Clique numa dinâmica para editar.`}>Dinâmicas de grupo</Titulo>
        <Link href="/head-hunter/dinamicas" target="_blank" className="text-sm font-semibold">Ver como aluno ↗</Link>
      </div>

      <Card>
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg font-extrabold">＋ Adicionar dinâmica</summary>
          <div className="pt-4">{categorias.length ? <DinamicaForm categorias={categorias} /> : <p className="text-ink-2">Crie uma categoria primeiro (logo abaixo).</p>}</div>
        </details>
      </Card>

      <Card>
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg font-extrabold">🗂 Categorias ({categorias.length})</summary>
          <div className="flex flex-col gap-4 pt-4">
            {categorias.map((c) => {
              const n = todas.filter((d) => d.categoria_id === c.id).length;
              return (
                <details key={c.id} className={`rounded-xl border px-4 ${c.ativo ? "border-line" : "border-dashed border-line opacity-70"}`}>
                  <summary className="flex min-h-12 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <strong>{c.titulo}</strong><span className="text-[13px] text-muted">{n} dinâmica(s)</span>
                    {!c.ativo && <span className="rounded-full bg-[#eceef3] px-2 py-0.5 text-[12px] font-semibold text-ink-2">Oculta</span>}
                    <form action={acaoCategoriaDinamica} className="ml-auto flex gap-1">
                      <input type="hidden" name="id" value={c.id} />
                      <button name="acao" value={c.ativo ? "ocultar" : "mostrar"} className={`${mini} border-2 border-line text-navy hover:border-navy`}>{c.ativo ? "Ocultar" : "Mostrar"}</button>
                      {n === 0 && <button name="acao" value="excluir" className={`${mini} text-muted hover:bg-soft hover:text-brand-deep`}>Excluir</button>}
                    </form>
                  </summary>
                  <div className="border-t border-line py-4"><CategoriaForm c={c} /></div>
                </details>
              );
            })}
            <div className="rounded-xl bg-soft p-4">
              <strong className="mb-2 block text-[15px]">Nova categoria</strong>
              <CategoriaForm />
            </div>
            <p className="text-[13px] text-muted">Uma categoria só pode ser excluída quando estiver vazia. Categoria oculta esconde todas as dinâmicas dela para os alunos.</p>
          </div>
        </details>
      </Card>

      <form role="search" className="flex gap-2">
        <label htmlFor="busca-adm-din" className="sr-only">Buscar dinâmica</label>
        <input id="busca-adm-din" name="q" defaultValue={q} placeholder="Buscar dinâmica pelo nome ou objetivo" className="min-h-11 min-w-0 flex-1 rounded-full border border-[#c9cedb] bg-white px-4 text-[15px]" />
        <button className="min-h-11 shrink-0 cursor-pointer rounded-full bg-navy px-5 text-sm font-semibold text-white">Buscar</button>
        {busca && <Link href="/admin/head-hunter/dinamicas" className="flex min-h-11 items-center px-2 text-sm font-semibold text-muted">Limpar</Link>}
      </form>

      {grupos.map(({ c, lista }) => {
        if (!lista.length && (busca || !c)) return null;
        return (
          <section key={c?.id ?? "sem"} className="flex flex-col gap-2">
            <h2 className="font-display text-lg font-bold">
              {c?.titulo ?? "Sem categoria"} <span className="text-sm font-normal text-muted">({lista.length})</span>
              {c && !c.ativo && <span className="ml-2 rounded-full bg-[#eceef3] px-2 py-0.5 text-[12px] font-semibold text-ink-2">categoria oculta</span>}
            </h2>
            {!lista.length && <p className="rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-[14px] text-muted">Nenhuma dinâmica nesta categoria.</p>}
            <ul className="flex flex-col gap-2">
              {lista.map((d) => (
                <li key={d.id}>
                  <details className={`rounded-2xl border bg-white px-4 ${d.ativo ? "border-line" : "border-dashed border-line"}`}>
                    <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`font-semibold ${d.ativo ? "" : "text-muted"}`}>{d.titulo}{!d.ativo && <span className="ml-2 rounded-full bg-[#eceef3] px-2 py-0.5 text-[12px] font-semibold text-ink-2">Oculta</span>}</span>
                        {d.objetivo && <span className="truncate text-[13px] text-muted">{d.objetivo}</span>}
                      </span>
                      <form action={acaoDinamica}>
                        <input type="hidden" name="id" value={d.id} />
                        <button name="acao" value={d.ativo ? "ocultar" : "mostrar"} className={`${mini} border-2 border-line text-navy hover:border-navy`}>{d.ativo ? "Ocultar" : "Mostrar"}</button>
                      </form>
                    </summary>
                    <div className="flex flex-col gap-5 border-t border-line py-4">
                      <DinamicaForm d={d} categorias={categorias} />
                      <form action={acaoDinamica} className="flex flex-wrap items-center gap-3 rounded-xl bg-soft px-4 py-3 text-[14px]">
                        <input type="hidden" name="id" value={d.id} />
                        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" name="confirmo" required className="h-4 w-4 accent-brand-strong" />Quero excluir esta dinâmica de vez</label>
                        <button name="acao" value="excluir" className={`${mini} bg-white text-brand-deep ring-1 ring-brand-line hover:bg-brand-soft`}>Excluir</button>
                        <span className="text-muted">Prefere só tirar do ar? Use “Ocultar”.</span>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
