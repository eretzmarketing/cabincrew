import { NextResponse } from "next/server";
import { validarCupom } from "@/lib/cupons-servidor";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Confere um cupom para um plano (campo de cupom do checkout). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const produto = u.searchParams.get("produto") ?? "";
  if (!/^[a-z0-9-]{2,40}$/.test(produto)) return NextResponse.json({ erro: "Plano inválido." }, { status: 400 });
  const { supabase } = await getUser();
  const r = await validarCupom(supabase, u.searchParams.get("codigo"), produto);
  return NextResponse.json(r.cupom ? { cupom: r.cupom } : { erro: r.erro ?? "Informe o cupom." });
}
