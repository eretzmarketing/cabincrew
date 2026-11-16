"use client";

import { useActionState } from "react";
import { salvarCategoriaDinamica, salvarDinamica } from "@/app/dinamicas-actions";

type Estado = { ok?: boolean; msg?: string; erro?: string };
type Cat = { id: number; titulo: string; descricao?: string | null; ordem?: number };
export type DinamicaAdmin = {
  id: string; categoria_id: number | null; titulo: string; objetivo: string | null; materiais: string | null;
  como_realizada: string | null; como_se_destacar: string | null; ordem: number; ativo: boolean;
};

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] font-normal text-navy";
const rot = "flex flex-col gap-1.5 text-sm font-semibold text-navy";

function Aviso({ s }: { s: Estado }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

/** Formulário de uma dinâmica (nova ou edição). */
export function DinamicaForm({ d, categorias, categoriaInicial }: { d?: DinamicaAdmin; categorias: Cat[]; categoriaInicial?: number }) {
  const [s, acao, pend] = useActionState(salvarDinamica, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      {d && <input type="hidden" name="id" value={d.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_240px_100px]">
        <label className={rot}>Nome<input name="titulo" required maxLength={120} defaultValue={d?.titulo} className={`${campo} min-h-11`} /></label>
        <label className={rot}>Categoria
          <select name="categoria_id" required defaultValue={d?.categoria_id ?? categoriaInicial ?? ""} className={`${campo} min-h-11 cursor-pointer`}>
            <option value="" disabled>Escolha…</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </label>
        <label className={rot}>Ordem<input name="ordem" type="number" min={0} max={999} defaultValue={d?.ordem ?? 0} className={`${campo} min-h-11`} /></label>
      </div>
      <label className={rot}>Objetivo<input name="objetivo" maxLength={400} defaultValue={d?.objetivo ?? ""} placeholder="Para que serve a dinâmica" className={`${campo} min-h-11`} /></label>
      <label className={rot}>Materiais<input name="materiais" maxLength={400} defaultValue={d?.materiais ?? ""} placeholder="Ex.: folhas de papel, fita adesiva (ou: nenhum material)" className={`${campo} min-h-11`} /></label>
      <label className={rot}>Como acontece<textarea name="como_realizada" rows={3} maxLength={3000} defaultValue={d?.como_realizada ?? ""} className={`${campo} py-2.5`} /></label>
      <label className={rot}>Como se destacar<textarea name="como_se_destacar" rows={3} maxLength={3000} defaultValue={d?.como_se_destacar ?? ""} className={`${campo} py-2.5`} /></label>
      {!d && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="hidden" name="ativo" value="off" />
          <input type="checkbox" name="ativo" value="on" defaultChecked className="h-5 w-5 accent-brand-strong" />
          Já mostrar para os alunos
        </label>
      )}
      <Aviso s={s} />
      <div><button disabled={pend} className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">{pend ? "Salvando…" : d ? "Salvar" : "Adicionar dinâmica"}</button></div>
    </form>
  );
}

/** Formulário de uma categoria (nova ou edição). */
export function CategoriaForm({ c }: { c?: Cat }) {
  const [s, acao, pend] = useActionState(salvarCategoriaDinamica, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_90px]">
        <label className={rot}>Nome<input name="titulo" required maxLength={80} defaultValue={c?.titulo} className={`${campo} min-h-11`} /></label>
        <label className={rot}>Descrição<input name="descricao" maxLength={200} defaultValue={c?.descricao ?? ""} className={`${campo} min-h-11`} /></label>
        <label className={rot}>Ordem<input name="ordem" type="number" min={0} max={99} defaultValue={c?.ordem ?? 50} className={`${campo} min-h-11`} /></label>
      </div>
      <Aviso s={s} />
      <div><button disabled={pend} className="min-h-10 cursor-pointer rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60">{pend ? "Salvando…" : c ? "Salvar categoria" : "Criar categoria"}</button></div>
    </form>
  );
}
