import type { Metadata } from "next";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contas excluídas" };
export const dynamic = "force-dynamic";

type Linha = { id: number; user_id: string; nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; cadastro_em: string | null; excluida_em: string; ciente_sem_reembolso: boolean; ip: string | null };

const dataHora = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—");

export default async function ContasExcluidasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase } = await getUser();
  let consulta = supabase.from("contas_excluidas").select("id, user_id, nome, email, whatsapp, escola, cadastro_em, excluida_em, ciente_sem_reembolso, ip").order("excluida_em", { ascending: false }).limit(500);
  const busca = q.trim().replace(/[%,()]/g, "").slice(0, 60);
  if (busca) consulta = consulta.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,whatsapp.ilike.%${busca}%`);
  const { data, error } = await consulta;
  const linhas = (data ?? []) as Linha[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Registro de quem excluiu a própria conta em Minha conta, guardado para comprovação (por exemplo, em processo judicial). Os demais dados do aluno foram apagados.">Contas excluídas</Titulo>
        <a href="/admin/contas-excluidas/csv" download className={btnSecundario}>⬇ Baixar CSV</a>
      </div>

      {error ? (
        <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0038_contas_excluidas.sql</strong> no Supabase para ativar esta página.</p>
      ) : (
        <>
          <form className="flex flex-wrap gap-2" role="search">
            <label htmlFor="busca" className="sr-only">Buscar</label>
            <input id="busca" name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou WhatsApp" className="min-h-12 flex-[1_1_280px] rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px]" />
            <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Buscar</button>
          </form>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <thead className="border-b border-line text-[13px] text-muted">
                <tr>
                  <th className="p-3 font-semibold">Excluída em</th>
                  <th className="p-3 font-semibold">Nome completo</th>
                  <th className="p-3 font-semibold">E-mail</th>
                  <th className="p-3 font-semibold">WhatsApp</th>
                  <th className="p-3 font-semibold">Cadastro em</th>
                  <th className="p-3 font-semibold">Ciente sem reembolso</th>
                  <th className="p-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-b border-[#eceef3] align-top last:border-0">
                    <td className="p-3 font-semibold whitespace-nowrap">{dataHora(l.excluida_em)}</td>
                    <td className="p-3">{l.nome ?? "—"}{l.escola && <span className="block text-[13px] text-muted">{l.escola}</span>}</td>
                    <td className="p-3">{l.email ?? "—"}</td>
                    <td className="p-3 whitespace-nowrap">{l.whatsapp ?? "—"}</td>
                    <td className="p-3 whitespace-nowrap">{dataHora(l.cadastro_em)}</td>
                    <td className="p-3">{l.ciente_sem_reembolso ? "Sim" : "Não"}</td>
                    <td className="p-3 text-[13px] text-muted">{l.ip ?? "—"}</td>
                  </tr>
                ))}
                {!linhas.length && <tr><td colSpan={7} className="p-6 text-center text-ink-2">{busca ? "Nada encontrado." : "Nenhuma conta excluída até agora."}</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-muted">Horários de Brasília. O código interno de cada conta (ID) está no CSV.</p>
        </>
      )}
    </>
  );
}
