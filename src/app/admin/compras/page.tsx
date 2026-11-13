import type { Metadata } from "next";
import Link from "next/link";
import { Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { FORMAS, STATUS_COMPRA, dataHoraBR, dinheiro, fimArrependimento, type Compra } from "@/lib/compras";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compras" };
export const dynamic = "force-dynamic";

export default async function ComprasPage({ searchParams }: { searchParams: Promise<{ q?: string; s?: string }> }) {
  const { q = "", s = "" } = await searchParams;
  const { supabase } = await getUser();
  let c = supabase.from("compras").select("*").order("comprada_em", { ascending: false }).limit(500);
  const busca = q.trim().replace(/[%,()]/g, "").slice(0, 60);
  if (busca) c = c.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,whatsapp.ilike.%${busca}%,id_transacao.ilike.%${busca}%,documento.ilike.%${busca}%`);
  if (STATUS_COMPRA[s]) c = c.eq("status", s);
  const { data, error } = await c;
  const lista = (data ?? []) as Compra[];
  const agora = new Date();
  const aprovadas = lista.filter((x) => x.status === "aprovada");
  const noPrazo = aprovadas.filter((x) => fimArrependimento(x.comprada_em) > agora).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Livro de compras: toda venda com forma de pagamento, ID da transação e data e hora. Nada pode ser apagado; mudanças de status ficam no histórico. As compras continuam aqui mesmo se o aluno excluir a conta.">Compras</Titulo>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/compras/csv" download className={btnSecundario}>⬇ Baixar CSV</a>
          <Link href="/admin/compras/nova" className={btnPrimario}>+ Registrar compra</Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0039_compras.sql</strong> no Supabase para ativar esta página.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Numero rotulo="Compras aprovadas" valor={aprovadas.length} detalhe={busca || s ? "no filtro" : "no total"} />
            <Numero rotulo="Valor aprovado" valor={dinheiro(aprovadas.reduce((t, x) => t + Number(x.valor), 0))} />
            <Numero rotulo="Ainda no prazo de 7 dias" valor={noPrazo} detalhe="podem pedir arrependimento" />
          </div>

          <form className="flex flex-wrap gap-2" role="search">
            <label htmlFor="busca" className="sr-only">Buscar</label>
            <input id="busca" name="q" defaultValue={q} placeholder="Nome, e-mail, WhatsApp, CPF ou ID da transação" className="min-h-12 flex-[1_1_280px] rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px]" />
            <label htmlFor="st" className="sr-only">Status</label>
            <select id="st" name="s" defaultValue={s} className="min-h-12 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
              <option value="">Todos os status</option>
              {Object.entries(STATUS_COMPRA).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
            </select>
            <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Filtrar</button>
          </form>

          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[980px] text-left text-[14px]">
              <thead className="border-b border-line text-[13px] text-muted">
                <tr>
                  <th className="p-3 font-semibold">Compra (Brasília)</th>
                  <th className="p-3 font-semibold">Comprador</th>
                  <th className="p-3 font-semibold">Produto</th>
                  <th className="p-3 font-semibold">Valor</th>
                  <th className="p-3 font-semibold">Pagamento</th>
                  <th className="p-3 font-semibold">ID da transação</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Arrependimento (7 dias)</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((x) => {
                  const fim = fimArrependimento(x.comprada_em);
                  const aberto = fim > agora;
                  return (
                    <tr key={x.id} className="border-b border-[#eceef3] align-top last:border-0">
                      <td className="p-3 whitespace-nowrap"><Link href={`/admin/compras/${x.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{dataHoraBR(x.comprada_em)}</Link></td>
                      <td className="p-3">{x.nome}<span className="block text-[13px] text-muted">{x.email}</span>{!x.user_id && <span className="block text-[12px] text-muted">sem cadastro / conta excluída</span>}</td>
                      <td className="p-3">{x.produto}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{dinheiro(Number(x.valor), x.moeda)}</td>
                      <td className="p-3">{FORMAS[x.forma_pagamento] ?? x.forma_pagamento}{x.parcelas ? ` · ${x.parcelas}x` : ""}<span className="block text-[13px] text-muted">{x.plataforma}</span></td>
                      <td className="p-3 text-[13px] break-all">{x.id_transacao ?? "—"}</td>
                      <td className="p-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS_COMPRA[x.status]?.cor ?? ""}`}>{STATUS_COMPRA[x.status]?.rotulo ?? x.status}</span></td>
                      <td className="p-3 text-[13px] whitespace-nowrap">{aberto ? <span className="font-semibold text-[#7a5a00]">no prazo até {dataHoraBR(fim)}</span> : <span className="text-muted">encerrado em {dataHoraBR(fim)}</span>}</td>
                    </tr>
                  );
                })}
                {!lista.length && <tr><td colSpan={8} className="p-6 text-center text-ink-2">Nenhuma compra registrada{busca || s ? " neste filtro" : ""}.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
