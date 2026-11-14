import { readdir } from "node:fs/promises";
import path from "node:path";
import { PASTA_MIDIA, urlMidia } from "@/lib/midia";

/** Pasta (dentro da mídia) onde o gerador grava a narração das aulas do Head Hunter: <id da aula>-<versão>.mp3 */
export const PASTA_AUDIOS_AULAS = "audios/head-hunter";

/** Endereço da narração de uma aula, se ela já foi gerada. */
export async function audioDaAula(id: string): Promise<string | null> {
  try {
    const nome = (await readdir(path.join(PASTA_MIDIA, PASTA_AUDIOS_AULAS))).find((n) => n.startsWith(`${id}-`) && n.endsWith(".mp3"));
    return nome ? urlMidia(`${PASTA_AUDIOS_AULAS}/${nome}`) : null;
  } catch {
    return null;
  }
}
