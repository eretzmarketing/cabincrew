import type { Metadata } from "next";
import Link from "next/link";
import { Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { STATUS_CAMPANHA } from "@/lib/campanhas";
import { getUser } from "@/lib/supabase/server";
import { whatsappConfigurado } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Campanhas" };
export const dynamic = "force-dynamic";

type Camp = { id: number; nome: string; fonte: string; status: string; total: number; created_at: string; intervalo_min: number; intervalo_max: number };

export default async function CampanhasPage() {
  const { supabase } = await getUser();
  const [{ data, error }, { data: env }] = await Promise.all([
    supabase.from("whatsapp_campanhas").select("id, nome, fonte, status, total, created_at, intervalo_min, intervalo_max").order("created_at", { ascending: false }).limit(100),
    supabase.from("whatsapp_campanha_envios").select("campanha_id, status").neq("status", "pendente").limit(100000),
  ]);
  const feitos = new Map<number, number>();
  for (const e of env ?? []) if (e.status !== "enviando") feitos.set(e.campanha_id as number, (feitos.get(e.campanha_id as number) ?? 0) + 1);
  const lista = (data ?? []) as Camp[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Mensagens de WhatsApp para vários alunos de uma vez (promoções, avisos, lançamentos), com intervalo entre os envios para proteger o seu número.">Campanhas</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/campanhas/modelos" className={btnSecundario}>Modelos de mensagem</Link>
          <Link href="/admin/campanhas/nova" className={btnPrimario}>+ Nova campanha</Link>
        </div>
      </div>
      {!whatsappConfigurado() && <p className="rounded-2xl bg-[#fff8e6] px-5 py-4 font-semibold text-[#7a5a00]">Conecte o Wawp em Configurações → WhatsApp antes de enviar.</p>}
      {error ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0040_campanhas_whatsapp.sql</strong> no Supabase para ativar esta página.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="border-b border-line text-[13px] text-muted">
              <tr><th className="p-3 font-semibold">Criada em</th><th className="p-3 font-semibold">Campanha</th><th className="p-3 font-semibold">Público</th><th className="p-3 font-semibold">Progresso</th><th className="p-3 font-semibold">Status</th></tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-[#eceef3] last:border-0">
                  <td className="p-3 whitespace-nowrap">{new Date(c.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="p-3"><Link href={`/admin/campanhas/${c.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{c.nome}</Link></td>
                  <td className="p-3">{c.fonte === "alunos" ? "Alunos" : "Lista Em breve"}</td>
                  <td className="p-3">{feitos.get(c.id) ?? 0} de {c.total}</td>
                  <td className="p-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS_CAMPANHA[c.status]?.cor ?? ""}`}>{STATUS_CAMPANHA[c.status]?.rotulo ?? c.status}</span></td>
                </tr>
              ))}
              {!lista.length && <tr><td colSpan={5} className="p-6 text-center text-ink-2">Nenhuma campanha ainda. Crie um modelo de mensagem e depois uma campanha.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
