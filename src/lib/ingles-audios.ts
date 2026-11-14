import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { chaveDoArquivo } from "@/lib/ingles-a-bordo";
import { PASTA_MIDIA, urlMidia } from "@/lib/midia";

/** Pasta (dentro da mídia) onde o script do ElevenLabs grava os áudios: audios/ingles/1.1-<versão>.mp3 (espanhol: audios/espanhol) */
export const PASTA_AUDIOS_INGLES = "audios/ingles";
export const PASTA_AUDIOS_ESPANHOL = "audios/espanhol";

/**
 * Áudios gerados pelo script deploy/gerar-audios.sh, lidos direto do disco.
 * Devolve chave da aula ("1.1") -> URL pública. Se houver mais de uma versão, vale a mais recente.
 */
export async function audiosGerados(sub = PASTA_AUDIOS_INGLES): Promise<Record<string, string>> {
  const pasta = path.join(PASTA_MIDIA, sub);
  let nomes: string[];
  try {
    nomes = await readdir(pasta);
  } catch {
    return {};
  }
  const melhor: Record<string, { url: string; t: number }> = {};
  for (const n of nomes) {
    if (!/^\d{1,2}\.\d{1,2}-[a-f0-9]{6,16}\.mp3$/.test(n)) continue;
    const k = chaveDoArquivo(n);
    if (!k) continue;
    const t = await stat(path.join(pasta, n)).then((s) => s.mtimeMs, () => 0);
    if (!melhor[k] || t > melhor[k].t) melhor[k] = { url: urlMidia(`${sub}/${n}`), t };
  }
  return Object.fromEntries(Object.entries(melhor).map(([k, v]) => [k, v.url]));
}
