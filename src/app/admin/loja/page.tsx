import type { Metadata } from "next";
import Link from "next/link";
import { alterarStatusPedido, salvarObservacaoPedido } from "@/app/loja-actions";
import { Card, Numero, Titulo, btnSecundario } from "@/components/admin-ui";
import CopiarTexto from "@/components/CopiarTexto";
import { EnviarPedidoForm } from "@/components/LojaAdminForms";
import { STATUS_PEDIDO, linkRastreio, reais, type PedidoLoja, type StatusPedido } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedidos da loja" };
export const dynamic = "force-dynamic";

const FILTROS: [string, string][] = [["enviar", "A enviar"], ["enviado", "Enviados"], ["entregue", "Entregues"], ["aguardando", "Aguardando pagamento"], ["todos", "Todos"]];
const quando = (d: string) => new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function PedidosLoja({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const f = (await searchParams).f ?? "enviar";
  const { supabase } = await getUser();
  let q = supabase.from("loja_pedidos").select("*").order("criado_em", { ascending: false }).limit(300);
  if (f === "enviar") q = q.eq("status", "pago");
  else if (f !== "todos") q = q.eq("status", f);
  else q = q.neq("status", "aguardando");
  const [{ data, error }, { data: todos }] = await Promise.all([q, supabase.from("loja_pedidos").select("status, pago_valor, pago_em")]);
  const pedidos = (data ?? []) as PedidoLoja[];
  const t = (todos ?? []) as { status: StatusPedido; pago_valor: number | null; pago_em: string | null }[];
  const mes = new Date().toISOString().slice(0, 7);
  const vendidoMes = t.filter((x) => x.pago_em?.startsWith(mes) && x.status !== "reembolsado").reduce((s, x) => s + Number(x.pago_valor ?? 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Pedidos de apostilas: confira o endereço, poste nos Correios e informe o código de rastreio. O aluno recebe o aviso no WhatsApp.">Pedidos da loja</Titulo>
        <Link href="/admin/loja/produtos" className={btnSecundario}>Produtos e preços</Link>
      </div>
      {error && <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0055_loja.sql</strong> no Supabase para ativar a loja.</p>}
      <div className="flex flex-wrap gap-3">
        <Numero rotulo="A enviar" valor={t.filter((x) => x.status === "pago").length} detalhe="pagos e ainda não postados" />
        <Numero rotulo="A caminho" valor={t.filter((x) => x.status === "enviado").length} detalhe="enviados, sem confirmação de entrega" />
        <Numero rotulo="Vendido no mês" valor={reais(vendidoMes)} detalhe="pagamentos aprovados" />
      </div>
      <nav aria-label="Filtrar pedidos" className="flex flex-wrap gap-2">
        {FILTROS.map(([k, r]) => (
          <Link key={k} href={`/admin/loja?f=${k}`} aria-current={f === k ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-sm font-semibold ${f === k ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"}`}>{r}</Link>
        ))}
      </nav>
      {!pedidos.length && <p className="rounded-2xl bg-white p-8 text-center text-ink-2">{f === "enviar" ? "Nenhum pedido esperando envio. 🎉" : "Nenhum pedido aqui."}</p>}
      {pedidos.map((p) => {
        const etiqueta = `${p.nome}\n${p.endereco.rua}, ${p.endereco.numero}${p.endereco.complemento ? ` - ${p.endereco.complemento}` : ""}\n${p.endereco.bairro ? `${p.endereco.bairro} - ` : ""}${p.endereco.cidade}/${p.endereco.uf}\nCEP ${p.endereco.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}`;
        return (
          <Card key={p.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <strong className="font-display text-lg">Pedido nº {p.id} · {p.quantidade > 1 ? `${p.quantidade}× ` : ""}{p.produto_nome}</strong>
                <span className="text-[14px] text-ink-2">{p.nome}{p.telefone ? ` · ${p.telefone}` : ""}{p.email ? ` · ${p.email}` : ""}{p.cpf ? ` · CPF ${p.cpf}` : ""}</span>
                <span className="text-[13px] text-muted">Feito em {quando(p.criado_em)}{p.pago_em ? ` · pago em ${quando(p.pago_em)}` : ""}{p.pago_valor ? ` · ${reais(p.pago_valor)} (${p.metodo === "pix" ? "Pix" : "cartão"})` : ""}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${STATUS_PEDIDO[p.status].cor}`}>{STATUS_PEDIDO[p.status].rotulo}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-xl bg-soft p-4">
                <span className="text-[13px] font-semibold text-muted">Endereço de entrega</span>
                <pre className="font-sans text-[15px] whitespace-pre-wrap">{etiqueta}</pre>
                <CopiarTexto texto={etiqueta} rotulo="Copiar endereço para a etiqueta" />
              </div>
              <div className="flex flex-col gap-3">
                {(p.status === "pago" || p.status === "enviado") && <EnviarPedidoForm id={p.id} rastreio={p.rastreio} temTelefone={!!p.telefone} />}
                {p.rastreio && <a href={linkRastreio(p.rastreio)} target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-navy underline">Rastrear {p.rastreio} nos Correios ↗</a>}
                <div className="flex flex-wrap gap-2">
                  {p.status === "enviado" && <form action={alterarStatusPedido}><input type="hidden" name="id" value={p.id} /><button name="acao" value="entregue" className="min-h-10 cursor-pointer rounded-full bg-[#e5f6ec] px-4 text-[14px] font-semibold text-[#0f6b3a]">Marcar como entregue</button></form>}
                  {(p.status === "enviado" || p.status === "entregue") && <form action={alterarStatusPedido}><input type="hidden" name="id" value={p.id} /><button name="acao" value="voltar-pago" className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-[14px] font-semibold">Voltar para &quot;a enviar&quot;</button></form>}
                  {p.status === "aguardando" && <form action={alterarStatusPedido}><input type="hidden" name="id" value={p.id} /><button name="acao" value="cancelar" className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-[14px] font-semibold text-brand-deep">Cancelar pedido</button></form>}
                </div>
                <form action={salvarObservacaoPedido} className="flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <label className="sr-only" htmlFor={`obs-${p.id}`}>Observação</label>
                  <input id={`obs-${p.id}`} name="observacao" defaultValue={p.observacao ?? ""} placeholder="Observação interna (opcional)" className="min-h-10 flex-1 rounded-xl border border-[#c9cedb] px-3 text-[14px]" />
                  <button className="min-h-10 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold">Salvar</button>
                </form>
              </div>
            </div>
            {p.status === "pago" && <p className="text-[13px] text-muted">Para devolver o dinheiro, faça o reembolso no Mercado Pago: o pedido muda para &quot;Reembolsado&quot; sozinho.</p>}
          </Card>
        );
      })}
    </>
  );
}
