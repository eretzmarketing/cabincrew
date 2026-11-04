import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Config = {
  forum_ativo: boolean;
  crew_select_aberto: boolean;
};

const PADRAO: Config = { forum_ativo: false, crew_select_aberto: true };

/** Chaves liga/desliga do site, lidas uma vez por requisição. */
export const getConfig = cache(async (): Promise<Config> => {
  const supabase = await createClient();
  const { data } = await supabase.from("configuracoes").select("chave, valor");
  const cfg = { ...PADRAO };
  for (const row of data ?? []) {
    if (row.chave in cfg) (cfg as Record<string, unknown>)[row.chave] = row.valor;
  }
  return cfg;
});
