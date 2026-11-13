"use server";

import { randomBytes } from "node:crypto";
import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { ARQUIVO_MP, configMP, hashChave, testarTokenMP } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

/** Admin: conecta a conta do Mercado Pago (testa o Access Token antes de salvar). */
export async function salvarConexaoMP(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const atual = configMP();
  const publicKey = String(form.get("public_key") ?? "").trim();
  const accessToken = String(form.get("access_token") ?? "").trim() || atual?.accessToken || "";
  const webhookSecret = String(form.get("webhook_secret") ?? "").trim() || atual?.webhookSecret || "";
  if (!/^(APP_USR|TEST)-[A-Za-z0-9-]{8,}$/.test(publicKey)) return { erro: "Cole a Public Key (começa com APP_USR- ou TEST-)." };
  if (!/^(APP_USR|TEST)-[A-Za-z0-9-]{20,}$/.test(accessToken)) return { erro: "Cole o Access Token (começa com APP_USR- ou TEST-)." };
  if (publicKey.split("-")[0] !== accessToken.split("-")[0]) return { erro: "A Public Key e o Access Token precisam ser do mesmo tipo (os dois de produção ou os dois de teste)." };
  if (webhookSecret && !/^[A-Za-z0-9]{16,128}$/.test(webhookSecret)) return { erro: "A assinatura secreta do webhook parece inválida." };

  const teste = await testarTokenMP(accessToken);
  if (!teste.ok) return { erro: `O Mercado Pago recusou: ${teste.erro}` };

  const chave = atual?.chave ?? randomBytes(32).toString("hex");
  const { error } = await supabase.rpc("pagamento_definir_chave", { p_hash: hashChave(chave) });
  if (error) return { erro: "Rode o SQL 0042_pagamentos.sql no Supabase antes de conectar." };
  await writeFile(ARQUIVO_MP, JSON.stringify({ publicKey, accessToken, webhookSecret: webhookSecret || undefined, chave, salvo_em: new Date().toISOString() }), { mode: 0o600 });
  await chmod(ARQUIVO_MP, 0o600).catch(() => {});
  revalidatePath("/admin/pagamentos");
  return { ok: true, msg: `Conectado à conta ${teste.conta} ✓${accessToken.startsWith("TEST-") ? " (modo de teste: nenhuma cobrança é real)" : ""}` };
}

/** Admin: preço, desconto no Pix e se o produto está à venda. */
export async function salvarProduto(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const slug = String(form.get("slug") ?? "");
  const preco = Number(String(form.get("preco") ?? "").replace(/\./g, "").replace(",", "."));
  const desconto = Number(String(form.get("desconto_pix") ?? "0").replace(",", "."));
  const descricao = String(form.get("descricao") ?? "").trim().slice(0, 500);
  const dias = Number(form.get("dias_apos_conclusao") ?? 30);
  if (!Number.isInteger(dias) || dias < 0 || dias > 365) return { erro: "Os dias extras após concluir vão de 0 a 365." };
  if (!Number.isFinite(preco) || preco < 1 || preco > 100000) return { erro: "Informe um preço válido (ex.: 250,00)." };
  if (!Number.isFinite(desconto) || desconto < 0 || desconto > 50) return { erro: "O desconto no Pix vai de 0 a 50%." };
  const { error } = await supabase.from("produtos").update({ preco: Math.round(preco * 100) / 100, desconto_pix: desconto, dias_apos_conclusao: dias, descricao: descricao || null, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString() }).eq("slug", slug);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/admin/produtos");
  revalidatePath("/head-hunter");
  return { ok: true, msg: "Salvo ✓ O novo preço já vale no checkout." };
}

/** Admin: libera ou encerra o acesso de um aluno ao Head Hunter. */
export async function alterarAcesso(form: FormData) {
  const { supabase } = await admin();
  const userId = String(form.get("user_id") ?? "");
  const acao = String(form.get("acao") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return;
  if (acao === "liberar") {
    await supabase.from("acessos").upsert({ user_id: userId, produto: "head-hunter", status: "ativo", liberado_em: new Date().toISOString(), encerrado_em: null, concluido_em: null, expira_em: null, motivo: "liberado pelo administrador" });
  } else if (acao === "encerrar") {
    await supabase.from("acessos").update({ status: "revogado", encerrado_em: new Date().toISOString(), motivo: "encerrado pelo administrador" }).eq("user_id", userId).eq("produto", "head-hunter");
  }
  revalidatePath(`/admin/head-hunter/alunos/${userId}`);
}
