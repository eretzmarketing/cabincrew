/**
 * Dados dos cursos lidos do banco (Admin › Cursos): título, descrição, imagem de destaque
 * e o conteúdo dos cursos de idioma com os ajustes do admin. Uma leitura por página.
 */
import { cache } from "react";
import { CURSOS, type SlugCurso } from "@/lib/cursos";
import { CURSOS_IDIOMA, type ProdutoIdioma } from "@/lib/cursos-idioma";
import { aplicarAjustes, type AjusteIdioma, type CursoIdiomaAjustado } from "@/lib/idioma-conteudo";
import { createClient } from "@/lib/supabase/server";

export type TipoCurso = "head-hunter" | "idioma" | "padrao";
export type InfoCurso = { slug: string; titulo: string; descricao: string; imagem: string; ordem: number; tipo: TipoCurso; publicado: boolean; endereco: string };

const PADRAO: Record<SlugCurso, Omit<InfoCurso, "slug" | "tipo" | "publicado" | "endereco">> = {
  "head-hunter": { titulo: "Head Hunter", descricao: "Preparatório completo para a seleção de comissário(a) de voo.", imagem: "/img/crew-select.jpg", ordem: 1 },
  english: { titulo: "Flight Attendant English", descricao: CURSOS_IDIOMA.english.textos.sub, imagem: CURSOS_IDIOMA.english.textos.capa, ordem: 2 },
  spanish: { titulo: "Flight Attendant Spanish", descricao: CURSOS_IDIOMA.spanish.textos.sub, imagem: CURSOS_IDIOMA.spanish.textos.capa, ordem: 3 },
};

/** Endereço do curso para o aluno. */
export const enderecoCurso = (slug: string, tipo?: string) => CURSOS.find((c) => c.slug === slug)?.endereco ?? (tipo === "padrao" || !tipo ? `/curso/${slug}` : `/${slug}`);

/** Todos os cursos (os 3 originais e os criados no admin), com o que foi editado. Sem o SQL, os 3 com os textos padrão. */
export const infoCursos = cache(async (): Promise<InfoCurso[]> => {
  const supabase = await createClient();
  let { data, error } = await supabase.from("cursos").select("slug, titulo, descricao, imagem, ordem, tipo, publicado");
  if (error) ({ data, error } = await supabase.from("cursos").select("slug, titulo, descricao, imagem, ordem") as unknown as { data: typeof data; error: typeof error });
  const linhas = new Map(((error ? [] : data) ?? []).map((l) => [l.slug as string, l as Partial<InfoCurso>]));
  const base: InfoCurso[] = CURSOS.map((c) => {
    const l = linhas.get(c.slug);
    const p = PADRAO[c.slug];
    return {
      slug: c.slug, titulo: l?.titulo || p.titulo, descricao: l?.descricao ?? p.descricao, imagem: l?.imagem || p.imagem, ordem: l?.ordem ?? p.ordem,
      tipo: c.slug === "head-hunter" ? "head-hunter" : "idioma", publicado: true, endereco: c.endereco,
    };
  });
  const novos: InfoCurso[] = [...linhas.values()].filter((l) => l.slug && !CURSOS.some((c) => c.slug === l.slug)).map((l) => ({
    slug: l.slug!, titulo: l.titulo || l.slug!, descricao: l.descricao ?? "", imagem: l.imagem || "/img/hero.jpg", ordem: l.ordem ?? 99,
    tipo: "padrao", publicado: l.publicado ?? true, endereco: enderecoCurso(l.slug!, "padrao"),
  }));
  return [...base, ...novos].sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt-BR"));
});

export async function infoCurso(slug: string) {
  return (await infoCursos()).find((c) => c.slug === slug) ?? null;
}

/** Nome de cada curso, para listas e etiquetas. */
export async function nomesCursos() {
  return Object.fromEntries((await infoCursos()).map((c) => [c.slug, c.titulo])) as Record<string, string>;
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
  return info ? { ...c, nome: info.titulo, textos: { ...c.textos, sub: info.descricao, capa: info.imagem } } : c;
}
