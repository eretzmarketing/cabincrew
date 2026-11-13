"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

/** Admin: edita o texto de um aviso automático e liga/desliga. */
export async function salvarModeloWhatsapp(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const evento = String(form.get("evento") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  if (!/^[a-z_]{3,40}$/.test(evento)) return { erro: "Modelo inválido." };
  if (texto.length < 5 || texto.length > 3000) return { erro: "Escreva a mensagem (até 3.000 caracteres)." };
  const { error } = await supabase.from("whatsapp_modelos").update({ texto, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString() }).eq("evento", evento);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/admin/whatsapp");
  return { ok: true, msg: "Salvo." };
}

/** Admin: manda uma mensagem avulsa (teste ou para um aluno) e registra no histórico. */
export async function enviarWhatsappManual(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const alunoId = String(form.get("aluno_id") ?? "");
  let telefone = String(form.get("telefone") ?? "").trim();
  let nome = "";
  if (/^[0-9a-f-]{36}$/i.test(alunoId)) {
    const { data: p } = await supabase.from("profiles").select("nome, apelido, whatsapp").eq("id", alunoId).maybeSingle();
    if (!p?.whatsapp) return { erro: "Este aluno não tem WhatsApp cadastrado." };
    telefone = p.whatsapp;
    nome = String(p.nome || p.apelido || "").split(" ")[0];
  }
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return { erro: "Informe o número com DDI e DDD (ex.: 5511999999999)." };
  const texto = preencher(String(form.get("texto") ?? ""), { nome });
  if (texto.length < 2) return { erro: "Escreva a mensagem." };

  const r = await enviarWhatsapp(digitos, texto);
  await supabase.from("whatsapp_envios").insert({
    user_id: /^[0-9a-f-]{36}$/i.test(alunoId) ? alunoId : null, evento: "manual", ref: String(Date.now()),
    telefone: `+${digitos}`, texto, status: r.ok ? "enviada" : r.status, erro: r.ok ? null : r.erro,
  });
  revalidatePath("/admin/whatsapp");
  return r.ok ? { ok: true, msg: "Mensagem enviada ✓" } : { erro: `Não foi enviada: ${r.erro}` };
}

/** Aluno: liga/desliga os avisos automáticos no WhatsApp. */
export async function alternarAvisosWhatsapp(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.from("profiles").update({ whatsapp_avisos: form.get("ligar") === "1" }).eq("id", user.id);
  revalidatePath("/conta");
}
