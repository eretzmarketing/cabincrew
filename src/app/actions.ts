"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { slugify } from "@/lib/forum";

export type FormState = { ok?: boolean; erro?: string; msg?: string } | undefined;

/* ---------- Lista de espera do Crew Select ---------- */
export async function entrarListaEspera(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Digite um e-mail válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("lista_espera").insert({ email });
  if (error && error.code !== "23505") return { erro: "Não foi possível salvar agora. Tente de novo." };
  return { ok: true, msg: "Pronto! Avisaremos você quando o Crew Select abrir." };
}

/* ---------- Login por link no e-mail ---------- */
export async function enviarLink(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = String(form.get("next") ?? "/forum");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Digite um e-mail válido." };

  const h = await headers();
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origem}/auth/callback?next=${encodeURIComponent(seguro(next))}` },
  });
  if (error) return { erro: "Não conseguimos enviar o link. Aguarde um minuto e tente de novo." };
  return { ok: true, msg: `Enviamos um link de acesso para ${email}. Abra o e-mail neste mesmo navegador.` };
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function salvarApelido(_: FormState, form: FormData): Promise<FormState> {
  const apelido = String(form.get("apelido") ?? "").trim();
  if (apelido.length < 2 || apelido.length > 40) return { erro: "Use entre 2 e 40 caracteres." };
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar");
  const { error } = await supabase.from("profiles").update({ apelido }).eq("id", user.id);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/", "layout");
  return { ok: true, msg: "Apelido atualizado." };
}

/* ---------- Relatos ---------- */
export async function publicarRelato(_: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar");

  const slug = String(form.get("slug") ?? "");
  const fase = Number(form.get("fase"));
  const texto = String(form.get("texto") ?? "").trim();
  const data = String(form.get("data_etapa") ?? "");
  const participantes = form.get("participantes") ? Number(form.get("participantes")) : null;

  if (!(fase >= 1 && fase <= 7)) return { erro: "Escolha a fase que você está relatando." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: "Informe a data da etapa." };
  if (new Date(data) > new Date()) return { erro: "A data da etapa não pode estar no futuro." };
  if (!form.get("resultado")) return { erro: "Informe o resultado até agora." };
  if (texto.length < 40) return { erro: "Conte um pouco mais: o relato precisa de pelo menos 40 caracteres." };
  if (texto.length > 3000) return { erro: "O relato pode ter no máximo 3.000 caracteres." };
  if (form.get("declaracao") !== "on") return { erro: "Confirme que não reproduziu questões e que viveu o que relatou." };
  if (participantes !== null && !(participantes >= 1 && participantes <= 500)) return { erro: "Número de participantes inválido." };

  const { data: sel } = await supabase.from("selecoes").select("id").eq("slug", slug).single();
  if (!sel) return { erro: "Seleção não encontrada." };

  const { error } = await supabase.from("relatos").insert({
    selecao_id: sel.id,
    fase_id: fase,
    autor_id: user.id,
    anonimo: form.get("anonimo") === "on",
    base: String(form.get("base") ?? "").trim().toUpperCase().slice(0, 10) || null,
    data_etapa: data,
    formato: form.get("formato") === "presencial" ? "presencial" : "online",
    duracao: String(form.get("duracao") ?? "").trim().slice(0, 40) || null,
    participantes,
    resultado: form.get("resultado"),
    texto,
  });
  if (error) return { erro: "Não foi possível publicar agora. Tente de novo." };

  revalidatePath(`/forum/${slug}`);
  redirect(`/forum/${slug}?fase=${fase}&publicado=1`);
}

export async function alternarConfirmacao(form: FormData) {
  const { supabase, user } = await getUser();
  const slug = String(form.get("slug"));
  if (!user) redirect(`/entrar?next=/forum/${slug}`);
  const relatoId = String(form.get("relato_id"));
  if (form.get("confirmei") === "true") {
    await supabase.from("confirmacoes").delete().eq("relato_id", relatoId).eq("user_id", user.id);
  } else {
    await supabase.from("confirmacoes").insert({ relato_id: relatoId, user_id: user.id });
  }
  revalidatePath(`/forum/${slug}`);
}

export async function denunciar(form: FormData) {
  const { supabase, user } = await getUser();
  const slug = String(form.get("slug"));
  if (!user) redirect(`/entrar?next=/forum/${slug}`);
  await supabase.from("denuncias").insert({
    relato_id: String(form.get("relato_id")),
    user_id: user.id,
    motivo: String(form.get("motivo") || "Denúncia pelo site"),
  });
  revalidatePath(`/forum/${slug}`);
  redirect(`/forum/${slug}?fase=${form.get("fase")}&denunciado=1`);
}

export async function apagarMeuRelato(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar");
  const slug = String(form.get("slug"));
  await supabase.from("relatos").delete().eq("id", String(form.get("relato_id"))).eq("autor_id", user.id);
  revalidatePath(`/forum/${slug}`);
}

/* ---------- Moderação (somente admin; o banco também bloqueia) ---------- */
async function exigirAdmin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx;
}

export async function criarSelecao(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await exigirAdmin();
  const companhiaId = Number(form.get("companhia_id"));
  const base = String(form.get("base") ?? "").trim().toUpperCase();
  const mes = String(form.get("mes") ?? ""); // AAAA-MM
  if (!companhiaId || !base || !/^\d{4}-\d{2}$/.test(mes)) return { erro: "Preencha companhia, base e mês." };

  const { data: comp } = await supabase.from("companhias").select("slug").eq("id", companhiaId).single();
  const slug = slugify(`${comp?.slug ?? "selecao"}-${base}-${mes}`);
  const { error } = await supabase.from("selecoes").insert({
    companhia_id: companhiaId,
    base,
    base_nome: String(form.get("base_nome") ?? "").trim() || null,
    cargo: String(form.get("cargo") ?? "").trim() || "Comissários de voo",
    mes_ref: `${mes}-01`,
    status: String(form.get("status") ?? "andamento"),
    aberta_em: String(form.get("aberta_em") ?? "") || null,
    slug,
  });
  if (error) return { erro: error.code === "23505" ? "Já existe uma seleção com essa companhia, base e mês." : "Erro ao criar a seleção." };
  revalidatePath("/", "layout");
  return { ok: true, msg: `Seleção criada: /forum/${slug}` };
}

export async function mudarStatusSelecao(form: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from("selecoes").update({ status: String(form.get("status")) }).eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
}

export async function moderarRelato(form: FormData) {
  const { supabase } = await exigirAdmin();
  const id = String(form.get("relato_id"));
  const acao = String(form.get("acao"));
  if (acao === "apagar") {
    await supabase.from("relatos").delete().eq("id", id);
  } else {
    await supabase.from("relatos").update({ status: acao === "ocultar" ? "oculto" : "publicado" }).eq("id", id);
    await supabase.from("denuncias").update({ resolvida: true }).eq("relato_id", id);
  }
  revalidatePath("/", "layout");
}

function seguro(caminho: string) {
  return caminho.startsWith("/") && !caminho.startsWith("//") ? caminho : "/forum";
}
