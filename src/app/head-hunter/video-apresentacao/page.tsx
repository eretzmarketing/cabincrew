import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import VideoTreino from "@/components/VideoTreino";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { COMPANHIAS } from "@/lib/jornada";
import { lerCheckin } from "@/lib/jornada-dados";
import { NOTA_VIDEO, mmss } from "@/lib/video";

export const metadata: Metadata = { title: "Vídeo de apresentação · Head Hunter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VideoApresentacaoPage() {
  const { supabase, user, liberado } = await exigirCrewSelect("/head-hunter/video-apresentacao");
  if (!liberado) redirect("/head-hunter");
  const [{ data: hist }, checkin] = await Promise.all([
    supabase.from("video_treinos").select("nota, duracao_seg, meta_seg, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    lerCheckin(supabase, user.id),
  ]);
  const historico = (hist ?? []) as { nota: number; duracao_seg: number; meta_seg: number; created_at: string }[];
  const companhia = COMPANHIAS.find((c) => c.slug === checkin.companhias[0])?.nome;

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href="/head-hunter" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Head Hunter</Link>
          <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Entrevista · Vídeo de apresentação</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Treino de vídeo</h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Monte o roteiro, grave pela câmera com os tópicos aparecendo na hora certa e avalie o resultado.
            É o treino para o vídeo de apresentação (a Azul costuma pedir) e para o &quot;Fale sobre você&quot; da entrevista.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-4 pt-8 md:px-6">
        <VideoTreino companhia={companhia} />

        {historico.length > 0 && (
          <section aria-labelledby="hist" className="flex flex-col gap-3">
            <h2 id="hist" className="font-display text-xl font-extrabold">Suas gravações</h2>
            <ul className="flex flex-col gap-2">
              {historico.map((h) => (
                <li key={h.created_at} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
                  <span>{new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                  <span className="text-muted">{mmss(h.duracao_seg)} de {mmss(h.meta_seg)}</span>
                  <span className={`rounded-full px-3 py-0.5 font-semibold ${h.nota >= NOTA_VIDEO ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>{h.nota}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[15px] text-ink-2">
          Quer revisar a teoria? Veja a aula <strong>Foto e vídeo de apresentação</strong> no Módulo 03 e o <strong>método STAR</strong> no Módulo 08.
        </p>
      </div>
    </main>
  );
}
