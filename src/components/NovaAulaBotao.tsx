"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TIPOS_AULA } from "@/components/admin-forms";

/** "+ Adicionar aula": primeiro escolhe o tipo (texto, vídeo, áudio, ao vivo, PDF, simulado). */
export default function NovaAulaBotao({ href }: { href: string }) {
  const [aberto, setAberto] = useState(false);
  const primeiro = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!aberto) return;
    primeiro.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aberto]);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-full border-2 border-dashed border-[#c9cedb] px-5 text-[14px] font-semibold text-navy hover:border-navy">+ Adicionar aula</button>
      {aberto && (
        <div role="dialog" aria-modal="true" aria-labelledby="tipo-aula-titulo" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(35,42,61,.6)] p-4" onClick={(e) => e.target === e.currentTarget && setAberto(false)}>
          <div className="flex w-full max-w-[640px] flex-col gap-4 rounded-[22px] bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="tipo-aula-titulo" className="font-display text-2xl font-extrabold">Que tipo de aula?</h2>
                <p className="text-[15px] text-ink-2">Escolha para continuar. Dá para mudar depois.</p>
              </div>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="-mt-1 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl text-muted hover:bg-soft">×</button>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TIPOS_AULA.map((t, i) => (
                <li key={t.k}>
                  <Link ref={i === 0 ? primeiro : undefined} href={`${href}&tipo=${t.k}`} className="flex h-full flex-col items-center gap-2 rounded-2xl border-2 border-line p-4 text-center text-navy hover:border-navy hover:bg-soft">
                    <span aria-hidden="true" className="text-3xl">{t.icone}</span>
                    <strong className="text-[15px]">{t.nome}</strong>
                    <span className="text-[12px] leading-snug text-muted">{t.dica}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
