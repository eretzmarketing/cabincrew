import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirAula } from "@/app/crew-actions";
import { Card, Titulo, btnSecundario } from "@/components/admin-ui";
import { AulaForm } from "@/components/admin-forms";
import type { Aula, Modulo } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aula" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AdminAula({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modulo?: string; ordem?: string; criada?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const nova = id === "nova";
  if (!nova && !UUID.test(id)) notFound();

  const { supabase } = await getUser();
  const [{ data: modulos }, aulaRes, { data: sims }] = await Promise.all([
    supabase.from("modulos").select("*").order("ordem"),
    nova ? Promise.resolve({ data: null }) : supabase.from("aulas").select("*").eq("id", id).maybeSingle(),
    supabase.from("simulados").select("id, titulo").order("titulo"),
  ]);
  const a = aulaRes.data as Aula | null;
  if (!nova && !a) notFound();
  const lista = (modulos ?? []) as Modulo[];
  const moduloId = a?.modulo_id ?? (Number(sp.modulo) || lista[0]?.id);

  return (
    <>
      <Link href={moduloId ? `/admin/head-hunter/modulo/${moduloId}` : "/admin/head-hunter"} className="text-sm font-semibold text-muted hover:text-navy">
        ← Voltar ao módulo
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo>{nova ? "Nova aula" : a!.titulo}</Titulo>
        {a && (
          <Link href={`/head-hunter/aula/${a.id}`} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
        )}
      </div>
      {sp.criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Aula criada.</p>}

      <Card>
        <AulaForm a={a ?? undefined} modulos={lista} simulados={sims ?? []} moduloId={moduloId} proximaOrdem={Number(sp.ordem) || 1} />
      </Card>

      {a && (
        <details className="rounded-[20px] border border-line bg-white p-6">
          <summary className="cursor-pointer font-semibold text-brand-deep">Excluir aula</summary>
          <form action={excluirAula} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="modulo_id" value={a.modulo_id} />
            <span className="text-[15px] text-ink-2">Isso apaga a aula e o progresso dos alunos nela.</span>
            <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
          </form>
        </details>
      )}
    </>
  );
}
