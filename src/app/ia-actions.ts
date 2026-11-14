"use server";

import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ARQUIVO_OPENAI, MODELO_PADRAO, TRANSCRICAO_PADRAO, configIA, testarChaveIA } from "@/lib/ia-video";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };

/** Admin: chave da OpenAI, modelo e limite de análises por aluno por dia. A chave fica só num arquivo do servidor. */
export async function salvarIA(_: Estado, form: FormData): Promise<Estado> {
  const { profile } = await getUser();
  if (!profile?.is_admin) redirect("/");
  const atual = configIA();
  const nova = String(form.get("chave") ?? "").trim();
  const chave = nova || atual?.chave || "";
  const modelo = String(form.get("modelo") ?? "").trim().slice(0, 60) || MODELO_PADRAO;
  const porDia = Number(form.get("porDia") ?? 3);
  if (!chave) return { erro: "Cole a chave da API da OpenAI." };
  if (!/^[A-Za-z0-9._-]+$/.test(modelo)) return { erro: "Nome de modelo inválido." };
  if (!Number.isInteger(porDia) || porDia < 1 || porDia > 50) return { erro: "O limite por aluno vai de 1 a 50 análises por dia." };
  if (nova) {
    const erro = await testarChaveIA(nova);
    if (erro) return { erro };
  }
  await writeFile(ARQUIVO_OPENAI, JSON.stringify({ chave, modelo, transcricao: atual?.transcricao ?? TRANSCRICAO_PADRAO, porDia, ativo: form.get("ativo") === "on", salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_OPENAI, 0o600).catch(() => {});
  revalidatePath("/admin/ia");
  revalidatePath("/head-hunter/video-apresentacao");
  return { ok: true, msg: nova ? "Chave conferida e salva ✓" : "Salvo ✓" };
}
