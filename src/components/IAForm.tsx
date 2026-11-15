"use client";

import { useActionState } from "react";
import { liberarAnalisesIA, salvarIA } from "@/app/ia-actions";

const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-sm font-semibold";

export function IAForm({ conectada, modelo, porAluno, porAlunoCv, ativo }: { conectada: boolean; modelo: string; porAluno: number; porAlunoCv: number; ativo: boolean }) {
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={rot}>Análises de vídeo por aluno <span className="font-normal text-muted">(por compra do Head Hunter)</span>
          <input name="porAluno" type="number" min={1} max={50} defaultValue={porAluno} className={campo} />
        </label>
        <label className={rot}>Análises de currículo por aluno <span className="font-normal text-muted">(por compra do Head Hunter)</span>
          <input name="porAlunoCv" type="number" min={1} max={50} defaultValue={porAlunoCv} className={campo} />
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

/** Ficha do aluno: liberar análises extras da IA no vídeo de apresentação. */
export function LiberarIAForm({ aluno, recurso = "video" }: { aluno: string; recurso?: "video" | "curriculo" }) {
  const [s, acao, pend] = useActionState(liberarAnalisesIA, {});
  return (
    <form action={acao} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="aluno" value={aluno} />
      <input type="hidden" name="recurso" value={recurso} />
      <label className="flex flex-col gap-1 text-sm font-semibold text-navy">Liberar mais
        <select name="qtd" defaultValue="1" className="min-h-11 cursor-pointer rounded-xl border border-[#c9cedb] bg-white px-3 text-[16px] font-normal">
          {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "análise" : "análises"}</option>)}
        </select>
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px]">
        <input type="checkbox" name="avisar" defaultChecked className="h-5 w-5 accent-brand-strong" />
        Avisar o aluno no WhatsApp
      </label>
      <button disabled={pend} className="min-h-11 cursor-pointer rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:opacity-60">{pend ? "Liberando…" : "Liberar"}</button>
      {s.erro && <p role="alert" className="w-full text-[14px] text-brand-deep">{s.erro}</p>}
      {s.msg && <p role="status" className="w-full text-[14px] text-[#0f6b3a]">{s.msg}</p>}
    </form>
  );
}
