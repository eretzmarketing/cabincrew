import type { Metadata } from "next";
import Link from "next/link";
import { MarcarLidas } from "@/components/MarcarLidas";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notificações", robots: { index: false } };
export const dynamic = "force-dynamic";

type Notificacao = { id: number; tipo: string; titulo: string; texto: string | null; link: string | null; lida_em: string | null; created_at: string };
const ICONE: Record<string, string> = { reporte: "🛠️", suporte: "💬", compra: "🎉", aviso: "🔔" };

export default async function Notificacoes() {
  const { supabase, user } = await exigirLogin("/conta/notificacoes");
  const { data, error } = await supabase.from("notificacoes").select("id, tipo, titulo, texto, link, lida_em, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  const lista = (data ?? []) as Notificacao[];
  const novas = lista.filter((n) => !n.lida_em).length;
  return (
    <main className="bg-soft px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <Link href="/conta" className="text-sm font-semibold text-navy">← Minha conta</Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[32px] font-extrabold">Notificações</h1>
          <p className="text-ink-2">{novas ? `Você tem ${novas} ${novas === 1 ? "notificação nova" : "notificações novas"}.` : "Respostas da equipe e avisos importantes aparecem aqui."}</p>
        </div>
        {novas > 0 && <MarcarLidas />}
        {(error || !lista.length) && (
          <p className="rounded-[20px] border border-line bg-white p-6 text-ink-2">Nenhuma notificação por enquanto. 🔔</p>
        )}
        <ul className="flex flex-col gap-3">
          {lista.map((n) => (
            <li key={n.id} className={`flex gap-4 rounded-[20px] border bg-white p-5 ${n.lida_em ? "border-line" : "border-brand-strong/40 shadow-[0_8px_24px_-18px_rgba(200,16,46,.6)]"}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-soft text-[22px]" aria-hidden="true">{ICONE[n.tipo] ?? "🔔"}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-display text-[17px]">{n.titulo}</strong>
                  {!n.lida_em && <span className="rounded-full bg-brand-strong px-2 py-0.5 text-[11px] font-bold text-white">Nova</span>}
                </div>
                {n.texto && <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{n.texto}</p>}
                <span className="text-[13px] text-muted">{new Date(n.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
                {n.link && <Link href={n.link} className="self-start text-[14px] font-semibold text-navy underline underline-offset-4">Abrir →</Link>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
