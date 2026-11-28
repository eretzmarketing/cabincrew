"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { SITE, enviarEmail } from "@/lib/suporte";
import { avisosLigados, enviarAviso, preencher } from "@/lib/whatsapp";

const UUID = /^[0-9a-f-]{36}$/i;

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin || !ctx.user) throw new Error("Acesso negado");
  return { ...ctx, user: ctx.user };
}

const voltarPara = (form: FormData, padrao: string) => {
  const v = String(form.get("voltar") ?? "");
  return v.startsWith("/admin/") ? v : padrao;
};
const comMsg = (url: string, chave: "ok" | "erro", msg: string) => `${url}${url.includes("?") ? "&" : "?"}${chave}=${encodeURIComponent(msg)}`;

/* ------------------------------------------------------------------ Questões Plus */

export async function salvarPrecoPlus(form: FormData) {
  const { supabase } = await admin();
  const valor = Number(String(form.get("preco") ?? "").replace(/\./g, "").replace(",", "."));
  if (!(valor > 0 && valor < 10000)) redirect(comMsg("/admin/questoes/plus", "erro", "Informe um preço válido, por exemplo 29,90."));
  await supabase.from("configuracoes").upsert({ chave: "plus_preco", valor: Math.round(valor * 100) / 100, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  redirect(comMsg("/admin/questoes/plus", "ok", "Preço salvo."));
}

/** Libera o Questões Plus para um aluno (pelo e-mail ou pela ficha). */
export async function liberarPlus(form: FormData) {
  const { supabase, user } = await admin();
  const volta = voltarPara(form, "/admin/questoes/plus");
  let id = String(form.get("user_id") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!UUID.test(id)) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect(comMsg(volta, "erro", "Informe o e-mail do aluno."));
    const { data } = await supabase.rpc("admin_hh_alunos", { p_busca: email });
    const aluno = ((data ?? []) as { id: string; email: string | null }[]).find((a) => (a.email ?? "").toLowerCase() === email);
    if (!aluno) redirect(comMsg(volta, "erro", `Não achamos uma conta com o e-mail ${email}. O aluno precisa se cadastrar primeiro.`));
    id = aluno.id;
  }
  const prazo = String(form.get("prazo") ?? "30");
  let ate: string | null = null;
  if (prazo === "data") {
    const d = String(form.get("ate") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) redirect(comMsg(volta, "erro", "Escolha a data final."));
    ate = new Date(`${d}T23:59:59-03:00`).toISOString();
  } else if (prazo !== "sem") {
    const dias = Math.min(3650, Math.max(1, Number(prazo) || 30));
    // soma ao prazo atual, se ainda estiver valendo
    const { data: atual } = await supabase.from("plus_assinantes").select("ate").eq("user_id", id).maybeSingle();
    const base = atual?.ate && Date.parse(atual.ate) > Date.now() ? Date.parse(atual.ate) : Date.now();
    ate = new Date(base + dias * 86400000).toISOString();
  }
  const { error } = await supabase.from("plus_assinantes").upsert({
    user_id: id, ate, origem: "manual", observacao: String(form.get("observacao") ?? "").trim().slice(0, 200) || null,
    liberado_por: user.id, updated_at: new Date().toISOString(),
  });
  if (error) redirect(comMsg(volta, "erro", "Não foi possível liberar. Rode o SQL 0070 no Supabase."));
  revalidatePath("/admin/questoes/plus");
  revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath(`/admin/usuarios/${id}/acessos`);
  redirect(comMsg(volta, "ok", ate ? `Questões Plus liberado até ${new Date(ate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.` : "Questões Plus liberado sem prazo."));
}

export async function removerPlus(form: FormData) {
  const { supabase } = await admin();
  const id = String(form.get("user_id") ?? "");
  const volta = voltarPara(form, "/admin/questoes/plus");
  if (UUID.test(id)) await supabase.from("plus_assinantes").delete().eq("user_id", id);
  revalidatePath("/admin/questoes/plus");
  revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath(`/admin/usuarios/${id}/acessos`);
  redirect(comMsg(volta, "ok", "Acesso ao Questões Plus removido."));
}

/* ------------------------------------------------------------------ Reportes */

const SITUACAO: Record<string, string> = {
  corrigido: "Você tinha razão: a questão já foi corrigida no sistema. ✅",
  sem_erro: "Conferimos com atenção e o gabarito dessa questão está correto.",
};

export async function resolverReporte(form: FormData) {
  const { supabase, user } = await admin();
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "");
  const resposta = String(form.get("resposta") ?? "").trim().slice(0, 1500);
  const porEmail = form.get("avisar") === "on";
  const porWhats = form.get("avisar_whats") === "on";
  const todos = form.get("todos") === "on";
  const volta = voltarPara(form, "/admin/questoes/reportes");
  if (!id || !["corrigido", "sem_erro", "aberto"].includes(status)) redirect(volta);

  const { data: rep } = await supabase.from("questao_reportes").select("user_id, questao_id, status").eq("id", id).maybeSingle();
  if (!rep) redirect(volta);
  // responde só este reporte ou todos os abertos da mesma questão
  let alvo = [id];
  if (todos && status !== "aberto") {
    const { data: abertos } = await supabase.from("questao_reportes").select("id").eq("questao_id", rep.questao_id).eq("status", "aberto");
    alvo = [...new Set([id, ...((abertos ?? []) as { id: number }[]).map((r) => r.id)])];
  }
  await supabase.from("questao_reportes").update({
    status, resposta: resposta || null,
    resolvido_em: status === "aberto" ? null : new Date().toISOString(), resolvido_por: status === "aberto" ? null : user.id,
  }).in("id", alvo);

  let avisados = 0;
  if (status !== "aberto") {
    const { data: lista } = await supabase.rpc("admin_reportes", { p_status: "todos" });
    type R = { id: number; aluno_id: string; aluno: string | null; email: string | null; enunciado: string };
    const doAlvo = ((lista ?? []) as R[]).filter((x) => alvo.includes(x.id));
    // um aviso por aluno, mesmo que ele tenha reportado a mesma questão mais de uma vez
    const porAluno = [...new Map(doAlvo.map((r) => [r.aluno_id, r])).values()];
    const ids = porAluno.map((r) => r.aluno_id);
    const { data: perfis } = ids.length ? await supabase.from("profiles").select("id, nome, apelido, whatsapp").in("id", ids) : { data: [] };
    const perfil = new Map(((perfis ?? []) as { id: string; nome: string | null; apelido: string | null; whatsapp: string | null }[]).map((p) => [p.id, p]));
    const { data: modelo } = await supabase.from("whatsapp_modelos").select("texto, ativo").eq("evento", "reporte_respondido").maybeSingle();
    const trecho = (t: string) => (t.length > 140 ? `${t.slice(0, 140)}…` : t);
    const titulo = status === "corrigido" ? "Corrigimos a questão que você reportou" : "Verificamos a questão que você reportou";

    // 1) notificação no painel do aluno (sempre)
    await supabase.from("notificacoes").insert(porAluno.map((r) => ({
      user_id: r.aluno_id, tipo: "reporte", titulo,
      texto: `${SITUACAO[status]}${resposta ? `\n\n💬 ${resposta}` : ""}\n\nQuestão: “${trecho(r.enunciado)}”`,
      link: "/simulados-anac",
    })));
    avisados = porAluno.length;

    after(async () => {
      for (const r of porAluno) {
        const p = perfil.get(r.aluno_id);
        const nome = (p?.nome || p?.apelido || r.aluno || "").split(" ")[0];
        // 2) e-mail
        if (porEmail && r.email) {
          const texto = `Olá, ${nome}!\n\nObrigada por avisar. ${SITUACAO[status].replace(" ✅", "")}${resposta ? `\n\n${resposta}` : ""}\n\nBons estudos!\nEquipe Cabin Crew`;
          const e = await enviarEmail({ para: r.email, assunto: titulo, linhas: [["Questão", trecho(r.enunciado)]], texto });
          if (!e.ok) console.error("[reporte] e-mail de retorno:", e.erro);
        }
        // 3) WhatsApp (ou SMS, conforme o aviso em Configurações › WhatsApp e SMS)
        if (porWhats && p?.whatsapp && modelo?.ativo && avisosLigados()) {
          const vars = { nome, situacao: SITUACAO[status], resposta: resposta ? `💬 ${resposta}\n` : "", link: SITE };
          const res = await enviarAviso(supabase, "reporte_respondido", p.whatsapp, preencher(modelo.texto, vars), vars);
          await supabase.from("whatsapp_envios").insert({
            user_id: r.aluno_id, evento: "reporte_respondido", ref: `reporte-${r.id}-${Date.now()}`, telefone: p.whatsapp,
            texto: res.texto, status: res.ok ? "enviada" : res.status, erro: res.ok ? null : res.erro,
          });
        }
      }
    });
  }
  revalidatePath("/admin/questoes/reportes");
  redirect(comMsg(volta, "ok", status === "aberto" ? "Reporte reaberto." : `${alvo.length > 1 ? `${alvo.length} reportes resolvidos` : "Reporte resolvido"} · ${avisados} ${avisados === 1 ? "aluno avisado" : "alunos avisados"}.`));
}

/** Admin: exclui um reporte sem responder (o aluno já foi atendido por outro canal). */
export async function excluirReporte(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  const volta = voltarPara(form, "/admin/questoes/reportes");
  if (id) await supabase.from("questao_reportes").delete().eq("id", id);
  revalidatePath("/admin/questoes/reportes");
  redirect(comMsg(volta, "ok", "Reporte excluído."));
}

/* ------------------------------------------------------------------ Comentários */

export async function moderarComentario(form: FormData) {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  const acao = String(form.get("acao") ?? "");
  const volta = voltarPara(form, "/admin/questoes/comentarios");
  if (id && (acao === "ocultar" || acao === "mostrar")) await supabase.from("questao_comentarios").update({ oculto: acao === "ocultar" }).eq("id", id);
  if (id && acao === "apagar") await supabase.from("questao_comentarios").delete().eq("id", id);
  revalidatePath("/admin/questoes/comentarios");
  redirect(comMsg(volta, "ok", acao === "apagar" ? "Comentário excluído." : acao === "ocultar" ? "Comentário escondido dos alunos." : "Comentário visível de novo."));
}

export async function responderComoEquipe(form: FormData) {
  const { supabase } = await admin();
  const questao = String(form.get("questao_id") ?? "");
  const pai = Number(form.get("pai_id")) || null;
  const texto = String(form.get("texto") ?? "").trim();
  const volta = voltarPara(form, "/admin/questoes/comentarios");
  if (!UUID.test(questao) || !texto) redirect(comMsg(volta, "erro", "Escreva a resposta."));
  const { error } = await supabase.rpc("comentar_questao", { p_questao: questao, p_pai: pai, p_texto: texto.slice(0, 2000) });
  if (error) redirect(comMsg(volta, "erro", error.message.slice(0, 160)));
  revalidatePath("/admin/questoes/comentarios");
  redirect(comMsg(volta, "ok", "Resposta publicada como Equipe Cabin Crew."));
}
