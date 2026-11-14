import type { Metadata } from "next";
import Link from "next/link";
import { reais, type ProdutoLoja } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Loja · Apostilas",
  description: "Apostilas impressas para a sua preparação na aviação, enviadas pelos Correios para todo o Brasil.",
};

export default async function LojaPage({ searchParams }: { searchParams: Promise<{ cupom?: string }> }) {
  const cupom = ((await searchParams).cupom ?? "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
  const { supabase } = await getUser();
  const { data } = await supabase.from("loja_produtos").select("*").eq("ativo", true).eq("excluido", false).order("ordem");
  const produtos = (data ?? []) as ProdutoLoja[];

  return (
    <main className="bg-soft">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-3 px-6 pt-14 pb-24 text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Loja Cabin Crew</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[46px]">Apostilas <span className="text-[#ff5a7a]">impressas</span></h1>
          <p className="max-w-[900px] text-[17px] leading-relaxed text-balance text-[#d7dbe6]">Explore nossa coleção de produtos exclusivos para impulsionar sua carreira na aviação.</p>
        </div>
      </section>
      <div className="mx-auto -mt-14 grid max-w-[1100px] gap-5 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        {produtos.map((p) => (
          <Link key={p.slug} href={`/loja/${p.slug}${cupom ? `?cupom=${cupom}` : ""}`} className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy shadow-[0_18px_40px_-30px_rgba(35,42,61,.5)] hover:border-navy">
            <span className="relative block aspect-[3/4] overflow-hidden bg-[#f1f3f8]">
              {p.imagens[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- imagem da galeria de mídia
                <img src={p.imagens[0]} alt={p.nome} className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]" />
              )}
              {Number(p.frete) === 0 && <span className="absolute top-3 left-3 rounded-full bg-[#0f6b3a] px-3 py-1 text-xs font-bold text-white">Frete grátis</span>}
            </span>
            <span className="flex flex-1 flex-col gap-2 p-5">
              <strong className="font-display text-[18px] leading-snug">{p.nome}</strong>
              {p.resumo && <span className="line-clamp-3 text-[14px] leading-relaxed text-ink-2">{p.resumo}</span>}
              <span className="mt-auto flex items-baseline gap-2 pt-2">
                {p.preco_de && Number(p.preco_de) > Number(p.preco) && <span className="text-[14px] text-muted line-through">{reais(p.preco_de)}</span>}
                <strong className="font-display text-[24px] font-extrabold">{reais(p.preco)}</strong>
              </span>
              <span className="text-[13px] text-muted">em até 12x no cartão{Number(p.desconto_pix) > 0 ? ` · ${p.desconto_pix}% off no Pix` : ""}</span>
            </span>
          </Link>
        ))}
        {!produtos.length && <p className="col-span-full rounded-2xl bg-white p-8 text-center text-ink-2">Nenhum produto à venda no momento.</p>}
      </div>
    </main>
  );
}
