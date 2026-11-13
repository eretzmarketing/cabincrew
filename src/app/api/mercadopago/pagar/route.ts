import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { configMP, criarPagamento, precoPor, referencia, registrarPagamento, URL_WEBHOOK } from "@/lib/mercadopago";
import { cursosDoAluno } from "@/lib/crew-gate";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const RECUSA: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo ou limite insuficiente no cartão.",
  cc_rejected_bad_filled_security_code: "Código de segurança (CVV) incorreto.",
  cc_rejected_bad_filled_date: "Data de validade incorreta.",
  cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
  cc_rejected_bad_filled_other: "Confira os dados do cartão.",
  cc_rejected_call_for_authorize: "O banco pediu autorização: ligue para o seu banco e tente de novo.",
  cc_rejected_card_disabled: "Cartão desativado: ative com o seu banco ou use outro cartão.",
  cc_rejected_duplicated_payment: "Você já fez um pagamento com esse valor. Se precisar pagar de novo, use outro cartão ou o Pix.",
  cc_rejected_high_risk: "Pagamento recusado por segurança. Tente o Pix ou outro cartão.",
  cc_rejected_max_attempts: "Muitas tentativas. Use outro cartão ou o Pix.",
  cc_rejected_blacklist: "Pagamento recusado. Use outro cartão ou o Pix.",
  cc_rejected_insufficient_data: "Faltaram dados obrigatórios. Confira o CPF e os dados do cartão.",
};

const so = (s: unknown) => String(s ?? "").replace(/\D/g, "");

/** Expira em 30 minutos, no fuso de Brasília (formato aceito pelo Mercado Pago). */
function expiraEm30min() {
  const d = new Date(Date.now() + 30 * 60000 - 3 * 3600000);
  return d.toISOString().replace("Z", "-03:00");
}

export async function POST(req: Request) {
  const cfg = configMP();
  if (!cfg) return NextResponse.json({ erro: "Pagamentos ainda não configurados. Fale com a Cabin Crew." }, { status: 503 });
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) return NextResponse.json({ erro: "Entre na sua conta para comprar." }, { status: 401 });

  const corpo = (await req.json().catch(() => ({}))) as { produto?: string; metodo?: string; cpf?: string; cartao?: Record<string, unknown> };
  const slug = corpo.produto ?? "head-hunter";
  const { data: prod } = await supabase.from("produtos").select("*").eq("slug", slug).maybeSingle();
  if (!prod?.ativo || prod.excluido) return NextResponse.json({ erro: "Produto indisponível." }, { status: 404 });
  const ativos = await cursosDoAluno(supabase, user.id);
  if (((prod.inclui as string[] | null) ?? [slug]).every((c) => ativos.has(c))) return NextResponse.json({ erro: `Você já tem acesso a ${prod.nome}.` }, { status: 409 });

  const nome = String(profile.nome || profile.apelido || "").trim();
  const [primeiro, ...resto] = nome.split(" ");
  const base = {
    description: prod.nome, external_reference: referencia(slug, user.id), notification_url: URL_WEBHOOK,
    statement_descriptor: "CABINCREW", metadata: { produto: slug, user_id: user.id },
  };

  try {
    if (corpo.metodo === "pix") {
      const cpf = so(corpo.cpf);
      if (cpf.length !== 11) return NextResponse.json({ erro: "Informe um CPF válido." }, { status: 400 });
      const pg = await criarPagamento({
        ...base, transaction_amount: precoPor(Number(prod.preco), Number(prod.desconto_pix), "pix"), payment_method_id: "pix",
        date_of_expiration: expiraEm30min(),
        payer: { email: user.email, first_name: primeiro || undefined, last_name: resto.join(" ") || undefined, identification: { type: "CPF", number: cpf } },
      }, randomUUID());
      const t = pg.point_of_interaction?.transaction_data;
      return NextResponse.json({ id: pg.id, status: pg.status, pix: { codigo: t?.qr_code, imagem: t?.qr_code_base64, link: t?.ticket_url }, valor: pg.transaction_amount });
    }

    if (corpo.metodo === "cartao" && corpo.cartao) {
      const c = corpo.cartao as { token?: string; issuer_id?: string | number; payment_method_id?: string; installments?: number; payer?: { email?: string; identification?: { type?: string; number?: string } } };
      if (!c.token || !c.payment_method_id) return NextResponse.json({ erro: "Dados do cartão incompletos." }, { status: 400 });
      const pg = await criarPagamento({
        ...base, transaction_amount: precoPor(Number(prod.preco), Number(prod.desconto_pix), "cartao"),
        token: c.token, installments: Math.max(1, Math.min(12, Number(c.installments) || 1)), payment_method_id: c.payment_method_id,
        issuer_id: c.issuer_id ? Number(c.issuer_id) : undefined,
        payer: { email: c.payer?.email || user.email, first_name: primeiro || undefined, last_name: resto.join(" ") || undefined, identification: c.payer?.identification },
      }, randomUUID());
      if (pg.status === "approved" || pg.status === "authorized") await registrarPagamento(pg);
      return NextResponse.json({
        id: pg.id, status: pg.status,
        mensagem: pg.status === "rejected" ? RECUSA[pg.status_detail ?? ""] ?? "Pagamento recusado pelo banco. Tente outro cartão ou o Pix." : undefined,
      });
    }
    return NextResponse.json({ erro: "Forma de pagamento inválida." }, { status: 400 });
  } catch (e) {
    console.error("[mercadopago] erro ao criar pagamento:", (e as Error).message);
    return NextResponse.json({ erro: "Não foi possível falar com o Mercado Pago agora. Tente de novo em instantes." }, { status: 502 });
  }
}
