import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Titulo } from "@/components/admin-ui";
import { CampanhaEnvio, Previa } from "@/components/Campanhas";
import { STATUS_CAMPANHA } from "@/lib/campanhas";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Campanha" };
export const dynamic = "force-dynamic";

const ST: Record<string, string> = { pendente: "Na fila", enviando: "Enviando", enviada: "Enviada ✓", erro: "Erro", sem_whatsapp: "Sem WhatsApp" };

export default async function CampanhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { supabase } = await getUser();
  const [{ data: c }, { data: envios }] = await Promise.all([
    supabase.from("whatsapp_campanhas").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("whatsapp_campanha_envios").select("id, nome, telefone, status, erro, enviado_em").eq("campanha_id", Number(id)).order("id"),
  ]);
  if (!c) notFound();
  const lista = envios ?? [];
  const cont = { total: lista.length, enviada: 0, erro: 0, sem_whatsapp: 0, pendente: 0 };
  for (const e of lista) {
    if (e.status === "enviada") cont.enviada++; else if (e.status === "erro") cont.erro++; else if (e.status === "sem_whatsapp") cont.sem_whatsapp++; else cont.pendente++;
  }

  return (
    <>
      <Link href="/admin/campanhas" className="text-sm font-semibold text-navy">← Campanhas</Link>
      <Titulo sub={`${c.fonte === "alunos" ? "Alunos" : "Lista Em breve"} · ${c.total} destinatário(s) · intervalo de ${c.intervalo_min} a ${c.intervalo_max} segundos`}>
        {c.nome} <span className={`ml-2 inline-block rounded-full px-3 py-1 align-middle text-sm font-semibold ${STATUS_CAMPANHA[c.status]?.cor ?? ""}`}>{STATUS_CAMPANHA[c.status]?.rotulo ?? c.status}</span>
      </Titulo>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <h2 className="font-display text-xl font-extrabold">Envio</h2>
          <CampanhaEnvio id={c.id} statusInicial={c.status} contagemInicial={cont} />
        </Card>
        <Card>
          <h2 className="font-display text-xl font-extrabold">Mensagem</h2>
          <Previa texto={c.texto} imagem={c.imagem} nome={(lista[0]?.nome ?? "Ana").split(" ")[0]} />
        </Card>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Destinatários</h2>
        <div className="max-h-[560px] overflow-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="sticky top-0 border-b border-line bg-white text-[13px] text-muted"><tr><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">WhatsApp</th><th className="p-3 font-semibold">Situação</th><th className="p-3 font-semibold">Quando</th></tr></thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id} className="border-b border-[#eceef3] last:border-0">
                  <td className="p-3">{e.nome}</td>
                  <td className="p-3 whitespace-nowrap">{e.telefone}</td>
                  <td className="p-3">{ST[e.status] ?? e.status}{e.erro && <span className="block text-[12px] text-muted">{e.erro}</span>}</td>
                  <td className="p-3 whitespace-nowrap text-muted">{e.enviado_em && e.status !== "pendente" ? new Date(e.enviado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", timeStyle: "short", dateStyle: "short" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
