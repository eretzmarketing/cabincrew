"use client";

import "flag-icons/css/flag-icons.min.css";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { queroSerAvisado } from "@/app/actions";
import { PAISES, exemploTelefone, formatarTelefone, paisPorIso, telefoneInternacional, type Pais } from "@/lib/paises";

const Bandeira = ({ iso }: { iso: string }) => (
  <span aria-hidden="true" className={`fi fi-${iso.toLowerCase()} shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.08)]`} />
);

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-14 w-full cursor-pointer rounded-xl bg-brand-strong px-6 font-display text-[17px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(209,0,48,.7)] transition hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Reservando seu lugar…" : "Quero embarcar primeiro"}
    </button>
  );
}

/** Seletor de país com bandeira + DDI. */
function SeletorPais({ pais, onChange }: { pais: Pais; onChange: (p: Pais) => void }) {
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

/** "Quero ser avisado(a) em primeira mão" — nome + celular com DDI, e popup de boas-vindas. */
export default function AvisoForm() {
  const [state, action] = useActionState(queroSerAvisado, undefined);
  const [pais, setPais] = useState<Pais>(paisPorIso("BR")!);
  const [tel, setTel] = useState("");
  const [erroLocal, setErroLocal] = useState("");
  const dialogo = useRef<HTMLDialogElement>(null);
  const inscrito = !!state?.ok;

  useEffect(() => {
    if (state?.ok && !dialogo.current?.open) dialogo.current?.showModal();
  }, [state]);

  const trocarPais = (p: Pais) => {
    setPais(p);
    setTel((t) => formatarTelefone(p, t));
    setErroLocal("");
  };

  const erro = erroLocal || state?.erro;

  return (
    <>
      {inscrito ? (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-[#bfe6cf] bg-[#e5f6ec] px-5 py-4 text-[15px] text-[#0f6b3a]">
          <span aria-hidden="true" className="text-2xl">✈︎</span>
          <span><strong>Seu lugar está reservado.</strong> Você vai saber em primeira mão, pelo WhatsApp.</span>
        </div>
      ) : (
        <form
          action={action}
          onSubmit={(e) => {
            if (!telefoneInternacional(pais, tel)) {
              e.preventDefault();
              setErroLocal("Confira o número do celular, com DDD.");
            }
          }}
          className="flex flex-col gap-4 rounded-[22px] border border-line bg-white/95 p-5 shadow-[0_24px_60px_-30px_rgba(35,42,61,.45)] backdrop-blur md:p-6"
        >
          <div className="flex flex-col gap-1">
            <strong className="font-display text-xl font-extrabold text-navy">Seja avisado(a) em primeira mão</strong>
            <span className="text-[15px] text-ink-2">Garanta seu lugar na lista e receba o convite antes de todo mundo.</span>
          </div>

          <input type="hidden" name="pais" value={pais.iso} />
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>Site <input name="site" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="aviso-nome" className="text-sm font-semibold text-navy">Nome completo</label>
            <input
              id="aviso-nome"
              name="nome"
              required
              minLength={3}
              maxLength={120}
              autoComplete="name"
              placeholder="Como está no seu documento"
              className="min-h-14 rounded-xl border border-[#c9cedb] bg-white px-4 text-[16px] text-navy placeholder:text-[#8a90a2]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="aviso-tel" className="text-sm font-semibold text-navy">Celular (WhatsApp)</label>
            <div className="flex rounded-xl border border-[#c9cedb] bg-white focus-within:outline-3 focus-within:outline-brand">
              <SeletorPais pais={pais} onChange={trocarPais} />
              <input
                id="aviso-tel"
                name="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                value={tel}
                onChange={(e) => {
                  setTel(formatarTelefone(pais, e.target.value));
                  setErroLocal("");
                }}
                placeholder={exemploTelefone(pais)}
                aria-invalid={!!erro || undefined}
                aria-describedby={erro ? "aviso-erro" : undefined}
                className="min-h-14 w-full min-w-0 rounded-r-xl bg-transparent px-4 text-[16px] text-navy placeholder:text-[#8a90a2] focus:outline-none"
              />
            </div>
          </div>

          {erro && <p id="aviso-erro" role="alert" className="text-sm font-semibold text-brand-deep">{erro}</p>}
          <Enviar />
          <p className="text-[13px] leading-snug text-muted">Usamos seu contato só para avisar sobre a Cabin Crew. Sem spam.</p>
        </form>
      )}

      <dialog
        ref={dialogo}
        aria-labelledby="bemvindo-titulo"
        onClick={(e) => e.target === dialogo.current && dialogo.current?.close()}
        className="m-auto w-[min(92vw,440px)] overflow-hidden rounded-[26px] p-0 text-navy shadow-[0_40px_80px_-30px_rgba(35,42,61,.6)] backdrop:bg-[rgba(35,42,61,.55)] backdrop:backdrop-blur-sm"
      >
        <div className="relative flex flex-col items-center gap-2 bg-navy px-8 pt-9 pb-14 text-center text-white">
          <span className="font-display text-[13px] font-bold tracking-[.14em] text-[#ffb3c4] uppercase">Cartão de embarque confirmado</span>
          <span aria-hidden="true" className="mt-2 text-5xl leading-none">✈︎</span>
          <svg aria-hidden="true" viewBox="0 0 440 24" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-[2px] h-7 w-full fill-white">
            <path d="M0 24V12C40 0 80 0 110 8s70 16 110 4 80-16 110-8 70 16 110 4v12z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-3 px-8 pt-4 pb-8 text-center">
          <h2 id="bemvindo-titulo" className="font-display text-[28px] leading-tight font-extrabold">
            Bem-vindo(a) a bordo{state?.msg ? `, ${state.msg}` : ""}!
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-2">
            Seu lugar na lista está garantido. Assim que o embarque for liberado, você recebe o aviso em primeira mão no WhatsApp.
          </p>
          <p className="font-display text-lg font-bold text-brand-strong">Até breve!</p>
          <form method="dialog" className="mt-2 w-full">
            <button className="min-h-12 w-full cursor-pointer rounded-xl bg-navy px-6 font-semibold text-white hover:bg-navy-deep">Fechar</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
