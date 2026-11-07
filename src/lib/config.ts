import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Config = {
  forum_ativo: boolean;
  crew_select_aberto: boolean;
  manutencao: boolean;
};

const PADRAO: Config = { forum_ativo: false, crew_select_aberto: true, manutencao: false };

/** Chaves liga/desliga do site, lidas uma vez por requisição (funciona também para visitantes). */
export const getConfig = cache(async (): Promise<Config> => {
  const supabase = await createClient();
  const cfg = { ...PADRAO };
  const aplicar = (chave: string, valor: unknown) => {
    if (chave in cfg) (cfg as Record<string, unknown>)[chave] = valor === true || valor === "true";
  };

  const { data, error } = await supabase.rpc("config_publica");
  if (!error && data && typeof data === "object") {
    for (const [chave, valor] of Object.entries(data as Record<string, unknown>)) aplicar(chave, valor);
    return cfg;
  }

  // Reserva: leitura direta da tabela (antes da função existir)
  const tabela = await supabase.from("configuracoes").select("chave, valor");
  if (tabela.error) console.error("[config] não foi possível ler as configurações:", error?.message, tabela.error.message);
  for (const row of tabela.data ?? []) aplicar(row.chave, row.valor);
  return cfg;
});
