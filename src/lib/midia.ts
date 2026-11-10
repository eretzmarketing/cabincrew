import os from "node:os";
import path from "node:path";

/** Pasta no servidor onde ficam os arquivos (fora do código, para a atualização do site não apagar). */
export const PASTA_MIDIA = process.env.MIDIA_DIR || path.join(os.homedir(), "midia");

export * from "@/lib/midia-comum";

/** Resolve um caminho relativo dentro da pasta de mídia, recusando qualquer tentativa de sair dela. */
export function caminhoSeguro(relativo: string) {
  const alvo = path.resolve(PASTA_MIDIA, relativo);
  if (!alvo.startsWith(path.resolve(PASTA_MIDIA) + path.sep)) return null;
  return alvo;
}

