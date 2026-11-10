/** Partes da biblioteca de mídia que servem no navegador e no servidor. */

export type TipoMidia = "imagem" | "video" | "audio";

/** Formatos aceitos (sem SVG, que pode conter código). */
export const FORMATOS: Record<string, { tipo: TipoMidia; mime: string; max: number }> = {
  jpg: { tipo: "imagem", mime: "image/jpeg", max: 25 },
  jpeg: { tipo: "imagem", mime: "image/jpeg", max: 25 },
  png: { tipo: "imagem", mime: "image/png", max: 25 },
  webp: { tipo: "imagem", mime: "image/webp", max: 25 },
  gif: { tipo: "imagem", mime: "image/gif", max: 25 },
  mp4: { tipo: "video", mime: "video/mp4", max: 500 },
  webm: { tipo: "video", mime: "video/webm", max: 500 },
  mov: { tipo: "video", mime: "video/quicktime", max: 500 },
  mp3: { tipo: "audio", mime: "audio/mpeg", max: 100 },
  m4a: { tipo: "audio", mime: "audio/mp4", max: 100 },
  wav: { tipo: "audio", mime: "audio/wav", max: 100 },
  ogg: { tipo: "audio", mime: "audio/ogg", max: 100 },
  aac: { tipo: "audio", mime: "audio/aac", max: 100 },
  opus: { tipo: "audio", mime: "audio/ogg", max: 100 },
};

export const extensao = (nome: string) => nome.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";

/** Endereço público do arquivo no site. */
export const urlMidia = (arquivo: string) => `/midia/${arquivo}`;

export function tamanhoLegivel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2).replace(".", ",")} GB`;
}
