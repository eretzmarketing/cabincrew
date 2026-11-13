"use client";

import { useActionState, useState } from "react";
import { salvarConexaoMP, salvarProduto } from "@/app/pagamentos-actions";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 py-3 text-[15px] outline-none focus:border-navy";
const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:opacity-50";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

export function ConexaoMPForm({ publicKey, conectado, temSegredo }: { publicKey: string; conectado: boolean; temSegredo: boolean }) {
  const [s, acao, pend] = useActionState(salvarConexaoMP, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="public_key" className="text-[14px] font-semibold">Public Key</label>
        <input id="public_key" name="public_key" defaultValue={publicKey} autoComplete="off" spellCheck={false} placeholder="APP_USR-…" className={campo} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="access_token" className="text-[14px] font-semibold">Access Token</label>
          <input id="access_token" name="access_token" type="password" autoComplete="new-password" spellCheck={false} placeholder={conectado ? "salvo (deixe em branco para manter)" : "APP_USR-…"} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="webhook_secret" className="text-[14px] font-semibold">Assinatura secreta do webhook <span className="font-normal text-muted">(opcional)</span></label>
          <input id="webhook_secret" name="webhook_secret" type="password" autoComplete="new-password" spellCheck={false} placeholder={temSegredo ? "salva (deixe em branco para manter)" : "cole a assinatura secreta"} className={campo} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className={btn} disabled={pend}>{pend ? "Testando…" : conectado ? "Salvar e testar" : "Conectar"}</button>
        <span className="text-[13px] text-muted">Os dados ficam só no servidor do site. O token nunca aparece aqui de novo.</span>
      </div>
      <Aviso s={s} />
    </form>
  );
}

export function ProdutoForm({ p }: { p: { slug: string; preco: number; desconto_pix: number; descricao: string | null; ativo: boolean; dias_apos_conclusao?: number } }) {
  const [s, acao, pend] = useActionState(salvarProduto, {});
  const [preco, setPreco] = useState(String(p.preco).replace(".", ","));
  const [desc, setDesc] = useState(String(p.desconto_pix).replace(".", ","));
  const n = Number(preco.replace(/\./g, "").replace(",", ".")) || 0;
  const d = Number(desc.replace(",", ".")) || 0;
  const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={p.slug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`preco-${p.slug}`} className="text-[14px] font-semibold">Preço (R$)</label>
          <input id={`preco-${p.slug}`} name="preco" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`pix-${p.slug}`} className="text-[14px] font-semibold">Desconto no Pix (%)</label>
          <input id={`pix-${p.slug}`} name="desconto_pix" inputMode="decimal" value={desc} onChange={(e) => setDesc(e.target.value)} className={campo} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`dias-${p.slug}`} className="text-[14px] font-semibold">Dias de acesso depois de concluir a jornada</label>
        <input id={`dias-${p.slug}`} name="dias_apos_conclusao" type="number" min={0} max={365} defaultValue={p.dias_apos_conclusao ?? 30} className={`${campo} sm:max-w-[200px]`} />
        <span className="text-[13px] text-muted">Tempo para o aluno revisar antes da seleção. Use 0 para encerrar no mesmo dia.</span>
      </div>
      <p className="rounded-xl bg-soft px-4 py-3 text-[15px]">
        No checkout: <strong>{reais(n)}</strong> no cartão (até 12x, juros por conta do aluno) · <strong className="text-[#0f6b3a]">{reais(Math.round(n * (100 - d)) / 100)}</strong> no Pix
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor={`desc-${p.slug}`} className="text-[14px] font-semibold">Descrição na página de venda</label>
        <textarea id={`desc-${p.slug}`} name="descricao" defaultValue={p.descricao ?? ""} rows={3} maxLength={500} className={campo} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="ativo" defaultChecked={p.ativo} className="h-5 w-5 accent-[#c8102e]" /> À venda
        </label>
        <button className={btn} disabled={pend}>{pend ? "Salvando…" : "Salvar"}</button>
      </div>
      <Aviso s={s} />
    </form>
  );
}
