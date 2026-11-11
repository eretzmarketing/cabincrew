"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { salvarVideoTreino } from "@/app/crew-actions";
import { BLOCOS_VIDEO, CHECKLIST_VIDEO, METAS_VIDEO, NOTA_VIDEO, dentroDoTempo, marcosVideo, mmss } from "@/lib/video";

const btnPrim = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";
const btnSec = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-navy px-6 font-semibold text-navy hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40";
const CHAVE = "cc-video-roteiro";

type Fase = "roteiro" | "gravar" | "revisar";

function lerRascunho(): { meta: number; topicos: Record<string, string> } | null {
  try { const s = localStorage.getItem(CHAVE); return s ? JSON.parse(s) : null; } catch { return null; }
}

function escolherFormato() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const t of ["video/mp4;codecs=avc1,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch { /* segue */ }
  }
  return "";
}

export default function VideoTreino({ companhia }: { companhia?: string }) {
  const [fase, setFase] = useState<Fase>("roteiro");
  const [meta, setMeta] = useState(90);
  const [topicos, setTopicos] = useState<Record<string, string>>({});
  const [erroCam, setErroCam] = useState("");
  const [camPronta, setCamPronta] = useState(false);
  const [contagem, setContagem] = useState(0);
  const [gravando, setGravando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [video, setVideo] = useState<{ url: string; ext: string; duracao: number } | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [salvo, setSalvo] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [pend, start] = useTransition();
  const router = useRouter();

  const preview = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const pedacos = useRef<Blob[]>([]);
  const inicio = useRef(0);
  const relogio = useRef<number | null>(null);

  useEffect(() => {
    const r = lerRascunho();
    if (r) { if (METAS_VIDEO.some((m) => m.seg === r.meta)) setMeta(r.meta); setTopicos(r.topicos ?? {}); } // eslint-disable-line react-hooks/set-state-in-effect -- rascunho salvo no aparelho
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify({ meta, topicos })); } catch { /* sem armazenamento */ }
  }, [meta, topicos]);

  const desligarCamera = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamPronta(false);
  }, []);

  useEffect(() => () => {
    desligarCamera();
    if (relogio.current) window.clearInterval(relogio.current);
  }, [desligarCamera]);

  useEffect(() => () => { if (video) URL.revokeObjectURL(video.url); }, [video]);

  const ligarCamera = useCallback(async () => {
    setErroCam("");
    if (!navigator.mediaDevices?.getUserMedia || escolherFormato() === null) {
      setErroCam("Seu navegador não permite gravar vídeo aqui. Use o Chrome, o Edge ou o Safari atualizado, ou grave com o app de câmera do celular seguindo o roteiro.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      if (preview.current) { preview.current.srcObject = s; await preview.current.play().catch(() => {}); }
      setCamPronta(true);
    } catch (e) {
      const nome = (e as DOMException)?.name;
      setErroCam(nome === "NotAllowedError"
        ? "Você não liberou a câmera e o microfone. Clique no cadeado ao lado do endereço do site, permita câmera e microfone e tente de novo."
        : nome === "NotFoundError" ? "Não encontramos câmera ou microfone neste aparelho." : "Não foi possível abrir a câmera. Feche outros apps que estejam usando a câmera e tente de novo.");
    }
  }, []);

  useEffect(() => {
    if (fase === "gravar") ligarCamera(); // eslint-disable-line react-hooks/set-state-in-effect -- liga/desliga a câmera ao trocar de fase
    else desligarCamera();
  }, [fase, ligarCamera, desligarCamera]);

  const parar = useCallback(() => {
    if (relogio.current) { window.clearInterval(relogio.current); relogio.current = null; }
    if (rec.current && rec.current.state !== "inactive") rec.current.stop();
    setGravando(false);
  }, []);

  const gravar = () => {
    if (!stream.current) return;
    setContagem(3);
    let n = 3;
    const t = window.setInterval(() => {
      n -= 1;
      setContagem(n);
      if (n > 0) return;
      window.clearInterval(t);
      const formato = escolherFormato() || undefined;
      const r = new MediaRecorder(stream.current!, formato ? { mimeType: formato } : undefined);
      pedacos.current = [];
      r.ondataavailable = (ev) => { if (ev.data.size) pedacos.current.push(ev.data); };
      r.onstop = () => {
        const tipo = r.mimeType || formato || "video/webm";
        const blob = new Blob(pedacos.current, { type: tipo });
        const duracao = Math.max(1, Math.round((Date.now() - inicio.current) / 1000));
        setVideo({ url: URL.createObjectURL(blob), ext: tipo.includes("mp4") ? "mp4" : "webm", duracao });
        setMarcados(new Set(dentroDoTempo(duracao, meta) ? ["tempo"] : []));
        setSalvo(null);
        setFase("revisar");
      };
      rec.current = r;
      r.start(1000);
      inicio.current = Date.now();
      setTempo(0);
      setGravando(true);
      relogio.current = window.setInterval(() => {
        const s = (Date.now() - inicio.current) / 1000;
        setTempo(s);
        if (s >= meta + 30) parar();
      }, 200);
    }, 1000);
  };

  const marcos = marcosVideo(meta);
  const blocoAtual = Math.max(0, marcos.findIndex((m) => tempo < m.fim) === -1 ? marcos.length - 1 : marcos.findIndex((m) => tempo < m.fim));
  const nota = Math.round((marcados.size / CHECKLIST_VIDEO.length) * 100);

  const salvar = () => {
    if (!video) return;
    setErro("");
    start(async () => {
      const r = await salvarVideoTreino({ duracao: video.duracao, meta, checklist: [...marcados] });
      if (r.erro) { setErro(r.erro); return; }
      setSalvo(r.nota ?? nota);
      router.refresh();
    });
  };

  /* ---------------------------------------------------------------- 1. roteiro */
  if (fase === "roteiro") {
    const preenchidos = BLOCOS_VIDEO.filter((b) => (topicos[b.id] ?? "").trim()).length;
    return (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 md:p-8">
          <h2 className="font-display text-2xl font-extrabold">1. Monte o seu roteiro</h2>
          <p className="text-[16px] leading-relaxed text-ink-2">
            Escreva <strong>tópicos</strong>, e não um texto para decorar. Eles aparecem na tela durante a gravação, um bloco de cada vez.
            {companhia && <> Pense na <strong>{companhia}</strong> ao responder &quot;Por que esta companhia&quot;.</>}
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 font-semibold">Tempo pedido pela seleção</legend>
            <div className="flex flex-wrap gap-2">
              {METAS_VIDEO.map((m) => (
                <label key={m.seg} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-semibold ${meta === m.seg ? "border-brand-strong bg-brand-soft text-brand-deep" : "border-line text-navy hover:border-navy"}`}>
                  <input type="radio" name="meta" className="sr-only" checked={meta === m.seg} onChange={() => setMeta(m.seg)} />
                  {m.rotulo}
                </label>
              ))}
            </div>
            <span className="text-sm text-muted">Na dúvida, treine com 1 min e 30. Se o edital pedir outro tempo, siga o edital.</span>
          </fieldset>
        </section>

        <ol className="flex flex-col gap-4">
          {BLOCOS_VIDEO.map((b, k) => (
            <li key={b.id} className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label htmlFor={`b-${b.id}`} className="font-display text-lg font-extrabold">{k + 1}. {b.titulo}</label>
                <span className="text-sm text-muted">cerca de {Math.round(b.peso * meta)} s</span>
              </div>
              <p className="text-[15px] text-ink-2">{b.pergunta}</p>
              <textarea id={`b-${b.id}`} rows={2} maxLength={400} value={topicos[b.id] ?? ""} onChange={(e) => setTopicos((t) => ({ ...t, [b.id]: e.target.value }))}
                placeholder={`Ex.: ${b.exemplo}`}
                className="min-h-20 rounded-xl border border-line bg-soft px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-navy focus:bg-white" />
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-navy p-5 text-white">
          <span className="text-[15px]">{preenchidos} de {BLOCOS_VIDEO.length} blocos com tópicos · o roteiro fica salvo neste aparelho</span>
          <button type="button" className={btnPrim} onClick={() => setFase("gravar")}>Ir para a gravação</button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- 2. gravar */
  if (fase === "gravar") {
    const b = BLOCOS_VIDEO[blocoAtual];
    const passou = tempo > meta;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">2. Grave</h2>
          <button type="button" className={btnSec} disabled={gravando || contagem > 0} onClick={() => setFase("roteiro")}>← Voltar ao roteiro</button>
        </div>

        <div className="relative overflow-hidden rounded-[24px] bg-navy" style={{ aspectRatio: "16 / 9" }}>
          <video ref={preview} muted playsInline aria-label="Pré-visualização da câmera" className="h-full w-full -scale-x-100 object-cover" />
          {!camPronta && !erroCam && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">Abrindo a câmera… Se o navegador perguntar, permita câmera e microfone.</p>}
          {contagem > 0 && <span aria-live="assertive" className="absolute inset-0 flex items-center justify-center bg-black/40 font-display text-[96px] font-extrabold text-white">{contagem}</span>}
          {camPronta && !gravando && contagem === 0 && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[30%] top-[12%] bottom-[8%] rounded-[50%] border-2 border-dashed border-white/50" />
          )}
          {gravando && (
            <>
              <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 font-semibold text-white">
                <span className="h-3 w-3 animate-pulse rounded-full bg-[#ff3b5c]" aria-hidden="true" /> REC {mmss(tempo)}
              </span>
              <span className={`absolute top-4 right-4 rounded-full px-3 py-1.5 font-semibold ${passou ? "bg-brand-strong text-white" : "bg-black/60 text-white"}`}>
                {passou ? `+${mmss(tempo - meta)} acima do tempo` : `faltam ${mmss(meta - tempo)}`}
              </span>
              <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1 rounded-2xl bg-black/65 p-4 text-white">
                <span className="text-xs font-bold tracking-[.08em] text-[#ffc2cf] uppercase">{blocoAtual + 1}/{BLOCOS_VIDEO.length} · {b.titulo}</span>
                <span className="text-[17px] leading-snug">{(topicos[b.id] ?? "").trim() || b.pergunta}</span>
              </div>
            </>
          )}
        </div>

        {gravando && (
          <div className="flex h-3 gap-1" aria-hidden="true">
            {marcos.map((m, k) => (
              <div key={m.id} className="h-3 rounded-full bg-[#dfe2ea]" style={{ flex: m.fim - m.ini }}>
                <div className={`h-3 rounded-full ${k === blocoAtual ? "bg-brand" : "bg-navy"}`} style={{ width: `${Math.max(0, Math.min(1, (tempo - m.ini) / Math.max(1, m.fim - m.ini))) * 100}%` }} />
              </div>
            ))}
          </div>
        )}

        {erroCam && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-5 text-brand-deep">
            <p>{erroCam}</p>
            <div><button type="button" className={btnSec} onClick={ligarCamera}>Tentar de novo</button></div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {!gravando ? (
            <button type="button" className={btnPrim} disabled={!camPronta || contagem > 0} onClick={gravar}>● Começar a gravar</button>
          ) : (
            <button type="button" className={btnPrim} onClick={parar}>■ Parar e revisar</button>
          )}
          <span className="text-[15px] text-ink-2">
            {gravando ? "Olhe para a lente da câmera. Os tópicos mudam sozinhos no tempo certo." : "Encaixe o rosto na moldura, olhe para a lente e respire. Há uma contagem de 3 segundos."}
          </span>
        </div>
        <p className="rounded-xl bg-soft px-4 py-3 text-[14px] text-ink-2">
          🔒 O vídeo fica só no seu aparelho. Nada é enviado para a Cabin Crew: guardamos apenas a sua autoavaliação e o tempo da gravação.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- 3. revisar */
  const d = video?.duracao ?? 0;
  const noTempo = dentroDoTempo(d, meta);
  const grupos = [...new Set(CHECKLIST_VIDEO.map((c) => c.grupo))];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold">3. Assista e avalie</h2>
        <button type="button" className={btnSec} onClick={() => setFase("gravar")}>Gravar de novo</button>
      </div>
      {video && (
        <div className="flex flex-col gap-3">
          <video src={video.url} controls playsInline className="w-full rounded-[24px] bg-navy" style={{ aspectRatio: "16 / 9" }} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full px-4 py-1.5 font-semibold ${noTempo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>
              Duração {mmss(d)} · meta {mmss(meta)} {noTempo ? "✓" : d < meta * 0.75 ? "· curto demais" : "· passou do tempo"}
            </span>
            <a href={video.url} download={`video-apresentacao-${new Date().toISOString().slice(0, 10)}.${video.ext}`} className="font-semibold text-brand-strong underline underline-offset-4">Baixar o vídeo</a>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-6 md:p-8">
        <p className="text-[16px] leading-relaxed text-ink-2">Assista ao vídeo inteiro, de preferência duas vezes: uma com som e outra sem som (para ver só a postura e a expressão). Marque o que você <strong>realmente</strong> fez.</p>
        {grupos.map((g) => (
          <fieldset key={g} className="flex flex-col gap-2">
            <legend className="pb-1 font-display text-lg font-extrabold">{g}</legend>
            {CHECKLIST_VIDEO.filter((c) => c.grupo === g).map((c) => (
              <label key={c.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-[16px] hover:bg-soft">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-[#c8102e]" checked={marcados.has(c.id)} disabled={c.id === "tempo"}
                  onChange={(e) => setMarcados((s) => { const n = new Set(s); if (e.target.checked) n.add(c.id); else n.delete(c.id); return n; })} />
                <span>{c.texto}{c.id === "tempo" && <span className="block text-sm text-muted">Marcado automaticamente pela duração da gravação.</span>}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <strong className="font-display text-xl">Nota da autoavaliação: {nota}%</strong>
          <button type="button" className={btnPrim} disabled={pend || salvo !== null} onClick={salvar}>{pend ? "Salvando…" : salvo !== null ? "Salvo ✓" : "Salvar autoavaliação"}</button>
        </div>
        {salvo !== null && (
          <p role="status" className={`rounded-xl px-4 py-3 ${salvo >= NOTA_VIDEO ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`}>
            {salvo >= NOTA_VIDEO
              ? "Muito bom! Para fechar essa tarefa da jornada, faça pelo menos 2 gravações, com a última acima de 80%."
              : "Veja os itens que ficaram sem marcar, ajuste o roteiro ou a postura e grave de novo. Normalmente a 3ª gravação já sai bem mais natural."}
          </p>
        )}
        {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">{erro}</p>}
      </section>
    </div>
  );
}
