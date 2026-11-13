"use client";

import { useState } from "react";

export function BotoesCertificado({ link, linkedin }: { link: string; linkedin: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="nao-imprimir flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-navy px-6 font-semibold text-white hover:bg-navy-deep">⬇ Baixar em PDF</button>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border-2 border-navy px-6 font-semibold text-navy hover:bg-navy hover:text-white">Adicionar ao LinkedIn</a>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }}
        className="inline-flex min-h-12 cursor-pointer items-center rounded-full border-2 border-line px-6 font-semibold text-navy">{copiado ? "Link copiado ✓" : "Copiar link de verificação"}</button>
      <p className="w-full text-center text-[13px] text-muted">No “Baixar em PDF”, escolha <strong>Salvar como PDF</strong>, orientação <strong>Paisagem</strong> e desmarque “Cabeçalhos e rodapés”.</p>
    </div>
  );
}
