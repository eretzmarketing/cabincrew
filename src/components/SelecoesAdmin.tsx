"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { excluirSelecoes, mudarStatusSelecao } from "@/app/actions";
import { STATUS_SELECAO, mesAno, type Selecao } from "@/lib/forum";

const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dataBR = (d: string) => d.split("-").reverse().join("/");
const passada = (s: Selecao) => s.status === "encerrada" || (!!s.encerrada_em && s.encerrada_em < hoje());

/** Lista de seleções: status, data de encerramento e exclusão de várias de uma vez. */
export function SelecoesAdmin({ selecoes }: { selecoes: Selecao[] }) {
  const router = useRouter();
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [confirmar, setConfirmar] = useState(false);
  const [res, setRes] = useState<{ msg?: string; erro?: string }>({});
  const [pend, iniciar] = useTransition();
  const sel = selecoes.filter((s) => marcadas.has(s.id));
  const relatos = sel.reduce((t, s) => t + s.total_relatos, 0);
  const passadas = selecoes.filter(passada);
  const marcar = (id: string, v: boolean) => setMarcadas((m) => { const n = new Set(m); if (v) n.add(id); else n.delete(id); return n; });
  const todas = selecoes.length > 0 && selecoes.every((s) => marcadas.has(s.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={!passadas.length} onClick={() => { setMarcadas(new Set(passadas.map((s) => s.id))); setConfirmar(false); setRes({}); }}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line bg-white px-4 text-[14px] font-semibold text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-50">
          Marcar as encerradas ({passadas.length})
        </button>
        {sel.length > 0 && !confirmar && (
          <>
            <button type="button" onClick={() => setConfirmar(true)} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep">
              Excluir {sel.length === 1 ? "a marcada" : `as ${sel.length} marcadas`}
            </button>
            <button type="button" onClick={() => setMarcadas(new Set())} className="min-h-11 cursor-pointer px-2 text-[14px] font-semibold text-muted underline underline-offset-4">Desmarcar</button>
          </>
        )}
      </div>
      {confirmar && sel.length > 0 && (
        <div role="alertdialog" aria-label="Confirmar exclusão" className="flex flex-col gap-3 rounded-2xl border-2 border-brand-strong/40 bg-brand-soft/50 p-4">
          <p className="text-[15px]">
            Excluir <strong>{sel.length} {sel.length === 1 ? "seleção" : "seleções"}</strong>?
            {relatos > 0
              ? <> {relatos === 1 ? <>O <strong>1 relato</strong></> : <>Os <strong>{relatos} relatos</strong></>} {sel.length === 1 ? "dela" : "delas"} também {relatos === 1 ? "será apagado" : "serão apagados"}.</>
              : sel.length === 1 ? " Ela não tem relatos." : " Elas não têm relatos."} Não dá para desfazer.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pend} onClick={() => iniciar(async () => {
              const r = await excluirSelecoes(sel.map((s) => s.id));
              setRes(r); setConfirmar(false);
              if (r.ok) { setMarcadas(new Set()); router.refresh(); }
            })} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-brand-strong px-5 font-bold text-white disabled:opacity-60">
              {pend ? "Excluindo…" : "Sim, excluir"}
            </button>
            <button type="button" onClick={() => setConfirmar(false)} className="min-h-11 cursor-pointer px-3 font-semibold text-ink-2">Cancelar</button>
          </div>
        </div>
      )}
      {res.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">{res.erro}</p>}
      {res.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{res.msg}</p>}

      <div className="relative overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Marcar todas" checked={todas} onChange={(e) => setMarcadas(e.target.checked ? new Set(selecoes.map((s) => s.id)) : new Set())} className="h-5 w-5 cursor-pointer accent-brand-strong" /></th>
              <th className="p-3 font-semibold">Seleção</th><th className="p-3 font-semibold">Relatos</th><th className="p-3 font-semibold">Status e encerramento</th>
            </tr>
          </thead>
          <tbody>
            {selecoes.map((s) => (
              <tr key={s.id} className={`border-b border-[#eceef3] last:border-0 ${marcadas.has(s.id) ? "bg-brand-soft/40" : ""}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Marcar ${s.companhia} ${s.base} ${mesAno(s.mes_ref)}`} checked={marcadas.has(s.id)} onChange={(e) => marcar(s.id, e.target.checked)} className="h-5 w-5 cursor-pointer accent-brand-strong" /></td>
                <td className="p-3">
                  <Link href={`/forum/${s.slug}`} className="font-semibold text-navy">{s.companhia} · {s.base} · {mesAno(s.mes_ref)}</Link>
                  <span className="block text-[13px] text-muted">
                    {s.aberta_em ? `Aberta em ${dataBR(s.aberta_em)}` : "Sem data de abertura"}
                    {s.encerrada_em ? ` · ${s.encerrada_em < hoje() ? "encerrou" : "encerra"} em ${dataBR(s.encerrada_em)}` : ""}
                  </span>
                </td>
                <td className="p-3">{s.total_relatos}</td>
                <td className="p-3">
                  <form action={async (f) => { await mudarStatusSelecao(f); router.refresh(); }} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <label className="sr-only" htmlFor={`st-${s.id}`}>Status</label>
                    <select id={`st-${s.id}`} name="status" defaultValue={s.status_manual ?? s.status} className="min-h-11 rounded-lg border border-[#c9cedb] px-2 text-sm">
                      {Object.entries(STATUS_SELECAO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-[13px] text-muted">Encerra
                      <input type="date" name="encerrada_em" defaultValue={s.encerrada_em ?? ""} className="min-h-11 rounded-lg border border-[#c9cedb] px-2 text-sm text-navy" />
                    </label>
                    <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-soft px-4 text-sm font-semibold text-navy hover:bg-[#e3e6ee]">Salvar</button>
                    {s.status === "encerrada" && s.status_manual && s.status_manual !== "encerrada" && <span className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-[12px] font-semibold text-ink-2">aparece como Encerrada</span>}
                  </form>
                </td>
              </tr>
            ))}
            {!selecoes.length && <tr><td colSpan={4} className="p-6 text-center text-ink-2">Nenhuma seleção ainda.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-muted">Depois da data de encerramento, a seleção aparece como “Encerrada” no fórum automaticamente.</p>
    </div>
  );
}
