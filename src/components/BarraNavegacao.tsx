"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Barrinha vermelha no topo que aparece no instante do clique num link do site
 * e some quando a nova página abre. Também evita o clique repetido no mesmo link.
 */
export default function BarraNavegacao() {
  const path = usePathname();
  const busca = useSearchParams();
  const [ativo, setAtivo] = useState(false);
  const indo = useRef<string | null>(null);

  // nova página aberta: termina a barra
  useEffect(() => {
    indo.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reação à troca de rota
    setAtivo(false);
  }, [path, busca]);

  useEffect(() => {
    function clique(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target && a.target !== "_self" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      const atual = location.pathname + location.search;
      const destino = url.pathname + url.search;
      if (destino === atual) return; // mesmo endereço (ou só âncora)
      if (indo.current === destino) { e.preventDefault(); return; } // clique repetido: já está carregando
      indo.current = destino;
      setAtivo(true);
    }
    // se a navegação falhar ou for cancelada, a barra some sozinha
    let t: ReturnType<typeof setTimeout> | undefined;
    const limpar = () => { clearTimeout(t); t = setTimeout(() => { indo.current = null; setAtivo(false); }, 15000); };
    document.addEventListener("click", clique, true);
    document.addEventListener("click", limpar);
    return () => { document.removeEventListener("click", clique, true); document.removeEventListener("click", limpar); clearTimeout(t); };
  }, []);

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] ${ativo ? "opacity-100" : "opacity-0 transition-opacity duration-300"}`}>
      <div className={`h-full bg-brand shadow-[0_0_8px_rgba(239,0,54,.6)] ${ativo ? "cc-barra-indo" : "w-full"}`} />
    </div>
  );
}
