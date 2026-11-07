import { NextResponse, type NextRequest } from "next/server";
import { BANCOS, type Alternativa } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

/** Exporta as questões de um banco em CSV (abre no Excel). Somente administradores. */
export async function GET(req: NextRequest) {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });
  const banco = req.nextUrl.searchParams.get("banco") ?? "anac";
  if (!(banco in BANCOS)) return new NextResponse("Banco inválido", { status: 400 });

  const linhas: string[][] = [["id", "tema", "texto de apoio", "enunciado", "imagem", "A", "B", "C", "D", "E", "correta", "explicação", "nos simulados"]];
  for (let de = 0; ; de += 1000) {
    const { data } = await supabase
      .from("questoes")
      .select("id, categoria, contexto, enunciado, imagem_url, alternativas, correta, explicacao, ativo")
      .eq("banco", banco).order("categoria").order("enunciado").order("id").range(de, de + 999);
    if (!data?.length) break;
    for (const q of data) {
      const alt = (l: string) => {
        const a = (q.alternativas as Alternativa[]).find((x) => x.letra === l);
        return [a?.texto, a?.imagem_url].filter(Boolean).join(" ");
      };
      linhas.push([q.id, q.categoria ?? "", q.contexto ?? "", q.enunciado, q.imagem_url ?? "", alt("A"), alt("B"), alt("C"), alt("D"), alt("E"), q.correta ?? "", q.explicacao ?? "", q.ativo ? "sim" : "não"]);
    }
    if (data.length < 1000) break;
  }

  const celula = (v: string) => {
    const s = /^[=@]|^[+-](?!\d)/.test(v) ? `'${v}` : v;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="questoes-${banco}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
