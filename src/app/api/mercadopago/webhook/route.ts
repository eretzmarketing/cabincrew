import { NextResponse } from "next/server";
import { assinaturaValida, buscarPagamento, registrarPagamento } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

/**
 * Avisos do Mercado Pago (pagamento aprovado, reembolsado, contestado…).
 * O conteúdo do aviso não é usado: o pagamento é sempre lido de novo na API do Mercado Pago,
 * então um aviso falso não libera nada.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } };
  const tipo = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? corpo.type ?? corpo.topic ?? "";
  const id = String(url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? corpo.data?.id ?? "");
  if (tipo !== "payment" || !/^\d{1,20}$/.test(id)) return NextResponse.json({ ok: true });

  const assinatura = assinaturaValida(req.headers.get("x-signature"), req.headers.get("x-request-id"), url.searchParams.get("data.id") ?? id);
  if (assinatura === false) console.warn("[mercadopago] aviso com assinatura inválida para o pagamento", id, "(conferindo direto na API)");

  try {
    const r = await registrarPagamento(await buscarPagamento(id));
    if (r.situacao === "erro") return NextResponse.json({ ok: false }, { status: 500 }); // o Mercado Pago tenta de novo
  } catch (e) {
    console.error("[mercadopago] webhook:", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export const GET = () => NextResponse.json({ ok: true });
