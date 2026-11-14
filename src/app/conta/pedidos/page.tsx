import type { Metadata } from "next";
import Link from "next/link";
import { ETAPAS_PEDIDO, STATUS_PEDIDO, enderecoEmLinha, etapaDoPedido, linkRastreio, reais, transportadora, type PedidoLoja } from "@/lib/loja";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Meus pedidos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MeusPedidos() {
  const { supabase, user } = await exigirLogin("/conta/pedidos");
  const { data } = await supabase.from("loja_pedidos").select("*").eq("user_id", user.id).neq("status", "aguardando").order("criado_em", { ascending: false });
  const pedidos = (data ?? []) as PedidoLoja[];
  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <Link href="/conta" className="text-sm font-semibold text-navy">← Minha conta</Link>
        <h1 className="font-display text-[32px] font-extrabold">Meus pedidos</h1>
        {!pedidos.length && (
          <p className="rounded-[20px] border border-line bg-white p-6 text-ink-2">Você ainda não comprou nenhuma apostila. <Link href="/loja" className="font-semibold text-navy underline">Ver a loja</Link></p>
        )}
        {pedidos.map((p) => (
          <section key={p.id} className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col">
                <strong className="font-display text-lg">{p.quantidade > 1 ? `${p.quantidade}× ` : ""}{p.produto_nome}</strong>
                <span className="text-[14px] text-muted">Pedido nº {p.id} · {new Date(p.criado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}{p.pago_valor ? ` · ${reais(p.pago_valor)}` : ""}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${STATUS_PEDIDO[p.status].cor}`}>{p.status === "pago" ? "Pagamento confirmado · em preparação" : STATUS_PEDIDO[p.status].rotulo}</span>
            </div>
            {["pago", "enviado", "entregue"].includes(p.status) && (
              <ol className="grid grid-cols-4 gap-1" aria-label="Andamento do pedido">
                {ETAPAS_PEDIDO.map((nome, i) => {
                  const feito = i <= etapaDoPedido(p);
                  return (
                    <li key={nome} aria-current={i === etapaDoPedido(p) ? "step" : undefined} className="flex flex-col gap-1.5">
                      <span className={`h-1.5 rounded-full ${feito ? "bg-navy" : "bg-line"}`} />
                      <span className={`text-[12px] leading-tight ${feito ? "font-semibold text-ink" : "text-muted"}`}>{nome}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="text-[14px] text-ink-2">Entrega em: {enderecoEmLinha(p.endereco)}</p>
            {p.rastreio && (p.status === "enviado" || p.status === "entregue") && (
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-ink-2">Código de rastreio ({transportadora(p.etiqueta_servico)}): <strong className="font-mono select-all">{p.rastreio}</strong></span>
                <a href={linkRastreio(p.rastreio, p.etiqueta_servico)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center self-start rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy-deep">
                  Acompanhar a entrega ↗
                </a>
                {p.etiqueta_servico === 31 && <span className="text-[13px] text-muted">Na página do SuperFrete, cole o código acima.</span>}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
