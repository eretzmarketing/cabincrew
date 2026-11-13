"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type TipoItem = "texto" | "video" | "pdf" | "simulado" | "audio" | "treino";
export type ItemCurso = {
  href: string; titulo: string; tipo: TipoItem; minutos?: number | null;
  feita?: boolean; bloqueada?: boolean; atual?: boolean;
  /** Atalho para um treino (não entra na contagem de aulas). */
  extra?: boolean;
};
export type SecaoCurso = { id: string; rotulo: string; titulo: string; href?: string; atual?: boolean; itens: ItemCurso[] };

const ROTULO_TIPO: Record<TipoItem, string> = { texto: "Leitura", video: "Vídeo", pdf: "Material", simulado: "Simulado", audio: "Aula com áudio", treino: "Treino" };

function IconeTipo({ tipo }: { tipo: TipoItem }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (tipo) {
    case "video": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></svg>;
    case "audio": return <svg {...p}><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11" /></svg>;
    case "simulado": return <svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 12l2 2 4-4" /></svg>;
    case "pdf": return <svg {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
    case "treino": return <svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></svg>;
    default: return <svg {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></svg>;
  }
}

function Estado({ i }: { i: ItemCurso }) {
  if (i.extra) return <span aria-hidden="true" className="text-[15px] text-muted">→</span>;
  if (i.feita) return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1f9d55] text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      <span className="sr-only">concluída</span>
    </span>
  );
  if (i.bloqueada) return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-muted">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
      <span className="sr-only">bloqueada</span>
    </span>
  );
  return <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full border-2 border-[#c9cedb] bg-white" />;
}

export default function CursoPlayer({
  curso, voltar, secoes, feitas, total, rodape, children,
}: {
  curso: string;
  voltar: { href: string; rotulo: string };
  secoes: SecaoCurso[];
  feitas: number;
  total: number;
  rodape?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const path = usePathname();
  const lista = useRef<HTMLDivElement>(null);
  const atualRef = useRef<HTMLAnchorElement>(null);
  const pct = total ? Math.round((feitas / total) * 100) : 0;

  // fecha a gaveta (celular) ao trocar de aula
  useEffect(() => { setAberto(false); }, [path]); // eslint-disable-line react-hooks/set-state-in-effect -- fechar ao navegar

  // leva a aula atual para o meio da lista lateral, sem rolar a página
  useEffect(() => {
    const c = lista.current, a = atualRef.current;
    if (c && a) c.scrollTop = a.offsetTop - c.clientHeight / 2 + a.clientHeight / 2;
  }, [path]);

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aberto]);

  const progresso = (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px] font-semibold"><span>{feitas} de {total} aulas</span><span>{pct}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e3e6ee]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso no curso ${curso}`}>
        <div className="h-full rounded-full bg-brand-strong" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );

  return (
    <div className="bg-soft lg:grid lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
      {aberto && <button type="button" aria-label="Fechar o conteúdo do curso" onClick={() => setAberto(false)} className="fixed inset-0 z-40 bg-navy/50 lg:hidden" />}

      <aside id="conteudo-curso" aria-label={`Conteúdo do curso ${curso}`}
        className={`fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-[380px] flex-col border-r border-line bg-white shadow-2xl transition-transform duration-200 lg:sticky lg:self-start lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col gap-3 border-b border-line p-5">
          <div className="flex items-center justify-between gap-2">
            <Link href={voltar.href} className="text-sm font-semibold text-muted hover:text-navy">← {voltar.rotulo}</Link>
            <button type="button" onClick={() => setAberto(false)} className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl hover:bg-soft lg:hidden" aria-label="Fechar">✕</button>
          </div>
          <strong className="font-display text-[20px] leading-tight">{curso}</strong>
          {progresso}
        </div>

        <div ref={lista} className="relative flex-1 overflow-y-auto overscroll-contain">
          {secoes.map((s) => {
            const aulas = s.itens.filter((i) => !i.extra);
            const ok = aulas.filter((i) => i.feita).length;
            return (
              <details key={s.id} open={s.atual} className="group border-b border-line">
                <summary className={`flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden ${s.atual ? "bg-navy text-white" : "bg-[#f4f5f8] text-navy hover:bg-[#eceef3]"}`}>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-[12px] font-bold tracking-[.06em] uppercase ${s.atual ? "text-[#ffb3c4]" : "text-brand-strong"}`}>{s.rotulo}</span>
                    <span className="font-display text-[15px] leading-snug font-bold">{s.titulo}</span>
                  </span>
                  {aulas.length > 0 && <span className={`text-[13px] font-semibold ${s.atual ? "text-[#d7dbe6]" : "text-muted"}`}>{ok}/{aulas.length}</span>}
                  <span aria-hidden="true" className="text-xs transition-transform group-open:rotate-180">▼</span>
                </summary>
                <ul>
                  {s.itens.map((i) => {
                    const corpo = (
                      <>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-[15px] leading-snug">{i.titulo}</span>
                          <span className={`flex items-center gap-1.5 text-[13px] ${i.extra ? "text-brand-strong" : "text-muted"}`}>
                            <IconeTipo tipo={i.tipo} /> {ROTULO_TIPO[i.tipo]}{i.minutos ? ` · ${i.minutos} min` : ""}
                          </span>
                        </span>
                        <Estado i={i} />
                      </>
                    );
                    const cls = `flex items-center gap-3 border-l-4 px-5 py-3.5 ${i.atual ? "border-brand-strong bg-[#fdf1f4] font-semibold" : "border-transparent"}`;
                    return (
                      <li key={i.href} className="border-t border-[#eceef3] first:border-0">
                        {i.bloqueada && !i.atual
                          ? <div aria-disabled="true" className={`${cls} text-muted`}>{corpo}</div>
                          : <Link ref={i.atual ? atualRef : undefined} href={i.href} aria-current={i.atual ? "page" : undefined} className={`${cls} text-navy hover:bg-soft`}>{corpo}</Link>}
                      </li>
                    );
                  })}
                  {s.href && <li className="border-t border-[#eceef3]"><Link href={s.href} className="block px-5 py-3 text-[13px] font-semibold text-muted hover:text-navy">Ver a página do módulo</Link></li>}
                </ul>
              </details>
            );
          })}
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setAberto(true)} aria-expanded={aberto} aria-controls="conteudo-curso"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-navy px-4 text-[14px] font-semibold text-navy">
            <span aria-hidden="true">☰</span> Conteúdo do curso
          </button>
          <span className="ml-auto text-[13px] font-semibold text-muted">{pct}%</span>
        </div>

        <div className="mx-auto w-full max-w-[880px] flex-1 px-4 pt-6 pb-12 md:px-8 md:pt-10">{children}</div>

        {rodape && (
          <div className="sticky bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[880px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">{rodape}</div>
          </div>
        )}
      </div>
    </div>
  );
}
