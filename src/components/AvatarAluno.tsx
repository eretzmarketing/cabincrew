"use client";

import { useState } from "react";

/** Foto do aluno; se não houver ou não carregar, mostra as iniciais. */
export default function AvatarAluno({ src, nome, tamanho = 40 }: { src: string | null; nome: string; tamanho?: number }) {
  const [falhou, setFalhou] = useState(false);
  const iniciais = nome.split(/\s+/).filter(Boolean).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const estilo = { width: tamanho, height: tamanho };
  if (!src || falhou) {
    return <span aria-hidden="true" style={estilo} className="flex shrink-0 items-center justify-center rounded-full bg-[#e3e6ee] font-display text-[14px] font-bold text-navy">{iniciais}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element -- foto do aluno (storage)
  return <img src={src} alt="" width={tamanho} height={tamanho} style={estilo} onError={() => setFalhou(true)} className="shrink-0 rounded-full object-cover" />;
}
