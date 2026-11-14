import type { SupabaseClient } from "@supabase/supabase-js";
import { CURSOS_IDIOMA, type ProdutoIdioma } from "@/lib/cursos-idioma";
import { cursoIdioma } from "@/lib/cursos-dados";
import type { AulaIngles } from "@/lib/ingles-a-bordo";

const horas = (min: number) => (min > 0 ? `${Math.ceil(min / 60)} horas` : null);
const soma = (aulas: AulaIngles[]) => horas(aulas.reduce((s, a) => s + (Number(a.minutos) || 0), 0));

/** Carga horária dos cursos de idioma pelo conteúdo do código (para quem não lê os ajustes do admin). */
export function cargaIdioma(curso: string) {
  const c = CURSOS_IDIOMA[curso as ProdutoIdioma];
  return c ? soma(c.todas) : null;
}

/**
 * Carga horária calculada pelo conteúdo do curso (com as mudanças feitas no Admin › Cursos).
 * Head Hunter: soma da duração das aulas publicadas (precisa de quem possa ler as aulas, como o admin).
 */
export async function cargaDoCurso(supabase: SupabaseClient, curso: string): Promise<string | null> {
  if (curso === "english" || curso === "spanish") return soma((await cursoIdioma(curso)).todas);
  if (curso !== "head-hunter") return null;
  const { data } = await supabase.from("aulas").select("duracao_min").eq("publicado", true);
  return horas(((data ?? []) as { duracao_min: number | null }[]).reduce((s, a) => s + (Number(a.duracao_min) || 0), 0));
}
