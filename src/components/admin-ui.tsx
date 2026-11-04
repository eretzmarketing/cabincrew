import { alterarConfig } from "@/app/crew-actions";

export function Titulo({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-display text-[30px] font-extrabold tracking-[-0.01em]">{children}</h1>
      {sub && <p className="text-[16px] text-ink-2">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6 ${className}`}>{children}</section>;
}

export function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: React.ReactNode; detalhe?: string }) {
  return (
    <div className="flex flex-[1_1_180px] flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4">
      <span className="text-[13px] text-muted">{rotulo}</span>
      <span className="font-display text-[30px] leading-tight font-extrabold">{valor}</span>
      {detalhe && <span className="text-[13px] text-muted">{detalhe}</span>}
    </div>
  );
}

/** Chave liga/desliga de uma configuração do site. */
export function Chave({ chave, ligado, titulo, descricao }: { chave: string; ligado: boolean; titulo: string; descricao: string }) {
  return (
    <form action={alterarConfig} className="flex flex-wrap items-center justify-between gap-4">
      <input type="hidden" name="chave" value={chave} />
      <input type="hidden" name="valor" value={String(!ligado)} />
      <div className="flex max-w-[560px] flex-col gap-1">
        <strong className="font-display text-[17px]">{titulo}</strong>
        <span className="text-[15px] leading-relaxed text-ink-2">{descricao}</span>
      </div>
      <button
        type="submit"
        role="switch"
        aria-checked={ligado}
        aria-label={`${titulo}: ${ligado ? "ligado" : "desligado"}. Clique para ${ligado ? "desligar" : "ligar"}.`}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border-2 px-4 font-semibold ${
          ligado ? "border-[#0f6b3a] bg-[#e5f6ec] text-[#0f6b3a]" : "border-[#c9cedb] bg-white text-ink-2"
        }`}
      >
        <span className={`relative h-6 w-11 rounded-full transition ${ligado ? "bg-[#0f6b3a]" : "bg-[#c9cedb]"}`} aria-hidden="true">
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${ligado ? "left-[22px]" : "left-0.5"}`} />
        </span>
        {ligado ? "Ligado" : "Desligado"}
      </button>
    </form>
  );
}

export const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold";
export const btnPrimario = `${btn} bg-brand-strong text-white hover:bg-brand-deep font-display font-bold`;
export const btnSecundario = `${btn} border-2 border-line bg-white text-navy hover:border-navy`;
