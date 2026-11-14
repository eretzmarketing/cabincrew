"use client";

import { useActionState } from "react";
import { criarProdutoLoja, marcarEnviado, salvarProdutoLoja } from "@/app/loja-actions";
import type { ProdutoLoja } from "@/lib/loja";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-navy";
const rot = "flex flex-col gap-1 text-[13px] font-semibold";
const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy-deep disabled:opacity-50";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-3 py-2 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-3 py-2 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

export function EnviarPedidoForm({ id, rastreio, temTelefone }: { id: number; rastreio: string | null; temTelefone: boolean }) {
  const [s, acao, pend] = useActionState(marcarEnviado, {});
  return (
    <form action={acao} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-2">
        <label className={`${rot} min-w-[200px] flex-1`}>Código de rastreio dos Correios
          <input name="rastreio" defaultValue={rastreio ?? ""} placeholder="AB123456789BR" autoComplete="off" className={`${campo} font-mono uppercase`} />
        </label>
        <button className={btn} disabled={pend}>{pend ? "Salvando…" : rastreio ? "Atualizar rastreio" : "Marcar como enviado"}</button>
      </div>
      {temTelefone && (
        <label className="inline-flex items-center gap-2 text-[14px]"><input type="checkbox" name="avisar" defaultChecked={!rastreio} className="h-4 w-4 accent-[#1f2a44]" /> Avisar o aluno no WhatsApp com o código</label>
      )}
      <Aviso s={s} />
    </form>
  );
}

function Campos({ p }: { p?: ProdutoLoja }) {
  const v = (n?: number | null) => (n === null || n === undefined ? "" : String(n).replace(".", ","));
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_110px]">
        <label className={rot}>Nome<input name="nome" defaultValue={p?.nome} className={campo} /></label>
        <label className={rot}>Preço (R$)<input name="preco" inputMode="decimal" defaultValue={v(p?.preco)} className={campo} /></label>
        <label className={rot}>Preço &quot;de&quot; <span className="font-normal text-muted">(riscado)</span><input name="preco_de" inputMode="decimal" defaultValue={v(p?.preco_de)} className={campo} /></label>
        <label className={rot}>Desconto Pix (%)<input name="desconto_pix" inputMode="decimal" defaultValue={v(p?.desconto_pix ?? 0)} className={campo} /></label>
      </div>
      <label className={rot}>Resumo <span className="font-normal text-muted">(aparece no cartão da loja)</span><input name="resumo" defaultValue={p?.resumo ?? ""} maxLength={300} className={campo} /></label>
      <label className={rot}>Descrição <span className="font-normal text-muted">(deixe uma linha em branco entre os parágrafos)</span><textarea name="descricao" rows={6} defaultValue={p?.descricao ?? ""} className={campo} /></label>
      <label className={rot}>Fotos <span className="font-normal text-muted">(um endereço por linha; a primeira é a capa. Envie em Site e comunidade › Mídia e copie o endereço)</span>
        <textarea name="imagens" rows={3} defaultValue={(p?.imagens ?? []).join("\n")} className={`${campo} font-mono text-[13px]`} />
      </label>
      <div className="grid gap-3 md:grid-cols-[120px_1fr_120px_90px]">
        <label className={rot}>Frete (R$) <span className="font-normal text-muted">0 = grátis</span><input name="frete" inputMode="decimal" defaultValue={v(p?.frete ?? 0)} className={campo} /></label>
        <label className={rot}>Prazo de envio<input name="prazo" defaultValue={p?.prazo ?? "Postagem em até 3 dias úteis após o pagamento. Entrega pelos Correios em todo o Brasil."} className={campo} /></label>
        <label className={rot}>Estoque <span className="font-normal text-muted">vazio = sem controle</span><input name="estoque" inputMode="numeric" defaultValue={v(p?.estoque)} className={campo} /></label>
        <label className={rot}>Ordem<input name="ordem" inputMode="numeric" defaultValue={v(p?.ordem ?? 0)} className={campo} /></label>
      </div>
      <label className="inline-flex items-center gap-2 text-[15px] font-semibold"><input type="checkbox" name="ativo" defaultChecked={p ? p.ativo : true} className="h-5 w-5 accent-[#1f2a44]" /> À venda na loja</label>
    </>
  );
}

export function ProdutoLojaForm({ p }: { p: ProdutoLoja }) {
  const [s, acao, pend] = useActionState(salvarProdutoLoja, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={p.slug} />
      <Campos p={p} />
      <div className="flex flex-wrap items-center gap-3"><button className={btn} disabled={pend}>{pend ? "Salvando…" : "Salvar"}</button><Aviso s={s} /></div>
    </form>
  );
}

export function NovoProdutoLojaForm() {
  const [s, acao, pend] = useActionState(criarProdutoLoja, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <Campos />
      <div className="flex flex-wrap items-center gap-3"><button className={btn} disabled={pend}>{pend ? "Criando…" : "Criar produto"}</button><Aviso s={s} /></div>
    </form>
  );
}
