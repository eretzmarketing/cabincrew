"use server";

import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ARQUIVO_OPENAI, MODELO_PADRAO, POR_ALUNO_PADRAO, TRANSCRICAO_PADRAO, configIA, testarChaveIA } from "@/lib/ia-video";
import { getUser } from "@/lib/supabase/server";
import { enviarWhatsapp, whatsappConfigurado } from "@/lib/whatsapp";

type Estado = { ok?: boolean; msg?: string; erro?: string };

/** Admin: chave da OpenAI, modelo e limite de análises por aluno. A chave fica só num arquivo do servidor. */
export async function salvarIA(_: Estado, form: FormData): Promise<Estado> {
  const { profile } = await getUser();
  if (!profile?.is_admin) redirect("/");
  const atual = configIA();
  const nova = String(form.get("chave") ?? "").trim();
  const chave = nova || atual?.chave || "";
  const modelo = String(form.get("modelo") ?? "").trim().slice(0, 60) || MODELO_PADRAO;
  const porAluno = Number(form.get("porAluno") ?? POR_ALUNO_PADRAO);
  const porAlunoCv = Number(form.get("porAlunoCv") ?? POR_ALUNO_PADRAO);
  if (!chave) return { erro: "Cole a chave da API da OpenAI." };
  if (!/^[A-Za-z0-9._-]+$/.test(modelo)) return { erro: "Nome de modelo inválido." };
  if (![porAluno, porAlunoCv].every((n) => Number.isInteger(n) && n >= 1 && n <= 50)) return { erro: "O limite vai de 1 a 50 análises por aluno." };
  if (nova) {
    const erro = await testarChaveIA(nova);
    if (erro) return { erro };
  }
  await writeFile(ARQUIVO_OPENAI, JSON.stringify({ chave, modelo, transcricao: atual?.transcricao ?? TRANSCRICAO_PADRAO, porAluno, porAlunoCv, ativo: form.get("ativo") === "on", salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_OPENAI, 0o600).catch(() => {});
  revalidatePath("/admin/ia");
  revalidatePath("/head-hunter/video-apresentacao");
  revalidatePath("/head-hunter/curriculo");
  return { ok: true, msg: nova ? "Chave conferida e salva ✓" : "Salvo ✓" };
}

/** Admin: libera análises extras da IA no vídeo para um aluno (e avisa no WhatsApp, se marcado). */
export async function liberarAnalisesIA(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) redirect("/");
  const aluno = String(form.get("aluno") ?? "");
  const qtd = Number(form.get("qtd") ?? 1);
  if (!/^[0-9a-f-]{36}$/.test(aluno) || !Number.isInteger(qtd) || qtd < 1 || qtd > 20) return { erro: "Dados inválidos." };
  const cv = form.get("recurso") === "curriculo";
  const fn = cv ? "curriculo_ia_liberar" : "video_ia_liberar";
  const { error } = await supabase.rpc(fn, { p_user: aluno, p_qtd: qtd });
  if (error) return { erro: error.message.includes(fn) ? `Falta rodar o SQL ${cv ? "0064_curriculo_ia" : "0063_video_ia_limite"}.sql no Supabase.` : "Não foi possível liberar agora." };
  let aviso = "";
  if (form.get("avisar") === "on" && whatsappConfigurado()) {
    const { data: p } = await supabase.from("profiles").select("nome, apelido, whatsapp").eq("id", aluno).single();
    if (p?.whatsapp) {
      const nome = String(p.nome || p.apelido || "").split(" ")[0];
      const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://cabincrew.com.br").replace(/\/$/, "");
      const mais = qtd === 1 ? "mais 1 análise" : `mais ${qtd} análises`;
      const texto = cv
        ? `📄 ${nome}, liberamos ${mais} da IA para o seu currículo!\n\nAjuste o currículo com as dicas e envie de novo:\n👉 ${site}/head-hunter/curriculo`
        : `🎬 ${nome}, liberamos ${mais} da IA para o seu vídeo de apresentação!\n\nGrave de novo aplicando as dicas e peça o feedback:\n👉 ${site}/head-hunter/video-apresentacao`;
      const r = await enviarWhatsapp(p.whatsapp as string, texto);
      aviso = r.ok ? " O aluno foi avisado no WhatsApp." : " (O aviso no WhatsApp não foi enviado.)";
    } else aviso = " (O aluno não tem WhatsApp cadastrado.)";
  }
  revalidatePath(`/admin/usuarios/${aluno}`);
  return { ok: true, msg: `Liberado ✓${aviso}` };
}
