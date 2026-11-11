import type { SupabaseClient } from "@supabase/supabase-js";
import { diaSP, montarJornada, type Companhia, type DadosJornada } from "@/lib/jornada";
import type { PerfilOpq } from "@/lib/opq";

/** Lê tudo o que a jornada precisa. Tabelas que ainda não existem (SQL não rodado) entram vazias. */
export async function lerCheckin(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("profiles").select("alvo_companhias, data_meta").eq("id", userId).maybeSingle();
  const alvo = (data?.alvo_companhias ?? []) as unknown[];
  return {
    companhias: alvo.filter((c): c is Companhia => c === "latam" || c === "gol" || c === "azul"),
    dataMeta: (data?.data_meta as string | null) ?? null,
  };
}

export async function carregarJornada(supabase: SupabaseClient, userId: string) {
  const [mod, aul, prog, tent, sims, ing, opq, vid, anac, checkin] = await Promise.all([
    supabase.from("modulos").select("id, ordem, titulo").eq("publicado", true).order("ordem"),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo").eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id, concluida_em").eq("user_id", userId),
    supabase.from("tentativas").select("simulado_id, nota, finalizada_em").eq("user_id", userId).not("finalizada_em", "is", null).order("finalizada_em", { ascending: false }).limit(1000),
    supabase.from("simulados").select("id, origem, bancos"),
    supabase.from("ingles_progresso").select("aula, concluida, updated_at").eq("user_id", userId),
    supabase.from("opq_tentativas").select("perfil, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.from("video_treinos").select("nota, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.rpc("anac_liberado"),
    lerCheckin(supabase, userId),
  ]);
  const simulados = new Map<number, { origem: string | null; bancos: string[] }>();
  for (const s of (sims.data ?? []) as { id: number; origem: string | null; bancos: string[] }[]) simulados.set(s.id, { origem: s.origem, bancos: s.bancos ?? [] });

  const dados: DadosJornada = {
    companhias: checkin.companhias,
    anacLiberado: anac.error ? true : anac.data === true,
    modulos: (mod.data ?? []) as DadosJornada["modulos"],
    aulas: (aul.data ?? []) as DadosJornada["aulas"],
    concluidas: new Map(((prog.data ?? []) as { aula_id: string; concluida_em: string }[]).map((p) => [p.aula_id, p.concluida_em])),
    tentativas: ((tent.data ?? []) as { simulado_id: number; nota: number | null; finalizada_em: string }[]).map((t) => ({
      ...t,
      modo: simulados.get(t.simulado_id)?.origem?.startsWith("cc-treino-") ? "treino" : "prova",
    })),
    simulados,
    ingles: new Map(((ing.data ?? []) as { aula: string; concluida: boolean; updated_at: string }[]).map((x) => [x.aula, { concluida: x.concluida, updated_at: x.updated_at }])),
    opq: (opq.data ?? []) as { perfil: PerfilOpq; created_at: string }[],
    videos: (vid.data ?? []) as { nota: number; created_at: string }[],
    hoje: diaSP(new Date()),
  };
  return { dados, dataMeta: checkin.dataMeta, jornada: montarJornada(dados) };
}
