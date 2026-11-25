"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AJUDA, FREQUENTES, type Categoria, type Pergunta } from "@/lib/ajuda";

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const textoPuro = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
/** Divide a resposta em abertura (1ª frase, ou 2 se a 1ª for curta) e o restante. */
function dividir(r: string): [string, string] {
  const re = /[.!?](\s+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(r))) {
    const fim = m.index + 1;
    if (textoPuro(r.slice(0, fim)).length >= 40 || fim >= r.length) return [r.slice(0, fim).trim(), r.slice(fim).trim()];
  }
  return [r.trim(), ""];
}
const resumo = (r: string) => textoPuro(dividir(r)[0]);

/** Converte [texto](/link) em links. */
function ComLinks({ r }: { r: string }) {
  return (
    <>
      {r.split(/(\[[^\]]+\]\([^)]+\))/g).map((pt, i) => {
        const m = pt.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        return m ? <Link key={i} href={m[2]} className="font-semibold text-navy underline underline-offset-4 hover:text-brand-strong">{m[1]}</Link> : <Fragment key={i}>{pt}</Fragment>;
      })}
    </>
  );
}

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-navy" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.8 10A10 10 0 1 1 17 3.3" /><path d="m9 11 3 3L22 4" />
    </svg>
  );
}

type Aberta = { cat: Categoria; it: Pergunta } | null;

/** Popup com a resposta completa (usa <dialog>: Esc e clique fora fecham). */
function Popup({ aberta, fechar }: { aberta: Aberta; fechar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);
  return (
    <dialog ref={ref} onClose={fechar} onClick={(e) => { if (e.target === e.currentTarget) fechar(); }} aria-labelledby="popup-titulo"
      className="m-auto w-[calc(100%-32px)] max-w-[640px] rounded-[24px] bg-white p-0 text-ink shadow-2xl backdrop:bg-navy/60 backdrop:backdrop-blur-[2px]">
      {aberta && (
        <div className="flex max-h-[85dvh] flex-col gap-5 overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-soft text-[28px]">{aberta.cat.icone}</span>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <span className="rounded-full border-2 border-navy px-3 py-0.5 text-[13px] font-bold text-navy">{aberta.cat.titulo}</span>
              <h2 id="popup-titulo" className="font-display text-[22px] leading-tight font-extrabold sm:text-[26px]">{aberta.it.p}</h2>
            </div>
            <button type="button" onClick={fechar} aria-label="Fechar" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-line text-[20px] text-navy hover:border-navy">✕</button>
          </div>
          {(() => {
            const [abre, resto] = dividir(aberta.it.r);
            return (
              <>
                <p className="text-[18px] leading-relaxed text-ink-2"><ComLinks r={abre} /></p>
                {resto && <div className="rounded-2xl bg-soft px-5 py-4 text-[16px] leading-relaxed"><ComLinks r={resto} /></div>}
              </>
            );
          })()}
          {aberta.it.dicas?.length ? (
            <div className="rounded-2xl border border-[#f3d9a4] bg-[#fff8ea] px-5 py-4">
              <p className="mb-2 flex items-center gap-2 font-display text-[18px] font-bold text-[#b45f06]"><span aria-hidden>💡</span>Dicas</p>
              <ul className="flex flex-col gap-1.5 text-[16px]">
                {aberta.it.dicas.map((d) => <li key={d} className="flex gap-2"><span aria-hidden className="text-[#e08a1e]">•</span>{d}</li>)}
              </ul>
            </div>
          ) : null}
          <p className="text-[14px] text-muted">Ainda com dúvida? <Link href="/conta/suporte?aba=novo" className="font-semibold text-navy underline underline-offset-4">Abra um chamado no suporte</Link>.</p>
        </div>
      )}
    </dialog>
  );
}

export default function CentralAjuda() {
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<Aberta>(null);
  const termo = semAcento(busca.trim());

  const filtradas = useMemo(() => AJUDA.map((c) => ({
    ...c,
    itens: c.itens.filter((it) => !termo || termo.split(/\s+/).every((t) => semAcento(`${c.titulo} ${it.p} ${textoPuro(it.r)} ${(it.dicas ?? []).join(" ")}`).includes(t))),
  })).filter((c) => c.itens.length), [termo]);
  const total = filtradas.reduce((s, c) => s + c.itens.length, 0);

  const frequentes = FREQUENTES.map(([cat, p]) => {
    const c = AJUDA.find((x) => x.id === cat);
    const it = c?.itens.find((x) => x.p === p);
    return c && it ? { c, it } : null;
  }).filter((x): x is { c: Categoria; it: Pergunta } => !!x);

  return (
    <>
      <section className="bg-navy px-6 pt-14 pb-16 text-white">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold">💬 Central de ajuda</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold sm:text-[44px]">Como podemos ajudar?</h1>
          <p className="text-[17px] text-white/80">Respostas e passo a passo sobre a plataforma, os cursos, os simulados e as compras.</p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-2 flex w-full">
            <label htmlFor="busca-ajuda" className="sr-only">Buscar na central de ajuda</label>
            <input id="busca-ajuda" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Busque por senha, certificado, Pix, simulado…"
              className="min-h-14 w-full rounded-2xl border-0 bg-white px-5 text-[17px] text-navy shadow-lg outline-none placeholder:text-muted focus-visible:ring-4 focus-visible:ring-brand-strong/50" />
          </form>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-6 py-14">
        <section aria-labelledby="topicos" className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 id="topicos" className="font-display text-[30px] font-extrabold">Tópicos de ajuda</h2>
            <p className="text-[16px] text-ink-2">Clique em qualquer item para ver as instruções completas</p>
          </div>
          {termo && (
            <p role="status" className="rounded-2xl border border-line bg-white px-5 py-4 text-center text-[16px]">
              {total ? <><strong>{total}</strong> {total === 1 ? "resposta encontrada" : "respostas encontradas"} para “{busca.trim()}”.</> : <>Nada encontrado para “{busca.trim()}”. Tente outra palavra ou fale com a gente aqui embaixo.</>}
            </p>
          )}
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((c) => (
              <article key={c.id} id={c.id} aria-labelledby={`t-${c.id}`} className="flex scroll-mt-24 flex-col gap-4 rounded-[24px] border border-line bg-white p-6 shadow-sm">
                <h3 id={`t-${c.id}`} className="flex items-center gap-3 font-display text-[20px] font-bold">
                  <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-[24px]">{c.icone}</span>{c.titulo}
                </h3>
                <ul className="flex flex-col gap-1">
                  {c.itens.map((it) => (
                    <li key={it.p}>
                      <button type="button" onClick={() => setAberta({ cat: c, it })}
                        className="group flex w-full cursor-pointer gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-soft focus-visible:bg-soft">
                        <Check />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-[16px] font-semibold text-navy group-hover:underline group-hover:underline-offset-4">{it.p}</span>
                          <span className="line-clamp-2 text-[14px] text-muted">{resumo(it.r)}</span>
                        </span>
                        <span aria-hidden className="self-center text-[18px] text-muted opacity-0 transition group-hover:opacity-100">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {!termo && (
          <section aria-labelledby="frequentes" className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 id="frequentes" className="font-display text-[30px] font-extrabold">Perguntas frequentes</h2>
              <p className="text-[16px] text-ink-2">Respostas rápidas para as dúvidas mais comuns</p>
            </div>
            <div className="border-t border-line">
              {frequentes.map(({ c, it }) => (
                <details key={it.p} className="group border-b border-line">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-4 text-[17px] font-semibold text-navy [&::-webkit-details-marker]:hidden">
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-navy text-[14px] font-bold">?</span>
                    <span className="flex-1">{it.p}</span>
                    <span aria-hidden className="text-[14px] transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="flex flex-col items-start gap-2 pb-5 pl-10 text-[16px] leading-relaxed text-ink-2">
                    <p><ComLinks r={it.r} /></p>
                    {it.dicas?.length ? <button type="button" onClick={() => setAberta({ cat: c, it })} className="cursor-pointer text-[14px] font-semibold text-navy underline underline-offset-4">Ver dicas</button> : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="ainda" className="flex flex-col items-center gap-4 rounded-[28px] bg-[#e9ebf1] px-6 py-12 text-center">
          <h2 id="ainda" className="font-display text-[28px] font-extrabold">Não encontrou o que procurava?</h2>
          <p className="max-w-[560px] text-[17px] text-ink-2">A nossa equipe está pronta para ajudar. Respondemos pelo site e avisamos você no WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/conta/suporte?aba=novo" className="inline-flex min-h-12 items-center rounded-xl bg-navy px-6 font-display font-bold text-white hover:bg-navy-deep">Abrir chamado no suporte</Link>
            <Link href="/contato" className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 font-display font-bold text-navy shadow-sm hover:bg-soft">Fale conosco</Link>
          </div>
        </section>
      </div>

      <Popup aberta={aberta} fechar={() => setAberta(null)} />
    </>
  );
}
