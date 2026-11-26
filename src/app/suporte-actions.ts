"use server";

import { createHash } from "node:crypto";
import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { anonimo, configMP } from "@/lib/mercadopago";
import { paisPorIso, telefoneInternacional } from "@/lib/paises";
import {
  ARQUIVO_SUPORTE, DEPARTAMENTOS, EMAIL_PADRAO, SITE, avisarEquipe, configSuporte, enviarEmail, salvarAnexos, testarSmtp,
} from "@/lib/suporte";
import { getUser } from "@/lib/supabase/server";
import { avisosLigados, enviarAviso, enviarWhatsapp, preencher } from "@/lib/whatsapp";
import { normalizarTelefone } from "@/lib/telefone";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const txt = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

function whatsDoForm(form: FormData) {
  const d = String(form.get("whatsapp") ?? "").replace(/\D/g, "");
  const pais = paisPorIso(String(form.get("whatsapp_pais") ?? ""));
  if (pais) return d.startsWith(pais.ddi) ? telefoneInternacional(pais, d.slice(pais.ddi.length)) : null;
  return normalizarTelefone(d);
}

/* ------------------------------------------------------------------ contato (sem login) */

export async function enviarContato(_: Estado, form: FormData): Promise<Estado> {
  if (txt(form, "site", 200)) return { ok: true, msg: "Mensagem enviada! Responderemos em breve." }; // robô (campo escondido)
  const nome = txt(form, "nome", 120), email = txt(form, "email", 200).toLowerCase();
  const assunto = txt(form, "assunto", 150), mensagem = txt(form, "mensagem", 5000);
  const whatsapp = whatsDoForm(form);
  if (nome.length < 2) return { erro: "Digite seu nome." };
  if (!EMAIL_RE.test(email)) return { erro: "Digite um e-mail válido." };
  if (!whatsapp) return { erro: "Confira o número de WhatsApp." };
  if (assunto.length < 2) return { erro: "Escreva o assunto." };
  if (mensagem.length < 5) return { erro: "Escreva sua mensagem." };
  const mp = configMP();
  if (!mp) return { erro: "O formulário está indisponível agora. Fale com a gente pelo Instagram @cabincrew." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "?";
  const ipHash = createHash("sha256").update(`${ip}:${mp.chave.slice(0, 8)}`).digest("hex").slice(0, 32);
  const { data: id, error } = await anonimo().rpc("contato_enviar", {
    p_chave: mp.chave, p_nome: nome, p_email: email, p_whatsapp: whatsapp, p_assunto: assunto, p_mensagem: mensagem, p_ip_hash: ipHash,
  });
  if (error) {
    if (/muitas mensagens/.test(error.message)) return { erro: "Você já enviou algumas mensagens agora há pouco. Aguarde a nossa resposta ou tente de novo daqui a uma hora." };
    console.error("[contato]", error.message);
    return { erro: "Não foi possível enviar agora. Tente de novo em instantes." };
  }
  avisarEquipe({
    titulo: `Contato pelo site: ${assunto}`,
    linhas: [["Nome", nome], ["E-mail", email], ["WhatsApp", whatsapp], ["Mensagem nº", String(id)]],
    texto: mensagem, responderPara: email,
    link: { url: `${SITE}/admin/suporte/contatos`, rotulo: "Ver no painel" },
  });
  return { ok: true, msg: "Mensagem enviada! Responderemos pelo e-mail ou WhatsApp que você informou." };
}

/* ------------------------------------------------------------------ chamados (aluno logado) */

const MSG_ERRO: [RegExp, string][] = [
  [/limite de chamados/, "Você já abriu 5 chamados hoje. Responda nos chamados abertos ou aguarde a nossa resposta."],
  [/muitas mensagens/, "Muitas mensagens em pouco tempo. Aguarde um pouco."],
  [/bloqueada/, "Sua conta está bloqueada."],
];
const traduzir = (m: string) => MSG_ERRO.find(([r]) => r.test(m))?.[1] ?? "Não foi possível enviar agora. Tente de novo.";

export async function abrirChamado(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) redirect("/entrar?modo=entrar&next=/conta/suporte");
  const departamento = txt(form, "departamento", 20);
  const assunto = txt(form, "assunto", 150), texto = txt(form, "mensagem", 5000);
  if (!DEPARTAMENTOS[departamento]) return { erro: "Escolha o departamento." };
  if (assunto.length < 3) return { erro: "Escreva um resumo do problema no assunto." };
  if (texto.length < 10) return { erro: "Descreva o problema com um pouco mais de detalhe." };
  const a = await salvarAnexos(form.getAll("anexos") as File[]);
  if ("erro" in a) return { erro: a.erro };
  const { data: id, error } = await supabase.rpc("ticket_abrir", { p_departamento: departamento, p_assunto: assunto, p_texto: texto, p_anexos: a.anexos });
  if (error) return { erro: traduzir(error.message) };
  avisarEquipe({
    titulo: `Novo chamado nº ${id}: ${assunto}`,
    linhas: [["Aluno", profile.nome || profile.apelido], ["E-mail", user.email ?? ""], ["WhatsApp", profile.whatsapp ?? "—"], ["Departamento", DEPARTAMENTOS[departamento]], ...(a.anexos.length ? [["Anexos", String(a.anexos.length)] as [string, string]] : [])],
    texto, link: { url: `${SITE}/admin/suporte/${id}`, rotulo: "Responder no painel" },
  });
  revalidatePath("/conta/suporte");
  revalidatePath("/admin/suporte");
  redirect(`/conta/suporte/${id}?novo=1`);
}

/** Resposta num chamado: do aluno (avisa a equipe) ou da equipe (avisa o aluno no WhatsApp). */
export async function responderChamado(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) redirect("/entrar");
  const ticket = Number(form.get("ticket"));
  const texto = txt(form, "mensagem", 5000);
  if (!Number.isInteger(ticket)) return { erro: "Chamado inválido." };
  if (!texto) return { erro: "Escreva a mensagem." };
  const { data: t } = await supabase.from("tickets").select("id, user_id, assunto, departamento, status").eq("id", ticket).single();
  if (!t) return { erro: "Chamado não encontrado." };
  const a = await salvarAnexos(form.getAll("anexos") as File[]);
  if ("erro" in a) return { erro: a.erro };
  const { data: msgId, error } = await supabase.rpc("ticket_responder", { p_ticket: ticket, p_texto: texto, p_anexos: a.anexos });
  if (error) return { erro: traduzir(error.message) };

  const daEquipe = profile.is_admin && t.user_id !== user.id;
  if (daEquipe) {
    if (form.get("fechar") === "on") await supabase.rpc("ticket_status", { p_ticket: ticket, p_status: "fechado" });
    if (avisosLigados()) {
      after(async () => {
        const { data } = await supabase.rpc("ticket_whatsapp_reservar", { p_mensagem: msgId });
        const r = ((data ?? []) as { envio_id: number; telefone: string; nome: string; texto: string; assunto: string; chamado: number }[])[0];
        if (!r) return;
        const vars = { nome: r.nome, assunto: r.assunto, chamado: r.chamado };
        const res = await enviarAviso(supabase, "ticket_respondido", r.telefone, preencher(r.texto, vars), vars);
        await supabase.rpc("ticket_whatsapp_resultado", { p_id: r.envio_id, p_status: res.ok ? "enviada" : res.status, p_texto: res.texto, p_erro: res.ok ? null : res.erro });
      });
    }
  } else {
    avisarEquipe({
      titulo: `Nova mensagem no chamado nº ${ticket}: ${t.assunto}`,
      linhas: [["Aluno", profile.nome || profile.apelido], ["E-mail", user.email ?? ""], ["Departamento", DEPARTAMENTOS[t.departamento] ?? t.departamento]],
      texto, link: { url: `${SITE}/admin/suporte/${ticket}`, rotulo: "Responder no painel" },
    });
  }
  revalidatePath(`/conta/suporte/${ticket}`);
  revalidatePath(`/admin/suporte/${ticket}`);
  revalidatePath("/admin/suporte");
  return { ok: true, msg: daEquipe ? (avisosLigados() ? "Resposta enviada. O aluno vai receber o aviso." : "Resposta enviada.") : "Mensagem enviada. Avisaremos no WhatsApp quando respondermos." };
}

/* ------------------------------------------------------------------ admin */

async function exigirAdmin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx;
}

export async function mudarStatusChamado(form: FormData) {
  const { supabase } = await exigirAdmin();
  const id = Number(form.get("ticket"));
  const status = String(form.get("status"));
  await supabase.rpc("ticket_status", { p_ticket: id, p_status: status });
  revalidatePath(`/admin/suporte/${id}`);
  revalidatePath("/admin/suporte");
  revalidatePath(`/conta/suporte/${id}`);
}

export async function marcarContato(form: FormData) {
  const { supabase } = await exigirAdmin();
  const id = Number(form.get("id"));
  const acao = String(form.get("acao"));
  if (acao === "excluir") await supabase.from("contatos").delete().eq("id", id);
  else await supabase.from("contatos").update({ status: acao === "resolvido" ? "resolvido" : "novo" }).eq("id", id);
  revalidatePath("/admin/suporte/contatos");
}

/** Admin: servidor de e-mail (SMTP), e-mail que recebe as cópias e WhatsApps da equipe. */
export async function salvarConfigSuporte(_: Estado, form: FormData): Promise<Estado> {
  await exigirAdmin();
  const atual = configSuporte();
  const host = txt(form, "host", 120).toLowerCase();
  const porta = Number(form.get("porta") ?? 465);
  const usuario = txt(form, "usuario", 200).toLowerCase();
  const senhaNova = String(form.get("senha") ?? "");
  const senha = senhaNova || atual.smtp?.senha || "";
  const emailDestino = txt(form, "emailDestino", 200).toLowerCase() || EMAIL_PADRAO;
  const brutos = String(form.get("whatsapps") ?? "").split(/[\n,;/]+/).map((s) => s.trim()).filter(Boolean);

  if (!EMAIL_RE.test(emailDestino)) return { erro: "Confira o e-mail que recebe as cópias." };
  const whatsapps: string[] = [];
  for (const b of brutos.slice(0, 5)) {
    const n = normalizarTelefone(b);
    if (!n) return { erro: `O número “${b}” não está certo. Use DDD + número, ex.: 11 91234-5678 (celular tem 11 dígitos com o DDD).` };
    if (!whatsapps.includes(n)) whatsapps.push(n);
  }
  let smtp = atual.smtp;
  if (usuario || senhaNova) {
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return { erro: "Confira o servidor de saída (SMTP), ex.: smtp.hostinger.com." };
    if (![465, 587, 25, 2525].includes(porta)) return { erro: "Porta inválida: use 465 (SSL) ou 587." };
    if (!EMAIL_RE.test(usuario)) return { erro: "O usuário do SMTP é o e-mail completo, ex.: hello@cabincrew.com.br." };
    if (!senha) return { erro: "Digite a senha do e-mail." };
    smtp = { host, porta, usuario, senha };
    const mudou = !atual.smtp || atual.smtp.host !== host || atual.smtp.porta !== porta || atual.smtp.usuario !== usuario || !!senhaNova;
    if (mudou) {
      const erro = await testarSmtp(smtp);
      if (erro) return { erro };
    }
  }
  await writeFile(/*turbopackIgnore: true*/ ARQUIVO_SUPORTE, JSON.stringify({ smtp, emailDestino, whatsapps, salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_SUPORTE, 0o600).catch(() => {});
  revalidatePath("/admin/suporte/configuracoes");

  if (form.get("testar") === "on") {
    const avisos: string[] = [];
    if (smtp) {
      const r = await enviarEmail({ para: emailDestino, assunto: "Teste do suporte Cabin Crew", linhas: [["Enviado em", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })]], texto: "Se você recebeu este e-mail, as cópias dos contatos e chamados vão chegar aqui. ✈️" });
      avisos.push(r.ok ? `e-mail enviado para ${emailDestino}` : `e-mail falhou (${r.erro})`);
    }
    for (const n of whatsapps) {
      const r = await enviarWhatsapp(n, "✅ Teste do suporte Cabin Crew: os avisos de contato e chamados vão chegar neste WhatsApp.");
      avisos.push(r.ok ? `WhatsApp enviado para ${n}` : `WhatsApp ${n}: ${r.erro}`);
    }
    return { ok: true, msg: `Salvo ✓ Teste: ${avisos.join(" · ") || "nada configurado para testar"}.` };
  }
  return { ok: true, msg: "Salvo ✓" };
}
