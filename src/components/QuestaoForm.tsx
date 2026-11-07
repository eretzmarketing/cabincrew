"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { salvarQuestao } from "@/app/crew-actions";
import { BANCOS, type Alternativa } from "@/lib/crew";

export type QuestaoEdicao = {
  id?: string;
  banco: string;
  categoria: string | null;
  contexto: string | null;
  enunciado: string;
  imagem_url: string | null;
  alternativas: Alternativa[];
  correta: string | null;
  explicacao: string | null;
  ativo: boolean;
};

const LETRAS = ["A", "B", "C", "D", "E"];
const input = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] text-navy placeholder:text-muted";
const area = "w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 py-3 text-[15px] leading-relaxed text-navy placeholder:text-muted";
const rotulo = "flex flex-col gap-2 text-sm font-semibold text-navy";

function Salvar({ nova }: { nova: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
      {pending ? "Salvando…" : nova ? "Criar questão" : "Salvar alterações"}
    </button>
  );
}

/** Como o aluno vê a questão (com a correta destacada) */
function Previa({ q }: { q: QuestaoEdicao }) {
  const alts = q.alternativas.filter((a) => a.texto?.trim() || a.imagem_url?.trim());
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="rounded-full bg-soft px-2.5 py-1 font-semibold text-navy">{BANCOS[q.banco] ?? q.banco}</span>
        {q.categoria && <span className="rounded-full bg-[#efeaff] px-2.5 py-1 font-semibold text-[#5b3cc4]">{q.categoria}</span>}
        {!q.ativo && <span className="rounded-full bg-[#fff3e0] px-2.5 py-1 font-semibold text-[#8a4b00]">Fora dos simulados</span>}
      </div>
      {q.contexto?.trim() && <p className="whitespace-pre-line rounded-xl border border-line bg-soft px-4 py-3 text-[15px] leading-relaxed text-ink-2">{q.contexto}</p>}
      {q.imagem_url?.trim() && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={q.imagem_url} alt="Imagem da questão" className="max-h-80 w-full rounded-xl border border-line bg-white object-contain p-2" />
      )}
      <p className="text-[17px] leading-relaxed font-semibold whitespace-pre-line">{q.enunciado || <span className="text-muted">O enunciado aparece aqui.</span>}</p>
      <ul className="flex flex-col gap-2">
        {alts.map((a, i) => {
          const certa = q.correta === a.letra;
          return (
            <li
              key={a.letra}
              className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-[15px] ${certa ? "border-[#2e9d5b] bg-[#eefaf2]" : "border-line bg-white"}`}
            >
              <span className={`font-display font-bold ${certa ? "text-[#0f6b3a]" : "text-navy"}`}>{LETRAS[i]})</span>
              <span className="flex flex-1 flex-col gap-2">
                {a.texto && <span>{a.texto}</span>}
                {a.imagem_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imagem_url} alt={`Alternativa ${LETRAS[i]}`} className="max-h-28 w-fit rounded-lg border border-line object-contain" />
                )}
              </span>
              {certa && <span className="rounded-full bg-[#2e9d5b] px-2.5 py-0.5 text-xs font-bold text-white">Correta</span>}
            </li>
          );
        })}
      </ul>
      {q.explicacao?.trim() && (
        <div className="flex flex-col gap-1 rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] px-4 py-3 text-[15px] leading-relaxed">
          <strong className="text-[#1d4fb8]">Explicação</strong>
          <p className="whitespace-pre-line text-ink-2">{q.explicacao}</p>
        </div>
      )}
    </div>
  );
}

export default function QuestaoForm({ inicial, categorias }: { inicial: QuestaoEdicao; categorias: string[] }) {
  const [state, action] = useActionState(salvarQuestao, undefined);
  const [q, setQ] = useState<QuestaoEdicao>(() => ({
    ...inicial,
    alternativas: LETRAS.map((l) => inicial.alternativas.find((a) => a.letra === l) ?? { letra: l, texto: null, imagem_url: null }),
  }));
  const set = <K extends keyof QuestaoEdicao>(k: K, v: QuestaoEdicao[K]) => setQ((x) => ({ ...x, [k]: v }));
  const setAlt = (letra: string, campo: "texto" | "imagem_url", v: string) =>
    setQ((x) => ({ ...x, alternativas: x.alternativas.map((a) => (a.letra === letra ? { ...a, [campo]: v } : a)) }));
  const nova = !inicial.id;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <form action={action} className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-6">
        {inicial.id && <input type="hidden" name="id" value={inicial.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rotulo}>
            Banco
            <select name="banco" value={q.banco} onChange={(e) => set("banco", e.target.value)} className={input}>
              {Object.entries(BANCOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className={rotulo}>
            Tema
            <input name="categoria" list="temas" value={q.categoria ?? ""} onChange={(e) => set("categoria", e.target.value)} placeholder="Ex.: Primeiros Socorros" className={input} />
            <datalist id="temas">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
        </div>

        <label className={rotulo}>
          Texto de apoio <span className="font-normal text-muted">(opcional: leitura, cenário, tabela de dados)</span>
          <textarea name="contexto" rows={3} value={q.contexto ?? ""} onChange={(e) => set("contexto", e.target.value)} className={area} />
        </label>

        <label className={rotulo}>
          Enunciado
          <textarea name="enunciado" rows={3} required value={q.enunciado} onChange={(e) => set("enunciado", e.target.value)} className={area} />
        </label>

        <label className={rotulo}>
          Imagem da questão <span className="font-normal text-muted">(opcional: endereço https://)</span>
          <input name="imagem_url" value={q.imagem_url ?? ""} onChange={(e) => set("imagem_url", e.target.value)} placeholder="https://…" className={input} />
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-navy">Alternativas · marque a correta</legend>
          {q.alternativas.map((a) => (
            <div key={a.letra} className={`flex flex-col gap-2 rounded-xl border-2 p-3 ${q.correta === a.letra ? "border-[#2e9d5b] bg-[#f4fbf6]" : "border-line"}`}>
              <div className="flex items-center gap-3">
                <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 font-display font-bold text-navy">
                  <input type="radio" name="correta" value={a.letra} checked={q.correta === a.letra} onChange={() => set("correta", a.letra)} className="h-5 w-5 accent-[#2e9d5b]" />
                  {a.letra}
                  <span className="sr-only">é a correta</span>
                </label>
                <input
                  name={`alt_${a.letra}`}
                  aria-label={`Texto da alternativa ${a.letra}`}
                  value={a.texto ?? ""}
                  onChange={(e) => setAlt(a.letra, "texto", e.target.value)}
                  placeholder={a.letra === "E" ? "Opcional" : ""}
                  className={input}
                />
              </div>
              <input
                name={`alt_${a.letra}_img`}
                aria-label={`Imagem da alternativa ${a.letra} (opcional)`}
                value={a.imagem_url ?? ""}
                onChange={(e) => setAlt(a.letra, "imagem_url", e.target.value)}
                placeholder="Imagem da alternativa (opcional)"
                className={`${input} min-h-10 text-[14px]`}
              />
            </div>
          ))}
        </fieldset>

        <label className={rotulo}>
          Explicação <span className="font-normal text-muted">(aparece no gabarito comentado)</span>
          <textarea name="explicacao" rows={3} value={q.explicacao ?? ""} onChange={(e) => set("explicacao", e.target.value)} className={area} />
        </label>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" name="ativo" checked={q.ativo} onChange={(e) => set("ativo", e.target.checked)} className="h-5 w-5 accent-brand-strong" />
          Usar nos simulados
        </label>

        {state && (
          <p role={state.erro ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${state.erro ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>
            {state.erro ?? state.msg}
          </p>
        )}
        <div><Salvar nova={nova} /></div>
      </form>

      <aside className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-bold">Como o aluno vê</h2>
        <Previa q={q} />
      </aside>
    </div>
  );
}
