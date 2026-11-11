"use client";

import { useActionState, useState } from "react";
import { salvarCheckin } from "@/app/crew-actions";
import { COMPANHIAS, type Companhia } from "@/lib/jornada";

export default function CheckinForm({ atuais, dataMeta }: { atuais: Companhia[]; dataMeta: string | null }) {
  const [state, action, pend] = useActionState(salvarCheckin, undefined);
  const [principal, setPrincipal] = useState<Companhia | "">(atuais[0] ?? "");
  const [outras, setOutras] = useState<Companhia[]>(atuais.slice(1));
  const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-xl font-extrabold">1. Qual é a sua companhia principal?</legend>
        <p className="-mt-1 text-[15px] text-ink-2">A ordem da sua jornada segue o processo seletivo dela.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {COMPANHIAS.map((c) => (
            <label key={c.slug} className={`flex cursor-pointer flex-col gap-2 rounded-2xl border-2 bg-white p-5 ${principal === c.slug ? "border-brand-strong ring-4 ring-brand-soft" : "border-line hover:border-navy"}`}>
              <span className="flex items-center gap-3">
                <input type="radio" name="principal" value={c.slug} checked={principal === c.slug} onChange={() => { setPrincipal(c.slug); setOutras((o) => o.filter((x) => x !== c.slug)); }} className="h-5 w-5 accent-brand-strong" />
                <strong className="font-display text-xl">{c.nome}</strong>
              </span>
              <span className="text-[14px] leading-relaxed text-ink-2">{c.resumo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-xl font-extrabold">2. Vai tentar outras também? <span className="text-base font-semibold text-muted">(opcional)</span></legend>
        <div className="flex flex-wrap gap-2">
          {COMPANHIAS.filter((c) => c.slug !== principal).map((c) => {
            const on = outras.includes(c.slug);
            return (
              <label key={c.slug} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 px-5 font-semibold ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
                <input type="checkbox" name="tambem" value={c.slug} checked={on} onChange={() => setOutras((o) => (on ? o.filter((x) => x !== c.slug) : [...o, c.slug]))} className="sr-only" />
                {on ? "✓ " : "+ "}{c.nome}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-xl font-extrabold">3. Até quando quer estar pronto(a)? <span className="text-base font-semibold text-muted">(opcional)</span></legend>
        <p className="-mt-1 text-[15px] text-ink-2">Se souber a data do próximo processo, use ela. A contagem regressiva aparece na sua jornada.</p>
        <input type="date" name="data_meta" min={hoje} defaultValue={dataMeta ?? ""} aria-label="Data da meta" className="min-h-12 w-full max-w-[260px] rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[16px]" />
      </fieldset>

      {state?.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">{state.erro}</p>}
      <div>
        <button type="submit" disabled={!principal || pend} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-8 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50">
          {pend ? "Salvando…" : "Montar minha jornada"}
        </button>
      </div>
    </form>
  );
}
