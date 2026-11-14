import type { Metadata } from "next";
import Link from "next/link";
import { marcarContato } from "@/app/suporte-actions";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import { Titulo } from "@/components/admin-ui";
import { quando } from "@/lib/suporte";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mensagens do site" };
export const dynamic = "force-dynamic";

type Contato = { id: number; nome: string; email: string; whatsapp: string | null; assunto: string; mensagem: string; status: "novo" | "resolvido"; criado_em: string };

export default async function ContatosAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const f = sp.f === "resolvidos" || sp.f === "todos" ? sp.f : "novos";
  const { supabase } = await getUser();
  let q = supabase.from("contatos").select("*").order("criado_em", { ascending: false }).limit(300);
  if (f === "novos") q = q.eq("status", "novo");
  if (f === "resolvidos") q = q.eq("status", "resolvido");
  const { data } = await q;
  const lista = (data ?? []) as Contato[];
  const filtros = { novos: "Novas", resolvidos: "Resolvidas", todos: "Todas" } as const;
  const acao = "min-h-10 cursor-pointer rounded-full px-3 text-sm font-semibold";

  return (
    <>
      <Link href="/admin/suporte" className="text-sm font-semibold text-navy">← Chamados</Link>
      <Titulo sub="Mensagens enviadas pela página Contato (rodapé do site) por quem não tem conta. Responda pelo e-mail ou WhatsApp e marque como resolvida.">Mensagens do site</Titulo>
      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {(Object.keys(filtros) as (keyof typeof filtros)[]).map((k) => (
          <Link key={k} href={`/admin/suporte/contatos?f=${k}`} aria-current={f === k ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border-2 px-4 text-sm font-semibold ${f === k ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>{filtros[k]}</Link>
        ))}
      </nav>
      <div className="flex flex-col gap-3">
        {lista.map((c) => (
          <article key={c.id} className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 ${c.status === "novo" ? "border-brand-line" : "border-line"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col">
                <strong className="font-display text-[17px]">{c.assunto}</strong>
                <span className="text-[14px] text-muted">{c.nome} · {quando(c.criado_em)}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${c.status === "novo" ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>{c.status === "novo" ? "Nova" : "Resolvida"}</span>
            </div>
            <p className="whitespace-pre-wrap rounded-xl bg-soft px-4 py-3 text-[15px] leading-relaxed">{c.mensagem}</p>
            <div className="flex flex-wrap items-center gap-3 text-[15px]">
              <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Re: ${c.assunto}`)}`} className="font-semibold text-navy underline">{c.email}</a>
              {c.whatsapp && <span className="flex items-center gap-2">{c.whatsapp}<BotaoWhatsapp telefone={c.whatsapp} nome={c.nome} tamanho="sm" /></span>}
              <form action={marcarContato} className="ml-auto flex gap-1">
                <input type="hidden" name="id" value={c.id} />
                <button name="acao" value={c.status === "novo" ? "resolvido" : "novo"} className={`${acao} border-2 border-line text-navy hover:border-navy`}>{c.status === "novo" ? "Marcar como resolvida" : "Marcar como nova"}</button>
                <button name="acao" value="excluir" className={`${acao} text-muted hover:bg-soft hover:text-brand-deep`}>Excluir</button>
              </form>
            </div>
          </article>
        ))}
        {!lista.length && <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-2">{f === "novos" ? "Nenhuma mensagem nova." : "Nenhuma mensagem aqui."}</p>}
      </div>
    </>
  );
}
