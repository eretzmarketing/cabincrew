"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { conferirQuestao, finalizarSimulado, registrarSaidaAba, responderComCorrecao, responderQuestao } from "@/app/crew-actions";
import AcoesQuestao, { type PlusTela } from "@/components/AcoesQuestao";
import type { QuestaoProva, Simulado } from "@/lib/crew";

function relogio(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export default function Prova({
  tentativaId,
  aulaId,
  simulado,
  prazo,
  questoes,
  modo = "prova",
  saidasIniciais = 0,
  gabaritoImediato = false,
  autoProxima = false,
  plus = null,
  comentarios = {},
}: {
  tentativaId: string;
  aulaId: string;
  simulado: Simulado;
  prazo: string | null;
  questoes: QuestaoProva[];
  modo?: "prova" | "treino";
  saidasIniciais?: number;
  /** escolhido no aviso antes de começar: mostra a correção ao responder */
  gabaritoImediato?: boolean;
  /** escolhido no aviso antes de começar: abre a próxima questão ao responder */
  autoProxima?: boolean;
  /** Reportar / Comentar depois da correção (null = banco sem o SQL 0070) */
  plus?: PlusTela | null;
  comentarios?: Record<string, number>;
}) {
  const treino = modo === "treino";
  // correção na hora: no treino ou quando o aluno ligou o gabarito imediato
  const corrige = treino || gabaritoImediato;
  const provaReal = !treino && !gabaritoImediato && !!prazo;
  const [correcao, setCorrecao] = useState<Record<string, { correta: string; explicacao: string | null }>>({});
  const [saidas, setSaidas] = useState(saidasIniciais);
  const [telaCheia, setTelaCheia] = useState(false);
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>(() =>
    Object.fromEntries(questoes.filter((q) => q.resposta).map((q) => [q.id, q.resposta as string])),
  );
  const [puladas, setPuladas] = useState<Set<string>>(() => new Set());
  const puladasLidas = useRef(false);
  const proximaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [restante, setRestante] = useState<number | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const entregue = useRef(false);

  // Cronômetro: entrega sozinho quando o tempo acaba
  useEffect(() => {
    if (!prazo) return;
    const fim = new Date(prazo).getTime();
    const tick = () => {
      const r = fim - Date.now();
      setRestante(r);
      if (r <= 0 && !entregue.current) {
        entregue.current = true;
        formRef.current?.requestSubmit();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [prazo]);

  // Prova real: registra cada vez que o aluno sai da aba (como na Vora, da LATAM)
  useEffect(() => {
    if (!provaReal) return;
    const sair = () => {
      if (document.visibilityState === "hidden" && !entregue.current) {
        registrarSaidaAba(tentativaId).then((n) => setSaidas((s) => Math.max(s + 1, n)));
      }
    };
    const cheia = () => setTelaCheia(!!document.fullscreenElement);
    document.addEventListener("visibilitychange", sair);
    document.addEventListener("fullscreenchange", cheia);
    return () => { document.removeEventListener("visibilitychange", sair); document.removeEventListener("fullscreenchange", cheia); };
  }, [provaReal, tentativaId]);

  // questões puladas (amarelas): guardadas na sessão para continuar marcadas se a página recarregar
  useEffect(() => {
    if (!puladasLidas.current) {
      puladasLidas.current = true;
      try {
        const salvas = JSON.parse(sessionStorage.getItem(`puladas-${tentativaId}`) ?? "[]") as string[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (salvas.length) setPuladas(new Set(salvas));
      } catch { /* sem armazenamento */ }
      return;
    }
    try { sessionStorage.setItem(`puladas-${tentativaId}`, JSON.stringify([...puladas])); } catch { /* sem armazenamento */ }
  }, [puladas, tentativaId]);
  useEffect(() => () => { if (proximaTimer.current) clearTimeout(proximaTimer.current); }, []);

  // Treino / gabarito imediato: ao voltar para a página, mostra a correção das questões já respondidas
  useEffect(() => {
    if (!corrige) return;
    let vivo = true;
    (async () => {
      for (const x of questoes.filter((z) => z.resposta)) {
        const r = await conferirQuestao(tentativaId, x.id);
        if (vivo && r) setCorrecao((c) => ({ ...c, [x.id]: r }));
      }
    })();
    return () => { vivo = false; };
  }, [corrige, questoes, tentativaId]);

  const q = questoes[atual];
  const respondidas = Object.keys(respostas).length;

  function irPara(i: number) {
    if (proximaTimer.current) { clearTimeout(proximaTimer.current); proximaTimer.current = null; }
    setAtual(Math.max(0, Math.min(questoes.length - 1, i)));
  }

  /** Abre a próxima questão (depois de um tempinho para o aluno ver a marcação ou a correção). */
  function avancarSozinho(de: number, espera: number) {
    if (!autoProxima || de >= questoes.length - 1) return;
    if (proximaTimer.current) clearTimeout(proximaTimer.current);
    proximaTimer.current = setTimeout(() => { proximaTimer.current = null; setAtual((i) => (i === de ? de + 1 : i)); }, espera);
  }

  function escolher(letra: string) {
    if (corrige && (correcao[q.id] || respostas[q.id])) return;
    const id = q.id;
    const de = atual;
    setRespostas((r) => ({ ...r, [id]: letra }));
    setPuladas((p) => { if (!p.has(id)) return p; const n = new Set(p); n.delete(id); return n; });
    if (!corrige) avancarSozinho(de, 450);
    startTransition(async () => {
      if (!corrige) {
        setFalhou(!(await responderQuestao(tentativaId, id, letra)));
        return;
      }
      // gabarito imediato / treino: grava e já recebe a correção numa chamada só
      const { ok, correcao: r } = await responderComCorrecao(tentativaId, id, letra);
      setFalhou(!ok && !r);
      if (r) {
        setCorrecao((c) => ({ ...c, [id]: r }));
        // dá tempo de ver se acertou (mais tempo quando errou, para ver a certa)
        avancarSozinho(de, r.correta !== letra ? 2600 : 1300);
      }
    });
  }

  function pular() {
    const id = q.id;
    if (!respostas[id]) setPuladas((p) => new Set(p).add(id));
    if (atual < questoes.length - 1) irPara(atual + 1);
  }

  if (!q) {
    return <p className="mx-auto max-w-[760px] rounded-2xl bg-white p-8 text-center">Este simulado ainda não tem questões.</p>;
  }

  const pouco = restante !== null && restante < 5 * 60 * 1000;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#b0002a]">{treino ? "Treino · correção na hora" : gabaritoImediato ? "Simulado · gabarito imediato" : provaReal ? "Prova real" : "Simulado"} · {simulado.titulo}</span>
            <h1 className="font-display text-2xl font-extrabold">Questão {atual + 1} de {questoes.length}</h1>
          </div>
          {restante !== null && (
            <span
              role="timer"
              aria-live="off"
              className={`rounded-full px-4 py-2 font-display text-lg font-bold tabular-nums ${pouco ? "bg-brand text-white" : "bg-white text-navy"}`}
            >
              ⏱ {relogio(restante)}
            </span>
          )}
        </div>

        {provaReal && (
          <div role="status" className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[14px] ${saidas ? "bg-brand-soft text-brand-deep" : "bg-navy text-white"}`}>
            <span>
              {saidas
                ? <><strong>Você saiu da prova {saidas} {saidas === 1 ? "vez" : "vezes"}.</strong> Nas provas online das companhias (como a Vora, da LATAM) sair da página é detectado e pode eliminar.</>
                : <><strong>Modo Prova real:</strong> sem consulta e sem sair desta aba, como na prova da companhia.</>}
            </span>
            {!telaCheia && (
              <button type="button" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
                className={`min-h-10 cursor-pointer rounded-full px-4 font-semibold ${saidas ? "bg-white text-brand-deep" : "bg-white/15 text-white hover:bg-white/25"}`}>⛶ Tela cheia</button>
            )}
          </div>
        )}

        <article className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-5 md:p-8">
          {q.categoria && <span className="text-[13px] font-semibold text-muted">{q.categoria}</span>}
          {q.contexto && (
            <div className="rounded-xl border-l-4 border-navy bg-soft px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line">{q.contexto}</div>
          )}
          <p className="text-[17px] leading-relaxed font-semibold whitespace-pre-line">{q.enunciado}</p>
          {q.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.imagem_url} alt="Imagem da questão" className="max-h-[360px] w-auto self-start rounded-xl border border-line" />
          )}

          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Alternativas</legend>
            {q.alternativas.map((a) => {
              const marcada = respostas[q.id] === a.letra;
              const c = correcao[q.id];
              const certa = !!c && c.correta === a.letra;
              const errada = !!c && marcada && !certa;
              const travada = corrige && !!respostas[q.id];
              return (
                <label
                  key={a.letra}
                  className={`flex min-h-14 items-start gap-4 rounded-2xl border-2 px-4 py-3.5 text-[16px] leading-relaxed transition ${travada ? "cursor-default" : "cursor-pointer"} ${
                    certa ? "border-[#2e9e62] bg-[#e5f6ec]" : errada ? "border-brand bg-brand-soft" : marcada ? "border-navy bg-navy/5" : travada ? "border-line opacity-70" : "border-line hover:border-[#9aa1b3]"
                  }`}
                >
                  <input type="radio" name={`q-${q.id}`} value={a.letra} checked={marcada} disabled={travada && !marcada} onChange={() => escolher(a.letra)} className="sr-only" />
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display font-bold ${certa ? "bg-[#2e9e62] text-white" : errada ? "bg-brand text-white" : marcada ? "bg-navy text-white" : "bg-soft text-navy"}`}
                    aria-hidden="true"
                  >
                    {certa ? "✓" : errada ? "✗" : a.letra}
                  </span>
                  <span className="flex flex-col gap-2 pt-0.5">
                    {a.texto}
                    {a.imagem_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.imagem_url} alt={`Alternativa ${a.letra}`} className="max-h-40 w-auto rounded-lg border border-line" />
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>
          {corrige && correcao[q.id] && (
            <div role="status" className={`rounded-xl px-4 py-3 text-[15px] leading-relaxed ${correcao[q.id].correta === respostas[q.id] ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>
              <strong>{correcao[q.id].correta === respostas[q.id] ? "Acertou! " : `Resposta certa: ${correcao[q.id].correta}. `}</strong>
              {correcao[q.id].explicacao}
            </div>
          )}
          {plus && corrige && correcao[q.id] && (
            <div className="border-t border-line pt-4">
              <AcoesQuestao key={q.id} questao={{ id: q.id, enunciado: q.enunciado, alternativas: q.alternativas, correta: correcao[q.id].correta }}
                tentativaId={tentativaId} comentarios={comentarios[q.id] ?? 0} plus={plus} />
            </div>
          )}
          {falhou && <p role="alert" className="text-sm text-brand-deep">Não conseguimos salvar sua última resposta. Verifique a internet e marque de novo.</p>}
        </article>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            disabled={atual === 0}
            className="min-h-12 cursor-pointer rounded-full border-2 border-line bg-white px-6 font-semibold text-navy hover:border-navy disabled:opacity-40"
          >
            ← Anterior
          </button>
          {!respostas[q.id] && (
            <button
              type="button"
              onClick={pular}
              className="min-h-12 cursor-pointer rounded-full border-2 border-[#e0a100] bg-[#fff8e6] px-6 font-semibold text-[#7a5a00] hover:bg-[#fff0c2]"
            >
              Pular questão ⤼
            </button>
          )}
          {atual < questoes.length - 1 ? (
            <button
              type="button"
              onClick={() => irPara(atual + 1)}
              className="min-h-12 cursor-pointer rounded-full bg-navy px-7 font-display font-bold text-white"
            >
              Próxima →
            </button>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep">
              {treino ? "Ver resultado" : "Entregar simulado"}
            </button>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 lg:sticky lg:top-6 lg:w-[300px]">
        <div className="flex items-center justify-between">
          <strong className="font-display">Questões</strong>
          <span className="text-sm text-muted">{respondidas}/{questoes.length} respondidas</span>
        </div>
        <nav aria-label="Ir para a questão" className="grid grid-cols-8 gap-1.5 lg:grid-cols-5">
          {questoes.map((x, i) => {
            const feita = !!respostas[x.id];
            const c = correcao[x.id];
            const estado = feita && c ? (c.correta === respostas[x.id] ? "certa" : "errada") : feita ? "feita" : puladas.has(x.id) ? "pulada" : "aberta";
            const cor = {
              certa: "bg-[#1f9d55] text-white",
              errada: "bg-brand-strong text-white",
              feita: "bg-navy text-white",
              pulada: "bg-[#ffd666] text-[#5c4300]",
              aberta: "bg-soft text-navy hover:bg-[#e3e6ee]",
            }[estado];
            const fala = { certa: ", acertou", errada: ", errou", feita: ", respondida", pulada: ", pulada", aberta: "" }[estado];
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => irPara(i)}
                aria-current={i === atual ? "step" : undefined}
                aria-label={`Questão ${i + 1}${fala}`}
                className={`h-10 cursor-pointer rounded-lg text-sm font-semibold ${i === atual ? "ring-2 ring-brand ring-offset-1" : ""} ${cor}`}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-2" aria-label="Legenda">
          {corrige ? (
            <>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#1f9d55]" aria-hidden="true" />Acertou</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-strong" aria-hidden="true" />Errou</li>
            </>
          ) : (
            <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy" aria-hidden="true" />Respondida</li>
          )}
          <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#ffd666]" aria-hidden="true" />Pulada</li>
          <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-soft ring-1 ring-line" aria-hidden="true" />Sem resposta</li>
        </ul>

        <form ref={formRef} action={finalizarSimulado} className="flex flex-col gap-3">
          <input type="hidden" name="tentativa_id" value={tentativaId} />
          <input type="hidden" name="aula_id" value={aulaId} />
          {confirmar ? (
            <div className="flex flex-col gap-3 rounded-xl bg-brand-soft p-4">
              <span className="text-sm text-ink-2">
                {respondidas < questoes.length
                  ? `Você ainda tem ${questoes.length - respondidas} ${questoes.length - respondidas === 1 ? "questão" : "questões"} sem resposta. Entregar mesmo assim?`
                  : treino ? "Terminar o treino e ver o resultado?" : "Entregar o simulado e ver o resultado?"}
              </span>
              <div className="flex gap-2">
                <button type="submit" className="min-h-11 flex-1 cursor-pointer rounded-full bg-brand-strong px-4 font-semibold text-white">Entregar</button>
                <button type="button" onClick={() => setConfirmar(false)} className="min-h-11 flex-1 cursor-pointer rounded-full border-2 border-line bg-white px-4 font-semibold">Voltar</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="min-h-11 cursor-pointer rounded-full border-2 border-brand-strong px-4 font-semibold text-brand-strong hover:bg-brand-soft">
              {treino ? "Terminar treino" : "Entregar simulado"}
            </button>
          )}
        </form>
      </aside>
    </div>
  );
}
