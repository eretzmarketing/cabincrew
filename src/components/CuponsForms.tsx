"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useMemo } from "react";
import { enviarCupomWhatsapp, salvarCupom } from "@/app/cupons-actions";
import { INTERVALOS, duracaoEstimada } from "@/lib/campanhas";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 py-3 text-[15px] outline-none focus:border-navy";
const rot = "text-[14px] font-semibold";

export type CupomAdmin = {
  codigo: string; parceiro: string | null; tipo: "percentual" | "valor"; valor: number; produtos: string[] | null;
  limite_usos: number | null; inicio: string | null; fim: string | null; ativo: boolean; observacao: string | null;
};
type Plano = { slug: string; nome: string; destino?: string };

/** Para onde o link do cupom leva: checkout do curso ou página da apostila. */
const destinoDe = (p: Plano) => p.destino ?? `/comprar/${p.slug}`;
const ehLoja = (p: Plano) => p.slug.startsWith("loja:");
function destinoInicial(planos: Plano[]) {
  if (planos.length === 1) return destinoDe(planos[0]);
  return planos.length && planos.every(ehLoja) ? "/loja" : "/planos";
}
function nomeDoDestino(d: string, planos: Plano[]) {
  if (d === "/planos") return planos.filter((p) => !ehLoja(p)).map((p) => p.nome).join(" ou ") || "os cursos da Cabin Crew";
  if (d === "/loja") return "as apostilas da loja Cabin Crew";
  return planos.find((p) => destinoDe(p) === d)?.nome ?? "";
}
function OpcoesDestino({ planos }: { planos: Plano[] }) {
  return (
    <>
      {planos.some((p) => !ehLoja(p)) && <option value="/planos">Página Planos (mostra todos os preços com desconto)</option>}
      {planos.some(ehLoja) && <option value="/loja">Página da Loja (todas as apostilas)</option>}
      {planos.filter((p) => p.slug !== "loja:*").map((p) => <option key={p.slug} value={destinoDe(p)}>{ehLoja(p) ? "Página da apostila" : "Checkout direto"}: {p.nome.replace(/^Apostila: /, "")}</option>)}
    </>
  );
}

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
        <legend className={`${rot} mb-1`}>Vale para <span className="font-normal text-muted">(nenhum marcado = todos os cursos; apostilas só se marcadas)</span></legend>
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
  const [destino, setDestino] = useState(destinoInicial(planos));
  const [copiado, setCopiado] = useState("");
  const link = `${site}${destino}?cupom=${codigo}`;
  const nomeDestino = destino === "/planos" ? "os planos da Cabin Crew" : nomeDoDestino(destino, planos) || "a Cabin Crew";
  const mensagem = `✈️ Você ganhou ${rotulo} em ${nomeDestino} com o cupom ${codigo}!\n\nO desconto já entra aplicado por este link:\n👉 ${link}`;
  const copiar = async (t: string, qual: string) => { await navigator.clipboard.writeText(t).catch(() => {}); setCopiado(qual); setTimeout(() => setCopiado(""), 2500); };
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-soft p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={`dest-${codigo}`} className={rot}>Link leva para</label>
        <select id={`dest-${codigo}`} value={destino} onChange={(e) => setDestino(e.target.value)} className={`${campo} py-2.5`}>
          <OpcoesDestino planos={planos} />
        </select>
      </div>
      <code className="rounded-xl bg-white px-3 py-2.5 text-[13px] break-all select-all">{link}</code>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copiar(link, "link")} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-white">{copiado === "link" ? "Link copiado ✓" : "Copiar link"}</button>
        <button type="button" onClick={() => copiar(mensagem, "msg")} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy px-4 text-[14px] font-semibold text-navy">{copiado === "msg" ? "Mensagem copiada ✓" : "Copiar mensagem pronta"}</button>
        <Link href={`/admin/cupons?enviar=${codigo}#enviar`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25d366] px-4 text-[14px] font-semibold text-[#0b3d20]">Enviar pelo WhatsApp para alunos</Link>
      </div>
    </div>
  );
}

type Aluno = { id: string; nome: string; whatsapp: string | null; escola: string | null };

/** Envio do cupom pelo WhatsApp da Cabin Crew: alunos da plataforma e/ou números digitados. */
export function EnviarCupomWhatsapp({ codigo, desconto, planos, site, alunos, conectado }: {
  codigo: string; desconto: string; planos: Plano[]; site: string; alunos: Aluno[]; conectado: boolean;
}) {
  const [s, acao, pend] = useActionState(enviarCupomWhatsapp, {});
  const [destino, setDestino] = useState(destinoInicial(planos));
  const curso = nomeDoDestino(destino, planos);
  const padrao = (d: string, c: string) => `Olá, {nome}! 🎁 Você está recebendo um cupom exclusivo de ${desconto} para ${c}.\n\nAproveite! O desconto já entra aplicado por este link:\n👉 ${site}${d}?cupom=${codigo}\n\nCupom: ${codigo}`;
  const [mensagem, setMensagem] = useState(padrao(destino, curso));
  const [editada, setEditada] = useState(false);
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [telefones, setTelefones] = useState("");
  const comWhats = useMemo(() => alunos.filter((a) => a.whatsapp), [alunos]);
  const q = busca.trim().toLowerCase();
  const filtrados = useMemo(() => (q ? comWhats.filter((a) => `${a.nome} ${a.whatsapp} ${a.escola ?? ""}`.toLowerCase().includes(q)) : comWhats), [comWhats, q]);
  const nManuais = telefones.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean).length;
  const total = sel.size + nManuais;
  const todosMarcados = filtrados.length > 0 && filtrados.every((a) => sel.has(a.id));
  const alternar = (id: string) => setSel((x) => { const n = new Set(x); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const [intervalo, setIntervalo] = useState("30-60");
  const iv = INTERVALOS.find((i) => i.id === intervalo)!;

  return (
    <form action={acao} className="flex flex-col gap-5">
      <input type="hidden" name="codigo" value={codigo} />
      <input type="hidden" name="ids" value={JSON.stringify([...sel])} />
      {!conectado && <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-[14px] font-semibold text-[#7a5a00]">Conecte o Wawp em Configurações › WhatsApp para enviar.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`env-dest-${codigo}`} className={rot}>Link leva para</label>
          <select id={`env-dest-${codigo}`} value={destino} className={`${campo} py-2.5`}
            onChange={(e) => { const d = e.target.value; setDestino(d); if (!editada) setMensagem(padrao(d, nomeDoDestino(d, planos))); }}>
            <OpcoesDestino planos={planos} />
          </select>
          <label htmlFor={`env-msg-${codigo}`} className={rot}>Mensagem <span className="font-normal text-muted">({"{nome}"} vira o primeiro nome do aluno)</span></label>
          <textarea id={`env-msg-${codigo}`} name="mensagem" rows={9} value={mensagem} onChange={(e) => { setMensagem(e.target.value); setEditada(true); }} className={campo} />
        </div>

        <div className="flex flex-col gap-2">
          <span className={rot}>Alunos da plataforma <span className="font-normal text-muted">({comWhats.length} com WhatsApp)</span></span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, WhatsApp ou escola" aria-label="Buscar aluno" className={`${campo} py-2.5`} />
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px] font-semibold">
            <input type="checkbox" checked={todosMarcados} onChange={() => setSel((x) => { const n = new Set(x); for (const a of filtrados) { if (todosMarcados) n.delete(a.id); else n.add(a.id); } return n; })} className="h-5 w-5 accent-[#1f2a44]" />
            {q ? `Selecionar os ${filtrados.length} encontrados` : "Selecionar todos"}
          </label>
          <ul className="max-h-[260px] overflow-auto rounded-xl border border-line bg-white">
            {filtrados.slice(0, 500).map((a) => (
              <li key={a.id} className="border-b border-[#eceef3] last:border-0">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-1.5 text-[14px]">
                  <input type="checkbox" checked={sel.has(a.id)} onChange={() => alternar(a.id)} className="h-5 w-5 shrink-0 accent-[#1f2a44]" />
                  <span className="min-w-0 flex-1"><strong className="block truncate">{a.nome}</strong><span className="text-[12px] text-muted">{a.whatsapp}{a.escola ? ` · ${a.escola}` : ""}</span></span>
                </label>
              </li>
            ))}
            {!filtrados.length && <li className="p-3 text-[14px] text-ink-2">Nenhum aluno encontrado.</li>}
          </ul>
          <label htmlFor={`env-tel-${codigo}`} className={rot}>Ou digite números <span className="font-normal text-muted">(um por linha)</span></label>
          <textarea id={`env-tel-${codigo}`} name="telefones" rows={3} value={telefones} onChange={(e) => setTelefones(e.target.value)} placeholder={"11 98177-7605\n+351 912 345 678"} className={campo} />
        </div>
      </div>

      {total > 1 && (
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-soft p-4">
          <legend className={`${rot} mb-1`}>Intervalo entre as mensagens</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {INTERVALOS.map((i) => (
              <label key={i.id} className="flex min-h-11 cursor-pointer items-center gap-2 text-[14px]">
                <input type="radio" name="intervalo" value={i.id} checked={intervalo === i.id} onChange={() => setIntervalo(i.id)} className="h-4 w-4 accent-[#1f2a44]" />{i.rotulo}
              </label>
            ))}
          </div>
          <span className="text-[13px] text-muted">Tempo estimado: {duracaoEstimada(total, iv.min, iv.max)}. Na próxima tela você clica em Começar e deixa a página aberta.</span>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">{total ? `${total} destinatário(s)` : "Escolha alunos ou digite números"}</span>
        <button disabled={pend || !total || !conectado} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-[#25d366] px-6 font-semibold text-[#0b3d20] disabled:cursor-not-allowed disabled:opacity-50">
          {pend ? "Enviando…" : total > 1 ? "Preparar envio com intervalo" : "Enviar agora"}
        </button>
      </div>
      {s.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>}
      {s.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>}
    </form>
  );
}
