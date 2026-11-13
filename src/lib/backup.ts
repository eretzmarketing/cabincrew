import { readFile, readdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const PASTA_BACKUP = process.env.BACKUP_DIR || path.join(os.homedir(), "backups-banco");

/** Situação do backup diário do banco (feito pelo deploy/backup-banco.sh). */
export async function situacaoBackup(): Promise<{ configurado: false } | { configurado: true; ultimo: Date | null; tamanho: number; arquivos: number; erro: boolean }> {
  try {
    const nomes = (await readdir(PASTA_BACKUP)).filter((n) => /^banco-.*\.tar$/.test(n)).sort();
    const log = await readFile(path.join(PASTA_BACKUP, "ultimo-backup.log"), "utf8").catch(() => "");
    if (!nomes.length) return { configurado: true, ultimo: null, tamanho: 0, arquivos: 0, erro: log.includes("ERRO") };
    const s = await stat(path.join(PASTA_BACKUP, nomes[nomes.length - 1]));
    return { configurado: true, ultimo: s.mtime, tamanho: s.size, arquivos: nomes.length, erro: log.includes("ERRO") };
  } catch {
    return { configurado: false };
  }
}
