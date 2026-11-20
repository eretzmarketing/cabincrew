import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo, btnSecundario } from "@/components/admin-ui";
import { Barras } from "@/components/graficos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questões que mais erram" };
export const dynamic = "force-dynamic";

const BLOCOS = ["Segurança e Emergência", "Legislação Aeronáutica", "Primeiros Socorros", "Conhecimentos Técnicos"];
const PERIODOS: [string, string][] = [["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["", "Tudo"]];
const MINIMOS = [1, 3, 5, 10, 20];

type Questao = {
  id: string; bloco: string; enunciado: string; alternativas: { letra: string; texto: string | null }[]; correta: string | null;
  explicacao: string | null; ativo: boolean; respostas: number; erros: number; alunos: number; alunos_erraram: number;
  ultima: string; dist: Record<string, number>; reportes: number; comentarios: number;
};
type Bloco = { bloco: string; respostas: number; erros: number; alunos: number; questoes: number };
type Dados = { resumo: { respostas: number; erros: number; alunos: number; questoes: number }; criticas: number; blocos: Bloco[]; faixas: { faixa: number; n: number }[]; questoes: Questao[] };

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const corErro = (p: number) => (p >= 60 ? "bg-brand-strong" : p >= 40 ? "bg-[#e0a100]" : "bg-[#2e9d5b]");
const textoErro = (p: number) => (p >= 60 ? "text-brand-strong" : p >= 40 ? "text-[#7a5a00]" : "text-[#0f6b3a]");

export default async function QuestoesErros({ searchParams }: { searchParams: Promise<{ bloco?: string; dias?: string; min?: string; ordem?: string; n?: string }> }) {
  const sp = await searchParams;
  const bloco = BLOCOS.includes(sp.bloco ?? "") ? sp.bloco! : null;
  const dias = ["7", "30", "90"].includes(sp.dias ?? "") ? Number(sp.dias) : null;
  const min = MINIMOS.includes(Number(sp.min)) ? Number(sp.min) : 5;
  const ordem = sp.ordem === "alunos" ? "alunos" : "taxa";
  const limite = [50, 100, 200].includes(Number(sp.n)) ? Number(sp.n) : 50;

  const { supabase } = await getUser();
  const { data, error } = await supabase.rpc("admin_questoes_erros", { p_bloco: bloco, p_dias: dias, p_min: min, p_ordem: ordem, p_limite: limite });
  const d = data as Dados | null;

  const params = { ...(bloco ? { bloco } : {}), ...(dias ? { dias: String(dias) } : {}), ...(min !== 5 ? { min: String(min) } : {}), ...(ordem !== "taxa" ? { ordem } : {}), ...(limite !== 50 ? { n: String(limite) } : {}) };
  const link = (mudar: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(mudar)) if (v) p.set(k, v); else p.delete(k);
    return `/admin/questoes/erros${p.size ? `?${p}` : ""}`;
  };
  const aqui = link({});
  const blocos = (d?.blocos ?? []).filter((b) => BLOCOS.includes(b.bloco)).sort((a, b) => pct(b.erros, b.respostas) - pct(a.erros, a.respostas));

  return (
    <>
      <Link href="/admin/anac" className="text-sm font-semibold text-navy">← Simulados ANAC</Link>
      <Titulo sub="Onde os alunos mais erram: pode ser um tema difícil ou um gabarito com problema. Abra a questão e revise na hora.">Questões que mais erram</Titulo>

      {error || !d ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0073_questoes_erros.sql</strong> no Supabase para ativar este painel.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 md:p-5">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold tracking-wide text-muted uppercase">Bloco</span>
              <nav aria-label="Bloco" className="flex flex-wrap gap-2">
                {[null, ...BLOCOS].map((b) => {
                  const ativo = b === bloco;
                  return (
                    <Link key={b ?? "todos"} href={link({ bloco: b })} aria-current={ativo ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-xl border-2 px-4 font-display text-[14px] font-bold transition ${ativo ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
                      {b ?? "Todos os blocos"}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold tracking-wide text-muted uppercase">Período</span>
                <nav aria-label="Período" className="inline-flex flex-wrap rounded-xl bg-soft p-1">
                  {PERIODOS.map(([v, t]) => {
                    const ativo = String(dias ?? "") === v;
                    return <Link key={t} href={link({ dias: v || null })} aria-current={ativo ? "true" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold ${ativo ? "bg-white text-navy shadow-sm" : "text-ink-2 hover:text-navy"}`}>{t}</Link>;
                  })}
                </nav>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold tracking-wide text-muted uppercase">Mínimo de respostas por questão</span>
                <nav aria-label="Mínimo de respostas" className="inline-flex flex-wrap rounded-xl bg-soft p-1">
                  {MINIMOS.map((m) => {
                    const ativo = m === min;
                    return <Link key={m} href={link({ min: m === 5 ? null : String(m) })} aria-current={ativo ? "true" : undefined}
                      className={`inline-flex min-h-10 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold ${ativo ? "bg-white text-navy shadow-sm" : "text-ink-2 hover:text-navy"}`}>{m}</Link>;
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Numero rotulo="Taxa de erro" valor={`${pct(d.resumo.erros, d.resumo.respostas)}%`} detalhe={`${d.resumo.erros} erros em ${d.resumo.respostas} respostas`} />
            <Numero rotulo="Alunos que responderam" valor={d.resumo.alunos} detalhe={bloco ?? "todos os blocos"} />
            <Numero rotulo="Questões respondidas" valor={d.resumo.questoes} detalhe="no período" />
            <Numero rotulo="Questões críticas" valor={d.criticas} detalhe={`mais erradas que acertadas (mín. ${min} respostas)`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-lg font-extrabold">Taxa de erro por bloco</h2>
                <p className="text-[13px] text-muted">Clique num bloco para ver só as questões dele.</p>
              </div>
              {!blocos.length ? <p className="text-ink-2">Ainda sem respostas no período.</p> : (
                <ul className="flex flex-col gap-3">
                  {blocos.map((b) => {
                    const p = pct(b.erros, b.respostas);
                    return (
                      <li key={b.bloco}>
                        <Link href={link({ bloco: b.bloco })} className={`flex flex-col gap-1 rounded-xl p-2 hover:bg-soft ${b.bloco === bloco ? "bg-soft ring-2 ring-navy" : ""}`}>
                          <span className="flex items-baseline justify-between gap-2 text-[14px]">
                            <strong className="text-navy">{b.bloco}</strong>
                            <span><strong className={textoErro(p)}>{p}%</strong> <span className="text-muted">· {b.alunos} alunos · {b.respostas} respostas</span></span>
                          </span>
                          <span className="h-2.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className={`block h-2.5 rounded-full ${corErro(p)}`} style={{ width: `${p}%` }} /></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-lg font-extrabold">Quantas questões em cada faixa de erro</h2>
                <p className="text-[13px] text-muted">Questões com pelo menos {min} {min === 1 ? "resposta" : "respostas"}{bloco ? ` · ${bloco}` : ""}. À direita, as que mais derrubam.</p>
              </div>
              <Barras rotuloA11y="Questões por faixa de taxa de erro" cada={1}
                dados={Array.from({ length: 10 }, (_, i) => {
                  const n = d.faixas.find((f) => f.faixa === i * 10)?.n ?? 0;
                  return { rotulo: `${i * 10}%`, valor: n, dica: `${i * 10}% a ${i * 10 + 9}% de erro: ${n} questões` };
                })} />
            </Card>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold">Ranking {bloco ? `· ${bloco}` : ""}</h2>
              <nav aria-label="Ordenar" className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">Ordenar por:</span>
                <span className="inline-flex rounded-xl bg-white p-1 ring-1 ring-line">
                  {([["taxa", "% de erro"], ["alunos", "Alunos que erraram"]] as const).map(([v, t]) => (
                    <Link key={v} href={link({ ordem: v === "taxa" ? null : v })} aria-current={ordem === v ? "true" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold ${ordem === v ? "bg-navy text-white" : "text-ink-2 hover:text-navy"}`}>{t}</Link>
                  ))}
                </span>
              </nav>
            </div>
            {!d.questoes.length ? (
              <Card><p className="text-ink-2">Nenhuma questão com pelo menos {min} {min === 1 ? "resposta" : "respostas"} neste filtro. Diminua o mínimo de respostas ou aumente o período.</p></Card>
            ) : (
              <ol className="flex flex-col gap-3">
                {d.questoes.map((q, i) => {
                  const p = pct(q.erros, q.respostas);
                  const erradas = Object.entries(q.dist).filter(([l]) => l !== q.correta && l !== "-").sort((a, b) => b[1] - a[1]);
                  const pior = erradas[0];
                  return (
                    <li key={q.id} className="rounded-2xl border border-line bg-white">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none flex-wrap items-start gap-x-4 gap-y-2 p-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft font-display font-extrabold text-navy">{i + 1}</span>
                          <span className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-2 text-[12px]">
                              <span className="rounded-full bg-[#eef1ff] px-2 py-0.5 font-bold text-navy">{q.bloco}</span>
                              {!q.ativo && <span className="rounded-full bg-[#eceef3] px-2 py-0.5 font-bold text-ink-2">INATIVA</span>}
                              {q.reportes > 0 && <span className="rounded-full bg-brand-soft px-2 py-0.5 font-bold text-brand-deep">🚩 {q.reportes} {q.reportes === 1 ? "reporte" : "reportes"}</span>}
                              {q.comentarios > 0 && <span className="rounded-full bg-soft px-2 py-0.5 font-semibold text-ink-2">💬 {q.comentarios}</span>}
                            </span>
                            <span className="line-clamp-2 text-[15px] font-semibold text-navy">{q.enunciado}</span>
                            <span className="text-[13px] text-muted group-open:hidden">Ver detalhes ▸</span>
                          </span>
                          <span className="flex w-[220px] flex-col gap-1">
                            <span className="text-[14px]"><strong className={`font-display text-[20px] ${textoErro(p)}`}>{p}%</strong> <span className="text-muted">de erro</span></span>
                            <span className="h-2 rounded-full bg-[#eceef3]" aria-hidden="true"><span className={`block h-2 rounded-full ${corErro(p)}`} style={{ width: `${p}%` }} /></span>
                            <span className="text-[13px] text-ink-2"><strong>{q.alunos_erraram}</strong> de {q.alunos} {q.alunos === 1 ? "aluno errou" : "alunos erraram"}</span>
                            {pior && <span className="text-[13px] text-muted">Mais marcada errada: <strong className="text-brand-deep">{pior[0]}</strong> ({pct(pior[1], q.respostas)}%)</span>}
                          </span>
                          <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent(aqui)}`} className={`${btnSecundario} self-center`}>✏️ Revisar</Link>
                        </summary>
                        <div className="flex flex-col gap-3 border-t border-line p-4">
                          <p className="text-[15px] leading-relaxed whitespace-pre-line">{q.enunciado}</p>
                          <ul className="flex flex-col gap-2">
                            {q.alternativas.map((a) => {
                              const n = q.dist[a.letra] ?? 0;
                              const certa = a.letra === q.correta;
                              return (
                                <li key={a.letra} className={`relative overflow-hidden rounded-xl border-2 px-3 py-2 text-[14px] ${certa ? "border-[#2e9d5b]" : "border-line"}`}>
                                  <span className={`absolute inset-y-0 left-0 ${certa ? "bg-[#e5f6ec]" : "bg-brand-soft/70"}`} style={{ width: `${pct(n, q.respostas)}%` }} aria-hidden="true" />
                                  <span className="relative flex items-start gap-3">
                                    <strong className="font-display">{a.letra}</strong>
                                    <span className="flex-1">{a.texto ?? "(imagem)"}</span>
                                    <span className="shrink-0 font-semibold">{pct(n, q.respostas)}% <span className="font-normal text-muted">({n})</span>{certa && <span className="ml-1 text-[#0f6b3a]">✓ certa</span>}</span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          {q.explicacao ? <p className="rounded-xl bg-soft px-4 py-3 text-[14px]"><strong>Explicação: </strong>{q.explicacao}</p>
                            : <p className="text-[13px] text-muted">Sem explicação cadastrada. Uma boa explicação costuma reduzir o erro nas próximas tentativas.</p>}
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent(aqui)}`} className={btnSecundario}>✏️ Revisar e editar a questão</Link>
                            {q.reportes > 0 && <Link href="/admin/questoes/reportes" className={btnSecundario}>🚩 Ver reportes</Link>}
                            {q.comentarios > 0 && <Link href="/admin/questoes/comentarios" className={btnSecundario}>💬 Ver comentários</Link>}
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ol>
            )}
            {d.questoes.length >= limite && limite < 200 && (
              <Link href={link({ n: String(limite === 50 ? 100 : 200) })} className={`${btnSecundario} self-center`}>Mostrar mais questões</Link>
            )}
          </section>
        </>
      )}
    </>
  );
}
