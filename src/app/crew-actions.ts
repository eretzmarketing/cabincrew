"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import type { FormState } from "@/app/actions";

const UUID = /^[0-9a-f-]{36}$/i;

/* ---------- Aluno ---------- */
export async function alternarAulaConcluida(form: FormData) {
  const { supabase, user } = await getUser();
  const aulaId = String(form.get("aula_id"));
  if (!user) redirect(`/entrar?modo=entrar&next=/crew-select/aula/${aulaId}`);
  if (!UUID.test(aulaId)) return;

  if (form.get("concluida") === "true") {
    await supabase.from("progresso").delete().eq("aula_id", aulaId).eq("user_id", user.id);
    revalidatePath(`/crew-select/aula/${aulaId}`);
    return;
  }
  await supabase.from("progresso").upsert({ aula_id: aulaId, user_id: user.id }, { ignoreDuplicates: true });
  revalidatePath("/crew-select", "layout");
  const proxima = String(form.get("proxima") ?? "");
  if (UUID.test(proxima)) redirect(`/crew-select/aula/${proxima}`);
}

/* ---------- Administrador ---------- */
async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx;
}

const txt = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max) || null;
const num = (form: FormData, k: string) => {
  const v = String(form.get(k) ?? "").trim();
  return v === "" ? null : Number(v);
};
function urlOuNull(v: string | null) {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function salvarModulo(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = num(form, "id");
  const dados = {
    titulo: txt(form, "titulo", 120),
    descricao: txt(form, "descricao", 500),
    fase: txt(form, "fase", 60),
    ordem: num(form, "ordem") ?? 0,
    publicado: form.get("publicado") === "on",
  };
  if (!dados.titulo || dados.titulo.length < 2) return { erro: "Informe o título do módulo." };
  const { error } = id
    ? await supabase.from("modulos").update(dados).eq("id", id)
    : await supabase.from("modulos").insert(dados);
  if (error) return { erro: "Não foi possível salvar o módulo." };
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/crew-select");
  return { ok: true, msg: "Módulo salvo." };
}

export async function excluirModulo(form: FormData) {
  const { supabase } = await admin();
  await supabase.from("modulos").delete().eq("id", Number(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/crew-select");
}

export async function salvarAula(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = String(form.get("id") ?? "");
  const tipo = String(form.get("tipo") ?? "texto");
  const videoBruto = txt(form, "video_url", 500);
  const arquivoBruto = txt(form, "arquivo_url", 500);
  const dados = {
    modulo_id: num(form, "modulo_id"),
    titulo: txt(form, "titulo", 160),
    tipo: ["texto", "video", "pdf", "simulado"].includes(tipo) ? tipo : "texto",
    resumo: txt(form, "resumo", 400),
    conteudo: txt(form, "conteudo", 100000),
    video_url: urlOuNull(videoBruto),
    arquivo_url: urlOuNull(arquivoBruto),
    duracao_min: num(form, "duracao_min"),
    ordem: num(form, "ordem") ?? 1,
    publicado: form.get("publicado") === "on",
    updated_at: new Date().toISOString(),
  };
  if (!dados.modulo_id) return { erro: "Escolha o módulo." };
  if (!dados.titulo || dados.titulo.length < 2) return { erro: "Informe o título da aula." };
  if (videoBruto && !dados.video_url) return { erro: "O link do vídeo não é válido." };
  if (arquivoBruto && !dados.arquivo_url) return { erro: "O link do material não é válido." };
  if (dados.duracao_min !== null && !(dados.duracao_min >= 1 && dados.duracao_min <= 600)) return { erro: "Duração entre 1 e 600 minutos." };

  if (UUID.test(id)) {
    const { error } = await supabase.from("aulas").update(dados).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a aula." };
    revalidatePath("/", "layout");
    return { ok: true, msg: "Aula salva." };
  }
  const { data, error } = await supabase.from("aulas").insert(dados).select("id").single();
  if (error || !data) return { erro: "Não foi possível criar a aula." };
  revalidatePath("/", "layout");
  redirect(`/admin/crew-select/aula/${data.id}?criada=1`);
}

export async function excluirAula(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const modulo = String(form.get("modulo_id"));
  await supabase.from("aulas").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/crew-select/modulo/${modulo}`);
}

/* ---------- Configurações e usuários ---------- */
export async function alterarConfig(form: FormData) {
  const { supabase } = await admin();
  const chave = String(form.get("chave"));
  if (!["forum_ativo", "crew_select_aberto", "manutencao"].includes(chave)) return;
  await supabase
    .from("configuracoes")
    .update({ valor: form.get("valor") === "true", updated_at: new Date().toISOString() })
    .eq("chave", chave);
  revalidatePath("/", "layout");
}

export async function alterarAdmin(form: FormData) {
  const { supabase, user } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id) || id === user!.id) return; // ninguém remove o próprio acesso por engano
  await supabase.from("profiles").update({ is_admin: form.get("valor") === "true" }).eq("id", id);
  revalidatePath("/admin/usuarios");
}
