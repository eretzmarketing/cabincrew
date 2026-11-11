import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OpqTreino from "@/components/OpqTreino";
import { exigirCrewSelect } from "@/lib/crew-gate";
import type { PerfilOpq } from "@/lib/opq";

export const metadata: Metadata = { title: "Perfil comportamental · Crew Select", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PerfilComportamentalPage() {
  const { supabase, user, liberado } = await exigirCrewSelect("/crew-select/perfil-comportamental");
  if (!liberado) redirect("/crew-select");
  const [{ data: itens }, { data: hist }] = await Promise.all([
    supabase.rpc("opq_sortear"),
    supabase.from("opq_tentativas").select("perfil, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);
  const historico = (hist ?? []) as { perfil: PerfilOpq; created_at: string }[];

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href="/crew-select" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Crew Select</Link>
          <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Testes online · SHL e fit cultural</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Perfil comportamental</h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Treine o teste de personalidade usado nas seleções (como o OPQ da SHL e os testes de perfil e fit cultural).
            Descubra como você se apresenta e se suas respostas são coerentes.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-4 pt-8 md:px-6">
        <OpqTreino itens={(itens ?? []) as { id: string; texto: string }[]} ultimo={historico[0]?.perfil} />

        {historico.length > 0 && (
          <section aria-labelledby="hist" className="flex flex-col gap-3">
            <h2 id="hist" className="font-display text-xl font-extrabold">Suas últimas sessões</h2>
            <ul className="flex flex-col gap-2">
              {historico.map((h) => {
                const media = Math.round(h.perfil.tracos.reduce((s, t) => s + t.pontos, 0) / Math.max(1, h.perfil.tracos.length));
                return (
                  <li key={h.created_at} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
                    <span>{new Date(h.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                    <span className="text-muted">média {media} · {h.perfil.incoerentes.length ? `${h.perfil.incoerentes.length} traço(s) incoerente(s)` : "coerente"}{h.perfil.extremos >= 70 ? " · respostas forçadas" : ""}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
