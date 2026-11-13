import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after } from "next/server";

/**
 * WhatsApp pelo Wawp (https://api.wawp.net). O ID da instância e o token ficam só no servidor:
 * no arquivo ~/.cabincrew-whatsapp.json (gravado pelo Admin → WhatsApp, só o usuário do site lê)
 * ou, se ele não existir, em .env.local (WAWP_INSTANCE_ID e WAWP_ACCESS_TOKEN).
 */
const API = process.env.WAWP_API_BASE || "https://api.wawp.net";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://cabincrew.com.br").replace(/\/$/, "");
export const ARQUIVO_CONEXAO = process.env.WAWP_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-whatsapp.json");

export type Conexao = { instancia: string; token: string; origem: "painel" | "servidor" };

/** Credenciais atuais do Wawp (arquivo do painel primeiro; depois .env.local). */
export function conexaoWhatsapp(): Conexao | null {
  try {
    const j = JSON.parse(readFileSync(ARQUIVO_CONEXAO, "utf8")) as { instancia?: string; token?: string };
    if (j.instancia && j.token) return { instancia: j.instancia, token: j.token, origem: "painel" };
  } catch { /* sem arquivo */ }
  const instancia = process.env.WAWP_INSTANCE_ID ?? "", token = process.env.WAWP_ACCESS_TOKEN ?? "";
  return instancia && token ? { instancia, token, origem: "servidor" } : null;
}

export const whatsappConfigurado = () => !!conexaoWhatsapp();

export type ResultadoEnvio = { ok: true } | { ok: false; status: "erro" | "sem_whatsapp"; erro: string };

async function chamar(caminho: string, init?: RequestInit, con: Conexao | null = conexaoWhatsapp()) {
  if (!con) throw new Error("WhatsApp não configurado");
  const url = `${API}${caminho}${caminho.includes("?") ? "&" : "?"}instance_id=${encodeURIComponent(con.instancia)}&access_token=${encodeURIComponent(con.token)}`;
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(20000), cache: "no-store" });
  const corpo = await r.text();
  if (!r.ok) {
    const motivo = r.status === 401 ? "token do Wawp inválido" : r.status === 404 ? "instância do Wawp não encontrada ou desconectada" : r.status === 429 ? "limite de envios do Wawp atingido" : `Wawp respondeu ${r.status}`;
    throw new Error(`${motivo}${corpo ? `: ${corpo.slice(0, 200)}` : ""}`);
  }
  try { return JSON.parse(corpo); } catch { return {}; }
}

/** Testa um ID e token antes de salvar: devolve null se o Wawp aceitou, ou o motivo do erro. */
export async function testarConexao(instancia: string, token: string): Promise<string | null> {
  try {
    await chamar("/v2/contacts/check-exists?phone=5511999999999", undefined, { instancia, token, origem: "painel" });
    return null;
  } catch (e) {
    return (e as Error).message.slice(0, 300);
  }
}

/** Envia um texto para um número (com DDI, ex.: +5511999999999). Confere antes se o número tem WhatsApp. */
export async function enviarWhatsapp(telefone: string, texto: string): Promise<ResultadoEnvio> {
  if (!whatsappConfigurado()) return { ok: false, status: "erro", erro: "WhatsApp não configurado no servidor" };
  const numero = telefone.replace(/\D/g, "");
  if (numero.length < 10) return { ok: false, status: "sem_whatsapp", erro: "número inválido" };
  try {
    const c = (await chamar(`/v2/contacts/check-exists?phone=${numero}`)) as { exists?: boolean; jid?: string };
    if (c.exists === false) return { ok: false, status: "sem_whatsapp", erro: "este número não tem WhatsApp" };
    const chatId = c.jid && c.jid.endsWith("@c.us") ? c.jid : `${numero}@c.us`;
    await chamar("/v2/send/text", { method: "POST", body: JSON.stringify({ chatId, message: texto.slice(0, 4000) }) });
    return { ok: true };
  } catch (e) {
    return { ok: false, status: "erro", erro: (e as Error).message.slice(0, 400) };
  }
}

/** Troca {nome}, {link} e outras variáveis do modelo. */
export function preencher(texto: string, vars: Record<string, string | number | undefined>) {
  return texto.replace(/\{(\w+)\}/g, (_, k: string) => (k === "link" ? SITE : String(vars[k] ?? ""))).trim();
}

/**
 * Aviso automático para o aluno logado (boas-vindas, módulo concluído…).
 * Roda depois da resposta (não atrasa a página), uma única vez por evento/ref, e só se o aluno não desligou os avisos.
 */
export function avisarAluno(supabase: SupabaseClient, evento: string, vars: Record<string, string | number | undefined> = {}, ref = "") {
  if (!whatsappConfigurado()) return;
  after(async () => {
    const { data } = await supabase.rpc("whatsapp_reservar", { p_evento: evento, p_ref: ref });
    const r = ((data ?? []) as { envio_id: number; telefone: string; nome: string; texto: string }[])[0];
    if (!r) return;
    const texto = preencher(r.texto, { ...vars, nome: r.nome });
    const res = await enviarWhatsapp(r.telefone, texto);
    await supabase.rpc("whatsapp_resultado", { p_id: r.envio_id, p_status: res.ok ? "enviada" : res.status, p_texto: texto, p_erro: res.ok ? null : res.erro });
  });
}

type Reserva = { envio_id: number; telefone: string; nome: string; texto: string };

/** Envia uma mensagem já reservada no banco para quem não tem login (lista Em breve, conta excluída). */
export async function enviarReservaPublica(supabase: SupabaseClient, r: Reserva | undefined, vars: Record<string, string | number | undefined> = {}) {
  if (!r || !whatsappConfigurado()) return;
  const texto = preencher(r.texto, { ...vars, nome: r.nome });
  const res = await enviarWhatsapp(r.telefone, texto);
  await supabase.rpc("whatsapp_resultado_publico", { p_id: r.envio_id, p_status: res.ok ? "enviada" : res.status, p_texto: texto, p_erro: res.ok ? null : res.erro });
}

/** Confirmação no WhatsApp para quem entrou na lista da página Em breve (uma vez por telefone). */
export function avisarInteressado(supabase: SupabaseClient, telefone: string) {
  if (!whatsappConfigurado()) return;
  after(async () => {
    const { data } = await supabase.rpc("whatsapp_reservar_interessado", { p_telefone: telefone });
    await enviarReservaPublica(supabase, ((data ?? []) as Reserva[])[0]);
  });
}

/** Cliente do Supabase com a sessão recém-criada (no cadastro, os cookies ainda não chegaram ao servidor). */
export function clienteDaSessao(accessToken: string) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
