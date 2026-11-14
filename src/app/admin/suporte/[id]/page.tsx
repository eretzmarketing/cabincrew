import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mudarStatusChamado } from "@/app/suporte-actions";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import { Card, btnSecundario } from "@/components/admin-ui";
import { ResponderForm } from "@/components/SuporteForms";
import { Conversa, SeloStatus, nomeDepartamento, type MensagemTicket, type Ticket } from "@/components/SuporteConversa";
import { quando } from "@/lib/suporte";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Chamado" };
export const dynamic = "force-dynamic";

export default async function ChamadoAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { supabase } = await getUser();
  const [{ data: t }, { data: ms }] = await Promise.all([
    supabase.from("tickets").select("*").eq("id", id).maybeSingle<Ticket>(),
    supabase.from("ticket_mensagens").select("id, autor_id, da_equipe, texto, anexos, criado_em").eq("ticket_id", id).order("criado_em"),
  ]);
  if (!t) notFound();
  const { data: p } = await supabase.from("profiles").select("nome, apelido, whatsapp").eq("id", t.user_id).single();
  const nomeAluno = (p?.nome as string) || (p?.apelido as string) || "Aluno";
  const { count: outros } = await supabase.from("tickets").select("id", { count: "exact", head: true }).eq("user_id", t.user_id).neq("id", t.id);

  return (
    <>
      <Link href="/admin/suporte" className="text-sm font-semibold text-navy">← Chamados</Link>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-extrabold">{t.assunto}</h1>
            <span className="text-[14px] text-muted">Chamado nº {t.id} · {nomeDepartamento(t.departamento)} · aberto em {quando(t.criado_em)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeloStatus t={t} visao="equipe" />
            <form action={mudarStatusChamado}>
              <input type="hidden" name="ticket" value={t.id} />
              <input type="hidden" name="status" value={t.status === "aberto" ? "fechado" : "aberto"} />
              <button className={btnSecundario}>{t.status === "aberto" ? "Fechar chamado" : "Reabrir chamado"}</button>
            </form>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-soft px-4 py-3 text-[15px]">
          <span>Aluno: <Link href={`/admin/usuarios/${t.user_id}`} className="font-semibold text-navy underline">{nomeAluno}</Link></span>
          {p?.whatsapp && <span className="flex items-center gap-2">{p.whatsapp as string}<BotaoWhatsapp telefone={p.whatsapp as string} nome={nomeAluno} tamanho="sm" /></span>}
          {(outros ?? 0) > 0 && <Link href={`/admin/suporte?f=todos`} className="text-muted">{outros} outro(s) chamado(s)</Link>}
        </div>
      </Card>
      <Conversa mensagens={(ms ?? []) as MensagemTicket[]} visao="equipe" nomeAluno={nomeAluno} />
      <Card>
        {!p?.whatsapp && <p className="text-[14px] text-muted">Este aluno não cadastrou WhatsApp: ele verá a resposta ao entrar em Minha conta › Suporte.</p>}
        <ResponderForm ticket={t.id} equipe />
      </Card>
    </>
  );
}
