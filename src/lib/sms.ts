/**
 * SMS pelo smsmais (https://smsmais.com). O token fica só no servidor, no arquivo ~/.cabincrew-sms.json
 * (Admin › Configurações › SMS). Nunca no código nem no chat.
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const ARQUIVO_SMS = process.env.SMS_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-sms.json");
const API = () => process.env.SMSMAIS_API_BASE || "https://smsmais.com";

export type ConfigSMS = { token: string; ativo: boolean };

export function configSMS(): ConfigSMS | null {
  try {
    const j = JSON.parse(readFileSync(ARQUIVO_SMS, "utf8")) as Partial<ConfigSMS>;
    if (!j.token) return null;
    return { token: j.token, ativo: j.ativo !== false };
  } catch {
    return null;
  }
}
export const smsConfigurado = () => { const c = configSMS(); return !!c && c.ativo; };

/** Celular do Brasil no formato do smsmais: 55 + DDD + número (ex.: 5531987654321). Outros países: null. */
export function numeroSMS(tel: string | null | undefined): string | null {
  let d = String(tel ?? "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return /^55\d{10,11}$/.test(d) ? d : null;
}

export type ResultadoSMS = { ok: true; id: string; status: string } | { ok: false; erro: string };

/** Envia um SMS. Não lança erro: devolve { ok:false, erro } com uma mensagem em português. */
export async function enviarSMS(tel: string, mensagem: string, extId?: string, token?: string): Promise<ResultadoSMS> {
  const cfg = configSMS();
  const chave = token ?? cfg?.token;
  if (!chave) return { ok: false, erro: "SMS não configurado." };
  if (!token && cfg && !cfg.ativo) return { ok: false, erro: "O envio de SMS está desligado." };
  const to = numeroSMS(tel);
  if (!to) return { ok: false, erro: "Número inválido (o SMS só vai para celulares do Brasil, com DDD)." };
  const message = mensagem.trim();
  if (!message) return { ok: false, erro: "Mensagem vazia." };
  try {
    const r = await fetch(`${API()}/api/enviar_sms.php`, {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ to, message, tipo: "sms", ...(extId ? { ext_id: extId.slice(0, 60) } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    const j = (await r.json().catch(() => ({}))) as { sucesso?: boolean; id?: number | string; status?: string; erro?: string; error?: string; message?: string };
    if (r.status === 401) return { ok: false, erro: "Token do smsmais inválido ou conta bloqueada." };
    if (r.status === 403) return { ok: false, erro: "Esse número pediu para não receber SMS (opt-out)." };
    if (r.status === 402) return { ok: false, erro: "Sem saldo no smsmais." };
    if (!r.ok) return { ok: false, erro: `O smsmais recusou o envio (${r.status}${j.erro || j.error || j.message ? `: ${j.erro || j.error || j.message}` : ""}).` };
    if (j.status === "held_no_balance") return { ok: false, erro: "Sem saldo no smsmais: o SMS ficou parado até você recarregar." };
    return { ok: true, id: String(j.id ?? ""), status: String(j.status ?? "queued") };
  } catch {
    return { ok: false, erro: "Não foi possível falar com o smsmais agora." };
  }
}
