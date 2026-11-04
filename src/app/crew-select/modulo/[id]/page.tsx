import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { TIPO_AULA, duracao, numeroModulo, type Aula, type Modulo } from "@/lib/crew";

export const metadata: Metadata = { title: "Módulo · Crew Select", robots: { index: false } };

export default async function ModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, liberado } = await exigirCrewSelect(`/crew-select/modulo/${id}`);
  if (!liberado) redirect("/crew-select");
  if (!/^\d+$/.test(id)) notFound();

  const [{ data: modulo }, { data: aulas }, { data: feitas }] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo, tipo, resumo, duracao_min, publicado").eq("modulo_id", Number(id)).eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id),
  ]);
  const m = modulo as Modulo | null;
  if (!m) notFound();
  const lista = (aulas ?? []) as Aula[];
  const concluidas = new Set((feitas ?? []).map((f) => f.aula_id));

  return (
    <main className="bg-soft px-6 py-10 pb-20">
      <div className="mx-auto flex max-w-[860px] flex-col gap-6">
        <Link href="/crew-select" className="text-sm font-semibold text-muted hover:text-navy">← Todos os módulos</Link>
        <div className="flex flex-col gap-2">
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#b0002a] uppercase">Módulo {numeroModulo(m.ordem)}{m.fase ? ` · ${m.fase}` : ""}</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{m.titulo}</h1>
          {m.descricao && <p className="text-[17px] leading-relaxed text-ink-2">{m.descricao}</p>}
        </div>

        {lista.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
            As aulas deste módulo estão sendo preparadas. Volte em breve.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {lista.map((a, i) => {
              const ok = concluidas.has(a.id);
              return (
                <li key={a.id}>
                  <Link href={`/crew-select/aula/${a.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 text-navy hover:border-navy">
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-navy"}`}
                      aria-hidden="true"
                    >
                      {ok ? <Check size={18} /> : i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-semibold">{a.titulo}</span>
                      <span className="text-[13px] text-muted">
                        {TIPO_AULA[a.tipo]}{a.duracao_min ? ` · ${duracao(a.duracao_min)}` : ""}{ok ? " · Concluída" : ""}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
