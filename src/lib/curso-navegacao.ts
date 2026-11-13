/** Monta a lista lateral (módulos e aulas) do player de curso: Head Hunter e Flight Attendant English. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemCurso, SecaoCurso } from "@/components/CursoPlayer";
import { numeroModulo, type Aula, type Modulo } from "@/lib/crew";
import { MODULOS_INGLES, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberada, type ProgressoIngles } from "@/lib/ingles-dados";

export type Navegacao = { secoes: SecaoCurso[]; ordem: ItemCurso[]; feitas: number; total: number; anterior?: ItemCurso; proxima?: ItemCurso };

function fechar(secoes: SecaoCurso[]): Navegacao {
  const ordem = secoes.flatMap((s) => s.itens.filter((i) => !i.extra));
  const pos = ordem.findIndex((i) => i.atual);
  return {
    secoes, ordem,
    feitas: ordem.filter((i) => i.feita).length,
    total: ordem.length,
    anterior: pos > 0 ? ordem[pos - 1] : undefined,
    proxima: pos >= 0 ? ordem[pos + 1] : undefined,
  };
}

/** Atalhos de treino que ficam dentro de cada módulo do Head Hunter. */
function extras(m: Modulo): ItemCurso[] {
  const x: ItemCurso[] = [];
  if (m.recurso === "anac") x.push({ href: "/simulados-anac", titulo: "Simulados ANAC", tipo: "treino", extra: true });
  if (m.recurso === "dinamicas") x.push({ href: "/head-hunter/dinamicas", titulo: "Biblioteca de dinâmicas", tipo: "treino", extra: true });
  if (m.ordem === 6) x.push({ href: "/head-hunter/perfil-comportamental", titulo: "Treino do perfil comportamental", tipo: "treino", extra: true });
  if (m.ordem === 8) {
    x.push({ href: "/head-hunter/video-apresentacao", titulo: "Treino de vídeo de apresentação", tipo: "treino", extra: true });
    x.push({ href: "/head-hunter/entrevista-ingles", titulo: "Entrevista em inglês", tipo: "treino", extra: true });
  }
  return x;
}

export async function navegacaoHeadHunter(supabase: SupabaseClient, userId: string, atual: { aulaId?: string; moduloId?: number }): Promise<Navegacao> {
  const [{ data: mods }, { data: aulas }, { data: feitas }] = await Promise.all([
    supabase.from("modulos").select("*").eq("publicado", true).order("ordem"),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo, tipo, duracao_min").eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", userId),
  ]);
  const ok = new Set((feitas ?? []).map((f) => f.aula_id as string));
  const porModulo = new Map<number, Aula[]>();
  for (const a of (aulas ?? []) as Aula[]) porModulo.set(a.modulo_id, [...(porModulo.get(a.modulo_id) ?? []), a]);

  const secoes: SecaoCurso[] = [];
  for (const m of (mods ?? []) as Modulo[]) {
    // no módulo com a página Simulados ANAC, os simulados ficam lá (não repetem na lista)
    const itens: ItemCurso[] = (porModulo.get(m.id) ?? [])
      .filter((a) => !(m.recurso === "anac" && a.tipo === "simulado"))
      .map((a) => ({
        href: `/head-hunter/aula/${a.id}`, titulo: a.titulo, tipo: a.tipo, minutos: a.duracao_min,
        feita: ok.has(a.id), atual: a.id === atual.aulaId,
      }));
    const todos = [...itens, ...extras(m)];
    if (!todos.length) continue;
    secoes.push({
      id: `m${m.id}`, rotulo: `Módulo ${numeroModulo(m.ordem)}`, titulo: m.titulo, href: `/head-hunter/modulo/${m.id}`,
      atual: m.id === atual.moduloId || itens.some((i) => i.atual), itens: todos,
    });
  }
  return fechar(secoes);
}

export function navegacaoIngles(progresso: ProgressoIngles, livre: boolean, atual: { chave?: string; modulo?: number }): Navegacao {
  const secoes: SecaoCurso[] = MODULOS_INGLES.filter((m) => m.aulas.length).map((m) => {
    const itens: ItemCurso[] = m.aulas.map((a) => {
      const k = chaveAula(a);
      return {
        href: `/english/${m.numero}/${a.numero}`, titulo: `${k} · ${a.titulo}`, tipo: "audio", minutos: a.minutos,
        feita: !!progresso[k]?.concluida, bloqueada: !aulaLiberada(k, progresso, livre), atual: k === atual.chave,
      };
    });
    return {
      id: `i${m.numero}`, rotulo: `Módulo ${m.numero}`, titulo: m.titulo, href: `/english/${m.numero}`,
      atual: m.numero === atual.modulo || itens.some((i) => i.atual), itens,
    };
  });
  return fechar(secoes);
}
