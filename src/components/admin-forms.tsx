"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Conteudo from "@/components/Conteudo";
import type { FormState } from "@/app/actions";
import { salvarAula, salvarModulo, salvarSimulado } from "@/app/crew-actions";
import { BANCOS, type Aula, type Modulo, type Simulado } from "@/lib/crew";

const input = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] text-navy placeholder:text-muted";
const label = "flex flex-col gap-2 text-sm font-semibold";

function Aviso({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role={state.erro ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${state.erro ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>
      {state.erro ?? state.msg}
    </p>
  );
}

function Salvar({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
      {pending ? "Salvando…" : children}
    </button>
  );
}

function Publicado({ inicial, texto }: { inicial: boolean; texto: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" name="publicado" defaultChecked={inicial} className="h-5 w-5 accent-brand-strong" />
      {texto}
    </label>
  );
}

/* ---------- Módulo ---------- */
export function ModuloForm({ m, proximaOrdem = 0 }: { m?: Modulo; proximaOrdem?: number }) {
  const [state, action] = useActionState(salvarModulo, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[0_1_110px]`}>
          Ordem
          <input name="ordem" type="number" min={0} max={99} defaultValue={m?.ordem ?? proximaOrdem} className={input} />
        </label>
        <label className={`${label} flex-[1_1_320px]`}>
          Título
          <input name="titulo" required maxLength={120} defaultValue={m?.titulo} className={input} />
        </label>
        <label className={`${label} flex-[1_1_200px]`}>
          Fase da seleção
          <input name="fase" maxLength={60} defaultValue={m?.fase ?? ""} placeholder="Ex.: Dinâmica" className={input} />
        </label>
      </div>
      <label className={label}>
        Descrição
        <textarea name="descricao" rows={2} maxLength={500} defaultValue={m?.descricao ?? ""} className="rounded-xl border border-[#c9cedb] p-3.5 text-[15px] font-normal" />
      </label>
      <Publicado inicial={m?.publicado ?? true} texto="Módulo visível para os alunos" />
      <Aviso state={state} />
      <div><Salvar>{m ? "Salvar módulo" : "Criar módulo"}</Salvar></div>
    </form>
  );
}

/* ---------- Aula ---------- */
export function AulaForm({ a, modulos, simulados = [], moduloId, proximaOrdem = 1 }: { a?: Aula; modulos: Modulo[]; simulados?: { id: number; titulo: string }[]; moduloId?: number; proximaOrdem?: number }) {
  const [state, action] = useActionState(salvarAula, undefined);
  const [conteudo, setConteudo] = useState(a?.conteudo ?? "");
  const [ver, setVer] = useState<"editar" | "previa">("editar");
  const [tipo, setTipo] = useState<string>(a?.tipo ?? "texto");

  return (
    <form action={action} className="flex flex-col gap-5">
      {a && <input type="hidden" name="id" value={a.id} />}
      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[1_1_260px]`}>
          Módulo
          <select name="modulo_id" required defaultValue={a?.modulo_id ?? moduloId} className={input}>
            {modulos.map((m) => <option key={m.id} value={m.id}>{String(m.ordem).padStart(2, "0")} · {m.titulo}</option>)}
          </select>
        </label>
        <label className={`${label} flex-[0_1_110px]`}>
          Ordem
          <input name="ordem" type="number" min={0} max={999} defaultValue={a?.ordem ?? proximaOrdem} className={input} />
        </label>
        <label className={`${label} flex-[0_1_180px]`}>
          Tipo
          <select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={input}>
            <option value="texto">Leitura</option>
            <option value="video">Vídeo</option>
            <option value="pdf">Material em PDF</option>
            <option value="simulado">Simulado</option>
          </select>
        </label>
        <label className={`${label} flex-[0_1_150px]`}>
          Duração (min)
          <input name="duracao_min" type="number" min={1} max={600} defaultValue={a?.duracao_min ?? ""} className={input} />
        </label>
      </div>

      {tipo === "simulado" && (
        <label className={label}>
          Simulado que esta aula abre
          <select name="simulado_id" required defaultValue={a?.simulado_id ?? ""} className={input}>
            <option value="" disabled>Escolha o simulado</option>
            {simulados.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
          </select>
        </label>
      )}

      <label className={label}>
        Título da aula
        <input name="titulo" required maxLength={160} defaultValue={a?.titulo} className={input} />
      </label>
      <label className={label}>
        Resumo <span className="font-normal text-muted">(uma ou duas frases que aparecem no topo)</span>
        <input name="resumo" maxLength={400} defaultValue={a?.resumo ?? ""} className={input} />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[1_1_300px]`}>
          Link do vídeo <span className="font-normal text-muted">(YouTube, Vimeo ou outro)</span>
          <input name="video_url" type="url" defaultValue={a?.video_url ?? ""} placeholder="https://youtu.be/…" className={input} />
        </label>
        <label className={`${label} flex-[1_1_300px]`}>
          Link do material <span className="font-normal text-muted">(PDF, Google Drive…)</span>
          <input name="arquivo_url" type="url" defaultValue={a?.arquivo_url ?? ""} placeholder="https://…" className={input} />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold" id="conteudo-rotulo">Conteúdo da aula</span>
          <div className="flex gap-1 rounded-full bg-soft p-1" role="tablist" aria-label="Modo do editor">
            {(["editar", "previa"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={ver === m}
                onClick={() => setVer(m)}
                className={`min-h-9 cursor-pointer rounded-full px-4 text-sm font-semibold ${ver === m ? "bg-navy text-white" : "text-navy"}`}
              >
                {m === "editar" ? "Escrever" : "Pré-visualizar"}
              </button>
            ))}
          </div>
        </div>
        <textarea
          name="conteudo"
          aria-labelledby="conteudo-rotulo"
          rows={18}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={"## Título de uma seção\n\nTexto normal. Use **negrito** e listas:\n\n- item 1\n- item 2\n\n> Dica em destaque"}
          className={`rounded-xl border border-[#c9cedb] p-4 font-mono text-[14px] leading-relaxed ${ver === "previa" ? "hidden" : ""}`}
        />
        {ver === "previa" && (
          <div className="aula-conteudo min-h-[200px] rounded-xl border border-line bg-white p-6">
            {conteudo ? <Conteudo texto={conteudo} /> : <p className="text-muted">Nada escrito ainda.</p>}
          </div>
        )}
        <span className="text-xs text-muted">
          Formatação: <code>## Título</code> · <code>**negrito**</code> · <code>- lista</code> · <code>1. lista numerada</code> · <code>&gt; destaque</code> · <code>[texto](https://link)</code>
        </span>
      </div>

      <Publicado inicial={a?.publicado ?? false} texto="Aula publicada (visível para os alunos)" />
      <Aviso state={state} />
      <div><Salvar>{a ? "Salvar aula" : "Criar aula"}</Salvar></div>
    </form>
  );
}

/* ---------- Simulado ---------- */
export function SimuladoForm({ s }: { s?: Simulado }) {
  const [state, action] = useActionState(salvarSimulado, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      {s && <input type="hidden" name="id" value={s.id} />}
      <label className={label}>
        Título
        <input name="titulo" required maxLength={160} defaultValue={s?.titulo} className={input} />
      </label>
      <label className={label}>
        Descrição <span className="font-normal text-muted">(opcional)</span>
        <input name="descricao" maxLength={500} defaultValue={s?.descricao ?? ""} className={input} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Bancos de questões</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BANCOS).map(([k, v]) => (
            <label key={k} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-[#d5d9e3] px-3 text-sm has-[:checked]:border-navy">
              <input type="checkbox" name="bancos" value={k} defaultChecked={s?.bancos.includes(k)} className="h-4 w-4 accent-brand-strong" />
              {v}
            </label>
          ))}
        </div>
        {s?.categorias?.length ? <span className="text-xs text-muted">Filtrado por tema: {s.categorias.join(", ")}</span> : null}
      </fieldset>
      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[1_1_160px]`}>
          Questões por tentativa
          <input name="qtd_questoes" type="number" min={1} max={200} required defaultValue={s?.qtd_questoes ?? 20} className={input} />
        </label>
        <label className={`${label} flex-[1_1_160px]`}>
          Tempo (min) <span className="font-normal text-muted">vazio = sem limite</span>
          <input name="tempo_min" type="number" min={1} max={300} defaultValue={s?.tempo_min ?? ""} className={input} />
        </label>
        <label className={`${label} flex-[1_1_160px]`}>
          Nota mínima (%)
          <input name="nota_minima" type="number" min={0} max={100} required defaultValue={s?.nota_minima ?? 70} className={input} />
        </label>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="mostrar_gabarito" defaultChecked={s?.mostrar_gabarito ?? true} className="h-5 w-5 accent-brand-strong" />
        Mostrar o gabarito comentado depois da entrega
      </label>
      <Aviso state={state} />
      <div><Salvar>{s ? "Salvar simulado" : "Criar simulado"}</Salvar></div>
    </form>
  );
}
