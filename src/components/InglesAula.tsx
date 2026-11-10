"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { salvarQuizIngles } from "@/app/crew-actions";
import { ELENCO, NOTA_MINIMA, type Atividade, type AulaIngles, type Personagem, type Questao } from "@/lib/ingles-a-bordo";

/* =================================================================== utilidades */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Embaralha sempre do mesmo jeito para o mesmo texto (o servidor e o navegador mostram a mesma ordem). */
function embaralhar<T>(lista: T[], semente: string): T[] {
  const r = [...lista];
  let s = hash(semente) || 1;
  const rnd = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)), ((s ^= s >>> 16) >>> 0) / 4294967296);
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  if (r.length > 1 && r.every((x, i) => x === lista[i])) r.push(r.shift() as T);
  return r;
}

const normalizar = (s: string) =>
  s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim();
const palavras = (s: string) => normalizar(s).split(" ").filter(Boolean);
const semColchetes = (s: string) => s.replace(/\[([^\]]+)\]/g, "$1");

/** Compara a frase-alvo com o que o aluno escreveu/falou, palavra por palavra (LCS). */
function comparar(alvo: string, dito: string) {
  const a = semColchetes(alvo).split(/\s+/).filter(Boolean);
  const an = a.map((w) => normalizar(w));
  const d = palavras(dito);
  const dp = Array.from({ length: an.length + 1 }, () => new Array<number>(d.length + 1).fill(0));
  for (let i = an.length - 1; i >= 0; i--)
    for (let j = d.length - 1; j >= 0; j--) dp[i][j] = an[i] === d[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Array<boolean>(a.length).fill(false);
  let i = 0, j = 0;
  while (i < an.length && j < d.length) {
    if (an[i] === d[j]) { ok[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  an.forEach((w, k) => { if (!w) ok[k] = true; });
  const total = an.filter(Boolean).length || 1;
  return { itens: a.map((w, k) => ({ w, ok: ok[k] })), pct: Math.round((ok.filter((x, k) => x && an[k]).length / total) * 100) };
}

function Comparacao({ r }: { r: ReturnType<typeof comparar> }) {
  return (
    <p lang="en" className="text-[17px] leading-relaxed">
      {r.itens.map((x, i) => (
        <span key={i} className={`mr-1 rounded px-0.5 ${x.ok ? "text-[#0f6b3a]" : "bg-[#ffe1e7] text-brand-deep underline decoration-wavy"}`}>{x.w}</span>
      ))}
    </p>
  );
}

const ComLacunas = ({ texto }: { texto: string }) => (
  <>{texto.split(/(\[[^\]]+\])/g).map((p, i) => (p.startsWith("[") ? <mark key={i} className="rounded bg-[#fff3c4] px-1 text-navy">{p.slice(1, -1)}</mark> : p))}</>
);

/* =================================================================== voz do navegador */

const FEM = /female|samantha|victoria|karen|moira|tessa|fiona|serena|susan|zira|hazel|libby|sonia|natasha|aria|jenny|michelle|catherine|allison|ava|kate|joanna|salli|kendra|kimberly|emma|amy|olivia|google us english|google uk english female/i;
const MAS = /\bmale|daniel|alex\b|fred|oliver|george|ryan|guy|david|mark|james|thomas|arthur|aaron|gordon|lee\b|matthew|brian|joey|justin|russell|google uk english male/i;
const REGIAO: Record<Personagem["sotaque"], RegExp> = { US: /en[-_]US/i, GB: /en[-_](GB|IE)/i, AU: /en[-_](AU|NZ)/i, BR: /en[-_]US/i };
const generoDe = (v: SpeechSynthesisVoice) => (/female/i.test(v.name) || FEM.test(v.name) ? "f" : MAS.test(v.name) ? "m" : "?");

function useVoz() {
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[]>([]);
  const [falando, setFalando] = useState<string | null>(null);
  const [linha, setLinha] = useState(-1);
  const [suportado, setSuportado] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) { setSuportado(false); return; } // eslint-disable-line react-hooks/set-state-in-effect
    const ler = () => setVozes(window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)));
    ler();
    window.speechSynthesis.addEventListener("voiceschanged", ler);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged", ler); window.speechSynthesis.cancel(); };
  }, []);

  /** Escolhe uma voz diferente para cada personagem: gênero e sotaque quando o aparelho tiver. */
  const vozPara = useCallback((quem: string | undefined, usadas: Map<string, SpeechSynthesisVoice | undefined>) => {
    if (!quem || !ELENCO[quem]) return vozes.find((v) => /en[-_]US/i.test(v.lang)) ?? vozes[0];
    if (usadas.has(quem)) return usadas.get(quem);
    const p = ELENCO[quem];
    const ocupadas = new Set([...usadas.values()].filter(Boolean).map((v) => v!.voiceURI));
    const camadas = [
      vozes.filter((v) => REGIAO[p.sotaque].test(v.lang) && generoDe(v) === p.voz),
      vozes.filter((v) => generoDe(v) === p.voz),
      vozes.filter((v) => REGIAO[p.sotaque].test(v.lang)),
      vozes,
    ];
    let escolhida: SpeechSynthesisVoice | undefined;
    for (const c of camadas) { escolhida = c.find((v) => !ocupadas.has(v.voiceURI)); if (escolhida) break; }
    escolhida ??= camadas.find((c) => c.length)?.[0];
    usadas.set(quem, escolhida);
    return escolhida;
  }, [vozes]);

  const parar = useCallback(() => { if (suportado) window.speechSynthesis.cancel(); setFalando(null); setLinha(-1); }, [suportado]);

  /** Fala uma ou várias falas em sequência. Clicar de novo no mesmo botão para. */
  const falar = useCallback((id: string, falas: { en: string; quem?: string }[], rate = 0.92) => {
    if (!suportado) return;
    const s = window.speechSynthesis;
    s.cancel();
    if (falando === id) { setFalando(null); setLinha(-1); return; }
    const usadas = new Map<string, SpeechSynthesisVoice | undefined>();
    falas.forEach((f, i) => {
      const u = new SpeechSynthesisUtterance(semColchetes(f.en));
      const v = vozPara(f.quem, usadas);
      if (v) u.voice = v;
      u.lang = v?.lang ?? "en-US";
      u.rate = rate;
      const p = f.quem ? ELENCO[f.quem] : undefined;
      // aparelho com uma voz só: muda o tom para diferenciar homem e mulher
      if (p && v && generoDe(v) !== p.voz) u.pitch = p.voz === "m" ? 0.75 : 1.2;
      u.onstart = () => setLinha(i);
      if (i === falas.length - 1) { u.onend = () => { setFalando(null); setLinha(-1); }; u.onerror = u.onend; }
      s.speak(u);
    });
    setFalando(id);
  }, [falando, suportado, vozPara]);

  return { falar, parar, falando, linha, suportado };
}
type Voz = ReturnType<typeof useVoz>;

function BotaoOuvir({ voz, id, texto, quem, rotulo = "Ouvir", lento, claro }: { voz: Voz; id: string; texto: string; quem?: string; rotulo?: string; lento?: boolean; claro?: boolean }) {
  const ativo = voz.falando === id;
  return (
    <button
      type="button"
      onClick={() => voz.falar(id, [{ en: texto, quem }], lento ? 0.75 : 0.92)}
      aria-label={ativo ? "Parar" : `${rotulo}: ${semColchetes(texto)}`}
      className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ${ativo ? "bg-brand-strong text-white" : claro ? "bg-white text-navy hover:bg-[#eef0f5]" : "bg-soft text-navy hover:bg-[#e6e9f0]"}`}
    >
      <span aria-hidden="true">{ativo ? "■" : "🔊"}</span>
      {rotulo && <span>{ativo ? "Parar" : rotulo}</span>}
    </button>
  );
}

/* =================================================================== microfone */

function useGravador() {
  const [gravando, setGravando] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const gravar = async () => {
    setErro("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const partes: Blob[] = [];
      r.ondataavailable = (e) => partes.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setUrl(URL.createObjectURL(new Blob(partes, { type: r.mimeType }))); setGravando(false); };
      rec.current = r;
      r.start();
      setUrl(null);
      setGravando(true);
    } catch {
      setErro("Não foi possível usar o microfone. Fale em voz alta mesmo assim!");
    }
  };
  const parar = () => { if (rec.current?.state === "recording") rec.current.stop(); rec.current = null; };
  return { gravando, url, erro, gravar, parar, limpar: () => setUrl(null) };
}

type Reconhecimento = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };
function criarReconhecimento(): Reconhecimento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, new () => Reconhecimento>;
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

/* =================================================================== blocos visuais */

function Bloco({ id, numero, titulo, sub, children }: { id: string; numero: string; titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex scroll-mt-20 flex-col gap-5 rounded-[24px] border border-line bg-white p-5 md:p-8">
      <header className="flex items-start gap-3">
        <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white">{numero}</span>
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-t`} className="font-display text-[22px] leading-tight font-extrabold">{titulo}</h2>
          {sub && <p className="text-[15px] text-ink-2">{sub}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Exercicio({ titulo, instrucao, children }: { titulo: string; instrucao?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-soft p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-bold">{titulo}</h3>
        {instrucao && <p className="text-[15px] text-ink-2">{instrucao}</p>}
      </div>
      {children}
    </div>
  );
}

const btnPrim = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";
const btnSec = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-navy px-5 font-semibold text-navy hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

function Retorno({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div role="status" className={`rounded-xl px-4 py-3 text-[15px] ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>{children}</div>
  );
}

/* =================================================================== diálogo */

function Dialogo({ aula, audio, voz }: { aula: AulaIngles; audio?: string; voz: Voz }) {
  const [texto, setTexto] = useState(false);
  const [traducao, setTraducao] = useState(false);
  const [vel, setVel] = useState(1);
  const player = useRef<HTMLAudioElement>(null);
  const idTudo = "dialogo";
  const tocandoTudo = voz.falando === idTudo;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-ink-2">{aula.dialogo.contexto}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Personagens">
        {aula.dialogo.personagens.map((q) => (
          <li key={q} className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1.5 text-[13px]">
            <strong className="font-semibold">{ELENCO[q]?.nome ?? q}</strong>
            <span className="text-muted">{ELENCO[q]?.papel}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-[20px] bg-navy p-5 text-white">
        <span className="text-xs font-bold tracking-[.12em] text-[#ffb3c4] uppercase">🎧 {aula.dialogo.titulo}</span>
        {audio ? (
          <>
            <audio ref={player} controls preload="metadata" src={audio} className="w-full" onPlay={() => voz.parar()} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/80">Velocidade:</span>
              {[0.75, 1].map((v) => (
                <button key={v} type="button" aria-pressed={vel === v} onClick={() => { setVel(v); if (player.current) player.current.playbackRate = v; }}
                  className={`min-h-9 cursor-pointer rounded-full px-3 font-semibold ${vel === v ? "bg-white text-navy" : "bg-white/15 hover:bg-white/25"}`}>{v === 1 ? "Normal" : "Devagar"}</button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => voz.falar(idTudo, aula.dialogo.falas)} disabled={!voz.suportado}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-white px-5 font-display font-bold text-navy hover:bg-[#eef0f5] disabled:opacity-50">
              {tocandoTudo ? "■ Parar" : "▶ Ouvir o diálogo"}
            </button>
            <button type="button" onClick={() => voz.falar(idTudo, aula.dialogo.falas, 0.75)} disabled={!voz.suportado || tocandoTudo}
              className="min-h-12 cursor-pointer rounded-full bg-white/15 px-4 text-sm font-semibold hover:bg-white/25 disabled:opacity-50">🐢 Mais devagar</button>
            {!voz.suportado && <span className="text-sm text-white/80">Seu navegador não tem voz em inglês. Leia o diálogo abaixo.</span>}
          </div>
        )}
        <p className="text-sm text-white/75">Primeiro ouça sem ler. Depois abra o texto e ouça de novo acompanhando.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTexto(!texto)} aria-expanded={texto} className={btnSec}>{texto ? "Esconder o texto" : "Ver o texto do diálogo"}</button>
        {texto && <button type="button" onClick={() => setTraducao(!traducao)} aria-pressed={traducao} className={btnSec}>{traducao ? "Esconder tradução" : "Mostrar tradução"}</button>}
      </div>

      {texto && (
        <ol className="flex flex-col gap-2">
          {aula.dialogo.falas.map((f, i) => {
            const atual = tocandoTudo && voz.linha === i;
            return (
              <li key={i} className={`flex items-start gap-3 rounded-2xl border p-3 transition ${atual ? "border-brand bg-brand-soft" : "border-line"}`}>
                <span className="w-16 shrink-0 pt-1 text-[13px] font-bold text-brand-strong">{f.quem === "Captain" ? "Captain" : f.quem}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span lang="en" className="text-[16px] leading-relaxed">{f.en}</span>
                  {traducao && <span className="text-[14px] text-muted">{f.pt}</span>}
                </span>
                <BotaoOuvir voz={voz} id={`fala-${i}`} texto={f.en} quem={f.quem} rotulo="" />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/* =================================================================== múltipla escolha */

function QuestaoMC({ q, n, escolha, onEscolher, revelar, semente }: { q: Questao; n: number; escolha?: number; onEscolher: (i: number) => void; revelar: boolean; semente: string }) {
  const ops = useMemo(() => embaralhar(q.opcoes.map((o, i) => ({ ...o, i })), semente + q.pergunta), [q, semente]);
  const certa = q.opcoes.findIndex((o) => o.certa);
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2 text-[16px] font-semibold"><span className="text-muted">{n}.</span> <span lang={/[ãçéáíóú]/i.test(q.pergunta) ? "pt-BR" : "en"}>{q.pergunta}</span></legend>
      {ops.map((o) => {
        const marcada = escolha === o.i;
        const estado = revelar ? (o.i === certa ? "certa" : marcada ? "errada" : "") : marcada ? "marcada" : "";
        return (
          <button key={o.i} type="button" disabled={revelar} onClick={() => onEscolher(o.i)} aria-pressed={marcada}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-[15px] disabled:cursor-default ${
              estado === "certa" ? "border-[#2e9e62] bg-[#e5f6ec]" : estado === "errada" ? "border-brand bg-brand-soft" : estado === "marcada" ? "border-navy bg-[#eef0f5]" : "border-line bg-white hover:border-navy"
            }`}>
            <span aria-hidden="true" className="w-5 shrink-0 text-center font-bold">{estado === "certa" ? "✓" : estado === "errada" ? "✗" : marcada ? "●" : "○"}</span>
            <span>{o.texto}</span>
          </button>
        );
      })}
      {revelar && <p className="rounded-xl bg-white px-4 py-2.5 text-[14px] text-ink-2"><strong>{escolha === certa ? "Isso! " : "Resposta: "}</strong>{q.explicacao}</p>}
    </fieldset>
  );
}

function Compreensao({ questoes }: { questoes: Questao[] }) {
  const [esc, setEsc] = useState<Record<number, number>>({});
  return (
    <Exercicio titulo="Você entendeu?" instrucao="Responda depois de ouvir o diálogo. A correção aparece na hora.">
      {questoes.map((q, i) => (
        <QuestaoMC key={i} q={q} n={i + 1} escolha={esc[i]} revelar={esc[i] !== undefined} onEscolher={(o) => setEsc({ ...esc, [i]: o })} semente="comp" />
      ))}
    </Exercicio>
  );
}

/* =================================================================== atividades */

function Ditado({ frases, voz }: { frases: string[]; voz: Voz }) {
  const [txt, setTxt] = useState<string[]>(frases.map(() => ""));
  const [conf, setConf] = useState<boolean[]>(frases.map(() => false));
  return (
    <Exercicio titulo="✍️ Ditado" instrucao="Ouça e escreva exatamente o que ouviu. Pode ouvir quantas vezes quiser.">
      {frases.map((f, i) => {
        const r = conf[i] ? comparar(f, txt[i]) : null;
        return (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-muted">{i + 1}.</span>
              <BotaoOuvir voz={voz} id={`dit-${i}`} texto={f} />
              <BotaoOuvir voz={voz} id={`dit-l-${i}`} texto={f} rotulo="Devagar" lento />
            </div>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setConf(conf.map((c, k) => (k === i ? true : c))); }}>
              <label className="sr-only" htmlFor={`dit-in-${i}`}>Frase {i + 1}</label>
              <input id={`dit-in-${i}`} lang="en" autoComplete="off" autoCapitalize="off" spellCheck={false} value={txt[i]}
                onChange={(e) => { setTxt(txt.map((t, k) => (k === i ? e.target.value : t))); setConf(conf.map((c, k) => (k === i ? false : c))); }}
                className="min-h-12 flex-1 rounded-xl border border-[#c9cedb] px-3.5 text-[16px]" placeholder="Escreva aqui…" />
              <button type="submit" disabled={!txt[i].trim()} className={btnPrim}>Conferir</button>
            </form>
            {r && (
              <Retorno ok={r.pct === 100}>
                {r.pct === 100 ? "Perfeito! " : `${r.pct}% certo. Em vermelho, o que faltou ou ficou diferente:`}
                {r.pct < 100 && <Comparacao r={r} />}
              </Retorno>
            )}
          </div>
        );
      })}
    </Exercicio>
  );
}

function Ordenar({ a, voz, n }: { a: Extract<Atividade, { tipo: "ordenar" }>; voz: Voz; n: number }) {
  const inicial = useMemo(() => embaralhar(a.falas, a.instrucao + n), [a, n]);
  const [ordem, setOrdem] = useState(inicial);
  const [conf, setConf] = useState(false);
  const mover = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= ordem.length) return;
    const r = [...ordem];
    [r[i], r[j]] = [r[j], r[i]];
    setOrdem(r);
    setConf(false);
  };
  const acertos = ordem.filter((f, i) => f === a.falas[i]).length;
  const tudoCerto = acertos === a.falas.length;
  return (
    <Exercicio titulo="🔀 Coloque na ordem" instrucao={`${a.instrucao} Use as setas para subir ou descer cada item.`}>
      <ol className="flex flex-col gap-2">
        {ordem.map((f, i) => {
          const estado = conf ? (f === a.falas[i] ? "ok" : "erro") : "";
          return (
            <li key={f} className={`flex items-center gap-2 rounded-xl border-2 bg-white p-2 pl-3 ${estado === "ok" ? "border-[#2e9e62]" : estado === "erro" ? "border-brand" : "border-transparent"}`}>
              <span className="w-5 font-display font-bold text-muted">{i + 1}</span>
              <span lang="en" className="flex-1 text-[15px]">{f}</span>
              <BotaoOuvir voz={voz} id={`ord-${n}-${f}`} texto={f} rotulo="" />
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir: ${f}`} className="h-10 w-10 cursor-pointer rounded-full bg-soft font-bold hover:bg-[#e6e9f0] disabled:opacity-30">↑</button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} aria-label={`Descer: ${f}`} className="h-10 w-10 cursor-pointer rounded-full bg-soft font-bold hover:bg-[#e6e9f0] disabled:opacity-30">↓</button>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setConf(true)} className={btnPrim}>Conferir</button>
        {conf && !tudoCerto && <button type="button" onClick={() => { setOrdem(a.falas); }} className={btnSec}>Mostrar a ordem certa</button>}
      </div>
      {conf && <Retorno ok={tudoCerto}>{tudoCerto ? "Tudo na ordem certa!" : `${acertos} de ${a.falas.length} no lugar certo. Os itens com borda vermelha estão fora de lugar.`}</Retorno>}
    </Exercicio>
  );
}

function Ligar({ a, n }: { a: Extract<Atividade, { tipo: "ligar" }>; n: number }) {
  const opcoes = useMemo(() => embaralhar(a.pares.map((p, i) => ({ t: p[1], i })), a.instrucao + n), [a, n]);
  const [res, setRes] = useState<Record<number, number>>({}); // item -> índice da resposta
  const [sel, setSel] = useState(0);
  const [conf, setConf] = useState(false);
  const usadas = new Set(Object.values(res));
  const escolher = (op: number) => {
    const novo = { ...res };
    for (const k of Object.keys(novo)) if (novo[+k] === op) delete novo[+k];
    novo[sel] = op;
    setRes(novo);
    setConf(false);
    const prox = a.pares.findIndex((_, i) => novo[i] === undefined);
    if (prox >= 0) setSel(prox);
  };
  const acertos = a.pares.filter((_, i) => res[i] === i).length;
  return (
    <Exercicio titulo="🔗 Ligue as colunas" instrucao={`${a.instrucao} Toque num item e depois na resposta.`}>
      <ul className="flex flex-col gap-2">
        {a.pares.map((p, i) => {
          const r = res[i];
          const estado = conf ? (r === i ? "ok" : "erro") : sel === i ? "sel" : "";
          return (
            <li key={i}>
              <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i}
                className={`flex min-h-12 w-full cursor-pointer flex-col gap-1 rounded-xl border-2 bg-white px-4 py-2 text-left sm:flex-row sm:items-center sm:justify-between ${estado === "ok" ? "border-[#2e9e62]" : estado === "erro" ? "border-brand" : estado === "sel" ? "border-navy" : "border-transparent"}`}>
                <span lang="en" className="font-semibold">{p[0]}</span>
                <span className={`text-[14px] ${r === undefined ? "text-muted italic" : "text-navy"}`}>{r === undefined ? (sel === i ? "escolha abaixo ↓" : "—") : `→ ${a.pares[r][1]}`}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2" aria-label="Respostas">
        {opcoes.map((o) => (
          <button key={o.i} type="button" onClick={() => escolher(o.i)}
            className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[14px] font-semibold ${usadas.has(o.i) ? "border-[#c9cedb] bg-[#eef0f5] text-muted" : "border-navy bg-white text-navy hover:bg-navy hover:text-white"}`}>
            {o.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={Object.keys(res).length < a.pares.length} onClick={() => setConf(true)} className={btnPrim}>Conferir</button>
        {conf && acertos < a.pares.length && <button type="button" onClick={() => setRes(Object.fromEntries(a.pares.map((_, i) => [i, i])))} className={btnSec}>Mostrar respostas</button>}
      </div>
      {conf && <Retorno ok={acertos === a.pares.length}>{acertos === a.pares.length ? "Tudo certo!" : `${acertos} de ${a.pares.length} certos. Corrija os que estão com borda vermelha.`}</Retorno>}
    </Exercicio>
  );
}

function Lacunas({ a }: { a: Extract<Atividade, { tipo: "lacunas" }> }) {
  const [v, setV] = useState<string[]>(a.itens.map(() => ""));
  const [conf, setConf] = useState(false);
  const [ver, setVer] = useState(false);
  const certo = (i: number) => [a.itens[i].resposta, ...(a.itens[i].aceitas ?? [])].some((r) => normalizar(r) === normalizar(v[i]));
  const acertos = a.itens.filter((_, i) => certo(i)).length;
  return (
    <Exercicio titulo="🧩 Complete as frases" instrucao="Escreva a palavra que falta em cada frase.">
      <ol className="flex flex-col gap-3">
        {a.itens.map((it, i) => {
          const [antes, depois] = it.frase.split("___");
          const estado = conf ? (certo(i) ? "ok" : "erro") : "";
          return (
            <li key={i} className="flex flex-col gap-1 rounded-xl bg-white p-3">
              <span lang="en" className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[16px] leading-relaxed">
                <span className="mr-1 font-display font-bold text-muted">{i + 1}.</span>
                {antes}
                <input aria-label={`Lacuna da frase ${i + 1}`} value={ver ? it.resposta : v[i]} readOnly={ver} autoComplete="off" autoCapitalize="off" spellCheck={false}
                  onChange={(e) => { setV(v.map((x, k) => (k === i ? e.target.value : x))); setConf(false); }}
                  style={{ width: `${Math.max(it.resposta.length, 4) + 3}ch` }}
                  className={`min-h-10 rounded-lg border-2 px-2 text-center font-semibold ${estado === "ok" || ver ? "border-[#2e9e62] bg-[#e5f6ec]" : estado === "erro" ? "border-brand bg-brand-soft" : "border-[#c9cedb]"}`} />
                {depois}
              </span>
              {it.dica && <span className="text-[13px] text-muted">Dica: {it.dica}</span>}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setConf(true)} disabled={ver} className={btnPrim}>Conferir</button>
        {conf && acertos < a.itens.length && <button type="button" onClick={() => setVer(!ver)} className={btnSec}>{ver ? "Tentar de novo" : "Mostrar respostas"}</button>}
      </div>
      {conf && !ver && <Retorno ok={acertos === a.itens.length}>{acertos === a.itens.length ? "Todas certas!" : `${acertos} de ${a.itens.length} certas.`}</Retorno>}
    </Exercicio>
  );
}

function Falar({ a, voz }: { a: Extract<Atividade, { tipo: "falar" }>; voz: Voz }) {
  const [ouvindo, setOuvindo] = useState<number | null>(null);
  const [res, setRes] = useState<Record<number, { dito: string; r: ReturnType<typeof comparar> }>>({});
  const [aviso, setAviso] = useState("");
  const [suporta, setSuporta] = useState(true);
  const rec = useRef<Reconhecimento | null>(null);
  useEffect(() => { setSuporta(!!criarReconhecimento()); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  const gravador = useGravador();
  const [gravandoI, setGravandoI] = useState<number | null>(null);

  const falar = (i: number) => {
    if (ouvindo === i) { rec.current?.stop(); return; }
    voz.parar();
    const r = criarReconhecimento();
    if (!r) return;
    setAviso("");
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const dito = Array.from(e.results).map((x) => x[0].transcript).join(" ");
      setRes((p) => ({ ...p, [i]: { dito, r: comparar(a.frases[i].en, dito) } }));
    };
    r.onerror = (e) => setAviso(e.error === "not-allowed" ? "Libere o microfone no navegador para usar este exercício." : e.error === "no-speech" ? "Não ouvimos nada. Toque em Falar e fale perto do microfone." : "Não deu para reconhecer agora. Tente de novo.");
    r.onend = () => setOuvindo(null);
    rec.current = r;
    setOuvindo(i);
    r.start();
  };

  return (
    <Exercicio titulo="🎤 Fale em inglês" instrucao={suporta ? "Ouça o modelo, toque em Falar e diga a frase. O site mostra o que entendeu e as palavras que faltaram." : "Ouça o modelo e repita em voz alta. Grave para comparar com o modelo. (O reconhecimento de fala funciona no Google Chrome e no Android.)"}>
      {a.frases.map((f, i) => {
        const r = res[i];
        return (
          <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p lang="en" className="font-display text-[18px] font-bold">{f.en}</p>
            <p className="-mt-2 text-[14px] text-muted">{f.pt}</p>
            <div className="flex flex-wrap gap-2">
              <BotaoOuvir voz={voz} id={`falar-${i}`} texto={f.en} rotulo="Ouvir o modelo" />
              {suporta ? (
                <button type="button" onClick={() => falar(i)} className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${ouvindo === i ? "animate-pulse bg-brand-strong text-white" : "bg-navy text-white hover:bg-navy-deep"}`}>
                  {ouvindo === i ? "● Ouvindo… toque para parar" : "🎤 Falar"}
                </button>
              ) : gravador.gravando && gravandoI === i ? (
                <button type="button" onClick={gravador.parar} className="min-h-10 animate-pulse cursor-pointer rounded-full bg-brand-strong px-4 text-sm font-semibold text-white">■ Parar</button>
              ) : (
                <button type="button" onClick={() => { setGravandoI(i); gravador.gravar(); }} className="min-h-10 cursor-pointer rounded-full bg-navy px-4 text-sm font-semibold text-white">● Gravar</button>
              )}
            </div>
            {!suporta && gravandoI === i && gravador.url && <audio controls src={gravador.url} className="w-full max-w-[420px]" />}
            {r && (
              <Retorno ok={r.r.pct >= 90}>
                <span className="block">{r.r.pct >= 90 ? `Muito bem! ${r.r.pct}% das palavras.` : `${r.r.pct}% das palavras. Treine as que estão em vermelho e tente de novo.`}</span>
                <Comparacao r={r.r} />
                <span className="block text-[13px] opacity-80">Entendemos: “{r.dito}”</span>
              </Retorno>
            )}
          </div>
        );
      })}
      {(aviso || gravador.erro) && <p role="alert" className="text-[14px] text-brand-deep">{aviso || gravador.erro}</p>}
    </Exercicio>
  );
}

function Roleplay({ a, voz }: { a: Extract<Atividade, { tipo: "roleplay" }>; voz: Voz }) {
  const [i, setI] = useState(-1);
  const [ver, setVer] = useState(false);
  const g = useGravador();
  const turno = a.turnos[i];
  const ir = (k: number) => {
    setI(k);
    setVer(false);
    g.parar();
    g.limpar();
    const t = a.turnos[k];
    if (t) setTimeout(() => voz.falar(`rp-${k}`, [{ en: t.outro }]), 250);
  };
  return (
    <Exercicio titulo="🎭 Roleplay" instrucao={a.situacao}>
      {i < 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-[15px] text-ink-2">O site faz o papel da outra pessoa. Você responde em voz alta (e pode gravar). Depois compare com a sugestão. Trechos em <mark className="rounded bg-[#fff3c4] px-1">amarelo</mark> são para você trocar pelos seus dados.</p>
          <button type="button" onClick={() => ir(0)} className={btnPrim}>Começar o roleplay</button>
        </div>
      ) : turno ? (
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-muted">Fala {i + 1} de {a.turnos.length}</span>
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-navy p-4 text-white">
            <p lang="en" className="font-display text-[19px] leading-snug font-bold">{turno.outro}</p>
            <BotaoOuvir voz={voz} id={`rp-${i}`} texto={turno.outro} rotulo="" claro />
          </div>
          <div className="flex flex-wrap gap-2">
            {!g.gravando ? (
              <button type="button" onClick={g.gravar} className="min-h-11 cursor-pointer rounded-full bg-white px-4 text-sm font-semibold text-navy ring-2 ring-navy">● Gravar minha resposta</button>
            ) : (
              <button type="button" onClick={g.parar} className="min-h-11 animate-pulse cursor-pointer rounded-full bg-brand-strong px-4 text-sm font-semibold text-white">■ Parar gravação</button>
            )}
            {!ver && <button type="button" onClick={() => { setVer(true); g.parar(); }} className={btnSec}>Ver sugestão de resposta</button>}
          </div>
          {g.url && <audio controls src={g.url} className="w-full max-w-[420px]" />}
          {g.erro && <p className="text-[14px] text-brand-deep">{g.erro}</p>}
          {ver && (
            <div className="flex flex-col gap-3 rounded-2xl border border-[#cfe0ff] bg-[#f2f7ff] p-4">
              <div className="flex items-start justify-between gap-3">
                <p lang="en" className="text-[17px] leading-relaxed"><ComLacunas texto={turno.modelo} /></p>
                <BotaoOuvir voz={voz} id={`rp-m-${i}`} texto={turno.modelo.split(" / ")[0]} rotulo="" claro />
              </div>
              <button type="button" onClick={() => ir(i + 1)} className={`${btnPrim} self-start`}>{i + 1 < a.turnos.length ? "Próxima fala →" : "Terminar"}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <Retorno ok>Roleplay concluído! Repita até sair naturalmente, sem ler.</Retorno>
          <button type="button" onClick={() => ir(0)} className={btnSec}>Fazer de novo</button>
        </div>
      )}
    </Exercicio>
  );
}

/* =================================================================== quiz final */

function Quiz({ aula, chave, notaAnterior, proxima, logado }: { aula: AulaIngles; chave: string; notaAnterior?: number; proxima?: { href: string; titulo: string }; logado: boolean }) {
  const [esc, setEsc] = useState<Record<number, number>>({});
  const [fim, setFim] = useState<null | { nota: number; salvo: boolean }>(null);
  const [tentativa, setTentativa] = useState(0);
  const [pend, start] = useTransition();
  const router = useRouter();
  const respondidas = Object.keys(esc).length;
  const enviar = () => {
    const acertos = aula.quiz.filter((q, i) => q.opcoes[esc[i]]?.certa).length;
    const nota = Math.round((acertos / aula.quiz.length) * 100);
    start(async () => {
      let salvo = false;
      if (logado) {
        try { salvo = (await salvarQuizIngles(chave, nota)).ok; } catch { salvo = false; }
      }
      setFim({ nota, salvo });
      router.refresh();
      document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const passou = fim ? fim.nota >= NOTA_MINIMA : false;

  return (
    <div className="flex flex-col gap-5">
      {notaAnterior !== undefined && !fim && (
        <p className="rounded-xl bg-soft px-4 py-3 text-[15px]">Sua melhor nota nesta aula: <strong>{notaAnterior}%</strong>{notaAnterior >= NOTA_MINIMA ? " ✓ aula concluída" : ""}. Pode refazer quando quiser.</p>
      )}
      {fim && (
        <div className={`flex flex-col gap-3 rounded-[20px] p-5 ${passou ? "bg-[#e5f6ec]" : "bg-brand-soft"}`} role="status">
          <span className="font-display text-[34px] leading-none font-extrabold">{fim.nota}%</span>
          <p className="text-[16px]">
            {passou ? "Aula concluída! 🎉" : `Faltou pouco. Você precisa de ${NOTA_MINIMA}% para concluir a aula. Revise as explicações abaixo e tente de novo.`}
            {logado && !fim.salvo && " (Não conseguimos salvar sua nota agora.)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {passou && proxima && <Link href={proxima.href} className={btnPrim}>Próxima aula: {proxima.titulo} →</Link>}
            {passou && !proxima && <Link href="/crew-select/ingles-a-bordo" className={btnPrim}>Voltar ao curso</Link>}
            <button type="button" onClick={() => { setEsc({}); setFim(null); setTentativa(tentativa + 1); }} className={btnSec}>Refazer o quiz</button>
          </div>
        </div>
      )}
      {aula.quiz.map((q, i) => (
        <QuestaoMC key={`${tentativa}-${i}`} q={q} n={i + 1} escolha={esc[i]} revelar={!!fim} onEscolher={(o) => setEsc({ ...esc, [i]: o })} semente={`quiz${tentativa}`} />
      ))}
      {!fim && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={enviar} disabled={respondidas < aula.quiz.length || pend} className={btnPrim}>{pend ? "Corrigindo…" : "Ver meu resultado"}</button>
          <span className="text-[14px] text-muted">{respondidas} de {aula.quiz.length} respondidas · nota mínima {NOTA_MINIMA}%</span>
        </div>
      )}
    </div>
  );
}

/* =================================================================== página da aula */

export default function InglesAula({ aula, chave, audio, notaAnterior, proxima, logado }: { aula: AulaIngles; chave: string; audio?: string; notaAnterior?: number; proxima?: { href: string; titulo: string }; logado: boolean }) {
  const voz = useVoz();
  const comp = aula.atividades.find((x) => x.tipo === "compreensao");
  const pratica = aula.atividades.filter((x) => x.tipo !== "compreensao");

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Etapas da aula" className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b border-line bg-white/95 px-4 py-1.5 backdrop-blur md:mx-0 md:rounded-full md:border md:px-2 md:shadow-[0_8px_24px_-18px_rgba(35,42,61,.5)]">
        <ol className="flex gap-1 text-[14px] font-semibold whitespace-nowrap">
          {[["ouvir", "1 · Ouvir"], ["vocabulario", "2 · Vocabulário"], ["praticar", "3 · Praticar"], ["quiz", "4 · Quiz"]].map(([id, t]) => (
            <li key={id}><a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full px-4 text-navy hover:bg-white">{t}</a></li>
          ))}
        </ol>
      </nav>

      <Bloco id="ouvir" numero="1" titulo="Ouça o diálogo" sub={audio ? undefined : "Áudio com voz do navegador. A versão gravada chega em breve."}>
        <Dialogo aula={aula} audio={audio} voz={voz} />
        {comp && comp.tipo === "compreensao" && <Compreensao questoes={comp.questoes} />}
      </Bloco>

      <Bloco id="vocabulario" numero="2" titulo="Vocabulário e expressões" sub="Toque em 🔊 para ouvir a pronúncia.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {aula.vocabulario.map((v) => (
            <li key={v.en} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 pl-4">
              <span className="flex flex-col">
                <strong lang="en" className="text-[16px]">{v.en}</strong>
                <span className="text-[14px] text-muted">{v.pt}</span>
              </span>
              <BotaoOuvir voz={voz} id={`voc-${v.en}`} texto={v.en.split(" (")[0].replace(" / ", ", ")} rotulo="" />
            </li>
          ))}
        </ul>
        <h3 className="pt-2 font-display text-lg font-bold">Expressões-chave</h3>
        <ul className="flex flex-col gap-2">
          {aula.expressoes.map((e) => (
            <li key={e.en} className="flex items-start justify-between gap-3 rounded-2xl bg-soft p-4">
              <span className="flex flex-col gap-0.5">
                <strong lang="en" className="font-display text-[17px]">{e.en}</strong>
                <span className="text-[14px] text-ink-2">{e.pt}</span>
                {e.uso && <span className="text-[13px] text-muted">{e.uso}</span>}
              </span>
              <BotaoOuvir voz={voz} id={`exp-${e.en}`} texto={e.en.replace("…", "")} rotulo="" />
            </li>
          ))}
        </ul>
        {aula.dica && <p className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep"><strong>Dica de comissário:</strong> {aula.dica}</p>}
      </Bloco>

      <Bloco id="praticar" numero="3" titulo="Pratique" sub="Exercícios para fixar. Eles não valem nota: erre à vontade.">
        {pratica.map((a, i) =>
          a.tipo === "ditado" ? <Ditado key={i} frases={a.frases} voz={voz} />
          : a.tipo === "ordenar" ? <Ordenar key={i} a={a} voz={voz} n={i} />
          : a.tipo === "ligar" ? <Ligar key={i} a={a} n={i} />
          : a.tipo === "lacunas" ? <Lacunas key={i} a={a} />
          : a.tipo === "falar" ? <Falar key={i} a={a} voz={voz} />
          : a.tipo === "roleplay" ? <Roleplay key={i} a={a} voz={voz} />
          : null,
        )}
      </Bloco>

      <Bloco id="quiz" numero="4" titulo="Quiz da aula" sub={`Acerte pelo menos ${NOTA_MINIMA}% para concluir a aula e liberar a próxima.`}>
        <Quiz aula={aula} chave={chave} notaAnterior={notaAnterior} proxima={proxima} logado={logado} />
      </Bloco>
    </div>
  );
}
