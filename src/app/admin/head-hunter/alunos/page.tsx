import type { Metadata } from "next";
import AcoesAluno from "@/components/AcoesAluno";
import AvatarAluno from "@/components/AvatarAluno";
import Link from "next/link";
import { Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import {
  SITUACOES, diasParaMeta, mensagemSugerida, nomeAluno, quando, riscos, situacao,
  type LinhaAluno, type Situacao,
} from "@/lib/painel-alunos";
import { avatarUrl, getUser } from "@/lib/supabase/server";
import { nomeCurso, siglaCurso } from "@/lib/cursos";

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

export default async function AlunosHeadHunterPage({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; o?: string; excluido?: string }> }) {
  const { q = "", s = "todos", o = "ultima", excluido } = await searchParams;
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

  // foto e cursos ativos dos alunos mostrados
  const ids = lista.map((l) => l.id);
  const extras = new Map<string, { avatar_em: string | null; cursos: string[] }>();
  if (ids.length) {
    const [{ data: fotos }, { data: acs }] = await Promise.all([
      supabase.from("profiles").select("id, avatar_em").in("id", ids),
      supabase.from("acessos").select("user_id, produto, status, expira_em").in("user_id", ids),
    ]);
    for (const f of (fotos ?? []) as { id: string; avatar_em: string | null }[]) extras.set(f.id, { avatar_em: f.avatar_em, cursos: [] });
    const agora = new Date().toISOString();
    for (const a of (acs ?? []) as { user_id: string; produto: string; status: string; expira_em: string | null }[]) {
      if (a.status === "ativo" && (!a.expira_em || a.expira_em > agora)) extras.get(a.user_id)?.cursos.push(a.produto);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Quem está estudando, quem parou e quem precisa de um empurrãozinho. O olho abre a ficha completa do aluno.">Alunos do Head Hunter</Titulo>
      {excluido && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Conta de {excluido} excluída. O registro ficou em <Link href="/admin/contas-excluidas" className="underline">Usuários › Contas excluídas</Link>.</p>}
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

          <ul className="flex flex-col divide-y divide-[#eceef3] rounded-2xl border border-line bg-white">
            {lista.map((l) => {
              const st = situacao(l);
              const rs = riscos(l);
              const foto = avatarUrl(l.id, extras.get(l.id)?.avatar_em ?? null);
              const cursos = extras.get(l.id)?.cursos ?? [];
              const nome = nomeAluno(l);
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <Link href={`/admin/usuarios/${l.id}`} className="flex min-w-0 flex-[1_1_260px] items-center gap-3" aria-label={`Ver ficha de ${nome}`}>
                    <AvatarAluno src={foto} nome={nome} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-navy">{nome}{l.bloqueado && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-[11px] font-bold text-brand-deep">BANIDO</span>}</span>
                      <span className="truncate text-[13px] text-muted">{l.email ?? ""}</span>
                    </span>
                  </Link>
                  <span className="flex w-[150px] flex-col">
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${SITUACOES[st].cor}`}>{SITUACOES[st].rotulo}</span>
                    <span className="pt-0.5 text-[12px] text-muted">{rs.length ? <span className="font-semibold text-brand-strong">⚠ {rs[0]}</span> : quando(l.ultima)}</span>
                  </span>
                  <span className="flex w-[96px] gap-1" aria-label="Cursos">
                    {cursos.map((c) => <span key={c} title={nomeCurso(c)} className="rounded-md bg-[#eef1ff] px-1.5 py-0.5 text-[11px] font-bold text-navy">{siglaCurso(c)}</span>)}
                  </span>
                  <AcoesAluno aluno={{ id: l.id, nome, email: l.email, whatsapp: l.whatsapp, bloqueado: l.bloqueado }}
                    sugestoes={[{ rotulo: "Sugerida para a situação do aluno", texto: mensagemSugerida(l) }]} />
                </li>
              );
            })}
            {!lista.length && <li className="p-6 text-center text-ink-2">Nenhum aluno nesta lista.</li>}
          </ul>
          {total > LIMITE && <p className="text-sm text-muted">Mostrando {LIMITE} de {total}. Use a busca, os filtros ou exporte o CSV para ver todos.</p>}
        </>
      )}
    </>
  );
}
