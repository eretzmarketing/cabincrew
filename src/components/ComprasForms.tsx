"use client";

import { useActionState, useState } from "react";
import { alterarStatusCompra, registrarCompra } from "@/app/compras-actions";
import { FORMAS, STATUS_COMPRA } from "@/lib/compras";

const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px] outline-none focus:border-navy";
const rot = "text-[14px] font-semibold";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

export function NovaCompraForm({ agora }: { agora: string }) {
  const [s, acao, pend] = useActionState(registrarCompra, {});
  const [forma, setForma] = useState("pix");
  return (
    <form action={acao} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1"><label htmlFor="c-email" className={rot}>E-mail do aluno *</label><input id="c-email" name="email" type="email" required className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-nome" className={rot}>Nome completo <span className="font-normal text-muted">(se não tiver cadastro)</span></label><input id="c-nome" name="nome" className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-whats" className={rot}>WhatsApp <span className="font-normal text-muted">(opcional)</span></label><input id="c-whats" name="whatsapp" inputMode="tel" className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-doc" className={rot}>CPF/CNPJ <span className="font-normal text-muted">(opcional)</span></label><input id="c-doc" name="documento" className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-prod" className={rot}>Produto *</label><input id="c-prod" name="produto" required placeholder="Head Hunter · acesso anual" className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-valor" className={rot}>Valor pago (R$) *</label><input id="c-valor" name="valor" required inputMode="decimal" placeholder="497,00" className={campo} /></div>
      <div className="flex flex-col gap-1">
        <label htmlFor="c-forma" className={rot}>Forma de pagamento *</label>
        <select id="c-forma" name="forma_pagamento" value={forma} onChange={(e) => setForma(e.target.value)} className={campo}>
          {Object.entries(FORMAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {forma === "cartao_credito" ? (
        <div className="flex flex-col gap-1"><label htmlFor="c-parc" className={rot}>Parcelas</label><input id="c-parc" name="parcelas" type="number" min={1} max={36} defaultValue={1} className={campo} /></div>
      ) : <div className="hidden md:block" />}
      <div className="flex flex-col gap-1"><label htmlFor="c-plat" className={rot}>Plataforma *</label><input id="c-plat" name="plataforma" required list="plataformas" placeholder="Mercado Pago" className={campo} />
        <datalist id="plataformas"><option value="Mercado Pago" /><option value="Hotmart" /><option value="Kiwify" /><option value="Pix manual" /><option value="Stripe" /></datalist></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-tx" className={rot}>ID da transação</label><input id="c-tx" name="id_transacao" placeholder="como aparece no comprovante" className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-data" className={rot}>Data e hora da compra (Brasília) *</label><input id="c-data" name="comprada_em" type="datetime-local" required defaultValue={agora} className={campo} /></div>
      <div className="flex flex-col gap-1"><label htmlFor="c-lib" className={rot}>Acesso liberado em <span className="font-normal text-muted">(se diferente)</span></label><input id="c-lib" name="liberada_em" type="datetime-local" className={campo} /></div>
      <div className="flex flex-col gap-1">
        <label htmlFor="c-status" className={rot}>Status</label>
        <select id="c-status" name="status" defaultValue="aprovada" className={campo}>
          {Object.entries(STATUS_COMPRA).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1 md:col-span-2"><label htmlFor="c-obs" className={rot}>Observação</label><textarea id="c-obs" name="observacao" rows={2} className={`${campo} py-3`} /></div>
      <div className="flex flex-col gap-3 md:col-span-2">
        <Aviso s={s} />
        <button className="inline-flex min-h-12 cursor-pointer items-center justify-center self-start rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-50" disabled={pend}>{pend ? "Salvando…" : "Registrar compra"}</button>
      </div>
    </form>
  );
}

export function StatusCompraForm({ id, atual }: { id: number; atual: string }) {
  const [s, acao, pend] = useActionState(alterarStatusCompra, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-1">
        <label htmlFor="s-status" className={rot}>Novo status</label>
        <select id="s-status" name="status" defaultValue={atual} className={campo}>
          {Object.entries(STATUS_COMPRA).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="s-motivo" className={rot}>Motivo (fica registrado)</label>
        <textarea id="s-motivo" name="motivo" rows={2} placeholder="Ex.: reembolso pedido no 3º dia, dentro do prazo" className={`${campo} py-3`} />
      </div>
      <Aviso s={s} />
      <button className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-50" disabled={pend}>{pend ? "Salvando…" : "Salvar status"}</button>
    </form>
  );
}
