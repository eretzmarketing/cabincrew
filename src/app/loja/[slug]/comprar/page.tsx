import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LojaCheckout from "@/components/LojaCheckout";
import { configMP } from "@/lib/mercadopago";
import type { ProdutoLoja } from "@/lib/loja";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Finalizar compra · Loja", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ComprarApostila({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ qtd?: string }> }) {
  const { slug } = await params;
  const qtd = Math.max(1, Math.min(10, Number((await searchParams).qtd) || 1));
  const { supabase, user, profile } = await exigirLogin(`/loja/${slug}/comprar?qtd=${qtd}`);
  const { data } = await supabase.from("loja_produtos").select("*").eq("slug", slug).maybeSingle();
  const p = data as ProdutoLoja | null;
  if (!p || !p.ativo) notFound();
  const cfg = configMP();

  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-5 py-10 md:py-14">
        <Link href={`/loja/${slug}`} className="text-sm font-semibold text-navy">← Voltar para a apostila</Link>
        <div className="flex flex-col gap-2">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Checkout seguro</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">Finalizar compra</h1>
        </div>
        {!cfg ? (
          <p className="rounded-2xl bg-white p-6 text-[17px] text-ink-2">O pagamento on-line está sendo configurado. Tente de novo em instantes ou fale com a Cabin Crew pelo WhatsApp.</p>
        ) : (
          <LojaCheckout
            publicKey={cfg.publicKey}
            produto={{ slug: p.slug, nome: p.nome, preco: Number(p.preco), descontoPix: Number(p.desconto_pix), frete: Number(p.frete), prazo: p.prazo, imagem: p.imagens[0] ?? null, estoque: p.estoque }}
            quantidadeInicial={qtd}
            email={user.email ?? ""}
            nome={String(profile.nome || "").trim()}
            telefone={profile.whatsapp ?? ""}
          />
        )}
      </div>
    </main>
  );
}
