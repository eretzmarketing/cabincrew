import type { Metadata } from "next";
import Link from "next/link";
import { excluirProdutoLoja } from "@/app/loja-actions";
import { Card, Titulo, btnSecundario } from "@/components/admin-ui";
import { NovoProdutoLojaForm, ProdutoLojaForm } from "@/components/LojaAdminForms";
import { reais, type ProdutoLoja } from "@/lib/loja";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Produtos da loja" };

export default async function ProdutosLoja() {
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("loja_produtos").select("*").eq("excluido", false).order("ordem");
  const produtos = (data ?? []) as ProdutoLoja[];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Apostilas e outros produtos físicos enviados pelos Correios. Preço, fotos, frete e estoque.">Produtos da loja</Titulo>
        <Link href="/loja" target="_blank" className={btnSecundario}>Ver a loja ↗</Link>
      </div>
      {error && <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0055_loja.sql</strong> no Supabase para ativar a loja.</p>}
      {produtos.map((p) => (
        <Card key={p.slug}>
          <details>
            <summary className="flex min-h-12 cursor-pointer flex-wrap items-center gap-3">
              {p.imagens[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- capa
                <img src={p.imagens[0]} alt="" className="h-14 w-11 rounded-md bg-soft object-contain" />
              )}
              <strong className="font-display text-lg">{p.nome}</strong>
              <span className="text-ink-2">{reais(p.preco)}{Number(p.frete) === 0 ? " · frete grátis" : ` · frete ${reais(p.frete)}`}{p.estoque !== null ? ` · estoque ${p.estoque}` : ""}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${p.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eceef3] text-ink-2"}`}>{p.ativo ? "À venda" : "Fora da loja"}</span>
              <span className="ml-auto text-[14px] font-semibold text-brand-strong">Editar</span>
            </summary>
            <div className="flex flex-col gap-4 pt-4">
              <ProdutoLojaForm p={p} />
              <form action={excluirProdutoLoja} className="self-end">
                <input type="hidden" name="slug" value={p.slug} />
                <button className="min-h-10 cursor-pointer text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir produto</button>
              </form>
            </div>
          </details>
        </Card>
      ))}
      <Card>
        <details>
          <summary className="min-h-11 cursor-pointer font-display text-lg font-bold">+ Novo produto</summary>
          <div className="pt-4"><NovoProdutoLojaForm /></div>
        </details>
      </Card>
    </>
  );
}
