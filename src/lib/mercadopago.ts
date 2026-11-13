import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";

/**
 * Mercado Pago (Checkout transparente: Pix e cartão na própria página).
 * Public Key, Access Token e a assinatura secreta do webhook ficam só no servidor, no arquivo
 * ~/.cabincrew-mercadopago.json (gravado pelo Admin → Configurações → Pagamentos), junto com a
 * "chave do site", usada para gravar a compra no banco sem a sessão do aluno.
 */
const API = process.env.MP_API_BASE || "https://api.mercadopago.com";
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://cabincrew.com.br").replace(/\/$/, "");
export const ARQUIVO_MP = process.env.MP_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-mercadopago.json");
export const URL_WEBHOOK = `${SITE}/api/mercadopago/webhook`;

export type ConfigMP = { publicKey: string; accessToken: string; webhookSecret?: string; chave: string; producao: boolean };

export function configMP(): ConfigMP | null {
  try {
    const j = JSON.parse(readFileSync(ARQUIVO_MP, "utf8")) as Partial<ConfigMP>;
    if (j.publicKey && j.accessToken && j.chave) return { ...j, producao: !j.accessToken.startsWith("TEST-") } as ConfigMP;
  } catch { /* sem arquivo */ }
  return null;
}

export const hashChave = (chave: string) => createHash("sha256").update(chave, "utf8").digest("hex");

async function mp(caminho: string, init?: RequestInit & { token?: string; idempotencia?: string }) {
  const token = init?.token ?? configMP()?.accessToken;
  if (!token) throw new Error("Mercado Pago não configurado");
  const r = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(init?.idempotencia ? { "X-Idempotency-Key": init.idempotencia } : {}),
    },
    signal: AbortSignal.timeout(25000), cache: "no-store",
  });
  const corpo = await r.text();
  let json: Record<string, unknown> = {};
  try { json = JSON.parse(corpo); } catch { /* vazio */ }
  if (!r.ok) {
    const msg = (json.message as string) || corpo.slice(0, 200);
    throw new Error(r.status === 401 ? "Access Token do Mercado Pago inválido" : `Mercado Pago respondeu ${r.status}: ${msg}`);
  }
  return json;
}

/** Confere um Access Token antes de salvar: devolve o apelido da conta ou o erro. */
export async function testarTokenMP(token: string): Promise<{ ok: true; conta: string } | { ok: false; erro: string }> {
  try {
    const u = await mp("/users/me", { token });
    return { ok: true, conta: String(u.nickname ?? u.email ?? u.id ?? "conta") };
  } catch (e) {
    return { ok: false, erro: (e as Error).message.slice(0, 300) };
  }
}

export type Pagamento = {
  id: number; status: string; status_detail?: string; payment_method_id?: string; payment_type_id?: string;
  transaction_amount: number; installments?: number; date_approved?: string | null; date_created?: string;
  external_reference?: string; metadata?: Record<string, unknown>;
  payer?: { identification?: { number?: string } };
  transaction_details?: { total_paid_amount?: number };
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string } };
};

export const criarPagamento = (corpo: Record<string, unknown>, idempotencia: string) =>
  mp("/v1/payments", { method: "POST", body: JSON.stringify(corpo), idempotencia }) as Promise<Pagamento>;

export const buscarPagamento = (id: string | number) => mp(`/v1/payments/${encodeURIComponent(String(id))}`) as Promise<Pagamento>;

/** external_reference dos nossos pagamentos: "cc:<produto>:<user_id>" */
export const referencia = (produto: string, userId: string) => `cc:${produto}:${userId}`;
export function lerReferencia(ref?: string) {
  const m = /^cc:([a-z0-9-]+):([0-9a-f-]{36})$/i.exec(ref ?? "");
  return m ? { produto: m[1], userId: m[2] } : null;
}

const METODO: Record<string, string> = { pix: "pix", bank_transfer: "pix", credit_card: "cartao_credito", debit_card: "cartao_debito", prepaid_card: "cartao_debito", ticket: "boleto" };
const FORMA: Record<string, string> = { pix: "Pix", cartao_credito: "cartão de crédito", cartao_debito: "cartão de débito", boleto: "boleto", outro: "outro" };
const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Cliente sem sessão (as funções do banco conferem a chave do site). */
const anonimo = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

/**
 * Grava um pagamento do Mercado Pago no livro de compras e libera (ou retira) o acesso.
 * Sempre recebe o pagamento lido direto da API do Mercado Pago, nunca dados enviados pelo navegador.
 */
export async function registrarPagamento(pg: Pagamento): Promise<{ situacao: string; erro?: string }> {
  const cfg = configMP();
  const ref = lerReferencia(pg.external_reference);
  if (!cfg || !ref) return { situacao: "ignorado" };
  const metodo = METODO[pg.payment_type_id ?? ""] ?? (pg.payment_method_id === "pix" ? "pix" : "outro");
  const supabase = anonimo();
  const { data, error } = await supabase.rpc("mp_registrar_pagamento", {
    p_chave: cfg.chave,
    p: {
      id: String(pg.id), status: pg.status, metodo, valor: pg.transaction_amount,
      total_pago: pg.transaction_details?.total_paid_amount ?? pg.transaction_amount,
      parcelas: pg.installments ?? null, user_id: ref.userId, produto: ref.produto,
      aprovado_em: pg.date_approved ?? null, cpf: pg.payer?.identification?.number ?? null,
      cupom: (pg.metadata?.cupom as string | null) ?? null, desconto_cupom: (pg.metadata?.desconto_cupom as number | null) ?? null,
    },
  });
  if (error) { console.error("[mercadopago] não foi possível registrar o pagamento", pg.id, error.message); return { situacao: "erro", erro: error.message }; }
  const r = ((data ?? []) as { situacao: string; envio_id: number | null; telefone: string | null; nome: string | null; texto: string | null }[])[0];
  if (r?.envio_id && r.telefone && r.texto) {
    const { data: prod } = await supabase.from("produtos").select("nome, endereco").eq("slug", ref.produto).maybeSingle();
    const texto = preencher(r.texto, { nome: r.nome ?? "", produto: prod?.nome ?? "Head Hunter", endereco: `${SITE}${prod?.endereco ?? "/head-hunter"}`, valor: reais(pg.transaction_amount), forma: FORMA[metodo] ?? metodo });
    const res = await enviarWhatsapp(r.telefone, texto);
    await supabase.rpc("mp_whatsapp_resultado", { p_chave: cfg.chave, p_id: r.envio_id, p_status: res.ok ? "enviada" : res.status, p_texto: texto, p_erro: res.ok ? null : res.erro });
  }
  return { situacao: r?.situacao ?? "pendente" };
}

/** Confere a assinatura do aviso (webhook) do Mercado Pago. Sem assinatura configurada, devolve null (não verificado). */
export function assinaturaValida(cabecalho: string | null, requestId: string | null, dataId: string): boolean | null {
  const segredo = configMP()?.webhookSecret;
  if (!segredo) return null;
  if (!cabecalho) return false;
  const partes = Object.fromEntries(cabecalho.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `${dataId ? `id:${dataId.toLowerCase()};` : ""}${requestId ? `request-id:${requestId};` : ""}ts:${partes.ts};`;
  const esperado = createHmac("sha256", segredo).update(manifesto).digest("hex");
  try { return timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1)); } catch { return false; }
}

/** Preço de um produto por forma de pagamento (Pix com desconto). */
export function precoPor(preco: number, descontoPix: number, metodo: "pix" | "cartao") {
  return metodo === "pix" ? Math.round(preco * (100 - descontoPix)) / 100 : Number(preco);
}
