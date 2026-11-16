"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const UUID = /^[0-9a-f-]{36}$/i;

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx.supabase;
}
function revalidar() {
  revalidatePath("/admin/head-hunter/dinamicas");
  revalidatePath("/head-hunter/dinamicas");
}
const txt = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max) || null;
const slugDe = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Cria ou edita uma dinâmica. */
export async function salvarDinamica(_: Estado, form: FormData): Promise<Estado> {
  const supabase = await admin();
  const id = String(form.get("id") ?? "");
  const titulo = txt(form, "titulo", 120);
  const categoria_id = Number(form.get("categoria_id")) || null;
  if (!titulo || titulo.length < 2) return { erro: "Digite o nome da dinâmica." };
  if (!categoria_id) return { erro: "Escolha a categoria." };
  const dados = {
    titulo, categoria_id,
    objetivo: txt(form, "objetivo", 400),
    materiais: txt(form, "materiais", 400),
    como_realizada: txt(form, "como_realizada", 3000),
    como_se_destacar: txt(form, "como_se_destacar", 3000),
    ordem: Math.max(0, Math.min(999, Number(form.get("ordem")) || 0)),
  };
  const { error } = UUID.test(id)
    ? await supabase.from("dinamicas").update(dados).eq("id", id)
    : await supabase.from("dinamicas").insert({ ...dados, ativo: form.getAll("ativo").includes("on") });
  if (error) return { erro: "Não foi possível salvar." };
  revalidar();
  return { ok: true, msg: UUID.test(id) ? "Salvo ✓" : "Dinâmica adicionada ✓" };
}

/** Ocultar / mostrar / excluir uma dinâmica. */
export async function acaoDinamica(form: FormData) {
  const supabase = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  const acao = String(form.get("acao"));
  if (acao === "excluir") {
    if (form.get("confirmo") !== "on") return;
    await supabase.from("dinamicas").delete().eq("id", id);
  } else await supabase.from("dinamicas").update({ ativo: acao === "mostrar" }).eq("id", id);
  revalidar();
}

/** Cria ou edita uma categoria. */
export async function salvarCategoriaDinamica(_: Estado, form: FormData): Promise<Estado> {
  const supabase = await admin();
  const id = Number(form.get("id")) || 0;
  const titulo = txt(form, "titulo", 80);
  if (!titulo || titulo.length < 2) return { erro: "Digite o nome da categoria." };
  const dados = { titulo, descricao: txt(form, "descricao", 200), ordem: Math.max(0, Math.min(99, Number(form.get("ordem")) || 0)) };
  let error;
  if (id) ({ error } = await supabase.from("dinamicas_categorias").update(dados).eq("id", id));
  else {
    let slug = slugDe(titulo) || "categoria";
    const { data: existe } = await supabase.from("dinamicas_categorias").select("id").eq("slug", slug).maybeSingle();
    if (existe) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    ({ error } = await supabase.from("dinamicas_categorias").insert({ ...dados, slug, ativo: true }));
  }
  if (error) return { erro: "Não foi possível salvar a categoria." };
  revalidar();
  return { ok: true, msg: id ? "Categoria salva ✓" : "Categoria criada ✓" };
}

/** Ocultar / mostrar / excluir uma categoria (excluir só se estiver vazia). */
export async function acaoCategoriaDinamica(form: FormData) {
  const supabase = await admin();
  const id = Number(form.get("id"));
  if (!id) return;
  const acao = String(form.get("acao"));
  if (acao === "excluir") {
    const { count } = await supabase.from("dinamicas").select("id", { count: "exact", head: true }).eq("categoria_id", id);
    if (count) return;
    await supabase.from("dinamicas_categorias").delete().eq("id", id);
  } else await supabase.from("dinamicas_categorias").update({ ativo: acao === "mostrar" }).eq("id", id);
  revalidar();
}
