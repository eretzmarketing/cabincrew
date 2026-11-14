/**
 * Suporte e contato: e-mail (SMTP) e avisos para a equipe.
 * A senha do e-mail e os números da equipe ficam só no servidor, no arquivo ~/.cabincrew-suporte.json
 * (gravado em Admin › Configurações › E-mail e suporte).
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import nodemailer from "nodemailer";
import { after } from "next/server";
import { PASTA_MIDIA } from "@/lib/midia";
import { enviarWhatsapp } from "@/lib/whatsapp";

export const ARQUIVO_SUPORTE = process.env.SUPORTE_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-suporte.json");
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://cabincrew.com.br").replace(/\/$/, "");

export type ConfigSuporte = {
  smtp: { host: string; porta: number; usuario: string; senha: string } | null;
  emailDestino: string;
  whatsapps: string[];
};

export const EMAIL_PADRAO = "hello@cabincrew.com.br";
export const SMTP_PADRAO = { host: "smtp.hostinger.com", porta: 465 };

export const DEPARTAMENTOS: Record<string, string> = {
  tecnico: "Suporte técnico",
  financeiro: "Financeiro",
  comercial: "Comercial",
};

export function configSuporte(): ConfigSuporte {
  try {
    const j = JSON.parse(readFileSync(/*turbopackIgnore: true*/ ARQUIVO_SUPORTE, "utf8")) as Partial<ConfigSuporte>;
    return {
      smtp: j.smtp?.host && j.smtp.usuario && j.smtp.senha ? j.smtp : null,
      emailDestino: j.emailDestino || EMAIL_PADRAO,
      whatsapps: Array.isArray(j.whatsapps) ? j.whatsapps : [],
    };
  } catch {
    return { smtp: null, emailDestino: EMAIL_PADRAO, whatsapps: [] };
  }
}

const transporte = (s: NonNullable<ConfigSuporte["smtp"]>) =>
  nodemailer.createTransport({
    host: s.host, port: s.porta, secure: s.porta === 465,
    auth: { user: s.usuario, pass: s.senha },
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
  });

/** Confere o servidor de e-mail antes de salvar: null se deu certo, ou o motivo. */
export async function testarSmtp(s: NonNullable<ConfigSuporte["smtp"]>): Promise<string | null> {
  try {
    await transporte(s).verify();
    return null;
  } catch (e) {
    const m = (e as Error & { code?: string }).code;
    if (m === "EAUTH") return "O servidor de e-mail recusou o usuário ou a senha.";
    if (m === "ETIMEDOUT" || m === "ECONNECTION" || m === "ESOCKET") return "Não foi possível conectar ao servidor de e-mail. Confira o endereço e a porta.";
    return `Erro no e-mail: ${(e as Error).message.slice(0, 200)}`;
  }
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function enviarEmail(d: { para: string; assunto: string; linhas: [string, string][]; texto: string; responderPara?: string; link?: { url: string; rotulo: string } }) {
  const cfg = configSuporte();
  if (!cfg.smtp) return { ok: false as const, erro: "e-mail não configurado" };
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#313950;max-width:600px">
<h2 style="margin:0 0 12px;color:#232a3d">${esc(d.assunto)}</h2>
<table style="border-collapse:collapse;margin-bottom:14px">${d.linhas.map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#7a8196">${esc(k)}</td><td style="padding:3px 0"><strong>${esc(v)}</strong></td></tr>`).join("")}</table>
<div style="white-space:pre-wrap;background:#f4f5f8;border-radius:10px;padding:14px">${esc(d.texto)}</div>
${d.link ? `<p style="margin-top:16px"><a href="${esc(d.link.url)}" style="background:#d10030;color:#fff;padding:10px 18px;border-radius:30px;text-decoration:none;font-weight:bold">${esc(d.link.rotulo)}</a></p>` : ""}
<p style="color:#9aa0b0;font-size:12px;margin-top:20px">Cabin Crew · ${esc(SITE.replace(/^https?:\/\//, ""))}</p></div>`;
  const texto = `${d.linhas.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${d.texto}${d.link ? `\n\n${d.link.rotulo}: ${d.link.url}` : ""}`;
  try {
    await transporte(cfg.smtp).sendMail({
      from: { name: "Cabin Crew", address: cfg.smtp.usuario },
      to: d.para, subject: d.assunto, text: texto, html,
      replyTo: d.responderPara,
    });
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, erro: (e as Error).message.slice(0, 300) };
  }
}

/**
 * Cópia para a equipe: e-mail para o endereço do suporte e WhatsApp para os números cadastrados.
 * Roda depois da resposta, para não atrasar quem enviou.
 */
export function avisarEquipe(d: { titulo: string; linhas: [string, string][]; texto: string; responderPara?: string; link?: { url: string; rotulo: string } }) {
  after(async () => {
    const cfg = configSuporte();
    const tarefas: Promise<unknown>[] = [];
    if (cfg.smtp) {
      tarefas.push(enviarEmail({ para: cfg.emailDestino, assunto: d.titulo, linhas: d.linhas, texto: d.texto, responderPara: d.responderPara, link: d.link })
        .then((r) => { if (!r.ok) console.error("[suporte] e-mail:", r.erro); }));
    }
    if (cfg.whatsapps.length) {
      const msg = `🔔 *${d.titulo}*\n\n${d.linhas.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${d.texto.slice(0, 2500)}${d.link ? `\n\n👉 ${d.link.url}` : ""}`;
      for (const n of cfg.whatsapps) {
        tarefas.push(enviarWhatsapp(n, msg).then((r) => { if (!r.ok) console.error("[suporte] whatsapp", n, r.erro); }));
      }
    }
    await Promise.allSettled(tarefas);
  });
}

/* ------------------------------------------------------------------ anexos dos chamados */

export type Anexo = { arquivo: string; nome: string; tipo: string; tamanho: number };
export const PASTA_ANEXOS = path.join(PASTA_MIDIA, "suporte");
export const ANEXO_TIPOS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "application/pdf": "pdf" };
export const ANEXO_MAX = 5 * 1024 * 1024;
export const ANEXOS_POR_MENSAGEM = 3;

/** Confere o começo do arquivo (não confia só no tipo que o navegador informou). */
function assinaturaOk(b: Buffer, ext: string) {
  if (ext === "png") return b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (ext === "jpg") return b[0] === 0xff && b[1] === 0xd8;
  if (ext === "webp") return b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP";
  if (ext === "pdf") return b.subarray(0, 4).toString() === "%PDF";
  return false;
}

/** Valida e grava os anexos de uma mensagem (pasta privada, fora da galeria pública). */
export async function salvarAnexos(arquivos: File[]): Promise<{ anexos: Anexo[] } | { erro: string }> {
  const validos = arquivos.filter((f) => f && f.size > 0);
  if (validos.length > ANEXOS_POR_MENSAGEM) return { erro: `Envie no máximo ${ANEXOS_POR_MENSAGEM} arquivos.` };
  const prontos: { buf: Buffer; anexo: Anexo }[] = [];
  for (const f of validos) {
    const ext = ANEXO_TIPOS[f.type];
    if (!ext) return { erro: `“${f.name}”: envie imagem (PNG, JPG) ou PDF.` };
    if (f.size > ANEXO_MAX) return { erro: `“${f.name}” passa de 5 MB.` };
    const buf = Buffer.from(await f.arrayBuffer());
    if (!assinaturaOk(buf, ext)) return { erro: `“${f.name}” não parece ser um arquivo ${ext.toUpperCase()} válido.` };
    prontos.push({ buf, anexo: { arquivo: `${randomUUID()}.${ext}`, nome: f.name.replace(/[^\p{L}\p{N} ._()-]/gu, "").slice(0, 80) || `anexo.${ext}`, tipo: f.type, tamanho: f.size } });
  }
  if (prontos.length) await mkdir(/*turbopackIgnore: true*/ PASTA_ANEXOS, { recursive: true });
  for (const p of prontos) await writeFile(/*turbopackIgnore: true*/ path.join(PASTA_ANEXOS, p.anexo.arquivo), p.buf, { mode: 0o600 });
  return { anexos: prontos.map((p) => p.anexo) };
}

export const urlAnexo = (a: Anexo) => `/api/suporte/anexo/${a.arquivo}`;

export const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
