"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarParteEntrevista, salvarPerguntaEntrevista } from "@/app/crew-actions";

const input = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] text-navy placeholder:text-muted";
const area = "w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 py-3 text-[15px] leading-relaxed text-navy placeholder:text-muted";
const rotulo = "flex flex-col gap-2 text-sm font-semibold text-navy";
const dicaCampo = "font-normal text-muted";

function Salvar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
      {pending ? "Salvando…" : texto}
    </button>
  );
}

function Aviso({ state }: { state: { erro?: string; msg?: string } | undefined }) {
  if (!state) return null;
  return (
    <p role={state.erro ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${state.erro ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>
      {state.erro ?? state.msg}
    </p>
  );
}

export type ParteEdicao = {
  id?: number; slug?: string; numero: number; titulo: string; titulo_en: string | null; resumo: string | null;
  foto: string | null; foto_alt: string | null; publicado: boolean;
};

/** Edição de uma parte: título, resumo, foto (do banco de fotos) e publicação. */
export function ParteForm({ p, fotos }: { p: ParteEdicao; fotos: { src: string; alt: string }[] }) {
  const [state, action] = useActionState(salvarParteEntrevista, undefined);
  const [foto, setFoto] = useState(p.foto ?? "");
  const [alt, setAlt] = useState(p.foto_alt ?? "");
  return (
    <form action={action} className="flex flex-col gap-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <label className={rotulo}>Título <input name="titulo" required maxLength={120} defaultValue={p.titulo} className={input} /></label>
        <label className={rotulo}>Ordem <input name="numero" type="number" min={1} max={99} defaultValue={p.numero} className={input} /></label>
      </div>
      <label className={rotulo}>Título em inglês <span className={dicaCampo}>(aparece pequeno abaixo do título)</span>
        <input name="titulo_en" maxLength={120} defaultValue={p.titulo_en ?? ""} className={input} />
      </label>
      <label className={rotulo}>Resumo <span className={dicaCampo}>(o que o aluno vai treinar nesta parte)</span>
        <textarea name="resumo" rows={3} maxLength={600} defaultValue={p.resumo ?? ""} className={area} />
      </label>
      {p.id && (
        <label className={rotulo}>Endereço da página <span className={dicaCampo}>(/head-hunter/entrevista-ingles/…)</span>
          <input name="slug" maxLength={60} defaultValue={p.slug} className={input} />
        </label>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-navy">Foto</legend>
        <input type="hidden" name="foto" value={foto} />
        <input type="hidden" name="foto_alt" value={alt} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {fotos.map((f) => (
            <button
              key={f.src}
              type="button"
              onClick={() => { setFoto(f.src); setAlt(f.alt); }}
              aria-pressed={foto === f.src}
              title={f.alt}
              className={`relative aspect-[16/10] cursor-pointer overflow-hidden rounded-lg border-[3px] ${foto === f.src ? "border-brand-strong" : "border-transparent hover:border-[#c9cedb]"}`}
            >
              <Image src={f.src} alt={f.alt} fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
        <label className={rotulo}>Ou cole o endereço de outra foto <span className={dicaCampo}>(https://…)</span>
          <input value={foto} onChange={(e) => setFoto(e.target.value)} className={input} />
        </label>
        <label className={rotulo}>Descrição da foto <span className={dicaCampo}>(para leitores de tela)</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} className={input} />
        </label>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="publicado" defaultChecked={p.publicado} className="h-5 w-5 accent-brand-strong" />
        Publicada (visível para os alunos)
      </label>
      <Aviso state={state} />
      <div><Salvar texto={p.id ? "Salvar parte" : "Criar parte"} /></div>
    </form>
  );
}

export type PerguntaEdicao = {
  id?: string; parte_id: number; en: string; pt: string | null; variantes: string[]; modelo: string | null; dica: string | null; ativo: boolean;
};

/** Edição de uma pergunta, com prévia de como o aluno vê. */
export function PerguntaForm({ q, partes }: { q: PerguntaEdicao; partes: { id: number; titulo: string }[] }) {
  const [state, action] = useActionState(salvarPerguntaEntrevista, undefined);
  const [v, setV] = useState({ en: q.en, pt: q.pt ?? "", variantes: q.variantes.join("\n"), modelo: q.modelo ?? "", dica: q.dica ?? "" });
  const ouvir = (t: string) => {
    if (!("speechSynthesis" in window) || !t) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/\[([^\]]+)\]/g, "$1"));
    u.lang = "en-US";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  };
  const lacunas = (t: string) => t.split(/(\[[^\]]+\])/g).map((s, i) => (s.startsWith("[") ? <mark key={i} className="rounded bg-[#fff3c4] px-1">{s.slice(1, -1)}</mark> : s));
  const vars = v.variantes.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <form action={action} className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-6">
        {q.id && <input type="hidden" name="id" value={q.id} />}
        <label className={rotulo}>Parte
          <select name="parte_id" defaultValue={q.parte_id} className={input}>
            {partes.map((p, i) => <option key={p.id} value={p.id}>Parte {i + 1} · {p.titulo}</option>)}
          </select>
        </label>
        <label className={rotulo}>Pergunta em inglês
          <textarea name="en" rows={2} required maxLength={600} value={v.en} onChange={(e) => setV({ ...v, en: e.target.value })} className={area} />
        </label>
        <label className={rotulo}>Tradução
          <input name="pt" maxLength={600} value={v.pt} onChange={(e) => setV({ ...v, pt: e.target.value })} className={input} />
        </label>
        <label className={rotulo}>Outras formas de perguntar <span className={dicaCampo}>(uma por linha, opcional)</span>
          <textarea name="variantes" rows={3} value={v.variantes} onChange={(e) => setV({ ...v, variantes: e.target.value })} className={area} />
        </label>
        <label className={rotulo}>Resposta-modelo em inglês <span className={dicaCampo}>(use [colchetes] no que o aluno troca pelos próprios dados)</span>
          <textarea name="modelo" rows={4} maxLength={2000} value={v.modelo} onChange={(e) => setV({ ...v, modelo: e.target.value })} className={area} />
        </label>
        <label className={rotulo}>Dica em português <span className={dicaCampo}>(opcional)</span>
          <textarea name="dica" rows={2} maxLength={600} value={v.dica} onChange={(e) => setV({ ...v, dica: e.target.value })} className={area} />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" name="ativo" defaultChecked={q.ativo} className="h-5 w-5 accent-brand-strong" />
          Visível para os alunos
        </label>
        <Aviso state={state} />
        <div><Salvar texto={q.id ? "Salvar pergunta" : "Criar pergunta"} /></div>
      </form>

      <aside className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-bold">Como o aluno vê</h2>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p lang="en" className="font-display text-[19px] leading-snug font-bold">{v.en ? lacunas(v.en) : <span className="text-muted">A pergunta aparece aqui.</span>}</p>
            {v.pt && <p className="text-[15px] text-muted">{v.pt}</p>}
          </div>
          <button type="button" onClick={() => ouvir(v.en)} className="min-h-10 shrink-0 cursor-pointer rounded-full bg-soft px-3.5 text-sm font-semibold hover:bg-[#e6e9f0]">🔊 Ouvir</button>
        </div>
        {vars.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[.06em] text-muted uppercase">Também perguntam assim</span>
            <ul lang="en" className="text-[15px] text-ink-2">{vars.map((x) => <li key={x}>• {lacunas(x)}</li>)}</ul>
          </div>
        )}
        {v.modelo && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] px-4 py-3">
            <p lang="en" className="text-[16px] leading-relaxed">{lacunas(v.modelo)}</p>
            <button type="button" onClick={() => ouvir(v.modelo)} className="min-h-10 shrink-0 cursor-pointer rounded-full bg-white px-3 text-sm font-semibold">🔊</button>
          </div>
        )}
        {v.dica && <p className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep"><strong>Dica:</strong> {v.dica}</p>}
      </aside>
    </div>
  );
}
