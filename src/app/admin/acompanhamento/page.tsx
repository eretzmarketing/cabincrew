import type { Metadata } from "next";
import Link from "next/link";
import AcoesAluno from "@/components/AcoesAluno";
import AvatarAluno from "@/components/AvatarAluno";
import { Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { getConfig } from "@/lib/config";
import { cursoIdioma, infoCursos } from "@/lib/cursos-dados";
import { ehProdutoIdioma } from "@/lib/idioma-conteudo";
import {
  SITUACOES, diasParaMeta, mensagemCurso, mensagemSugerida, nomeAluno, nomeCompanhia, quando, riscos, riscosCurso, situacao,
  type LinhaAluno, type LinhaCurso, type Situacao,
} from "@/lib/painel-alunos";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acompanhamento dos alunos" };
export const dynamic = "force-dynamic";

const FILTROS: { id: string; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "risco", rotulo: "Em risco" },
  { id: "ativo", rotulo: "Ativos" },
  { id: "esfriando", rotulo: "Esfriando" },
  { id: "parado", rotulo: "Parados" },
  { id: "nunca", rotulo: "Não começaram" },
];
const ORDENS_BASE = [
  { id: "ultima", rotulo: "Última atividade" },
  { id: "progresso", rotulo: "Progresso (menor primeiro)" },
  { id: "cadastro", rotulo: "Cadastro mais recente" },
];
const ORDENS_HH = [
  { id: "pontos", rotulo: "Pontos da semana" },
  { id: "meta", rotulo: "Data da seleção" },
  { id: "treino", rotulo: "Média nos treinos (menor primeiro)" },
];
const ACESSO: Record<string, [string, string]> = {
  ativo: ["Acesso ativo", "bg-[#e5f6ec] text-[#0f6b3a]"],
  suspenso: ["Suspenso", "bg-[#fff8e6] text-[#7a5a00]"],
  revogado: ["Removido", "bg-[#eceef3] text-ink-2"],
  concluido: ["Encerrado", "bg-[#eef1ff] text-navy"],
};
const LIMITE = 300;

type Linha = LinhaCurso & { hh: LinhaAluno | null; st: Situacao; rs: string[]; pct: number };

export default async function Acompanhamento({ searchParams }: { searchParams: Promise<{ curso?: string; q?: string; s?: string; o?: string; excluido?: string }> }) {
  const sp = await searchParams;
  const cursos = (await infoCursos()).filter((c) => c.publicado !== false);
  const curso = cursos.find((c) => c.slug === sp.curso) ?? cursos.find((c) => c.slug === "head-hunter") ?? cursos[0];
  const ehHH = curso.slug === "head-hunter";
  const q = (sp.q ?? "").trim().slice(0, 60);
  const s = FILTROS.some((f) => f.id === sp.s) ? sp.s! : "todos";
  const ordens = ehHH ? [...ORDENS_BASE, ...ORDENS_HH] : ORDENS_BASE;
  const o = ordens.some((x) => x.id === sp.o) ? sp.o! : "ultima";

  const { supabase } = await getUser();
  const [{ data, error }, hhRes, idioma, cfg] = await Promise.all([
    supabase.rpc("admin_acompanhamento", { p_curso: curso.slug, p_busca: q }),
    ehHH ? supabase.rpc("admin_hh_alunos", { p_busca: q }) : Promise.resolve({ data: [] }),
    ehProdutoIdioma(curso.slug) ? cursoIdioma(curso.slug) : Promise.resolve(null),
    getConfig(),
  ]);
  const hh = new Map(((hhRes.data ?? []) as LinhaAluno[]).map((l) => [l.id, l]));
  const base = (data ?? []) as LinhaCurso[];
  const total = idioma ? idioma.todas.length : (base[0]?.total_aulas ?? 0);

  const todos: Linha[] = base.map((l) => {
    const h = hh.get(l.id) ?? null;
    const rs = [...(h ? riscos({ ...h, ultima: l.ultima }) : []), ...riscosCurso(l, total)];
    return { ...l, hh: h, st: situacao(l), rs: [...new Set(rs)], pct: total ? Math.min(100, Math.round((l.feitas / total) * 100)) : 0 };
  });
  const cont: Record<Situacao | "risco", number> = { ativo: 0, esfriando: 0, parado: 0, nunca: 0, risco: 0 };
  for (const l of todos) { cont[l.st]++; if (l.rs.length) cont.risco++; }

  let lista = todos.filter((l) => (s === "todos" ? true : s === "risco" ? l.rs.length > 0 : l.st === s));
  const ord: Record<string, (a: Linha, b: Linha) => number> = {
    ultima: (a, b) => (b.ultima ?? "").localeCompare(a.ultima ?? ""),
    progresso: (a, b) => a.pct - b.pct,
    cadastro: (a, b) => b.cadastro.localeCompare(a.cadastro),
    pontos: (a, b) => (b.hh?.pontos_semana ?? 0) - (a.hh?.pontos_semana ?? 0),
    meta: (a, b) => (a.hh ? diasParaMeta(a.hh) ?? 9999 : 9999) - (b.hh ? diasParaMeta(b.hh) ?? 9999 : 9999),
    treino: (a, b) => (a.hh?.media_treino_30 ?? 999) - (b.hh?.media_treino_30 ?? 999),
  };
  lista = [...lista].sort(ord[o]);
  const qtd = lista.length;
  lista = lista.slice(0, LIMITE);
  const link = (p: Record<string, string>) => `/admin/acompanhamento?${new URLSearchParams({ curso: curso.slug, ...(q ? { q } : {}), s, o, ...p })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Quem está estudando, quem parou e quem precisa de um empurrãozinho, curso por curso. O olho abre a ficha; o lápis, os acessos.">Acompanhamento dos alunos</Titulo>
        <div className="flex flex-wrap gap-2">
          {ehHH && <a href="/admin/head-hunter/alunos/csv" download className={btnSecundario}>⬇ Exportar (CSV)</a>}
          <Link href="/admin/usuarios/adicionar" className={btnPrimario}>+ Adicionar aluno</Link>
        </div>
      </div>
      {sp.excluido && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Conta de {sp.excluido} excluída. O registro ficou em <Link href="/admin/contas-excluidas" className="underline">Usuários › Contas excluídas</Link>.</p>}

      <nav aria-label="Curso" className="flex flex-wrap gap-2">
        {cursos.map((c) => {
          const ativo = c.slug === curso.slug;
          return (
            <Link key={c.slug} href={`/admin/acompanhamento?curso=${c.slug}`} aria-current={ativo ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-xl border-2 px-4 font-display text-[14px] font-bold transition ${ativo ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
              {c.titulo}
            </Link>
          );
        })}
      </nav>

      {error ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0072_acompanhamento.sql</strong> no Supabase para ativar este painel.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Numero rotulo="Alunos no curso" valor={todos.length} detalhe={q ? "na busca" : "com acesso ou que já estudaram"} />
            <Numero rotulo="Ativos" valor={cont.ativo} detalhe="estudaram nos últimos 2 dias" />
            <Numero rotulo="Esfriando" valor={cont.esfriando} detalhe="3 a 6 dias sem estudar" />
            <Numero rotulo="Parados" valor={cont.parado} detalhe="7 dias ou mais" />
            <Numero rotulo="Em risco" valor={cont.risco} detalhe={ehHH ? "seleção perto, notas baixas ou parou" : "parou ou o acesso está acabando"} />
          </div>

          <form className="flex flex-wrap gap-2" role="search">
            <input type="hidden" name="curso" value={curso.slug} />
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
            <form className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <input type="hidden" name="curso" value={curso.slug} />
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="s" value={s} />
              <label htmlFor="ordem" className="text-sm font-semibold">Ordenar por</label>
              <select id="ordem" name="o" defaultValue={o} className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#c9cedb] bg-white px-3 text-sm sm:flex-none">
                {ordens.map((x) => <option key={x.id} value={x.id}>{x.rotulo}</option>)}
              </select>
              <button className="min-h-10 cursor-pointer rounded-xl border border-navy px-3 text-sm font-semibold text-navy">Aplicar</button>
            </form>
          </div>

          <ul className="flex flex-col divide-y divide-[#eceef3] rounded-2xl border border-line bg-white">
            {lista.map((l) => {
              const nome = nomeAluno(l);
              const ac = l.acesso_status ? ACESSO[l.acesso_status === "ativo" && l.acesso_expira && Date.parse(l.acesso_expira) < Date.parse(new Date().toISOString()) ? "concluido" : l.acesso_status] : null;
              const cia = l.hh ? nomeCompanhia(l.hh.companhia) : null;
              const meta = l.hh ? diasParaMeta(l.hh) : null;
              const sugestao = l.hh ? mensagemSugerida({ ...l.hh, ultima: l.ultima }) : mensagemCurso(l, curso.titulo);
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <Link href={`/admin/usuarios/${l.id}`} className="flex min-w-0 flex-[1_1_240px] items-center gap-3" aria-label={`Ver ficha de ${nome}`}>
                    <AvatarAluno src={avatarUrl(l.id, l.avatar_em)} nome={nome} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-navy">{nome}{l.bloqueado && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-[11px] font-bold text-brand-deep">BANIDO</span>}</span>
                      <span className="truncate text-[13px] text-muted">{l.email ?? ""}</span>
                    </span>
                  </Link>
                  <span className="flex w-[170px] flex-col">
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${SITUACOES[l.st].cor}`}>{SITUACOES[l.st].rotulo}</span>
                    <span className="pt-0.5 text-[12px] text-muted">{l.rs.length ? <span className="font-semibold text-brand-strong">⚠ {l.rs[0]}</span> : quando(l.ultima)}</span>
                  </span>
                  <span className="flex w-[190px] flex-col gap-1">
                    <span className="text-[13px] text-ink-2">
                      <strong className="text-navy">{l.pct}%</strong> · {l.feitas}/{total} aulas
                      {l.media != null && <> · nota {l.media}</>}
                      {l.hh && l.hh.pontos_semana > 0 && <> · {l.hh.pontos_semana} pts</>}
                    </span>
                    <span className="h-1.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-navy" style={{ width: `${l.pct}%` }} /></span>
                    {(cia || (meta !== null && meta >= 0)) && <span className="text-[12px] text-muted">{cia ?? ""}{cia && meta !== null && meta >= 0 ? " · " : ""}{meta !== null && meta >= 0 ? `seleção em ${meta} dias` : ""}</span>}
                  </span>
                  <span className="w-[110px]">
                    {ac ? <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${ac[1]}`}>{ac[0]}</span>
                      : <span className="text-[12px] text-muted">{cfg.crew_select_aberto ? "liberado para todos" : "sem acesso"}</span>}
                  </span>
                  <AcoesAluno aluno={{ id: l.id, nome, email: l.email, whatsapp: l.whatsapp, bloqueado: l.bloqueado }} voltarPara="/admin/acompanhamento"
                    sugestoes={[{ rotulo: "Sugerida para a situação do aluno", texto: sugestao }]} />
                </li>
              );
            })}
            {!lista.length && <li className="p-6 text-center text-ink-2">Nenhum aluno nesta lista.</li>}
          </ul>
          {qtd > LIMITE && <p className="text-sm text-muted">Mostrando {LIMITE} de {qtd}. Use a busca ou os filtros para encontrar os demais.</p>}
          <p className="text-[13px] text-muted">
            Aparecem aqui os alunos com acesso ao curso (ativo, suspenso ou encerrado) e quem já estudou nele.
            A situação conta só a atividade neste curso. {SITUACOES.nunca.rotulo}: tem acesso e ainda não estudou.
          </p>
        </>
      )}
    </>
  );
}
