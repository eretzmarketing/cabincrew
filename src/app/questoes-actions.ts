"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { avatarUrl, createClient, getUser } from "@/lib/supabase/server";
import { avisarEquipe, enviarEmail, SITE } from "@/lib/suporte";
import { BANCOS } from "@/lib/crew";
import { favoritasPorBloco } from "@/lib/plus";

const UUID = /^[0-9a-f-]{36}$/i;
type Erro = { erro: string; plus?: boolean };

const TIPOS: Record<string, string> = {
  gabarito: "A resposta certa está errada",
  enunciado: "Erro no enunciado",
  alternativas: "Erro nas alternativas",
  explicacao: "Erro na explicação",
  outro: "Outro problema",
};

function mensagemErro(m: string | undefined, padrao: string): Erro {
  if (!m) return { erro: padrao };
  if (m.includes("plus")) return { erro: "plus", plus: true };
  if (/function .* does not exist|Could not find the function/i.test(m)) return { erro: "Recurso em preparação. Tente de novo mais tarde." };
  return { erro: m.length < 160 ? m : padrao };
}

/* ------------------------------------------------------------------ Reportar erro */

export async function reportarQuestao(questao: string, tentativa: string, tipo: string, mensagem: string): Promise<{ ok: true } | Erro> {
  if (!UUID.test(questao)) return { erro: "Questão inválida." };
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) return { erro: "Entre na sua conta para continuar." };
  const { data, error } = await supabase.rpc("reportar_questao", {
    p_questao: questao, p_tentativa: UUID.test(tentativa) ? tentativa : null, p_tipo: tipo, p_mensagem: mensagem.slice(0, 1500),
  });
  if (error || !data) return mensagemErro(error?.message, "Não foi possível enviar agora. Tente de novo.");

  const q = data as { id: number; banco: string; categoria: string | null; enunciado: string; alternativas: { letra: string; texto: string }[]; correta: string | null; explicacao: string | null };
  const nome = profile.nome || profile.apelido;
  const alternativas = q.alternativas.map((a) => `${a.letra === q.correta ? "✅" : "  "} ${a.letra}) ${a.texto ?? "(imagem)"}`).join("\n");
  avisarEquipe({
    titulo: `🚩 Questão reportada (#${q.id})`,
    linhas: [
      ["Aluno", `${nome} (${user.email ?? "sem e-mail"})`],
      ["Problema", TIPOS[tipo] ?? TIPOS.outro],
      ["Banco", `${BANCOS[q.banco] ?? q.banco}${q.categoria ? ` · ${q.categoria}` : ""}`],
      ["Resposta certa no sistema", q.correta ?? "—"],
    ],
    texto: `${mensagem.trim() ? `Mensagem do aluno:\n${mensagem.trim()}\n\n` : ""}Enunciado:\n${q.enunciado}\n\nAlternativas:\n${alternativas}${q.explicacao ? `\n\nExplicação:\n${q.explicacao}` : ""}`,
    responderPara: user.email ?? undefined,
    link: { url: `${SITE}/admin/questoes/${questao}?voltar=${encodeURIComponent("/admin/questoes/reportes")}`, rotulo: "Abrir e corrigir a questão" },
  });
  // confirmação para o aluno por e-mail (o aviso na tela aparece na hora)
  if (user.email) {
    const para = user.email;
    after(async () => {
      const r = await enviarEmail({
        para, assunto: "Recebemos o seu reporte",
        linhas: [["Questão", q.enunciado.length > 90 ? `${q.enunciado.slice(0, 90)}…` : q.enunciado]],
        texto: `Olá, ${nome.split(" ")[0]}!\n\nJá comunicamos nossa equipe. Caso a resposta esteja incorreta, faremos a correção em nosso sistema.\n\nObrigada!\nEquipe Cabin Crew`,
      });
      if (!r.ok && r.erro !== "e-mail não configurado") console.error("[reporte] e-mail ao aluno:", r.erro);
    });
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ Comentários */

export type Comentario = {
  id: number; pai_id: number | null; texto: string; criado: string; editado: boolean;
  autor: string; foto: string | null; equipe: boolean; curtidas: number; curti: boolean; meu: boolean; apagado: boolean;
};

export async function carregarComentarios(questao: string): Promise<{ itens: Comentario[] } | Erro> {
  if (!UUID.test(questao)) return { erro: "Questão inválida." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("comentarios_da_questao", { p_questao: questao });
  if (error) return mensagemErro(error.message, "Não foi possível carregar os comentários.");
  type Linha = { id: number; pai_id: number | null; texto: string; created_at: string; editado: boolean; autor: string; autor_id: string; avatar_em: string | null; equipe: boolean; curtidas: number; curti: boolean; meu: boolean; apagado: boolean };
  return {
    itens: ((data ?? []) as Linha[]).map((c) => ({
      id: c.id, pai_id: c.pai_id, texto: c.texto, criado: c.created_at, editado: c.editado,
      autor: c.equipe ? "Equipe Cabin Crew" : c.autor, foto: c.equipe ? null : avatarUrl(c.autor_id, c.avatar_em),
      equipe: c.equipe, curtidas: c.curtidas, curti: c.curti, meu: c.meu, apagado: c.apagado,
    })),
  };
}

export async function comentarQuestao(questao: string, pai: number | null, texto: string): Promise<{ ok: true } | Erro> {
  if (!UUID.test(questao)) return { erro: "Questão inválida." };
  if (!texto.trim()) return { erro: "Escreva o seu comentário." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("comentar_questao", { p_questao: questao, p_pai: pai, p_texto: texto.slice(0, 2000) });
  return error ? mensagemErro(error.message, "Não foi possível publicar agora.") : { ok: true };
}

export async function editarComentario(id: number, texto: string): Promise<{ ok: true } | Erro> {
  if (!texto.trim()) return { erro: "Escreva o seu comentário." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("editar_comentario", { p_id: id, p_texto: texto.slice(0, 2000) });
  return error || !data ? mensagemErro(error?.message, "Não foi possível salvar.") : { ok: true };
}

export async function apagarComentario(id: number): Promise<{ ok: true } | Erro> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("apagar_comentario", { p_id: id });
  return error || !data ? mensagemErro(error?.message, "Não foi possível apagar.") : { ok: true };
}

export async function curtirComentario(id: number): Promise<{ curti: boolean } | Erro> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("curtir_comentario", { p_id: id });
  return error ? mensagemErro(error.message, "Não foi possível curtir.") : { curti: data === true };
}

/* ------------------------------------------------------------------ Favoritas */

export async function favoritarQuestao(questao: string, marcar: boolean): Promise<{ ok: true; total: number } | Erro> {
  if (!UUID.test(questao)) return { erro: "Questão inválida." };
  const { supabase, user } = await getUser();
  if (!user) return { erro: "Entre na sua conta para continuar." };
  const { error } = marcar
    ? await supabase.from("questao_favoritas").upsert({ user_id: user.id, questao_id: questao }, { onConflict: "user_id,questao_id", ignoreDuplicates: true })
    : await supabase.from("questao_favoritas").delete().eq("user_id", user.id).eq("questao_id", questao);
  if (error) {
    if (/row-level security/i.test(error.message)) {
      const { data: tem } = await supabase.rpc("tem_plus");
      return tem ? { erro: "Você pode favoritar depois de finalizar a prova e ver o gabarito." } : { erro: "plus", plus: true };
    }
    return mensagemErro(error.message, "Não foi possível salvar agora.");
  }
  // o contador mostra o bloco com mais favoritas (o simulado é por bloco)
  const { maior } = await favoritasPorBloco(supabase);
  revalidatePath("/simulados-anac/favoritas");
  return { ok: true, total: maior };
}

/** Começa o simulado exclusivo das favoritas (form do aviso “Começar”). */
export async function iniciarFavoritas(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar?modo=entrar&next=/simulados-anac/favoritas");
  const bloco = String(form.get("bloco") ?? "").slice(0, 120);
  const { data, error } = await supabase.rpc("iniciar_favoritas", { p_bloco: bloco, p_gabarito: form.get("gabarito") === "on", p_auto: form.get("auto") === "on" });
  if (error || !data) redirect("/simulados-anac/favoritas?erro=1");
  redirect(`/head-hunter/simulado/${data}`);
}
