import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Checkout from "@/components/Checkout";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { configMP, precoPor } from "@/lib/mercadopago";

export const metadata: Metadata = { title: "Comprar o Head Hunter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ComprarPage() {
  const { supabase, user, profile, pago } = await exigirCrewSelect("/head-hunter/comprar");
  if (pago) redirect("/head-hunter");
  const { data: prod } = await supabase.from("produtos").select("slug, nome, preco, desconto_pix, ativo, dias_apos_conclusao").eq("slug", "head-hunter").maybeSingle();
  const cfg = configMP();

  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-5 py-10 md:py-14">
        <Link href="/head-hunter" className="text-sm font-semibold text-navy">← Voltar</Link>
        <div className="flex flex-col gap-2">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Checkout seguro</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">Falta pouco para começar o Head Hunter</h1>
        </div>
        {!prod?.ativo ? (
          <p className="rounded-2xl bg-white p-6 text-[17px] text-ink-2">As vendas ainda não estão abertas. Avisaremos você pelo WhatsApp.</p>
        ) : !cfg ? (
          <p className="rounded-2xl bg-white p-6 text-[17px] text-ink-2">O pagamento on-line está sendo configurado. Tente de novo em instantes ou fale com a Cabin Crew pelo WhatsApp.</p>
        ) : (
          <Checkout
            publicKey={cfg.publicKey}
            produto={{ slug: prod.slug, nome: prod.nome, preco: precoPor(Number(prod.preco), Number(prod.desconto_pix), "cartao"), pix: precoPor(Number(prod.preco), Number(prod.desconto_pix), "pix"), descontoPix: Number(prod.desconto_pix), diasExtras: Number(prod.dias_apos_conclusao ?? 30) }}
            email={user.email ?? ""}
            nome={profile.nome ?? profile.apelido}
          />
        )}
      </div>
    </main>
  );
}
