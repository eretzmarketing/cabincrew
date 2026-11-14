/**
 * Conteúdo dos cursos de idioma = texto original do código + ajustes feitos no Admin › Cursos
 * (tabela idioma_conteudo, SQL 0058): editar, ocultar, excluir, criar e reordenar módulos e aulas.
 * Sem o SQL (ou sem ajustes), o curso fica exatamente como está no código.
 */
import type { AulaIngles, ModuloIngles } from "@/lib/ingles-a-bordo";
import type { CursoIdioma, ProdutoIdioma } from "@/lib/cursos-idioma";

export type AjusteIdioma = {
  curso: string; modulo: number; aula: number; dados: Record<string, unknown> | null;
  oculto: boolean; excluido: boolean; novo: boolean; ordem: number | null;
};

/** Situação no admin (o aluno nunca vê o que está oculto ou excluído). */
export type Marca = { oculto?: boolean; novo?: boolean; editado?: boolean };
export type AulaIdioma = AulaIngles & Marca;
export type ModuloIdioma = Omit<ModuloIngles, "aulas"> & Marca & { aulas: AulaIdioma[] };
export type CursoIdiomaAjustado = Omit<CursoIdioma, "modulos" | "todas"> & { modulos: ModuloIdioma[]; todas: AulaIdioma[] };

const CAMPOS_MODULO = ["titulo", "tituloEn", "resumo", "foto"] as const;
const CAMPOS_AULA = ["titulo", "tituloEn", "objetivo", "foto", "fotoAlt", "minutos", "intro", "dialogo", "vocabulario", "expressoes", "dica", "atividades", "quiz"] as const;

function so<T extends readonly string[]>(dados: Record<string, unknown> | null, campos: T) {
  const o: Record<string, unknown> = {};
  for (const k of campos) if (dados && dados[k] !== undefined) o[k] = dados[k];
  return o;
}

/** Aula nova criada no admin: começa com o mínimo para abrir sem erro. */
export function aulaEmBranco(modulo: number, numero: number, foto: string): AulaIngles {
  return {
    modulo, numero, titulo: "Nova aula", tituloEn: "New lesson", objetivo: "", foto, fotoAlt: "", minutos: 20, intro: "",
    dialogo: { titulo: "", contexto: "", personagens: [], falas: [] }, vocabulario: [], expressoes: [], atividades: [], quiz: [],
  };
}

/**
 * Junta o curso do código com os ajustes. Com `admin`, mantém os itens ocultos (marcados) para aparecerem no painel.
 * A ordem: a definida no admin; sem ela, a do código.
 */
export function aplicarAjustes(base: CursoIdioma, linhas: AjusteIdioma[], admin = false): CursoIdiomaAjustado {
  const ajuste = new Map(linhas.filter((l) => l.curso === base.produto).map((l) => [`${l.modulo}.${l.aula}`, l]));
  if (!ajuste.size) return base;

  const numerosModulo = new Set([...base.modulos.map((m) => m.numero), ...[...ajuste.values()].filter((l) => l.aula === 0 && l.novo).map((l) => l.modulo)]);
  const modulos: (ModuloIdioma & { _ordem: number })[] = [];
  for (const n of numerosModulo) {
    const original = base.modulos.find((m) => m.numero === n);
    const a = ajuste.get(`${n}.0`);
    if (a?.excluido || (!original && !a?.novo)) continue;
    if (a?.oculto && !admin) continue;
    const info = { ...(original ? { numero: n, titulo: original.titulo, tituloEn: original.tituloEn, resumo: original.resumo, foto: original.foto } : { numero: n, titulo: "Novo módulo", tituloEn: "", resumo: "", foto: "/img/ingles/cena-01.jpg" }), ...so(a?.dados ?? null, CAMPOS_MODULO) } as Omit<ModuloIngles, "aulas">;

    const numerosAula = new Set([...(original?.aulas ?? []).map((x) => x.numero), ...[...ajuste.values()].filter((l) => l.modulo === n && l.aula > 0 && l.novo).map((l) => l.aula)]);
    const aulas: (AulaIdioma & { _ordem: number })[] = [];
    for (const k of numerosAula) {
      const orig = original?.aulas.find((x) => x.numero === k);
      const b = ajuste.get(`${n}.${k}`);
      if (b?.excluido || (!orig && !b?.novo)) continue;
      if (b?.oculto && !admin) continue;
      const aula = { ...(orig ?? aulaEmBranco(n, k, info.foto)), ...so(b?.dados ?? null, CAMPOS_AULA), modulo: n, numero: k } as AulaIdioma;
      if (admin) { aula.oculto = !!b?.oculto; aula.novo = !!b?.novo; aula.editado = !!b && !b.novo && Object.keys(b.dados ?? {}).length > 0; }
      const pos = orig ? original!.aulas.indexOf(orig) : 900 + k;
      aulas.push({ ...aula, _ordem: b?.ordem ?? pos * 10 });
    }
    aulas.sort((x, y) => x._ordem - y._ordem || x.numero - y.numero);
    const m: ModuloIdioma = { ...info, aulas: aulas.map(({ _ordem, ...x }) => { void _ordem; return x; }) };
    if (admin) { m.oculto = !!a?.oculto; m.novo = !!a?.novo; m.editado = !!a && !a.novo && Object.keys(a.dados ?? {}).length > 0; }
    const pos = original ? base.modulos.indexOf(original) : 900 + n;
    modulos.push({ ...m, _ordem: a?.ordem ?? pos * 10 });
  }
  modulos.sort((x, y) => x._ordem - y._ordem || x.numero - y.numero);
  const lista: ModuloIdioma[] = modulos.map(({ _ordem, ...m }) => { void _ordem; return m; });
  const todas = lista.filter((m) => !m.oculto).flatMap((m) => m.aulas.filter((x) => !x.oculto));
  const achar = (modulo: number, numero: number) => {
    const m = lista.find((x) => x.numero === modulo);
    const a = m?.aulas.find((x) => x.numero === numero);
    return m && a ? { modulo: m as ModuloIngles, aula: a as AulaIngles } : null;
  };
  return { ...base, modulos: lista, todas, achar };
}

export const ehProdutoIdioma = (s: string): s is ProdutoIdioma => s === "english" || s === "spanish";
