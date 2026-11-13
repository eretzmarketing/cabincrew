import { NextResponse } from "next/server";
import { buscarPagamento, lerReferencia, registrarPagamento } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Situação de um pagamento do próprio aluno (a página do Pix consulta enquanto espera). */
export async function GET(req: Request) {
  const { user } = await getUser();
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!user || !/^\d{1,20}$/.test(id)) return NextResponse.json({ erro: "inválido" }, { status: 400 });
  try {
    const pg = await buscarPagamento(id);
    if (lerReferencia(pg.external_reference)?.userId !== user.id) return NextResponse.json({ erro: "inválido" }, { status: 404 });
    if (pg.status !== "pending" && pg.status !== "in_process") await registrarPagamento(pg);
    return NextResponse.json({ status: pg.status });
  } catch {
    return NextResponse.json({ status: "desconhecido" });
  }
}
