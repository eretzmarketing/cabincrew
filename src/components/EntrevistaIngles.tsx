"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { chavePergunta, type Parte, type Pergunta } from "@/lib/entrevista-ingles";

/* ---------- progresso (só neste navegador) ---------- */
const CHAVE = "cc-entrevista-praticadas";
const ouvintes = new Set<() => void>();
function lerPraticadas(): string {
  try { return localStorage.getItem(CHAVE) ?? "[]"; } catch { return "[]"; }
}
function assinar(cb: () => void) {
  ouvintes.add(cb);
  const s = (e: StorageEvent) => e.key === CHAVE && cb();
  window.addEventListener("storage", s);
  return () => { ouvintes.delete(cb); window.removeEventListener("storage", s); };
}
function usePraticadas() {
  const bruto = useSyncExternalStore(assinar, lerPraticadas, () => "[]");
  const set = useMemo(() => { try { return new Set<string>(JSON.parse(bruto)); } catch { return new Set<string>(); } }, [bruto]);
  const alternar = useCallback((id: string, valor?: boolean) => {
    const atual = new Set<string>(JSON.parse(lerPraticadas()));
    if (valor ?? !atual.has(id)) atual.add(id); else atual.delete(id);
    try { localStorage.setItem(CHAVE, JSON.stringify([...atual])); } catch { /* navegador sem armazenamento */ }
    ouvintes.forEach((f) => f());
  }, []);
  return { praticadas: set, alternar };
}

/* ---------- voz do navegador (inglês) ---------- */
function useVoz() {
  const [falando, setFalando] = useState<string | null>(null);
  const falar = useCallback((texto: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    s.cancel();
    if (falando === id) { setFalando(null); return; }
    const u = new SpeechSynthesisUtterance(texto.replace(/\[([^\]]+)\]/g, "$1"));
    u.lang = "en-US";
    u.rate = 0.92;
    const voz = s.getVoices().find((v) => /en[-_](US|GB)/i.test(v.lang) && /female|samantha|google us|zira|jenny|aria/i.test(v.name)) ?? s.getVoices().find((v) => /^en/i.test(v.lang));
    if (voz) u.voice = voz;
    u.onend = () => setFalando(null);
    u.onerror = () => setFalando(null);
    setFalando(id);
    s.speak(u);
  }, [falando]);
  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);
  return { falar, falando };
}

function BotaoOuvir({ texto, id, voz, rotulo = "Ouvir" }: { texto: string; id: string; voz: ReturnType<typeof useVoz>; rotulo?: string }) {
  const ativo = voz.falando === id;
  return (
    <button
      type="button"
      onClick={() => voz.falar(texto, id)}
      aria-label={ativo ? "Parar áudio" : `${rotulo} em inglês`}
      className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ${ativo ? "bg-brand-strong text-white" : "bg-soft text-navy hover:bg-[#e6e9f0]"}`}
    >
      <span aria-hidden="true">{ativo ? "■" : "🔊"}</span> {ativo ? "Parar" : rotulo}
    </button>
  );
}

/** Destaca os trechos [entre colchetes] que o aluno deve trocar pelos próprios dados */
function ComLacunas({ texto }: { texto: string }) {
  const partes = texto.split(/(\[[^\]]+\])/g);
  return <>{partes.map((p, i) => (p.startsWith("[") ? <mark key={i} className="rounded bg-[#fff3c4] px-1 text-navy">{p.slice(1, -1)}</mark> : p))}</>;
}

/* ---------- cartão de pergunta ---------- */
function Cartao({ p, id, n, voz, feita, onFeita }: { p: Pergunta; id: string; n: number; voz: ReturnType<typeof useVoz>; feita: boolean; onFeita: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <li className={`flex flex-col gap-3 rounded-[20px] border bg-white p-5 transition ${feita ? "border-[#bfe6cf]" : "border-line"}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${feita ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-navy"}`} aria-hidden="true">
          {feita ? "✓" : n}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p lang="en" className="font-display text-[19px] leading-snug font-bold text-navy"><ComLacunas texto={p.en} /></p>
          <p className="text-[15px] text-muted">{p.pt}</p>
        </div>
        <BotaoOuvir texto={p.en} id={`${id}-q`} voz={voz} />
      </div>

      {p.variantes && p.variantes.length > 0 && (
        <div className="flex flex-col gap-1 pl-11">
          <span className="text-xs font-bold tracking-[.06em] text-muted uppercase">Também perguntam assim</span>
          <ul lang="en" className="flex flex-col gap-0.5 text-[15px] text-ink-2">
            {p.variantes.map((v) => <li key={v}>• <ComLacunas texto={v} /></li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pl-11">
        {p.modelo && (
          <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto}
            className="min-h-10 cursor-pointer rounded-full border-2 border-navy px-4 text-sm font-semibold text-navy hover:bg-soft">
            {aberto ? "Esconder resposta-modelo" : "Ver resposta-modelo"}
          </button>
        )}
        <button type="button" onClick={onFeita} aria-pressed={feita}
          className={`min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold ${feita ? "bg-[#e5f6ec] text-[#0f6b3a]" : "text-muted hover:bg-soft hover:text-navy"}`}>
          {feita ? "✓ Pratiquei" : "Marcar como praticada"}
        </button>
      </div>

      {aberto && p.modelo && (
        <div className="ml-11 flex flex-col gap-2 rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p lang="en" className="text-[16px] leading-relaxed text-navy"><ComLacunas texto={p.modelo} /></p>
            <BotaoOuvir texto={p.modelo} id={`${id}-r`} voz={voz} rotulo="Ouvir" />
          </div>
          {/\[/.test(p.modelo) && <p className="text-[13px] text-muted">Troque os trechos em amarelo pelos seus dados.</p>}
        </div>
      )}
      {p.dica && <p className="ml-11 rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep"><strong>Dica:</strong> {p.dica}</p>}
    </li>
  );
}

/** Lista de perguntas de uma parte, com áudio, resposta-modelo e progresso. */
export function ListaPerguntas({ parte }: { parte: Parte }) {
  const voz = useVoz();
  const { praticadas, alternar } = usePraticadas();
  const ids = parte.perguntas.map((_, i) => chavePergunta(parte, i));
  const feitas = ids.filter((id) => praticadas.has(id)).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <span className="text-[15px] font-semibold">{feitas} de {ids.length} perguntas praticadas</span>
          <span className="h-2.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-2.5 rounded-full bg-[#2e9d5b] transition-all" style={{ width: `${(feitas / Math.max(1, ids.length)) * 100}%` }} /></span>
        </div>
        <Link href={`/crew-select/entrevista-ingles/treino?parte=${parte.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
          🎙 Treinar esta parte
        </Link>
      </div>
      <ol className="flex flex-col gap-3">
        {parte.perguntas.map((p, i) => (
          <Cartao key={ids[i]} p={p} id={ids[i]} n={i + 1} voz={voz} feita={praticadas.has(ids[i])} onFeita={() => alternar(ids[i])} />
        ))}
      </ol>
    </div>
  );
}

/** Barrinha de progresso de cada parte (na página inicial). */
export function ProgressoParte({ ids }: { ids: string[] }) {
  const { praticadas } = usePraticadas();
  const total = Math.max(1, ids.length);
  const feitas = ids.filter((id) => praticadas.has(id)).length;
  return (
    <span className="flex items-center gap-2 text-[13px] text-muted">
      <span className="h-1.5 flex-1 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-[#2e9d5b]" style={{ width: `${(feitas / total) * 100}%` }} /></span>
      {feitas}/{ids.length}
    </span>
  );
}

/* ---------- modo treino: simulação de entrevista ---------- */
type Item = { p: Pergunta; id: string; parte: string };

export function Treino({ partes, rotulo }: { partes: Parte[]; rotulo: string }) {
  const voz = useVoz();
  const { alternar } = usePraticadas();
  const [qtd, setQtd] = useState(10);
  const [fila, setFila] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const [mostrar, setMostrar] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [gravando, setGravando] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);
  const [erroMic, setErroMic] = useState("");
  const gravador = useRef<MediaRecorder | null>(null);

  const todas = useMemo<Item[]>(() => partes.flatMap((pt) => pt.perguntas.map((p, k) => ({ p, id: chavePergunta(pt, k), parte: pt.titulo }))), [partes]);

  // cronômetro da resposta
  useEffect(() => {
    if (!fila || mostrar) return;
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [fila, i, mostrar]);

  const atual = fila?.[i];

  function comecar() {
    const embaralhadas = [...todas].sort(() => Math.random() - 0.5).slice(0, Math.min(qtd, todas.length));
    setFila(embaralhadas);
    irPara(0, embaralhadas);
  }
  function irPara(k: number, f = fila) {
    pararGravacao();
    setI(k);
    setMostrar(false);
    setSegundos(0);
    setAudio(null);
    const item = f?.[k];
    if (item) setTimeout(() => voz.falar(item.p.en, `${item.id}-treino`), 300);
  }
  async function gravar() {
    setErroMic("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const partes: Blob[] = [];
      rec.ondataavailable = (e) => partes.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudio(URL.createObjectURL(new Blob(partes, { type: rec.mimeType })));
        setGravando(false);
      };
      gravador.current = rec;
      rec.start();
      setGravando(true);
    } catch {
      setErroMic("Não foi possível usar o microfone. Responda em voz alta mesmo assim!");
    }
  }
  function pararGravacao() {
    if (gravador.current && gravador.current.state === "recording") gravador.current.stop();
    gravador.current = null;
  }

  if (!fila) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-[24px] border border-line bg-white p-8 text-center">
        <span aria-hidden="true" className="text-5xl">🎙</span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-extrabold">Simulação de entrevista</h2>
          <p className="max-w-[560px] text-[16px] leading-relaxed text-ink-2">
            O entrevistador faz uma pergunta em inglês ({rotulo}). Responda em voz alta, como se fosse a entrevista de verdade. Se quiser, grave sua resposta para ouvir depois, e só então veja a resposta-modelo.
          </p>
        </div>
        <fieldset className="flex flex-col items-center gap-2">
          <legend className="mb-2 text-sm font-semibold text-navy">Quantas perguntas?</legend>
          <div className="flex gap-2">
            {[5, 10, 20].map((n) => (
              <button key={n} type="button" onClick={() => setQtd(n)} aria-pressed={qtd === n}
                className={`min-h-11 min-w-14 cursor-pointer rounded-full border-2 px-4 font-semibold ${qtd === n ? "border-navy bg-navy text-white" : "border-line text-navy hover:border-navy"}`}>{n}</button>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={comecar} className="min-h-14 cursor-pointer rounded-full bg-brand-strong px-8 font-display text-lg font-bold text-white hover:bg-brand-deep">Começar a entrevista</button>
        <p className="text-[13px] text-muted">Dica: use fones de ouvido e um lugar silencioso.</p>
      </div>
    );
  }

  if (!atual) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-[24px] border border-[#bfe6cf] bg-[#eefaf2] p-8 text-center">
        <span aria-hidden="true" className="text-5xl">✈︎</span>
        <h2 className="font-display text-2xl font-extrabold">Entrevista concluída!</h2>
        <p className="max-w-[520px] text-[16px] text-ink-2">Você respondeu {fila.length} perguntas. Repita o treino até as respostas saírem naturais, sem decorar palavra por palavra.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={comecar} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Treinar de novo</button>
          <Link href="/crew-select/entrevista-ingles" className="inline-flex min-h-12 items-center rounded-full border-2 border-navy px-6 font-semibold text-navy hover:bg-white">Voltar às partes</Link>
        </div>
      </div>
    );
  }

  const limite = 45;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-[15px]">
        <span className="font-semibold">Pergunta {i + 1} de {fila.length}</span>
        <span className="text-muted">{atual.parte}</span>
      </div>
      <span className="h-2 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-2 rounded-full bg-navy transition-all" style={{ width: `${(i / fila.length) * 100}%` }} /></span>

      <section aria-live="polite" className="flex flex-col gap-5 rounded-[24px] bg-navy p-6 text-white md:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs font-bold tracking-[.12em] text-[#ffb3c4] uppercase">Interviewer</span>
          <span className={`font-display text-lg font-bold tabular-nums ${segundos > limite && !mostrar ? "text-[#ffb3c4]" : "text-white/80"}`} aria-label={`${segundos} segundos`}>
            ⏱ {String(Math.floor(segundos / 60)).padStart(2, "0")}:{String(segundos % 60).padStart(2, "0")}
          </span>
        </div>
        <p lang="en" className="font-display text-[26px] leading-snug font-extrabold md:text-[32px]"><ComLacunas texto={atual.p.en} /></p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => voz.falar(atual.p.en, `${atual.id}-treino`)} className="min-h-11 cursor-pointer rounded-full bg-white/15 px-4 text-sm font-semibold hover:bg-white/25">🔊 Ouvir de novo</button>
          {!gravando ? (
            <button type="button" onClick={gravar} className="min-h-11 cursor-pointer rounded-full bg-white px-4 text-sm font-semibold text-navy hover:bg-[#f0f2f7]">● Gravar minha resposta</button>
          ) : (
            <button type="button" onClick={pararGravacao} className="min-h-11 animate-pulse cursor-pointer rounded-full bg-[#ff5a7a] px-4 text-sm font-semibold text-white">■ Parar gravação</button>
          )}
        </div>
        {audio && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-white/80">Sua resposta:</span>
            <audio controls src={audio} className="w-full max-w-[420px]" />
          </div>
        )}
        {erroMic && <p className="text-sm text-[#ffd0da]">{erroMic}</p>}
        {segundos > limite && !mostrar && <p className="text-sm text-[#ffd0da]">Respostas de até 45 segundos costumam funcionar melhor: objetivas e completas.</p>}
      </section>

      {!mostrar ? (
        <button type="button" onClick={() => { setMostrar(true); pararGravacao(); }} className="min-h-12 cursor-pointer self-start rounded-full border-2 border-navy px-6 font-semibold text-navy hover:bg-soft">
          Já respondi: ver resposta-modelo
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-[20px] border border-[#cfe0ff] bg-[#f2f7ff] p-5">
          <p className="text-[15px] text-muted">{atual.p.pt}</p>
          {atual.p.modelo && (
            <div className="flex items-start justify-between gap-3">
              <p lang="en" className="text-[17px] leading-relaxed text-navy"><ComLacunas texto={atual.p.modelo} /></p>
              <BotaoOuvir texto={atual.p.modelo} id={`${atual.id}-treino-r`} voz={voz} />
            </div>
          )}
          {atual.p.dica && <p className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep"><strong>Dica:</strong> {atual.p.dica}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => { alternar(atual.id, true); irPara(i + 1); }} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
              {i + 1 < fila.length ? "Próxima pergunta →" : "Terminar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
