import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Checkout from "@/components/Checkout";
import { cursosDoAluno } from "@/lib/crew-gate";
import { normalizarCupom } from "@/lib/cupons";
import { validarCupom } from "@/lib/cupons-servidor";
import { configMP } from "@/lib/mercadopago";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

type Prod = { slug: string; nome: string; preco: number; desconto_pix: number; ativo: boolean; dias_apos_conclusao: number | null; inclui: string[] | null; endereco: string | null };

export default async function ComprarPage({ params, searchParams }: { params: Promise<{ produto: string }>; searchParams: Promise<{ cupom?: string }> }) {
  const { produto: slug } = await params;
  const { cupom: codigo } = await searchParams;
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) notFound();
  const cupomUrl = normalizarCupom(codigo ?? "");
  const { supabase, user, profile } = await exigirLogin(`/comprar/${slug}${cupomUrl ? `?cupom=${cupomUrl}` : ""}`);
  const { data } = await supabase.from("produtos").select("*").eq("slug", slug).maybeSingle();
  const prod = data as Prod | null;
  if (!prod || (prod as Prod & { excluido?: boolean }).excluido) notFound();
  const ativos = await cursosDoAluno(supabase, user.id);
  const inclui = prod.inclui ?? [prod.slug];
  if (inclui.every((c) => ativos.has(c))) redirect(prod.endereco ?? "/head-hunter");
  const jaTem = inclui.filter((c) => ativos.has(c));
  const cfg = configMP();
  const { cupom, erro: erroCupom } = await validarCupom(supabase, cupomUrl, slug);

  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-5 py-10 md:py-14">
        <Link href="/planos" className="text-sm font-semibold text-navy">← Ver todos os planos</Link>
        <div className="flex flex-col gap-2">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Checkout seguro</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">Falta pouco para começar: {prod.nome}</h1>
          {jaTem.length > 0 && <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-[15px] text-[#7a5a00]">Você já tem acesso a {jaTem.map((c) => (c === "english" ? "Flight Attendant English" : "Head Hunter")).join(" e ")}. Se preferir, compre só o outro curso em <Link href="/planos" className="font-semibold underline">Planos</Link>.</p>}
        </div>
        {!prod.ativo ? (
          <p className="rounded-2xl bg-white p-6 text-[17px] text-ink-2">As vendas deste plano ainda não estão abertas. Avisaremos você pelo WhatsApp.</p>
        ) : !cfg ? (
          <p className="rounded-2xl bg-white p-6 text-[17px] text-ink-2">O pagamento on-line está sendo configurado. Tente de novo em instantes ou fale com a Cabin Crew pelo WhatsApp.</p>
        ) : (
          <Checkout
            publicKey={cfg.publicKey}
            base={{
              slug: prod.slug, nome: prod.nome, endereco: prod.endereco ?? "/head-hunter", precoBase: Number(prod.preco),
              descontoPix: Number(prod.desconto_pix), diasExtras: Number(prod.dias_apos_conclusao ?? 30),
            }}
            cupomInicial={cupom}
            erroCupomInicial={cupomUrl && !cupom ? erroCupom : undefined}
            email={user.email ?? ""}
            nome={profile.nome ?? profile.apelido}
          />
        )}
      </div>
    </main>
  );
}
