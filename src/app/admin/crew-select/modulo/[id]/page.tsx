import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirModulo } from "@/app/crew-actions";
import { Card, Titulo, btnPrimario } from "@/components/admin-ui";
import { ModuloForm } from "@/components/admin-forms";
import { TIPO_AULA, duracao, numeroModulo, type Aula, type Modulo } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Módulo" };

export default async function AdminModulo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { supabase } = await getUser();
  const [{ data: modulo }, { data: aulas }] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("aulas").select("*").eq("modulo_id", Number(id)).order("ordem"),
  ]);
  const m = modulo as Modulo | null;
  if (!m) notFound();
  const lista = (aulas ?? []) as Aula[];
  const proxima = lista.length ? Math.max(...lista.map((a) => a.ordem)) + 1 : 1;

  return (
    <>
      <Link href="/admin/crew-select" className="text-sm font-semibold text-muted hover:text-navy">← Todos os módulos</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={m.fase ?? undefined}>
          <span className="mr-2 text-brand">{numeroModulo(m.ordem)}</span>{m.titulo}
        </Titulo>
        <Link href={`/admin/crew-select/aula/nova?modulo=${m.id}&ordem=${proxima}`} className={btnPrimario}>+ Nova aula neste módulo</Link>
      </div>

      <Card>
        <h2 className="font-display text-xl font-bold">Aulas ({lista.length})</h2>
        {lista.length === 0 ? (
          <p className="text-ink-2">Nenhuma aula ainda. Os alunos veem este módulo como “Em breve”.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-[#eceef3]">
            {lista.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/crew-select/aula/${a.id}`} className="flex min-w-0 flex-col font-semibold text-navy hover:text-brand-strong">
                  <span>{a.ordem}. {a.titulo}</span>
                  <span className="text-[13px] font-normal text-muted">{TIPO_AULA[a.tipo]}{a.duracao_min ? ` · ${duracao(a.duracao_min)}` : ""}</span>
                </Link>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.publicado ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff3e0] text-[#8a4b00]"}`}>
                  {a.publicado ? "Publicada" : "Rascunho"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold">Dados do módulo</h2>
        <ModuloForm m={m} />
      </Card>

      <details className="rounded-[20px] border border-line bg-white p-6">
        <summary className="cursor-pointer font-semibold text-brand-deep">Excluir módulo</summary>
        <form action={excluirModulo} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={m.id} />
          <span className="text-[15px] text-ink-2">Isso apaga o módulo, as {lista.length} aulas dele e o progresso dos alunos nessas aulas.</span>
          <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
        </form>
      </details>
    </>
  );
}
