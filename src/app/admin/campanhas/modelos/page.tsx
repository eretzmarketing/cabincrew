import type { Metadata } from "next";
import Link from "next/link";
import { excluirTemplate } from "@/app/campanhas-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { TemplateForm } from "@/components/Campanhas";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Modelos de campanha" };
export const dynamic = "force-dynamic";

type T = { id: number; nome: string; texto: string; imagem: string | null; updated_at: string };

export default async function ModelosPage({ searchParams }: { searchParams: Promise<{ editar?: string }> }) {
  const { editar } = await searchParams;
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("whatsapp_templates").select("id, nome, texto, imagem, updated_at").order("updated_at", { ascending: false });
  const lista = (data ?? []) as T[];
  const emEdicao = lista.find((t) => String(t.id) === editar);

  return (
    <>
      <Link href="/admin/campanhas" className="text-sm font-semibold text-navy">← Campanhas</Link>
      <Titulo sub="Mensagens prontas para usar nas campanhas, com imagem opcional (por exemplo, a arte da Black Friday). Use {nome} para o primeiro nome de cada pessoa.">Modelos de mensagem</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0040_campanhas_whatsapp.sql</strong> no Supabase.</p> : (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold">{emEdicao ? `Editando: ${emEdicao.nome}` : "Novo modelo"}</h2>
              {emEdicao && <Link href="/admin/campanhas/modelos" className="text-sm font-semibold underline underline-offset-4">Criar um novo em vez disso</Link>}
            </div>
            <TemplateForm key={emEdicao?.id ?? "novo"} t={emEdicao} />
          </Card>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-extrabold">Seus modelos</h2>
            {!lista.length && <p className="text-ink-2">Nenhum modelo ainda.</p>}
            <ul className="grid gap-3 md:grid-cols-2">
              {lista.map((t) => (
                <li key={t.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-display">{t.nome}{t.imagem && <span className="ml-2 text-[13px] font-normal text-muted">🖼 com imagem</span>}</strong>
                    <span className="text-[13px] text-muted">{new Date(t.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="line-clamp-3 text-[14px] whitespace-pre-line text-ink-2">{t.texto}</p>
                  <div className="flex gap-3">
                    <Link href={`/admin/campanhas/modelos?editar=${t.id}`} className="min-h-10 py-2 text-[14px] font-semibold text-navy underline underline-offset-4">Editar</Link>
                    <form action={excluirTemplate}><input type="hidden" name="id" value={t.id} /><button className="min-h-10 cursor-pointer py-2 text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir</button></form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
