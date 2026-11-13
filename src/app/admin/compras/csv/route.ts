import { NextResponse } from "next/server";
import { FORMAS, STATUS_COMPRA, fimArrependimento, type Compra } from "@/lib/compras";
import { getUser } from "@/lib/supabase/server";

const dh = (v: string | Date | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");

/** Exporta o livro de compras em CSV. Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });
  const { data, error } = await supabase.from("compras").select("*").order("comprada_em", { ascending: false }).limit(50000);
  if (error) return new NextResponse("Rode o SQL 0039_compras.sql no Supabase.", { status: 500 });
  const linhas: string[][] = [["Nº", "Data e hora da compra (Brasília)", "Fim do prazo de arrependimento (Brasília)", "Acesso liberado em", "Comprador", "E-mail", "WhatsApp", "CPF/CNPJ",
    "Produto", "Valor", "Moeda", "Forma de pagamento", "Parcelas", "Plataforma", "ID da transação", "Status", "Observação", "ID da conta", "Lançado em", "Compra (data e hora com fuso)"]];
  for (const c of (data ?? []) as Compra[]) {
    linhas.push([String(c.id), dh(c.comprada_em), dh(fimArrependimento(c.comprada_em)), dh(c.liberada_em), c.nome, c.email ?? "", c.whatsapp ?? "", c.documento ?? "",
      c.produto, Number(c.valor).toFixed(2).replace(".", ","), c.moeda, FORMAS[c.forma_pagamento] ?? c.forma_pagamento, c.parcelas ? String(c.parcelas) : "", c.plataforma,
      c.id_transacao ?? "", STATUS_COMPRA[c.status]?.rotulo ?? c.status, c.observacao ?? "", c.user_id ?? "", dh(c.created_at), c.comprada_em]);
  }
  const csv = "﻿" + linhas.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="compras-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
