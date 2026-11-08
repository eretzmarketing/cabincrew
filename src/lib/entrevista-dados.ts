import type { SupabaseClient } from "@supabase/supabase-js";
import { PARTES, type Parte, type Pergunta } from "@/lib/entrevista-ingles";

type LinhaParte = { id: number; slug: string; numero: number; titulo: string; titulo_en: string | null; resumo: string | null; foto: string | null; foto_alt: string | null; publicado: boolean };
type LinhaPergunta = { id: string; parte_id: number; ordem: number; en: string; pt: string | null; variantes: string[] | null; modelo: string | null; dica: string | null; ativo: boolean };

const FOTO_PADRAO = "/img/banco/comissaria-aviao-miniatura.jpg";

/**
 * Partes e perguntas da Entrevista em inglês, lidas do banco (editáveis no painel).
 * Se as tabelas ainda não existem (antes do SQL 0020), usa o conteúdo embutido no código.
 * O banco já filtra: alunos só recebem partes publicadas e perguntas ativas; o administrador recebe tudo.
 */
export async function carregarEntrevista(supabase: SupabaseClient): Promise<{ partes: Parte[]; doBanco: boolean }> {
  const [pr, qr] = await Promise.all([
    supabase.from("entrevista_partes").select("id, slug, numero, titulo, titulo_en, resumo, foto, foto_alt, publicado").order("numero").order("id"),
    supabase.from("entrevista_perguntas").select("id, parte_id, ordem, en, pt, variantes, modelo, dica, ativo").order("ordem").order("id").limit(5000),
  ]);
  if (pr.error || qr.error) return { partes: PARTES, doBanco: false };
  const porParte = new Map<number, Pergunta[]>();
  for (const q of (qr.data ?? []) as LinhaPergunta[]) {
    const lista = porParte.get(q.parte_id) ?? [];
    lista.push({ id: q.id, en: q.en, pt: q.pt ?? "", variantes: q.variantes?.length ? q.variantes : undefined, modelo: q.modelo ?? undefined, dica: q.dica ?? undefined });
    porParte.set(q.parte_id, lista);
  }
  const partes = ((pr.data ?? []) as LinhaParte[]).map((p, i) => ({
    id: p.id,
    publicado: p.publicado,
    slug: p.slug,
    numero: i + 1,
    titulo: p.titulo,
    tituloEn: p.titulo_en ?? "",
    resumo: p.resumo ?? "",
    foto: p.foto || FOTO_PADRAO,
    fotoAlt: p.foto_alt ?? "",
    perguntas: porParte.get(p.id) ?? [],
  }));
  return { partes, doBanco: true };
}
