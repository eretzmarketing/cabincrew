"use client";

import { useActionState, useState } from "react";
import { salvarCupom } from "@/app/cupons-actions";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 py-3 text-[15px] outline-none focus:border-navy";
const rot = "text-[14px] font-semibold";

export type CupomAdmin = {
  codigo: string; parceiro: string | null; tipo: "percentual" | "valor"; valor: number; produtos: string[] | null;
  limite_usos: number | null; inicio: string | null; fim: string | null; ativo: boolean; observacao: string | null;
};
type Plano = { slug: string; nome: string };

const diaBR = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }) : "");

export function CupomForm({ c, planos }: { c?: CupomAdmin; planos: Plano[] }) {
  const [s, acao, pend] = useActionState(salvarCupom, {});
  const [tipo, setTipo] = useState(c?.tipo ?? "percentual");
  return (
    <form action={acao} className="flex flex-col gap-4">
      {c && <input type="hidden" name="original" value={c.codigo} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`cod-${c?.codigo ?? "novo"}`} className={rot}>Código do cupom *</label>
          <input id={`cod-${c?.codigo ?? "novo"}`} name="codigo" defaultValue={c?.codigo} required maxLength={30} placeholder="ESCOLA10"
            onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""); }}
            className={`${campo} font-semibold tracking-wide uppercase`} />
          <span className="text-[13px] text-muted">Letras, números, - e _. É o que o aluno digita no checkout.</span>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`par-${c?.codigo ?? "novo"}`} className={rot}>Parceiro ou escola</label>
          <input id={`par-${c?.codigo ?? "novo"}`} name="parceiro" defaultValue={c?.parceiro ?? ""} placeholder="Ex.: Escola Voar Alto" className={campo} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <fieldset className="flex flex-col gap-1">
          <legend className={`${rot} mb-1`}>Tipo de desconto *</legend>
          <div className="flex gap-2">
            {([["percentual", "%"], ["valor", "R$"]] as const).map(([k, r]) => (
              <label key={k} className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 font-semibold ${tipo === k ? "border-navy bg-[#f4f6fb]" : "border-line"}`}>
                <input type="radio" name="tipo" value={k} checked={tipo === k} onChange={() => setTipo(k)} className="sr-only" />{r === "%" ? "Porcentagem (%)" : "Valor (R$)"}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1">
          <label htmlFor={`val-${c?.codigo ?? "novo"}`} className={rot}>{tipo === "percentual" ? "Desconto (%) *" : "Desconto (R$) *"}</label>
          <input id={`val-${c?.codigo ?? "novo"}`} name="valor" inputMode="decimal" required defaultValue={c ? String(c.valor).replace(".", ",") : ""} placeholder={tipo === "percentual" ? "10" : "50,00"} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`lim-${c?.codigo ?? "novo"}`} className={rot}>Quantidade de usos</label>
          <input id={`lim-${c?.codigo ?? "novo"}`} name="limite_usos" inputMode="numeric" defaultValue={c?.limite_usos ?? ""} placeholder="Ilimitado" className={campo} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`ini-${c?.codigo ?? "novo"}`} className={rot}>Vale a partir de</label>
          <input id={`ini-${c?.codigo ?? "novo"}`} name="inicio" type="date" defaultValue={diaBR(c?.inicio ?? null)} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`fim-${c?.codigo ?? "novo"}`} className={rot}>Vale até (inclusive)</label>
          <input id={`fim-${c?.codigo ?? "novo"}`} name="fim" type="date" defaultValue={diaBR(c?.fim ?? null)} className={campo} />
        </div>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className={`${rot} mb-1`}>Vale para <span className="font-normal text-muted">(nenhum marcado = todos os planos)</span></legend>
        <div className="flex flex-wrap gap-2">
          {planos.map((p) => (
            <label key={p.slug} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-line px-4 text-[15px] font-semibold">
              <input type="checkbox" name="produtos" value={p.slug} defaultChecked={c?.produtos?.includes(p.slug)} className="h-5 w-5 accent-[#1f2a44]" />{p.nome}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-1">
        <label htmlFor={`obs-${c?.codigo ?? "novo"}`} className={rot}>Observação interna</label>
        <input id={`obs-${c?.codigo ?? "novo"}`} name="observacao" defaultValue={c?.observacao ?? ""} placeholder="Ex.: parceria fechada em novembro, comissão 10%" className={campo} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="ativo" defaultChecked={c?.ativo ?? true} className="h-5 w-5 accent-[#c8102e]" /> Ativo
        </label>
        <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:opacity-50" disabled={pend}>{pend ? "Salvando…" : c ? "Salvar cupom" : "Criar cupom"}</button>
      </div>
      {s.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>}
    </form>
  );
}

/** Link com o cupom já aplicado: copiar ou mandar pelo WhatsApp. */
export function CompartilharCupom({ codigo, rotulo, planos, site }: { codigo: string; rotulo: string; planos: Plano[]; site: string }) {
  const [destino, setDestino] = useState(planos.length === 1 ? `/comprar/${planos[0].slug}` : "/planos");
  const [copiado, setCopiado] = useState("");
  const link = `${site}${destino}?cupom=${codigo}`;
  const nomeDestino = destino === "/planos" ? "os planos da Cabin Crew" : planos.find((p) => destino.endsWith(p.slug))?.nome ?? "a Cabin Crew";
  const mensagem = `✈️ Você ganhou ${rotulo} em ${nomeDestino} com o cupom ${codigo}!\n\nO desconto já entra aplicado por este link:\n👉 ${link}`;
  const copiar = async (t: string, qual: string) => { await navigator.clipboard.writeText(t).catch(() => {}); setCopiado(qual); setTimeout(() => setCopiado(""), 2500); };
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-soft p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={`dest-${codigo}`} className={rot}>Link leva para</label>
        <select id={`dest-${codigo}`} value={destino} onChange={(e) => setDestino(e.target.value)} className={`${campo} py-2.5`}>
          <option value="/planos">Página Planos (mostra todos os preços com desconto)</option>
          {planos.map((p) => <option key={p.slug} value={`/comprar/${p.slug}`}>Checkout direto: {p.nome}</option>)}
        </select>
      </div>
      <code className="rounded-xl bg-white px-3 py-2.5 text-[13px] break-all select-all">{link}</code>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copiar(link, "link")} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-white">{copiado === "link" ? "Link copiado ✓" : "Copiar link"}</button>
        <button type="button" onClick={() => copiar(mensagem, "msg")} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy px-4 text-[14px] font-semibold text-navy">{copiado === "msg" ? "Mensagem copiada ✓" : "Copiar mensagem pronta"}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25d366] px-4 text-[14px] font-semibold text-[#0b3d20]">Enviar pelo WhatsApp</a>
      </div>
    </div>
  );
}
