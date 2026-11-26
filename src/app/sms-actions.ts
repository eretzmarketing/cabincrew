"use server";

import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ARQUIVO_SMS, configSMS, enviarSMS, numeroSMS } from "@/lib/sms";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx;
}

/** Admin: salva o token do smsmais (só no servidor) e liga/desliga o envio. */
export async function salvarSMS(_: Estado, form: FormData): Promise<Estado> {
  await admin();
  const atual = configSMS();
  const novo = String(form.get("token") ?? "").trim();
  const token = novo || atual?.token || "";
  if (!token) return { erro: "Cole o token da API do smsmais." };
  if (!/^[A-Za-z0-9._-]{16,200}$/.test(token)) return { erro: "Esse token não parece certo. Copie de novo em smsmais › API & Integrações." };
  await writeFile(ARQUIVO_SMS, JSON.stringify({ token, ativo: form.get("ativo") === "on", salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_SMS, 0o600).catch(() => {});
  revalidatePath("/admin/whatsapp");
  return { ok: true, msg: "Salvo ✓ Agora envie um SMS de teste para o seu celular." };
}

/** Admin: envia um SMS de teste (gasta 1 SMS do saldo). */
export async function testarSMS(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const cfg = configSMS();
  if (!cfg) return { erro: "Salve o token primeiro." };
  const tel = String(form.get("tel") ?? "");
  if (!numeroSMS(tel)) return { erro: "Digite um celular do Brasil com DDD, ex.: 11 98765-4321." };
  const r = await enviarSMS(tel, "Cabin Crew: teste de SMS funcionando!", "teste-admin", cfg.token);
  await supabase.rpc("sms_registrar", { p_evento: "teste-admin", p_telefone: tel, p_texto: "Cabin Crew: teste de SMS funcionando!", p_status: r.ok ? "enviada" : "erro", p_erro: r.ok ? null : r.erro });
  revalidatePath("/admin/whatsapp");
  return r.ok ? { ok: true, msg: `SMS enviado ✓ (situação no smsmais: ${r.status}). Deve chegar em instantes.` } : { erro: r.erro };
}
