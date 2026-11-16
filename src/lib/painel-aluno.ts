/**
 * Resumo do aluno para a página Minha conta: cursos com progresso e validade,
 * atividades, análises de IA e compras.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { chaveAula } from "@/lib/ingles-a-bordo";
import { cursoIdioma, infoCursos, type InfoCurso } from "@/lib/cursos-dados";
import { configIA, saldoVideoIA } from "@/lib/ia-video";
import { carregarJornada } from "@/lib/jornada-dados";
import { calcularMedalhas } from "@/lib/medalhas";

export type SituacaoCurso = "ativo" | "revisao" | "encerrado" | "suspenso" | "sem";

export type CursoAluno = InfoCurso & {
  situacao: SituacaoCurso;
  expira: string | null;
  concluido: string | null;
  feitas: number;
  total: number;
};

export type Compra = { id: number; produto: string; valor: number; forma_pagamento: string | null; parcelas: number | null; status: string; comprada_em: string | null; plataforma: string | null };

export async function resumoAluno(supabase: SupabaseClient, userId: string) {
  const agora = Date.now();
  const [cursos, { data: acs }, { data: auls }, { data: prog }, { data: ing }, { data: esp }, { data: tent }, { data: compras }] = await Promise.all([
    infoCursos(),
    supabase.from("acessos").select("produto, status, expira_em, concluido_em").eq("user_id", userId),
    supabase.from("aulas").select("id, curso").eq("publicado", true),
    supabase.from("progresso").select("aula_id").eq("user_id", userId),
    supabase.from("ingles_progresso").select("aula, concluida").eq("user_id", userId),
    supabase.from("espanhol_progresso").select("aula, concluida").eq("user_id", userId),
    supabase.from("tentativas").select("nota, finalizada_em").eq("user_id", userId).not("finalizada_em", "is", null).order("finalizada_em", { ascending: false }).limit(1000),
    supabase.from("compras").select("id, produto, valor, forma_pagamento, parcelas, status, comprada_em, plataforma").eq("user_id", userId).order("comprada_em", { ascending: false }),
  ]);

  // progresso dos cursos com aulas no banco (Head Hunter e cursos criados no admin)
  const feitasIds = new Set(((prog ?? []) as { aula_id: string }[]).map((p) => p.aula_id));
  const porCurso = new Map<string, { total: number; feitas: number }>();
  for (const a of (auls ?? []) as { id: string; curso: string | null }[]) {
    const k = a.curso ?? "head-hunter";
    const m = porCurso.get(k) ?? { total: 0, feitas: 0 };
    m.total++; if (feitasIds.has(a.id)) m.feitas++;
    porCurso.set(k, m);
  }
  // cursos de idioma
  const [en, es] = await Promise.all([cursoIdioma("english"), cursoIdioma("spanish")]);
  const ok = (rows: unknown) => new Set(((rows ?? []) as { aula: string; concluida: boolean }[]).filter((x) => x.concluida).map((x) => x.aula));
  const enOk = ok(ing), esOk = ok(esp);
  porCurso.set("english", { total: en.todas.length, feitas: en.todas.filter((a) => enOk.has(chaveAula(a))).length });
  porCurso.set("spanish", { total: es.todas.length, feitas: es.todas.filter((a) => esOk.has(chaveAula(a))).length });

  const acessos = (acs ?? []) as { produto: string; status: string; expira_em: string | null; concluido_em: string | null }[];
  const lista: CursoAluno[] = cursos
    .map((c) => {
      const a = acessos.find((x) => x.produto === c.slug);
      let situacao: SituacaoCurso = "sem";
      if (a?.status === "suspenso") situacao = "suspenso";
      else if (a?.status === "ativo") situacao = a.expira_em && Date.parse(a.expira_em) < agora ? "encerrado" : a.concluido_em ? "revisao" : "ativo";
      else if (a && a.status !== "revogado") situacao = "encerrado";
      return { ...c, situacao, expira: a?.expira_em ?? null, concluido: a?.concluido_em ?? null, ...(porCurso.get(c.slug) ?? { total: 0, feitas: 0 }) };
    })
    .filter((c) => c.publicado || c.situacao !== "sem");

  const temHH = lista.some((c) => c.slug === "head-hunter" && (c.situacao === "ativo" || c.situacao === "revisao"));

  // atividades
  const notas = ((tent ?? []) as { nota: number | null }[]).map((t) => t.nota).filter((n): n is number => typeof n === "number");
  const simulados = { feitos: (tent ?? []).length, media: notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null, melhor: notas.length ? Math.round(Math.max(...notas)) : null };

  // Head Hunter: sequência de dias e medalhas
  let sequencia: number | null = null;
  let medalhas: { ganhas: number; total: number; lista: string[] } | null = null;
  if (temHH) {
    const { dados, jornada } = await carregarJornada(supabase, userId);
    sequencia = jornada.sequencia.dias;
    const m = calcularMedalhas(dados, jornada);
    medalhas = { ganhas: m.filter((x) => x.ganha).length, total: m.length, lista: m.filter((x) => x.ganha).map((x) => `${x.emoji} ${x.nome}`) };
  }

  // análises com IA (só alunos do Head Hunter)
  const cfg = configIA();
  let ia: { video: number | null; curriculo: number | null } | null = null;
  if (temHH && cfg?.ativo) {
    const [v, c] = await Promise.all([saldoVideoIA(supabase, userId, cfg.porAluno), saldoVideoIA(supabase, userId, cfg.porAlunoCv, "curriculo")]);
    ia = { video: "erro" in v ? null : v.restantes, curriculo: "erro" in c ? null : c.restantes };
  }

  return {
    cursos: lista,
    aulasFeitas: lista.reduce((s, c) => s + c.feitas, 0),
    simulados, sequencia, medalhas, ia,
    compras: ((compras ?? []) as Compra[]).map((c) => ({ ...c, valor: Number(c.valor) })),
  };
}
