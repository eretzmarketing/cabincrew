import Link from "next/link";
import { iniciarTreino } from "@/app/crew-actions";
import { COMPANHIAS, META, type EtapaAvaliada, type ItemMissao, type StatusTarefa, montarJornada } from "@/lib/jornada";

type Jornada = ReturnType<typeof montarJornada>;

const btnPrim = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep";
const btnSec = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-navy px-5 font-semibold text-navy hover:bg-soft";

function Acao({ href, banco, rotulo, prim }: { href?: string; banco?: string; rotulo: string; prim?: boolean }) {
  if (banco) {
    return (
      <form action={iniciarTreino}>
        <input type="hidden" name="banco" value={banco} />
        <button className={prim ? btnPrim : btnSec}>{rotulo}</button>
      </form>
    );
  }
  return href ? <Link href={href} className={prim ? btnPrim : btnSec}>{rotulo}</Link> : null;
}

function ItemDaMissao({ m, n }: { m: ItemMissao; n: number }) {
  return (
    <li className={`flex flex-col gap-3 rounded-[20px] border-2 p-5 ${m.feito ? "border-[#bfe5cf] bg-[#f1faf4]" : "border-line bg-white"}`}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display font-bold ${m.feito ? "bg-[#2e9e62] text-white" : "bg-soft text-navy"}`}>{m.feito ? "✓" : n}</span>
        <span className="text-[13px] font-bold tracking-[.06em] text-muted uppercase">{m.id === "treino" ? "Treinar" : m.id === "aula" ? "Estudar" : "Inglês"}</span>
        {m.feito && <span className="ml-auto text-[13px] font-semibold text-[#0f6b3a]">Feito hoje</span>}
      </div>
      <strong className="font-display text-[17px] leading-snug">{m.titulo}</strong>
      <span className="text-[14px] leading-relaxed text-ink-2">{m.detalhe}</span>
      <div className="mt-auto pt-1">
        <Acao href={m.href} banco={m.acao?.banco} rotulo={m.feito ? "Fazer mais" : "Começar"} prim={!m.feito} />
      </div>
    </li>
  );
}

function LinhaTarefa({ s }: { s: StatusTarefa }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl bg-soft px-4 py-3">
      <span aria-hidden="true" className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.feito ? "bg-[#2e9e62] text-white" : s.bloqueada ? "bg-[#e3e6ee] text-muted" : "bg-white text-navy ring-1 ring-line"}`}>
        {s.feito ? "✓" : s.bloqueada ? "🔒" : ""}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{s.titulo}</span>
        <span className="text-[13px] text-muted">{s.bloqueada ?? s.detalhe}</span>
      </span>
      {!s.bloqueada && (
        <span className="hidden h-1.5 w-24 rounded-full bg-[#e3e6ee] sm:block" aria-hidden="true">
          <span className={`block h-1.5 rounded-full ${s.feito ? "bg-[#2e9e62]" : "bg-brand"}`} style={{ width: `${Math.round(s.progresso * 100)}%` }} />
        </span>
      )}
      {!s.bloqueada && <Acao href={s.href} banco={s.acao?.banco} rotulo={s.acao ? (s.feito ? "Treinar" : "Treinar 10") : s.feito ? "Revisar" : "Abrir"} />}
    </li>
  );
}

function Etapa({ e, n, estado }: { e: EtapaAvaliada; n: number; estado: "feita" | "atual" | "proxima" | "breve" }) {
  const cabecalho = (
    <span className="flex w-full items-center gap-4">
      <span aria-hidden="true" className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold ${estado === "feita" ? "bg-[#2e9e62] text-white" : estado === "atual" ? "bg-brand-strong text-white" : "bg-[#e3e6ee] text-muted"}`}>
        {estado === "feita" ? "✓" : n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <strong className="font-display text-[18px]">{e.titulo}</strong>
          {estado === "atual" && <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-brand-strong">Você está aqui</span>}
          {estado === "proxima" && <span className="rounded-full bg-soft px-2.5 py-0.5 text-[12px] font-semibold text-muted">🔒 Depois da etapa atual</span>}
          {estado === "breve" && <span className="rounded-full bg-soft px-2.5 py-0.5 text-[12px] font-semibold text-muted">Conteúdo em breve</span>}
        </span>
        <span className="text-[14px] text-ink-2">{e.resumo}</span>
      </span>
      {estado !== "breve" && <span className="hidden shrink-0 text-right font-display text-lg font-bold sm:block">{e.pct}%</span>}
    </span>
  );
  const corpo = (
    <div className="flex flex-col gap-3 pt-4">
      {e.dicaCompanhia && <p className="rounded-xl border-l-4 border-brand bg-brand-soft/60 px-4 py-2.5 text-[14px] text-ink-2"><strong className="text-brand-deep">Na sua companhia:</strong> {e.dicaCompanhia}</p>}
      {estado === "breve" && <p className="text-[14px] text-muted">As aulas desta etapa estão sendo preparadas. Ela não trava a sua jornada.</p>}
      {estado === "proxima" && <p className="text-[14px] text-muted">Recomendamos terminar a etapa atual antes. Se quiser adiantar, pode abrir as tarefas abaixo.</p>}
      <ul className="flex flex-col gap-2">{e.status.map((s, i) => <LinhaTarefa key={i} s={s} />)}</ul>
    </div>
  );
  return (
    <li className={`rounded-[22px] border bg-white p-5 ${estado === "atual" ? "border-brand shadow-[0_18px_40px_-30px_rgba(209,0,48,.6)]" : "border-line"}`}>
      {estado === "atual" ? <>{cabecalho}{corpo}</> : (
        <details>
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{cabecalho}</summary>
          {corpo}
        </details>
      )}
    </li>
  );
}

export default function JornadaPainel({ j, temCheckin, dataMeta, hoje }: { j: Jornada; temCheckin: boolean; dataMeta: string | null; hoje: string }) {
  const feitasMissao = j.missao.filter((m) => m.feito).length;
  const faltam = dataMeta ? Math.round((Date.parse(`${dataMeta}T12:00:00Z`) - Date.parse(`${hoje}T12:00:00Z`)) / 86400000) : null;
  const nomeCia = COMPANHIAS.find((c) => c.slug === j.principal)?.nome;
  const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div id="jornada" className="flex scroll-mt-6 flex-col gap-8">
      {!temCheckin && (
        <Link href="/head-hunter/checkin" className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-brand-strong p-6 text-white hover:bg-brand-deep">
          <span className="flex flex-col gap-1">
            <strong className="font-display text-xl font-extrabold">Faça seu check-in ✈︎</strong>
            <span className="text-[15px] text-white/90">Escolha sua companhia-alvo e a sua jornada passa a seguir a ordem do processo seletivo dela.</span>
          </span>
          <span className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-display font-bold text-brand-strong">Fazer check-in →</span>
        </Link>
      )}

      <section aria-labelledby="missao" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="missao" className="font-display text-2xl font-extrabold">Missão do dia</h2>
            <p className="text-[15px] text-ink-2">Cerca de 30 minutos. {feitasMissao === 3 ? "Missão cumprida! 🎉" : `${feitasMissao} de 3 feitas hoje.`}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-2.5">
            <span className="font-display text-2xl font-extrabold" aria-hidden="true">🔥 {j.sequencia.dias}</span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold">{j.sequencia.dias === 1 ? "dia seguido" : "dias seguidos"}</span>
              <span className="flex gap-1" aria-label={`Últimos 7 dias: ${j.sequencia.ultimos7.filter((d) => d.ativo).length} com estudo`}>
                {j.sequencia.ultimos7.map((d) => (
                  <span key={d.dia} title={d.dia} className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${d.ativo ? "bg-brand text-white" : "bg-[#e3e6ee] text-muted"}`}>
                    {diasSemana[new Date(`${d.dia}T12:00:00Z`).getUTCDay()]}
                  </span>
                ))}
              </span>
            </span>
          </div>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {j.missao.map((m, i) => <ItemDaMissao key={m.id} m={m} n={i + 1} />)}
        </ol>
      </section>

      <section aria-labelledby="titulo-jornada" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="titulo-jornada" className="font-display text-2xl font-extrabold">Sua jornada {nomeCia ? `até a ${nomeCia}` : ""}</h2>
            <p className="text-[15px] text-ink-2">
              Etapas na ordem do processo seletivo. Uma etapa fica concluída quando você atinge {META}% nos treinos e termina as aulas dela.
              {temCheckin && <> <Link href="/head-hunter/checkin" className="font-semibold text-brand-strong underline">Mudar companhia</Link></>}
            </p>
          </div>
          {faltam !== null && faltam >= 0 && (
            <span className="rounded-2xl bg-navy px-4 py-2.5 text-center text-white">
              <span className="block font-display text-2xl leading-none font-extrabold">{faltam}</span>
              <span className="text-[12px]">{faltam === 1 ? "dia para a meta" : "dias para a meta"}</span>
            </span>
          )}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ol className="flex flex-col gap-3">
            {j.etapas.map((e, i) => <Etapa key={e.id} e={e} n={i + 1} estado={e.vazia ? "breve" : i === j.atual && !e.feita ? "atual" : e.feita ? "feita" : i === j.atual ? "atual" : "proxima"} />)}
          </ol>

          <aside className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5 lg:sticky lg:top-6">
            <span className="self-start rounded-full bg-navy px-3 py-1 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Em paralelo</span>
            <strong className="font-display text-lg">{j.ingles.titulo}</strong>
            <span className="text-[14px] text-ink-2">{j.ingles.resumo}</span>
            {j.ingles.dicaCompanhia && <p className="rounded-xl bg-brand-soft/60 px-3 py-2 text-[13px] text-ink-2"><strong className="text-brand-deep">{nomeCia}:</strong> {j.ingles.dicaCompanhia}</p>}
            <ul className="flex flex-col gap-2">
              {j.ingles.status.map((s, i) => (
                <li key={i} className="flex flex-col gap-2 rounded-2xl bg-soft p-3">
                  <span className="flex items-center justify-between gap-2 text-[14px]"><strong>{s.titulo}</strong>{s.feito && <span className="text-[#0f6b3a]">✓</span>}</span>
                  <span className="text-[13px] text-muted">{s.detalhe}</span>
                  <span className="h-1.5 rounded-full bg-[#e3e6ee]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-brand" style={{ width: `${Math.round(s.progresso * 100)}%` }} /></span>
                  <Acao href={s.href} banco={s.acao?.banco} rotulo={s.acao ? "Treinar 10" : "Abrir"} />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
