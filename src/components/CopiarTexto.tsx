"use client";

import { useState } from "react";

export default function CopiarTexto({ texto, rotulo = "Copiar roteiro" }: { texto: string; rotulo?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 2000); } catch { setOk(false); }
      }}
      className="min-h-10 cursor-pointer rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep"
    >
      {ok ? "✓ Copiado" : rotulo}
    </button>
  );
}
