import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirPerguntaEntrevista } from "@/app/crew-actions";
import { Titulo } from "@/components/admin-ui";
import { PerguntaForm, type PerguntaEdicao } from "@/components/EntrevistaAdminForms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pergunta da entrevista" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AdminPerguntaEntrevista({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ parte?: string; criada?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const nova = id === "nova";
  if (!nova && !UUID.test(id)) notFound();
  const { supabase } = await getUser();
  const { data: partes } = await supabase.from("entrevista_partes").select("id, titulo").order("numero").order("id");

  let q: PerguntaEdicao;
  if (nova) {
    q = { parte_id: Number(sp.parte) || partes?.[0]?.id || 0, en: "", pt: null, variantes: [], modelo: null, dica: null, ativo: true };
  } else {
    const { data } = await supabase.from("entrevista_perguntas").select("id, parte_id, en, pt, variantes, modelo, dica, ativo").eq("id", id).maybeSingle();
    if (!data) notFound();
    q = { ...data, variantes: data.variantes ?? [] } as PerguntaEdicao;
  }
  const parte = partes?.find((p) => p.id === q.parte_id);

  return (
    <>
      <Link href={parte ? `/admin/entrevista/${parte.id}` : "/admin/entrevista"} className="text-sm font-semibold text-muted hover:text-navy">← {parte?.titulo ?? "Entrevista em inglês"}</Link>
      <Titulo>{nova ? "Nova pergunta" : "Editar pergunta"}</Titulo>
      {sp.criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Pergunta criada.</p>}
      <PerguntaForm key={q.id ?? "nova"} q={q} partes={partes ?? []} />
      {!nova && (
        <details className="rounded-[20px] border border-line bg-white p-6">
          <summary className="cursor-pointer font-semibold text-brand-deep">Excluir pergunta</summary>
          <form action={excluirPerguntaEntrevista} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={q.id} />
            <input type="hidden" name="parte_id" value={q.parte_id} />
            <span className="text-[15px] text-ink-2">Prefere só esconder? Desmarque “Visível para os alunos” e salve.</span>
            <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
          </form>
        </details>
      )}
    </>
  );
}
