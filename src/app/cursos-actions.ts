"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/actions";
import { ehCurso } from "@/lib/cursos";
import { CURSOS_IDIOMA, type ProdutoIdioma } from "@/lib/cursos-idioma";
import { cursoIdioma } from "@/lib/cursos-dados";
import { aulaEmBranco, ehProdutoIdioma } from "@/lib/idioma-conteudo";
import { textoParaAtividades, textoParaExpressoes, textoParaFalas, textoParaQuiz, textoParaVocab } from "@/lib/idioma-editor";
import { getUser } from "@/lib/supabase/server";

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) redirect("/");
  return ctx;
}

const txt = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
const int = (form: FormData, k: string) => {
  const n = Number(form.get(k));
  return Number.isInteger(n) ? n : NaN;
};
/** Imagem: caminho do próprio site (galeria de Mídia ou imagens do site). */
const imagemValida = (v: string) => /^\/[A-Za-z0-9/_.\-]+$/.test(v) && !v.includes("..");
const semSql = (msg: string) => /idioma_conteudo|cursos|treino_pos_curso|relation|schema cache/i.test(msg);
const ERRO_SQL = "Rode o SQL 0058_cursos_admin.sql no Supabase para editar os cursos.";

function atualizar(slug: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/admin/cursos/${slug}`, "layout");
}

/* ------------------------------------------------------------------ informações do curso */

export async function salvarInfoCurso(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const slug = txt(form, "slug", 40);
  if (!ehCurso(slug)) return { erro: "Curso inválido." };
  const titulo = txt(form, "titulo", 120);
  const descricao = txt(form, "descricao", 4000);
  const imagem = txt(form, "imagem", 300);
  if (titulo.length < 2) return { erro: "Informe o título do curso." };
  if (imagem && !imagemValida(imagem)) return { erro: "Escolha a imagem pelo botão “Enviar imagem” (ou use um endereço do próprio site, começando com /)." };
  const { error } = await supabase.from("cursos").upsert({ slug, titulo, descricao, imagem: imagem || null, atualizado_em: new Date().toISOString() }, { onConflict: "slug" });
  if (error) return { erro: semSql(error.message) ? ERRO_SQL : "Não foi possível salvar." };
  atualizar(slug);
  return { ok: true, msg: "Informações salvas. Já aparecem no site." };
}

/* ------------------------------------------------------------------ Head Hunter: ordem e visibilidade */

export async function moverModuloHH(form: FormData) {
  const { supabase } = await admin();
  const id = int(form, "id");
  const dir = form.get("dir") === "cima" ? -1 : 1;
  const { data } = await supabase.from("modulos").select("id, ordem").order("ordem").order("id");
  const lista = (data ?? []) as { id: number; ordem: number }[];
  const i = lista.findIndex((m) => m.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return;
  const [a, b] = [lista[i], lista[j]];
  // troca as posições (os números dos módulos continuam em sequência)
  await supabase.from("modulos").update({ ordem: b.ordem === a.ordem ? a.ordem + dir : b.ordem }).eq("id", a.id);
  await supabase.from("modulos").update({ ordem: a.ordem }).eq("id", b.id);
  atualizar("head-hunter");
}

export async function alternarModuloHH(form: FormData) {
  const { supabase } = await admin();
  const id = int(form, "id");
  const { data } = await supabase.from("modulos").select("publicado").eq("id", id).maybeSingle();
  if (!data) return;
  await supabase.from("modulos").update({ publicado: !data.publicado }).eq("id", id);
  atualizar("head-hunter");
}

export async function alternarTreinoHH(form: FormData) {
  const { supabase } = await admin();
  const id = int(form, "id");
  const { data } = await supabase.from("modulos").select("treino_pos_curso").eq("id", id).maybeSingle();
  if (!data) return;
  await supabase.from("modulos").update({ treino_pos_curso: !data.treino_pos_curso }).eq("id", id);
  atualizar("head-hunter");
}

export async function moverAulaHH(form: FormData) {
  const { supabase } = await admin();
  const id = txt(form, "id", 40);
  const dir = form.get("dir") === "cima" ? -1 : 1;
  const { data: a } = await supabase.from("aulas").select("modulo_id").eq("id", id).maybeSingle();
  if (!a) return;
  const { data } = await supabase.from("aulas").select("id, ordem").eq("modulo_id", a.modulo_id).order("ordem").order("titulo");
  const lista = ((data ?? []) as { id: string; ordem: number }[]).map((x) => x.id);
  const i = lista.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  // renumera o módulo inteiro na nova ordem (1, 2, 3…)
  await Promise.all(lista.map((aid, k) => supabase.from("aulas").update({ ordem: k + 1 }).eq("id", aid)));
  atualizar("head-hunter");
}

export async function alternarAulaHH(form: FormData) {
  const { supabase } = await admin();
  const id = txt(form, "id", 40);
  const { data } = await supabase.from("aulas").select("publicado").eq("id", id).maybeSingle();
  if (!data) return;
  await supabase.from("aulas").update({ publicado: !data.publicado }).eq("id", id);
  atualizar("head-hunter");
}

/* ------------------------------------------------------------------ cursos de idioma */

type Supa = Awaited<ReturnType<typeof getUser>>["supabase"];

async function gravar(supabase: Supa, linha: { curso: ProdutoIdioma; modulo: number; aula: number } & Record<string, unknown>) {
  const { error } = await supabase.from("idioma_conteudo").upsert({ ...linha, atualizado_em: new Date().toISOString() }, { onConflict: "curso,modulo,aula" });
  return error;
}

function lerAlvo(form: FormData) {
  const curso = txt(form, "curso", 20);
  const modulo = int(form, "modulo");
  const aula = form.has("aula") ? int(form, "aula") : 0;
  if (!ehProdutoIdioma(curso) || !(modulo >= 1 && modulo <= 99) || !(aula >= 0 && aula <= 99)) return null;
  return { curso, modulo, aula };
}

/** Todas as linhas já gravadas do curso (para achar o próximo número livre e o que é novo). */
async function linhasDoCurso(supabase: Supa, curso: ProdutoIdioma) {
  const { data } = await supabase.from("idioma_conteudo").select("modulo, aula, novo, excluido, dados").eq("curso", curso);
  return (data ?? []) as { modulo: number; aula: number; novo: boolean; excluido: boolean; dados: Record<string, unknown> }[];
}

export async function salvarModuloIdioma(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return { erro: "Módulo inválido." };
  const foto = txt(form, "foto", 300);
  const dados = { titulo: txt(form, "titulo", 120), tituloEn: txt(form, "tituloEn", 120), resumo: txt(form, "resumo", 600), foto };
  if (dados.titulo.length < 2) return { erro: "Informe o título do módulo." };
  if (foto && !imagemValida(foto)) return { erro: "Escolha a imagem pelo botão “Enviar imagem”." };
  if (!foto) delete (dados as Partial<typeof dados>).foto;
  const error = await gravar(supabase, { ...alvo, aula: 0, dados });
  if (error) return { erro: semSql(error.message) ? ERRO_SQL : "Não foi possível salvar o módulo." };
  atualizar(alvo.curso);
  return { ok: true, msg: "Módulo salvo." };
}

export async function novoModuloIdioma(form: FormData) {
  const { supabase } = await admin();
  const curso = txt(form, "curso", 20);
  if (!ehProdutoIdioma(curso)) return;
  const linhas = await linhasDoCurso(supabase, curso);
  const numero = Math.max(0, ...CURSOS_IDIOMA[curso].modulos.map((m) => m.numero), ...linhas.map((l) => l.modulo)) + 1;
  if (numero > 99) return;
  const error = await gravar(supabase, { curso, modulo: numero, aula: 0, novo: true, oculto: true, ordem: 9000 + numero, dados: { titulo: "Novo módulo", tituloEn: "", resumo: "" } });
  if (error) redirect(`/admin/cursos/${curso}?erro=sql`);
  atualizar(curso);
  redirect(`/admin/cursos/${curso}?editar=${numero}#m-${numero}`);
}

export async function alternarIdioma(form: FormData) {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return;
  const { data } = await supabase.from("idioma_conteudo").select("oculto").match(alvo).maybeSingle();
  const error = await gravar(supabase, { ...alvo, oculto: !data?.oculto });
  if (error) redirect(`/admin/cursos/${alvo.curso}?erro=sql`);
  atualizar(alvo.curso);
}

export async function excluirIdioma(form: FormData) {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return;
  const linhas = await linhasDoCurso(supabase, alvo.curso);
  const esta = linhas.find((l) => l.modulo === alvo.modulo && l.aula === alvo.aula);
  if (esta?.novo) {
    // criado no admin: apaga de vez (módulo novo leva junto as aulas dele)
    const q = supabase.from("idioma_conteudo").delete().eq("curso", alvo.curso).eq("modulo", alvo.modulo);
    await (alvo.aula ? q.eq("aula", alvo.aula) : q);
  } else {
    const error = await gravar(supabase, { ...alvo, excluido: true });
    if (error) redirect(`/admin/cursos/${alvo.curso}?erro=sql`);
  }
  atualizar(alvo.curso);
  redirect(`/admin/cursos/${alvo.curso}${alvo.aula ? `#m-${alvo.modulo}` : ""}`);
}

export async function restaurarIdioma(form: FormData) {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return;
  // "excluido": volta a aparecer; "texto": desfaz as edições e volta ao texto original
  const o = form.get("o") === "texto" ? { dados: {} } : { excluido: false };
  await gravar(supabase, { ...alvo, ...o });
  atualizar(alvo.curso);
  if (form.get("o") === "texto") redirect(`/admin/cursos/${alvo.curso}/aula/${alvo.modulo}.${alvo.aula}?restaurada=1`);
}

export async function moverIdioma(form: FormData) {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return;
  const dir = form.get("dir") === "cima" ? -1 : 1;
  const c = await cursoIdioma(alvo.curso, true);
  if (!alvo.aula) {
    const nums = c.modulos.map((m) => m.numero);
    const i = nums.indexOf(alvo.modulo);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= nums.length) return;
    [nums[i], nums[j]] = [nums[j], nums[i]];
    for (const [k, n] of nums.entries()) await gravar(supabase, { curso: alvo.curso, modulo: n, aula: 0, ordem: (k + 1) * 10 });
  } else {
    const m = c.modulos.find((x) => x.numero === alvo.modulo);
    const nums = (m?.aulas ?? []).map((a) => a.numero);
    const i = nums.indexOf(alvo.aula);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= nums.length) return;
    [nums[i], nums[j]] = [nums[j], nums[i]];
    for (const [k, n] of nums.entries()) await gravar(supabase, { curso: alvo.curso, modulo: alvo.modulo, aula: n, ordem: (k + 1) * 10 });
  }
  atualizar(alvo.curso);
}

export async function novaAulaIdioma(form: FormData) {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo) return;
  const c = await cursoIdioma(alvo.curso, true);
  const m = c.modulos.find((x) => x.numero === alvo.modulo);
  if (!m) return;
  const linhas = await linhasDoCurso(supabase, alvo.curso);
  const original = CURSOS_IDIOMA[alvo.curso].modulos.find((x) => x.numero === alvo.modulo);
  const numero = Math.max(0, ...(original?.aulas ?? []).map((a) => a.numero), ...linhas.filter((l) => l.modulo === alvo.modulo).map((l) => l.aula)) + 1;
  if (numero > 99) return;
  const { modulo: _m, numero: _n, ...dados } = aulaEmBranco(alvo.modulo, numero, m.foto);
  void _m; void _n;
  const error = await gravar(supabase, { curso: alvo.curso, modulo: alvo.modulo, aula: numero, novo: true, oculto: true, ordem: (m.aulas.length + 1) * 10 + 5000, dados });
  if (error) redirect(`/admin/cursos/${alvo.curso}?erro=sql`);
  atualizar(alvo.curso);
  redirect(`/admin/cursos/${alvo.curso}/aula/${alvo.modulo}.${numero}?criada=1`);
}

export async function salvarAulaIdioma(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await admin();
  const alvo = lerAlvo(form);
  if (!alvo || !alvo.aula) return { erro: "Aula inválida." };
  const foto = txt(form, "foto", 300);
  const minutos = int(form, "minutos");
  const falas = textoParaFalas(String(form.get("falas") ?? ""));
  const vocab = textoParaVocab(String(form.get("vocabulario") ?? ""));
  const expr = textoParaExpressoes(String(form.get("expressoes") ?? ""));
  const quiz = textoParaQuiz(String(form.get("quiz") ?? ""));
  const ativ = textoParaAtividades(String(form.get("atividades") ?? ""));
  const erros = [...falas.erros, ...vocab.erros, ...expr.erros, ...quiz.erros, ...ativ.erros];
  const titulo = txt(form, "titulo", 160);
  if (titulo.length < 2) erros.unshift("Informe o título da aula.");
  if (!(minutos >= 1 && minutos <= 600)) erros.push("Duração entre 1 e 600 minutos.");
  if (!foto || !imagemValida(foto)) erros.push("Escolha a foto da aula pelo botão “Enviar imagem”.");
  if (!quiz.questoes.length) erros.push("Coloque pelo menos 1 pergunta no quiz (é ele que libera a próxima aula).");
  if (erros.length) return { erro: erros.slice(0, 6).join(" ") };

  const quem = [...new Set(falas.falas.map((f) => f.quem))];
  const dados = {
    titulo, tituloEn: txt(form, "tituloEn", 160), objetivo: txt(form, "objetivo", 600), foto, fotoAlt: txt(form, "fotoAlt", 200), minutos,
    intro: txt(form, "intro", 4000), dica: txt(form, "dica", 1500) || undefined,
    dialogo: { titulo: txt(form, "dialogoTitulo", 160), contexto: txt(form, "dialogoContexto", 600), personagens: quem, falas: falas.falas },
    vocabulario: vocab.itens, expressoes: expr.itens, atividades: ativ.atividades, quiz: quiz.questoes,
  };
  const error = await gravar(supabase, { ...alvo, dados: JSON.parse(JSON.stringify(dados)) });
  if (error) return { erro: semSql(error.message) ? ERRO_SQL : "Não foi possível salvar a aula." };
  atualizar(alvo.curso);
  return { ok: true, msg: "Aula salva. Já aparece para os alunos." };
}

/* ------------------------------------------------------------------ galeria (para escolher mídia nas aulas) */

export type MidiaEscolha = { id: string; tipo: string; arquivo: string; miniatura: string | null; nome: string; titulo: string | null; pasta: string | null; tamanho: number; created_at: string };

export async function listarMidias(tipo: string): Promise<MidiaEscolha[]> {
  const { supabase } = await admin();
  if (!["imagem", "video", "audio", "documento"].includes(tipo)) return [];
  const { data } = await supabase.from("midias").select("id, tipo, arquivo, miniatura, nome, titulo, pasta, tamanho, created_at").eq("tipo", tipo).order("created_at", { ascending: false }).limit(1000);
  return (data ?? []) as MidiaEscolha[];
}
