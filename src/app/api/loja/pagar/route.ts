import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { configMP, criarPagamento, registrarPagamento, URL_WEBHOOK } from "@/lib/mercadopago";
import { referenciaLoja, type PedidoLoja } from "@/lib/loja";
import { VERSAO_LEGAL } from "@/lib/legal";
import { getUser } from "@/lib/supabase/server";
import { normalizarTelefone } from "@/lib/telefone";

export const dynamic = "force-dynamic";

const so = (s: unknown) => String(s ?? "").replace(/\D/g, "");

function expiraEm30min() {
  const d = new Date(Date.now() + 30 * 60000 - 3 * 3600000);
  return d.toISOString().replace("Z", "-03:00");
}

/** Compra na loja: cria o pedido (preço calculado no banco) e o pagamento no Mercado Pago. */
export async function POST(req: Request) {
  const cfg = configMP();
  if (!cfg) return NextResponse.json({ erro: "Pagamentos ainda não configurados. Fale com a Cabin Crew." }, { status: 503 });
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ erro: "Entre na sua conta para comprar." }, { status: 401 });

  const corpo = (await req.json().catch(() => ({}))) as {
    produto?: string; quantidade?: number; entrega?: Record<string, unknown>; metodo?: string; cpf?: string; aceite?: string; cartao?: Record<string, unknown>; cupom?: string | null;
  };
  if (corpo.aceite !== VERSAO_LEGAL) return NextResponse.json({ erro: "Aceite os Termos de Uso e a Política de Reembolso para continuar." }, { status: 400 });
  const entrega = corpo.entrega ?? {};
  if (!normalizarTelefone(String(entrega.telefone ?? ""))) return NextResponse.json({ erro: "Informe um WhatsApp com DDD." }, { status: 400 });
  // CPF de quem paga (Pix) e de quem recebe (etiqueta dos Correios) podem ser diferentes
  const cpf = so(corpo.cpf);
  const cpfEntrega = so(String(entrega.cpf ?? ""));

  const { data, error } = await supabase.rpc("loja_criar_pedido", {
    p_produto: String(corpo.produto ?? ""), p_quantidade: Number(corpo.quantidade) || 1,
    p_dados: { ...entrega, cpf: cpfEntrega, telefone: normalizarTelefone(String(entrega.telefone ?? "")) },
    p_cupom: corpo.cupom ? String(corpo.cupom).slice(0, 30) : null,
  });
  if (error || !data) return NextResponse.json({ erro: error?.message?.includes("loja_criar_pedido") ? "Rode o SQL 0056_cupom_loja.sql no Supabase." : error?.message || "Não foi possível criar o pedido." }, { status: 400 });
  const pedido = data as PedidoLoja;

  const h = req.headers;
  const registrarAceite = (ref: string | number) => supabase.from("aceites").insert({
    user_id: user.id, email: user.email, documentos: ["termos", "reembolso", "privacidade"], versao: VERSAO_LEGAL, contexto: "checkout", produto: `loja:${pedido.produto}`, ref: String(ref),
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 100) || null, navegador: (h.get("user-agent") ?? "").slice(0, 300) || null,
  });
  const [primeiro, ...resto] = pedido.nome.trim().split(" ");
  const base = {
    description: `${pedido.quantidade > 1 ? `${pedido.quantidade}x ` : ""}${pedido.produto_nome}`.slice(0, 250),
    external_reference: referenciaLoja(pedido.id, user.id), notification_url: URL_WEBHOOK, statement_descriptor: "CABINCREW",
    metadata: { loja_pedido: pedido.id, user_id: user.id },
  };
  const ligar = (mpId: number, metodo: string) =>
    supabase.rpc("loja_ligar_pagamento", { p_chave: cfg.chave, p_pedido: pedido.id, p_mp: String(mpId), p_metodo: metodo });

  try {
    if (corpo.metodo === "pix") {
      if (cpf.length !== 11) return NextResponse.json({ erro: "Informe um CPF válido." }, { status: 400 });
      const pg = await criarPagamento({
        ...base, transaction_amount: Number(pedido.total_pix), payment_method_id: "pix", date_of_expiration: expiraEm30min(),
        payer: { email: user.email, first_name: primeiro || undefined, last_name: resto.join(" ") || undefined, identification: { type: "CPF", number: cpf } },
      }, randomUUID());
      await Promise.all([registrarAceite(pg.id), ligar(pg.id, "pix")]);
      const t = pg.point_of_interaction?.transaction_data;
      return NextResponse.json({ id: pg.id, status: pg.status, pedido: pedido.id, pix: { codigo: t?.qr_code, imagem: t?.qr_code_base64, link: t?.ticket_url }, valor: pg.transaction_amount });
    }
    if (corpo.metodo === "cartao" && corpo.cartao) {
      const c = corpo.cartao as { token?: string; issuer_id?: string | number; payment_method_id?: string; installments?: number; payer?: { email?: string; identification?: { type?: string; number?: string } } };
      if (!c.token || !c.payment_method_id) return NextResponse.json({ erro: "Dados do cartão incompletos." }, { status: 400 });
      const pg = await criarPagamento({
        ...base, transaction_amount: Number(pedido.total), token: c.token, installments: Math.max(1, Math.min(12, Number(c.installments) || 1)),
        payment_method_id: c.payment_method_id, issuer_id: c.issuer_id ? Number(c.issuer_id) : undefined,
        payer: { email: c.payer?.email || user.email, first_name: primeiro || undefined, last_name: resto.join(" ") || undefined, identification: c.payer?.identification },
      }, randomUUID());
      await Promise.all([registrarAceite(pg.id), ligar(pg.id, "cartao_credito")]);
      if (pg.status === "approved" || pg.status === "authorized") await registrarPagamento(pg);
      return NextResponse.json({
        id: pg.id, status: pg.status, pedido: pedido.id,
        mensagem: pg.status === "rejected" ? "Pagamento recusado pelo banco. Confira os dados, tente outro cartão ou use o Pix." : undefined,
      });
    }
    return NextResponse.json({ erro: "Forma de pagamento inválida." }, { status: 400 });
  } catch (e) {
    console.error("[loja] erro ao criar pagamento:", (e as Error).message);
    return NextResponse.json({ erro: "Não foi possível falar com o Mercado Pago agora. Tente de novo em instantes." }, { status: 502 });
  }
}
