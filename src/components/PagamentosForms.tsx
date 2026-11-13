"use client";

import { useActionState, useState } from "react";
import { adicionarAoCurso, salvarConexaoMP, salvarProduto } from "@/app/pagamentos-actions";

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

export function ProdutoForm({ p }: { p: { slug: string; preco: number; desconto_pix: number; descricao: string | null; ativo: boolean; dias_apos_conclusao?: number; destaque?: string | null; topicos?: string[] | null } }) {
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
        <label htmlFor={`dias-${p.slug}`} className="text-[14px] font-semibold">Dias de acesso depois de concluir o curso</label>
        <input id={`dias-${p.slug}`} name="dias_apos_conclusao" type="number" min={0} max={365} defaultValue={p.dias_apos_conclusao ?? 30} className={`${campo} sm:max-w-[200px]`} />
        <span className="text-[13px] text-muted">Tempo para o aluno revisar antes da seleção. Use 0 para encerrar no mesmo dia.</span>
      </div>
      <p className="rounded-xl bg-soft px-4 py-3 text-[15px]">
        No checkout: <strong>{reais(n)}</strong> no cartão (até 12x, juros por conta do aluno) · <strong className="text-[#0f6b3a]">{reais(Math.round(n * (100 - d)) / 100)}</strong> no Pix
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor={`desc-${p.slug}`} className="text-[14px] font-semibold">Descrição</label>
        <textarea id={`desc-${p.slug}`} name="descricao" defaultValue={p.descricao ?? ""} rows={2} maxLength={500} className={campo} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`top-${p.slug}`} className="text-[14px] font-semibold">Principais tópicos na página Planos <span className="font-normal text-muted">(um por linha)</span></label>
        <textarea id={`top-${p.slug}`} name="topicos" defaultValue={(p.topicos ?? []).join("\n")} rows={6} className={campo} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`dest-${p.slug}`} className="text-[14px] font-semibold">Tarja de destaque <span className="font-normal text-muted">(opcional, ex.: Mais popular)</span></label>
        <input id={`dest-${p.slug}`} name="destaque" defaultValue={p.destaque ?? ""} maxLength={30} className={`${campo} sm:max-w-[320px]`} />
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

const ORIGENS = [
  ["cortesia", "Cortesia", "Sem pagamento (bolsa, parceria, presente)"],
  ["pix_direto", "Pix direto", "Pagou por Pix na sua conta"],
  ["presencial", "Curso presencial", "Pagou no curso presencial"],
  ["outro", "Outro", "Dinheiro, transferência, outra plataforma"],
] as const;

export function AdicionarAlunoForm({ emailInicial, nomeInicial, produtos, produtoInicial, agora, formas }: {
  emailInicial: string; nomeInicial: string; produtos: { slug: string; nome: string; preco: number }[]; produtoInicial: string; agora: string; formas: Record<string, string>;
}) {
  const [s, acao, pend] = useActionState(adicionarAoCurso, {});
  const [produto, setProduto] = useState(produtoInicial);
  const precoPadrao = String(produtos.find((p) => p.slug === produto)?.preco ?? "").replace(".", ",");
  const [origem, setOrigem] = useState("cortesia");
  const [forma, setForma] = useState("pix");
  const pago = origem !== "cortesia";
  const rot = "text-[14px] font-semibold";
  return (
    <form action={acao} className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="a-email" className={rot}>E-mail do aluno *</label>
          <input id="a-email" name="email" type="email" required defaultValue={emailInicial} className={campo} aria-describedby="a-email-ajuda" />
          <span id="a-email-ajuda" className="text-[13px] text-muted">Se ainda não tiver conta, o acesso fica reservado e libera quando ele se cadastrar com este e-mail.</span>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a-nome" className={rot}>Nome completo <span className="font-normal text-muted">(se não tiver conta)</span></label>
          <input id="a-nome" name="nome" defaultValue={nomeInicial} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a-whats" className={rot}>WhatsApp <span className="font-normal text-muted">(se não tiver conta)</span></label>
          <input id="a-whats" name="whatsapp" inputMode="tel" placeholder="11 98177-7605" className={campo} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${rot} mb-2`}>Curso *</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {produtos.map((p) => (
            <label key={p.slug} className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-2xl border-2 px-4 py-2.5 font-display font-extrabold ${produto === p.slug ? "border-navy bg-[#f4f6fb]" : "border-line"}`}>
              <input type="radio" name="produto" value={p.slug} checked={produto === p.slug} onChange={() => setProduto(p.slug)} className="h-4 w-4 accent-[#1f2a44]" />{p.nome}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${rot} mb-2`}>Como ele entra no curso? *</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ORIGENS.map(([k, r, d]) => (
            <label key={k} className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl border-2 px-4 py-2.5 ${origem === k ? "border-navy bg-[#f4f6fb]" : "border-line"}`}>
              <span className="flex items-center gap-2 font-display font-extrabold"><input type="radio" name="origem" value={k} checked={origem === k} onChange={() => setOrigem(k)} className="h-4 w-4 accent-[#1f2a44]" />{r}</span>
              <span className="text-[13px] text-ink-2">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {pago && (
        <div className="grid gap-4 rounded-2xl bg-soft p-4 md:grid-cols-3">
          <p className="text-[14px] text-ink-2 md:col-span-3">Vai para o <strong>Livro de compras</strong> como prova da venda (data e hora contam para os 7 dias de arrependimento).</p>
          <div className="flex flex-col gap-1"><label htmlFor="a-valor" className={rot}>Valor pago (R$) *</label><input key={produto} id="a-valor" name="valor" inputMode="decimal" defaultValue={precoPadrao} className={campo} /></div>
          <div className="flex flex-col gap-1">
            <label htmlFor="a-forma" className={rot}>Forma de pagamento *</label>
            <select id="a-forma" name="forma_pagamento" value={forma} onChange={(e) => setForma(e.target.value)} className={campo}>
              {Object.entries(formas).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {forma === "cartao_credito" && <div className="flex flex-col gap-1"><label htmlFor="a-parc" className={rot}>Parcelas</label><input id="a-parc" name="parcelas" type="number" min={1} max={36} defaultValue={1} className={campo} /></div>}
          <div className="flex flex-col gap-1"><label htmlFor="a-data" className={rot}>Data e hora do pagamento *</label><input id="a-data" name="comprada_em" type="datetime-local" defaultValue={agora} className={campo} /></div>
          <div className="flex flex-col gap-1"><label htmlFor="a-tx" className={rot}>ID do Pix / comprovante</label><input id="a-tx" name="id_transacao" placeholder="E2E… ou nº do recibo" className={campo} /></div>
          <div className="flex flex-col gap-1"><label htmlFor="a-doc" className={rot}>CPF <span className="font-normal text-muted">(opcional)</span></label><input id="a-doc" name="documento" className={campo} /></div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="a-obs" className={rot}>Observação <span className="font-normal text-muted">(opcional)</span></label>
        <input id="a-obs" name="observacao" placeholder={pago ? "Ex.: turma presencial de novembro, São Paulo" : "Ex.: bolsa para aluna destaque"} className={campo} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="avisar" defaultChecked className="h-5 w-5 accent-[#c8102e]" /> Avisar o aluno no WhatsApp
        </label>
        <button className={btn} disabled={pend}>{pend ? "Liberando…" : "Liberar acesso"}</button>
      </div>
      <Aviso s={s} />
    </form>
  );
}
