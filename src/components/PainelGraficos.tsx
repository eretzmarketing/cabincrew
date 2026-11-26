/**
 * Gráficos leves do painel (SVG/HTML no servidor, sem biblioteca).
 * Uma série por gráfico, cor única; passar o mouse mostra o valor (tooltip CSS + <title> para leitores de tela).
 * Paleta validada (dataviz): azul #257de0 · laranja #f47230 · aqua #00b894 · amarelo #f2a600.
 */
export const COR = { azul: "#257de0", laranja: "#f47230", aqua: "#00b894", amarelo: "#f2a600", cinza: "#c9cedb" } as const;

export type Ponto = { rotulo: string; valor: number; dica?: string };

const fmtNum = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export const fmtReal = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v >= 1000 ? 0 : 2 });

/** Barras verticais ao longo do tempo (ex.: cadastros por dia). */
export function BarrasTempo({ dados, cor = COR.azul, formato = fmtNum, altura = 180, titulo }: { dados: Ponto[]; cor?: string; formato?: (v: number) => string; altura?: number; titulo: string }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  const marcas = [0, Math.floor((dados.length - 1) / 2), dados.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <figure className="flex flex-col gap-1" aria-label={titulo}>
      <div className="relative" style={{ height: altura }}>
        <span className="absolute top-0 left-0 text-[11px] text-muted">{formato(max)}</span>
        <div className="absolute inset-x-0 top-[7px] border-t border-dashed border-[#e3e6ee]" aria-hidden />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#eef0f5]" aria-hidden />
        <ul className="absolute inset-x-0 top-[8px] bottom-0 flex items-end gap-[2px] border-b border-[#c9cedb]">
          {dados.map((d, i) => (
            <li key={i} className="group relative flex h-full flex-1 items-end justify-center">
              <span className="block w-full max-w-[22px] rounded-t-[4px] transition-opacity group-hover:opacity-80" style={{ height: `${d.valor ? Math.max(2, (d.valor / max) * 100) : 0}%`, background: cor }} />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-navy px-2.5 py-1.5 text-[12px] whitespace-nowrap text-white shadow-lg group-hover:block">
                <strong>{formato(d.valor)}</strong> · {d.dica ?? d.rotulo}
              </span>
              <span className="sr-only">{d.dica ?? d.rotulo}: {formato(d.valor)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative h-4 text-[11px] text-muted" aria-hidden>
        {marcas.map((i) => (
          <span key={i} className="absolute" style={{ left: `${((i + 0.5) / dados.length) * 100}%`, transform: i === 0 ? "none" : i === dados.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}>{dados[i]?.rotulo}</span>
        ))}
      </div>
    </figure>
  );
}

/** Ranking em barras horizontais (ex.: vendas por produto). */
export function BarrasLista({ itens, cor = COR.azul, formato = fmtNum, vazio = "Sem dados no período." }: { itens: (Ponto & { extra?: string })[]; cor?: string; formato?: (v: number) => string; vazio?: string }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  if (!itens.length) return <p className="text-[14px] text-muted">{vazio}</p>;
  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((it) => (
        <li key={it.rotulo} className="group flex flex-col gap-1" title={`${it.rotulo}: ${formato(it.valor)}${it.extra ? ` · ${it.extra}` : ""}`}>
          <div className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="min-w-0 truncate">{it.rotulo}</span>
            <span className="shrink-0 font-semibold">{formato(it.valor)}{it.extra && <span className="ml-1.5 font-normal text-muted">{it.extra}</span>}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#eef0f5]">
            <div className="h-full rounded-full transition-opacity group-hover:opacity-80" style={{ width: `${Math.max(2, (it.valor / max) * 100)}%`, background: cor }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Barra 100% dividida em partes, com legenda (ex.: situação dos alunos de um curso). */
export function BarraPartes({ partes, rotulo }: { partes: { rotulo: string; valor: number; cor: string }[]; rotulo: string }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  return (
    <div className="flex flex-col gap-2" aria-label={rotulo}>
      <div className="flex h-3.5 gap-[2px] overflow-hidden rounded-full bg-[#eef0f5]">
        {total > 0 && partes.filter((p) => p.valor > 0).map((p) => (
          <span key={p.rotulo} title={`${p.rotulo}: ${p.valor} (${Math.round((p.valor / total) * 100)}%)`} className="h-full first:rounded-l-full last:rounded-r-full hover:opacity-80" style={{ width: `${(p.valor / total) * 100}%`, background: p.cor }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
        {partes.map((p) => (
          <li key={p.rotulo} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.cor }} aria-hidden />
            {p.rotulo} <strong className="text-navy">{p.valor}</strong>
            {total > 0 && <span className="text-muted">({Math.round((p.valor / total) * 100)}%)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mini gráfico de linha para os cartões de número. */
export function Linhazinha({ valores, cor = COR.azul }: { valores: number[]; cor?: string }) {
  if (valores.length < 2) return null;
  const max = Math.max(1, ...valores), w = 120, h = 32;
  const pts = valores.map((v, i) => `${(i / (valores.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden className="h-8 w-full max-w-[120px] min-w-0 overflow-visible">
      <polyline points={pts} fill="none" stroke={cor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Cartão de número com variação em relação ao período anterior. */
export function Indicador({ rotulo, valor, detalhe, atual, anterior, serie, cor }: { rotulo: string; valor: React.ReactNode; detalhe?: React.ReactNode; atual?: number; anterior?: number; serie?: number[]; cor?: string }) {
  const temVar = atual !== undefined && anterior !== undefined;
  const pct = temVar && anterior! > 0 ? Math.round(((atual! - anterior!) / anterior!) * 100) : null;
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4">
      <span className="text-[13px] text-muted">{rotulo}</span>
      <div className="flex items-end justify-between gap-3">
        <span className="shrink-0 font-display text-[28px] leading-tight font-extrabold">{valor}</span>
        {serie && <Linhazinha valores={serie} cor={cor} />}
      </div>
      {temVar && (
        <span className={`text-[13px] font-semibold ${pct === null ? "text-muted" : pct >= 0 ? "text-[#0f6b3a]" : "text-brand-deep"}`}>
          {pct === null ? (atual ? "novo no período" : "—") : `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%`} <span className="font-normal text-muted">vs. 30 dias anteriores</span>
        </span>
      )}
      {detalhe && <span className="text-[13px] text-muted">{detalhe}</span>}
    </div>
  );
}
