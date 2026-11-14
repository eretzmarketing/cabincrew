"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listarMidias, type MidiaEscolha } from "@/app/cursos-actions";
import { tamanhoLegivel, urlMidia } from "@/lib/midia-comum";

type Tipo = "imagem" | "video" | "audio" | "documento";
const NOMES: Record<Tipo, { um: string; varios: string; aceita: string; icone: string }> = {
  imagem: { um: "foto", varios: "fotos", aceita: "image/jpeg,image/png,image/webp,image/gif", icone: "🖼" },
  video: { um: "vídeo", varios: "vídeos", aceita: "video/mp4,video/webm,video/quicktime", icone: "🎬" },
  audio: { um: "áudio", varios: "áudios", aceita: "audio/*", icone: "🎧" },
  documento: { um: "PDF", varios: "PDFs", aceita: "application/pdf,.pdf", icone: "📄" },
};

/** Janela para escolher um arquivo da galeria de Mídia (ou enviar um novo, que já entra na galeria). */
export function SeletorMidia({ tipo, aberto, onFechar, onEscolher }: { tipo: Tipo; aberto: boolean; onFechar: () => void; onEscolher: (url: string, m: MidiaEscolha) => void }) {
  const [itens, setItens] = useState<MidiaEscolha[] | null>(null);
  const [busca, setBusca] = useState("");
  const [pasta, setPasta] = useState("");
  const [envio, setEnvio] = useState<{ pct?: number; erro?: string }>({});
  const arquivo = useRef<HTMLInputElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const n = NOMES[tipo];

  useEffect(() => {
    if (!aberto) return;
    let vivo = true;
    listarMidias(tipo).then((l) => vivo && setItens(l)).catch(() => vivo && setItens([]));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    caixa.current?.focus();
    return () => { vivo = false; window.removeEventListener("keydown", esc); };
  }, [aberto, tipo, onFechar]);

  const pastas = useMemo(() => [...new Set((itens ?? []).map((m) => m.pasta).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt-BR")), [itens]);
  const visiveis = (itens ?? []).filter((m) => (!pasta || m.pasta === pasta) && (!busca || `${m.titulo} ${m.nome} ${m.pasta}`.toLowerCase().includes(busca.toLowerCase())));

  function enviar(f: File) {
    setEnvio({ pct: 0 });
    const x = new XMLHttpRequest();
    x.open("POST", "/admin/midia/enviar");
    x.setRequestHeader("x-nome", encodeURIComponent(f.name));
    x.setRequestHeader("x-pasta", encodeURIComponent("Aulas"));
    x.setRequestHeader("content-type", f.type || "application/octet-stream");
    x.upload.onprogress = (e) => e.lengthComputable && setEnvio({ pct: Math.round((e.loaded / e.total) * 100) });
    x.onload = () => {
      let r: { midia?: MidiaEscolha; erro?: string } = {};
      try { r = JSON.parse(x.responseText); } catch { /* resposta não-JSON */ }
      if (r.midia && r.midia.tipo === tipo) { setEnvio({}); onEscolher(urlMidia(r.midia.arquivo), r.midia); }
      else setEnvio({ erro: r.midia ? `Esse arquivo não é ${tipo === "documento" ? "um PDF" : `um ${n.um}`}. Ele ficou na galeria.` : r.erro || "Não foi possível enviar." });
    };
    x.onerror = () => setEnvio({ erro: "A conexão caiu durante o envio." });
    x.send(f);
  }

  if (!aberto) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`Escolher ${n.um} da galeria`} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(35,42,61,.6)] p-3 md:p-6" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div ref={caixa} tabIndex={-1} className="flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[22px] bg-white outline-none">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="flex-1 font-display text-xl font-extrabold">Escolher {n.um} da galeria</h2>
          <input ref={arquivo} type="file" accept={n.aceita} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); e.target.value = ""; }} />
          <button type="button" onClick={() => arquivo.current?.click()} disabled={envio.pct !== undefined}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-sm font-bold text-white hover:bg-brand-deep disabled:opacity-60">
            {envio.pct !== undefined ? `Enviando… ${envio.pct}%` : `⬆ Enviar ${n.um} novo`}
          </button>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-muted hover:bg-soft">×</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo nome" aria-label="Buscar pelo nome" className="min-h-11 min-w-0 flex-[1_1_200px] rounded-xl border border-[#c9cedb] px-3 text-[15px]" />
          {pastas.length > 0 && (
            <select value={pasta} onChange={(e) => setPasta(e.target.value)} aria-label="Pasta" className="min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
              <option value="">Todas as pastas</option>
              {pastas.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {envio.erro && <p role="alert" className="w-full text-[14px] text-brand-deep">{envio.erro}</p>}
        </div>
        <div className="overflow-y-auto p-5">
          {itens === null ? <p className="py-10 text-center text-muted">Carregando…</p>
            : !visiveis.length ? (
              <p className="rounded-2xl border border-dashed border-[#c9cedb] p-10 text-center text-ink-2">
                {itens.length ? "Nada encontrado com esses filtros." : `Nenhum ${n.um} na galeria ainda. Clique em “Enviar ${n.um} novo”.`}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visiveis.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => onEscolher(urlMidia(m.arquivo), m)} className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-white text-left hover:border-navy hover:ring-2 hover:ring-navy">
                      <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-soft">
                        {tipo === "imagem" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={urlMidia(m.miniatura ?? m.arquivo)} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : tipo === "video" ? (
                          <><video src={`${urlMidia(m.arquivo)}#t=1`} preload="metadata" muted className="h-full w-full object-cover" /><span aria-hidden="true" className="absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy">▶</span></>
                        ) : <span aria-hidden="true" className="text-4xl">{n.icone}</span>}
                        {m.pasta && <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-navy">{m.pasta}</span>}
                      </span>
                      <span className="flex flex-col px-3 py-2">
                        <span className="truncate text-[14px] font-semibold text-navy">{m.titulo || m.nome}</span>
                        <span className="text-[12px] text-muted">{tamanhoLegivel(Number(m.tamanho))} · {new Date(m.created_at).toLocaleDateString("pt-BR")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
}

/** Campo de mídia da aula: link colado à mão ou arquivo escolhido na galeria. */
export function CampoMidia({ name, tipo, inicial, rotulo, dica, placeholder, aceitaLink = true }: {
  name: string; tipo: Tipo; inicial: string; rotulo: string; dica?: string; placeholder?: string; aceitaLink?: boolean;
}) {
  const [valor, setValor] = useState(inicial);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const daGaleria = valor.startsWith("/midia/");
  const fechar = useMemo(() => () => setAberto(false), []);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{rotulo}{dica && <span className="font-normal text-muted"> {dica}</span>}</span>
      <div className="flex flex-wrap gap-2">
        {aceitaLink ? (
          <input name={name} value={valor} onChange={(e) => { setValor(e.target.value); setNome(""); }} placeholder={placeholder} aria-label={rotulo}
            className="min-h-12 min-w-0 flex-[1_1_260px] rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] text-navy placeholder:text-muted" />
        ) : (
          <>
            <input type="hidden" name={name} value={valor} />
            <span className="flex min-h-12 min-w-0 flex-[1_1_260px] items-center truncate rounded-xl border border-line bg-soft px-3.5 text-[15px] text-ink-2">{valor ? nome || valor.split("/").pop() : "Nenhum arquivo escolhido"}</span>
          </>
        )}
        <button type="button" onClick={() => setAberto(true)} className="inline-flex min-h-12 cursor-pointer items-center rounded-full border-2 border-navy bg-white px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
          {NOMES[tipo].icone} Escolher da galeria
        </button>
        {valor && <button type="button" onClick={() => { setValor(""); setNome(""); }} className="inline-flex min-h-12 cursor-pointer items-center rounded-full px-3 text-sm font-semibold text-muted hover:bg-soft">Limpar</button>}
      </div>
      {daGaleria && (tipo === "video" ? <video src={valor} controls preload="metadata" className="max-h-[260px] w-full max-w-[460px] rounded-2xl bg-navy" />
        : tipo === "audio" ? <audio src={valor} controls preload="none" className="w-full max-w-[460px]" />
        : tipo === "documento" ? <a href={valor} target="_blank" rel="noreferrer" className="self-start text-[14px] font-semibold text-navy underline underline-offset-4">Abrir o PDF ↗</a> : null)}
      {daGaleria && nome && <span className="text-[13px] text-muted">Da galeria: {nome}</span>}
      <SeletorMidia tipo={tipo} aberto={aberto} onFechar={fechar} onEscolher={(url, m) => { setValor(url); setNome(m.titulo || m.nome); setAberto(false); }} />
    </div>
  );
}
