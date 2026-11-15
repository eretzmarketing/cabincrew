"use client";

import { useActionState, useState } from "react";
import { salvarRequisito } from "@/app/cv-actions";
import { TIPOS_REQUISITO, type RequisitoCV } from "@/lib/ia-curriculo-tipos";

const campo = "min-h-11 w-full rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-sm font-semibold text-navy";

/** Formulário de um requisito (novo ou edição). */
export function RequisitoForm({ r, aoSalvar }: { r?: RequisitoCV; aoSalvar?: () => void }) {
  const [tipo, setTipo] = useState<string>(r?.tipo ?? "palavra");
  const [s, acao, pend] = useActionState(async (antes: { ok?: boolean; msg?: string; erro?: string }, fd: FormData) => {
    const res = await salvarRequisito(antes, fd);
    if (res.ok) aoSalvar?.();
    return res;
  }, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <label className={rot}>Nome <span className="font-normal text-muted">(é o que o aluno vê)</span>
          <input name="nome" required maxLength={80} defaultValue={r?.nome} placeholder="Ex.: CMA válido" className={campo} />
        </label>
        <label className={rot}>Tipo
          <select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={`${campo} cursor-pointer`}>
            {Object.entries(TIPOS_REQUISITO).map(([k, v]) => <option key={k} value={k}>{v.nome}</option>)}
          </select>
        </label>
      </div>
      <p className="-mt-2 text-[13px] text-muted">{TIPOS_REQUISITO[tipo as keyof typeof TIPOS_REQUISITO]?.desc}</p>
      <label className={rot}>Palavras para procurar no currículo <span className="font-normal text-muted">(separadas por vírgula; maiúsculas e acentos não importam)</span>
        <textarea name="termos" rows={2} defaultValue={r?.termos.join(", ")} placeholder="Ex.: CMA, Certificado Médico Aeronáutico" className={`${campo} py-2`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <label className={rot}>Validade mínima <span className="font-normal text-muted">(meses, opcional)</span>
          <input name="validade" type="number" min={1} max={120} defaultValue={r?.validade_meses ?? ""} placeholder="Ex.: 12" className={campo} />
        </label>
        <label className={rot}>Orientação para a IA <span className="font-normal text-muted">(opcional)</span>
          <input name="instrucao" maxLength={500} defaultValue={r?.instrucao ?? ""} placeholder="Ex.: todas as companhias exigem; peça a data de validade" className={campo} />
        </label>
      </div>
      <p className="-mt-2 text-[13px] text-muted">Com validade mínima, o site procura a data perto da palavra (ex.: “válido até 03/2028”) e avisa se faltar a data ou se vencer antes do prazo.</p>
      {s.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2 text-[14px] text-brand-deep">{s.erro}</p>}
      {s.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2 text-[14px] text-[#0f6b3a]">{s.msg}</p>}
      <div><button disabled={pend} className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Salvando…" : r ? "Salvar" : "Adicionar"}</button></div>
    </form>
  );
}
