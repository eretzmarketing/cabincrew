"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { enviarAvatar } from "@/app/actions";

const LADO = 280; // tamanho do recorte na tela
const SAIDA = 512; // tamanho da foto salva

type Pos = { x: number; y: number };

/** Envio da foto de perfil com recorte quadrado (arrastar + zoom), salva em WebP 512×512. */
export default function AvatarForm({ atual, iniciais, obrigatoria }: { atual: string | null; iniciais: string; obrigatoria: boolean }) {
  const [state, action, enviando] = useActionState(enviarAvatar, undefined);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [erro, setErro] = useState("");
  const [salva, setSalva] = useState<string | null>(atual);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arraste = useRef<{ inicio: Pos; pos: Pos } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // escala base: a imagem cobre o quadrado inteiro
  const base = img ? Math.max(LADO / img.width, LADO / img.height) : 1;
  const escala = base * zoom;

  const limitar = (p: Pos, z = zoom): Pos => {
    if (!img) return p;
    const s = base * z;
    const mx = Math.max(0, (img.width * s - LADO) / 2);
    const my = Math.max(0, (img.height * s - LADO) / 2);
    return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
  };

  // desenha a prévia
  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = LADO * dpr;
    c.height = LADO * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, LADO, LADO);
    const w = img.width * escala;
    const h = img.height * escala;
    ctx.drawImage(img, (LADO - w) / 2 + pos.x, (LADO - h) / 2 + pos.y, w, h);
  }, [img, escala, pos]);

  function escolher(f: File) {
    setErro("");
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && !/\.(jpe?g|png|webp|heic)$/i.test(f.name)) return setErro("Use uma foto em JPG, PNG ou WebP.");
    if (f.size > 15 * 1024 * 1024) return setErro("Foto muito grande (máximo 15 MB).");
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => {
      if (i.width < 200 || i.height < 200) { setErro("A foto é muito pequena. Use uma com pelo menos 200×200 pixels."); return; }
      setImg(i);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    i.onerror = () => setErro("Não conseguimos abrir essa foto. Tente outra (JPG ou PNG).");
    i.src = url;
  }

  function salvar() {
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = SAIDA;
    out.height = SAIDA;
    const ctx = out.getContext("2d")!;
    const k = SAIDA / LADO;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, SAIDA, SAIDA);
    const w = img.width * escala * k;
    const h = img.height * escala * k;
    ctx.drawImage(img, (SAIDA - w) / 2 + pos.x * k, (SAIDA - h) / 2 + pos.y * k, w, h);
    setSalva(out.toDataURL("image/webp", 0.86));
    out.toBlob((b) => {
      if (!b || b.type !== "image/webp") return setErro("Seu navegador não conseguiu preparar a foto. Atualize o navegador e tente de novo.");
      const fd = new FormData();
      fd.append("foto", new File([b], "avatar.webp", { type: "image/webp" }));
      startTransition(() => action(fd));
      setImg(null);
      if (input.current) input.current.value = "";
    }, "image/webp", 0.86);
  }

  const temFoto = !!salva && !(state?.erro && salva !== atual);

  return (
    <div className="flex flex-col gap-5">
      {obrigatoria && !state?.ok && (
        <p role="alert" className="rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">
          <strong>Falta só a sua foto.</strong> Para acessar o Head Hunter e os simulados, adicione uma foto de perfil.
        </p>
      )}

      {!img ? (
        <div className="flex flex-wrap items-center gap-5">
          {temFoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={salva!} alt="Sua foto de perfil" width={112} height={112} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_0_0_2px_#e3e6ee]" />
          ) : (
            <span aria-hidden="true" className="inline-flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-[#c9cedb] bg-soft font-display text-3xl font-bold text-muted uppercase">{iniciais}</span>
          )}
          <div className="flex flex-col gap-2">
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-navy px-6 font-semibold text-white hover:bg-navy-deep focus-within:outline-3 focus-within:outline-brand">
              {temFoto ? "Trocar foto" : "Adicionar foto"}
              <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) escolher(f); }} />
            </label>
            {enviando && <span role="status" className="text-[14px] font-semibold text-navy">Salvando sua foto…</span>}
            <span className="max-w-[300px] text-[13px] leading-snug text-muted">Foto do rosto, de frente e bem iluminada, como numa foto profissional.</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <div
            className="relative touch-none overflow-hidden rounded-2xl bg-soft select-none"
            style={{ width: LADO, height: LADO, cursor: "grab" }}
            onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); arraste.current = { inicio: { x: e.clientX, y: e.clientY }, pos }; }}
            onPointerMove={(e) => { const a = arraste.current; if (a) setPos(limitar({ x: a.pos.x + e.clientX - a.inicio.x, y: a.pos.y + e.clientY - a.inicio.y })); }}
            onPointerUp={() => { arraste.current = null; }}
            onPointerCancel={() => { arraste.current = null; }}
          >
            <canvas ref={canvas} style={{ width: LADO, height: LADO }} aria-label="Prévia do recorte da foto. Arraste para posicionar." role="img" />
            {/* círculo: mostra como a foto vai aparecer */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 9999px rgba(35,42,61,.5)" }} />
          </div>
          <label className="flex w-full max-w-[280px] flex-col gap-1 text-sm font-semibold text-navy">
            Zoom
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => { const z = Number(e.target.value); setZoom(z); setPos((p) => limitar(p, z)); }} className="accent-brand-strong" />
          </label>
          <p className="text-[13px] text-muted">Arraste a foto para centralizar o rosto no círculo.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={salvar} disabled={enviando} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
              {enviando ? "Salvando…" : "Salvar foto"}
            </button>
            <button type="button" onClick={() => { setImg(null); if (input.current) input.current.value = ""; }} disabled={enviando} className="min-h-12 cursor-pointer rounded-full border-2 border-line px-5 font-semibold text-navy hover:border-navy">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(erro || state?.erro) && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{erro || state?.erro}</p>}
      {state?.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Foto salva! Ela aparece no seu perfil.</p>}
    </div>
  );
}
