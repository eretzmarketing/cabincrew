"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { INTERVALOS, type PessoaAluno } from "@/lib/campanhas";
import { getUser } from "@/lib/supabase/server";
import { enviarWhatsapp, preencher, urlPublicaMidia } from "@/lib/whatsapp";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

/* ---------- Modelos ---------- */
export async function salvarTemplate(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const id = Number(form.get("id")) || null;
  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const texto = String(form.get("texto") ?? "").trim();
  const imagem = String(form.get("imagem") ?? "").trim() || null;
  if (nome.length < 2) return { erro: "Dê um nome ao modelo (ex.: Black Friday 2026)." };
  if (texto.length < 2 || texto.length > 3000) return { erro: "Escreva a mensagem (até 3.000 caracteres)." };
  if (imagem && !/^imagens\/whatsapp\/[a-f0-9]{16}\.jpg$/.test(imagem)) return { erro: "Imagem inválida. Envie de novo." };
  if (imagem && texto.length > 1024) return { erro: "Com imagem, o texto pode ter no máximo 1.024 caracteres (limite do WhatsApp para legendas)." };
  const dados = { nome, texto, imagem, updated_at: new Date().toISOString() };
  const { error } = id
    ? await supabase.from("whatsapp_templates").update(dados).eq("id", id)
    : await supabase.from("whatsapp_templates").insert(dados);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/admin/campanhas/modelos");
  return { ok: true, msg: id ? "Modelo atualizado." : "Modelo criado." };
}

export async function excluirTemplate(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) await supabase.from("whatsapp_templates").delete().eq("id", id);
  revalidatePath("/admin/campanhas/modelos");
}

/* ---------- Campanha ---------- */
export async function criarCampanha(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user } = await admin();
  const fonte = String(form.get("fonte")) === "interessados" ? "interessados" : "alunos";
  let ids: string[] = [];
  try { ids = (JSON.parse(String(form.get("ids") ?? "[]")) as string[]).filter((x) => /^[0-9a-f-]{36}$/i.test(x)); } catch { /* vazio */ }
  const templateId = Number(form.get("template_id"));
  const intervalo = INTERVALOS.find((i) => i.id === String(form.get("intervalo"))) ?? INTERVALOS[1];
  if (!ids.length) return { erro: "Selecione pelo menos uma pessoa." };
  if (!Number.isInteger(templateId)) return { erro: "Escolha o modelo da mensagem." };

  const { data: t } = await supabase.from("whatsapp_templates").select("nome, texto, imagem").eq("id", templateId).maybeSingle();
  if (!t) return { erro: "Modelo não encontrado." };

  // destinatários conferidos no banco (não confia na lista do navegador)
  const sel = new Set(ids);
  let destinatarios: { user_id: string | null; nome: string; telefone: string }[] = [];
  if (fonte === "alunos") {
    const { data } = await supabase.rpc("admin_publico_campanha");
    destinatarios = ((data ?? []) as PessoaAluno[])
      .filter((p) => sel.has(p.id) && p.whatsapp && !p.bloqueado)
      .map((p) => ({ user_id: p.id, nome: p.nome ?? "", telefone: p.whatsapp! }));
  } else {
    const { data } = await supabase.from("interessados").select("id, nome, telefone").in("id", ids.slice(0, 20000));
    destinatarios = (data ?? []).map((p) => ({ user_id: null, nome: p.nome as string, telefone: p.telefone as string }));
  }
  const vistos = new Set<string>();
  destinatarios = destinatarios.filter((d) => { const k = d.telefone.replace(/\D/g, ""); if (vistos.has(k)) return false; vistos.add(k); return true; });
  if (!destinatarios.length) return { erro: "Nenhuma das pessoas selecionadas tem WhatsApp cadastrado." };

  const { data: c, error } = await supabase.from("whatsapp_campanhas").insert({
    nome: t.nome, texto: t.texto, imagem: t.imagem, fonte, filtros: { selecionados: ids.length },
    intervalo_min: intervalo.min, intervalo_max: intervalo.max, status: "pausada", total: destinatarios.length, criado_por: user!.id,
  }).select("id").single();
  if (error || !c) return { erro: "Não foi possível criar a campanha." };
  for (let i = 0; i < destinatarios.length; i += 500) {
    const { error: e2 } = await supabase.from("whatsapp_campanha_envios").insert(destinatarios.slice(i, i + 500).map((d) => ({ campanha_id: c.id, ...d })));
    if (e2) return { erro: "Não foi possível montar a lista de envio." };
  }
  revalidatePath("/admin/campanhas");
  redirect(`/admin/campanhas/${c.id}`);
}

export type Contagem = { total: number; enviada: number; erro: number; sem_whatsapp: number; pendente: number };

async function contar(supabase: Awaited<ReturnType<typeof admin>>["supabase"], id: number): Promise<Contagem> {
  const { data } = await supabase.from("whatsapp_campanha_envios").select("status").eq("campanha_id", id);
  const c: Contagem = { total: 0, enviada: 0, erro: 0, sem_whatsapp: 0, pendente: 0 };
  for (const r of data ?? []) {
    c.total++;
    const s = r.status as string;
    if (s === "enviada") c.enviada++;
    else if (s === "erro") c.erro++;
    else if (s === "sem_whatsapp") c.sem_whatsapp++;
    else c.pendente++;
  }
  return c;
}

/** Envia a próxima mensagem da campanha (chamado pela página da campanha, uma por vez). */
export async function enviarProximo(id: number): Promise<{ estado: "enviou" | "aguardar" | "fim" | "parada" | "erro"; aguardar: number; contagem?: Contagem; ultimo?: string; erro?: string }> {
  const { supabase } = await admin();
  const { data, error } = await supabase.rpc("campanha_proximo", { p_campanha: id });
  if (error) return { estado: "erro", aguardar: 30, erro: "Falha ao consultar a fila." };
  const r = ((data ?? []) as { acao: string; aguardar: number; envio_id: number | null; nome: string | null; telefone: string | null }[])[0];
  if (!r || r.acao === "parada") return { estado: "parada", aguardar: 0, contagem: await contar(supabase, id) };
  if (r.acao === "fim") { revalidatePath("/admin/campanhas"); return { estado: "fim", aguardar: 0, contagem: await contar(supabase, id) }; }
  if (r.acao === "aguardar") return { estado: "aguardar", aguardar: Math.max(1, r.aguardar) };

  const { data: c } = await supabase.from("whatsapp_campanhas").select("texto, imagem, intervalo_min, intervalo_max").eq("id", id).single();
  // sem nome (número digitado à mão): "Olá, !" vira "Olá!"
  const texto = preencher(c!.texto, { nome: (r.nome ?? "").split(" ")[0] }).replace(/(Olá|Oi), !/g, "$1!");
  const res = await enviarWhatsapp(r.telefone!, texto, c!.imagem ? urlPublicaMidia(c!.imagem) : null);
  await supabase.from("whatsapp_campanha_envios")
    .update({ status: res.ok ? "enviada" : res.status, erro: res.ok ? null : res.erro, enviado_em: new Date().toISOString() })
    .eq("id", r.envio_id!);
  const espera = c!.intervalo_min + Math.round(Math.random() * (c!.intervalo_max - c!.intervalo_min));
  return { estado: "enviou", aguardar: espera, contagem: await contar(supabase, id), ultimo: `${r.nome ?? ""} ${res.ok ? "✓" : `✗ ${res.erro}`}`.trim() };
}

export async function mudarStatusCampanha(id: number, status: "enviando" | "pausada" | "cancelada") {
  const { supabase } = await admin();
  await supabase.from("whatsapp_campanhas").update({ status }).eq("id", id).in("status", ["enviando", "pausada"]);
  revalidatePath(`/admin/campanhas/${id}`);
  revalidatePath("/admin/campanhas");
}
