import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { PASTA_MIDIA } from "@/lib/midia";
import { getUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX = 20 * 1024 * 1024;

/** Imagem de fundo do certificado (corpo = o arquivo). Fica em alta: até 3508 px (A4 a 300 dpi). */
export async function POST(req: NextRequest) {
  const { user, profile } = await getUser();
  if (!user || !profile?.is_admin) return NextResponse.json({ erro: "Somente administradores." }, { status: 403 });
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return NextResponse.json({ erro: "Arquivo vazio." }, { status: 400 });
  if (buf.length > MAX) return NextResponse.json({ erro: "Imagem grande demais (máximo 20 MB)." }, { status: 413 });
  const dir = path.join(PASTA_MIDIA, "imagens", "certificados");
  await mkdir(dir, { recursive: true });
  const nome = `${randomBytes(8).toString("hex")}.jpg`;
  try {
    const info = await sharp(buf).rotate().resize({ width: 3508, height: 3508, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, nome));
    return NextResponse.json({ caminho: `imagens/certificados/${nome}`, largura: info.width, altura: info.height });
  } catch {
    return NextResponse.json({ erro: "Não consegui ler essa imagem. Use JPG, PNG ou WebP." }, { status: 400 });
  }
}
