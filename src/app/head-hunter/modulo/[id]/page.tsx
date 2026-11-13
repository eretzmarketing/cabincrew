import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CursoPlayer from "@/components/CursoPlayer";
import { Arrow, Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { navegacaoHeadHunter } from "@/lib/curso-navegacao";
import { TIPO_AULA, duracao, numeroModulo, type Aula, type Modulo } from "@/lib/crew";

export const metadata: Metadata = { title: "Módulo · Head Hunter", robots: { index: false } };

export default async function ModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, liberado } = await exigirCrewSelect(`/head-hunter/modulo/${id}`);
  if (!liberado) redirect("/head-hunter");
  if (!/^\d+$/.test(id)) notFound();

  const [{ data: modulo }, { data: aulas }, { data: feitas }, nav] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo, tipo, resumo, duracao_min, publicado").eq("modulo_id", Number(id)).eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id),
    navegacaoHeadHunter(supabase, user.id, { moduloId: Number(id) }),
  ]);
  const m = modulo as Modulo | null;
  if (!m) notFound();
  // no módulo com a página Simulados ANAC, os simulados ficam lá (não repetem na lista de aulas)
  const lista = ((aulas ?? []) as Aula[]).filter((a) => !(m?.recurso === "anac" && a.tipo === "simulado"));
  const concluidas = new Set((feitas ?? []).map((f) => f.aula_id));
  const primeira = lista.find((a) => !concluidas.has(a.id)) ?? lista[0];

  return (
    <CursoPlayer curso="Head Hunter" voltar={{ href: "/head-hunter", rotulo: "Painel do Head Hunter" }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total}
      rodape={primeira ? (
        <>
          <span className="text-[14px] text-muted">{lista.filter((a) => concluidas.has(a.id)).length} de {lista.length} aulas concluídas</span>
          <Link href={`/head-hunter/aula/${primeira.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
            {lista.some((a) => concluidas.has(a.id)) ? "Continuar" : "Começar o módulo"} <Arrow size={16} />
          </Link>
        </>
      ) : undefined}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#b0002a] uppercase">Módulo {numeroModulo(m.ordem)}{m.fase ? ` · ${m.fase}` : ""}</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{m.titulo}</h1>
          {m.descricao && <p className="text-[17px] leading-relaxed text-ink-2">{m.descricao}</p>}
        </div>

        {m.recurso === "dinamicas" && (
          <Link href="/head-hunter/dinamicas" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Biblioteca de dinâmicas</strong>
              <span className="text-[15px] text-[#d7dbe6]">As dinâmicas usadas nas seleções, com como se destacar em cada uma.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {m.ordem === 6 && (
          <Link href="/head-hunter/perfil-comportamental" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Perfil comportamental (OPQ / SHL)</strong>
              <span className="text-[15px] text-[#d7dbe6]">Treine o teste de personalidade e veja seu perfil em 11 traços, com alerta de respostas incoerentes.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {m.ordem === 8 && (
          <Link href="/head-hunter/entrevista-ingles" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Entrevista em inglês</strong>
              <span className="text-[15px] text-[#d7dbe6]">Perguntas reais com áudio, respostas-modelo e simulação com gravação.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {m.recurso === "anac" && (
          <Link href="/simulados-anac" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Simulados ANAC</strong>
              <span className="text-[15px] text-[#d7dbe6]">Treine por bloco ou faça a prova completa, com seu histórico de notas.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {lista.length === 0 && !m.recurso && m.ordem !== 8 ? (
          <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
            As aulas deste módulo estão sendo preparadas. Volte em breve.
          </p>
        ) : lista.length === 0 ? null : (
          <ol className="flex flex-col gap-3">
            {lista.map((a, i) => {
              const ok = concluidas.has(a.id);
              return (
                <li key={a.id}>
                  <Link href={`/head-hunter/aula/${a.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 text-navy hover:border-navy">
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
    </CursoPlayer>
  );
}
