/** Gráficos simples em SVG para o painel (renderizados no servidor, sem biblioteca). */

const NAVY = "#313950";
const VERDE = "#2e9d5b";
const GRADE = "#eceef3";
const TEXTO = "#6b7186";

const teto = (max: number) => {
  if (max <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / p) * p;
};

/** Barras verticais (ex.: simulados entregues por dia). Passe o mouse para ver o valor. */
export function Barras({
  dados,
  rotuloA11y,
  cada = 5,
  formato = (n: number) => String(n),
}: {
  dados: { rotulo: string; valor: number; dica?: string }[];
  rotuloA11y: string;
  cada?: number;
  formato?: (n: number) => string;
}) {
  const W = 640, H = 200, L = 30, R = 6, T = 10, B = 26;
  const max = teto(Math.max(1, ...dados.map((d) => d.valor)));
  const larg = (W - L - R) / dados.length;
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={rotuloA11y}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke={GRADE} />
          <text x={L - 6} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill={TEXTO}>{formato(Math.round(max * f))}</text>
        </g>
      ))}
      {dados.map((d, i) => {
        const x = L + i * larg;
        const h = y(0) - y(d.valor);
        return (
          <g key={i}>
            <title>{d.dica ?? `${d.rotulo}: ${formato(d.valor)}`}</title>
            <rect x={x} y={T} width={larg} height={H - T - B} fill="transparent" />
            {d.valor > 0 && <rect x={x + 1} y={y(d.valor)} width={Math.max(2, larg - 2)} height={Math.max(2, h)} rx={Math.min(4, larg / 3)} fill={NAVY} />}
            {(i % cada === 0 || i === dados.length - 1) && (
              <text x={x + larg / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={TEXTO}>{d.rotulo}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Linha de 0 a 100% com a nota mínima tracejada (ex.: média semanal). Semanas sem dados ficam em branco. */
export function LinhaNota({ dados, minima, rotuloA11y }: { dados: { rotulo: string; valor: number | null; dica?: string }[]; minima: number; rotuloA11y: string }) {
  const W = 640, H = 200, L = 34, R = 14, T = 12, B = 26;
  const x = (i: number) => L + (dados.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (dados.length - 1));
  const y = (v: number) => T + ((100 - v) * (H - T - B)) / 100;
  // trechos contínuos (pula semanas vazias)
  const trechos: string[] = [];
  let atual = "";
  dados.forEach((d, i) => {
    if (d.valor == null) {
      if (atual) trechos.push(atual);
      atual = "";
    } else atual += `${atual ? "L" : "M"}${x(i).toFixed(1)},${y(d.valor).toFixed(1)} `;
  });
  if (atual) trechos.push(atual);
  const ultimo = [...dados].reverse().find((d) => d.valor != null);
  const iu = ultimo ? dados.lastIndexOf(ultimo) : -1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={rotuloA11y}>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={GRADE} />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={TEXTO}>{v}%</text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={y(minima)} y2={y(minima)} stroke={VERDE} strokeDasharray="5 5" />
      <text x={W - R} y={y(minima) - 6} textAnchor="end" fontSize="11" fill="#0f6b3a">nota mínima {minima}%</text>
      {trechos.map((d, i) => <path key={i} d={d} fill="none" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />)}
      {dados.map((d, i) => (
        <g key={i}>
          <title>{d.dica ?? `${d.rotulo}: ${d.valor == null ? "sem simulados" : `${d.valor}%`}`}</title>
          <rect x={x(i) - 14} y={T} width={28} height={H - T - B} fill="transparent" />
          {d.valor != null && <circle cx={x(i)} cy={y(d.valor)} r={4.5} fill={NAVY} stroke="#fff" strokeWidth={2} />}
          {(i % 2 === 0 || i === dados.length - 1) && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={TEXTO}>{d.rotulo}</text>}
        </g>
      ))}
      {ultimo && <text x={x(iu)} y={y(ultimo.valor!) - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY}>{ultimo.valor}%</text>}
    </svg>
  );
}

/** Distribuição das notas em faixas de 10%; as faixas aprovadas ficam em verde. */
export function Distribuicao({ dados, minima }: { dados: { faixa: number; n: number }[]; minima: number }) {
  const W = 640, H = 200, L = 30, R = 6, T = 16, B = 26;
  const max = teto(Math.max(1, ...dados.map((d) => d.n)));
  const larg = (W - L - R) / dados.length;
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const total = dados.reduce((s, d) => s + d.n, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label={`Distribuição das notas: ${dados.map((d) => `${d.faixa * 10} a ${d.faixa === 9 ? 100 : d.faixa * 10 + 9}%: ${d.n}`).join("; ")}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke={GRADE} />
          <text x={L - 6} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill={TEXTO}>{Math.round(max * f)}</text>
        </g>
      ))}
      {dados.map((d, i) => {
        const ok = d.faixa * 10 >= minima;
        const faixa = `${d.faixa * 10}–${d.faixa === 9 ? 100 : d.faixa * 10 + 9}%`;
        return (
          <g key={i}>
            <title>{`${faixa}: ${d.n} ${d.n === 1 ? "simulado" : "simulados"}${total ? ` (${Math.round((d.n / total) * 100)}%)` : ""}`}</title>
            <rect x={L + i * larg} y={T} width={larg} height={H - T - B} fill="transparent" />
            {d.n > 0 && <rect x={L + i * larg + 3} y={y(d.n)} width={larg - 6} height={y(0) - y(d.n)} rx={4} fill={ok ? VERDE : "#8d93a8"} />}
            {d.n > 0 && <text x={L + i * larg + larg / 2} y={y(d.n) - 5} textAnchor="middle" fontSize="11" fill={TEXTO}>{d.n}</text>}
            <text x={L + i * larg + larg / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={TEXTO}>{d.faixa * 10}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Funil em barras horizontais, cada etapa em % da primeira. */
export function Funil({ etapas }: { etapas: { rotulo: string; valor: number; detalhe?: string }[] }) {
  const base = Math.max(1, etapas[0]?.valor ?? 1);
  return (
    <ol className="flex flex-col gap-3">
      {etapas.map((e, i) => {
        const pct = Math.round((e.valor / base) * 100);
        return (
          <li key={e.rotulo} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-3 text-[15px]">
              <span className="font-semibold">{e.rotulo}</span>
              <span><strong className="font-display text-lg">{e.valor.toLocaleString("pt-BR")}</strong>{i > 0 && <span className="ml-1.5 text-[13px] text-muted">{pct}%</span>}</span>
            </span>
            <span className="h-3 rounded-full bg-[#eceef3]" aria-hidden="true">
              <span className="block h-3 rounded-full" style={{ width: `${Math.max(e.valor ? 2 : 0, pct)}%`, background: i === etapas.length - 1 ? VERDE : NAVY, opacity: i === etapas.length - 1 ? 1 : 1 - i * 0.18 }} />
            </span>
            {e.detalhe && <span className="text-[13px] text-muted">{e.detalhe}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Variação contra a semana anterior (▲ verde / ▼ vermelho). */
export function Variacao({ atual, anterior, sufixo = "" }: { atual: number | null; anterior: number | null; sufixo?: string }) {
  if (atual == null || anterior == null) return <span className="text-[13px] text-muted">sem comparação</span>;
  const d = atual - anterior;
  if (d === 0) return <span className="text-[13px] text-muted">igual à semana anterior</span>;
  return (
    <span className={`text-[13px] font-semibold ${d > 0 ? "text-[#0f6b3a]" : "text-brand-deep"}`}>
      {d > 0 ? "▲" : "▼"} {Math.abs(d)}{sufixo} <span className="font-normal text-muted">vs. 7 dias antes</span>
    </span>
  );
}
