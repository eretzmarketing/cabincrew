import { createClient } from "@/lib/supabase/server";
import { ESCOLAS } from "@/lib/escolas";

/** Escolas do cadastro: vêm da tabela `escolas` (Configurações › Escolas). Se o SQL 0076 não rodou, usa a lista do código. */
export async function listaEscolas(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("escolas").select("nome").order("nome").limit(5000);
  if (error) return ESCOLAS;
  return (data ?? []).map((e) => e.nome as string).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
