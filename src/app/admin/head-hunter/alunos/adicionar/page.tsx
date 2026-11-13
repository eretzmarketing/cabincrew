import type { Metadata } from "next";
import Link from "next/link";
import { cancelarAcessoPendente } from "@/app/pagamentos-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { AdicionarAlunoForm } from "@/components/PagamentosForms";
import { FORMAS, dataHoraBR } from "@/lib/compras";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Adicionar aluno ao Head Hunter" };
export const dynamic = "force-dynamic";

type Pendente = { email: string; nome: string | null; motivo: string | null; criado_em: string };

export default async function AdicionarAlunoPage({ searchParams }: { searchParams: Promise<{ email?: string; nome?: string }> }) {
  const { email = "", nome = "" } = await searchParams;
  const { supabase } = await getUser();
  const [{ data: prod }, { data: pend, error }] = await Promise.all([
    supabase.from("produtos").select("preco").eq("slug", "head-hunter").maybeSingle(),
    supabase.from("acessos_pendentes").select("email, nome, motivo, criado_em").order("criado_em", { ascending: false }),
  ]);
  const agora = new Date(new Date().getTime() - 3 * 3600000).toISOString().slice(0, 16);
  const pendentes = (pend ?? []) as Pendente[];

  return (
    <>
      <Link href="/admin/head-hunter/alunos" className="text-sm font-semibold text-navy">← Alunos</Link>
      <Titulo sub="Para cortesias e para quem pagou fora do site (Pix direto, curso presencial). O acesso segue as mesmas regras de quem compra pelo site: vale até concluir a jornada, mais os dias de revisão.">Adicionar aluno ao Head Hunter</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0043_acesso_manual.sql</strong> no Supabase para ativar esta página.</p> : (
        <>
          <Card>
            <AdicionarAlunoForm emailInicial={email} nomeInicial={nome} precoPadrao={prod ? String(prod.preco).replace(".", ",") : ""} agora={agora} formas={FORMAS} />
          </Card>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-extrabold">Aguardando cadastro</h2>
            <p className="text-[15px] text-ink-2">Pessoas com acesso reservado que ainda não criaram a conta. O acesso libera sozinho quando elas se cadastrarem com o e-mail abaixo.</p>
            {!pendentes.length ? <p className="text-ink-2">Ninguém aguardando.</p> : (
              <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full min-w-[620px] text-left text-[14px]">
                  <thead className="border-b border-line text-[13px] text-muted"><tr><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">E-mail</th><th className="p-3 font-semibold">Origem</th><th className="p-3 font-semibold">Reservado em</th><th className="p-3" /></tr></thead>
                  <tbody>
                    {pendentes.map((p) => (
                      <tr key={p.email} className="border-b border-[#eceef3] last:border-0">
                        <td className="p-3 font-semibold">{p.nome ?? "—"}</td>
                        <td className="p-3">{p.email}</td>
                        <td className="p-3">{p.motivo?.replace(" (liberado pelo administrador)", "") ?? "—"}</td>
                        <td className="p-3 whitespace-nowrap">{dataHoraBR(p.criado_em)}</td>
                        <td className="p-3 text-right"><form action={cancelarAcessoPendente}><input type="hidden" name="email" value={p.email} /><button className="min-h-10 cursor-pointer text-[14px] font-semibold text-brand-deep underline underline-offset-4">Cancelar</button></form></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
