"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { excluirMinhaConta } from "@/app/actions";

function Botao({ pronto }: { pronto: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={!pronto || pending}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center self-start rounded-full bg-brand-deep px-6 font-display font-bold text-white hover:bg-[#7a0020] disabled:cursor-not-allowed disabled:opacity-40">
      {pending ? "Excluindo…" : "Excluir minha conta para sempre"}
    </button>
  );
}

/** Exclusão da conta pelo próprio aluno, com aviso de perda de acesso sem reembolso e confirmação digitada. */
export default function ExcluirContaForm() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [ciente, setCiente] = useState(false);
  const [state, action] = useActionState(excluirMinhaConta, undefined);

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)}
        className="min-h-11 cursor-pointer self-start rounded-full border-2 border-brand-line bg-white px-5 font-semibold text-brand-deep hover:border-brand-deep">
        Quero excluir minha conta
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border-2 border-brand-line bg-[#fff6f8] p-5">
      <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-navy">
        <strong className="font-display text-lg text-brand-deep">Atenção: esta ação não pode ser desfeita.</strong>
        <ul className="list-disc pl-5">
          <li>Você perde o acesso ao Head Hunter, ao Inglês a bordo e a todo o conteúdo da Cabin Crew.</li>
          <li>Seu progresso, notas, medalhas, relatos e dados de cadastro são apagados.</li>
          <li><strong>Se você tiver um curso pago em andamento, perde o acesso sem direito a reembolso.</strong></li>
          <li>Você recebe uma confirmação no WhatsApp e, depois dela, não recebe mais avisos.</li>
        </ul>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-[15px]">
        <input type="checkbox" name="ciente" checked={ciente} onChange={(e) => setCiente(e.target.checked)} className="mt-1 h-5 w-5 accent-[#c8102e]" />
        <span>Estou ciente de que perco o acesso a tudo, sem direito a reembolso.</span>
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmacao" className="text-[15px] font-semibold">Para confirmar, digite <strong>EXCLUIR</strong></label>
        <input id="confirmacao" name="confirmacao" autoComplete="off" value={texto} onChange={(e) => setTexto(e.target.value)}
          className="min-h-12 rounded-xl border border-[#c9cedb] bg-white px-4 text-[16px] uppercase" />
      </div>
      {state?.erro && <p role="alert" className="text-[15px] font-semibold text-brand-deep">{state.erro}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Botao pronto={ciente && texto.trim().toUpperCase() === "EXCLUIR"} />
        <button type="button" onClick={() => { setAberto(false); setTexto(""); setCiente(false); }} className="min-h-11 cursor-pointer px-3 font-semibold text-navy underline underline-offset-4">Cancelar</button>
      </div>
    </form>
  );
}
