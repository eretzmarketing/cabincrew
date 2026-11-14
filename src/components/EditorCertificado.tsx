"use client";

import { useRef, useState, useTransition } from "react";
import { salvarModeloCertificado } from "@/app/certificados-actions";
import CertificadoArte from "@/components/CertificadoArte";
import { CAMPOS_PADRAO, EXEMPLO, FONTES, NOMES_CURSO_CERT, ROTULO_CAMPO, type Campo, type CampoId, type Fonte, type Modelo } from "@/lib/certificados";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-3 py-2 text-[14px] outline-none focus:border-navy";
const rot = "text-[13px] font-semibold";

export default function EditorCertificado({ inicial, site, cargaAuto }: { inicial: Modelo; site: string; cargaAuto?: string | null }) {
  const [m, setM] = useState<Modelo>({ ...inicial, campos: inicial.campos?.length ? inicial.campos : CAMPOS_PADRAO });
  const [ativo, setAtivo] = useState(inicial.ativo !== false);
  const [carga, setCarga] = useState(inicial.carga_horaria ?? "");
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [sel, setSel] = useState<string | null>("nome");
  const [res, setRes] = useState<{ msg?: string; erro?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [pend, iniciar] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);
  const arraste = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const atual = m.campos.find((c) => c.id === sel) ?? null;
  const mudar = (id: string, p: Partial<Campo>) => { setM((x) => ({ ...x, campos: x.campos.map((c) => (c.id === id ? { ...c, ...p } : c)) })); setRes({}); };

  function apertar(id: string, e: React.PointerEvent<HTMLDivElement>) {
    const r = caixa.current!.getBoundingClientRect();
    const c = m.campos.find((x) => x.id === id)!;
    setSel(id);
    arraste.current = { id, dx: ((e.clientX - r.left) / r.width) * 100 - c.x, dy: ((e.clientY - r.top) / r.height) * 100 - c.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function mover(e: React.PointerEvent) {
    const a = arraste.current;
    if (!a) return;
    const r = caixa.current!.getBoundingClientRect();
    const x = Math.round((((e.clientX - r.left) / r.width) * 100 - a.dx) * 10) / 10;
    const y = Math.round((((e.clientY - r.top) / r.height) * 100 - a.dy) * 10) / 10;
    mudar(a.id, { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  async function enviarImagem(f: File) {
    setEnviando(true); setRes({});
    const r = await fetch("/admin/midia/enviar-certificado", { method: "POST", body: f }).then((x) => x.json()).catch(() => ({ erro: "Falha no envio." }));
    setEnviando(false);
    if (r.caminho) setM((x) => ({ ...x, imagem: r.caminho, largura: r.largura, altura: r.altura }));
    else setRes({ erro: r.erro ?? "Falha no envio." });
  }

  function adicionar(tipo: CampoId) {
    const id = tipo === "livre" ? `livre-${m.campos.filter((c) => c.tipo === "livre").length + 1}-${m.campos.length}` : tipo;
    if (m.campos.some((c) => c.id === id)) { mudar(id, { visivel: true }); setSel(id); return; }
    const base = CAMPOS_PADRAO.find((c) => c.tipo === tipo) ?? { ...CAMPOS_PADRAO[1], texto: "Seu texto aqui" };
    setM((x) => ({ ...x, campos: [...x.campos, { ...base, id, tipo, y: 50, visivel: true }] }));
    setSel(id);
  }
  const faltando = (["nome", "curso", "data", "nota", "codigo"] as CampoId[]).filter((t) => !m.campos.some((c) => c.tipo === t));
  const dados = { ...EXEMPLO, curso: NOMES_CURSO_CERT[m.curso] ?? m.curso, carga: carga || cargaAuto || "" };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        <div ref={caixa} onPointerMove={mover} onPointerUp={() => (arraste.current = null)} onPointerCancel={() => (arraste.current = null)}
          onPointerDown={(e) => { if (e.target === e.currentTarget.firstChild || (e.target as HTMLElement).tagName === "IMG") setSel(null); }}
          className="overflow-hidden rounded-xl border border-line shadow-sm">
          <CertificadoArte modelo={m} dados={dados} site={site} selecionado={sel} aoApertar={apertar} />
        </div>
        <p className="text-[13px] text-muted">Arraste os textos para posicionar. Prévia com um aluno de exemplo. Imagem ideal: A4 deitado, 3508 × 2480 px (ou 1754 × 1240).</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy px-5 text-[14px] font-semibold text-navy hover:bg-navy hover:text-white">
            {enviando ? "Enviando…" : m.imagem ? "Trocar imagem de fundo" : "Enviar imagem de fundo"}
            <input type="file" accept="image/*" className="sr-only" disabled={enviando} onChange={(e) => e.target.files?.[0] && enviarImagem(e.target.files[0])} />
          </label>
          {m.imagem && <button type="button" onClick={() => setM((x) => ({ ...x, imagem: null }))} className="min-h-11 cursor-pointer text-[14px] font-semibold text-ink-2 underline underline-offset-4">Remover imagem</button>}
          <span className="flex flex-wrap gap-2">
            {faltando.map((t) => <button key={t} type="button" onClick={() => adicionar(t)} className="min-h-10 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy">+ {ROTULO_CAMPO[t]}</button>)}
            <button type="button" onClick={() => adicionar("livre")} className="min-h-10 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy">+ Texto livre</button>
          </span>
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 xl:sticky xl:top-24 xl:self-start">
        <div className="flex flex-col gap-2 border-b border-line pb-3">
          <label className={`flex flex-col gap-1 ${rot}`}>Carga horária <span className="font-normal text-muted">({cargaAuto ? `em branco = calculada pelas aulas: ${cargaAuto}` : "ex.: 40 horas"} · use {"{carga}"} no certificado)</span>
            <input value={carga} onChange={(e) => setCarga(e.target.value)} maxLength={60} placeholder={cargaAuto ? `${cargaAuto} (automático)` : ""} className={campo} />
          </label>
          <label className={`flex flex-col gap-1 ${rot}`}>Descrição do curso <span className="font-normal text-muted">(aparece na autenticação)</span>
            <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={1000} className={campo} />
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <span className={rot}>Campos</span>
          <div className="flex flex-wrap gap-1.5">
            {m.campos.map((c) => (
              <button key={c.id} type="button" onClick={() => setSel(c.id)}
                className={`min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-semibold ${sel === c.id ? "bg-navy text-white" : "border border-line"} ${c.visivel ? "" : "opacity-50"}`}>
                {ROTULO_CAMPO[c.tipo]}
              </button>
            ))}
          </div>
        </div>
        {atual ? (
          <div className="flex flex-col gap-3">
            <label className={`flex flex-col gap-1 ${rot}`}>Texto <span className="font-normal text-muted">{"{nome} {curso} {data} {nota} {carga} {codigo} {link}"}</span>
              <textarea rows={2} value={atual.texto} onChange={(e) => mudar(atual.id, { texto: e.target.value })} className={campo} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex flex-col gap-1 ${rot}`}>Tamanho
                <input type="range" min={0.5} max={12} step={0.1} value={atual.tamanho} onChange={(e) => mudar(atual.id, { tamanho: Number(e.target.value) })} />
              </label>
              <label className={`flex flex-col gap-1 ${rot}`}>Largura da caixa
                <input type="range" min={10} max={100} step={1} value={atual.largura} onChange={(e) => mudar(atual.id, { largura: Number(e.target.value) })} />
              </label>
            </div>
            <label className={`flex flex-col gap-1 ${rot}`}>Fonte
              <select value={atual.fonte} onChange={(e) => mudar(atual.id, { fonte: e.target.value as Fonte })} className={campo}>
                {Object.entries(FONTES).map(([k, f]) => <option key={k} value={k}>{f.rotulo}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className={`flex items-center gap-2 ${rot}`}>Cor <input type="color" value={atual.cor} onChange={(e) => mudar(atual.id, { cor: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-line" /></label>
              <label className={`flex min-h-9 cursor-pointer items-center gap-2 ${rot}`}><input type="checkbox" checked={atual.negrito} onChange={(e) => mudar(atual.id, { negrito: e.target.checked })} className="h-4 w-4" /> Negrito</label>
            </div>
            <div className="flex flex-col gap-1">
              <span className={rot}>Alinhamento do texto</span>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button key={a} type="button" onClick={() => mudar(atual.id, { alinhamento: a })}
                    className={`min-h-9 flex-1 cursor-pointer rounded-lg text-[13px] font-semibold ${atual.alinhamento === a ? "bg-navy text-white" : "border border-line"}`}>{a === "left" ? "Esquerda" : a === "center" ? "Centro" : "Direita"}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <label className="flex flex-col gap-1 font-semibold">Posição X (%)<input type="number" step={0.1} value={atual.x} onChange={(e) => mudar(atual.id, { x: Number(e.target.value) })} className={campo} /></label>
              <label className="flex flex-col gap-1 font-semibold">Posição Y (%)<input type="number" step={0.1} value={atual.y} onChange={(e) => mudar(atual.id, { y: Number(e.target.value) })} className={campo} /></label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => mudar(atual.id, { x: 50, alinhamento: "center" })} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy">↔ Centralizar na página</button>
              <button type="button" onClick={() => mudar(atual.id, { visivel: !atual.visivel })} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy">{atual.visivel ? "Ocultar" : "Mostrar"}</button>
              {atual.tipo === "livre" && <button type="button" onClick={() => { setM((x) => ({ ...x, campos: x.campos.filter((c) => c.id !== atual.id) })); setSel(null); }} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold text-brand-deep">Remover</button>}
            </div>
          </div>
        ) : <p className="text-[14px] text-ink-2">Clique em um texto no certificado para editar.</p>}

        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px] font-semibold"><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-5 w-5 accent-[#c8102e]" /> Alunos podem emitir</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pend} onClick={() => iniciar(async () => setRes(await salvarModeloCertificado(m.curso, { imagem: m.imagem, largura: m.largura, altura: m.altura, campos: m.campos, ativo, carga_horaria: carga, descricao })))}
              className="min-h-11 flex-1 cursor-pointer rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-50">{pend ? "Salvando…" : "Salvar"}</button>
            <button type="button" onClick={() => { setM((x) => ({ ...x, campos: CAMPOS_PADRAO })); setSel("nome"); }} className="min-h-11 cursor-pointer rounded-full border border-line px-4 text-[13px] font-semibold">Posições padrão</button>
          </div>
          {res.erro && <p role="alert" className="rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand-deep">{res.erro}</p>}
          {res.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-3 py-2 text-[13px] text-[#0f6b3a]">{res.msg}</p>}
        </div>
      </aside>
    </div>
  );
}
