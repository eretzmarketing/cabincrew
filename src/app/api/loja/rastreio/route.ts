import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { configMP } from "@/lib/mercadopago";
import { atualizarEntregas } from "@/lib/rastreio-loja";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Chamado pelo agendamento do servidor (scripts/rastreio-loja.mjs), com a chave do site. */
export async function POST(req: Request) {
  const chave = configMP()?.chave;
  const enviada = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = !!chave && enviada.length === chave.length && timingSafeEqual(Buffer.from(enviada), Buffer.from(chave));
  if (!ok) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  return NextResponse.json(await atualizarEntregas());
}
