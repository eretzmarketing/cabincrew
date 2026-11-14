"use server";

import { randomBytes } from "node:crypto";
import { chmod, writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FORMAS } from "@/lib/compras";
import { normalizarTelefone } from "@/lib/telefone";
import { SITE } from "@/lib/mercadopago";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";
import { ARQUIVO_MP, configMP, hashChave, testarTokenMP } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";
import { CURSOS, SLUGS_CURSOS, ehCurso } from "@/lib/cursos";

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

const CURSOS_BASE = SLUGS_CURSOS;
const ENDERECO: Record<string, string> = Object.fromEntries(CURSOS.map((c) => [c.slug, c.endereco]));

/** Lê e confere os campos comuns de um plano. */
function lerPlano(form: FormData) {
  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const preco = Number(String(form.get("preco") ?? "").replace(/\./g, "").replace(",", "."));
  const desconto = Number(String(form.get("desconto_pix") ?? "0").replace(",", ".") || 0);
  const descricao = String(form.get("descricao") ?? "").trim().slice(0, 500);
  const dias = Number(form.get("dias_apos_conclusao") ?? 30);
  const ordem = Number(form.get("ordem") ?? 0);
  const destaque = String(form.get("destaque") ?? "").trim().slice(0, 30) || null;
  const topicos = String(form.get("topicos") ?? "").split("\n").map((t) => t.trim()).filter(Boolean).slice(0, 12).map((t) => t.slice(0, 140));
  const inclui = CURSOS_BASE.filter((c) => form.getAll("inclui").includes(c));
  if (nome.length < 2) return { erro: "Dê um nome ao plano." } as const;
  if (!Number.isFinite(preco) || preco < 1 || preco > 100000) return { erro: "Informe um preço válido (ex.: 250,00)." } as const;
  if (!Number.isFinite(desconto) || desconto < 0 || desconto > 50) return { erro: "O desconto no Pix vai de 0 a 50%." } as const;
  if (!Number.isInteger(dias) || dias < 0 || dias > 365) return { erro: "Os dias extras após concluir vão de 0 a 365." } as const;
  if (!Number.isInteger(ordem) || ordem < 0 || ordem > 999) return { erro: "A ordem vai de 0 a 999." } as const;
  return {
    dados: {
      nome, preco: Math.round(preco * 100) / 100, desconto_pix: desconto, dias_apos_conclusao: dias, ordem, destaque, topicos,
      descricao: descricao || null, ativo: form.get("ativo") === "on", updated_at: new Date().toISOString(),
    },
    inclui,
  } as const;
}

function revalidarPlanos() {
  revalidatePath("/admin/produtos");
  revalidatePath("/head-hunter");
  revalidatePath("/planos");
}

/** Admin: salva um plano (nome, preço, desconto no Pix, tópicos, tarja, ordem, cursos incluídos, ativo). */
export async function salvarProduto(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const slug = String(form.get("slug") ?? "");
  const r = lerPlano(form);
  if ("erro" in r) return { erro: r.erro };
  const base = CURSOS_BASE.includes(slug);
  if (!base && !r.inclui.length) return { erro: "Marque pelo menos um curso que este plano libera." };
  const extra = base ? {} : { inclui: r.inclui, endereco: ENDERECO[r.inclui[0]] };
  const { error } = await supabase.from("produtos").update({ ...r.dados, ...extra }).eq("slug", slug);
  if (error) return { erro: error.message.includes("excluido") || error.message.includes("ordem") ? "Rode o SQL 0046_planos_editaveis.sql no Supabase." : "Não foi possível salvar." };
  revalidarPlanos();
  return { ok: true, msg: "Salvo ✓ Já vale na página Planos e no checkout." };
}

/** Admin: cria um plano novo (ex.: promoção, combo diferente). */
export async function criarProduto(_: Estado, form: FormData): Promise<Estado> {
  const { supabase } = await admin();
  const r = lerPlano(form);
  if ("erro" in r) return { erro: r.erro };
  if (!r.inclui.length) return { erro: "Marque pelo menos um curso que este plano libera." };
  const base = r.dados.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "plano";
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const { data } = await supabase.from("produtos").select("slug").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${n}`;
  }
  const { error } = await supabase.from("produtos").insert({ slug, ...r.dados, inclui: r.inclui, endereco: ENDERECO[r.inclui[0]] });
  if (error) return { erro: error.message.includes("excluido") || error.message.includes("ordem") ? "Rode o SQL 0046_planos_editaveis.sql no Supabase." : "Não foi possível criar o plano." };
  revalidarPlanos();
  redirect(`/admin/produtos?criado=${slug}#${slug}`);
}

/** Admin: exclui um plano (fica escondido; compras já feitas continuam registradas). */
export async function excluirProduto(form: FormData) {
  const { supabase } = await admin();
  const slug = String(form.get("slug") ?? "");
  if (!slug || CURSOS_BASE.includes(slug)) return;
  await supabase.from("produtos").update({ excluido: true, ativo: false, updated_at: new Date().toISOString() }).eq("slug", slug);
  revalidarPlanos();
}

/** Admin: libera ou encerra o acesso de um aluno ao Head Hunter. */
export async function alterarAcesso(form: FormData) {
  const { supabase } = await admin();
  const userId = String(form.get("user_id") ?? "");
  const acao = String(form.get("acao") ?? "");
  const pedido = String(form.get("produto") ?? "head-hunter");
  const produto = ehCurso(pedido) ? pedido : "head-hunter";
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return;
  if (acao === "liberar") {
    await supabase.from("acessos").upsert({ user_id: userId, produto, status: "ativo", liberado_em: new Date().toISOString(), encerrado_em: null, concluido_em: null, expira_em: null, motivo: "liberado pelo administrador" });
  } else if (acao === "encerrar") {
    await supabase.from("acessos").update({ status: "revogado", encerrado_em: new Date().toISOString(), motivo: "encerrado pelo administrador" }).eq("user_id", userId).eq("produto", produto);
  }
  revalidatePath(`/admin/usuarios/${userId}`);
}

const ORIGENS: Record<string, { rotulo: string; plataforma: string }> = {
  cortesia: { rotulo: "Cortesia", plataforma: "" },
  pix_direto: { rotulo: "Pix direto", plataforma: "Pix direto" },
  presencial: { rotulo: "Curso presencial", plataforma: "Curso presencial" },
  outro: { rotulo: "Outro pagamento por fora", plataforma: "Pagamento por fora" },
};

/** Converte "2026-11-12T14:30" (horário de Brasília) para data com fuso. */
function dataBrasilia(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Admin: adiciona um aluno ao Head Hunter (cortesia ou pagamento feito fora do site).
 * Pagamento por fora entra no Livro de compras. Sem conta no site, o acesso fica reservado pelo e-mail.
 */
export async function adicionarAoCurso(_: Estado, form: FormData): Promise<Estado> {
  const { supabase, user } = await admin();
  const t = (k: string, max = 200) => String(form.get(k) ?? "").trim().slice(0, max);
  const email = t("email").toLowerCase();
  const origem = t("origem");
  const o = ORIGENS[origem];
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Informe o e-mail do aluno." };
  if (!o) return { erro: "Escolha se é cortesia ou pagamento por fora." };
  const { data: prod } = await supabase.from("produtos").select("slug, nome, inclui, endereco").eq("slug", t("produto") || "head-hunter").maybeSingle();
  if (!prod) return { erro: "Escolha o curso." };
  const cursos = ((prod.inclui as string[] | null) ?? [prod.slug as string]);

  const { data: achados } = await supabase.rpc("admin_hh_alunos", { p_busca: email });
  const aluno = ((achados ?? []) as { id: string; nome: string | null; apelido: string | null; email: string | null; whatsapp: string | null }[])
    .find((a) => (a.email ?? "").toLowerCase() === email);
  const nome = t("nome", 120) || aluno?.nome || aluno?.apelido || "";
  const telInformado = t("whatsapp", 30);
  const whatsapp = telInformado ? normalizarTelefone(telInformado) : aluno?.whatsapp ?? null;
  if (telInformado && !whatsapp) return { erro: "WhatsApp inválido. Use DDD + número (ex.: 11 98177-7605) ou +DDI para outros países." };
  if (!aluno && nome.length < 3) return { erro: "Este e-mail ainda não tem conta no site: informe o nome completo." };
  if (aluno) {
    const { data: acs } = await supabase.from("acessos").select("produto, status, expira_em").eq("user_id", aluno.id);
    const ativos = new Set(((acs ?? []) as { produto: string; status: string; expira_em: string | null }[]).filter((a) => a.status === "ativo" && (!a.expira_em || Date.parse(a.expira_em) > Date.now())).map((a) => a.produto));
    if (cursos.every((c) => ativos.has(c))) return { erro: `Este aluno já tem acesso ativo a ${prod.nome}.` };
  }

  // pagamento por fora: entra no Livro de compras
  let compraId: number | null = null;
  if (origem !== "cortesia") {
    const valor = Number(t("valor").replace(/\./g, "").replace(",", "."));
    const forma = t("forma_pagamento");
    const comprada = dataBrasilia(t("comprada_em"));
    if (!Number.isFinite(valor) || valor < 0) return { erro: "Informe o valor pago (ex.: 250,00)." };
    if (!FORMAS[forma]) return { erro: "Escolha a forma de pagamento." };
    if (!comprada) return { erro: "Informe a data e a hora do pagamento." };
    const { data: c, error } = await supabase.from("compras").insert({
      user_id: aluno?.id ?? null, nome, email, whatsapp, documento: t("documento", 30) || null, produto: prod.nome,
      valor, forma_pagamento: forma, parcelas: forma === "cartao_credito" ? Number(t("parcelas")) || 1 : null,
      plataforma: o.plataforma, id_transacao: t("id_transacao", 120) || null, status: "aprovada",
      comprada_em: comprada, liberada_em: new Date().toISOString(), observacao: t("observacao", 1000) || null, criado_por: user!.id,
    }).select("id").single();
    if (error) return { erro: error.code === "23505" ? "Já existe uma compra com este ID de transação." : "Não foi possível registrar a compra." };
    compraId = c.id as number;
  }

  const motivo = `${o.rotulo}${t("observacao", 120) && origem === "cortesia" ? `: ${t("observacao", 120)}` : ""} (liberado pelo administrador)`;
  if (aluno) {
    const { error } = await supabase.from("acessos").upsert(cursos.map((c) => ({
      user_id: aluno.id, produto: c, status: "ativo", compra_id: compraId, liberado_em: new Date().toISOString(),
      encerrado_em: null, concluido_em: null, expira_em: null, motivo,
    })));
    if (error) return { erro: "Não foi possível liberar o acesso." };
  } else {
    const { error } = await supabase.from("acessos_pendentes").upsert(cursos.map((c) => ({ email, produto: c, compra_id: compraId, motivo, nome, whatsapp, criado_por: user!.id, criado_em: new Date().toISOString() })));
    if (error) return { erro: error.message.includes("acessos_pendentes") ? "Rode o SQL 0043_acesso_manual.sql no Supabase." : "Não foi possível reservar o acesso." };
  }

  // aviso no WhatsApp
  let avisado = "";
  if (form.get("avisar") === "on" && whatsapp) {
    const { data: m } = await supabase.from("whatsapp_modelos").select("texto, ativo").eq("evento", "acesso_liberado").maybeSingle();
    if (m?.ativo) {
      const texto = preencher(m.texto, {
        nome: nome.split(" ")[0],
        produto: prod.nome as string,
        passo: aluno ? "É só entrar com o seu e-mail e começar pelo check-in:" : `Crie a sua conta com o e-mail ${email} e o acesso aparece na hora:`,
        endereco: aluno ? `${SITE}${prod.endereco ?? "/head-hunter"}` : `${SITE}/entrar`,
      });
      const r = await enviarWhatsapp(whatsapp, texto);
      await supabase.from("whatsapp_envios").insert({ user_id: aluno?.id ?? null, evento: "acesso_liberado", ref: `${email}-${Date.now()}`, telefone: whatsapp, texto, status: r.ok ? "enviada" : r.status, erro: r.ok ? null : r.erro });
      avisado = r.ok ? " Aviso enviado no WhatsApp ✓" : ` (WhatsApp não enviado: ${r.erro})`;
    }
  }
  revalidatePath("/admin/head-hunter/alunos");
  if (aluno) redirect(`/admin/usuarios/${aluno.id}?ok=acesso`);
  return { ok: true, msg: `Acesso reservado para ${email}. Assim que a pessoa criar a conta com esse e-mail, o ${prod.nome} é liberado sozinho.${avisado}` };
}

/** Admin: cancela um acesso reservado (pessoa sem conta). */
export async function cancelarAcessoPendente(form: FormData) {
  const { supabase } = await admin();
  const email = String(form.get("email") ?? "").toLowerCase();
  const produto = String(form.get("produto") ?? "");
  if (email) await supabase.from("acessos_pendentes").delete().eq("email", email).eq("produto", produto);
  revalidatePath("/admin/head-hunter/alunos/adicionar");
}
