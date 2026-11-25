"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { AJUDA, FREQUENTES } from "@/lib/ajuda";

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const textoPuro = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

/** Converte [texto](/link) em links. */
function Resposta({ r }: { r: string }) {
  const partes = r.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <p className="text-[16px] leading-relaxed text-ink-2">
      {partes.map((pt, i) => {
        const m = pt.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        return m ? <Link key={i} href={m[2]} className="font-semibold text-navy underline underline-offset-4 hover:text-brand-strong">{m[1]}</Link> : <Fragment key={i}>{pt}</Fragment>;
      })}
    </p>
  );
}

const idPergunta = (cat: string, i: number) => `${cat}-${i + 1}`;

export default function CentralAjuda() {
  const [busca, setBusca] = useState("");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const termo = semAcento(busca.trim());

  const filtradas = useMemo(() => AJUDA.map((c) => ({
    ...c,
    itens: c.itens.map((it, i) => ({ ...it, id: idPergunta(c.id, i) }))
      .filter((it) => !termo || termo.split(/\s+/).every((t) => semAcento(`${c.titulo} ${it.p} ${textoPuro(it.r)}`).includes(t))),
  })).filter((c) => c.itens.length), [termo]);
  const total = filtradas.reduce((s, c) => s + c.itens.length, 0);

  const alternar = (id: string, aberto: boolean) => setAbertas((a) => {
    const n = new Set(a);
    if (aberto) n.add(id); else n.delete(id);
    return n;
  });
  const abrir = (id: string) => {
    setBusca("");
    alternar(id, true);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <>
      <section className="bg-navy px-6 pt-14 pb-20 text-white">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold">💬 Central de ajuda</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold sm:text-[44px]">Como podemos ajudar?</h1>
          <p className="text-[17px] text-white/80">Respostas rápidas sobre a plataforma, os cursos, os simulados e as compras.</p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-2 flex w-full">
            <label htmlFor="busca-ajuda" className="sr-only">Buscar na central de ajuda</label>
            <input id="busca-ajuda" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Busque por senha, certificado, Pix, simulado…"
              className="min-h-14 w-full rounded-2xl border-0 bg-white px-5 text-[17px] text-navy shadow-lg outline-none placeholder:text-muted focus-visible:ring-4 focus-visible:ring-brand-strong/50" />
          </form>
        </div>
      </section>

      <div className="mx-auto -mt-10 flex max-w-[1000px] flex-col gap-12 px-6 pb-16">
        {!termo && (
          <>
            <nav aria-label="Tópicos de ajuda" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AJUDA.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-navy sm:p-5">
                  <span className="text-[26px]" aria-hidden>{c.icone}</span>
                  <strong className="font-display text-[17px] leading-tight">{c.titulo}</strong>
                  <span className="text-[14px] text-muted">{c.resumo}</span>
                </a>
              ))}
            </nav>

            <section aria-labelledby="frequentes" className="flex flex-col gap-3">
              <h2 id="frequentes" className="font-display text-2xl font-bold">Perguntas frequentes</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {FREQUENTES.map(([cat, p]) => {
                  const i = AJUDA.find((c) => c.id === cat)?.itens.findIndex((it) => it.p === p) ?? -1;
                  if (i < 0) return null;
                  return (
                    <li key={p}>
                      <button type="button" onClick={() => abrir(idPergunta(cat, i))}
                        className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 text-left text-[15px] font-semibold text-navy hover:border-navy">
                        {p}<span aria-hidden className="text-brand-strong">→</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {termo && (
          <p role="status" className="rounded-2xl border border-line bg-white px-5 py-4 text-[16px] shadow-sm">
            {total ? <><strong>{total}</strong> {total === 1 ? "resposta encontrada" : "respostas encontradas"} para “{busca.trim()}”.</> : <>Nada encontrado para “{busca.trim()}”. Tente outra palavra ou fale com a gente aqui embaixo.</>}
          </p>
        )}

        {filtradas.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`t-${c.id}`} className="flex scroll-mt-24 flex-col gap-3">
            <h2 id={`t-${c.id}`} className="flex items-center gap-2 font-display text-2xl font-bold"><span aria-hidden>{c.icone}</span>{c.titulo}</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {c.itens.map((it) => (
                <details key={it.id} id={it.id} open={!!termo || abertas.has(it.id)} onToggle={(e) => !termo && alternar(it.id, e.currentTarget.open)}
                  className="group scroll-mt-24 border-b border-line last:border-b-0">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-[16px] font-semibold text-navy hover:bg-soft [&::-webkit-details-marker]:hidden">
                    {it.p}
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft text-[18px] transition group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5"><Resposta r={it.r} /></div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="ainda" className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-8 text-center shadow-sm ring-1 ring-line">
          <span className="text-[34px]" aria-hidden>🙋</span>
          <h2 id="ainda" className="font-display text-2xl font-bold">Não encontrou o que procurava?</h2>
          <p className="max-w-[520px] text-[16px] text-ink-2">A nossa equipe responde pelo site e avisa você no WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/conta/suporte?aba=novo" className="inline-flex min-h-12 items-center rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Abrir chamado no suporte</Link>
            <Link href="/contato" className="inline-flex min-h-12 items-center rounded-full border-2 border-navy px-6 font-display font-bold text-navy hover:bg-soft">Ainda não tenho conta</Link>
          </div>
        </section>
      </div>
    </>
  );
}
