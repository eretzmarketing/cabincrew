import type { SupabaseClient } from "@supabase/supabase-js";
import { NOTA_MINIMA, TODAS_AULAS, chaveAula, chaveDoArquivo } from "@/lib/ingles-a-bordo";
import { urlMidia } from "@/lib/midia-comum";

export type ProgressoIngles = Record<string, { nota: number; concluida: boolean }>;

/**
 * Áudios do curso (MP3 da galeria de Mídia com nome "1.1.mp3" etc.) e progresso do aluno.
 * Antes do SQL 0022, segue funcionando: sem MP3 (voz do navegador) e com todas as aulas abertas.
 */
export async function carregarIngles(supabase: SupabaseClient, userId: string) {
  const [au, pr] = await Promise.all([
    supabase.rpc("audios_ingles"),
    supabase.from("ingles_progresso").select("aula, nota, concluida").eq("user_id", userId),
  ]);
  const audios: Record<string, string> = {};
  for (const a of (au.data ?? []) as { nome: string; arquivo: string }[]) {
    const k = chaveDoArquivo(a.nome);
    if (k && !audios[k]) audios[k] = urlMidia(a.arquivo); // o mais recente vale
  }
  const progresso: ProgressoIngles = {};
  for (const p of (pr.data ?? []) as { aula: string; nota: number; concluida: boolean }[]) progresso[p.aula] = { nota: p.nota, concluida: p.concluida };
  return { audios, progresso, comProgresso: !pr.error };
}

/** Uma aula abre quando a anterior (na ordem do curso) foi concluída com nota mínima. */
export function aulaLiberada(chave: string, progresso: ProgressoIngles, livre: boolean) {
  if (livre) return true;
  const i = TODAS_AULAS.findIndex((a) => chaveAula(a) === chave);
  if (i <= 0) return true;
  return !!progresso[chaveAula(TODAS_AULAS[i - 1])]?.concluida;
}

export { NOTA_MINIMA };
