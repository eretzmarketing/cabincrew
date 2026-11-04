import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

/** Exporta todos os cadastros em CSV (abre no Excel e no Google Planilhas). Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });

  const linhas: string[][] = [["Nome", "WhatsApp", "Escola", "Apelido", "Pontos", "Data do cadastro"]];
  for (let de = 0; ; de += 1000) {
    const { data } = await supabase
      .from("profiles")
      .select("nome, whatsapp, escola, apelido, pontos, created_at")
      .order("created_at", { ascending: true })
      .range(de, de + 999);
    if (!data?.length) break;
    for (const u of data) {
      linhas.push([u.nome ?? "", u.whatsapp ?? "", u.escola ?? "", u.apelido ?? "", String(u.pontos), new Date(u.created_at).toLocaleString("pt-BR")]);
    }
    if (data.length < 1000) break;
  }

  // Excel em português usa ponto e vírgula; o BOM garante os acentos
  const celula = (v: string) => {
    const s = /^[=@]|^[+-](?!\d)/.test(v) ? `'${v}` : v; // evita fórmulas injetadas no Excel (telefones ficam intactos)
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  const data = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cabincrew-cadastros-${data}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
