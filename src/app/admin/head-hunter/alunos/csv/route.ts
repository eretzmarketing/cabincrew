import { NextResponse } from "next/server";
import { SITUACOES, TOTAL_INGLES, diasParaMeta, nomeAluno, nomeCompanhia, riscos, situacao, type LinhaAluno } from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";

const data = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");
const num = (v: number | null) => (v == null ? "" : String(v));

/** Exporta o painel de alunos do Head Hunter em CSV. Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });
  const { data: dados, error } = await supabase.rpc("admin_hh_alunos", { p_busca: "" });
  if (error) return new NextResponse("Rode o SQL 0035_painel_alunos.sql no Supabase.", { status: 500 });

  const linhas: string[][] = [[
    "Nome", "E-mail", "WhatsApp", "Situação", "Em risco", "Última atividade", "Dias ativos (14 dias)", "Companhia-alvo", "Data da seleção", "Dias até a seleção",
    "Aulas concluídas", "Treinos", "Média treinos 30 dias (%)", "Simulados prova real", "Melhor prova (%)", "Média provas (%)",
    `Inglês (de ${TOTAL_INGLES})`, "Sessões perfil comportamental", "Melhor vídeo (%)", "Pontos da semana", "Cadastro",
  ]];
  for (const l of (dados ?? []) as LinhaAluno[]) {
    linhas.push([
      nomeAluno(l), l.email ?? "", l.whatsapp ?? "", SITUACOES[situacao(l)].rotulo, riscos(l).join("; "), data(l.ultima), String(l.dias_14),
      nomeCompanhia(l.companhia) ?? "", l.data_meta ?? "", num(diasParaMeta(l)),
      String(l.aulas), String(l.treinos), num(l.media_treino_30), String(l.provas), num(l.melhor_prova), num(l.media_prova),
      String(l.ingles), String(l.opq), num(l.melhor_video), String(l.pontos_semana), data(l.cadastro),
    ]);
  }
  const csv = "﻿" + linhas.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="alunos-head-hunter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
