import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CurriculoIA, { FeedbackCurriculo } from "@/components/CurriculoIA";
import { configIA, saldoVideoIA } from "@/lib/ia-video";
import { NOTA_CV_OK, type FeedbackCV } from "@/lib/ia-curriculo-tipos";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Análise de currículo · Head Hunter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CurriculoPage() {
  const { supabase, user, profile, liberado } = await exigirCrewSelect("/head-hunter/curriculo");
  if (!liberado) redirect("/head-hunter");
  const cfg = configIA();
  const disponivel = !!cfg?.ativo;
  const [{ data: hist }, saldo] = await Promise.all([
    supabase.from("curriculo_analises").select("id, nota, ia, arquivo, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    disponivel && cfg ? saldoVideoIA(supabase, user.id, cfg.porAlunoCv, "curriculo") : Promise.resolve(null),
  ]);
  const restantes = profile?.is_admin || !saldo || "erro" in saldo ? null : saldo.restantes;
  const historico = (hist ?? []) as { id: number; nota: number; ia: FeedbackCV; arquivo: string | null; created_at: string }[];

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href="/head-hunter" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Head Hunter</Link>
          <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Inscrição e triagem · Currículo</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Análise de currículo</h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Antes de um recrutador ver o seu currículo, um robô de triagem (ATS) decide se ele passa. Descubra o que o robô lê no seu arquivo,
            que palavras-chave faltam e como deixar as suas experiências mais fortes para a vaga de comissário(a).
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-4 pt-8 md:px-6">
        <CurriculoIA restantes={restantes} disponivel={disponivel} />

        {historico.length > 0 && (
          <section aria-labelledby="hist" className="flex flex-col gap-3">
            <h2 id="hist" className="font-display text-xl font-extrabold">Suas análises</h2>
            <ul className="flex flex-col gap-2">
              {historico.map((h) => (
                <li key={h.id} className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                    <span className="min-w-0 flex-1 truncate text-muted">{h.arquivo}</span>
                    <span className={`rounded-full px-3 py-0.5 font-semibold ${h.nota >= NOTA_CV_OK ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>{h.nota}/100</span>
                  </div>
                  <details className="pt-2">
                    <summary className="min-h-10 cursor-pointer py-2 text-[14px] font-semibold text-navy">Ver a análise</summary>
                    <div className="pt-2"><FeedbackCurriculo f={h.ia} /></div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-5 text-[15px] text-ink-2">
          <strong className="font-display text-[17px] text-navy">Dicas rápidas para passar no robô</strong>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>Monte no Word ou no Google Docs e exporte em PDF. Evite modelos com colunas, tabelas, ícones e barras de nível.</li>
            <li>Use títulos simples: Objetivo, Experiência, Formação, Cursos, Idiomas.</li>
            <li>Escreva o idioma com o nível (ex.: Inglês intermediário) e os cursos da aviação com o ano.</li>
            <li>Revise a teoria nas aulas do <strong>Módulo 04 · Inscrição e Triagem</strong>.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
