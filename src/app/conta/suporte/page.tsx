import type { Metadata } from "next";
import Link from "next/link";
import { NovoChamadoForm } from "@/components/SuporteForms";
import { SeloStatus, nomeDepartamento, type Ticket } from "@/components/SuporteConversa";
import { DEPARTAMENTOS, quando } from "@/lib/suporte";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Suporte", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuportePage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { supabase, user, profile } = await exigirLogin("/conta/suporte");
  const sp = await searchParams;
  const { data } = await supabase.from("tickets").select("*").eq("user_id", user.id).order("atualizado_em", { ascending: false });
  const lista = (data ?? []) as Ticket[];
  const aba = sp.aba === "novo" || sp.aba === "meus" ? sp.aba : lista.length ? "meus" : "novo";
  const respondidos = lista.filter((t) => t.status === "aberto" && t.aguardando === "aluno").length;
  const tab = (ativo: boolean) => `flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 font-display font-bold ${ativo ? "bg-white text-navy shadow-sm" : "text-ink-2 hover:text-navy"}`;

  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[760px] flex-col gap-6">
        <Link href="/conta" className="text-sm font-semibold text-navy">← Minha conta</Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[32px] font-extrabold">Suporte</h1>
          <p className="text-[16px] text-ink-2">Abra um chamado e acompanhe a resposta por aqui. Avisamos no seu WhatsApp{profile?.whatsapp ? "" : " (cadastre o número em Minha conta)"} quando respondermos.</p>
        </div>
        <nav aria-label="Suporte" className="flex gap-1 rounded-full bg-[#e9ebf1] p-1">
          <Link href="/conta/suporte?aba=novo" aria-current={aba === "novo" ? "page" : undefined} className={tab(aba === "novo")}>＋ Novo chamado</Link>
          <Link href="/conta/suporte?aba=meus" aria-current={aba === "meus" ? "page" : undefined} className={tab(aba === "meus")}>
            Meus chamados {respondidos > 0 && <span className="rounded-full bg-brand-strong px-2 text-[12px] text-white">{respondidos}</span>}
          </Link>
        </nav>

        {aba === "novo" ? (
          <section className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-extrabold">Abrir chamado</h2>
              <p className="text-[15px] text-ink-2">Quanto mais detalhes (e um print da tela), mais rápido resolvemos.</p>
            </div>
            <NovoChamadoForm departamentos={DEPARTAMENTOS} />
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            {!lista.length && (
              <p className="rounded-[20px] border border-line bg-white p-6 text-ink-2">Você ainda não abriu nenhum chamado. <Link href="/conta/suporte?aba=novo" className="font-semibold text-navy underline">Abrir chamado</Link></p>
            )}
            {lista.map((t) => (
              <Link key={t.id} href={`/conta/suporte/${t.id}`} className="flex flex-col gap-2 rounded-[20px] border border-line bg-white px-5 py-4 hover:border-navy">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <strong className="font-display text-[17px]">{t.assunto}</strong>
                  <SeloStatus t={t} visao="aluno" />
                </div>
                <span className="text-[14px] text-muted">Chamado nº {t.id} · {nomeDepartamento(t.departamento)} · atualizado em {quando(t.atualizado_em)}</span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
