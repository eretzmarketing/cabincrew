import type { Metadata } from "next";
import Link from "next/link";
import { iniciarSimulado } from "@/app/crew-actions";
import { Arrow } from "@/components/icons";
import { cursosDoAluno } from "@/lib/crew-gate";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Simulados ANAC grátis", description: "Simulados gratuitos no estilo da prova teórica da ANAC para comissário de voo: 4 blocos temáticos e a prova completa." };

/** Os 4 blocos da prova da ANAC + a prova completa (origem = chave do simulado criado na importação) */
const BLOCOS = [
  { origem: "cc-anac-seguranca", n: 1, titulo: "Segurança e Emergência", desc: "Procedimentos de segurança, evacuação e situações de emergência a bordo.", cor: "#d10030", fundo: "#fff0f3", icone: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" },
  { origem: "cc-anac-legislacao", n: 2, titulo: "Legislação Aeronáutica", desc: "Normas, regulamentos e aspectos legais da aviação civil.", cor: "#2f5bd3", fundo: "#eef3ff", icone: "M12 4v16M6 20h12M5 8h14M7 8l-3 6a3 3 0 006 0zM17 8l-3 6a3 3 0 006 0z" },
  { origem: "cc-anac-socorros", n: 3, titulo: "Primeiros Socorros", desc: "Atendimento de emergências médicas e procedimentos de primeiros socorros.", cor: "#c2185b", fundo: "#fdeef5", icone: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" },
  { origem: "cc-anac-tecnicos", n: 4, titulo: "Conhecimentos Técnicos", desc: "Aeronaves, sistemas, meteorologia e operações de voo.", cor: "#6a3fd1", fundo: "#f2eeff", icone: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" },
] as const;
const COMPLETA = "cc-anac-completo";

type Sim = { id: number; origem: string; titulo: string; qtd_questoes: number; tempo_min: number | null; nota_minima: number };
type Tent = { id: string; simulado_id: number; nota: number | null; total: number; acertos: number | null; iniciada_em: string; finalizada_em: string };

const Icone = ({ d, cor, size = 26 }: { d: string; cor: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const duracao = (min: number | null) => (!min ? "sem limite de tempo" : min >= 60 ? `${min / 60 === Math.floor(min / 60) ? min / 60 : (min / 60).toFixed(1)} ${min >= 120 ? "horas" : "hora"}` : `${min} min`);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const dataCurta = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function Card({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex flex-[1_1_150px] flex-col items-center gap-1 rounded-2xl border border-line bg-white px-4 py-5 text-center">
      <span className={`font-display text-[34px] leading-none font-extrabold ${destaque ? "text-brand-strong" : "text-navy"}`}>{valor}</span>
      <span className="text-sm text-muted">{titulo}</span>
    </div>
  );
}

function Grafico({ pontos, minima }: { pontos: { nota: number; data: string }[]; minima: number }) {
  const W = 560, H = 220, L = 34, R = 12, T = 12, B = 30;
  const x = (i: number) => L + (pontos.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (pontos.length - 1));
  const y = (v: number) => T + ((100 - v) * (H - T - B)) / 100;
  const linha = pontos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.nota).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Notas das últimas ${pontos.length} tentativas: ${pontos.map((p) => `${p.nota}%`).join(", ")}`}>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#eceef3" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#6b7186">{v}</text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={y(minima)} y2={y(minima)} stroke="#0f6b3a" strokeDasharray="5 5" />
      <path d={linha} fill="none" stroke="#313950" strokeWidth={2.5} strokeLinejoin="round" />
      {pontos.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.nota)} r={5} fill={p.nota >= minima ? "#0f6b3a" : "#d10030"} stroke="#fff" strokeWidth={2} />
          {(pontos.length <= 8 || i % Math.ceil(pontos.length / 8) === 0 || i === pontos.length - 1) && (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7186">{p.data}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default async function SimuladosAnac() {
  // Simulados ANAC: grátis para qualquer pessoa cadastrada
  const { supabase, user } = await exigirLogin("/simulados-anac");
  const temHeadHunter = (await cursosDoAluno(supabase, user.id)).has("head-hunter");

  const origens = [...BLOCOS.map((b) => b.origem), COMPLETA];
  const { data: sims } = await supabase.from("simulados").select("id, origem, titulo, qtd_questoes, tempo_min, nota_minima").in("origem", origens);
  const simulados = (sims ?? []) as Sim[];
  const ids = simulados.map((s) => s.id);

  const [{ data: aulas }, { data: tents }] = await Promise.all([
    ids.length ? supabase.from("aulas").select("id, simulado_id").eq("publicado", true).in("simulado_id", ids) : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("tentativas").select("id, simulado_id, nota, total, acertos, iniciada_em, finalizada_em")
          .eq("user_id", user.id).in("simulado_id", ids).not("finalizada_em", "is", null).order("iniciada_em", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
  ]);

  // a aula ligada ao simulado (só para alunos do Head Hunter voltarem para ela)
  const aulaDe = new Map<number, string>();
  for (const a of (aulas ?? []) as { id: string; simulado_id: number }[]) if (!aulaDe.has(a.simulado_id)) aulaDe.set(a.simulado_id, a.id);
  const porOrigem = new Map(simulados.map((s) => [s.origem, s]));
  const disponivel = (origem: string) => {
    const s = porOrigem.get(origem);
    return s ? { ...s, aula: aulaDe.get(s.id) ?? "" } : null;
  };
  const completa = disponivel(COMPLETA);
  const blocos = BLOCOS.map((b) => ({ ...b, sim: disponivel(b.origem) }));
  const algumBloco = blocos.some((b) => b.sim);
  const minima = simulados[0]?.nota_minima ?? 70;

  const tentativas = (tents ?? []) as Tent[];
  const nomeDe = new Map(simulados.map((s) => [s.id, s.origem === COMPLETA ? "Prova completa" : `Bloco ${BLOCOS.find((b) => b.origem === s.origem)?.n}`]));
  const minimaDe = new Map(simulados.map((s) => [s.id, s.nota_minima]));
  const notas = tentativas.map((t) => t.nota ?? 0);
  const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
  const melhor = notas.length ? Math.max(...notas) : 0;
  const aprovacoes = tentativas.filter((t) => (t.nota ?? 0) >= (minimaDe.get(t.simulado_id) ?? 70)).length;
  const taxa = tentativas.length ? Math.round((aprovacoes / tentativas.length) * 100) : 0;
  const segundos = tentativas.reduce((s, t) => s + Math.max(0, (Date.parse(t.finalizada_em) - Date.parse(t.iniciada_em)) / 1000), 0);
  const questoes = tentativas.reduce((s, t) => s + t.total, 0);
  const porQuestao = questoes ? Math.round(segundos / questoes) : 0;
  const statsBloco = (simId?: number) => {
    const ts = tentativas.filter((t) => t.simulado_id === simId);
    return ts.length ? { n: ts.length, media: Math.round(ts.reduce((s, t) => s + (t.nota ?? 0), 0) / ts.length) } : null;
  };
  const evolucao = tentativas.slice(0, 15).reverse().map((t) => ({
    nota: t.nota ?? 0,
    data: new Date(t.iniciada_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }),
  }));

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 px-6 pt-8 pb-14 text-center">
          {temHeadHunter && <Link href="/head-hunter" className="self-start text-sm font-semibold text-[#d7dbe6] hover:text-white">← Head Hunter</Link>}
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">✈︎ Grátis para cadastrados</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[48px]">Simulados da banca <span className="text-[#ff5a7a]">ANAC</span></h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#d7dbe6]">
            Treine para a prova teórica de Comissário de Voo com questões no estilo da banca. Estude bloco por bloco ou encare a prova completa.
          </p>
          <ul className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
            <li className="rounded-full border border-white/20 bg-white/10 px-4 py-2">✓ {minima}% para aprovação</li>
            <li className="rounded-full border border-white/20 bg-white/10 px-4 py-2">↻ Tentativas ilimitadas</li>
            <li className="rounded-full border border-white/20 bg-white/10 px-4 py-2">▦ 4 blocos temáticos</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-4 pt-10 md:px-6">
        {!algumBloco && !completa ? (
          <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
            Os simulados da ANAC estão sendo preparados. Volte em breve.
          </p>
        ) : (
          <>
            {tentativas.length > 0 && (
              <section aria-labelledby="progresso" className="flex flex-col gap-5">
                <div>
                  <h2 id="progresso" className="font-display text-2xl font-extrabold">Seu progresso</h2>
                  <p className="text-[15px] text-ink-2">Sua evolução nos simulados da ANAC.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Card titulo={tentativas.length === 1 ? "Simulado feito" : "Simulados feitos"} valor={String(tentativas.length)} />
                  <Card titulo="Média" valor={`${media}%`} destaque />
                  <Card titulo="Melhor nota" valor={`${melhor}%`} destaque />
                  <Card titulo="Aprovação" valor={`${taxa}%`} destaque />
                </div>
                <div className="flex flex-wrap gap-3">
                  {blocos.map((b) => {
                    const st = statsBloco(b.sim?.id);
                    const ok = st && st.media >= minima;
                    return (
                      <div key={b.n} className={`flex flex-[1_1_150px] flex-col items-center gap-0.5 rounded-2xl border px-4 py-4 text-center ${st ? (ok ? "border-[#bfe6cf] bg-[#eefaf2]" : "border-brand-line bg-brand-soft") : "border-dashed border-[#d5d9e3] bg-white"}`}>
                        <span className="text-xs font-bold tracking-[.08em] text-muted uppercase">Bloco {b.n}</span>
                        <span className={`font-display text-2xl font-extrabold ${st ? (ok ? "text-[#0f6b3a]" : "text-brand-strong") : "text-muted"}`}>{st ? `${st.media}%` : "—"}</span>
                        <span className="text-[13px] text-muted">{st ? `${st.n} ${st.n === 1 ? "tentativa" : "tentativas"}` : "não feito"}</span>
                      </div>
                    );
                  })}
                </div>
                {porQuestao > 0 && <p className="self-center rounded-full bg-white px-5 py-2 text-[15px] text-ink-2">⏱ Tempo médio por questão: <strong className="text-navy">{porQuestao < 60 ? `${porQuestao}s` : mmss(porQuestao)}</strong></p>}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
                    <h3 className="font-display text-lg font-bold">Evolução do desempenho</h3>
                    <Grafico pontos={evolucao} minima={minima} />
                    <p className="text-center text-[13px] text-muted">Linha tracejada verde = {minima}% (nota de aprovação)</p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
                    <h3 className="font-display text-lg font-bold">Últimas tentativas</h3>
                    <ul className="flex flex-col gap-2">
                      {tentativas.slice(0, 6).map((t) => {
                        const ok = (t.nota ?? 0) >= (minimaDe.get(t.simulado_id) ?? 70);
                        return (
                          <li key={t.id}>
                            <Link href={`/head-hunter/simulado/${t.id}/resultado?aula=${aulaDe.get(t.simulado_id) ?? ""}`} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-navy hover:border-navy">
                              <span aria-hidden="true" className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-strong"}`}>{ok ? "✓" : "✕"}</span>
                              <span className="flex min-w-0 flex-1 flex-col">
                                <span className="font-semibold">{nomeDe.get(t.simulado_id)} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold text-white ${ok ? "bg-[#0f6b3a]" : "bg-navy"}`}>{t.nota ?? 0}%</span></span>
                                <span className="text-[13px] text-muted">{dataCurta(t.iniciada_em)} · ⏱ {mmss((Date.parse(t.finalizada_em) - Date.parse(t.iniciada_em)) / 1000)}</span>
                              </span>
                              <span className="text-sm font-semibold">Gabarito →</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            <section aria-labelledby="modo" className="flex flex-col gap-5">
              <div className="text-center">
                <h2 id="modo" className="font-display text-2xl font-extrabold">Escolha o modo de estudo</h2>
                <p className="text-[15px] text-ink-2">Você pode navegar entre as questões e entregar quando quiser. A nota mínima é {minima}%.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {algumBloco && (
                  <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ff]"><Icone d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" cor="#2f5bd3" /></span>
                      <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-bold text-[#2f5bd3]">Recomendado</span>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold">Estudo por bloco</h3>
                    <p className="text-[15px] text-ink-2">Foque em um bloco por vez para estudar de forma direcionada.</p>
                    <ul className="flex flex-col gap-2 text-[15px]">
                      <li>📖 20 questões sorteadas do bloco</li>
                      <li>⏱ 30 minutos</li>
                      <li>🎯 4 blocos temáticos para escolher</li>
                    </ul>
                    <a href="#blocos" className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy px-6 font-display font-bold text-white hover:bg-navy-deep">Escolher bloco <Arrow /></a>
                  </div>
                )}
                {completa && (
                  <div className="flex flex-col gap-4 rounded-[22px] border-2 border-brand-line bg-white p-6 shadow-[0_18px_40px_-28px_rgba(209,0,48,.6)]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft"><Icone d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" cor="#d10030" /></span>
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong">Simulado real</span>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold">Prova completa</h3>
                    <p className="text-[15px] text-ink-2">Simule o dia da prova, com todos os blocos e tempo real.</p>
                    <ul className="flex flex-col gap-2 text-[15px]">
                      <li>📖 {completa.qtd_questoes} questões de todos os blocos</li>
                      <li>⏱ {duracao(completa.tempo_min)}</li>
                      <li>📊 Resultado separado por bloco</li>
                    </ul>
                    <form action={iniciarSimulado} className="mt-auto">
                      <input type="hidden" name="simulado_id" value={completa.id} />
                      <input type="hidden" name="aula_id" value={completa.aula} />
                      <button className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Iniciar prova completa <Arrow /></button>
                    </form>
                  </div>
                )}
              </div>
            </section>

            {algumBloco && (
              <section id="blocos" aria-labelledby="titulo-blocos" className="flex scroll-mt-6 flex-col gap-5">
                <div className="text-center">
                  <h2 id="titulo-blocos" className="font-display text-2xl font-extrabold">Escolha o bloco</h2>
                  <p className="text-[15px] text-ink-2">Cada simulado sorteia questões novas do bloco escolhido.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {blocos.map((b) => (
                    <div key={b.n} className={`flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6 ${b.sim ? "" : "opacity-60"}`}>
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: b.fundo }}><Icone d={b.icone} cor={b.cor} /></span>
                        <div className="flex flex-col gap-1">
                          <span className="self-start rounded-full border border-line px-2.5 py-0.5 font-display text-xs font-bold tracking-[.06em]">BLOCO {b.n}</span>
                          <h3 className="font-display text-xl font-extrabold">{b.titulo}</h3>
                          <p className="text-[15px] text-ink-2">{b.desc}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#eceef3] pt-4">
                        <span className="text-sm text-muted">{b.sim ? `📖 ${b.sim.qtd_questoes} questões · ⏱ ${duracao(b.sim.tempo_min)}` : "Em breve"}</span>
                        {b.sim && (
                          <form action={iniciarSimulado}>
                            <input type="hidden" name="simulado_id" value={b.sim.id} />
                            <input type="hidden" name="aula_id" value={b.sim.aula} />
                            <button aria-label={`Iniciar simulado do bloco ${b.n}: ${b.titulo}`} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">Iniciar <Arrow /></button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
