import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaProduto from "@/components/GaleriaProduto";
import { reais, type ProdutoLoja } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";

async function carregar(slug: string) {
  const { supabase } = await getUser();
  const { data } = await supabase.from("loja_produtos").select("*").eq("slug", slug).maybeSingle();
  return data as ProdutoLoja | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await carregar((await params).slug);
  return { title: p ? `${p.nome} · Loja` : "Loja", description: p?.resumo ?? undefined };
}

export default async function ProdutoPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ cupom?: string }> }) {
  const p = await carregar((await params).slug);
  const cupom = ((await searchParams).cupom ?? "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
  if (!p || !p.ativo) notFound();
  const esgotado = p.estoque !== null && p.estoque <= 0;

  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-5 py-10">
        <Link href="/loja" className="text-sm font-semibold text-navy">← Voltar para a loja</Link>
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
          <GaleriaProduto imagens={p.imagens} nome={p.nome} />
          <section className="flex flex-col gap-5 rounded-[22px] bg-white p-6 shadow-sm md:p-8">
            <span className="self-start rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-bold tracking-[.06em] text-navy uppercase">Apostila impressa</span>
            <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{p.nome}</h1>
            {p.resumo && <p className="text-[17px] leading-relaxed text-ink-2">{p.resumo}</p>}
            <div className="flex flex-col">
              {p.preco_de && Number(p.preco_de) > Number(p.preco) && <span className="text-[16px] text-muted line-through">{reais(p.preco_de)}</span>}
              <strong className="font-display text-[40px] leading-none font-extrabold">{reais(p.preco)}</strong>
              <span className="pt-1 text-[14px] text-muted">em até 12x no cartão{Number(p.desconto_pix) > 0 ? ` · ${reais(Number(p.preco) * (100 - Number(p.desconto_pix)) / 100)} no Pix` : ""}</span>
            </div>
            <ul className="flex flex-col gap-1.5 rounded-2xl bg-soft p-4 text-[15px]">
              <li>🚚 {Number(p.frete) === 0 ? <strong>Frete grátis para todo o Brasil</strong> : <>Frete: <strong>{reais(p.frete)}</strong></>}</li>
              <li>📦 {p.prazo}</li>
              <li>🔎 Você recebe o código de rastreio no WhatsApp</li>
              {cupom && <li>🏷️ Cupom <strong>{cupom}</strong>: o desconto aparece na finalização da compra</li>}
            </ul>
            {esgotado ? (
              <p className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">Esgotado no momento.</p>
            ) : (
              <form action={`/loja/${p.slug}/comprar`} className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-[14px] font-semibold">Quantidade
                  <select name="qtd" defaultValue="1" className="min-h-14 rounded-xl border border-[#c9cedb] bg-white px-3 text-[16px]">
                    {Array.from({ length: Math.min(10, p.estoque ?? 10) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                {cupom && <input type="hidden" name="cupom" value={cupom} />}
                <button className="inline-flex min-h-14 flex-1 cursor-pointer items-center justify-center rounded-xl bg-brand-strong px-8 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Comprar</button>
              </form>
            )}
          </section>
        </div>
        {p.descricao && (
          <section className="flex flex-col gap-3 rounded-[22px] bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-display text-2xl font-extrabold">Sobre a apostila</h2>
            <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-2">
              {p.descricao.split(/\n\s*\n/).map((par, i) => <p key={i} className="whitespace-pre-line">{par}</p>)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
