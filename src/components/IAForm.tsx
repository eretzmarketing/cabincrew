"use client";

import { useActionState } from "react";
import { salvarIA } from "@/app/ia-actions";

const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-sm font-semibold";

export function IAForm({ conectada, modelo, porDia, ativo }: { conectada: boolean; modelo: string; porDia: number; ativo: boolean }) {
  const [s, acao, pend] = useActionState(salvarIA, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className={rot}>Chave da API da OpenAI {conectada && <span className="font-normal text-muted">(já salva: deixe em branco para manter)</span>}
        <input name="chave" type="password" autoComplete="off" placeholder={conectada ? "••••••••••••" : "sk-..."} className={campo} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={rot}>Modelo <span className="font-normal text-muted">(padrão: gpt-5-mini, bom e barato)</span>
          <input name="modelo" defaultValue={modelo} className={campo} />
        </label>
        <label className={rot}>Análises por aluno por dia
          <input name="porDia" type="number" min={1} max={50} defaultValue={porDia} className={campo} />
        </label>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-brand-strong" />
        Feedback da IA ligado para os alunos
      </label>
      {s.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{s.erro}</p>}
      {s.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">{s.msg}</p>}
      <div><button disabled={pend} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Conferindo…" : "Salvar"}</button></div>
    </form>
  );
}
