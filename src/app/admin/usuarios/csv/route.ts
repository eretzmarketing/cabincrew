import { NextResponse } from "next/server";
import { separarTelefoneServidor } from "@/lib/paises";
import { getUser } from "@/lib/supabase/server";

type Linha = {
  nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; cadastro: string; ultimo_acesso: string | null;
  administrador: boolean; bloqueado: boolean; tem_foto: boolean; acesso_anac: boolean;
  aulas_concluidas: number; simulados_entregues: number; media_simulados: number | null; simulados_anac: number; media_anac: number | null; melhor_anac: number | null;
};

const data = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");
const simNao = (v: boolean) => (v ? "sim" : "não");

/** Exporta todos os usuários em CSV (abre no Excel e no Google Planilhas). Somente administradores. */
export async function GET() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return new NextResponse("Acesso negado", { status: 403 });

  let linhas: string[][];
  const { data: todos, error } = await supabase.rpc("admin_exportar_usuarios");
  if (!error) {
    linhas = [[
      "Nome", "E-mail", "WhatsApp", "País", "Escola", "Cadastro", "Último acesso", "Tipo", "Situação", "Foto de perfil",
      "Acesso Simulados ANAC", "Aulas concluídas", "Simulados entregues", "Média nos simulados (%)", "Simulados ANAC", "Média ANAC (%)", "Melhor nota ANAC (%)",
    ]];
    for (const u of (todos ?? []) as Linha[]) {
      linhas.push([
        u.nome ?? "", u.email ?? "", u.whatsapp ?? "", u.whatsapp ? separarTelefoneServidor(u.whatsapp) : "", u.escola ?? "",
        data(u.cadastro), data(u.ultimo_acesso), u.administrador ? "administrador" : "aluno", u.bloqueado ? "bloqueado" : "ativo",
        simNao(u.tem_foto), simNao(u.acesso_anac), String(u.aulas_concluidas), String(u.simulados_entregues),
        u.media_simulados == null ? "" : String(u.media_simulados), String(u.simulados_anac),
        u.media_anac == null ? "" : String(u.media_anac), u.melhor_anac == null ? "" : String(u.melhor_anac),
      ]);
    }
  } else {
    // antes de rodar o SQL 0019: exportação básica
    linhas = [["Nome", "WhatsApp", "Escola", "Data do cadastro"]];
    for (let de = 0; ; de += 1000) {
      const { data: d } = await supabase.from("profiles").select("nome, whatsapp, escola, created_at").order("created_at").range(de, de + 999);
      if (!d?.length) break;
      for (const u of d) linhas.push([u.nome ?? "", u.whatsapp ?? "", u.escola ?? "", data(u.created_at)]);
      if (d.length < 1000) break;
    }
  }

  // Excel em português usa ponto e vírgula; o BOM garante os acentos
  const celula = (v: string) => {
    const s = /^[=@]|^[+-](?!\d)/.test(v) ? `'${v}` : v; // evita fórmulas injetadas no Excel (telefones ficam intactos)
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  const dia = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cabincrew-usuarios-${dia}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
