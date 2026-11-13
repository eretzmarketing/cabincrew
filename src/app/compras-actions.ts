"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FORMAS, STATUS_COMPRA } from "@/lib/compras";
import { getUser } from "@/lib/supabase/server";

type Estado = { ok?: boolean; msg?: string; erro?: string };

async function admin() {
  const ctx = await getUser();
  if (!ctx.profile?.is_admin) throw new Error("Acesso negado");
  return ctx;
}

const txt = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

/** Converte "2026-11-12T14:30" (horário de Brasília, do campo do formulário) para data com fuso. */
function dataBrasilia(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Admin: lança uma compra (venda feita fora do site ou importada da plataforma de pagamento). */
export async function registrarCompra(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user } = await admin();
  const email = txt(form, "email").toLowerCase();
  let nome = txt(form, "nome", 120);
  let whatsapp = txt(form, "whatsapp", 30) || null;
  const produto = txt(form, "produto", 120);
  const valor = Number(txt(form, "valor").replace(/\./g, "").replace(",", "."));
  const forma = txt(form, "forma_pagamento");
  const parcelas = Number(txt(form, "parcelas")) || null;
  const plataforma = txt(form, "plataforma", 60);
  const idTransacao = txt(form, "id_transacao", 120) || null;
  const status = txt(form, "status") || "aprovada";
  const comprada = dataBrasilia(txt(form, "comprada_em"));
  const liberada = dataBrasilia(txt(form, "liberada_em")) ?? comprada;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Informe o e-mail do aluno." };
  if (produto.length < 2) return { erro: "Informe o produto (ex.: Head Hunter · anual)." };
  if (!Number.isFinite(valor) || valor < 0) return { erro: "Valor inválido. Use o formato 497,00." };
  if (!FORMAS[forma]) return { erro: "Escolha a forma de pagamento." };
  if (plataforma.length < 2) return { erro: "Informe a plataforma (ex.: Mercado Pago, Hotmart, Pix manual)." };
  if (!STATUS_COMPRA[status]) return { erro: "Status inválido." };
  if (!comprada) return { erro: "Informe a data e a hora da compra." };

  // vincula ao cadastro do aluno, se existir, e guarda os dados da época
  const { data: achados } = await supabase.rpc("admin_hh_alunos", { p_busca: email });
  const aluno = ((achados ?? []) as { id: string; nome: string | null; apelido: string | null; email: string | null; whatsapp: string | null }[])
    .find((a) => (a.email ?? "").toLowerCase() === email);
  if (aluno) {
    nome = nome || aluno.nome || aluno.apelido || "";
    whatsapp = whatsapp || aluno.whatsapp;
  }
  if (nome.length < 3) return { erro: "Este e-mail não tem cadastro no site: informe o nome completo do comprador." };

  const { data, error } = await supabase.from("compras").insert({
    user_id: aluno?.id ?? null, nome, email, whatsapp, documento: txt(form, "documento", 30) || null,
    produto, valor, forma_pagamento: forma, parcelas: forma === "cartao_credito" ? parcelas : null, plataforma,
    id_transacao: idTransacao, status, comprada_em: comprada, liberada_em: liberada, observacao: txt(form, "observacao", 1000) || null,
    criado_por: user!.id,
  }).select("id").single();
  if (error) return { erro: error.code === "23505" ? "Já existe uma compra com este ID de transação nesta plataforma." : "Não foi possível salvar." };
  revalidatePath("/admin/compras");
  redirect(`/admin/compras/${data.id}`);
}

/** Admin: muda o status (reembolso, cancelamento, contestação) com uma justificativa. Nada é apagado. */
export async function alterarStatusCompra(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const id = Number(form.get("id"));
  const status = txt(form, "status");
  const motivo = txt(form, "motivo", 500);
  if (!Number.isInteger(id) || !STATUS_COMPRA[status]) return { erro: "Dados inválidos." };
  if (motivo.length < 3) return { erro: "Escreva o motivo da alteração (fica no histórico)." };
  const { data: atual } = await supabase.from("compras").select("observacao").eq("id", id).single();
  const carimbo = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const observacao = [atual?.observacao, `[${carimbo}] Status → ${STATUS_COMPRA[status].rotulo}: ${motivo}`].filter(Boolean).join("\n");
  const { error } = await supabase.from("compras").update({ status, observacao }).eq("id", id);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/compras");
  return { ok: true, msg: "Status atualizado e registrado no histórico." };
}
