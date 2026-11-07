import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { paisPorIso } from "@/lib/paises";

/** Exporta a lista de interesse em CSV. Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });

  const linhas: string[][] = [["Nome", "WhatsApp", "País", "Data"]];
  for (let de = 0; ; de += 1000) {
    const { data } = await supabase.from("interessados").select("nome, telefone, pais, created_at").order("created_at").range(de, de + 999);
    if (!data?.length) break;
    for (const i of data) {
      linhas.push([i.nome, i.telefone, paisPorIso(i.pais)?.nome ?? i.pais, new Date(i.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })]);
    }
    if (data.length < 1000) break;
  }

  const celula = (v: string) => {
    const s = /^[=@]|^[+-](?!\d)/.test(v) ? `'${v}` : v;
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cabincrew-lista-de-interesse-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
