"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { excluirMidia, excluirMidias, moverMidias, renomearMidia, salvarMidia } from "@/app/crew-actions";
import { FORMATOS, extensao, tamanhoLegivel, urlMidia, type TipoMidia } from "@/lib/midia-comum";

export type Midia = {
  id: string; tipo: TipoMidia; arquivo: string; miniatura: string | null; nome: string; titulo: string | null;
  descricao: string | null; pasta: string | null; mime: string; tamanho: number; largura: number | null; altura: number | null; created_at: string;
};

type Envio = { id: string; nome: string; progresso: number; erro?: string; pronto?: boolean };

const ABAS: { k: "todos" | TipoMidia; rotulo: string; icone: string }[] = [
  { k: "todos", rotulo: "Tudo", icone: "▦" },
  { k: "imagem", rotulo: "Fotos", icone: "🖼" },
  { k: "video", rotulo: "Vídeos", icone: "🎬" },
  { k: "audio", rotulo: "Áudios", icone: "🎧" },
];

/** Envia um arquivo com barra de progresso (XHR mostra o progresso do upload; fetch não). */
function enviar(f: File, pasta: string, onProgresso: (p: number) => void): Promise<Midia> {
  return new Promise((ok, falha) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/admin/midia/enviar");
    x.setRequestHeader("x-nome", encodeURIComponent(f.name));
    if (pasta) x.setRequestHeader("x-pasta", encodeURIComponent(pasta));
    x.setRequestHeader("content-type", f.type || "application/octet-stream");
    x.upload.onprogress = (e) => e.lengthComputable && onProgresso(Math.round((e.loaded / e.total) * 100));
    x.onload = () => {
      let r: { midia?: Midia; erro?: string } = {};
      try { r = JSON.parse(x.responseText); } catch { /* resposta não-JSON */ }
      if (x.status === 413 && !r.erro) r.erro = "Arquivo grande demais para o servidor aceitar.";
      if (x.status >= 200 && x.status < 300 && r.midia) ok(r.midia);
      else falha(new Error(r.erro || "Não foi possível enviar."));
    };
    x.onerror = () => falha(new Error("A conexão caiu durante o envio."));
    x.send(f);
  });
}

export default function BibliotecaMidia({ inicial }: { inicial: Midia[] }) {
  const [itens, setItens] = useState(inicial);
  const [aba, setAba] = useState<(typeof ABAS)[number]["k"]>("todos");
  const [busca, setBusca] = useState("");
  const [pastaFiltro, setPastaFiltro] = useState("");
  const [pastaEnvio, setPastaEnvio] = useState("");
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [aberta, setAberta] = useState<Midia | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [selecao, setSelecao] = useState<Set<string>>(new Set());
  const [modoSelecao, setModoSelecao] = useState(false);
  const [destino, setDestino] = useState("");
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const pastas = useMemo(() => [...new Set(itens.map((m) => m.pasta).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt-BR")), [itens]);
  const visiveis = itens.filter((m) =>
    (aba === "todos" || m.tipo === aba) &&
    (!pastaFiltro || m.pasta === pastaFiltro) &&
    (!busca || `${m.titulo} ${m.nome} ${m.descricao} ${m.pasta}`.toLowerCase().includes(busca.toLowerCase())),
  );
  const total = itens.reduce((s, m) => s + Number(m.tamanho), 0);
  const conta = (t: TipoMidia) => itens.filter((m) => m.tipo === t).length;

  async function receber(lista: FileList | File[]) {
    const arquivos = [...lista];
    const fila: Envio[] = arquivos.map((f) => ({ id: `${f.name}-${f.size}-${Math.random()}`, nome: f.name, progresso: 0 }));
    setEnvios((e) => [...fila, ...e]);
    for (let i = 0; i < arquivos.length; i++) {
      const f = arquivos[i];
      const id = fila[i].id;
      const fmt = FORMATOS[extensao(f.name)];
      if (!fmt) { setEnvios((e) => e.map((x) => (x.id === id ? { ...x, erro: "Formato não aceito." } : x))); continue; }
      if (f.size > fmt.max * 1024 * 1024) { setEnvios((e) => e.map((x) => (x.id === id ? { ...x, erro: `Maior que ${fmt.max} MB.` } : x))); continue; }
      try {
        const m = await enviar(f, pastaEnvio, (p) => setEnvios((e) => e.map((x) => (x.id === id ? { ...x, progresso: p } : x))));
        setItens((it) => [m, ...it]);
        setEnvios((e) => e.map((x) => (x.id === id ? { ...x, progresso: 100, pronto: true } : x)));
      } catch (err) {
        setEnvios((e) => e.map((x) => (x.id === id ? { ...x, erro: (err as Error).message } : x)));
      }
    }
    if (input.current) input.current.value = "";
  }

  const alternar = (id: string) => setSelecao((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const todosVisiveisMarcados = visiveis.length > 0 && visiveis.every((m) => selecao.has(m.id));
  const sairSelecao = () => { setModoSelecao(false); setSelecao(new Set()); };
  const avisar = (t: string) => { setAviso(t); setTimeout(() => setAviso(""), 3000); };

  function excluirSelecionados() {
    const ids = [...selecao];
    if (!ids.length || !window.confirm(`Excluir ${ids.length} ${ids.length === 1 ? "arquivo" : "arquivos"} do servidor? Onde estiverem sendo usados, vão parar de aparecer.`)) return;
    startTransition(async () => {
      const n = await excluirMidias(ids);
      setItens((it) => it.filter((x) => !selecao.has(x.id)));
      sairSelecao();
      avisar(`${n} ${n === 1 ? "arquivo excluído" : "arquivos excluídos"}.`);
    });
  }
  function moverSelecionados() {
    const ids = [...selecao];
    if (!ids.length) return;
    startTransition(async () => {
      await moverMidias(ids, destino);
      setItens((it) => it.map((x) => (selecao.has(x.id) ? { ...x, pasta: destino.trim() || null } : x)));
      sairSelecao();
      avisar(destino.trim() ? `Movidos para a pasta “${destino.trim()}”.` : "Arquivos tirados da pasta.");
      setDestino("");
    });
  }
  function renomear(m: Midia, titulo: string) {
    setRenomeando(null);
    if ((m.titulo ?? "") === titulo.trim()) return;
    setItens((it) => it.map((x) => (x.id === m.id ? { ...x, titulo: titulo.trim() || null } : x)));
    startTransition(() => renomearMidia(m.id, titulo));
  }

  async function copiar(m: Midia) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${urlMidia(m.arquivo)}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch { /* sem permissão de área de transferência */ }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* envio */}
      <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
        <label
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); receber(e.dataTransfer.files); }}
          className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-6 py-6 text-center ${arrastando ? "border-navy bg-soft" : "border-[#c9cedb] hover:border-navy hover:bg-soft"}`}
        >
          <span aria-hidden="true" className="text-3xl">⬆</span>
          <span className="font-semibold text-navy">Arraste fotos, vídeos ou áudios aqui ou clique para escolher</span>
          <span className="text-[13px] text-muted">Fotos até 25 MB (viram WebP otimizado) · vídeos até 500 MB · áudios até 100 MB · vários de uma vez</span>
          <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/*" className="sr-only" onChange={(e) => e.target.files && receber(e.target.files)} />
        </label>
        <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy">
          Guardar na pasta
          <input list="pastas-midia" value={pastaEnvio} onChange={(e) => setPastaEnvio(e.target.value)} placeholder="Ex.: Entrevista, Dinâmicas (opcional)" className="min-h-10 flex-1 rounded-xl border border-[#c9cedb] px-3 text-[14px] font-normal" />
          <datalist id="pastas-midia">{pastas.map((p) => <option key={p} value={p} />)}</datalist>
        </label>
        {envios.length > 0 && (
          <ul className="flex flex-col gap-1.5" aria-live="polite">
            {envios.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-center gap-3 text-[14px]">
                <span className="min-w-0 flex-1 truncate">{e.nome}</span>
                {e.erro ? <span className="font-semibold text-brand-deep">{e.erro}</span>
                  : e.pronto ? <span className="font-semibold text-[#0f6b3a]">✓ enviado</span>
                  : <span className="flex w-40 items-center gap-2"><span className="h-2 flex-1 rounded-full bg-[#eceef3]"><span className="block h-2 rounded-full bg-navy" style={{ width: `${e.progresso}%` }} /></span><span className="w-9 text-right text-muted">{e.progresso}%</span></span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <nav aria-label="Tipo de mídia" className="flex gap-2 overflow-x-auto">
          {ABAS.map((a) => (
            <button key={a.k} type="button" onClick={() => setAba(a.k)} aria-pressed={aba === a.k}
              className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold ${aba === a.k ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"}`}>
              <span aria-hidden="true">{a.icone}</span>{a.rotulo} <span className="opacity-70">{a.k === "todos" ? itens.length : conta(a.k)}</span>
            </button>
          ))}
        </nav>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo nome" aria-label="Buscar pelo nome" className="min-h-11 min-w-0 flex-[1_1_180px] rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]" />
        {pastas.length > 0 && (
          <select value={pastaFiltro} onChange={(e) => setPastaFiltro(e.target.value)} aria-label="Pasta" className="min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
            <option value="">Todas as pastas</option>
            {pastas.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <span className="ml-auto text-[13px] text-muted">{tamanhoLegivel(total)} usados no servidor</span>
      </div>

      {/* seleção em massa */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
        {!modoSelecao ? (
          <>
            <button type="button" onClick={() => setModoSelecao(true)} disabled={!visiveis.length} className="min-h-10 cursor-pointer rounded-full border-2 border-navy px-4 text-sm font-semibold text-navy hover:bg-soft disabled:opacity-40">☑ Selecionar vários</button>
            <span className="text-[13px] text-muted">Para excluir ou mover vários de uma vez. Para renomear, clique no ✎ ao lado do nome.</span>
          </>
        ) : (
          <>
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={todosVisiveisMarcados} onChange={() => setSelecao(todosVisiveisMarcados ? new Set() : new Set(visiveis.map((m) => m.id)))} className="h-5 w-5 accent-brand-strong" />
              Marcar todos ({visiveis.length})
            </label>
            <span className="text-sm text-muted">{selecao.size} {selecao.size === 1 ? "selecionado" : "selecionados"}</span>
            <span className="ml-auto flex flex-wrap items-center gap-2">
              <input list="pastas-midia" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Pasta de destino" aria-label="Pasta de destino" className="min-h-10 w-44 rounded-xl border border-[#c9cedb] px-3 text-[14px]" />
              <button type="button" onClick={moverSelecionados} disabled={!selecao.size} className="min-h-10 cursor-pointer rounded-full bg-navy px-4 text-sm font-semibold text-white disabled:opacity-40">Mover</button>
              <button type="button" onClick={excluirSelecionados} disabled={!selecao.size} className="min-h-10 cursor-pointer rounded-full bg-brand-deep px-4 text-sm font-semibold text-white disabled:opacity-40">Excluir selecionados</button>
              <button type="button" onClick={sairSelecao} className="min-h-10 cursor-pointer rounded-full px-3 text-sm font-semibold text-muted hover:bg-soft">Cancelar</button>
            </span>
          </>
        )}
      </div>
      {aviso && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">{aviso}</p>}

      {/* grade */}
      {visiveis.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visiveis.map((m) => (
            <li key={m.id} className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white hover:border-navy ${selecao.has(m.id) ? "border-brand-strong ring-2 ring-brand-strong" : "border-line"}`}>
              {modoSelecao && (
                <input type="checkbox" checked={selecao.has(m.id)} onChange={() => alternar(m.id)} aria-label={`Selecionar ${m.titulo || m.nome}`}
                  className="absolute top-2 right-2 z-10 h-6 w-6 cursor-pointer accent-brand-strong" />
              )}
              <button type="button" onClick={() => (modoSelecao ? alternar(m.id) : setAberta(m))}
                className="group flex w-full cursor-pointer flex-col text-left">
                <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-soft">
                  {m.tipo === "imagem" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlMidia(m.miniatura ?? m.arquivo)} alt={m.descricao ?? ""} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                  ) : m.tipo === "video" ? (
                    <>
                      <video src={`${urlMidia(m.arquivo)}#t=1`} preload="metadata" muted className="h-full w-full object-cover" />
                      <span aria-hidden="true" className="absolute inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy">▶</span>
                    </>
                  ) : (
                    <span aria-hidden="true" className="text-4xl">🎧</span>
                  )}
                  {m.pasta && <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-navy">{m.pasta}</span>}
                </span>
                <span className="flex flex-col gap-0.5 px-3 pt-2.5 pb-1">
                  <span className="text-[12px] text-muted">{tamanhoLegivel(Number(m.tamanho))}{m.largura ? ` · ${m.largura}×${m.altura}` : ""}</span>
                </span>
              </button>
              <div className="flex items-center gap-1 px-3 pb-2.5">
                {renomeando === m.id ? (
                  <input
                    autoFocus
                    defaultValue={m.titulo || m.nome}
                    aria-label="Novo nome"
                    maxLength={120}
                    onBlur={(e) => renomear(m, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setRenomeando(null); }}
                    className="min-h-9 w-full rounded-lg border border-navy px-2 text-[14px]"
                  />
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-navy" title={m.titulo || m.nome}>{m.titulo || m.nome}</span>
                    <button type="button" onClick={() => setRenomeando(m.id)} aria-label={`Renomear ${m.titulo || m.nome}`} className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-soft hover:text-navy">✎</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
          {itens.length ? "Nada encontrado com esses filtros." : "Nenhum arquivo ainda. Envie o primeiro aqui em cima."}
        </p>
      )}

      {/* detalhe */}
      {aberta && (
        <div role="dialog" aria-modal="true" aria-label={aberta.titulo || aberta.nome} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(35,42,61,.6)] p-4" onClick={(e) => e.target === e.currentTarget && setAberta(null)}>
          <div className="flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-y-auto rounded-[22px] bg-white md:flex-row">
            <div className="flex min-h-56 items-center justify-center bg-[#10131c] md:w-[58%]">
              {aberta.tipo === "imagem" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlMidia(aberta.arquivo)} alt={aberta.descricao ?? ""} className="max-h-[70vh] w-full object-contain" />
              ) : aberta.tipo === "video" ? (
                <video src={urlMidia(aberta.arquivo)} controls className="max-h-[70vh] w-full" />
              ) : (
                <div className="flex w-full flex-col items-center gap-4 p-8 text-white"><span aria-hidden="true" className="text-6xl">🎧</span><audio src={urlMidia(aberta.arquivo)} controls className="w-full" /></div>
              )}
            </div>
            <form
              key={aberta.id}
              action={(fd) => {
                startTransition(async () => {
                  await salvarMidia(fd);
                  const novo = { ...aberta, titulo: String(fd.get("titulo") || "") || null, descricao: String(fd.get("descricao") || "") || null, pasta: String(fd.get("pasta") || "") || null };
                  setItens((it) => it.map((x) => (x.id === aberta.id ? novo : x)));
                  setAberta(null);
                });
              }}
              className="flex flex-1 flex-col gap-3 p-5"
            >
              <input type="hidden" name="id" value={aberta.id} />
              <div className="flex items-start justify-between gap-3">
                <span className="text-[13px] text-muted">{aberta.nome} · {tamanhoLegivel(Number(aberta.tamanho))}{aberta.largura ? ` · ${aberta.largura}×${aberta.altura}` : ""}</span>
                <button type="button" onClick={() => setAberta(null)} aria-label="Fechar" className="-mt-1 -mr-1 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl text-muted hover:bg-soft">×</button>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">Título<input name="titulo" defaultValue={aberta.titulo ?? ""} maxLength={120} className="min-h-11 rounded-xl border border-[#c9cedb] px-3 text-[15px] font-normal" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">Descrição <span className="font-normal text-muted">(texto alternativo / legenda)</span><textarea name="descricao" defaultValue={aberta.descricao ?? ""} rows={3} maxLength={500} className="rounded-xl border border-[#c9cedb] px-3 py-2 text-[15px] font-normal" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">Pasta<input name="pasta" list="pastas-midia" defaultValue={aberta.pasta ?? ""} maxLength={60} className="min-h-11 rounded-xl border border-[#c9cedb] px-3 text-[15px] font-normal" /></label>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-navy">Link</span>
                <div className="flex gap-2">
                  <input readOnly value={urlMidia(aberta.arquivo)} aria-label="Link do arquivo" className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-soft px-3 text-[13px]" onFocus={(e) => e.target.select()} />
                  <button type="button" onClick={() => copiar(aberta)} className="min-h-11 cursor-pointer rounded-xl border-2 border-navy px-3 text-sm font-semibold text-navy hover:bg-soft">{copiado ? "Copiado!" : "Copiar"}</button>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                <button className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-6 font-semibold text-white hover:bg-brand-deep">Salvar</button>
                <a href={urlMidia(aberta.arquivo)} download={aberta.nome} className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold">Baixar</a>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("Excluir este arquivo do servidor? Onde ele estiver sendo usado, vai parar de aparecer.")) return;
                    const fd = new FormData();
                    fd.set("id", aberta.id);
                    startTransition(async () => {
                      await excluirMidia(fd);
                      setItens((it) => it.filter((x) => x.id !== aberta.id));
                      setAberta(null);
                    });
                  }}
                  className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold text-brand-deep hover:bg-brand-soft"
                >
                  Excluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
