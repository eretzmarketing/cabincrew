import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Prova from "@/components/Prova";
import { exigirCrewSelect } from "@/lib/crew-gate";
import type { QuestaoProva, Simulado, Tentativa } from "@/lib/crew";

export const metadata: Metadata = { title: "Simulado · Head Hunter", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function SimuladoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aula?: string }> }) {
  const { id } = await params;
  const { aula } = await searchParams;
  if (!UUID.test(id)) notFound();
  const aulaId = aula && UUID.test(aula) ? aula : "";
  const { supabase, liberado } = await exigirCrewSelect(`/head-hunter/simulado/${id}`);
  if (!liberado) redirect("/head-hunter");

  const { data: t } = await supabase.from("tentativas").select("*").eq("id", id).maybeSingle();
  const tentativa = t as Tentativa | null;
  if (!tentativa) notFound();

  const resultado = `/head-hunter/simulado/${id}/resultado${aulaId ? `?aula=${aulaId}` : ""}`;
  if (tentativa.finalizada_em) redirect(resultado);
  if (tentativa.prazo && new Date(tentativa.prazo).getTime() < Date.parse(new Date().toISOString())) {
    await supabase.rpc("finalizar_tentativa", { p_tentativa: id });
    redirect(resultado);
  }

  const [{ data: questoes }, { data: sim }] = await Promise.all([
    supabase.rpc("questoes_da_tentativa", { p_tentativa: id }),
    supabase.from("simulados").select("*").eq("id", tentativa.simulado_id).single(),
  ]);

  return (
    <main className="min-h-[70vh] bg-soft px-4 py-6 pb-16 md:px-6">
      <Prova
        tentativaId={id}
        aulaId={aulaId}
        simulado={sim as Simulado}
        prazo={tentativa.prazo}
        questoes={(questoes ?? []) as QuestaoProva[]}
        modo={(tentativa as Tentativa & { modo?: string }).modo === "treino" ? "treino" : "prova"}
        saidasIniciais={(tentativa as Tentativa & { saidas_aba?: number }).saidas_aba ?? 0}
      />
    </main>
  );
}
