"use server";

import { revalidatePath } from "next/cache";
import { infoCursos } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALTA_SQL = "Falta rodar o SQL 0075_liberacoes_em_massa.sql no Supabase.";

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

/** Lê o "pacote" do formulário: cursos, prazo dos cursos, Questões Plus e análises da IA. */
async function lerPacote(form: FormData) {
  const validos = new Set((await infoCursos()).map((c) => c.slug));
  const cursos = form.getAll("cursos").map(String).filter((c) => validos.has(c));
  const dias = (k: string) => {
    const v = String(form.get(k) ?? "");
    return v === "sem" || v === "" ? null : Math.min(3650, Math.max(1, Number(v) || 30));
  };
  const plusSel = String(form.get("plus") ?? "nao");
  const ia = (k: string) => Math.min(20, Math.max(0, Math.floor(Number(form.get(k) ?? 0)) || 0));
  const pacote = {
    cursos, curso_dias: dias("curso_dias"),
    plus: plusSel !== "nao", plus_dias: plusSel === "nao" ? null : dias("plus"),
    ia_video: ia("ia_video"), ia_curriculo: ia("ia_curriculo"),
  };
  const vazio = !cursos.length && !pacote.plus && !pacote.ia_video && !pacote.ia_curriculo;
  return { pacote, vazio };
}

/** Admin: libera o pacote para os alunos marcados (ou todos os do filtro). */
export async function liberarEmMassa(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const ids = [...new Set(String(form.get("ids") ?? "").split(",").map((s) => s.trim()).filter((s) => UUID.test(s)))];
  if (!ids.length) return { erro: "Marque pelo menos um aluno (ou escolha “todos do filtro”)." };
  if (ids.length > 5000) return { erro: "No máximo 5.000 alunos por vez. Use um filtro menor." };
  const { pacote, vazio } = await lerPacote(form);
  if (vazio) return { erro: "Escolha o que liberar: um curso, Questões Plus ou análises da IA." };
  const motivo = String(form.get("motivo") ?? "").trim().slice(0, 120) || "Liberação em massa";
  const { data, error } = await supabase.rpc("admin_liberar_massa", {
    p_ids: ids, p_cursos: pacote.cursos, p_curso_dias: pacote.curso_dias, p_plus: pacote.plus, p_plus_dias: pacote.plus_dias,
    p_ia_video: pacote.ia_video, p_ia_cv: pacote.ia_curriculo, p_motivo: motivo,
  });
  if (error) return { erro: error.message.includes("admin_liberar_massa") ? FALTA_SQL : "Não foi possível liberar agora." };
  const n = Number(data ?? 0);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/acompanhamento");
  const iguais = ids.length - n;
  return { ok: true, msg: `Liberado para ${n} ${n === 1 ? "aluno" : "alunos"} ✓${iguais > 0 ? ` (${iguais} já tinham tudo isso e ficaram como estavam)` : ""}` };
}

/** Admin: cria ou atualiza a regra de uma escola. */
export async function salvarRegraEscola(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const escola = String(form.get("escola") ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (escola.length < 2) return { erro: "Escolha a escola." };
  const { pacote, vazio } = await lerPacote(form);
  if (vazio) return { erro: "Escolha o que liberar: um curso, Questões Plus ou análises da IA." };
  const original = String(form.get("original") ?? "");
  if (original && original !== escola) await supabase.from("escola_regras").delete().eq("escola", original);
  const { error } = await supabase.from("escola_regras").upsert({ escola, ...pacote, ativa: form.get("ativa") !== "off", atualizado_em: new Date().toISOString() });
  if (error) return { erro: error.message.includes("escola_regras") ? FALTA_SQL : "Não foi possível salvar." };
  revalidatePath("/admin/usuarios/escolas");
  return { ok: true, msg: `Regra da ${escola} salva ✓ Quem se cadastrar com essa escola recebe o pacote na hora.` };
}

/** Admin: liga/desliga ou exclui uma regra. */
export async function alterarRegraEscola(form: FormData) {
  const { supabase } = await admin();
  const escola = String(form.get("escola") ?? "");
  const acao = String(form.get("acao") ?? "");
  if (acao === "excluir") await supabase.from("escola_regras").delete().eq("escola", escola);
  else if (acao === "ligar" || acao === "desligar") await supabase.from("escola_regras").update({ ativa: acao === "ligar", atualizado_em: new Date().toISOString() }).eq("escola", escola);
  revalidatePath("/admin/usuarios/escolas");
}

/** Admin: aplica a regra a quem já está cadastrado na escola. */
export async function aplicarRegraEscola(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const escola = String(form.get("escola") ?? "");
  const { data, error } = await supabase.rpc("admin_aplicar_regra_escola", { p_escola: escola });
  if (error) return { erro: error.message.includes("admin_aplicar_regra_escola") ? FALTA_SQL : "Não foi possível aplicar agora." };
  const n = Number(data ?? 0);
  revalidatePath("/admin/usuarios");
  return { ok: true, msg: n ? `Aplicado a ${n} ${n === 1 ? "aluno já cadastrado" : "alunos já cadastrados"} ✓` : "Todos os alunos dessa escola já tinham o pacote." };
}
