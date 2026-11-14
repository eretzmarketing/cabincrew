import type { Metadata } from "next";
import { excluirProduto } from "@/app/pagamentos-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { NovoPlanoForm, ProdutoForm, type Plano } from "@/components/PagamentosForms";
import { getUser } from "@/lib/supabase/server";
import { SLUGS_CURSOS } from "@/lib/cursos";

export const metadata: Metadata = { title: "Planos e preços" };
export const dynamic = "force-dynamic";

const BASE = SLUGS_CURSOS;

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<{ criado?: string }> }) {
  const { criado } = await searchParams;
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("produtos").select("*").order("ordem").order("created_at");
  const planos = ((data ?? []) as (Plano & { excluido?: boolean })[]).filter((p) => !p.excluido);
  const semColunas = !error && planos.length > 0 && !("excluido" in (data![0] as object));

  return (
    <>
      <Titulo sub={<>Tudo o que aparece na <a href="/planos" target="_blank" className="font-semibold underline underline-offset-4">página Planos</a> e no checkout. Mudanças valem na hora; compras já feitas não mudam.</>}>Planos e preços</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode os SQLs <strong>0042 a 0046</strong> no Supabase para ativar esta página.</p> : (
        <>
          {semColunas && <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0046_planos_editaveis.sql</strong> para poder criar e excluir planos.</p>}
          {criado && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Plano criado ✓ Ele já aparece na página Planos (se estiver ativo).</p>}
          <details className="group rounded-[22px] border-2 border-dashed border-[#c9cedb] bg-white open:border-solid open:border-navy">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-display text-lg font-extrabold text-navy">
              <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition-transform group-open:rotate-45">+</span>
              Adicionar plano
            </summary>
            <div className="flex flex-col gap-3 px-5 pb-5">
              <p className="text-[15px] text-ink-2">Ex.: uma promoção (Head Hunter · Black Friday) ou outro combo. Escolha quais cursos ele libera.</p>
              <NovoPlanoForm />
            </div>
          </details>
          {planos.map((p) => {
            const base = BASE.includes(p.slug);
            return (
              <Card key={p.slug}>
                <div id={p.slug} className="flex scroll-mt-24 flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-extrabold">
                    {p.nome}
                    <span className={`ml-2 rounded-full px-2.5 py-0.5 align-middle text-[12px] font-semibold ${p.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eceef3] text-ink-2"}`}>{p.ativo ? "Ativo" : "Desativado"}</span>
                    {p.destaque && <span className="ml-1 rounded-full bg-brand-soft px-2.5 py-0.5 align-middle text-[12px] font-semibold text-brand-deep">{p.destaque}</span>}
                  </h2>
                  {!base && (
                    <details className="relative">
                      <summary className="min-h-10 cursor-pointer list-none py-2 text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir plano</summary>
                      <form action={excluirProduto} className="absolute right-0 z-10 mt-1 flex w-[280px] flex-col gap-2 rounded-2xl border border-line bg-white p-4 shadow-lg">
                        <input type="hidden" name="slug" value={p.slug} />
                        <span className="text-[14px]">Excluir <strong>{p.nome}</strong>? Ele some da página Planos. Compras já feitas continuam no livro.</span>
                        <button className="min-h-10 cursor-pointer rounded-full bg-brand-strong px-4 text-[14px] font-semibold text-white">Sim, excluir</button>
                      </form>
                    </details>
                  )}
                </div>
                <ProdutoForm p={{ ...p, preco: Number(p.preco), desconto_pix: Number(p.desconto_pix) }} base={base} />
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}
