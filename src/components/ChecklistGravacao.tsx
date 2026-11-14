"use client";

import { useEffect, useRef, useState } from "react";

const ITENS = [
  { id: "luz", icone: "💡", texto: "Luz no rosto, de frente (janela ou luminária à sua frente, nunca atrás)" },
  { id: "fundo", icone: "🖼", texto: "Fundo neutro e organizado, sem barulho por perto" },
  { id: "roupa", icone: "👔", texto: "Roupa, cabelo e maquiagem como no dia da seleção" },
  { id: "olhar", icone: "👁", texto: "Câmera na altura dos olhos; você vai olhar para a lente" },
] as const;

/**
 * Checklist antes de gravar + teste de microfone (barra de volume ao vivo e gravação de 3 s para ouvir).
 * Usa o mesmo fluxo da câmera já aberta. Avisa quem está com o som baixo antes de gastar uma gravação.
 */
export default function ChecklistGravacao({ stream }: { stream: MediaStream | null }) {
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [nivel, setNivel] = useState(0);
  const [teste, setTeste] = useState<"" | "gravando" | "ok" | "baixo">("");
  const [audio, setAudio] = useState<string | null>(null);
  const pico = useRef(0);

  // barra de volume ao vivo
  useEffect(() => {
    if (!stream || !stream.getAudioTracks().length) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const fonte = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    fonte.connect(an);
    const dados = new Uint8Array(an.fftSize);
    let id = 0;
    const medir = () => {
      an.getByteTimeDomainData(dados);
      let soma = 0;
      for (const v of dados) soma += ((v - 128) / 128) ** 2;
      const rms = Math.sqrt(soma / dados.length);
      const n = Math.min(1, rms * 4);
      pico.current = Math.max(pico.current, n);
      setNivel(n);
      id = requestAnimationFrame(medir);
    };
    medir();
    return () => { cancelAnimationFrame(id); fonte.disconnect(); ctx.close().catch(() => {}); };
  }, [stream]);

  useEffect(() => () => { if (audio) URL.revokeObjectURL(audio); }, [audio]);

  function testar() {
    if (!stream) return;
    const faixas = new MediaStream(stream.getAudioTracks());
    let r: MediaRecorder;
    try { r = new MediaRecorder(faixas); } catch { return; }
    const partes: Blob[] = [];
    pico.current = 0;
    setTeste("gravando");
    setAudio(null);
    r.ondataavailable = (e) => { if (e.data.size) partes.push(e.data); };
    r.onstop = () => {
      setAudio(URL.createObjectURL(new Blob(partes, { type: r.mimeType || "audio/webm" })));
      const ok = pico.current > 0.25;
      setTeste(ok ? "ok" : "baixo");
      if (ok) setMarcados((s) => new Set(s).add("audio"));
    };
    r.start();
    setTimeout(() => r.state !== "inactive" && r.stop(), 3000);
  }

  const alterna = (id: string) => setMarcados((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const total = ITENS.length + 1;

  return (
    <section aria-labelledby="pre-titulo" className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="pre-titulo" className="font-display text-lg font-extrabold">Antes de gravar</h3>
        <span className="text-[14px] text-muted">{marcados.size} de {total} prontos</span>
      </div>
      <ul className="flex flex-col gap-1">
        {ITENS.map((i) => (
          <li key={i.id}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-[15px] hover:bg-soft">
              <input type="checkbox" checked={marcados.has(i.id)} onChange={() => alterna(i.id)} className="h-5 w-5 shrink-0 accent-[#c8102e]" />
              <span aria-hidden="true">{i.icone}</span>{i.texto}
            </label>
          </li>
        ))}
        <li className={`flex flex-wrap items-center gap-3 rounded-xl px-2 py-2 ${teste === "baixo" ? "bg-[#fff8e6]" : teste === "ok" ? "bg-[#f3fbf6]" : "bg-soft"}`}>
          <input type="checkbox" checked={marcados.has("audio")} onChange={() => alterna("audio")} aria-label="Áudio claro e sem ruídos" className="h-5 w-5 shrink-0 accent-[#c8102e]" />
          <span aria-hidden="true">🎤</span>
          <span className="min-w-[160px] flex-1 text-[15px]">Áudio claro e sem ruídos</span>
          <span className="flex h-2.5 w-28 overflow-hidden rounded-full bg-[#dfe2ea]" role="meter" aria-label="Volume do microfone" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(nivel * 100)}>
            <span className={`h-2.5 rounded-full transition-[width] duration-75 ${nivel > 0.25 ? "bg-[#1f9d55]" : "bg-[#e0a100]"}`} style={{ width: `${Math.round(nivel * 100)}%` }} />
          </span>
          <button type="button" onClick={testar} disabled={!stream || teste === "gravando"}
            className="inline-flex min-h-10 cursor-pointer items-center rounded-full border-2 border-navy bg-white px-4 text-[14px] font-semibold text-navy hover:bg-navy hover:text-white disabled:opacity-50">
            {teste === "gravando" ? "Fale agora… (3 s)" : "Testar microfone"}
          </button>
        </li>
      </ul>
      {teste === "ok" && <p role="status" className="text-[14px] text-[#0f6b3a]">✓ Microfone funcionando. Ouça como ficou: {audio && <audio src={audio} controls className="mt-1 h-10 w-full max-w-[360px] align-middle" />}</p>}
      {teste === "baixo" && (
        <p role="alert" className="text-[14px] text-[#7a5a00]">O som ficou baixo. Fale mais perto do aparelho, confira se o microfone certo está selecionado no navegador e afaste-se de barulho. {audio && <audio src={audio} controls className="mt-1 h-10 w-full max-w-[360px] align-middle" />}</p>
      )}
      {!teste && <p className="text-[14px] text-muted">Teste o microfone antes de gravar: fale uma frase e veja se a barra fica verde.</p>}
    </section>
  );
}
