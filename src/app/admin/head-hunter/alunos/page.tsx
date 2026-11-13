import type { Metadata } from "next";
import Link from "next/link";
import { Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import {
  SITUACOES, TOTAL_INGLES, diasParaMeta, linkWhatsapp, mensagemSugerida, nomeAluno, nomeCompanhia, quando, riscos, situacao,
  type LinhaAluno, type Situacao,
} from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Alunos do Head Hunter" };
export const dynamic = "force-dynamic";

const FILTROS: { id: string; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "risco", rotulo: "Em risco" },
  { id: "ativo", rotulo: "Ativos" },
  { id: "esfriando", rotulo: "Esfriando" },
  { id: "parado", rotulo: "Parados" },
  { id: "nunca", rotulo: "Não começaram" },
];
const ORDENS: { id: string; rotulo: string }[] = [
  { id: "ultima", rotulo: "Última atividade" },
  { id: "pontos", rotulo: "Pontos da semana" },
  { id: "meta", rotulo: "Data da seleção" },
  { id: "treino", rotulo: "Média nos treinos (menor primeiro)" },
  { id: "cadastro", rotulo: "Cadastro mais recente" },
];
const LIMITE = 300;

export default async function AlunosHeadHunterPage({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; o?: string }> }) {
  const { q = "", s = "todos", o = "ultima" } = await searchParams;
  const { supabase } = await getUser();
  const { data, error } = await supabase.rpc("admin_hh_alunos", { p_busca: q.trim().slice(0, 60) });
  const todos = (data ?? []) as LinhaAluno[];

  const cont: Record<Situacao | "risco", number> = { ativo: 0, esfriando: 0, parado: 0, nunca: 0, risco: 0 };
  for (const l of todos) { cont[situacao(l)]++; if (riscos(l).length) cont.risco++; }

  let lista = todos.filter((l) => (s === "todos" ? true : s === "risco" ? riscos(l).length > 0 : situacao(l) === s));
  const ord: Record<string, (a: LinhaAluno, b: LinhaAluno) => number> = {
    ultima: (a, b) => (b.ultima ?? "").localeCompare(a.ultima ?? ""),
    pontos: (a, b) => b.pontos_semana - a.pontos_semana,
    meta: (a, b) => (diasParaMeta(a) ?? 9999) - (diasParaMeta(b) ?? 9999),
    treino: (a, b) => (a.media_treino_30 ?? 999) - (b.media_treino_30 ?? 999),
    cadastro: (a, b) => b.cadastro.localeCompare(a.cadastro),
  };
  lista = [...lista].sort(ord[o] ?? ord.ultima);
  const total = lista.length;
  lista = lista.slice(0, LIMITE);
  const link = (p: Record<string, string>) => `/admin/head-hunter/alunos?${new URLSearchParams({ ...(q ? { q } : {}), s, o, ...p })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Quem está estudando, quem parou e quem precisa de um empurrãozinho. Clique no nome para ver a jornada completa.">Alunos do Head Hunter</Titulo>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/head-hunter/alunos/csv" download className={btnSecundario}>⬇ Exportar (CSV)</a>
          <Link href="/admin/head-hunter/alunos/adicionar" className={btnPrimario}>+ Adicionar aluno</Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0035_painel_alunos.sql</strong> no Supabase para ativar este painel.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Numero rotulo="Alunos" valor={todos.length} detalhe={q ? "na busca" : "cadastrados"} />
            <Numero rotulo="Ativos" valor={cont.ativo} detalhe="estudaram nos últimos 2 dias" />
            <Numero rotulo="Esfriando" valor={cont.esfriando} detalhe="3 a 6 dias sem estudar" />
            <Numero rotulo="Parados" valor={cont.parado} detalhe="7 dias ou mais" />
            <Numero rotulo="Em risco" valor={cont.risco} detalhe="seleção perto ou notas baixas" />
          </div>

          <form className="flex flex-wrap gap-2" role="search">
            <input type="hidden" name="s" value={s} />
            <input type="hidden" name="o" value={o} />
            <label htmlFor="busca" className="sr-only">Buscar aluno</label>
            <input id="busca" name="q" defaultValue={q} placeholder="Buscar por nome, apelido, e-mail ou WhatsApp" className="min-h-12 flex-[1_1_280px] rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px]" />
            <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Buscar</button>
            {q && <Link href={link({ q: "" })} className="inline-flex min-h-12 items-center px-3 font-semibold">Limpar</Link>}
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
              {FILTROS.map((f) => {
                const n = f.id === "todos" ? todos.length : cont[f.id as Situacao | "risco"];
                const ativo = s === f.id;
                return (
                  <Link key={f.id} href={link({ s: f.id })} aria-current={ativo ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold ${ativo ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
                    {f.rotulo} <span className={ativo ? "text-[#c9cedb]" : "text-muted"}>{n}</span>
                  </Link>
                );
              })}
            </nav>
            <form className="flex items-center gap-2">
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="s" value={s} />
              <label htmlFor="ordem" className="text-sm font-semibold">Ordenar por</label>
              <select id="ordem" name="o" defaultValue={o} className="min-h-10 rounded-xl border border-[#c9cedb] bg-white px-3 text-sm">
                {ORDENS.map((x) => <option key={x.id} value={x.id}>{x.rotulo}</option>)}
              </select>
              <button className="min-h-10 cursor-pointer rounded-xl border border-navy px-3 text-sm font-semibold text-navy">Aplicar</button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[940px] text-left text-[14px]">
              <thead className="border-b border-line text-[13px] text-muted">
                <tr>
                  <th className="p-3 font-semibold">Aluno</th>
                  <th className="p-3 font-semibold">Situação</th>
                  <th className="p-3 font-semibold">Alvo</th>
                  <th className="p-3 font-semibold" title="Dias com estudo nos últimos 14 dias">Dias ativos (14d)</th>
                  <th className="p-3 font-semibold">Aulas</th>
                  <th className="p-3 font-semibold" title="Quantidade de treinos e média dos últimos 30 dias">Treinos</th>
                  <th className="p-3 font-semibold" title="Simulados no modo Prova real: melhor nota">Prova real</th>
                  <th className="p-3 font-semibold">Inglês</th>
                  <th className="p-3 font-semibold">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((l) => {
                  const st = situacao(l);
                  const rs = riscos(l);
                  const faltam = diasParaMeta(l);
                  const wa = linkWhatsapp(l.whatsapp, mensagemSugerida(l));
                  return (
                    <tr key={l.id} className="border-b border-[#eceef3] align-top last:border-0">
                      <td className="p-3">
                        <Link href={`/admin/head-hunter/alunos/${l.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{nomeAluno(l)}</Link>
                        {l.bloqueado && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-deep">bloqueado</span>}
                        <span className="block text-[13px] text-muted">{l.email ?? ""}</span>
                        {rs.length > 0 && <span className="mt-1 block text-[13px] font-semibold text-brand-strong">⚠ {rs.join(" · ")}</span>}
                        {wa && <a href={wa} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex min-h-9 items-center rounded-full border border-[#25d366] px-3 text-[13px] font-semibold text-[#128c4a] hover:bg-[#e9fbf0]">WhatsApp</a>}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${SITUACOES[st].cor}`}>{SITUACOES[st].rotulo}</span>
                        <span className="block pt-1 text-[13px] text-muted">{quando(l.ultima)}</span>
                      </td>
                      <td className="p-3">
                        {nomeCompanhia(l.companhia) ?? <span className="text-muted">sem check-in</span>}
                        {faltam !== null && <span className={`block text-[13px] ${faltam < 0 ? "text-muted" : faltam <= 30 ? "font-semibold text-brand-strong" : "text-muted"}`}>{faltam < 0 ? "data passou" : `seleção em ${faltam} d`}</span>}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold">{l.dias_14}</span>
                        <span className="mt-1 block h-1.5 w-20 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-navy" style={{ width: `${(l.dias_14 / 14) * 100}%` }} /></span>
                      </td>
                      <td className="p-3">{l.aulas}</td>
                      <td className="p-3">{l.treinos}{l.media_treino_30 !== null && <span className={`block text-[13px] ${l.media_treino_30 >= 80 ? "text-[#0f6b3a]" : "text-muted"}`}>média {l.media_treino_30}%</span>}</td>
                      <td className="p-3">{l.provas ? <>{l.melhor_prova}%<span className="block text-[13px] text-muted">{l.provas} feita{l.provas > 1 ? "s" : ""}</span></> : "—"}</td>
                      <td className="p-3">{l.ingles}/{TOTAL_INGLES}</td>
                      <td className="p-3 font-semibold">{l.pontos_semana}</td>
                    </tr>
                  );
                })}
                {!lista.length && <tr><td colSpan={9} className="p-6 text-center text-ink-2">Nenhum aluno nesta lista.</td></tr>}
              </tbody>
            </table>
          </div>
          {total > LIMITE && <p className="text-sm text-muted">Mostrando {LIMITE} de {total}. Use a busca, os filtros ou exporte o CSV para ver todos.</p>}
          <p className="text-sm text-muted">O botão de WhatsApp abre uma mensagem pronta conforme a situação do aluno; você pode editar antes de enviar.</p>
        </>
      )}
    </>
  );
}
