import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { AdicionarEscolas, ListaEscolas } from "@/components/EscolasAdmin";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Escolas de aviação" };
export const dynamic = "force-dynamic";

export default async function EscolasConfigPage() {
  const { supabase } = await getUser();
  const [{ data, error }, { data: pessoas }] = await Promise.all([
    supabase.from("escolas").select("nome").limit(5000),
    supabase.rpc("admin_publico_campanha"),
  ]);
  const cont = new Map<string, number>();
  for (const p of (pessoas ?? []) as { escola: string | null }[]) {
    const k = (p.escola ?? "").trim().toLowerCase();
    if (k) cont.set(k, (cont.get(k) ?? 0) + 1);
  }
  const escolas = ((data ?? []) as { nome: string }[])
    .map((e) => ({ nome: e.nome, alunos: cont.get(e.nome.trim().toLowerCase()) ?? 0 }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <>
      <Titulo sub="A lista que aparece no cadastro e em Minha conta. Quem não acha a escola pode escrever o nome em “Minha escola não está na lista”.">Escolas de aviação</Titulo>
      {error && <p role="alert" className="rounded-2xl bg-brand-soft px-5 py-4 font-semibold text-brand-deep">Falta rodar o SQL 0076_escolas.sql no Supabase. Enquanto isso, o cadastro usa a lista antiga.</p>}
      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Adicionar escolas</h2>
        <AdicionarEscolas />
      </Card>
      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Escolas na lista</h2>
        <ListaEscolas escolas={escolas} />
      </Card>
      <p className="text-[14px] text-ink-2">Para dar benefícios a alunos de uma escola, use <Link href="/admin/usuarios/escolas" className="font-semibold underline underline-offset-4">Usuários › Regras por escola</Link>.</p>
    </>
  );
}
