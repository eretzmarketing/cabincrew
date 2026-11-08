"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import type { FormState } from "@/app/actions";
import { BANCOS } from "@/lib/crew";

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
    simulado_id: tipo === "simulado" ? num(form, "simulado_id") : null,
    ordem: num(form, "ordem") ?? 1,
    publicado: form.get("publicado") === "on",
    updated_at: new Date().toISOString(),
  };
  if (!dados.modulo_id) return { erro: "Escolha o módulo." };
  if (!dados.titulo || dados.titulo.length < 2) return { erro: "Informe o título da aula." };
  if (dados.tipo === "simulado" && !dados.simulado_id) return { erro: "Escolha qual simulado esta aula abre." };
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
  if (!["forum_ativo", "crew_select_aberto", "manutencao", "anac_para_todos"].includes(chave)) return;
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

/* ---------- Simulados (aluno) ---------- */
export async function iniciarSimulado(form: FormData) {
  const { supabase, user } = await getUser();
  const simulado = Number(form.get("simulado_id"));
  const aula = String(form.get("aula_id") ?? "");
  if (!user) redirect(`/entrar?modo=entrar&next=/crew-select/aula/${aula}`);
  const { data, error } = await supabase.rpc("iniciar_simulado", { p_simulado: simulado });
  if (error || !data) redirect(`/crew-select/aula/${aula}?erro=simulado`);
  redirect(`/crew-select/simulado/${data}?aula=${aula}`);
}

/** Salva uma resposta; chamado a cada clique durante a prova. */
export async function responderQuestao(tentativa: string, questao: string, letra: string) {
  if (!UUID.test(tentativa) || !UUID.test(questao)) return false;
  const { supabase, user } = await getUser();
  if (!user) return false;
  const { data } = await supabase.rpc("responder_questao", { p_tentativa: tentativa, p_questao: questao, p_letra: letra });
  return data === true;
}

export async function finalizarSimulado(form: FormData) {
  const { supabase, user } = await getUser();
  const tentativa = String(form.get("tentativa_id"));
  const aula = String(form.get("aula_id") ?? "");
  if (!user || !UUID.test(tentativa)) redirect("/crew-select");
  await supabase.rpc("finalizar_tentativa", { p_tentativa: tentativa });
  // concluir o simulado marca a aula como feita
  if (UUID.test(aula)) {
    await supabase.from("progresso").upsert({ aula_id: aula, user_id: user.id }, { ignoreDuplicates: true });
  }
  revalidatePath("/crew-select", "layout");
  redirect(`/crew-select/simulado/${tentativa}/resultado${UUID.test(aula) ? `?aula=${aula}` : ""}`);
}

/* ---------- Simulados (administrador) ---------- */
export async function salvarSimulado(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = num(form, "id");
  const dados = {
    titulo: txt(form, "titulo", 160),
    descricao: txt(form, "descricao", 500),
    qtd_questoes: num(form, "qtd_questoes"),
    tempo_min: num(form, "tempo_min"),
    nota_minima: num(form, "nota_minima") ?? 70,
    mostrar_gabarito: form.get("mostrar_gabarito") === "on",
    bancos: form.getAll("bancos").map(String).filter(Boolean),
  };
  if (!dados.titulo) return { erro: "Informe o título." };
  if (!dados.bancos.length) return { erro: "Escolha pelo menos um banco de questões." };
  if (!dados.qtd_questoes || dados.qtd_questoes < 1 || dados.qtd_questoes > 200) return { erro: "Quantidade de questões entre 1 e 200." };
  if (dados.tempo_min !== null && (dados.tempo_min < 1 || dados.tempo_min > 300)) return { erro: "Tempo entre 1 e 300 minutos (ou deixe vazio)." };
  if (dados.nota_minima < 0 || dados.nota_minima > 100) return { erro: "Nota mínima entre 0 e 100." };
  const { error } = id
    ? await supabase.from("simulados").update(dados).eq("id", id)
    : await supabase.from("simulados").insert(dados);
  if (error) return { erro: "Não foi possível salvar o simulado." };
  revalidatePath("/admin/crew-select", "layout");
  if (!id) redirect("/admin/crew-select/simulados");
  return { ok: true, msg: "Simulado salvo." };
}

export async function alternarDinamica(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  await supabase.from("dinamicas").update({ ativo: form.get("ativo") === "true" }).eq("id", id);
  revalidatePath("/admin/crew-select/dinamicas");
  revalidatePath("/crew-select/dinamicas");
}

/* ---------- Lista de interesse (página Em breve) ---------- */
export async function excluirInteressado(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  await supabase.from("interessados").delete().eq("id", id);
  revalidatePath("/admin/interessados");
}

/* ---------- Banco de questões (administrador) ---------- */
const LETRAS = ["A", "B", "C", "D", "E"] as const;
const urlOk = (v: string | null) => !v || /^https?:\/\/\S+$/i.test(v) || v.startsWith("/");

export async function salvarQuestao(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = String(form.get("id") ?? "");
  const banco = String(form.get("banco") ?? "");
  if (!(banco in BANCOS)) return { erro: "Escolha o banco da questão." };

  const alternativas = LETRAS.map((letra) => ({
    letra,
    texto: txt(form, `alt_${letra}`, 2000),
    imagem_url: txt(form, `alt_${letra}_img`, 500),
  })).filter((a) => a.texto || a.imagem_url);
  // Reorganiza as letras na ordem em que ficaram (sem buracos)
  const letraAntiga = new Map<string, string>(alternativas.map((a, i) => [a.letra, LETRAS[i]]));
  const correta = letraAntiga.get(String(form.get("correta") ?? "")) ?? null;
  const dados = {
    banco,
    categoria: txt(form, "categoria", 120),
    contexto: txt(form, "contexto", 6000),
    enunciado: txt(form, "enunciado", 4000),
    imagem_url: txt(form, "imagem_url", 500),
    alternativas: alternativas.map((a, i) => ({ ...a, letra: LETRAS[i] })),
    correta,
    explicacao: txt(form, "explicacao", 4000),
    ativo: form.get("ativo") === "on",
  };
  if (!dados.enunciado) return { erro: "Escreva o enunciado." };
  if (alternativas.length < 2) return { erro: "Preencha pelo menos duas alternativas." };
  if (!correta) return { erro: "Marque qual alternativa é a correta." };
  if (![dados.imagem_url, ...alternativas.map((a) => a.imagem_url)].every(urlOk)) return { erro: "Confira os endereços de imagem (devem começar com https://)." };

  if (UUID.test(id)) {
    const { error } = await supabase.from("questoes").update(dados).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a questão." };
    revalidatePath("/admin/questoes", "layout");
    return { ok: true, msg: "Questão salva." };
  }
  const { data, error } = await supabase.from("questoes").insert(dados).select("id").single();
  if (error || !data) return { erro: "Não foi possível criar a questão." };
  revalidatePath("/admin/questoes", "layout");
  redirect(`/admin/questoes/${data.id}?criada=1`);
}

export async function alternarQuestao(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  await supabase.from("questoes").update({ ativo: form.get("ativo") === "true" }).eq("id", id);
  revalidatePath("/admin/questoes", "layout");
}

export async function excluirQuestao(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const voltar = String(form.get("voltar") ?? "/admin/questoes");
  if (UUID.test(id)) await supabase.from("questoes").delete().eq("id", id);
  revalidatePath("/admin/questoes", "layout");
  redirect(voltar.startsWith("/admin/questoes") ? voltar : "/admin/questoes");
}

/* ---------- Painel Simulado ANAC: acesso, bloqueio e exclusão de alunos ---------- */
function voltarAnac(form: FormData, msg: string) {
  const v = String(form.get("voltar") ?? "");
  const base = v.startsWith("/admin/anac") ? v : "/admin/anac";
  revalidatePath("/admin/anac");
  redirect(`${base}${base.includes("?") ? "&" : "?"}ok=${encodeURIComponent(msg)}#alunos`);
}

export async function liberarAnac(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const liberar = form.get("liberar") === "true";
  if (UUID.test(id)) await supabase.rpc("admin_liberar_anac", { p_user: id, p_liberar: liberar });
  voltarAnac(form, liberar ? "Acesso liberado." : "Acesso removido.");
}

export async function bloquearUsuario(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const bloquear = form.get("bloquear") === "true";
  let msg = bloquear ? "Aluno bloqueado." : "Aluno desbloqueado.";
  if (UUID.test(id)) {
    const { error } = await supabase.rpc("admin_bloquear_usuario", { p_user: id, p_bloquear: bloquear });
    if (error) msg = error.message.includes("administrador") || error.message.includes("própria") ? error.message : "Não foi possível alterar o bloqueio.";
  }
  voltarAnac(form, msg);
}

export async function excluirUsuario(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  let msg = "Aluno excluído da plataforma.";
  if (form.get("confirmo") !== "on") msg = "Marque a confirmação para excluir.";
  else if (UUID.test(id)) {
    const { error } = await supabase.rpc("admin_excluir_usuario", { p_user: id });
    if (error) msg = error.message.includes("administrador") || error.message.includes("própria") ? error.message : "Não foi possível excluir.";
  }
  voltarAnac(form, msg);
}
