"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSimulado } from "@/app/crew-actions";
import { Arrow } from "@/components/icons";

const CHAVE = "cc-simulado-opcoes";

function Comecar() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
      {pending ? "Abrindo…" : <>Começar <Arrow /></>}
    </button>
  );
}

function Opcao({ name, titulo, texto, valor, setValor }: { name: string; titulo: string; texto: string; valor: boolean; setValor: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition ${valor ? "border-navy bg-navy/5" : "border-line hover:border-[#9aa1b3]"}`}>
      <input type="checkbox" name={name} checked={valor} onChange={(e) => setValor(e.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={`mt-0.5 flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${valor ? "bg-[#1f9d55]" : "bg-[#c9cedb]"}`}>
        <span className={`h-5 w-5 rounded-full bg-white shadow transition ${valor ? "translate-x-5" : ""}`} />
      </span>
      <span className="flex flex-col gap-0.5">
        <strong className="font-display text-[17px] text-navy">{titulo}</strong>
        <span className="text-[14px] leading-relaxed text-ink-2">{texto}</span>
      </span>
    </label>
  );
}

/** Botão “Iniciar” dos Simulados ANAC: abre um aviso para o aluno escolher Gabarito imediato e Próxima questão automática. */
export default function IniciarSimulado({ simuladoId, aulaId, rotulo, titulo, rotuloAcessivel, className }: {
  simuladoId: number; aulaId: string; rotulo: string; titulo: string; rotuloAcessivel?: string; className: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [gabarito, setGabarito] = useState(false);
  const [auto, setAuto] = useState(false);

  // lembra a última escolha neste aparelho
  useEffect(() => {
    try {
      const j = JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as { gabarito?: boolean; auto?: boolean };
      /* eslint-disable react-hooks/set-state-in-effect */
      setGabarito(!!j.gabarito);
      setAuto(!!j.auto);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch { /* sem armazenamento */ }
  }, []);
  const lembrar = (g: boolean, a: boolean) => { try { localStorage.setItem(CHAVE, JSON.stringify({ gabarito: g, auto: a })); } catch { /* sem armazenamento */ } };

  return (
    <>
      <button type="button" aria-label={rotuloAcessivel} onClick={() => ref.current?.showModal()} className={className}>{rotulo} <Arrow /></button>
      <dialog ref={ref} aria-labelledby={`sim-${simuladoId}-titulo`}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="m-auto w-[min(520px,calc(100vw-32px))] rounded-[24px] p-0 text-navy shadow-2xl backdrop:bg-[#232a3d]/60">
        <form action={iniciarSimulado} onSubmit={() => lembrar(gabarito, auto)} className="flex flex-col gap-5 p-6 md:p-7">
          <input type="hidden" name="simulado_id" value={simuladoId} />
          <input type="hidden" name="aula_id" value={aulaId} />
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id={`sim-${simuladoId}-titulo`} className="font-display text-xl font-extrabold">Como você quer fazer?</h2>
              <p className="text-[15px] text-ink-2">{titulo}</p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Fechar" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl text-muted hover:bg-soft">×</button>
          </div>
          <div className="flex flex-col gap-3">
            <Opcao name="gabarito" titulo="Gabarito imediato" valor={gabarito} setValor={setGabarito}
              texto="Ao marcar a resposta, você vê na hora se acertou ou errou e qual é a alternativa correta. A resposta não pode ser trocada depois." />
            <Opcao name="auto" titulo="Próxima questão automática" valor={auto} setValor={setAuto}
              texto="Ao responder, a próxima questão abre sozinha." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => ref.current?.close()} className="min-h-12 cursor-pointer rounded-full border-2 border-line px-6 font-semibold text-navy hover:border-navy">Cancelar</button>
            <Comecar />
          </div>
        </form>
      </dialog>
    </>
  );
}
