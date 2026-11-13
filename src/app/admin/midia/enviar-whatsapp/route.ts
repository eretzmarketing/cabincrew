import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { PASTA_MIDIA } from "@/lib/midia";
import { getUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX = 10 * 1024 * 1024;

/**
 * Imagem de campanha de WhatsApp (corpo da requisição = o arquivo).
 * O WhatsApp só aceita JPG ou PNG: tudo vira JPG de até 1600 px em ~/midia/imagens/whatsapp/.
 */
export async function POST(req: NextRequest) {
  const { user, profile } = await getUser();
  if (!user || !profile?.is_admin) return NextResponse.json({ erro: "Somente administradores." }, { status: 403 });
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return NextResponse.json({ erro: "Arquivo vazio." }, { status: 400 });
  if (buf.length > MAX) return NextResponse.json({ erro: "Imagem grande demais (máximo 10 MB)." }, { status: 413 });
  const dir = path.join(PASTA_MIDIA, "imagens", "whatsapp");
  await mkdir(dir, { recursive: true });
  const nome = `${randomBytes(8).toString("hex")}.jpg`;
  try {
    await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(dir, nome));
  } catch {
    return NextResponse.json({ erro: "Não consegui ler essa imagem. Use JPG, PNG ou WebP." }, { status: 400 });
  }
  return NextResponse.json({ caminho: `imagens/whatsapp/${nome}` });
}
