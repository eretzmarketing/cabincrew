import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "@/components/icons";
import { cursosDoAluno } from "@/lib/crew-gate";
import { normalizarCupom, precosFinais, rotuloCupom, type Cupom } from "@/lib/cupons";
import { validarCupom } from "@/lib/cupons-servidor";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Planos",
  description: "Simulados ANAC grátis, Head Hunter (preparação para a seleção de comissário de voo), Flight Attendant English e o combo dos dois cursos.",
};
export const dynamic = "force-dynamic";

type Prod = { slug: string; nome: string; descricao: string | null; preco: number; desconto_pix: number; ativo: boolean; ordem: number; destaque: string | null; topicos: string[] | null; inclui: string[] | null; endereco: string | null };

const reais = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: Number.isInteger(Number(v)) ? 0 : 2 });
const ANCORA: Record<string, string> = { "head-hunter": "head-hunter", english: "english", combo: "combo" };

function Topicos({ itens, claro }: { itens: string[]; claro?: boolean }) {
  return (
    <ul className="flex flex-col gap-2.5 text-[15px] leading-snug">
      {itens.map((t) => (
        <li key={t} className="flex gap-2.5">
          <span className={`mt-0.5 shrink-0 ${claro ? "text-[#7ee2a8]" : "text-[#0f6b3a]"}`}><Check size={18} /></span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PlanosPage({ searchParams }: { searchParams: Promise<{ cupom?: string }> }) {
  const codigo = normalizarCupom((await searchParams).cupom ?? "");
  const { supabase, user } = await getUser();
  const [{ data }, ativos] = await Promise.all([
    supabase.from("produtos").select("*").order("ordem"),
    user ? cursosDoAluno(supabase, user.id) : Promise.resolve(new Set<string>()),
  ]);
  const produtos = ((data ?? []) as (Prod & { excluido?: boolean })[]).filter((p) => p.ativo && !p.excluido);
  // cupom do link (?cupom=ESCOLA10): vale só nos planos permitidos
  const cupons = new Map<string, Cupom>();
  let erroCupom = "";
  if (codigo) {
    const rs = await Promise.all(produtos.map(async (p) => [p.slug, await validarCupom(supabase, codigo, p.slug)] as const));
    for (const [slug, r] of rs) if (r.cupom) cupons.set(slug, r.cupom); else erroCupom ||= r.erro ?? "";
  }
  const comCodigo = (slug: string) => (cupons.has(slug) ? `?cupom=${codigo}` : "");
  const precoDe = (slug: string) => Number(((data ?? []) as Prod[]).find((p) => p.slug === slug)?.preco ?? 0);

  return (
    <main className="bg-soft">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-6 pt-14 pb-28 text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Planos Cabin Crew</span>
          <h1 className="max-w-[760px] font-display text-[34px] leading-tight font-extrabold md:text-[48px]">Escolha como você vai chegar à <span className="text-[#ff5a7a]">aprovação</span></h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#d7dbe6]">Comece grátis pelos simulados da ANAC. Quando quiser a preparação completa para a seleção e o inglês de aviação, é só escolher o seu plano.</p>
        </div>
      </section>

      {codigo && (
        <div className="mx-auto -mt-14 mb-8 max-w-[760px] px-4">
          {cupons.size ? (
            <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-3 text-center text-[15px] font-semibold text-[#0f6b3a] shadow">🏷️ Cupom <strong>{codigo}</strong> aplicado: {rotuloCupom([...cupons.values()][0])}{cupons.size < produtos.length ? " nos planos marcados" : ""}.</p>
          ) : (
            <p role="alert" className="rounded-2xl bg-white px-5 py-3 text-center text-[15px] font-semibold text-brand-deep shadow">Cupom {codigo}: {erroCupom || "inválido."}</p>
          )}
        </div>
      )}
      <div className={`mx-auto ${codigo ? "" : "-mt-20"} grid max-w-[1240px] items-stretch gap-5 px-4 pb-16 sm:grid-cols-2 xl:grid-cols-4 md:px-6`}>
        {/* Simulados ANAC: sempre grátis */}
        <article id="anac" className="flex scroll-mt-24 flex-col gap-5 rounded-[24px] border border-line bg-white p-6 shadow-[0_18px_40px_-30px_rgba(35,42,61,.5)]">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[22px] font-extrabold">Simulados ANAC</h2>
            <p className="text-[15px] text-ink-2">Treine para a prova teórica de comissário de voo.</p>
          </div>
          <div className="flex flex-col">
            <strong className="font-display text-[40px] leading-none font-extrabold text-navy">Grátis</strong>
            <span className="pt-1 text-[14px] text-muted">para sempre, só precisa se cadastrar</span>
          </div>
          <Topicos itens={["4 blocos: Segurança, Legislação, Primeiros Socorros e Conhecimentos Técnicos", "Prova completa no modo prova real", "Gabarito comentado e sua evolução", "Tentativas ilimitadas"]} />
          <Link href="/simulados-anac" className="mt-auto inline-flex min-h-13 items-center justify-center rounded-xl border-2 border-navy px-6 py-3 font-display text-[16px] font-bold text-navy hover:bg-navy hover:text-white">Acessar agora</Link>
        </article>

        {produtos.map((p) => {
          const combo = (p.inclui?.length ?? 1) > 1;
          const temTudo = (p.inclui ?? [p.slug]).every((c) => ativos.has(c));
          const separados = combo ? (p.inclui ?? []).reduce((s, c) => s + precoDe(c), 0) : 0;
          const economia = separados - Number(p.preco);
          const cupom = cupons.get(p.slug) ?? null;
          const precos = precosFinais(Number(p.preco), Number(p.desconto_pix), cupom);
          const pix = precos.pix;
          const riscado = cupom ? Number(p.preco) : economia > 0 ? separados : 0;
          const escuro = combo;
          return (
            <article key={p.slug} id={ANCORA[p.slug] ?? p.slug}
              className={`relative flex scroll-mt-24 flex-col gap-5 rounded-[24px] p-6 ${escuro ? "bg-navy text-white shadow-[0_26px_60px_-30px_rgba(35,42,61,.9)] ring-4 ring-brand" : "border border-line bg-white shadow-[0_18px_40px_-30px_rgba(35,42,61,.5)]"}`}>
              {p.destaque && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-strong px-4 py-1.5 font-display text-[13px] font-bold tracking-[.06em] whitespace-nowrap text-white uppercase shadow">{p.destaque}</span>}
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[22px] leading-tight font-extrabold">{p.nome}</h2>
                <p className={`text-[15px] ${escuro ? "text-[#d7dbe6]" : "text-ink-2"}`}>{p.descricao?.split(":")[0] ?? ""}</p>
              </div>
              <div className="flex flex-col">
                {riscado > 0 && <span className={`text-[15px] line-through ${escuro ? "text-[#aab3c8]" : "text-muted"}`}>{reais(riscado)}</span>}
                <strong className="font-display text-[40px] leading-none font-extrabold">{reais(precos.cartao)}</strong>
                {cupom && <span className="mt-1 self-start rounded-full bg-[#fff3c4] px-3 py-1 text-[13px] font-bold text-[#7a5a00]">🏷️ {cupom.codigo}</span>}
                <span className={`pt-1 text-[14px] ${escuro ? "text-[#d7dbe6]" : "text-muted"}`}>em até 12x no cartão{Number(p.desconto_pix) > 0 ? ` · ${reais(pix)} no Pix` : ""}</span>
                {economia > 0 && <span className="mt-2 self-start rounded-full bg-[#e5f6ec] px-3 py-1 text-[13px] font-bold text-[#0f6b3a]">Economize {reais(economia)}</span>}
              </div>
              <Topicos itens={p.topicos ?? []} claro={escuro} />
              {temTudo ? (
                <Link href={p.endereco ?? "/head-hunter"} className="mt-auto inline-flex min-h-13 items-center justify-center rounded-xl bg-[#0f6b3a] px-6 py-3 font-display text-[16px] font-bold text-white">Você já tem · Acessar</Link>
              ) : (
                <Link href={`/comprar/${p.slug}${comCodigo(p.slug)}`} className={`mt-auto inline-flex min-h-13 items-center justify-center rounded-xl px-6 py-3 font-display text-[16px] font-bold text-white ${escuro ? "bg-brand-strong hover:bg-brand" : "bg-navy hover:bg-navy-deep"}`}>Acessar agora</Link>
              )}
            </article>
          );
        })}
      </div>

      <section className="mx-auto flex max-w-[900px] flex-col gap-3 px-6 pb-20 text-center text-[15px] text-ink-2">
        <p>Pagamento seguro pelo Mercado Pago, com Pix ou cartão. O acesso é liberado na hora e vale até você concluir o curso, com dias extras para revisar.</p>
        <p>Garantia de 7 dias: se não gostar, peça o reembolso dentro de 7 dias após a compra. Veja a <Link href="/reembolso" className="font-semibold underline underline-offset-4">Política de Reembolso</Link> e os <Link href="/termos" className="font-semibold underline underline-offset-4">Termos de Uso</Link>.</p>
      </section>
    </main>
  );
}
