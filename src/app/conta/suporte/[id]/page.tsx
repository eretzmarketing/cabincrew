import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponderForm } from "@/components/SuporteForms";
import { Conversa, SeloStatus, nomeDepartamento, type MensagemTicket, type Ticket } from "@/components/SuporteConversa";
import { quando } from "@/lib/suporte";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Chamado de suporte", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ChamadoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, user, profile } = await exigirLogin(`/conta/suporte/${id}`);
  if (!/^\d+$/.test(id)) notFound();
  const [{ data: t }, { data: ms }] = await Promise.all([
    supabase.from("tickets").select("*").eq("id", id).eq("user_id", user.id).maybeSingle<Ticket>(),
    supabase.from("ticket_mensagens").select("id, autor_id, da_equipe, texto, anexos, criado_em").eq("ticket_id", id).order("criado_em"),
  ]);
  if (!t) notFound();

  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[760px] flex-col gap-6">
        <Link href="/conta/suporte?aba=meus" className="text-sm font-semibold text-navy">← Meus chamados</Link>
        {sp.novo && (
          <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 text-[15px] text-[#0f6b3a]">
            ✓ Chamado enviado! Nossa equipe vai responder aqui{profile?.whatsapp ? " e você recebe o aviso no WhatsApp" : ""}.
          </p>
        )}
        <header className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-extrabold">{t.assunto}</h1>
            <SeloStatus t={t} visao="aluno" />
          </div>
          <span className="text-[14px] text-muted">Chamado nº {t.id} · {nomeDepartamento(t.departamento)} · aberto em {quando(t.criado_em)}</span>
        </header>
        <Conversa mensagens={(ms ?? []) as MensagemTicket[]} visao="aluno" nomeAluno="Você" />
        <section className="rounded-[20px] border border-line bg-white p-6">
          {t.status === "fechado" && <p className="mb-4 text-[15px] text-ink-2">Este chamado foi fechado. Se o problema continuar, escreva abaixo que ele é reaberto.</p>}
          <ResponderForm ticket={t.id} fechado={t.status === "fechado"} />
        </section>
      </div>
    </main>
  );
}
