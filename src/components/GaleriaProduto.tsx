"use client";

import { useState } from "react";

/** Fotos do produto: a grande em cima e as miniaturas para trocar. */
export default function GaleriaProduto({ imagens, nome }: { imagens: string[]; nome: string }) {
  const [i, setI] = useState(0);
  if (!imagens.length) return <div className="aspect-[3/4] rounded-[22px] bg-white" />;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[22px] bg-white p-4 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem da galeria de mídia */}
        <img src={imagens[i]} alt={nome} className="max-h-full max-w-full object-contain" />
      </div>
      {imagens.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {imagens.map((src, k) => (
            <button key={src + k} type="button" onClick={() => setI(k)} aria-label={`Foto ${k + 1}`} aria-pressed={i === k}
              className={`h-20 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-1 ${i === k ? "border-navy" : "border-line"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
