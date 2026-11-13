"use server";

import { revalidatePath } from "next/cache";
import { avisarAluno } from "@/lib/whatsapp";
import { COMPANHIAS } from "@/lib/jornada";
import { TODAS_AULAS, MODULOS_INGLES, chaveAula } from "@/lib/ingles-a-bordo";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import type { FormState } from "@/app/actions";
import { BANCOS } from "@/lib/crew";
import { LETRAS, chaveEnunciado, type QuestaoImportada } from "@/lib/importar-questoes";
import type { PerfilOpq } from "@/lib/opq";
import { CHECKLIST_VIDEO, METAS_VIDEO, dentroDoTempo } from "@/lib/video";

const UUID = /^[0-9a-f-]{36}$/i;

/* ---------- Aluno ---------- */
export async function alternarAulaConcluida(form: FormData) {
  const { supabase, user } = await getUser();
  const aulaId = String(form.get("aula_id"));
  if (!user) redirect(`/entrar?modo=entrar&next=/head-hunter/aula/${aulaId}`);
  if (!UUID.test(aulaId)) return;

  if (form.get("concluida") === "true") {
    await supabase.from("progresso").delete().eq("aula_id", aulaId).eq("user_id", user.id);
    revalidatePath(`/head-hunter/aula/${aulaId}`);
    return;
  }
  await supabase.from("progresso").upsert({ aula_id: aulaId, user_id: user.id }, { ignoreDuplicates: true });
  await avisarSeModuloConcluido(supabase, user.id, aulaId);
  revalidatePath("/head-hunter", "layout");
  const proxima = String(form.get("proxima") ?? "");
  if (UUID.test(proxima)) redirect(`/head-hunter/aula/${proxima}`);
}

/** Se a aula fechou o módulo (todas as aulas publicadas concluídas), manda os parabéns no WhatsApp. */
async function avisarSeModuloConcluido(supabase: Awaited<ReturnType<typeof getUser>>["supabase"], userId: string, aulaId: string) {
  const { data: a } = await supabase.from("aulas").select("modulo_id").eq("id", aulaId).maybeSingle();
  if (!a) return;
  const [{ data: m }, { data: aulas }, { data: feitas }] = await Promise.all([
    supabase.from("modulos").select("id, titulo, recurso").eq("id", a.modulo_id).maybeSingle(),
    supabase.from("aulas").select("id, tipo").eq("modulo_id", a.modulo_id).eq("publicado", true),
    supabase.from("progresso").select("aula_id").eq("user_id", userId),
  ]);
  if (!m) return;
  const ok = new Set((feitas ?? []).map((f) => f.aula_id as string));
  const lista = (aulas ?? []).filter((x) => !(m.recurso === "anac" && x.tipo === "simulado"));
  if (lista.length && lista.every((x) => ok.has(x.id))) avisarAluno(supabase, "modulo_concluido", { modulo: m.titulo }, String(m.id));
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
  if (!id) redirect("/admin/head-hunter");
  return { ok: true, msg: "Módulo salvo." };
}

export async function excluirModulo(form: FormData) {
  const { supabase } = await admin();
  await supabase.from("modulos").delete().eq("id", Number(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/head-hunter");
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
  redirect(`/admin/head-hunter/aula/${data.id}?criada=1`);
}

export async function excluirAula(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const modulo = String(form.get("modulo_id"));
  await supabase.from("aulas").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/head-hunter/modulo/${modulo}`);
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

/* ---------- Simulados (aluno) ---------- */
export async function iniciarSimulado(form: FormData) {
  const { supabase, user } = await getUser();
  const simulado = Number(form.get("simulado_id"));
  const aula = String(form.get("aula_id") ?? "");
  const volta = aula ? `/head-hunter/aula/${aula}` : "/simulados-anac";
  if (!user) redirect(`/entrar?modo=entrar&next=${volta}`);
  const { data, error } = await supabase.rpc("iniciar_simulado", { p_simulado: simulado });
  if (error || !data) redirect(`${volta}?erro=simulado`);
  redirect(`/head-hunter/simulado/${data}?aula=${aula}`);
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
  if (!user || !UUID.test(tentativa)) redirect("/head-hunter");
  await supabase.rpc("finalizar_tentativa", { p_tentativa: tentativa });
  // concluir o simulado marca a aula como feita
  if (UUID.test(aula)) {
    await supabase.from("progresso").upsert({ aula_id: aula, user_id: user.id }, { ignoreDuplicates: true });
  }
  revalidatePath("/head-hunter", "layout");
  redirect(`/head-hunter/simulado/${tentativa}/resultado${UUID.test(aula) ? `?aula=${aula}` : ""}`);
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
  revalidatePath("/admin/head-hunter", "layout");
  if (!id) redirect("/admin/head-hunter/simulados");
  return { ok: true, msg: "Simulado salvo." };
}

export async function alternarDinamica(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  await supabase.from("dinamicas").update({ ativo: form.get("ativo") === "true" }).eq("id", id);
  revalidatePath("/admin/head-hunter/dinamicas");
  revalidatePath("/head-hunter/dinamicas");
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

/* ---------- Importar questões em massa (planilha CSV) ---------- */
export type ResultadoImportacao = { inseridas: number; atualizadas: number; repetidas: number; invalidas: number; erro?: string };

export async function importarQuestoes(banco: string, linhas: QuestaoImportada[], pularRepetidas: boolean): Promise<ResultadoImportacao> {
  const { supabase } = await admin();
  const r: ResultadoImportacao = { inseridas: 0, atualizadas: 0, repetidas: 0, invalidas: 0 };
  if (!(banco in BANCOS)) return { ...r, erro: "Banco inválido." };
  if (!Array.isArray(linhas) || linhas.length > 500) return { ...r, erro: "Envie no máximo 500 questões por vez." };

  const s = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const url = (v: string | null) => !v || /^https?:\/\/\S+$/i.test(v) || v.startsWith("/");
  const validas: (QuestaoImportada & { chave: string })[] = [];
  for (const q of linhas) {
    const enunciado = s(q?.enunciado, 4000);
    const alts = (Array.isArray(q?.alternativas) ? q.alternativas : []).slice(0, 5).map((a, i) => ({
      letra: LETRAS[i], texto: s(a?.texto, 2000), imagem_url: s(a?.imagem_url, 500),
    })).filter((a) => a.texto || a.imagem_url);
    const correta = typeof q?.correta === "string" ? q.correta : "";
    if (!enunciado || alts.length < 2 || !alts.some((a) => a.letra === correta) || !url(s(q?.imagem_url, 500)) || !alts.every((a) => url(a.imagem_url))) {
      r.invalidas += 1;
      continue;
    }
    validas.push({
      id: typeof q.id === "string" && UUID.test(q.id) ? q.id : null,
      categoria: s(q.categoria, 120), contexto: s(q.contexto, 6000), enunciado,
      imagem_url: s(q.imagem_url, 500), alternativas: alts, correta, explicacao: s(q.explicacao, 4000),
      ativo: q.ativo !== false, chave: chaveEnunciado(enunciado),
    });
  }

  // o que já existe neste banco (para atualizar pelo id ou pular repetidas)
  const existentes = new Map<string, string>();
  const ids = new Set<string>();
  for (let de = 0; ; de += 1000) {
    const { data } = await supabase.from("questoes").select("id, enunciado").eq("banco", banco).range(de, de + 999);
    if (!data?.length) break;
    for (const e of data) { existentes.set(chaveEnunciado(e.enunciado), e.id); ids.add(e.id); }
    if (data.length < 1000) break;
  }

  const novas: Record<string, unknown>[] = [];
  for (const { chave, id, ...q } of validas) {
    const dados = { banco, ...q };
    if (id && ids.has(id)) {
      const { error } = await supabase.from("questoes").update(dados).eq("id", id);
      if (error) r.invalidas += 1; else r.atualizadas += 1;
      continue;
    }
    if (pularRepetidas && existentes.has(chave)) { r.repetidas += 1; continue; }
    existentes.set(chave, "nova");
    novas.push(dados);
  }
  for (let i = 0; i < novas.length; i += 200) {
    const { error } = await supabase.from("questoes").insert(novas.slice(i, i + 200));
    if (error) return { ...r, erro: "Não foi possível gravar parte das questões. Tente de novo." };
    r.inseridas += Math.min(200, novas.length - i);
  }
  revalidatePath("/admin/questoes", "layout");
  return r;
}

/* ---------- Entrevista em inglês (painel) ---------- */
function revalidarEntrevista() {
  revalidatePath("/admin/entrevista", "layout");
  revalidatePath("/head-hunter/entrevista-ingles", "layout");
}

export async function salvarParteEntrevista(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = Number(form.get("id")) || null;
  const titulo = txt(form, "titulo", 120);
  if (!titulo) return { erro: "Dê um título para a parte." };
  const slugBase = (txt(form, "slug", 60) ?? titulo).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "parte";
  const foto = txt(form, "foto", 300);
  if (foto && !(foto.startsWith("/") || /^https:\/\/\S+$/.test(foto))) return { erro: "A foto precisa ser um endereço https:// ou uma foto do banco de fotos." };
  const dados = {
    titulo,
    titulo_en: txt(form, "titulo_en", 120),
    resumo: txt(form, "resumo", 600),
    foto,
    foto_alt: txt(form, "foto_alt", 200),
    numero: Math.max(1, Math.min(99, Number(form.get("numero")) || 1)),
    publicado: form.get("publicado") === "on",
  };
  if (id) {
    const { error } = await supabase.from("entrevista_partes").update({ ...dados, slug: slugBase }).eq("id", id);
    if (error) return { erro: error.code === "23505" ? "Já existe outra parte com esse endereço. Mude o título ou o endereço." : "Não foi possível salvar a parte." };
    revalidarEntrevista();
    return { ok: true, msg: "Parte salva." };
  }
  const { data, error } = await supabase.from("entrevista_partes").insert({ ...dados, slug: slugBase }).select("id").single();
  if (error || !data) return { erro: error?.code === "23505" ? "Já existe uma parte com esse título. Use outro." : "Não foi possível criar a parte." };
  revalidarEntrevista();
  redirect(`/admin/entrevista/${data.id}?criada=1`);
}

export async function alternarParteEntrevista(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  if (id) await supabase.from("entrevista_partes").update({ publicado: form.get("publicado") === "true" }).eq("id", id);
  revalidarEntrevista();
}

export async function excluirParteEntrevista(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  if (id && form.get("confirmo") === "on") await supabase.from("entrevista_partes").delete().eq("id", id);
  revalidarEntrevista();
  redirect("/admin/entrevista");
}

export async function salvarPerguntaEntrevista(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const id = String(form.get("id") ?? "");
  const parteId = Number(form.get("parte_id"));
  const en = txt(form, "en", 600);
  if (!parteId) return { erro: "Escolha a parte." };
  if (!en) return { erro: "Escreva a pergunta em inglês." };
  const variantes = String(form.get("variantes") ?? "").split(/\r?\n/).map((v) => v.trim()).filter(Boolean).slice(0, 12).map((v) => v.slice(0, 300));
  const dados = {
    parte_id: parteId,
    en,
    pt: txt(form, "pt", 600),
    variantes,
    modelo: txt(form, "modelo", 2000),
    dica: txt(form, "dica", 600),
    ativo: form.get("ativo") === "on",
    updated_at: new Date().toISOString(),
  };
  if (UUID.test(id)) {
    const { error } = await supabase.from("entrevista_perguntas").update(dados).eq("id", id);
    if (error) return { erro: "Não foi possível salvar a pergunta." };
    revalidarEntrevista();
    return { ok: true, msg: "Pergunta salva." };
  }
  const { data: ultima } = await supabase.from("entrevista_perguntas").select("ordem").eq("parte_id", parteId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase.from("entrevista_perguntas").insert({ ...dados, ordem: (ultima?.ordem ?? 0) + 1 }).select("id").single();
  if (error || !data) return { erro: "Não foi possível criar a pergunta." };
  revalidarEntrevista();
  redirect(`/admin/entrevista/pergunta/${data.id}?criada=1`);
}

export async function alternarPerguntaEntrevista(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (UUID.test(id)) await supabase.from("entrevista_perguntas").update({ ativo: form.get("ativo") === "true" }).eq("id", id);
  revalidarEntrevista();
}

/** Sobe ou desce a pergunta uma posição dentro da parte (renumera a parte inteira). */
export async function moverPerguntaEntrevista(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const parteId = Number(form.get("parte_id"));
  const dir = form.get("dir") === "cima" ? -1 : 1;
  if (!UUID.test(id) || !parteId) return;
  const { data } = await supabase.from("entrevista_perguntas").select("id").eq("parte_id", parteId).order("ordem").order("id");
  const ids = (data ?? []).map((q) => q.id as string);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((qid, k) => supabase.from("entrevista_perguntas").update({ ordem: k + 1 }).eq("id", qid)));
  revalidarEntrevista();
}

export async function excluirPerguntaEntrevista(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  const parteId = Number(form.get("parte_id"));
  if (UUID.test(id)) await supabase.from("entrevista_perguntas").delete().eq("id", id);
  revalidarEntrevista();
  redirect(parteId ? `/admin/entrevista/${parteId}` : "/admin/entrevista");
}

/* ---------- Biblioteca de mídia ---------- */
export async function salvarMidia(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  await supabase.from("midias").update({
    titulo: txt(form, "titulo", 120),
    descricao: txt(form, "descricao", 500),
    pasta: txt(form, "pasta", 60),
  }).eq("id", id);
  revalidatePath("/admin/midia");
}

export async function excluirMidia(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("id"));
  if (!UUID.test(id)) return;
  const { data } = await supabase.from("midias").select("arquivo, miniatura").eq("id", id).maybeSingle();
  if (!data) return;
  const { rm } = await import("node:fs/promises");
  const { caminhoSeguro } = await import("@/lib/midia");
  for (const rel of [data.arquivo, data.miniatura]) {
    const alvo = rel ? caminhoSeguro(rel) : null;
    if (alvo) await rm(alvo, { force: true });
  }
  await supabase.from("midias").delete().eq("id", id);
  revalidatePath("/admin/midia");
}

/** Exclui vários arquivos de uma vez (seleção na biblioteca). */
export async function excluirMidias(ids: string[]) {
  const { supabase } = await admin();
  const validos = (Array.isArray(ids) ? ids : []).filter((i) => UUID.test(i)).slice(0, 500);
  if (!validos.length) return 0;
  const { data } = await supabase.from("midias").select("id, arquivo, miniatura").in("id", validos);
  const { rm } = await import("node:fs/promises");
  const { caminhoSeguro } = await import("@/lib/midia");
  for (const m of data ?? []) {
    for (const rel of [m.arquivo, m.miniatura]) {
      const alvo = rel ? caminhoSeguro(rel) : null;
      if (alvo) await rm(alvo, { force: true });
    }
  }
  await supabase.from("midias").delete().in("id", validos);
  revalidatePath("/admin/midia");
  return (data ?? []).length;
}

/** Move vários arquivos para uma pasta (vazio = sem pasta). */
export async function moverMidias(ids: string[], pasta: string) {
  const { supabase } = await admin();
  const validos = (Array.isArray(ids) ? ids : []).filter((i) => UUID.test(i)).slice(0, 500);
  if (!validos.length) return;
  await supabase.from("midias").update({ pasta: pasta.trim().slice(0, 60) || null }).in("id", validos);
  revalidatePath("/admin/midia");
}

/** Renomeia (título) direto na grade. */
export async function renomearMidia(id: string, titulo: string) {
  const { supabase } = await admin();
  if (!UUID.test(id)) return;
  await supabase.from("midias").update({ titulo: titulo.trim().slice(0, 120) || null }).eq("id", id);
  revalidatePath("/admin/midia");
}

/* ---------- Flight Attendant English ---------- */
export async function salvarQuizIngles(aula: string, nota: number): Promise<{ ok: boolean; concluida: boolean; melhor: number }> {
  const { supabase, user } = await getUser();
  const n = Math.max(0, Math.min(100, Math.round(Number(nota) || 0)));
  if (!user || !/^\d{1,2}\.\d{1,2}$/.test(aula)) return { ok: false, concluida: false, melhor: n };
  const { data: atual } = await supabase.from("ingles_progresso").select("nota").eq("user_id", user.id).eq("aula", aula).maybeSingle();
  const melhor = Math.max(n, atual?.nota ?? 0);
  const concluida = melhor >= 70;
  const { error } = await supabase
    .from("ingles_progresso")
    .upsert({ user_id: user.id, aula, nota: melhor, concluida, updated_at: new Date().toISOString() }, { onConflict: "user_id,aula" });
  revalidatePath("/english", "layout");
  if (!error && concluida) {
    const { data: prog } = await supabase.from("ingles_progresso").select("aula").eq("user_id", user.id).eq("concluida", true);
    const ok = new Set((prog ?? []).map((x) => x.aula as string));
    const mod = MODULOS_INGLES.find((m) => m.aulas.some((x) => chaveAula(x) === aula));
    if (mod && mod.aulas.every((x) => ok.has(chaveAula(x)))) avisarAluno(supabase, "ingles_modulo", { numero: mod.numero, modulo: mod.titulo }, String(mod.numero));
    if (TODAS_AULAS.every((x) => ok.has(chaveAula(x)))) {
      avisarAluno(supabase, "ingles_concluido");
      // acesso comprado: ao concluir o curso começam os dias extras para revisar
      await supabase.rpc("concluir_acesso", { p_produto: "english" });
    }
  }
  return { ok: !error, concluida, melhor };
}

/* ---------- Perfil comportamental (OPQ) ---------- */
export async function registrarOpq(respostas: { id: string; v: number }[]): Promise<{ perfil?: PerfilOpq; erro?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { erro: "Faça login para salvar seu resultado." };
  const limpas = respostas.filter((r) => /^[0-9a-f-]{36}$/i.test(r.id) && Number.isInteger(r.v) && r.v >= 1 && r.v <= 5).slice(0, 80);
  const { data, error } = await supabase.rpc("opq_registrar", { p_respostas: limpas });
  if (error) return { erro: error.message.includes("10 afirma") ? "Responda pelo menos 10 afirmações." : "Não foi possível calcular agora. Tente de novo." };
  revalidatePath("/head-hunter/perfil-comportamental");
  return { perfil: data as PerfilOpq };
}

export async function salvarAfirmacaoOpq(_: unknown, form: FormData): Promise<{ erro?: string; msg?: string }> {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) return { erro: "Acesso restrito." };
  const id = String(form.get("id") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  const traco = String(form.get("traco") ?? "");
  const direcao = Number(form.get("direcao")) === -1 ? -1 : 1;
  const ativo = form.get("ativo") === "on";
  if (texto.length < 8) return { erro: "Escreva a afirmação." };
  const dados = { texto, traco, direcao, ativo };
  const { error } = id
    ? await supabase.from("opq_afirmacoes").update(dados).eq("id", id)
    : await supabase.from("opq_afirmacoes").insert({ ...dados, codigo: `ADM-${Date.now().toString(36)}`, origem: "admin" });
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/admin/opq");
  return { msg: id ? "Salvo." : "Afirmação criada." };
}

/* ---------- Vídeo de apresentação ---------- */
export async function salvarVideoTreino(d: { duracao: number; meta: number; checklist: string[] }): Promise<{ nota?: number; erro?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { erro: "Faça login para salvar." };
  const validos = new Set(CHECKLIST_VIDEO.map((c) => c.id));
  const duracao = Math.min(600, Math.max(1, Math.round(Number(d.duracao) || 0)));
  const meta = METAS_VIDEO.some((m) => m.seg === d.meta) ? d.meta : 90;
  const marcados = [...new Set((d.checklist ?? []).filter((x) => validos.has(x) && x !== "tempo"))];
  if (dentroDoTempo(duracao, meta)) marcados.push("tempo");
  const nota = Math.round((marcados.length / CHECKLIST_VIDEO.length) * 100);
  const { error } = await supabase.from("video_treinos").insert({ user_id: user.id, duracao_seg: duracao, meta_seg: meta, checklist: marcados, nota });
  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };
  revalidatePath("/head-hunter/video-apresentacao");
  revalidatePath("/head-hunter");
  return { nota };
}

/* ---------- Ranking ---------- */
export async function alternarRanking(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase.rpc("definir_ranking_oculto", { p_oculto: form.get("oculto") === "1" });
  revalidatePath("/head-hunter/ranking");
}

/* ---------- Jornada ---------- */
export async function iniciarTreino(form: FormData) {
  const { supabase, user } = await getUser();
  const banco = String(form.get("banco") ?? "");
  if (!user) redirect("/entrar?modo=entrar&next=/head-hunter");
  if (!/^[a-z]{3,12}$/.test(banco)) redirect("/head-hunter");
  const { data, error } = await supabase.rpc("iniciar_treino", { p_banco: banco });
  if (error || !data) redirect(banco === "anac" ? "/simulados-anac?erro=treino" : "/head-hunter?erro=treino");
  redirect(`/head-hunter/simulado/${data}`);
}

export async function salvarCheckin(_: unknown, form: FormData): Promise<{ erro?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { erro: "Faça login." };
  const principal = String(form.get("principal") ?? "");
  const outras = form.getAll("tambem").map(String).filter((c) => c !== principal);
  const lista = [principal, ...outras].filter((c) => ["latam", "gol", "azul"].includes(c));
  if (!lista.length) return { erro: "Escolha sua companhia principal." };
  const data = String(form.get("data_meta") ?? "");
  const { error } = await supabase.rpc("salvar_checkin", { p_companhias: lista, p_data: /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : null });
  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };
  avisarAluno(supabase, "checkin", { companhia: COMPANHIAS.find((c) => c.slug === lista[0])?.nome ?? "companhia dos seus sonhos" });
  revalidatePath("/head-hunter", "layout");
  redirect("/head-hunter#jornada");
}

export async function conferirQuestao(tentativa: string, questao: string): Promise<{ correta: string; explicacao: string | null } | null> {
  if (!UUID.test(tentativa) || !UUID.test(questao)) return null;
  const { supabase, user } = await getUser();
  if (!user) return null;
  const { data } = await supabase.rpc("conferir_questao", { p_tentativa: tentativa, p_questao: questao });
  const r = (data ?? [])[0] as { correta: string; explicacao: string | null } | undefined;
  return r ?? null;
}

export async function registrarSaidaAba(tentativa: string): Promise<number> {
  if (!UUID.test(tentativa)) return 0;
  const { supabase, user } = await getUser();
  if (!user) return 0;
  const { data } = await supabase.rpc("registrar_saida_aba", { p_tentativa: tentativa });
  return typeof data === "number" ? data : 0;
}
