"use client";

import { useActionState } from "react";
import { enviarWhatsappManual, salvarModeloWhatsapp } from "@/app/whatsapp-actions";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-navy";
const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:opacity-50";

function Aviso({ s }: { s: { ok?: boolean; msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

export function ModeloWhatsappForm({ evento, texto, ativo }: { evento: string; texto: string; ativo: boolean }) {
  const [s, acao, pend] = useActionState(salvarModeloWhatsapp, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="evento" value={evento} />
      <label className="sr-only" htmlFor={`t-${evento}`}>Texto da mensagem</label>
      <textarea id={`t-${evento}`} name="texto" defaultValue={texto} rows={7} maxLength={3000} className={campo} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-[#c8102e]" /> Enviar automaticamente
        </label>
        <button className={btn} disabled={pend}>{pend ? "Salvando…" : "Salvar"}</button>
      </div>
      <Aviso s={s} />
    </form>
  );
}

export function EnviarWhatsappForm({ alunoId, textoInicial = "", rotulo = "Enviar pelo WhatsApp" }: { alunoId?: string; textoInicial?: string; rotulo?: string }) {
  const [s, acao, pend] = useActionState(enviarWhatsappManual, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      {alunoId ? <input type="hidden" name="aluno_id" value={alunoId} /> : (
        <div className="flex flex-col gap-1">
          <label htmlFor="telefone" className="text-[14px] font-semibold">Número (com DDI e DDD)</label>
          <input id="telefone" name="telefone" inputMode="tel" placeholder="5511999999999" className={campo} />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor={`msg-${alunoId ?? "teste"}`} className="text-[14px] font-semibold">Mensagem</label>
        <textarea id={`msg-${alunoId ?? "teste"}`} name="texto" defaultValue={textoInicial} rows={5} maxLength={3000} className={campo} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#25d366] px-5 font-semibold text-[#0b3d20] hover:brightness-95 disabled:opacity-50" disabled={pend}>{pend ? "Enviando…" : rotulo}</button>
        <span className="text-[13px] text-muted">Pode usar {"{nome}"} para o primeiro nome.</span>
      </div>
      <Aviso s={s} />
    </form>
  );
}
