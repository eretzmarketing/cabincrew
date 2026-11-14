"use client";

import { useState } from "react";
import { CRITERIOS_IA, type FeedbackIA } from "@/lib/ia-video-tipos";

const btnPrim = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";

/** Tira algumas fotos da gravação (para a IA ver postura, olhar, sorriso, luz e fundo). */
async function fotosDoVideo(url: string, n = 5): Promise<string[]> {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
  await new Promise<void>((ok, falha) => { v.onloadedmetadata = () => ok(); v.onerror = () => falha(new Error("video")); });
  // vídeos gravados no navegador às vezes não informam a duração: força o cálculo
  if (!Number.isFinite(v.duration)) {
    v.currentTime = 1e9;
    await new Promise<void>((ok) => { v.ontimeupdate = () => { v.ontimeupdate = null; ok(); }; setTimeout(ok, 3000); });
  }
  const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 60;
  const c = document.createElement("canvas");
  const fotos: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = dur * (0.08 + (0.84 * i) / Math.max(1, n - 1));
    await new Promise<void>((ok) => { v.onseeked = () => ok(); v.currentTime = Math.min(t, Math.max(0, dur - 0.2)); setTimeout(ok, 4000); });
    const w = 512, h = Math.round((v.videoHeight / Math.max(1, v.videoWidth)) * 512) || 288;
    c.width = w; c.height = h;
    c.getContext("2d")?.drawImage(v, 0, 0, w, h);
    fotos.push(c.toDataURL("image/jpeg", 0.72));
  }
  v.removeAttribute("src"); v.load();
  return fotos;
}

export function FeedbackVisual({ f, transcricao }: { f: FeedbackIA; transcricao?: string | null }) {
  const grupos = [...new Set(CRITERIOS_IA.map((c) => c.grupo))];
  const ok = f.nota >= 80;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-5">
        <span className={`inline-flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full font-display ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`}>
          <strong className="text-[32px] leading-none font-extrabold">{f.nota}</strong><span className="text-[12px] font-semibold">de 100</span>
        </span>
        <p className="min-w-0 flex-1 text-[16px] leading-relaxed">{f.resumo}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {grupos.filter((g) => CRITERIOS_IA.some((c) => c.grupo === g && f.criterios.some((x) => x.id === c.id))).map((g) => (
          <div key={g} className="flex flex-col gap-3 rounded-2xl bg-soft p-4">
            <strong className="font-display">{g}</strong>
            {CRITERIOS_IA.filter((c) => c.grupo === g).map((c) => {
              const x = f.criterios.find((y) => y.id === c.id);
              if (!x) return null;
              return (
                <div key={c.id} className="flex flex-col gap-1">
                  <span className="flex items-center justify-between gap-2 text-[14px] font-semibold"><span>{c.nome}</span><span>{x.nota}/10</span></span>
                  <span className="h-1.5 rounded-full bg-[#dfe2ea]" aria-hidden="true"><span className={`block h-1.5 rounded-full ${x.nota >= 8 ? "bg-[#1f9d55]" : x.nota >= 5 ? "bg-[#e0a100]" : "bg-brand-strong"}`} style={{ width: `${x.nota * 10}%` }} /></span>
                  <span className="text-[13px] leading-snug text-ink-2">{x.comentario}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl border border-[#bfe5cd] bg-[#f3fbf6] p-4">
          <strong className="font-display text-[#0f6b3a]">👏 Pontos fortes</strong>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">{f.pontos_fortes.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-[#f3c3cf] bg-[#fff6f8] p-4">
          <strong className="font-display text-brand-deep">🎯 Para a próxima gravação</strong>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px]">{f.melhorar.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
      </div>
      {f.abertura_sugerida && (
        <div className="flex flex-col gap-1 rounded-2xl bg-navy p-4 text-white">
          <span className="text-xs font-bold tracking-[.1em] text-[#ffc2cf] uppercase">Sugestão para os primeiros segundos</span>
          <p className="text-[16px] leading-relaxed">“{f.abertura_sugerida}”</p>
        </div>
      )}
      {transcricao && (
        <details className="rounded-2xl border border-line bg-white px-4 py-2">
          <summary className="min-h-10 cursor-pointer py-2 text-[14px] font-semibold">O que a IA entendeu da sua fala</summary>
          <p className="pb-2 text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{transcricao}</p>
        </details>
      )}
    </div>
  );
}

export default function VideoIA({ video, meta, topicos, companhia, onAnalisado }: {
  video: { url: string; blob: Blob; ext: string; duracao: number }; meta: number; topicos: Record<string, string>; companhia?: string; onAnalisado: () => void;
}) {
  const [aceito, setAceito] = useState(false);
  const [etapa, setEtapa] = useState<"" | "fotos" | "enviando" | "analisando">("");
  const [pct, setPct] = useState(0);
  const [erro, setErro] = useState("");
  const [res, setRes] = useState<{ feedback: FeedbackIA; transcricao: string; restantes: number | null } | null>(null);

  async function analisar() {
    setErro(""); setEtapa("fotos");
    let fotos: string[] = [];
    // se o navegador não conseguir tirar as fotos em 12 s, segue só com a fala
    try { fotos = await Promise.race([fotosDoVideo(video.url), new Promise<string[]>((ok) => setTimeout(() => ok([]), 12000))]); } catch { fotos = []; }
    const fd = new FormData();
    fd.set("video", video.blob, `video.${video.ext}`);
    fd.set("duracao", String(video.duracao));
    fd.set("meta", String(meta));
    fd.set("roteiro", JSON.stringify(topicos));
    if (companhia) fd.set("companhia", companhia);
    for (const f of fotos) fd.append("foto", f);
    setEtapa("enviando"); setPct(0);
    const x = new XMLHttpRequest();
    x.open("POST", "/api/video-ia");
    x.upload.onprogress = (e) => { if (e.lengthComputable) { setPct(Math.round((e.loaded / e.total) * 100)); if (e.loaded >= e.total) setEtapa("analisando"); } };
    x.onload = () => {
      let r: { feedback?: FeedbackIA; transcricao?: string; restantes?: number | null; erro?: string } = {};
      try { r = JSON.parse(x.responseText); } catch { /* resposta não-JSON */ }
      setEtapa("");
      if (r.feedback) { setRes({ feedback: r.feedback, transcricao: r.transcricao ?? "", restantes: r.restantes ?? null }); onAnalisado(); }
      else setErro(r.erro || (x.status === 413 ? "O vídeo ficou grande demais para enviar." : "Não foi possível analisar agora. Tente de novo."));
    };
    x.onerror = () => { setEtapa(""); setErro("A conexão caiu durante o envio. Tente de novo."); };
    x.send(fd);
  }

  if (res) return (
    <section aria-labelledby="ia-titulo" className="flex flex-col gap-4 rounded-[24px] border-2 border-navy bg-white p-6 md:p-8">
      <h3 id="ia-titulo" className="font-display text-2xl font-extrabold">🤖 Feedback da IA</h3>
      <FeedbackVisual f={res.feedback} transcricao={res.transcricao} />
      <p className="text-[14px] text-muted">Esta gravação foi salva com a nota da IA no seu histórico.{res.restantes !== null ? ` Você ainda pode pedir ${res.restantes} análise(s) hoje.` : ""}</p>
    </section>
  );

  const ocupado = etapa !== "";
  return (
    <section aria-labelledby="ia-titulo" className="flex flex-col gap-4 rounded-[24px] border-2 border-navy bg-white p-6 md:p-8">
      <h3 id="ia-titulo" className="font-display text-2xl font-extrabold">🤖 Feedback da IA</h3>
      <p className="text-[16px] leading-relaxed text-ink-2">A IA assiste à sua gravação como um recrutador: ouve o que você fala e olha a sua postura, o olhar, o sorriso, a luz e o fundo. Em cerca de 1 minuto você recebe nota, pontos fortes e o que melhorar.</p>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px]">
        <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} disabled={ocupado} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c8102e]" />
        <span>Autorizo enviar esta gravação para análise pela IA (OpenAI). O vídeo é usado só para gerar o feedback e é descartado em seguida: a Cabin Crew guarda apenas a nota, o feedback e o texto da fala.</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnPrim} disabled={!aceito || ocupado} onClick={analisar}>
          {etapa === "fotos" ? "Preparando…" : etapa === "enviando" ? `Enviando… ${pct}%` : etapa === "analisando" ? "A IA está analisando…" : "Analisar com IA"}
        </button>
        {etapa === "analisando" && <span role="status" className="text-[15px] text-ink-2">Pode levar até 1 minuto. Não feche esta página.</span>}
      </div>
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">{erro}</p>}
    </section>
  );
}
