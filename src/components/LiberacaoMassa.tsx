"use client";

import { useActionState, useEffect, useState } from "react";
import { aplicarRegraEscola, liberarEmMassa, salvarRegraEscola } from "@/app/massa-actions";

type Curso = { slug: string; nome: string };
export type Pacote = { cursos: string[]; curso_dias: number | null; plus: boolean; plus_dias: number | null; ia_video: number; ia_curriculo: number };

const campo = "min-h-11 w-full rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-[14px] font-semibold";
const PRAZOS: [string, string][] = [["sem", "Sem prazo"], ["30", "1 mês"], ["90", "3 meses"], ["180", "6 meses"], ["365", "1 ano"]];

function Aviso({ s }: { s: { ok?: boolean; msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[14px] font-semibold text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

/** Campos do pacote: cursos, prazo, Questões Plus e análises da IA. */
function CamposPacote({ cursos, p }: { cursos: Curso[]; p?: Pacote }) {
  const prazo = (d: number | null | undefined) => (d == null ? "sem" : String(d));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <fieldset className="flex flex-col gap-2 rounded-xl border border-line p-4">
        <legend className="px-1 text-[14px] font-bold">Cursos</legend>
        {cursos.map((c) => (
          <label key={c.slug} className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px]">
            <input type="checkbox" name="cursos" value={c.slug} defaultChecked={p?.cursos.includes(c.slug)} className="h-5 w-5 accent-brand-strong" />{c.nome}
          </label>
        ))}
        <label className={`${rot} mt-1`}>Prazo dos cursos
          <select name="curso_dias" defaultValue={prazo(p?.curso_dias)} className={campo}>{PRAZOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
      </fieldset>
      <div className="flex flex-col gap-4">
        <label className={rot}>⭐ Questões Plus <span className="font-normal text-muted">(comentários e favoritas)</span>
          <select name="plus" defaultValue={p?.plus ? prazo(p.plus_dias) : "nao"} className={campo}>
            <option value="nao">Não liberar</option>
            {PRAZOS.slice(1).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            <option value="sem">Sem prazo</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={rot}>🎥 Análises extras de vídeo (IA)<input name="ia_video" type="number" min={0} max={20} defaultValue={p?.ia_video ?? 0} className={campo} /></label>
          <label className={rot}>📄 Análises extras de currículo (IA)<input name="ia_curriculo" type="number" min={0} max={20} defaultValue={p?.ia_curriculo ?? 0} className={campo} /></label>
        </div>
        <p className="text-[13px] text-muted">Ninguém perde nada: quem já tem um acesso igual ou maior fica como está. O Questões Plus soma ao prazo que o aluno já tem.</p>
      </div>
    </div>
  );
}

/** Painel da lista de Usuários: libera um pacote para os marcados ou para todos do filtro. */
export function LiberarEmMassa({ cursos, idsFiltro, filtrando }: { cursos: Curso[]; idsFiltro: string[]; filtrando: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [alvo, setAlvo] = useState<"marcados" | "filtro">("marcados");
  const [confirmar, setConfirmar] = useState(false);
  const [s, acao, pend] = useActionState(async (prev: Awaited<ReturnType<typeof liberarEmMassa>>, f: FormData) => {
    const r = await liberarEmMassa(prev, f);
    setConfirmar(false);
    return r;
  }, {});

  useEffect(() => {
    const ler = () => setMarcados([...document.querySelectorAll<HTMLInputElement>("input[data-massa]:checked")].map((i) => i.value));
    document.addEventListener("change", ler);
    ler();
    return () => document.removeEventListener("change", ler);
  }, []);

  const marcarPagina = (v: boolean) => {
    document.querySelectorAll<HTMLInputElement>("input[data-massa]").forEach((i) => { i.checked = v; });
    setMarcados(v ? [...document.querySelectorAll<HTMLInputElement>("input[data-massa]")].map((i) => i.value) : []);
  };
  const ids = alvo === "filtro" ? idsFiltro : marcados;
  const n = ids.length;

  return (
    <section aria-label="Liberar em massa" className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-navy px-5 font-display text-[15px] font-bold text-white hover:bg-navy-deep">
          🎁 Liberar em massa {aberto ? "▴" : "▾"}
        </button>
        <span className="text-[14px] text-ink-2"><strong className="text-navy">{marcados.length}</strong> {marcados.length === 1 ? "aluno marcado" : "alunos marcados"}</span>
        <button type="button" onClick={() => marcarPagina(true)} className="min-h-10 cursor-pointer px-2 text-[14px] font-semibold text-navy underline underline-offset-4">Marcar todos desta página</button>
        {marcados.length > 0 && <button type="button" onClick={() => marcarPagina(false)} className="min-h-10 cursor-pointer px-2 text-[14px] font-semibold text-muted underline underline-offset-4">Desmarcar</button>}
      </div>
      {aberto && (
        <form action={acao} className="flex flex-col gap-4 border-t border-line p-4">
          <input type="hidden" name="ids" value={ids.join(",")} />
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-2 text-[14px] font-bold">Para quem</legend>
            {([["marcados", `Só os marcados (${marcados.length})`], ["filtro", `Todos ${filtrando ? "do filtro atual" : "os cadastrados"} (${idsFiltro.length})`]] as const).map(([v, l]) => (
              <label key={v} className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-[14px] font-semibold ${alvo === v ? "border-navy bg-[#eef1ff] text-navy" : "border-line text-ink-2"}`}>
                <input type="radio" name="alvo" value={v} checked={alvo === v} onChange={() => { setAlvo(v); setConfirmar(false); }} className="sr-only" />{l}
              </label>
            ))}
          </fieldset>
          {alvo === "filtro" && !filtrando && <p className="rounded-xl bg-[#fff6e0] px-4 py-3 text-[14px] text-[#6b4e00]">Sem filtro, vale para <strong>todos os cadastrados</strong>. Para uma escola, escolha a escola no filtro acima e clique em Filtrar.</p>}
          <CamposPacote cursos={cursos} />
          <label className={rot}>Observação <span className="font-normal text-muted">(aparece na ficha, ex.: “Parceria ABC Fly”)</span>
            <input name="motivo" maxLength={120} placeholder="Liberação em massa" className={campo} />
          </label>
          <Aviso s={s} />
          <div className="flex flex-wrap items-center gap-3">
            {!confirmar ? (
              <button type="button" disabled={!n} onClick={() => setConfirmar(true)}
                className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50">
                Liberar para {n} {n === 1 ? "aluno" : "alunos"}
              </button>
            ) : (
              <>
                <span className="text-[15px] font-semibold">Confirma liberar para {n} {n === 1 ? "aluno" : "alunos"}?</span>
                <button disabled={pend} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Liberando…" : "Sim, liberar"}</button>
                <button type="button" onClick={() => setConfirmar(false)} className="min-h-12 cursor-pointer px-3 font-semibold text-ink-2">Cancelar</button>
              </>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

/** Formulário da regra de uma escola (nova ou editando). */
export function RegraEscolaForm({ cursos, escolas, regra, onFeito }: { cursos: Curso[]; escolas: string[]; regra?: Pacote & { escola: string }; onFeito?: () => void }) {
  const [s, acao, pend] = useActionState(salvarRegraEscola, {});
  useEffect(() => { if (s.ok) onFeito?.(); }, [s, onFeito]);
  return (
    <form action={acao} className="flex flex-col gap-4">
      {regra && <input type="hidden" name="original" value={regra.escola} />}
      <label className={rot}>Escola
        <input name="escola" list="lista-escolas" required defaultValue={regra?.escola} placeholder="Comece a digitar o nome da escola" className={campo} />
        <datalist id="lista-escolas">{escolas.map((e) => <option key={e} value={e} />)}</datalist>
        <span className="font-normal text-[13px] text-muted">Use o nome exatamente como aparece no cadastro.</span>
      </label>
      <CamposPacote cursos={cursos} p={regra} />
      <Aviso s={s} />
      <div><button disabled={pend} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Salvando…" : "Salvar regra"}</button></div>
    </form>
  );
}

/** Editar uma regra existente (abre o formulário no próprio cartão). */
export function EditarRegra({ cursos, escolas, regra }: { cursos: Curso[]; escolas: string[]; regra: Pacote & { escola: string } }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto} className="inline-flex min-h-10 cursor-pointer items-center rounded-full border-2 border-line bg-white px-4 text-[14px] font-semibold text-navy hover:border-navy">{aberto ? "Fechar" : "Editar"}</button>
      {aberto && <div className="mt-3 w-full border-t border-line pt-4"><RegraEscolaForm cursos={cursos} escolas={escolas} regra={regra} onFeito={() => setAberto(false)} /></div>}
    </>
  );
}

/** Aplica a regra a quem já está cadastrado na escola. */
export function AplicarRegra({ escola, cadastrados }: { escola: string; cadastrados: number }) {
  const [confirmar, setConfirmar] = useState(false);
  const [s, acao, pend] = useActionState(async (prev: Awaited<ReturnType<typeof aplicarRegraEscola>>, f: FormData) => {
    const r = await aplicarRegraEscola(prev, f);
    setConfirmar(false);
    return r;
  }, {});
  const quem = cadastrados === 1 ? "o aluno já cadastrado" : `os ${cadastrados} já cadastrados`;
  if (!cadastrados) return <span className="text-[13px] text-muted">Ninguém cadastrado nessa escola ainda.</span>;
  return (
    <form action={acao} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="escola" value={escola} />
      {!confirmar ? (
        <button type="button" onClick={() => setConfirmar(true)} className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-white hover:bg-navy-deep">
          Aplicar {cadastrados === 1 ? "ao aluno já cadastrado" : `aos ${cadastrados} já cadastrados`}
        </button>
      ) : (
        <>
          <span className="text-[14px] font-semibold">Liberar para {quem} nessa escola?</span>
          <button disabled={pend} className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-brand-strong px-4 text-[14px] font-bold text-white disabled:opacity-60">{pend ? "Aplicando…" : "Sim, aplicar"}</button>
          <button type="button" onClick={() => setConfirmar(false)} className="min-h-10 cursor-pointer px-2 text-[14px] font-semibold text-ink-2">Cancelar</button>
        </>
      )}
      <Aviso s={s} />
    </form>
  );
}
