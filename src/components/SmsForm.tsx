"use client";

import { useActionState } from "react";
import { salvarSMS, testarSMS } from "@/app/sms-actions";

const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-sm font-semibold";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  return (
    <>
      {s.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{s.erro}</p>}
      {s.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">{s.msg}</p>}
    </>
  );
}

export function SmsForm({ conectado, ativo }: { conectado: boolean; ativo: boolean }) {
  const [s, acao, pend] = useActionState(salvarSMS, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className={rot}>Token da API (Bearer) {conectado && <span className="font-normal text-muted">(já salvo: deixe em branco para manter)</span>}
        <input name="token" type="password" autoComplete="off" placeholder={conectado ? "••••••••••••" : "Cole aqui o token de smsmais › API & Integrações"} className={campo} />
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-brand-strong" />
        Envio de SMS ligado
      </label>
      <Aviso s={s} />
      <div><button disabled={pend} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Salvando…" : "Salvar"}</button></div>
    </form>
  );
}

export function SmsTeste() {
  const [s, acao, pend] = useActionState(testarSMS, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <label className={rot}>Seu celular
        <input name="tel" type="tel" inputMode="tel" required placeholder="11 98765-4321" className={`${campo} sm:max-w-[320px]`} />
      </label>
      <Aviso s={s} />
      <div><button disabled={pend} className="min-h-12 cursor-pointer rounded-full bg-navy px-7 font-display font-bold text-white hover:bg-navy-deep disabled:opacity-60">{pend ? "Enviando…" : "Enviar SMS de teste"}</button></div>
    </form>
  );
}
