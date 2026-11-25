"use client";

import { useActionState, useMemo, useState } from "react";
import { adicionarEscolas, excluirEscolas, renomearEscola } from "@/app/escolas-actions";

type Estado = { ok?: boolean; msg?: string; erro?: string };
type Escola = { nome: string; alunos: number };

const campo = "min-h-11 w-full rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px] text-navy";
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Aviso({ s }: { s: Estado }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[14px] font-semibold text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

/** Colar várias escolas, uma por linha. */
export function AdicionarEscolas() {
  const [chave, setChave] = useState(0);
  const [s, acao, pend] = useActionState(async (prev: Estado, f: FormData) => {
    const r = await adicionarEscolas(prev, f);
    if (r.ok) setChave((k) => k + 1);
    return r;
  }, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-[14px] font-semibold">Cole as escolas, uma embaixo da outra
        <textarea key={chave} name="lista" rows={7} required placeholder={"Escola de Aviação Exemplo\nAeroclube de Exemplo\n…"} className="rounded-xl border border-[#c9cedb] bg-white p-3 text-[15px] font-normal text-navy" />
      </label>
      <p className="text-[13px] text-muted">Escolas repetidas ou que já estão na lista são ignoradas. Marcadores como “-”, “•” ou “1.” no começo da linha são removidos.</p>
      <Aviso s={s} />
      <div><button disabled={pend} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Adicionando…" : "Adicionar à lista"}</button></div>
    </form>
  );
}

function Linha({ e, marcada, marcar }: { e: Escola; marcada: boolean; marcar: (v: boolean) => void }) {
  const [editando, setEditando] = useState(false);
  const [s, acao, pend] = useActionState(async (prev: Estado, f: FormData) => {
    const r = await renomearEscola(prev, f);
    if (r.ok) setEditando(false);
    return r;
  }, {});
  return (
    <li className="flex flex-col gap-2 px-4 py-2.5">
      {!editando ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <label className="flex min-h-10 min-w-0 flex-[1_1_260px] cursor-pointer items-center gap-3 text-[15px]">
            <input type="checkbox" checked={marcada} onChange={(ev) => marcar(ev.target.checked)} className="h-5 w-5 shrink-0 accent-brand-strong" />
            <span className="min-w-0">{e.nome}</span>
          </label>
          <span className="text-[13px] text-muted">{e.alunos ? `${e.alunos} ${e.alunos === 1 ? "aluno" : "alunos"}` : "nenhum aluno"}</span>
          <button type="button" onClick={() => setEditando(true)} className="inline-flex min-h-10 cursor-pointer items-center rounded-full border-2 border-line bg-white px-4 text-[14px] font-semibold text-navy hover:border-navy">Editar</button>
        </div>
      ) : (
        <form action={acao} className="flex flex-col gap-2 rounded-xl bg-soft p-3">
          <input type="hidden" name="de" value={e.nome} />
          <label className="flex flex-col gap-1 text-[13px] font-semibold">Nome da escola
            <input name="para" defaultValue={e.nome} required maxLength={120} autoFocus className={campo} />
          </label>
          {e.alunos > 0 && (
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px]">
              <input type="checkbox" name="alunos" defaultChecked className="h-5 w-5 accent-brand-strong" />
              Corrigir também o nome {e.alunos === 1 ? "no cadastro do aluno que escolheu" : `nos ${e.alunos} alunos que escolheram`} esta escola
            </label>
          )}
          <Aviso s={s} />
          <div className="flex flex-wrap gap-2">
            <button disabled={pend} className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-navy px-5 text-[14px] font-bold text-white disabled:opacity-60">{pend ? "Salvando…" : "Salvar"}</button>
            <button type="button" onClick={() => setEditando(false)} className="min-h-10 cursor-pointer px-3 text-[14px] font-semibold text-ink-2">Cancelar</button>
          </div>
        </form>
      )}
    </li>
  );
}

/** Lista com busca, seleção e exclusão de uma ou várias escolas. */
export function ListaEscolas({ escolas }: { escolas: Escola[] }) {
  const [busca, setBusca] = useState("");
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [confirmar, setConfirmar] = useState(false);
  const [s, acao, pend] = useActionState(async (prev: Estado, f: FormData) => {
    const r = await excluirEscolas(prev, f);
    if (r.ok) { setMarcadas(new Set()); setConfirmar(false); }
    return r;
  }, {});
  const termo = semAcento(busca.trim());
  const visiveis = useMemo(() => escolas.filter((e) => !termo || semAcento(e.nome).includes(termo)), [escolas, termo]);
  const existentes = new Set(escolas.map((e) => e.nome));
  const sel = [...marcadas].filter((n) => existentes.has(n));
  const todasVisiveis = visiveis.length > 0 && visiveis.every((e) => marcadas.has(e.nome));
  const marcar = (nome: string, v: boolean) => setMarcadas((m) => { const n = new Set(m); if (v) n.add(nome); else n.delete(nome); return n; });
  const comAlunos = escolas.filter((e) => marcadas.has(e.nome)).reduce((t, e) => t + e.alunos, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-[1_1_260px] flex-col gap-1 text-[14px] font-semibold">Buscar
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite parte do nome" className={campo} />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[14px] font-semibold">
          <input type="checkbox" checked={todasVisiveis} onChange={(e) => setMarcadas((m) => { const n = new Set(m); visiveis.forEach((x) => (e.target.checked ? n.add(x.nome) : n.delete(x.nome))); return n; })} className="h-5 w-5 accent-brand-strong" />
          {termo ? `Marcar as ${visiveis.length} encontradas` : "Marcar todas"}
        </label>
      </div>

      <form action={acao} className="flex flex-wrap items-center gap-3">
        {sel.map((n) => <input key={n} type="hidden" name="nome" value={n} />)}
        <span className="text-[14px] text-ink-2"><strong className="text-navy">{sel.length}</strong> {sel.length === 1 ? "marcada" : "marcadas"} · {escolas.length} na lista</span>
        {sel.length > 0 && !confirmar && (
          <button type="button" onClick={() => setConfirmar(true)} className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep">Excluir {sel.length === 1 ? "a marcada" : `as ${sel.length} marcadas`}</button>
        )}
        {sel.length > 0 && confirmar && (
          <>
            <span className="text-[14px] font-semibold">Excluir {sel.length} {sel.length === 1 ? "escola" : "escolas"} da lista?{comAlunos ? ` Os ${comAlunos} alunos que já escolheram continuam com o nome no cadastro.` : ""}</span>
            <button disabled={pend} className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white disabled:opacity-60">{pend ? "Excluindo…" : "Sim, excluir"}</button>
            <button type="button" onClick={() => setConfirmar(false)} className="min-h-10 cursor-pointer px-2 text-[14px] font-semibold text-ink-2">Cancelar</button>
          </>
        )}
        {sel.length > 0 && !confirmar && <button type="button" onClick={() => setMarcadas(new Set())} className="min-h-10 cursor-pointer px-2 text-[14px] font-semibold text-muted underline underline-offset-4">Desmarcar</button>}
      </form>
      <Aviso s={s} />

      {visiveis.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {visiveis.map((e) => <Linha key={e.nome} e={e} marcada={marcadas.has(e.nome)} marcar={(v) => marcar(e.nome, v)} />)}
        </ul>
      ) : (
        <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">{escolas.length ? "Nenhuma escola encontrada." : "A lista está vazia. Cole as escolas acima."}</p>
      )}
    </div>
  );
}
