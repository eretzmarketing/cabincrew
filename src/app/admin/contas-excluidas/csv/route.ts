import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

const dataHora = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");

/** Exporta o registro de contas excluídas em CSV. Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });
  const { data, error } = await supabase.from("contas_excluidas").select("*").order("excluida_em", { ascending: false }).limit(50000);
  if (error) return new NextResponse("Rode o SQL 0038_contas_excluidas.sql no Supabase.", { status: 500 });

  const linhas: string[][] = [["Excluída em (Brasília)", "Nome completo", "E-mail", "WhatsApp", "Escola", "Cadastro em (Brasília)", "Ciente de que perde o acesso sem reembolso", "IP", "Navegador", "ID da conta", "Excluída em (data e hora com fuso)"]];
  for (const l of data ?? []) {
    linhas.push([
      dataHora(l.excluida_em), l.nome ?? "", l.email ?? "", l.whatsapp ?? "", l.escola ?? "", dataHora(l.cadastro_em),
      l.ciente_sem_reembolso ? "Sim" : "Não", l.ip ?? "", l.navegador ?? "", l.user_id, l.excluida_em,
    ]);
  }
  const csv = "﻿" + linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contas-excluidas-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
