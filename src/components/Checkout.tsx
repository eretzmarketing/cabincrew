"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { precosFinais, normalizarCupom, rotuloCupom, type Cupom } from "@/lib/cupons";

type Base = { slug: string; nome: string; endereco: string; precoBase: number; descontoPix: number; diasExtras: number };
type Produto = Base & { preco: number; pix: number; cupom: string | null; descontoCupom: number };
type Pix = { id: number; codigo?: string; imagem?: string; link?: string; valor: number; criado: number };

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatarCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");

declare global {
  interface Window {
    MercadoPago?: new (chave: string, op?: { locale?: string }) => { bricks: () => { create: (tipo: string, id: string, cfg: unknown) => Promise<{ unmount: () => void }> } };
  }
}

function carregarSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve();
  return new Promise((ok, erro) => {
    const s = document.createElement("script");
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.onload = () => ok();
    s.onerror = () => erro(new Error("sdk"));
    document.head.appendChild(s);
  });
}

async function pagar(dados: Record<string, unknown>) {
  const r = await fetch("/api/mercadopago/pagar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
  return (await r.json().catch(() => ({ erro: "Falha de conexão." }))) as { id?: number; status?: string; mensagem?: string; erro?: string; pix?: { codigo?: string; imagem?: string; link?: string }; valor?: number };
}

export default function Checkout({ publicKey, base, email, nome, cupomInicial, erroCupomInicial }: {
  publicKey: string; base: Base; email: string; nome: string; cupomInicial: Cupom | null; erroCupomInicial?: string;
}) {
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [cupom, setCupom] = useState<Cupom | null>(cupomInicial);
  const p = precosFinais(base.precoBase, base.descontoPix, cupom);
  const produto: Produto = { ...base, preco: p.cartao, pix: p.pix, cupom: cupom?.codigo ?? null, descontoCupom: p.descontoCupom };
  const [aprovado, setAprovado] = useState(false);
  const [analise, setAnalise] = useState(false);

  if (aprovado) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-[22px] bg-white p-8 text-center shadow-sm md:p-12" role="status">
        <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5f6ec] text-[40px]">✓</span>
        <h2 className="font-display text-[28px] font-extrabold">Pagamento aprovado! Bem-vindo(a) a bordo, {nome.split(" ")[0]}. ✈️</h2>
        <p className="max-w-[520px] text-[17px] text-ink-2">Seu acesso ao {produto.nome} já está liberado. A confirmação também chega no seu WhatsApp.</p>
        <a href={produto.endereco} className="inline-flex min-h-14 items-center rounded-xl bg-brand-strong px-8 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Começar agora</a>
      </section>
    );
  }
  if (analise) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-[22px] bg-white p-8 text-center shadow-sm" role="status">
        <span aria-hidden="true" className="text-[48px]">⏳</span>
        <h2 className="font-display text-[26px] font-extrabold">Pagamento em análise</h2>
        <p className="max-w-[520px] text-[17px] text-ink-2">O Mercado Pago está analisando o pagamento (costuma levar poucos minutos). Assim que for aprovado, o acesso é liberado sozinho e você recebe a confirmação no WhatsApp.</p>
        <Link href="/planos" className="font-semibold text-navy underline underline-offset-4">Voltar aos planos</Link>
      </section>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <section className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-sm md:p-7">
        <h2 className="font-display text-xl font-extrabold">Como você quer pagar?</h2>
        <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-3 sm:grid-cols-2">
          {([["pix", "Pix", `${reais(produto.pix)}${produto.descontoPix ? ` · ${produto.descontoPix}% off` : ""}`], ["cartao", "Cartão de crédito", `${reais(produto.preco)} · até 12x`]] as const).map(([k, r, d]) => (
            <button key={k} type="button" role="radio" aria-checked={metodo === k} onClick={() => setMetodo(k)}
              className={`flex min-h-16 cursor-pointer flex-col items-start justify-center rounded-2xl border-2 px-4 py-3 text-left ${metodo === k ? "border-navy bg-[#f4f6fb]" : "border-line hover:border-[#9aa3b8]"}`}>
              <span className="font-display text-[17px] font-extrabold">{r}</span>
              <span className={`text-[14px] ${k === "pix" ? "font-semibold text-[#0f6b3a]" : "text-ink-2"}`}>{d}</span>
            </button>
          ))}
        </div>
        {metodo === "pix" ? <PagarPix key={produto.cupom ?? "-"} produto={produto} aoAprovar={() => setAprovado(true)} /> : <PagarCartao publicKey={publicKey} produto={produto} email={email} aoAprovar={() => setAprovado(true)} aoAnalisar={() => setAnalise(true)} />}
      </section>

      <aside className="flex flex-col gap-4 rounded-[22px] bg-navy p-6 text-white lg:sticky lg:top-24">
        <span className="font-display text-xs font-bold tracking-[.1em] text-[#aab3c8] uppercase">Seu pedido</span>
        <div className="flex items-baseline justify-between gap-3">
          <strong className="font-display text-xl">{produto.nome}</strong>
          <span className="font-display text-xl font-extrabold">{reais(metodo === "pix" ? produto.pix : produto.preco)}</span>
        </div>
        {produto.descontoCupom > 0 && <p className="text-[14px] text-[#bfe9cf]">Cupom {produto.cupom}: {reais(produto.descontoCupom)} de desconto{produto.precoBase !== produto.preco ? ` (de ${reais(produto.precoBase)})` : ""}.</p>}
        {metodo === "pix" && produto.descontoPix > 0 && <p className="text-[14px] text-[#bfe9cf]">Você economiza mais {reais(produto.preco - produto.pix)} no Pix.</p>}
        <CampoCupom produto={base.slug} cupom={cupom} setCupom={setCupom} erroInicial={erroCupomInicial} />
        {metodo === "cartao" && <p className="text-[14px] text-[#d7dbe6]">No parcelamento, os juros do cartão são calculados pelo Mercado Pago e aparecem antes de você confirmar.</p>}
        <ul className="flex flex-col gap-1.5 border-t border-white/15 pt-4 text-[14px] text-[#d7dbe6]">
          <li>✓ Acesso liberado na hora após a aprovação</li>
          <li>✓ Acesso até você concluir o curso{produto.diasExtras > 0 ? `, mais ${produto.diasExtras} dias para revisar` : ""}</li>
          <li>✓ 7 dias de garantia, conforme o Código de Defesa do Consumidor</li>
        </ul>
        <span className="text-[12px] text-[#aab3c8]">Pagamento processado pelo Mercado Pago. Os dados do cartão não passam pelo site da Cabin Crew.</span>
      </aside>
    </div>
  );
}

function PagarPix({ produto, aoAprovar }: { produto: Produto; aoAprovar: () => void }) {
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [pend, setPend] = useState(false);
  const [pix, setPix] = useState<Pix | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [agora, setAgora] = useState(0);

  // consulta a cada 4 segundos se o Pix foi pago
  useEffect(() => {
    if (!pix) return;
    let parar = false;
    const t = setInterval(async () => {
      setAgora(Date.now());
      const r = await fetch(`/api/mercadopago/status?id=${pix.id}`).then((x) => x.json()).catch(() => ({}));
      if (parar) return;
      if (r.status === "approved") { clearInterval(t); aoAprovar(); }
      if (r.status === "cancelled" || r.status === "expired") { clearInterval(t); setPix(null); setErro("O Pix expirou. Gere um novo código."); }
    }, 4000);
    return () => { parar = true; clearInterval(t); };
  }, [pix, aoAprovar]);

  async function gerar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setPend(true);
    const r = await pagar({ produto: produto.slug, metodo: "pix", cpf, cupom: produto.cupom });
    setPend(false);
    if (r.erro || !r.id) return setErro(r.erro ?? "Não foi possível gerar o Pix.");
    setPix({ id: r.id, ...r.pix, valor: r.valor ?? produto.pix, criado: Date.now() });
  }

  if (pix) {
    const restante = Math.max(0, 30 * 60 - Math.floor(((agora || pix.criado) - pix.criado) / 1000));
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-[16px] text-ink-2">Abra o app do seu banco, escolha <strong>Pix › Ler QR Code</strong> ou <strong>Pix copia e cola</strong> e pague <strong className="text-navy">{reais(pix.valor)}</strong>.</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- QR Code gerado pelo Mercado Pago (base64) */}
        {pix.imagem && <img src={`data:image/png;base64,${pix.imagem}`} alt="QR Code do Pix" width={240} height={240} className="h-60 w-60 rounded-xl border border-line" />}
        {pix.codigo && (
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="pix-codigo" className="text-[14px] font-semibold">Pix copia e cola</label>
            <textarea id="pix-codigo" readOnly value={pix.codigo} rows={3} className="w-full resize-none rounded-xl border border-[#c9cedb] bg-soft px-3 py-2 font-mono text-[12px] break-all" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" onClick={async () => { await navigator.clipboard.writeText(pix.codigo!).catch(() => {}); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-navy px-6 font-semibold text-white hover:bg-navy-deep">{copiado ? "Código copiado ✓" : "Copiar código Pix"}</button>
          </div>
        )}
        <p className="flex items-center gap-2 text-[15px] font-semibold text-navy" role="status" aria-live="polite">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#25d366]" aria-hidden="true" /> Aguardando o pagamento… a tela muda sozinha quando o Pix cair.
        </p>
        <span className="text-[13px] text-muted">O código vale por {Math.floor(restante / 60)} min {String(restante % 60).padStart(2, "0")} s.</span>
      </div>
    );
  }

  return (
    <form onSubmit={gerar} className="flex flex-col gap-3">
      <label htmlFor="cpf" className="text-[15px] font-semibold">CPF de quem vai pagar</label>
      <input id="cpf" inputMode="numeric" autoComplete="off" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} placeholder="000.000.000-00"
        className="min-h-12 rounded-xl border border-[#c9cedb] bg-white px-4 text-[16px] outline-none focus:border-navy" aria-describedby="cpf-ajuda" />
      <span id="cpf-ajuda" className="text-[13px] text-muted">Exigido pelo Mercado Pago para gerar o Pix. Fica registrado na sua compra.</span>
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{erro}</p>}
      <button disabled={pend || cpf.replace(/\D/g, "").length !== 11} className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-xl bg-brand-strong px-6 font-display text-[17px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50">
        {pend ? "Gerando o Pix…" : `Gerar Pix de ${reais(produto.pix)}`}
      </button>
    </form>
  );
}

function PagarCartao({ publicKey, produto, email, aoAprovar, aoAnalisar }: { publicKey: string; produto: Produto; email: string; aoAprovar: () => void; aoAnalisar: () => void }) {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const fns = useRef({ aoAprovar, aoAnalisar });
  useEffect(() => { fns.current = { aoAprovar, aoAnalisar }; }, [aoAprovar, aoAnalisar]);

  useEffect(() => {
    let ctl: { unmount: () => void } | null = null;
    let ativo = true;
    carregarSdk().then(async () => {
      if (!ativo || !window.MercadoPago) return;
      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      ctl = await mp.bricks().create("cardPayment", "cartao-mp", {
        initialization: { amount: produto.preco, payer: { email } },
        customization: { paymentMethods: { maxInstallments: 12, types: { excluded: ["debit_card"] } }, visual: { style: { theme: "default" } } },
        callbacks: {
          onReady: () => setCarregando(false),
          onError: (e: unknown) => console.error("[checkout]", e),
          onSubmit: async (dados: Record<string, unknown>) => {
            setErro("");
            const r = await pagar({ produto: produto.slug, metodo: "cartao", cartao: dados, cupom: produto.cupom });
            if (r.status === "approved" || r.status === "authorized") { fns.current.aoAprovar(); return; }
            if (r.status === "in_process" || r.status === "pending") { fns.current.aoAnalisar(); return; }
            setErro(r.mensagem ?? r.erro ?? "Pagamento não aprovado. Tente outro cartão ou o Pix.");
            throw new Error("recusado");
          },
        },
      });
      if (!ativo) ctl.unmount();
    }).catch(() => { setCarregando(false); setErro("Não foi possível carregar o pagamento com cartão. Recarregue a página ou use o Pix."); });
    return () => { ativo = false; ctl?.unmount(); };
  }, [publicKey, produto.preco, produto.slug, produto.cupom, email]);

  return (
    <div className="flex flex-col gap-3">
      {carregando && <p className="text-[15px] text-ink-2" role="status">Carregando o pagamento seguro…</p>}
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{erro}</p>}
      <div id="cartao-mp" />
    </div>
  );
}

function CampoCupom({ produto, cupom, setCupom, erroInicial }: { produto: string; cupom: Cupom | null; setCupom: (c: Cupom | null) => void; erroInicial?: string }) {
  const [aberto, setAberto] = useState(!!erroInicial);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(erroInicial ?? "");
  const [pend, setPend] = useState(false);

  async function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const c = normalizarCupom(codigo);
    if (!c) return setErro("Digite o cupom.");
    setPend(true); setErro("");
    const r = await fetch(`/api/cupom?produto=${encodeURIComponent(produto)}&codigo=${encodeURIComponent(c)}`).then((x) => x.json()).catch(() => ({ erro: "Falha de conexão." }));
    setPend(false);
    if (r.cupom) { setCupom(r.cupom); setCodigo(""); setAberto(false); } else setErro(r.erro ?? "Cupom inválido.");
  }

  if (cupom) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2 text-[14px]" role="status">
        <span>🏷️ <strong>{cupom.codigo}</strong> · {rotuloCupom(cupom)}</span>
        <button type="button" onClick={() => setCupom(null)} className="min-h-9 cursor-pointer px-1 font-semibold text-[#d7dbe6] underline underline-offset-4 hover:text-white">Remover</button>
      </div>
    );
  }
  if (!aberto) return <button type="button" onClick={() => setAberto(true)} className="min-h-10 cursor-pointer self-start text-[14px] font-semibold text-white underline underline-offset-4">Tenho um cupom de desconto</button>;
  return (
    <form onSubmit={aplicar} className="flex flex-col gap-2">
      <label htmlFor="cupom" className="text-[14px] font-semibold">Cupom de desconto</label>
      <div className="flex gap-2">
        <input id="cupom" value={codigo} onChange={(e) => setCodigo(normalizarCupom(e.target.value))} autoComplete="off" placeholder="EX.: ESCOLA10"
          className="min-h-11 w-full min-w-0 rounded-xl border border-white/30 bg-white px-3 font-semibold tracking-wide text-ink uppercase outline-none" aria-describedby={erro ? "cupom-erro" : undefined} />
        <button disabled={pend} className="min-h-11 shrink-0 cursor-pointer rounded-xl bg-brand-strong px-4 font-semibold text-white disabled:opacity-60">{pend ? "…" : "Aplicar"}</button>
      </div>
      {erro && <p id="cupom-erro" role="alert" className="text-[14px] font-semibold text-[#ffb3c0]">{erro}</p>}
    </form>
  );
}
