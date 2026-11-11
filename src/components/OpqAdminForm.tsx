"use client";

import { useActionState } from "react";
import { salvarAfirmacaoOpq } from "@/app/crew-actions";
import { TRACOS_OPQ } from "@/lib/opq";

export type AfirmacaoAdmin = { id?: string; codigo?: string; texto: string; traco: string; direcao: number; ativo: boolean; origem?: string | null };

export default function OpqAdminForm({ a }: { a: AfirmacaoAdmin }) {
  const [state, action, pend] = useActionState(salvarAfirmacaoOpq, undefined);
  return (
    <form action={action} className={`flex flex-col gap-2 rounded-xl border p-3 ${a.ativo ? "border-line bg-white" : "border-dashed border-[#c9cedb] bg-soft"}`}>
      {a.id && <input type="hidden" name="id" value={a.id} />}
      <label className="sr-only" htmlFor={`t-${a.id ?? "nova"}`}>Afirmação</label>
      <textarea id={`t-${a.id ?? "nova"}`} name="texto" rows={2} defaultValue={a.texto} required placeholder="Escreva a afirmação em primeira pessoa…"
        className="w-full rounded-lg border border-[#c9cedb] px-3 py-2 text-[15px]" />
      <div className="flex flex-wrap items-center gap-2 text-[14px]">
        <select name="traco" defaultValue={a.traco} aria-label="Traço" className="min-h-10 rounded-lg border border-[#c9cedb] bg-white px-2">
          {TRACOS_OPQ.map((t) => <option key={t.nome}>{t.nome}</option>)}
        </select>
        <select name="direcao" defaultValue={String(a.direcao)} aria-label="Direção" className="min-h-10 rounded-lg border border-[#c9cedb] bg-white px-2">
          <option value="1">Concordar = mais do traço</option>
          <option value="-1">Concordar = menos do traço</option>
        </select>
        <label className="flex min-h-10 cursor-pointer items-center gap-2"><input type="checkbox" name="ativo" defaultChecked={a.ativo} className="h-4 w-4 accent-brand-strong" /> Ativa</label>
        <button type="submit" disabled={pend} className="ml-auto min-h-10 cursor-pointer rounded-full bg-navy px-4 font-semibold text-white disabled:opacity-60">{pend ? "Salvando…" : a.id ? "Salvar" : "Adicionar"}</button>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-[12px] text-muted">
        <span>{a.codigo ? `${a.codigo} · ${a.origem ?? ""}` : ""}</span>
        {state && <span role="status" className={state.erro ? "text-brand-deep" : "text-[#0f6b3a]"}>{state.erro ?? state.msg}</span>}
      </div>
    </form>
  );
}
