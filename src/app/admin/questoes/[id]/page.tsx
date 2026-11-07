import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirQuestao } from "@/app/crew-actions";
import { Titulo } from "@/components/admin-ui";
import QuestaoForm, { type QuestaoEdicao } from "@/components/QuestaoForm";
import { BANCOS } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questão" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AdminQuestao({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ banco?: string; criada?: string; voltar?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const nova = id === "nova";
  if (!nova && !UUID.test(id)) notFound();

  const { supabase } = await getUser();
  let q: QuestaoEdicao;
  if (nova) {
    q = {
      banco: sp.banco && sp.banco in BANCOS ? sp.banco : "anac",
      categoria: null, contexto: null, enunciado: "", imagem_url: null,
      alternativas: [], correta: null, explicacao: null, ativo: true,
    };
  } else {
    const { data } = await supabase
      .from("questoes")
      .select("id, banco, categoria, contexto, enunciado, imagem_url, alternativas, correta, explicacao, ativo")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    q = data as QuestaoEdicao;
  }

  const { data: cats } = await supabase.from("questoes").select("categoria").eq("banco", q.banco).not("categoria", "is", null).limit(5000);
  const categorias = [...new Set((cats ?? []).map((c) => c.categoria as string))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const voltar = sp.voltar?.startsWith("/admin/questoes") ? sp.voltar : `/admin/questoes?banco=${q.banco}`;

  return (
    <>
      <Link href={voltar} className="text-sm font-semibold text-muted hover:text-navy">← Questões de {BANCOS[q.banco] ?? q.banco}</Link>
      <Titulo sub={nova ? "Preencha os campos. A prévia ao lado mostra como fica para o aluno." : "As alterações valem para os próximos simulados."}>
        {nova ? "Nova questão" : "Editar questão"}
      </Titulo>
      {sp.criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Questão criada.</p>}

      <QuestaoForm key={q.id ?? "nova"} inicial={q} categorias={categorias} />

      {!nova && (
        <details className="rounded-[20px] border border-line bg-white p-6">
          <summary className="cursor-pointer font-semibold text-brand-deep">Excluir questão</summary>
          <form action={excluirQuestao} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={q.id} />
            <input type="hidden" name="voltar" value={voltar} />
            <span className="text-[15px] text-ink-2">Prefere só tirar dos simulados? Desmarque “Usar nos simulados” e salve.</span>
            <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
          </form>
        </details>
      )}
    </>
  );
}
