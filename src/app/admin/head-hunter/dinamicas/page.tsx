import type { Metadata } from "next";
import Link from "next/link";
import { alternarDinamica } from "@/app/crew-actions";
import { Titulo } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dinâmicas" };

export default async function AdminDinamicas() {
  const { supabase } = await getUser();
  const [{ data: cats }, { data: dins }] = await Promise.all([
    supabase.from("dinamicas_categorias").select("id, titulo").order("ordem"),
    supabase.from("dinamicas").select("id, categoria_id, titulo, objetivo, ativo").order("ordem"),
  ]);
  const categorias = cats ?? [];
  const todas = dins ?? [];

  return (
    <>
      <Link href="/admin/head-hunter" className="text-sm font-semibold text-muted hover:text-navy">← Head Hunter</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${todas.filter((d) => d.ativo).length} de ${todas.length} visíveis para os alunos na biblioteca do módulo 07.`}>Dinâmicas de grupo</Titulo>
        <Link href="/head-hunter/dinamicas" target="_blank" className="text-sm font-semibold">Ver como aluno ↗</Link>
      </div>
      {categorias.map((c) => {
        const lista = todas.filter((d) => d.categoria_id === c.id);
        if (!lista.length) return null;
        return (
          <section key={c.id} className="flex flex-col gap-2">
            <h2 className="font-display text-lg font-bold">{c.titulo} <span className="text-sm font-normal text-muted">({lista.length})</span></h2>
            <ul className="flex flex-col divide-y divide-[#eceef3] rounded-2xl border border-line bg-white">
              {lista.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <span className="flex min-w-0 flex-col">
                    <span className={`font-semibold ${d.ativo ? "" : "text-muted line-through"}`}>{d.titulo}</span>
                    {d.objetivo && <span className="text-[13px] text-muted">{d.objetivo}</span>}
                  </span>
                  <form action={alternarDinamica}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="ativo" value={String(!d.ativo)} />
                    <button className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold text-navy hover:bg-soft">{d.ativo ? "Ocultar" : "Mostrar"}</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!todas.length && <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">Nenhuma dinâmica importada ainda.</p>}
    </>
  );
}
