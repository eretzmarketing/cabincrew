"use client";

import "flag-icons/css/flag-icons.min.css";
import { useEffect, useId, useRef, useState } from "react";
import { PAISES, exemploTelefone, formatarTelefone, paisPorIso, telefoneInternacional, type Pais } from "@/lib/paises";

export const Bandeira = ({ iso }: { iso: string }) => (
  <span aria-hidden="true" className={`fi fi-${iso.toLowerCase()} shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.08)]`} />
);

/** Seletor de país com bandeira + DDI. */
export function SeletorPais({ pais, onChange }: { pais: Pais; onChange: (p: Pais) => void }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const lista = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    caixa.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={lista}
        aria-label={`País: ${pais.nome} (+${pais.ddi}). Trocar país`}
        className="flex h-full min-h-14 cursor-pointer items-center gap-2 rounded-l-xl border-r border-[#d5d9e3] bg-soft px-3.5 text-[16px] font-semibold text-navy hover:bg-[#eceef3]"
      >
        <Bandeira iso={pais.iso} />
        <span>+{pais.ddi}</span>
        <span aria-hidden="true" className="text-xs text-muted">▾</span>
      </button>
      {aberto && (
        <ul
          id={lista}
          role="listbox"
          aria-label="Escolha o país"
          className="absolute bottom-full left-0 z-30 mb-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[0_18px_40px_-16px_rgba(35,42,61,.45)] md:top-full md:bottom-auto md:mt-2 md:mb-0"
        >
          {PAISES.map((p) => (
            <li key={p.iso}>
              <button
                type="button"
                role="option"
                aria-selected={p.iso === pais.iso}
                onClick={() => {
                  onChange(p);
                  setAberto(false);
                }}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-3 px-3.5 text-left text-[15px] hover:bg-soft focus:bg-soft focus:outline-none ${
                  p.iso === pais.iso ? "font-semibold text-navy" : "text-ink-2"
                }`}
              >
                <Bandeira iso={p.iso} />
                <span className="flex-1">{p.nome}</span>
                <span className="text-muted">+{p.ddi}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Descobre o país e o número local a partir de um telefone internacional (+5511987654321). */
export function separarTelefone(internacional: string | null | undefined): { pais: Pais; local: string } {
  const br = paisPorIso("BR")!;
  const d = (internacional ?? "").replace(/\D/g, "");
  if (!d) return { pais: br, local: "" };
  const candidatos = [...PAISES].sort((x, y) => y.ddi.length - x.ddi.length);
  const p = candidatos.find((c) => d.startsWith(c.ddi) && (c.iso !== "CA"));
  return p ? { pais: p, local: d.slice(p.ddi.length) } : { pais: br, local: d };
}

/**
 * Campo de celular internacional: bandeira + DDI e máscara do país.
 * Envia no formulário "<name>" com o número completo (+5511987654321) e "<name>_pais" com a sigla do país.
 */
export function CampoTelefone({
  name = "whatsapp",
  inicial,
  rotulo = "WhatsApp",
  inputClassName = "",
}: {
  name?: string;
  inicial?: string | null;
  rotulo?: string;
  inputClassName?: string;
}) {
  const [{ pais, tel }, setValor] = useState(() => {
    const s = separarTelefone(inicial);
    return { pais: s.pais, tel: formatarTelefone(s.pais, s.local) };
  });
  const id = useId();
  const completo = telefoneInternacional(pais, tel);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-navy">{rotulo}</label>
      <div className="flex rounded-xl border border-[#c9cedb] bg-white focus-within:outline-3 focus-within:outline-brand">
        <SeletorPais pais={pais} onChange={(p) => setValor((v) => ({ pais: p, tel: formatarTelefone(p, v.tel) }))} />
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          value={tel}
          onChange={(e) => setValor((v) => ({ ...v, tel: formatarTelefone(v.pais, e.target.value) }))}
          placeholder={exemploTelefone(pais)}
          className={`min-h-12 w-full min-w-0 rounded-r-xl bg-transparent px-4 text-[16px] text-navy placeholder:text-[#8a90a2] focus:outline-none ${inputClassName}`}
        />
      </div>
      <input type="hidden" name={name} value={completo ?? `+${pais.ddi}${tel.replace(/\D/g, "")}`} />
      <input type="hidden" name={`${name}_pais`} value={pais.iso} />
    </div>
  );
}
