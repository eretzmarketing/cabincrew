import { dataBR } from "@/lib/crew-gate";

/** Módulo de treino do Head Hunter, depois que o aluno concluiu a jornada. */
export default function AvisoTreino({ ate }: { ate: string }) {
  return (
    <p role="status" className="flex items-center gap-3 rounded-2xl border border-[#bcd3ff] bg-[#e7efff] px-4 py-3 text-[15px] text-[#1d3f8f]">
      <span aria-hidden="true" className="text-xl">🏋️</span>
      <span><strong>Módulo disponível para treinamento até {dataBR(ate)}.</strong> Volte quantas vezes quiser para praticar até lá.</span>
    </p>
  );
}
