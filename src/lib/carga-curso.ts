import type { SupabaseClient } from "@supabase/supabase-js";
import { CURSOS_IDIOMA, type ProdutoIdioma } from "@/lib/cursos-idioma";

const horas = (min: number) => (min > 0 ? `${Math.ceil(min / 60)} horas` : null);

/** Carga horária dos cursos de idioma: soma do tempo de todas as aulas (arredonda para cima). */
export function cargaIdioma(curso: string) {
  const c = CURSOS_IDIOMA[curso as ProdutoIdioma];
  return c ? horas(c.todas.reduce((s, a) => s + a.minutos, 0)) : null;
}

/**
 * Carga horária calculada pelo conteúdo do curso.
 * Head Hunter: soma da duração das aulas publicadas (precisa de quem possa ler as aulas, como o admin).
 */
export async function cargaDoCurso(supabase: SupabaseClient, curso: string): Promise<string | null> {
  if (curso !== "head-hunter") return cargaIdioma(curso);
  const { data } = await supabase.from("aulas").select("duracao_min").eq("publicado", true);
  return horas(((data ?? []) as { duracao_min: number | null }[]).reduce((s, a) => s + (Number(a.duracao_min) || 0), 0));
}
