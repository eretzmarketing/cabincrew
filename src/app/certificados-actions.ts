"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Campo } from "@/lib/certificados";
import { getUser } from "@/lib/supabase/server";
import { SLUGS_CURSOS } from "@/lib/cursos";
import { cargaDoCurso } from "@/lib/carga-curso";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const CURSOS = SLUGS_CURSOS;

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

const num = (v: unknown, min: number, max: number, padrao: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao; };

/** Admin: salva o modelo de certificado de um curso (imagem, tamanho e campos). */
export async function salvarModeloCertificado(curso: string, m: { imagem: string | null; largura: number; altura: number; campos: Campo[]; ativo: boolean; carga_horaria?: string | null; descricao?: string | null }): Promise<Estado> {
  const { supabase } = await admin();
  if (!CURSOS.includes(curso)) return { erro: "Curso inválido." };
  if (m.imagem && !/^imagens\/certificados\/[a-f0-9]{16}\.jpg$/.test(m.imagem)) return { erro: "Imagem inválida. Envie de novo." };
  const campos = (Array.isArray(m.campos) ? m.campos : []).slice(0, 20).map((c) => ({
    id: String(c.id).slice(0, 30), tipo: ["nome", "curso", "data", "nota", "codigo", "livre"].includes(c.tipo) ? c.tipo : "livre",
    texto: String(c.texto ?? "").slice(0, 300), x: num(c.x, 0, 100, 50), y: num(c.y, 0, 100, 50), tamanho: num(c.tamanho, 0.3, 20, 2),
    cor: /^#[0-9a-fA-F]{6}$/.test(c.cor) ? c.cor : "#1f2a44", fonte: ["manuscrita", "classica", "titulo", "texto"].includes(c.fonte) ? c.fonte : "texto",
    negrito: !!c.negrito, alinhamento: ["left", "center", "right"].includes(c.alinhamento) ? c.alinhamento : "center",
    largura: num(c.largura, 5, 100, 60), visivel: c.visivel !== false,
  }));
  // carga horária em branco: o sistema calcula pelo conteúdo do curso
  const carga = String(m.carga_horaria ?? "").trim().slice(0, 60) || (await cargaDoCurso(supabase, curso));
  const { error } = await supabase.from("certificado_modelos").upsert({
    curso, imagem: m.imagem, largura: Math.round(num(m.largura, 100, 10000, 3508)), altura: Math.round(num(m.altura, 100, 10000, 2480)),
    campos, ativo: !!m.ativo, updated_at: new Date().toISOString(),
    carga_horaria: carga, descricao: String(m.descricao ?? "").trim().slice(0, 1000) || null,
  });
  if (error) return { erro: error.message.includes("carga_horaria") || error.message.includes("descricao") ? "Rode o SQL 0050_autenticar_certificado.sql no Supabase." : error.message.includes("certificado_modelos") ? "Rode o SQL 0049_certificados.sql no Supabase." : "Não foi possível salvar." };
  revalidatePath("/admin/certificados");
  return { ok: true, msg: "Modelo salvo ✓" };
}

export async function revogarCertificado(form: FormData) {
  const { supabase } = await admin();
  const codigo = String(form.get("codigo") ?? "").toUpperCase();
  const revogar = form.get("revogar") === "1";
  await supabase.from("certificados").update({ revogado: revogar }).eq("codigo", codigo);
  revalidatePath("/admin/certificados");
}

/** Admin: emite o certificado de um aluno (ex.: concluiu no presencial). */
export async function emitirCertificadoAdmin(form: FormData) {
  const { supabase } = await admin();
  const userId = String(form.get("user_id") ?? "");
  const curso = String(form.get("curso") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !CURSOS.includes(curso)) return;
  const dia = String(form.get("data") ?? "");
  const concluido = /^\d{4}-\d{2}-\d{2}$/.test(dia) ? new Date(`${dia}T12:00:00-03:00`).toISOString() : new Date().toISOString();
  const { data } = await supabase.rpc("certificado_emitir_admin", { p_user: userId, p_curso: curso, p_concluido: concluido });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/certificados");
  if (data) redirect(`/certificado/${data}`);
}
