import type { Metadata } from "next";
import Link from "next/link";
import { bloquearUsuario, excluirUsuario, liberarAnac } from "@/app/crew-actions";
import { Titulo } from "@/components/admin-ui";
import { Barras, Distribuicao, Funil, LinhaNota, Variacao } from "@/components/graficos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Simulado ANAC" };

type Painel = {
  com_acesso: number; para_todos: boolean; elegiveis?: number; fizeram: number; ativos_7d: number; em_andamento: number;
  tentativas: number; media: number | null; aprovacao: number | null; tempo_questao?: number | null;
  semana?: { entregues: number; entregues_ant: number; media: number | null; media_ant: number | null; alunos: number; alunos_ant: number };
  por_dia?: { dia: string; entregues: number; media: number | null }[];
  semanas?: { semana: string; entregues: number; media: number | null }[];
  distribuicao?: { faixa: number; n: number }[];
  funil?: { elegiveis: number; comecaram: number; entregaram: number; aprovados: number };
  por_simulado?: { origem: string; titulo: string; iniciadas: number; entregues: number; abandonadas: number; media: number | null; aprovacao: number | null; minutos: number | null }[];
  atencao?: { id: string; nome: string | null; whatsapp: string | null; tentativas: number | null; media: number | null; ultima: string | null; motivo: string }[];
  top10: { id: string; nome: string | null; email: string | null; tentativas: number; media: number; melhor: number; ultima: string; tendencia?: number | null }[];
  materias: { materia: string; respondidas: number; acertos: number; pct: number }[];
  dificeis: { id: string; enunciado: string; materia: string; respondidas: number; pct: number }[];
};
type Aluno = {
  id: string; nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; is_admin: boolean;
  tem_acesso: boolean; bloqueado: boolean; tentativas: number; media: number | null; ultima: string | null; cadastro: string;
};

const FILTROS = [
  { k: "acesso", rotulo: "Com acesso" },
  { k: "fizeram", rotulo: "Fizeram simulados" },
  { k: "bloqueados", rotulo: "Bloqueados" },
  { k: "todos", rotulo: "Todos os cadastros" },
] as const;

const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");
const tel = (t: string | null) => {
  const m = t?.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : t ?? "";
};
const corNota = (n: number) => (n >= 70 ? "text-[#0f6b3a]" : n >= 50 ? "text-[#8a4b00]" : "text-brand-strong");

const NOME_SIM: Record<string, string> = {
  "cc-anac-seguranca": "Bloco 1 · Segurança e Emergência",
  "cc-anac-legislacao": "Bloco 2 · Legislação Aeronáutica",
  "cc-anac-socorros": "Bloco 3 · Primeiros Socorros",
  "cc-anac-tecnicos": "Bloco 4 · Conhecimentos Técnicos",
  "cc-anac-completo": "Prova completa",
};
const diaMes = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const segs = (s: number | null | undefined) => (!s ? "—" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${s % 60}s`);

function Kpi({ rotulo, valor, children }: { rotulo: string; valor: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-[1_1_170px] flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4">
      <span className="text-[13px] font-semibold text-muted">{rotulo}</span>
      <span className="font-display text-[30px] leading-tight font-extrabold">{valor}</span>
      {children}
    </div>
  );
}

function Bloco({ titulo, sub, children, className = "" }: { titulo: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-[20px] border border-line bg-white p-5 md:p-6 ${className}`}>
      <div>
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        {sub && <p className="text-[14px] text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function AdminAnac({ searchParams }: { searchParams: Promise<{ f?: string; q?: string; ok?: string }> }) {
  const sp = await searchParams;
  const filtro = FILTROS.some((x) => x.k === sp.f) ? sp.f! : "acesso";
  const busca = (sp.q ?? "").trim().slice(0, 80);
  const { supabase, user } = await getUser();

  const [painelRes, alunosRes] = await Promise.all([
    supabase.rpc("admin_anac_painel"),
    supabase.rpc("admin_anac_alunos", { p_filtro: busca ? "todos" : filtro, p_busca: busca }),
  ]);

  if (painelRes.error) {
    return (
      <>
        <Titulo>Simulado ANAC</Titulo>
        <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">
          Falta rodar o SQL <strong>0016_painel_anac.sql</strong> no Supabase para ativar este painel.
        </p>
      </>
    );
  }
  const p = painelRes.data as Painel;
  const alunos = (alunosRes.data ?? []) as Aluno[];
  const aqui = `/admin/anac?${new URLSearchParams({ ...(busca ? { q: busca } : { f: filtro }) })}`;
  const sem = p.semana;
  const minima = 70;
  const porDia = p.por_dia ?? [];
  const entregues30 = porDia.reduce((s, d) => s + d.entregues, 0);
  const materiasAsc = [...p.materias].sort((a, b) => a.pct - b.pct);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Quem está treinando e como estão indo nos Simulados ANAC.">Simulado ANAC</Titulo>
        {!p.semana && <span className="rounded-full bg-[#fff3e0] px-3 py-1.5 text-sm font-semibold text-[#8a4b00]">Rode o SQL 0017 para ver os gráficos</span>}
      </div>

      <p className="rounded-2xl bg-[#e5f6ec] px-5 py-4 text-[15px] text-[#0f6b3a]">Os Simulados ANAC são <strong>grátis para qualquer pessoa cadastrada</strong> (página pública <a href="/simulados-anac" target="_blank" className="font-semibold underline">/simulados-anac</a>). A lista abaixo serve para acompanhar quem está treinando e bloquear contas, se precisar.</p>

      <div className="flex flex-wrap gap-3">
        <Kpi rotulo="Alunos ativos (7 dias)" valor={sem?.alunos ?? p.ativos_7d}>
          {sem && <Variacao atual={sem.alunos} anterior={sem.alunos_ant} />}
        </Kpi>
        <Kpi rotulo="Simulados entregues (7 dias)" valor={sem?.entregues ?? "—"}>
          {sem && <Variacao atual={sem.entregues} anterior={sem.entregues_ant} />}
        </Kpi>
        <Kpi rotulo="Média (7 dias)" valor={sem?.media != null ? `${sem.media}%` : "—"}>
          {sem && <Variacao atual={sem.media} anterior={sem.media_ant} sufixo=" pts" />}
        </Kpi>
        <Kpi rotulo="Média geral" valor={p.media != null ? `${p.media}%` : "—"}>
          <span className="text-[13px] text-muted">{p.tentativas} entregues · {p.aprovacao ?? 0}% aprovados</span>
        </Kpi>
        <Kpi rotulo="Fazendo agora" valor={p.em_andamento}>
          <span className="text-[13px] text-muted">tempo médio por questão: {segs(p.tempo_questao)}</span>
        </Kpi>
      </div>

      {p.semana && (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Bloco titulo="Simulados entregues por dia" sub={`Últimos 30 dias · ${entregues30} no total. Passe o mouse nas barras.`}>
              <Barras
                rotuloA11y={`Simulados entregues por dia nos últimos 30 dias, total ${entregues30}`}
                dados={porDia.map((d) => ({
                  rotulo: diaMes(d.dia),
                  valor: d.entregues,
                  dica: `${diaMes(d.dia)}: ${d.entregues} ${d.entregues === 1 ? "simulado" : "simulados"}${d.media != null ? ` · média ${d.media}%` : ""}`,
                }))}
              />
            </Bloco>
            <Bloco titulo="Média semanal das notas" sub="Últimas 12 semanas, com a nota mínima de aprovação.">
              <LinhaNota
                minima={minima}
                rotuloA11y="Média semanal das notas nas últimas 12 semanas"
                dados={(p.semanas ?? []).map((s) => ({
                  rotulo: diaMes(s.semana),
                  valor: s.media,
                  dica: `Semana de ${diaMes(s.semana)}: ${s.media == null ? "sem simulados" : `média ${s.media}% em ${s.entregues} ${s.entregues === 1 ? "simulado" : "simulados"}`}`,
                }))}
              />
            </Bloco>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Bloco titulo="Distribuição das notas" sub="Quantos simulados terminaram em cada faixa de nota. Verde = aprovado.">
              <Distribuicao dados={p.distribuicao ?? []} minima={minima} />
            </Bloco>
            {p.funil && (
              <Bloco titulo="Funil dos alunos" sub="De quem pode fazer até quem já foi aprovado pelo menos uma vez.">
                <Funil etapas={[
                  { rotulo: "Podem fazer", valor: p.funil.elegiveis, detalhe: p.para_todos ? "todos os alunos ativos" : "alunos adicionados" },
                  { rotulo: "Começaram um simulado", valor: p.funil.comecaram },
                  { rotulo: "Entregaram um simulado", valor: p.funil.entregaram },
                  { rotulo: "Já foram aprovados", valor: p.funil.aprovados, detalhe: `nota de ${minima}% ou mais em algum simulado` },
                ]} />
              </Bloco>
            )}
          </div>

          {(p.por_simulado ?? []).length > 0 && (
            <Bloco titulo="Por simulado" sub="Abandonados = começaram e o tempo acabou sem entregar.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[15px]">
                  <thead className="border-b border-line text-sm text-muted">
                    <tr><th className="py-2 pr-3 font-semibold">Simulado</th><th className="p-2 font-semibold">Entregues</th><th className="p-2 font-semibold">Média</th><th className="p-2 font-semibold">Aprovação</th><th className="p-2 font-semibold">Tempo médio</th><th className="p-2 font-semibold">Abandonados</th></tr>
                  </thead>
                  <tbody>
                    {[...(p.por_simulado ?? [])].sort((a, b) => Object.keys(NOME_SIM).indexOf(a.origem) - Object.keys(NOME_SIM).indexOf(b.origem)).map((s) => (
                      <tr key={s.origem} className="border-b border-[#eceef3] last:border-0">
                        <td className="py-2.5 pr-3 font-semibold">{NOME_SIM[s.origem] ?? s.titulo}</td>
                        <td className="p-2">{s.entregues}</td>
                        <td className="p-2">
                          {s.media != null ? (
                            <span className="flex items-center gap-2">
                              <strong className={`w-11 ${corNota(s.media)}`}>{s.media}%</strong>
                              <span className="h-2 w-24 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-2 rounded-full" style={{ width: `${s.media}%`, background: s.media >= 70 ? "#2e9d5b" : "#313950" }} /></span>
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-2">{s.aprovacao != null ? `${s.aprovacao}%` : "—"}</td>
                        <td className="p-2">{s.minutos != null ? `${s.minutos} min` : "—"}</td>
                        <td className="p-2">{s.abandonadas ? <span className="font-semibold text-[#8a4b00]">{s.abandonadas}</span> : "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Bloco>
          )}
        </>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Bloco titulo="10 melhores alunos" sub="Pela média das notas. A seta mostra se as 3 últimas notas subiram ou caíram.">
          {p.top10.length ? (
            <ol className="flex flex-col divide-y divide-[#eceef3]">
              {p.top10.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${i < 3 ? "bg-navy text-white" : "bg-soft text-navy"}`}>{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{a.nome ?? "Sem nome"}</span>
                    <span className="truncate text-[13px] text-muted">{a.tentativas} {a.tentativas === 1 ? "simulado" : "simulados"} · melhor {a.melhor}% · último {data(a.ultima)}</span>
                  </span>
                  {a.tendencia != null && a.tendencia !== 0 && (
                    <span className={`text-[13px] font-semibold ${a.tendencia > 0 ? "text-[#0f6b3a]" : "text-brand-deep"}`} title="Últimas 3 notas comparadas às anteriores">
                      {a.tendencia > 0 ? "▲" : "▼"} {Math.abs(a.tendencia)}
                    </span>
                  )}
                  <strong className={`w-14 text-right font-display text-xl ${corNota(a.media)}`}>{a.media}%</strong>
                </li>
              ))}
            </ol>
          ) : <p className="text-ink-2">Ainda ninguém entregou um simulado.</p>}
        </Bloco>

        <Bloco titulo="Desempenho por matéria" sub="Percentual de acerto em todas as respostas. Da mais difícil para a mais fácil.">
          {materiasAsc.length ? (
            <ul className="flex flex-col gap-3.5">
              {materiasAsc.map((m, i) => (
                <li key={m.materia} className="flex flex-col gap-1">
                  <span className="flex items-baseline justify-between gap-3 text-[15px]">
                    <span className="font-semibold">
                      {m.materia}
                      {materiasAsc.length > 1 && i === 0 && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-deep">mais erram</span>}
                      {materiasAsc.length > 1 && i === materiasAsc.length - 1 && <span className="ml-2 rounded-full bg-[#e5f6ec] px-2 py-0.5 text-xs font-bold text-[#0f6b3a]">mais acertam</span>}
                    </span>
                    <span className={`font-display font-bold ${corNota(m.pct)}`}>{m.pct}%</span>
                  </span>
                  <span className="relative h-3 rounded-full bg-[#eceef3]" aria-hidden="true">
                    <span className="block h-3 rounded-full" style={{ width: `${m.pct}%`, background: m.pct >= 70 ? "#2e9d5b" : "#313950" }} />
                    <span className="absolute top-[-3px] h-[18px] w-0.5 bg-[#0f6b3a]" style={{ left: "70%" }} />
                  </span>
                  <span className="text-[13px] text-muted">{m.acertos.toLocaleString("pt-BR")} acertos em {m.respondidas.toLocaleString("pt-BR")} respostas</span>
                </li>
              ))}
              <li className="text-[13px] text-muted">A marca verde em cada barra é a nota mínima (70%).</li>
            </ul>
          ) : <p className="text-ink-2">Os números aparecem quando os alunos entregarem simulados.</p>}
        </Bloco>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {(p.atencao ?? []).length > 0 && (
          <Bloco titulo="Precisam de atenção" sub="Média abaixo de 50%, parados há 14 dias ou que nunca começaram.">
            <ul className="flex flex-col divide-y divide-[#eceef3]">
              {(p.atencao ?? []).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{a.nome ?? "Sem nome"}</span>
                    <span className="text-[13px] text-muted">
                      {a.tentativas ? `${a.tentativas} ${a.tentativas === 1 ? "simulado" : "simulados"} · média ${a.media}% · último ${data(a.ultima)}` : "nenhum simulado entregue"}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${a.motivo === "média baixa" ? "bg-brand-soft text-brand-deep" : "bg-[#fff3e0] text-[#8a4b00]"}`}>{a.motivo}</span>
                  {a.whatsapp && (
                    <a href={`https://wa.me/${a.whatsapp.replace("+", "")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-line px-3 text-sm font-semibold hover:bg-soft">WhatsApp</a>
                  )}
                </li>
              ))}
            </ul>
          </Bloco>
        )}

        {p.dificeis.length > 0 && (
          <Bloco titulo="Questões que mais erram" sub="Vale revisar: pode ser um tema difícil ou um gabarito com problema.">
            <ul className="flex flex-col divide-y divide-[#eceef3]">
              {p.dificeis.map((q) => (
                <li key={q.id} className="flex items-center gap-3 py-2.5">
                  <strong className={`w-12 shrink-0 font-display text-lg ${corNota(q.pct)}`}>{q.pct}%</strong>
                  <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent("/admin/questoes?banco=anac")}`} className="min-w-0 flex-1 text-navy hover:text-brand-strong">
                    <span className="line-clamp-1 font-semibold">{q.enunciado}</span>
                    <span className="text-[13px] text-muted">{q.materia} · {q.respondidas} respostas</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Bloco>
        )}
      </div>

      <section id="alunos" className="flex scroll-mt-6 flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold">Alunos</h2>
        {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">{sp.ok}</p>}

        <form role="search" action="/admin/anac#alunos" className="flex flex-wrap gap-2 rounded-[20px] border border-line bg-white p-4">
          <label htmlFor="busca-aluno" className="w-full text-sm font-semibold text-navy">Adicionar ou encontrar aluno</label>
          <input id="busca-aluno" name="q" defaultValue={busca} placeholder="Nome, e-mail ou WhatsApp" className="min-h-12 min-w-0 flex-[1_1_280px] rounded-xl border border-[#c9cedb] px-4 text-[15px]" />
          <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-6 font-semibold text-white">Buscar</button>
          {busca && <Link href="/admin/anac#alunos" className="inline-flex min-h-12 items-center px-3 font-semibold">Limpar</Link>}
        </form>

        {!busca && (
          <nav aria-label="Filtrar alunos" className="flex gap-2 overflow-x-auto pb-1">
            {FILTROS.map((x) => (
              <Link
                key={x.k}
                href={`/admin/anac?f=${x.k}#alunos`}
                aria-current={x.k === filtro ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border-2 px-4 text-sm font-semibold ${x.k === filtro ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"}`}
              >
                {x.rotulo}
              </Link>
            ))}
          </nav>
        )}

        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[920px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="p-3 font-semibold">Aluno</th>
                <th className="p-3 font-semibold">Simulados</th>
                <th className="p-3 font-semibold">Média</th>
                <th className="p-3 font-semibold">Situação</th>
                <th className="p-3 font-semibold"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((a) => {
                const eu = a.id === user?.id;
                return (
                  <tr key={a.id} className={`border-b border-[#eceef3] align-top last:border-0 ${a.bloqueado ? "bg-[#fff8f9]" : ""}`}>
                    <td className="p-3">
                      <span className="block font-semibold">{a.nome ?? "Sem nome"}{a.is_admin && <span className="ml-2 rounded-full bg-soft px-2 py-0.5 text-xs text-navy">admin</span>}</span>
                      <span className="block text-[13px] text-muted">{[a.email, tel(a.whatsapp)].filter(Boolean).join(" · ")}</span>
                      {a.escola && <span className="block text-[13px] text-muted">{a.escola}</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">{a.tentativas}<span className="block text-[13px] text-muted">último {data(a.ultima)}</span></td>
                    <td className="p-3">{a.media != null ? <strong className={corNota(Number(a.media))}>{a.media}%</strong> : "—"}</td>
                    <td className="p-3">
                      <span className="flex flex-col items-start gap-1">
                        {a.bloqueado && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-deep">Bloqueado</span>}
                        {a.tem_acesso
                          ? <span className="rounded-full bg-[#e5f6ec] px-2.5 py-1 text-xs font-semibold text-[#0f6b3a]">Com acesso</span>
                          : <span className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-xs font-semibold text-ink-2">{p.para_todos ? "Acesso geral" : "Sem acesso"}</span>}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <form action={liberarAnac}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="liberar" value={String(!a.tem_acesso)} />
                          <input type="hidden" name="voltar" value={aqui} />
                          <button className={`min-h-10 cursor-pointer rounded-full px-3.5 text-sm font-semibold ${a.tem_acesso ? "border border-line text-ink-2 hover:bg-soft" : "bg-[#0f6b3a] text-white hover:bg-[#0b5730]"}`}>
                            {a.tem_acesso ? "Remover acesso" : "Liberar acesso"}
                          </button>
                        </form>
                        {!eu && !a.is_admin && (
                          <>
                            <form action={bloquearUsuario}>
                              <input type="hidden" name="id" value={a.id} />
                              <input type="hidden" name="bloquear" value={String(!a.bloqueado)} />
                              <input type="hidden" name="voltar" value={aqui} />
                              <button className={`min-h-10 cursor-pointer rounded-full px-3.5 text-sm font-semibold ${a.bloqueado ? "bg-navy text-white" : "border border-brand-line text-brand-deep hover:bg-brand-soft"}`}>
                                {a.bloqueado ? "Desbloquear" : "Bloquear"}
                              </button>
                            </form>
                            <details className="relative">
                              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center rounded-full px-3 text-sm font-semibold text-muted hover:bg-soft hover:text-brand-deep">Excluir</summary>
                              <form action={excluirUsuario} className="absolute right-0 z-10 mt-2 flex w-72 flex-col gap-3 rounded-xl border border-line bg-white p-4 text-left shadow-[0_18px_40px_-16px_rgba(35,42,61,.45)]">
                                <input type="hidden" name="id" value={a.id} />
                                <input type="hidden" name="voltar" value={aqui} />
                                <p className="text-[14px] text-ink-2">Apaga a conta de <strong>{a.nome ?? "este aluno"}</strong>, com progresso e notas. Não dá para desfazer.</p>
                                <label className="flex items-center gap-2 text-[14px] font-semibold">
                                  <input type="checkbox" name="confirmo" required className="h-5 w-5 accent-brand-deep" /> Entendi, pode excluir
                                </label>
                                <button className="min-h-10 cursor-pointer rounded-full bg-brand-deep px-4 text-sm font-semibold text-white">Excluir definitivamente</button>
                              </form>
                            </details>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!alunos.length && (
                <tr><td colSpan={5} className="p-8 text-center text-ink-2">
                  {busca ? "Nenhum cadastro encontrado com essa busca." : filtro === "acesso" ? "Nenhum aluno adicionado ainda. Busque pelo nome, e-mail ou WhatsApp acima para liberar." : "Ninguém aqui ainda."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-muted">Bloquear impede o aluno de entrar na área do aluno e encerra simulados em andamento. Dá para desbloquear depois.</p>
      </section>
    </>
  );
}
