import type { SupabaseClient } from "@supabase/supabase-js";

/** Questões Plus: comentários (fórum de cada questão) e favoritas. */
export type PlusStatus = { cobrar: boolean; preco: number; tem: boolean; ate: string | null };

export const PLUS_NOME = "Questões Plus";
export const FAVORITAS_MINIMO = 20;
export const PLUS_PADRAO: PlusStatus = { cobrar: false, preco: 29.9, tem: true, ate: null };

/** Situação do aluno logado. Sem o SQL 0070, os recursos ficam escondidos (tem = false, sem cobrança). */
export async function plusStatus(supabase: SupabaseClient): Promise<PlusStatus & { pronto: boolean }> {
  const { data, error } = await supabase.rpc("plus_status");
  if (error || !data) return { cobrar: false, preco: 29.9, tem: false, ate: null, pronto: false };
  const d = data as Partial<PlusStatus>;
  return { cobrar: !!d.cobrar, preco: Number(d.preco ?? 29.9), tem: !!d.tem, ate: d.ate ?? null, pronto: true };
}

/** Quantos comentários cada questão tem. */
export async function contarComentarios(supabase: SupabaseClient, ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const { data } = await supabase.rpc("comentarios_contagem", { p_questoes: ids });
  return Object.fromEntries(((data ?? []) as { questao_id: string; total: number }[]).map((r) => [r.questao_id, r.total]));
}

export const OUTRAS = "Outras questões";
export const blocoDe = (categoria: string | null) => categoria || OUTRAS;

/** Quantas favoritas o aluno tem em cada bloco (o simulado de favoritas é por bloco). */
export async function favoritasPorBloco(supabase: SupabaseClient): Promise<{ blocos: Map<string, number>; maior: number }> {
  const { data } = await supabase.rpc("minhas_favoritas");
  const blocos = new Map<string, number>();
  for (const f of (data ?? []) as { categoria: string | null }[]) blocos.set(blocoDe(f.categoria), (blocos.get(blocoDe(f.categoria)) ?? 0) + 1);
  return { blocos, maior: Math.max(0, ...blocos.values()) };
}

export const precoBR = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
