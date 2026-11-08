import { NextResponse, type NextRequest } from "next/server";
import { BANCOS } from "@/lib/crew";
import { EXEMPLOS, CABECALHO_MODELO } from "@/lib/importar-questoes";
import { getUser } from "@/lib/supabase/server";

/** Planilha-modelo (CSV que abre no Excel) para importar questões, com exemplos do banco escolhido. */

export async function GET(req: NextRequest) {
  const { profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });
  const banco = req.nextUrl.searchParams.get("banco") ?? "anac";
  if (!(banco in BANCOS)) return new NextResponse("Banco inválido", { status: 400 });

  const linhas = [
    CABECALHO_MODELO,
    ...(EXEMPLOS[banco] ?? EXEMPLOS.anac),
  ];
  const celula = (v: string) => (/[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n") + "\r\n";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modelo-questoes-${banco}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
