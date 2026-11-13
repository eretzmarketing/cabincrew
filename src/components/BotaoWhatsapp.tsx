"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { enviarMensagemAvulsa, listarModelosParaEnvio } from "@/app/whatsapp-actions";

type Modelo = { id: number; nome: string; texto: string; imagem: string | null };
export type Sugestao = { rotulo: string; texto: string };

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://cabincrew.com.br").replace(/\/$/, "");
// modelos carregados uma vez por página (vários botões na mesma lista)
let cache: Promise<Modelo[]> | null = null;

/** Ícone de conversa (balão) no verde do WhatsApp. */
export function IconeWhatsapp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M8.5 9.5c.3 1.6 1.4 3.6 3.4 4.8 1 .6 1.8.8 2.6.7l.9-1.1-1.6-1-.8.6c-.9-.4-1.8-1.3-2.2-2.2l.6-.8-1-1.6-1.1.9c-.2.2-.3.4-.3.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Botão só com o ícone: abre um popup para mandar mensagem pelo WhatsApp da Cabin Crew (Wawp),
 * escolhendo um modelo (com imagem) ou escrevendo um texto livre.
 */
export default function BotaoWhatsapp({ telefone, nome, userId, sugestoes = [], tamanho = "md" }: {
  telefone: string | null; nome: string; userId?: string | null; sugestoes?: Sugestao[]; tamanho?: "sm" | "md";
}) {
  const [aberto, setAberto] = useState(false);
  if (!telefone) return null;
  const d = tamanho === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} title={`WhatsApp: ${nome}`} aria-label={`Mandar mensagem no WhatsApp para ${nome}`}
        className={`inline-flex ${d} shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#25d366] text-[#128c4a] hover:bg-[#e9fbf0]`}>
        <IconeWhatsapp size={tamanho === "sm" ? 18 : 20} />
      </button>
      {aberto && <Popup telefone={telefone} nome={nome} userId={userId} sugestoes={sugestoes} fechar={() => setAberto(false)} />}
    </>
  );
}

function Popup({ telefone, nome, userId, sugestoes, fechar }: { telefone: string; nome: string; userId?: string | null; sugestoes: Sugestao[]; fechar: () => void }) {
  const [modelos, setModelos] = useState<Modelo[] | null>(null);
  const [escolha, setEscolha] = useState(sugestoes.length ? "s0" : "livre");
  const [texto, setTexto] = useState(sugestoes[0]?.texto ?? "");
  const [imagem, setImagem] = useState<string | null>(null);
  const [res, setRes] = useState<{ msg?: string; erro?: string }>({});
  const [pend, iniciar] = useTransition();
  const area = useRef<HTMLTextAreaElement>(null);
  const primeiro = nome.split(" ")[0];

  useEffect(() => {
    cache ??= listarModelosParaEnvio().catch(() => []);
    let ok = true;
    cache.then((m) => ok && setModelos(m));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => { ok = false; window.removeEventListener("keydown", esc); };
  }, [fechar]);

  function escolher(v: string) {
    setEscolha(v); setRes({});
    if (v === "livre") { setTexto(""); setImagem(null); setTimeout(() => area.current?.focus(), 0); return; }
    if (v.startsWith("s")) { setTexto(sugestoes[Number(v.slice(1))].texto); setImagem(null); return; }
    const m = modelos?.find((x) => `m${x.id}` === v);
    if (m) { setTexto(m.texto); setImagem(m.imagem); }
  }

  const previa = texto.replaceAll("{nome}", primeiro).replaceAll("{link}", SITE);
  const wa = `https://wa.me/${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(previa)}`;

  return (
    <div role="dialog" aria-modal="true" aria-label={`WhatsApp para ${nome}`} className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1220]/50 p-0 sm:items-center sm:p-4" onClick={fechar}>
      <div className="flex max-h-[92vh] w-full max-w-[560px] flex-col gap-4 overflow-auto rounded-t-[22px] bg-white p-5 text-left shadow-xl sm:rounded-[22px] sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="font-display text-xl font-extrabold">Mensagem para {nome}</h3>
            <span className="text-[14px] text-muted">{telefone}</span>
          </div>
          <button type="button" autoFocus onClick={fechar} aria-label="Fechar" className="-mt-1 -mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-ink-2 hover:bg-[#eceef3]">×</button>
        </div>

        {res.msg ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f6ec] text-2xl text-[#0f6b3a]">✓</span>
            <p className="font-semibold">{res.msg}</p>
            <button type="button" onClick={fechar} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-6 font-semibold text-white">Fechar</button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="wa-modelo" className="text-[14px] font-semibold">Mensagem</label>
              <select id="wa-modelo" value={escolha} onChange={(e) => escolher(e.target.value)} className="min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
                {sugestoes.map((s, i) => <option key={i} value={`s${i}`}>{s.rotulo}</option>)}
                <option value="livre">Texto livre</option>
                {modelos === null ? <option disabled>Carregando modelos…</option> : modelos.length > 0 && (
                  <optgroup label="Modelos">
                    {modelos.map((m) => <option key={m.id} value={`m${m.id}`}>{m.nome}{m.imagem ? " 🖼" : ""}</option>)}
                  </optgroup>
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="wa-texto" className="text-[14px] font-semibold">Texto <span className="font-normal text-muted">({"{nome}"} = {primeiro})</span></label>
              <textarea id="wa-texto" ref={area} rows={7} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva a mensagem…"
                className="w-full rounded-xl border border-[#c9cedb] px-4 py-3 text-[15px] outline-none focus:border-navy" />
            </div>
            {(previa.trim() || imagem) && (
              <div className="rounded-2xl bg-[#efeae2] p-3">
                <div className="ml-auto flex max-w-[92%] flex-col gap-2 rounded-xl rounded-tr-sm bg-[#d9fdd3] p-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagem do modelo, servida pela pasta de mídia */}
                  {imagem && <img src={`/midia/${imagem}`} alt="Imagem do modelo" className="max-h-[160px] w-auto self-start rounded-lg object-contain" />}
                  {previa.trim() && <p className="px-1 text-[14px] leading-relaxed whitespace-pre-wrap text-[#111b21]">{previa}</p>}
                </div>
                {imagem && <button type="button" onClick={() => setImagem(null)} className="mt-2 min-h-9 cursor-pointer text-[13px] font-semibold text-ink-2 underline underline-offset-4">Remover a imagem</button>}
              </div>
            )}
            {res.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{res.erro}</p>}
            <div className="sticky -bottom-5 -mx-5 -mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-3 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="min-h-10 py-2 text-[13px] font-semibold text-ink-2 underline underline-offset-4">Abrir no meu WhatsApp</a>
              <button type="button" disabled={pend || texto.trim().length < 2}
                onClick={() => iniciar(async () => setRes(await enviarMensagemAvulsa({ telefone, userId, nome, texto, imagem })))}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-[#25d366] px-6 font-semibold text-[#0b3d20] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                <IconeWhatsapp /> {pend ? "Enviando…" : "Enviar mensagem"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
