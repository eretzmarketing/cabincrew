import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { alternarParteEntrevista } from "@/app/crew-actions";
import { Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entrevista em inglês" };

export default async function AdminEntrevista() {
  const { supabase } = await getUser();
  const [pr, qr] = await Promise.all([
    supabase.from("entrevista_partes").select("id, numero, titulo, titulo_en, foto, foto_alt, publicado").order("numero").order("id"),
    supabase.from("entrevista_perguntas").select("parte_id, ativo").limit(10000),
  ]);
  if (pr.error) {
    return (
      <>
        <Titulo>Entrevista em inglês</Titulo>
        <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">Falta rodar o SQL <strong>0020_entrevista_ingles.sql</strong> no Supabase para gerenciar a entrevista por aqui.</p>
      </>
    );
  }
  const partes = pr.data ?? [];
  const conta = new Map<number, { total: number; ativas: number }>();
  for (const q of qr.data ?? []) {
    const c = conta.get(q.parte_id) ?? { total: 0, ativas: 0 };
    c.total += 1;
    if (q.ativo) c.ativas += 1;
    conta.set(q.parte_id, c);
  }
  const ativas = [...conta.values()].reduce((s, c) => s + c.ativas, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${partes.length} partes · ${ativas} perguntas visíveis para os alunos. Edite textos, respostas-modelo, fotos e a ordem.`}>Entrevista em inglês</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href="/crew-select/entrevista-ingles" target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
          <Link href="/admin/entrevista/nova" className={btnPrimario}>+ Nova parte</Link>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {partes.map((p, i) => {
          const c = conta.get(p.id) ?? { total: 0, ativas: 0 };
          return (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-3 pr-4 ${p.publicado ? "" : "opacity-75"}`}>
              <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-soft">
                {p.foto && <Image src={p.foto} alt={p.foto_alt ?? ""} fill sizes="96px" className="object-cover" />}
              </span>
              <Link href={`/admin/entrevista/${p.id}`} className="flex min-w-[200px] flex-1 flex-col text-navy hover:text-brand-strong">
                <span className="text-xs font-bold tracking-[.06em] text-muted uppercase">Parte {i + 1}</span>
                <strong className="font-display text-lg leading-tight">{p.titulo}</strong>
                <span className="text-[13px] text-muted">{c.ativas} de {c.total} perguntas visíveis{p.titulo_en ? ` · ${p.titulo_en}` : ""}</span>
              </Link>
              <form action={alternarParteEntrevista}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="publicado" value={String(!p.publicado)} />
                <button className={`min-h-10 cursor-pointer rounded-full px-3.5 text-sm font-semibold ${p.publicado ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff3e0] text-[#8a4b00]"}`}>
                  {p.publicado ? "Publicada" : "Rascunho"}
                </button>
              </form>
              <Link href={`/admin/entrevista/${p.id}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm font-semibold hover:bg-soft">Editar</Link>
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] text-muted">Clique em Publicada/Rascunho para mostrar ou esconder a parte dos alunos. A ordem é definida pelo campo Ordem de cada parte.</p>
    </>
  );
}
