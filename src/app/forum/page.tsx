import type { Metadata } from "next";
import { exigirForum } from "@/lib/forum-gate";
import Link from "next/link";
import SelecaoCard from "@/components/SelecaoCard";
import type { Selecao } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Fórum de Seleções",
  description: "Relatos das seleções de comissário de voo, organizados por companhia, processo e fase.",
};

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ companhia?: string; status?: string }> }) {
  await exigirForum();
  const { companhia, status } = await searchParams;
  const supabase = await createClient();

  const [{ data: companhias }, consulta] = await Promise.all([
    supabase.from("companhias").select("nome, slug").order("nome"),
    (() => {
      let q = supabase.from("selecoes_resumo").select("*");
      if (companhia) q = q.eq("companhia_slug", companhia);
      q = status === "encerrada" ? q.eq("status", "encerrada") : q.neq("status", "encerrada");
      return q.order("mes_ref", { ascending: false }).order("ultimo_relato", { ascending: false, nullsFirst: false });
    })(),
  ]);
  const selecoes = (consulta.data ?? []) as Selecao[];

  const filtro = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const v = { companhia, status, ...params };
    Object.entries(v).forEach(([k, val]) => val && p.set(k, val));
    const s = p.toString();
    return s ? `/forum?${s}` : "/forum";
  };
  const chip = (ativo: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border-2 px-[18px] text-sm font-semibold ${
      ativo ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"
    }`;

  return (
    <main className="bg-soft">
      <section className="border-b border-line bg-white px-6 pt-10 pb-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[34px] font-extrabold tracking-[-0.01em] md:text-[38px]">Fórum de Seleções</h1>
            <p className="max-w-[640px] text-[17px] text-ink-2">
              Escolha um processo seletivo para ler e publicar relatos de cada fase.
            </p>
          </div>
          <nav aria-label="Filtrar por companhia" className="flex flex-wrap gap-2.5">
            <Link href={filtro({ companhia: undefined })} className={chip(!companhia)} aria-current={!companhia ? "page" : undefined}>Todas</Link>
            {(companhias ?? []).map((c) => (
              <Link key={c.slug} href={filtro({ companhia: c.slug })} className={chip(companhia === c.slug)} aria-current={companhia === c.slug ? "page" : undefined}>
                {c.nome}
              </Link>
            ))}
            <span className="mx-1 hidden w-px bg-line sm:block" aria-hidden="true" />
            <Link href={filtro({ status: status === "encerrada" ? undefined : "encerrada" })} className={chip(status === "encerrada")}>
              {status === "encerrada" ? "Ver abertas" : "Ver encerradas"}
            </Link>
          </nav>
        </div>
      </section>

      <section className="px-6 py-10 pb-20">
        <div className="mx-auto max-w-[1200px]">
          {selecoes.length ? (
            <div className="flex flex-wrap gap-6">
              {selecoes.map((s) => <SelecaoCard key={s.id} s={s} />)}
            </div>
          ) : (
            <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-12 text-center text-ink-2">
              Nenhuma seleção encontrada com esses filtros.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
