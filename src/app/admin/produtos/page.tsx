import type { Metadata } from "next";
import { Card, Titulo } from "@/components/admin-ui";
import { ProdutoForm } from "@/components/PagamentosForms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Produtos e preços" };
export const dynamic = "force-dynamic";

type P = { slug: string; nome: string; preco: number; desconto_pix: number; descricao: string | null; ativo: boolean; dias_apos_conclusao?: number };

export default async function ProdutosPage() {
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("produtos").select("*").order("nome");
  return (
    <>
      <Titulo sub="O preço vale na hora no checkout. Compras já feitas não mudam.">Produtos e preços</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0042_pagamentos.sql</strong> no Supabase para ativar esta página.</p> : (
        ((data ?? []) as P[]).map((p) => (
          <Card key={p.slug}>
            <h2 className="font-display text-xl font-extrabold">{p.nome}</h2>
            <ProdutoForm p={{ ...p, preco: Number(p.preco), desconto_pix: Number(p.desconto_pix) }} />
          </Card>
        ))
      )}
    </>
  );
}
