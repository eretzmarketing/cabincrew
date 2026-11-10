import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { FORMATOS, caminhoSeguro, extensao } from "@/lib/midia";

export const runtime = "nodejs";

/** Entrega os arquivos da biblioteca de mídia (com suporte a "pular" em vídeos e áudios). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ caminho: string[] }> }) {
  const { caminho } = await params;
  const relativo = caminho.join("/");
  const ext = extensao(relativo);
  const formato = FORMATOS[ext];
  const arquivo = formato && /^(imagens|videos|audios)\//.test(relativo) ? caminhoSeguro(relativo) : null;
  if (!arquivo) return new Response("Não encontrado", { status: 404 });

  let tamanho: number;
  try {
    const s = await stat(arquivo);
    if (!s.isFile()) throw new Error();
    tamanho = s.size;
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }

  const base = {
    "Content-Type": formato.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };

  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && (range[1] || range[2])) {
    let inicio = range[1] ? Number(range[1]) : tamanho - Number(range[2]);
    let fim = range[1] && range[2] ? Number(range[2]) : tamanho - 1;
    inicio = Math.max(0, inicio);
    fim = Math.min(fim, tamanho - 1);
    if (inicio > fim) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${tamanho}` } });
    const corpo = Readable.toWeb(createReadStream(arquivo, { start: inicio, end: fim })) as ReadableStream;
    return new Response(corpo, { status: 206, headers: { ...base, "Content-Range": `bytes ${inicio}-${fim}/${tamanho}`, "Content-Length": String(fim - inicio + 1) } });
  }
  const corpo = Readable.toWeb(createReadStream(arquivo)) as ReadableStream;
  return new Response(corpo, { headers: { ...base, "Content-Length": String(tamanho) } });
}
