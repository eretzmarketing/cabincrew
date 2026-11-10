import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { FORMATOS, PASTA_MIDIA, extensao } from "@/lib/midia";
import { getUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 600;

const erro = (msg: string, status = 400) => NextResponse.json({ erro: msg }, { status });

/**
 * Recebe um arquivo do painel (corpo da requisição = o arquivo; nome no cabeçalho x-nome).
 * Grava em ~/midia/<tipo>/<ano-mês>/; fotos viram WebP otimizado + miniatura.
 */
export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !profile?.is_admin) return erro("Somente administradores.", 403);

  const nome = decodeURIComponent(req.headers.get("x-nome") ?? "").slice(0, 200) || "arquivo";
  const pasta = decodeURIComponent(req.headers.get("x-pasta") ?? "").trim().slice(0, 60) || null;
  const ext = extensao(nome);
  const formato = FORMATOS[ext];
  if (!formato) return erro(`Formato .${ext || "?"} não aceito. Use JPG, PNG, WebP, GIF, MP4, WebM, MOV, MP3, M4A, WAV, OGG ou AAC.`);
  const limite = formato.max * 1024 * 1024;
  const declarado = Number(req.headers.get("content-length") || 0);
  if (declarado > limite) return erro(`Arquivo grande demais (máximo ${formato.max} MB para esse tipo).`, 413);
  if (!req.body) return erro("Arquivo vazio.");

  const mes = new Date().toISOString().slice(0, 7);
  const sub = { imagem: "imagens", video: "videos", audio: "audios" }[formato.tipo];
  const dir = path.join(PASTA_MIDIA, sub, mes);
  await mkdir(dir, { recursive: true });
  const id = randomBytes(8).toString("hex");
  const temp = path.join(dir, `.${id}.envio`);

  // grava em partes, contando o tamanho (não confia só no cabeçalho)
  let recebido = 0;
  const corpo = Readable.fromWeb(req.body as import("node:stream/web").ReadableStream);
  corpo.on("data", (c: Buffer) => {
    recebido += c.length;
    if (recebido > limite) corpo.destroy(new Error("grande"));
  });
  try {
    await pipeline(corpo, createWriteStream(temp));
  } catch {
    await rm(temp, { force: true });
    return erro(recebido > limite ? `Arquivo grande demais (máximo ${formato.max} MB).` : "O envio foi interrompido. Tente de novo.", recebido > limite ? 413 : 400);
  }
  if (!recebido) {
    await rm(temp, { force: true });
    return erro("Arquivo vazio.");
  }

  let arquivo: string;
  let miniatura: string | null = null;
  let mime = formato.mime;
  let tamanho = recebido;
  let largura: number | null = null;
  let altura: number | null = null;

  try {
    if (formato.tipo === "imagem" && ext !== "gif") {
      // foto otimizada (até 2560 px) + miniatura de 480 px, sempre em WebP
      const final = path.join(dir, `${id}.webp`);
      const mini = path.join(dir, `${id}-mini.webp`);
      const info = await sharp(temp).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(final);
      await sharp(temp).rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 75 }).toFile(mini);
      await rm(temp, { force: true });
      arquivo = `${sub}/${mes}/${id}.webp`;
      miniatura = `${sub}/${mes}/${id}-mini.webp`;
      mime = "image/webp";
      tamanho = info.size;
      largura = info.width;
      altura = info.height;
    } else {
      const final = path.join(dir, `${id}.${ext}`);
      await rename(temp, final);
      arquivo = `${sub}/${mes}/${id}.${ext}`;
      if (formato.tipo === "imagem") {
        const meta = await sharp(final).metadata();
        largura = meta.width ?? null;
        altura = meta.height ?? null;
      }
      tamanho = (await stat(final)).size;
    }
  } catch {
    await rm(temp, { force: true });
    return erro("Não conseguimos ler esse arquivo. Ele pode estar corrompido.");
  }

  const titulo = nome.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 120);
  const { data, error } = await supabase
    .from("midias")
    .insert({ tipo: formato.tipo, arquivo, miniatura, nome, titulo, pasta, mime, tamanho, largura, altura, criado_por: user.id })
    .select("*")
    .single();
  if (error) {
    await rm(path.join(PASTA_MIDIA, arquivo), { force: true });
    if (miniatura) await rm(path.join(PASTA_MIDIA, miniatura), { force: true });
    return erro(error.code === "42P01" ? "Falta rodar o SQL 0021_midias.sql no Supabase." : "Não foi possível registrar o arquivo.", 500);
  }
  return NextResponse.json({ midia: data });
}
