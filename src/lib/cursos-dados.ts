/**
 * Dados dos cursos lidos do banco (Admin › Cursos): título, descrição, imagem de destaque
 * e o conteúdo dos cursos de idioma com os ajustes do admin. Uma leitura por página.
 */
import { cache } from "react";
import { CURSOS, type SlugCurso } from "@/lib/cursos";
import { CURSOS_IDIOMA, type ProdutoIdioma } from "@/lib/cursos-idioma";
import { aplicarAjustes, type AjusteIdioma, type CursoIdiomaAjustado } from "@/lib/idioma-conteudo";
import { createClient } from "@/lib/supabase/server";

export type InfoCurso = { slug: SlugCurso; titulo: string; descricao: string; imagem: string; ordem: number };

const PADRAO: Record<SlugCurso, Omit<InfoCurso, "slug">> = {
  "head-hunter": { titulo: "Head Hunter", descricao: "Preparatório completo para a seleção de comissário(a) de voo.", imagem: "/img/crew-select.jpg", ordem: 1 },
  english: { titulo: "Flight Attendant English", descricao: CURSOS_IDIOMA.english.textos.sub, imagem: CURSOS_IDIOMA.english.textos.capa, ordem: 2 },
  spanish: { titulo: "Flight Attendant Spanish", descricao: CURSOS_IDIOMA.spanish.textos.sub, imagem: CURSOS_IDIOMA.spanish.textos.capa, ordem: 3 },
};

/** Os três cursos, com o que foi editado no admin (sem o SQL 0058, os textos padrão). */
export const infoCursos = cache(async (): Promise<InfoCurso[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cursos").select("slug, titulo, descricao, imagem, ordem");
  const linhas = new Map(((error ? [] : data) ?? []).map((l) => [l.slug as string, l as Partial<InfoCurso>]));
  return CURSOS.map((c) => {
    const l = linhas.get(c.slug);
    const p = PADRAO[c.slug];
    return { slug: c.slug, titulo: l?.titulo || p.titulo, descricao: l?.descricao ?? p.descricao, imagem: l?.imagem || p.imagem, ordem: l?.ordem ?? p.ordem };
  }).sort((a, b) => a.ordem - b.ordem);
});

export async function infoCurso(slug: SlugCurso) {
  return (await infoCursos()).find((c) => c.slug === slug)!;
}

/** Ajustes do admin num curso de idioma (só quem tem o curso, ou o admin, consegue ler). */
export const ajustesIdioma = cache(async (produto: ProdutoIdioma): Promise<AjusteIdioma[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("idioma_conteudo").select("curso, modulo, aula, dados, oculto, excluido, novo, ordem").eq("curso", produto);
  return error ? [] : ((data ?? []) as AjusteIdioma[]);
});

/** Curso de idioma pronto para usar: conteúdo do código + ajustes + título, descrição e imagem do admin. */
export async function cursoIdioma(produto: ProdutoIdioma, admin = false): Promise<CursoIdiomaAjustado> {
  const [ajustes, info] = await Promise.all([ajustesIdioma(produto), infoCurso(produto)]);
  const c = aplicarAjustes(CURSOS_IDIOMA[produto], ajustes, admin);
  return { ...c, nome: info.titulo, textos: { ...c.textos, sub: info.descricao, capa: info.imagem } };
}
