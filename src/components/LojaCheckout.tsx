"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PagarCartao, PagarPix } from "@/components/Checkout";
import { reais, type Endereco } from "@/lib/loja";

type Produto = { slug: string; nome: string; preco: number; descontoPix: number; frete: number; prazo: string; imagem: string | null; estoque: number | null };

const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-4 text-[16px] outline-none focus:border-navy";
const rot = "flex flex-col gap-1 text-[14px] font-semibold";
const formatarCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export default function LojaCheckout({ publicKey, produto, quantidadeInicial, email, nome, telefone }: {
  publicKey: string; produto: Produto; quantidadeInicial: number; email: string; nome: string; telefone: string;
}) {
  const [qtd, setQtd] = useState(quantidadeInicial);
  const [d, setD] = useState({ nome, telefone, cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });
  const [buscando, setBuscando] = useState(false);
  const [avisoCep, setAvisoCep] = useState("");
  const [etapa, setEtapa] = useState<"entrega" | "pagamento">("entrega");
  const [erro, setErro] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [aceite, setAceite] = useState(false);
  const [fim, setFim] = useState<"aprovado" | "analise" | null>(null);

  const itens = produto.preco * qtd;
  const total = itens + produto.frete;
  const totalPix = Math.round(itens * (100 - produto.descontoPix)) / 100 + produto.frete;
  const max = Math.min(10, produto.estoque ?? 10);
  const mudar = (k: keyof typeof d, v: string) => setD((x) => ({ ...x, [k]: v }));

  async function buscarCep(valor: string) {
    const cep = valor.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscando(true); setAvisoCep("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((x) => x.json());
      if (r.erro) setAvisoCep("CEP não encontrado. Confira ou preencha o endereço manualmente.");
      else setD((x) => ({ ...x, rua: r.logradouro || x.rua, bairro: r.bairro || x.bairro, cidade: r.localidade || x.cidade, uf: r.uf || x.uf }));
    } catch {
      setAvisoCep("Não conseguimos buscar o CEP agora. Preencha o endereço manualmente.");
    }
    setBuscando(false);
  }

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (d.nome.trim().split(/\s+/).length < 2) return setErro("Informe o nome completo de quem vai receber.");
    if (d.telefone.replace(/\D/g, "").length < 10) return setErro("Informe um WhatsApp com DDD para receber o código de rastreio.");
    if (d.cep.replace(/\D/g, "").length !== 8 || !d.rua.trim() || !d.numero.trim() || !d.cidade.trim() || !UFS.includes(d.uf)) return setErro("Preencha o endereço completo: CEP, rua, número, cidade e UF.");
    setEtapa("pagamento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const entrega = useMemo(() => {
    const endereco: Endereco = { cep: d.cep.replace(/\D/g, ""), rua: d.rua, numero: d.numero, complemento: d.complemento, bairro: d.bairro, cidade: d.cidade, uf: d.uf };
    return { nome: d.nome, telefone: d.telefone, endereco };
  }, [d]);
  const cobranca = useMemo(() => ({
    url: "/api/loja/pagar", extra: { quantidade: qtd, entrega },
    textoAceite: "Marque que você leu e aceita os Termos de Uso e a Política de Reembolso.",
  }), [qtd, entrega]);
  const pagamento = { slug: produto.slug, preco: total, pix: totalPix, cupom: null };

  if (fim) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-[22px] bg-white p-8 text-center shadow-sm md:p-12" role="status">
        <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5f6ec] text-[40px]">{fim === "aprovado" ? "📦" : "⏳"}</span>
        <h2 className="font-display text-[28px] font-extrabold">{fim === "aprovado" ? `Pedido confirmado, ${d.nome.split(" ")[0]}!` : "Pagamento em análise"}</h2>
        <p className="max-w-[540px] text-[17px] text-ink-2">
          {fim === "aprovado"
            ? "Recebemos o seu pagamento. Vamos postar a apostila e você recebe o código de rastreio no WhatsApp."
            : "O Mercado Pago está analisando o pagamento (costuma levar poucos minutos). Assim que for aprovado, você recebe a confirmação no WhatsApp."}
        </p>
        <Link href="/conta/pedidos" className="inline-flex min-h-14 items-center rounded-xl bg-navy px-8 font-display text-[17px] font-bold text-white hover:bg-navy-deep">Ver meus pedidos</Link>
      </section>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      {etapa === "entrega" ? (
        <form onSubmit={continuar} className="flex flex-col gap-4 rounded-[22px] bg-white p-5 shadow-sm md:p-7">
          <h2 className="font-display text-xl font-extrabold">1. Endereço de entrega</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`${rot} sm:col-span-2`}>Nome completo de quem vai receber
              <input value={d.nome} onChange={(e) => mudar("nome", e.target.value)} autoComplete="name" className={campo} />
            </label>
            <label className={rot}>WhatsApp com DDD
              <input value={d.telefone} onChange={(e) => mudar("telefone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" className={campo} />
            </label>
            <label className={rot}>CEP
              <input value={d.cep} onChange={(e) => { const v = formatarCep(e.target.value); mudar("cep", v); buscarCep(v); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={campo} />
              <span className="text-[12px] font-normal text-muted">{buscando ? "Buscando endereço…" : avisoCep || <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer" className="underline">Não sei meu CEP</a>}</span>
            </label>
            <label className={`${rot} sm:col-span-2`}>Rua / avenida
              <input value={d.rua} onChange={(e) => mudar("rua", e.target.value)} autoComplete="address-line1" className={campo} />
            </label>
            <label className={rot}>Número
              <input value={d.numero} onChange={(e) => mudar("numero", e.target.value)} className={campo} />
            </label>
            <label className={rot}>Complemento <span className="font-normal text-muted">(opcional)</span>
              <input value={d.complemento} onChange={(e) => mudar("complemento", e.target.value)} autoComplete="address-line2" placeholder="Apto, bloco, casa…" className={campo} />
            </label>
            <label className={rot}>Bairro
              <input value={d.bairro} onChange={(e) => mudar("bairro", e.target.value)} className={campo} />
            </label>
            <div className="grid grid-cols-[1fr_90px] gap-3">
              <label className={rot}>Cidade
                <input value={d.cidade} onChange={(e) => mudar("cidade", e.target.value)} autoComplete="address-level2" className={campo} />
              </label>
              <label className={rot}>UF
                <select value={d.uf} onChange={(e) => mudar("uf", e.target.value)} className={campo}>
                  <option value="">–</option>
                  {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
            </div>
          </div>
          {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{erro}</p>}
          <button className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-xl bg-brand-strong px-6 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Continuar para o pagamento</button>
        </form>
      ) : (
        <section className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-2 rounded-2xl bg-soft px-4 py-3 text-[15px]">
            <span><strong>Entregar para:</strong> {d.nome}<br />{d.rua}, {d.numero}{d.complemento ? ` · ${d.complemento}` : ""} · {d.bairro ? `${d.bairro} · ` : ""}{d.cidade}/{d.uf} · CEP {d.cep}</span>
            <button type="button" onClick={() => setEtapa("entrega")} className="min-h-10 cursor-pointer font-semibold text-navy underline underline-offset-4">Alterar</button>
          </div>
          <h2 className="font-display text-xl font-extrabold">2. Pagamento</h2>
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 px-4 py-3 text-[15px] ${aceite ? "border-[#2fa36b] bg-[#f3fbf6]" : "border-line"}`}>
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c8102e]" />
            <span>Li e aceito os <a href="/termos" target="_blank" className="font-semibold text-navy underline">Termos de Uso</a> e a <a href="/reembolso" target="_blank" className="font-semibold text-navy underline">Política de Reembolso</a> (7 dias para desistir a partir do recebimento).</span>
          </label>
          <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-3 sm:grid-cols-2">
            {([["pix", "Pix", `${reais(totalPix)}${produto.descontoPix ? ` · ${produto.descontoPix}% off` : ""}`], ["cartao", "Cartão de crédito", `${reais(total)} · até 12x`]] as const).map(([k, r, t]) => (
              <button key={k} type="button" role="radio" aria-checked={metodo === k} onClick={() => setMetodo(k)}
                className={`flex min-h-16 cursor-pointer flex-col items-start justify-center rounded-2xl border-2 px-4 py-3 text-left ${metodo === k ? "border-navy bg-[#f4f6fb]" : "border-line hover:border-[#9aa3b8]"}`}>
                <span className="font-display text-[17px] font-extrabold">{r}</span>
                <span className={`text-[14px] ${k === "pix" ? "font-semibold text-[#0f6b3a]" : "text-ink-2"}`}>{t}</span>
              </button>
            ))}
          </div>
          {metodo === "pix"
            ? <PagarPix key={`pix-${qtd}`} aceite={aceite} produto={pagamento} cobranca={cobranca} aoAprovar={() => setFim("aprovado")} />
            : <PagarCartao key={`cartao-${qtd}`} aceite={aceite} publicKey={publicKey} produto={pagamento} email={email} cobranca={cobranca} aoAprovar={() => setFim("aprovado")} aoAnalisar={() => setFim("analise")} />}
        </section>
      )}

      <aside className="flex flex-col gap-4 rounded-[22px] bg-navy p-6 text-white lg:sticky lg:top-24">
        <span className="font-display text-xs font-bold tracking-[.1em] text-[#aab3c8] uppercase">Seu pedido</span>
        <div className="flex gap-3">
          {produto.imagem && (
            // eslint-disable-next-line @next/next/no-img-element -- capa do produto
            <img src={produto.imagem} alt="" className="h-20 w-16 shrink-0 rounded-lg bg-white object-contain p-1" />
          )}
          <div className="flex flex-col gap-2">
            <strong className="font-display text-lg leading-snug">{produto.nome}</strong>
            <label className="flex items-center gap-2 text-[14px]">Quantidade
              <select value={qtd} disabled={etapa === "pagamento"} onChange={(e) => setQtd(Number(e.target.value))} className="min-h-9 rounded-lg bg-white px-2 font-semibold text-navy disabled:opacity-80">
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>
        <dl className="flex flex-col gap-1.5 border-t border-white/15 pt-4 text-[15px]">
          <div className="flex justify-between"><dt className="text-[#d7dbe6]">Produtos</dt><dd>{reais(itens)}</dd></div>
          <div className="flex justify-between"><dt className="text-[#d7dbe6]">Frete</dt><dd>{produto.frete ? reais(produto.frete) : "Grátis"}</dd></div>
          <div className="flex justify-between border-t border-white/15 pt-2 font-display text-lg font-extrabold"><dt>Total</dt><dd>{reais(metodo === "pix" && etapa === "pagamento" ? totalPix : total)}</dd></div>
        </dl>
        {produto.descontoPix > 0 && <p className="text-[14px] text-[#bfe9cf]">No Pix: {reais(totalPix)}</p>}
        <p className="text-[14px] text-[#d7dbe6]">📦 {produto.prazo}</p>
        <span className="text-[12px] text-[#aab3c8]">Pagamento processado pelo Mercado Pago. Os dados do cartão não passam pelo site da Cabin Crew.</span>
      </aside>
    </div>
  );
}
