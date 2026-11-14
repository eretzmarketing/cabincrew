"use client";

import { useActionState } from "react";
import { atualizarEntregasAgora, atualizarEtiqueta, cancelarEtiquetaPedido, criarProdutoLoja, gerarEtiqueta, marcarEnviado, salvarProdutoLoja, salvarSuperfrete } from "@/app/loja-actions";
import type { Remetente } from "@/lib/superfrete";
import type { ProdutoLoja } from "@/lib/loja";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-navy";
const rot = "flex flex-col gap-1 text-[13px] font-semibold";
const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy-deep disabled:opacity-50";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-3 py-2 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-3 py-2 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

export function EnviarPedidoForm({ id, rastreio, temTelefone, enviado }: { id: number; rastreio: string | null; temTelefone: boolean; enviado: boolean }) {
  const [s, acao, pend] = useActionState(marcarEnviado, {});
  return (
    <form action={acao} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-2">
        <label className={`${rot} min-w-[200px] flex-1`}>Código de rastreio
          <input key={rastreio ?? ""} name="rastreio" defaultValue={rastreio ?? ""} placeholder="AB123456789BR" autoComplete="off" className={`${campo} font-mono uppercase`} />
        </label>
        <button className={btn} disabled={pend}>{pend ? "Salvando…" : enviado ? "Atualizar rastreio" : "Marcar como enviado"}</button>
      </div>
      {temTelefone && (
        <label className="inline-flex items-center gap-2 text-[14px]"><input type="checkbox" name="avisar" defaultChecked={!enviado} className="h-4 w-4 accent-[#1f2a44]" /> Avisar o aluno no WhatsApp com o código</label>
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
      <fieldset className="grid gap-3 rounded-xl bg-soft p-3 md:grid-cols-4">
        <legend className="px-1 text-[13px] font-semibold">Envelope para a etiqueta <span className="font-normal text-muted">· cabem até 3 apostilas em cada envelope; acima disso, a altura e o peso somam</span></legend>
        <label className={rot}>Peso (g)<input name="peso_g" inputMode="numeric" defaultValue={v(p?.peso_g ?? 1000)} className={campo} /></label>
        <label className={rot}>Altura (cm)<input name="altura_cm" inputMode="decimal" defaultValue={v(p?.altura_cm ?? 5)} className={campo} /></label>
        <label className={rot}>Largura (cm)<input name="largura_cm" inputMode="decimal" defaultValue={v(p?.largura_cm ?? 25)} className={campo} /></label>
        <label className={rot}>Comprimento (cm)<input name="comprimento_cm" inputMode="decimal" defaultValue={v(p?.comprimento_cm ?? 30)} className={campo} /></label>
      </fieldset>
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

const SERVICOS_ETIQUETA = [{ id: 1, nome: "PAC" }, { id: 2, nome: "SEDEX" }, { id: 17, nome: "Mini Envios" }, { id: 31, nome: "Loggi" }];

/** Etiqueta do SuperFrete de um pedido: gerar (um clique), imprimir, atualizar e cancelar. */
export function EtiquetaPedido({ id, etiquetaId, status, url, servico, preco, servicoPadrao, conectado }: {
  id: number; etiquetaId: string | null; status: string | null; url: string | null; servico: number | null; preco: number | null; servicoPadrao: number; conectado: boolean;
}) {
  const [sg, gerar, pg] = useActionState(gerarEtiqueta, {});
  const [sa, atualizar, pa] = useActionState(atualizarEtiqueta, {});
  const [sc, cancelar, pc] = useActionState(cancelarEtiquetaPedido, {});
  const ultimo = [sc, sa, sg].find((x) => x.msg || x.erro) ?? {};
  const temEtiqueta = !!etiquetaId && status !== "canceled";
  const paga = temEtiqueta && !!status && !["pending", "criando"].includes(status);
  if (!conectado) return <p className="rounded-xl bg-[#fff8e6] px-3 py-2 text-[14px] text-[#7a5a00]">Para gerar etiquetas, conecte o SuperFrete em <a href="/admin/envios" className="font-semibold underline">Configurações › Envios</a>.</p>;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
      <span className="text-[13px] font-semibold text-muted">Etiqueta SuperFrete</span>
      {!temEtiqueta ? (
        <form action={gerar} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <label className="sr-only" htmlFor={`serv-${id}`}>Serviço</label>
          <select id={`serv-${id}`} name="servico" defaultValue={servicoPadrao} className="min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
            {SERVICOS_ETIQUETA.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
          </select>
          <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep disabled:opacity-60" disabled={pg}>{pg ? "Gerando a etiqueta…" : "🏷️ Gerar etiqueta"}</button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {paga && url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep">🖨️ Imprimir etiqueta</a>}
          <span className="text-[14px] text-ink-2">{SERVICOS_ETIQUETA.find((x) => x.id === servico)?.nome ?? ""}{preco ? ` · ${Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""} · {paga ? (status === "posted" ? "postada" : status === "delivered" ? "entregue" : "paga") : "no carrinho do SuperFrete (não paga)"}</span>
          <form action={atualizar}><input type="hidden" name="id" value={id} /><button className="min-h-10 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold disabled:opacity-60" disabled={pa}>{pa ? "Atualizando…" : paga && url ? "Atualizar" : "Atualizar etiqueta"}</button></form>
          <form action={cancelar} onSubmit={(e) => { if (!confirm("Cancelar esta etiqueta no SuperFrete?")) e.preventDefault(); }}>
            <input type="hidden" name="id" value={id} />
            <button className="min-h-10 cursor-pointer rounded-full px-3 text-[13px] font-semibold text-brand-deep underline underline-offset-4 disabled:opacity-60" disabled={pc}>{pc ? "Cancelando…" : "Cancelar etiqueta"}</button>
          </form>
        </div>
      )}
      <Aviso s={ultimo} />
    </div>
  );
}

const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

/** Configurações › Envios: token do SuperFrete e endereço de quem envia. */
export function SuperfreteForm({ conectado, sandbox, servico, r }: { conectado: boolean; sandbox: boolean; servico: number; r: Partial<Remetente> }) {
  const [s, acao, pend] = useActionState(salvarSuperfrete, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className={rot}>Token do SuperFrete
        <input name="token" type="password" autoComplete="new-password" spellCheck={false} placeholder={conectado ? "salvo (deixe em branco para manter)" : "cole o token"} className={campo} />
      </label>
      <label className="inline-flex items-center gap-2 text-[14px]"><input type="checkbox" name="sandbox" defaultChecked={sandbox} className="h-4 w-4 accent-[#1f2a44]" /> Modo de teste (sandbox): as etiquetas não valem para postagem</label>
      <h3 className="pt-2 font-display font-bold">Remetente (quem envia)</h3>
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <label className={rot}>Nome completo ou razão social<input name="nome" defaultValue={r.nome ?? ""} className={campo} /></label>
        <label className={rot}>CPF ou CNPJ<input name="documento" inputMode="numeric" defaultValue={r.documento ?? ""} className={campo} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-[140px_1fr_110px]">
        <label className={rot}>CEP<input name="cep" inputMode="numeric" defaultValue={r.cep ?? ""} className={campo} /></label>
        <label className={rot}>Rua<input name="rua" maxLength={50} defaultValue={r.rua ?? ""} className={campo} /></label>
        <label className={rot}>Número<input name="numero" maxLength={10} defaultValue={r.numero ?? ""} className={campo} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_90px]">
        <label className={rot}>Complemento<input name="complemento" maxLength={20} defaultValue={r.complemento ?? ""} className={campo} /></label>
        <label className={rot}>Bairro<input name="bairro" defaultValue={r.bairro ?? ""} className={campo} /></label>
        <label className={rot}>Cidade<input name="cidade" defaultValue={r.cidade ?? ""} className={campo} /></label>
        <label className={rot}>UF<select name="uf" defaultValue={r.uf ?? ""} className={campo}><option value="">–</option>{UFS.map((u) => <option key={u}>{u}</option>)}</select></label>
      </div>
      <label className={`${rot} max-w-[260px]`}>Serviço padrão da etiqueta
        <select name="servico" defaultValue={servico} className={campo}>{SERVICOS_ETIQUETA.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
      </label>
      <div className="flex flex-wrap items-center gap-3"><button className={btn} disabled={pend}>{pend ? "Testando…" : conectado ? "Salvar e testar" : "Conectar"}</button><Aviso s={s} /></div>
    </form>
  );
}

export function AtualizarEntregas() {
  const [s, acao, pend] = useActionState(atualizarEntregasAgora, {});
  return (
    <form action={acao} className="flex flex-col items-start gap-2">
      <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy bg-white px-4 text-[14px] font-semibold text-navy hover:bg-soft disabled:opacity-50" disabled={pend}>
        {pend ? "Conferindo no SuperFrete…" : "🔄 Conferir entregas agora"}
      </button>
      <Aviso s={s} />
    </form>
  );
}
