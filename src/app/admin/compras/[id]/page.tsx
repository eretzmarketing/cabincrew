import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Titulo } from "@/components/admin-ui";
import { StatusCompraForm } from "@/components/ComprasForms";
import { FORMAS, STATUS_COMPRA, dataHoraBR, dinheiro, fimArrependimento, type Compra } from "@/lib/compras";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compra" };
export const dynamic = "force-dynamic";

type Hist = { id: number; acao: string; dados: Record<string, unknown>; por: string | null; em: string };
type Uso = { primeira: string | null; ultima: string | null; aulas: number; treinos: number; dias: number };

export default async function CompraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { supabase } = await getUser();
  const { data } = await supabase.from("compras").select("*").eq("id", Number(id)).maybeSingle();
  const c = data as Compra | null;
  if (!c) notFound();
  const [{ data: hist }, uso, excl] = await Promise.all([
    supabase.from("compras_historico").select("id, acao, dados, por, em").eq("compra_id", c.id).order("em"),
    c.user_id ? supabase.rpc("admin_uso_aluno", { p_user: c.user_id }) : Promise.resolve({ data: null }),
    c.user_id ? supabase.from("contas_excluidas").select("excluida_em, primeira_atividade, ultima_atividade, aulas_concluidas, treinos_feitos, dias_de_estudo").eq("user_id", c.user_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const u = ((uso.data ?? []) as Uso[])[0];
  const e = excl.data as { excluida_em: string; primeira_atividade: string | null; ultima_atividade: string | null; aulas_concluidas: number | null; treinos_feitos: number | null; dias_de_estudo: number | null } | null;
  const fim = fimArrependimento(c.comprada_em);
  const aberto = fim > new Date();
  const usoDepois = e
    ? { primeira: e.primeira_atividade, ultima: e.ultima_atividade, aulas: e.aulas_concluidas ?? 0, treinos: e.treinos_feitos ?? 0, dias: e.dias_de_estudo ?? 0 }
    : u ?? null;

  const linha = (r: string, v: React.ReactNode) => (
    <div className="flex flex-wrap justify-between gap-2 border-b border-[#eceef3] py-2 last:border-0"><span className="text-muted">{r}</span><span className="text-right font-semibold">{v}</span></div>
  );

  return (
    <>
      <Link href="/admin/compras" className="text-sm font-semibold text-navy">← Compras</Link>
      <Titulo sub={`Registro nº ${c.id} · lançado em ${dataHoraBR(c.created_at)}`}>
        {c.produto} <span className={`ml-2 inline-block rounded-full px-3 py-1 align-middle text-sm font-semibold ${STATUS_COMPRA[c.status]?.cor ?? ""}`}>{STATUS_COMPRA[c.status]?.rotulo ?? c.status}</span>
      </Titulo>

      <p className={`rounded-2xl px-5 py-4 font-semibold ${aberto ? "bg-[#fff8e6] text-[#7a5a00]" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>
        {aberto
          ? `Prazo de arrependimento (7 dias) em aberto até ${dataHoraBR(fim)}.`
          : `Prazo de arrependimento (7 dias) encerrado em ${dataHoraBR(fim)}. A compra foi feita em ${dataHoraBR(c.comprada_em)}.`}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-extrabold">Transação</h2>
          <div className="text-[15px]">
            {linha("Data e hora da compra", dataHoraBR(c.comprada_em))}
            {linha("Acesso liberado em", dataHoraBR(c.liberada_em))}
            {linha("Valor", dinheiro(Number(c.valor), c.moeda))}
            {linha("Forma de pagamento", `${FORMAS[c.forma_pagamento] ?? c.forma_pagamento}${c.parcelas ? ` · ${c.parcelas}x` : ""}`)}
            {linha("Plataforma", c.plataforma)}
            {linha("ID da transação", <span className="break-all">{c.id_transacao ?? "—"}</span>)}
            {c.cupom && linha("Cupom", <>{c.cupom}{c.desconto_cupom ? ` (${Number(c.desconto_cupom).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de desconto)` : ""}</>)}
          </div>
          {c.observacao && <p className="rounded-xl bg-soft px-4 py-3 text-[14px] whitespace-pre-line">{c.observacao}</p>}
        </Card>

        <Card>
          <h2 className="font-display text-xl font-extrabold">Comprador</h2>
          <div className="text-[15px]">
            {linha("Nome completo", c.nome)}
            {linha("E-mail", c.email ?? "—")}
            {linha("WhatsApp", c.whatsapp ?? "—")}
            {linha("CPF/CNPJ", c.documento ?? "—")}
            {linha("Cadastro no site", e ? `excluído em ${dataHoraBR(e.excluida_em)}` : c.user_id ? <Link href={`/admin/usuarios/${c.user_id}`} className="underline underline-offset-4">ver aluno</Link> : "sem cadastro")}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-extrabold">Uso da plataforma</h2>
          {!usoDepois || !usoDepois.primeira ? <p className="text-[15px] text-ink-2">Nenhuma atividade registrada{c.user_id ? "" : " (compra sem cadastro vinculado)"}.</p> : (
            <div className="text-[15px]">
              {linha("Primeira atividade", dataHoraBR(usoDepois.primeira))}
              {linha("Última atividade", dataHoraBR(usoDepois.ultima))}
              {linha("Dias com estudo", usoDepois.dias)}
              {linha("Aulas concluídas", usoDepois.aulas)}
              {linha("Treinos e simulados", usoDepois.treinos)}
            </div>
          )}
          <p className="text-[13px] text-muted">{e ? "Resumo guardado no momento em que o aluno excluiu a conta." : "Contado a partir das aulas, treinos, simulados, inglês, perfil e vídeo do aluno."}</p>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-extrabold">Alterar status</h2>
          <p className="text-[14px] text-ink-2">Use para reembolso, cancelamento ou contestação. A compra nunca é apagada.</p>
          <StatusCompraForm id={c.id} atual={c.status} />
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Histórico do registro</h2>
        <ol className="flex flex-col gap-2 text-[14px]">
          {((hist ?? []) as Hist[]).map((h) => (
            <li key={h.id} className="flex flex-wrap justify-between gap-2 border-b border-[#eceef3] pb-2 last:border-0">
              <span>{h.acao === "insert" ? "Compra registrada" : "Alteração"} · status: <strong>{STATUS_COMPRA[String(h.dados.status)]?.rotulo ?? String(h.dados.status)}</strong></span>
              <span className="text-muted">{dataHoraBR(h.em)}</span>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
