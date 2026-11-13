"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { chmod, unlink, writeFile } from "node:fs/promises";
import { ARQUIVO_CONEXAO, GATILHOS, conexaoWhatsapp, enviarWhatsapp, preencher, testarConexao } from "@/lib/whatsapp";

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
  if (!/^[a-z0-9_]{3,40}$/.test(evento)) return { erro: "Modelo inválido." };
  if (texto.length < 5 || texto.length > 3000) return { erro: "Escreva a mensagem (até 3.000 caracteres)." };
  const dados: Record<string, unknown> = { texto, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString() };
  const titulo = String(form.get("titulo") ?? "").trim();
  const gatilho = String(form.get("gatilho") ?? "");
  if (titulo) {
    if (titulo.length < 2 || titulo.length > 60) return { erro: "Dê um nome ao aviso (até 60 caracteres)." };
    dados.titulo = titulo;
  }
  if (gatilho) {
    if (!GATILHOS[gatilho]) return { erro: "Escolha quando o aviso é enviado." };
    dados.gatilho = gatilho;
    dados.quando = GATILHOS[gatilho] + ".";
  }
  const { error } = await supabase.from("whatsapp_modelos").update(dados).eq("evento", evento);
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

/** Admin: conecta (ou troca) o número do Wawp: testa o Instance ID e o token e grava no servidor. */
export async function salvarConexaoWhatsapp(_: Estado, form: FormData): Promise<Estado> {
  await admin();
  if (form.get("acao") === "desconectar") {
    await unlink(ARQUIVO_CONEXAO).catch(() => {});
    revalidatePath("/admin/whatsapp");
    return { ok: true, msg: conexaoWhatsapp() ? "Removido do painel. Continua valendo a conexão configurada no servidor." : "Desconectado." };
  }
  const instancia = String(form.get("instancia") ?? "").trim();
  let token = String(form.get("token") ?? "").trim();
  if (!token) token = conexaoWhatsapp()?.token ?? ""; // em branco = manter o token atual
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(instancia)) return { erro: "Informe o Instance ID (coluna Instance ID no Wawp)." };
  if (!/^[A-Za-z0-9_\-.]{6,200}$/.test(token)) return { erro: "Informe o Access Token do Wawp." };
  const erro = await testarConexao(instancia, token);
  if (erro) return { erro: `O Wawp recusou: ${erro}` };
  await writeFile(ARQUIVO_CONEXAO, JSON.stringify({ instancia, token, salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_CONEXAO, 0o600).catch(() => {});
  revalidatePath("/admin/whatsapp");
  return { ok: true, msg: "Conectado ✓ Mande um teste abaixo para confirmar." };
}

/** Admin: cria um novo aviso automático, disparado num dos momentos dos avisos padrão. */
export async function criarAvisoPersonalizado(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const titulo = String(form.get("titulo") ?? "").trim();
  const gatilho = String(form.get("gatilho") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  if (titulo.length < 2 || titulo.length > 60) return { erro: "Dê um nome ao aviso (ex.: Dica do comandante)." };
  if (!GATILHOS[gatilho]) return { erro: "Escolha quando o aviso é enviado." };
  if (texto.length < 5 || texto.length > 3000) return { erro: "Escreva a mensagem (até 3.000 caracteres)." };
  const evento = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const { error } = await supabase.from("whatsapp_modelos").insert({
    evento, titulo, quando: GATILHOS[gatilho] + ".", texto, ativo: form.get("ativo") === "on", gatilho, personalizado: true,
  });
  if (error) return { erro: error.message.includes("gatilho") ? "Rode o SQL 0041_avisos_personalizados.sql no Supabase." : "Não foi possível criar o aviso." };
  revalidatePath("/admin/whatsapp");
  return { ok: true, msg: "Aviso criado ✓" };
}

/** Admin: exclui um aviso personalizado (os avisos padrão só podem ser desligados). */
export async function excluirAvisoPersonalizado(form: FormData) {
  const { supabase } = await admin();
  const evento = String(form.get("evento") ?? "");
  if (/^p_[a-z0-9]{10}$/.test(evento)) await supabase.from("whatsapp_modelos").delete().eq("evento", evento).eq("personalizado", true);
  revalidatePath("/admin/whatsapp");
}

/** Admin: reenvia uma mensagem do histórico, com o mesmo texto, e registra o reenvio. */
export async function reenviarWhatsapp(id: number): Promise<Estado> {
  const { supabase } = await admin();
  const { data: e } = await supabase.from("whatsapp_envios").select("user_id, evento, telefone, texto").eq("id", id).maybeSingle();
  if (!e?.telefone || !e.texto) return { erro: "Esta mensagem não tem texto salvo para reenviar." };
  const r = await enviarWhatsapp(e.telefone, e.texto);
  await supabase.from("whatsapp_envios").insert({
    user_id: e.user_id, evento: e.evento, ref: `reenvio-${id}-${Date.now()}`,
    telefone: e.telefone, texto: e.texto, status: r.ok ? "enviada" : r.status, erro: r.ok ? null : r.erro,
  });
  revalidatePath("/admin/whatsapp");
  return r.ok ? { ok: true, msg: "Reenviada ✓" } : { erro: `Não foi enviada: ${r.erro}` };
}
