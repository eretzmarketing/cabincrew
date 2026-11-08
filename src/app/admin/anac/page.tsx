import type { Metadata } from "next";
import Link from "next/link";
import { bloquearUsuario, excluirUsuario, liberarAnac } from "@/app/crew-actions";
import { Card, Chave, Numero, Titulo } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Simulado ANAC" };

type Painel = {
  com_acesso: number; para_todos: boolean; fizeram: number; ativos_7d: number; em_andamento: number;
  tentativas: number; media: number | null; aprovacao: number | null;
  top10: { id: string; nome: string | null; email: string | null; tentativas: number; media: number; melhor: number; ultima: string }[];
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
  const maisAcerta = p.materias.slice(0, 2);
  const maisErra = [...p.materias].reverse().slice(0, 2);

  return (
    <>
      <Titulo sub="Quem está treinando, como estão indo e quem pode acessar os Simulados ANAC.">Simulado ANAC</Titulo>

      <Card>
        <Chave
          chave="anac_para_todos"
          ligado={p.para_todos}
          titulo="Liberar para todos os alunos"
          descricao={p.para_todos
            ? "Ligado: qualquer aluno do Crew Select faz os Simulados ANAC (menos os bloqueados)."
            : "Desligado: só os alunos que você adicionar abaixo fazem os Simulados ANAC."}
        />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="Alunos com acesso" valor={p.para_todos ? "Todos" : p.com_acesso} detalhe={p.para_todos ? "liberado para todos" : "adicionados por você"} />
        <Numero rotulo="Fizeram simulados" valor={p.fizeram} detalhe={`${p.ativos_7d} nos últimos 7 dias`} />
        <Numero rotulo="Fazendo agora" valor={p.em_andamento} detalhe="simulados em andamento" />
        <Numero rotulo="Média das notas" valor={p.media != null ? `${p.media}%` : "—"} detalhe={`${p.tentativas} ${p.tentativas === 1 ? "simulado entregue" : "simulados entregues"}`} />
        <Numero rotulo="Aprovação" valor={p.aprovacao != null ? `${p.aprovacao}%` : "—"} detalhe="tentativas com nota mínima" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-bold">10 melhores alunos</h2>
          {p.top10.length ? (
            <ol className="flex flex-col divide-y divide-[#eceef3]">
              {p.top10.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${i < 3 ? "bg-navy text-white" : "bg-soft text-navy"}`}>{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{a.nome ?? "Sem nome"}</span>
                    <span className="truncate text-[13px] text-muted">{a.tentativas} {a.tentativas === 1 ? "simulado" : "simulados"} · melhor {a.melhor}% · último {data(a.ultima)}</span>
                  </span>
                  <strong className={`font-display text-xl ${corNota(a.media)}`}>{a.media}%</strong>
                </li>
              ))}
            </ol>
          ) : <p className="text-ink-2">Ainda ninguém entregou um simulado.</p>}
        </Card>

        <Card>
          <h2 className="font-display text-xl font-bold">Desempenho por matéria</h2>
          {p.materias.length ? (
            <>
              <ul className="flex flex-col gap-3">
                {p.materias.map((m) => (
                  <li key={m.materia} className="flex flex-col gap-1">
                    <span className="flex justify-between gap-3 text-[15px]">
                      <span className="font-semibold">{m.materia}</span>
                      <span className={`font-display font-bold ${corNota(m.pct)}`}>{m.pct}%</span>
                    </span>
                    <span className="h-2.5 rounded-full bg-[#eceef3]" aria-hidden="true">
                      <span className={`block h-2.5 rounded-full ${m.pct >= 70 ? "bg-[#2e9d5b]" : m.pct >= 50 ? "bg-[#e09a2c]" : "bg-brand-strong"}`} style={{ width: `${m.pct}%` }} />
                    </span>
                    <span className="text-[13px] text-muted">{m.acertos.toLocaleString("pt-BR")} acertos em {m.respondidas.toLocaleString("pt-BR")} respostas</span>
                  </li>
                ))}
              </ul>
              {p.materias.length > 1 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[14px] text-[#0f6b3a]"><strong>Mais acertam:</strong> {maisAcerta.map((m) => m.materia).join(", ")}</p>
                  <p className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] text-brand-deep"><strong>Mais erram:</strong> {maisErra.map((m) => m.materia).join(", ")}</p>
                </div>
              )}
            </>
          ) : <p className="text-ink-2">Os números aparecem quando os alunos entregarem simulados.</p>}
        </Card>
      </div>

      {p.dificeis.length > 0 && (
        <Card>
          <h2 className="font-display text-xl font-bold">Questões que mais erram</h2>
          <p className="text-[15px] text-ink-2">Vale revisar: pode ser um tema difícil ou um gabarito com problema.</p>
          <ul className="flex flex-col divide-y divide-[#eceef3]">
            {p.dificeis.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <strong className={`w-14 font-display text-lg ${corNota(q.pct)}`}>{q.pct}%</strong>
                <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent("/admin/questoes?banco=anac")}`} className="min-w-0 flex-1 text-navy hover:text-brand-strong">
                  <span className="line-clamp-1 font-semibold">{q.enunciado}</span>
                  <span className="text-[13px] text-muted">{q.materia} · {q.respondidas} respostas</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

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
