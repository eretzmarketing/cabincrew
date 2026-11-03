import Link from "next/link";
import { STATUS_SELECAO, TOTAL_FASES, haQuantoTempo, mesAno, nomeFase, type Selecao } from "@/lib/forum";

export default function SelecaoCard({ s }: { s: Selecao }) {
  const st = STATUS_SELECAO[s.status];
  const fase = s.fase_max ?? 0;
  const pct = Math.round((fase / TOTAL_FASES) * 100);

  return (
    <Link
      href={`/forum/${s.slug}`}
      className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-[20px] border border-line bg-white p-7 text-navy transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(49,57,80,.35)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[22px] font-extrabold">{s.companhia}</span>
        <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${st.cls}`}>{st.label}</span>
      </div>
      <div className="text-base text-ink-2">
        {s.cargo} · Base {s.base_nome ? `${s.base_nome} (${s.base})` : s.base} · {mesAno(s.mes_ref)}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[13px] text-muted">
          <span>Fase mais avançada relatada</span>
          <span>{fase ? `${fase} de ${TOTAL_FASES}` : "—"}</span>
        </div>
        <div className="h-2 rounded-full bg-[#eceef3]" aria-hidden="true">
          <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[15px] font-semibold">{fase ? nomeFase(fase) : "Aguardando os primeiros relatos"}</div>
      </div>
      <div className="flex gap-4 border-t border-[#eceef3] pt-4 text-sm text-muted">
        <span>{s.total_relatos} {s.total_relatos === 1 ? "relato" : "relatos"}</span>
        <span>{s.ultimo_relato ? `Atualizado ${haQuantoTempo(s.ultimo_relato)}` : "Seja o primeiro a relatar"}</span>
      </div>
    </Link>
  );
}
