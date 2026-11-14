import type { Metadata } from "next";
import Link from "next/link";
import { alternarCupom, excluirCupom } from "@/app/cupons-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { CompartilharCupom, CupomForm, EnviarCupomWhatsapp, type CupomAdmin } from "@/components/CuponsForms";
import { rotuloCupom } from "@/lib/cupons";
import { SITE } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";
import { whatsappConfigurado } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Cupons" };
export const dynamic = "force-dynamic";

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function situacao(c: CupomAdmin, usos: number) {
  const agora = new Date().toISOString();
  if (!c.ativo) return { t: "Desativado", cor: "bg-[#eceef3] text-ink-2" };
  if (c.fim && c.fim < agora) return { t: "Expirado", cor: "bg-[#eceef3] text-ink-2" };
  if (c.inicio && c.inicio > agora) return { t: "Agendado", cor: "bg-[#eef1ff] text-navy" };
  if (c.limite_usos && usos >= c.limite_usos) return { t: "Esgotado", cor: "bg-[#fff8e6] text-[#7a5a00]" };
  return { t: "Valendo", cor: "bg-[#e5f6ec] text-[#0f6b3a]" };
}

export default async function CuponsPage({ searchParams }: { searchParams: Promise<{ editar?: string; salvo?: string; enviar?: string }> }) {
  const { editar, salvo, enviar } = await searchParams;
  const { supabase } = await getUser();
  const [{ data, error }, { data: prods }, { data: vendas }] = await Promise.all([
    supabase.from("cupons").select("*").order("created_at", { ascending: false }),
    supabase.from("produtos").select("*").order("ordem"),
    supabase.from("compras").select("cupom, valor, status").not("cupom", "is", null).limit(20000),
  ]);
  const cupons = (data ?? []) as CupomAdmin[];
  const cursos = ((prods ?? []) as { slug: string; nome: string; excluido?: boolean }[]).filter((p) => !p.excluido).map((p) => ({ slug: p.slug, nome: p.nome }));
  const { data: lojaProds } = await supabase.from("loja_produtos").select("slug, nome").eq("excluido", false).order("ordem");
  const apostilas = ((lojaProds ?? []) as { slug: string; nome: string }[]).map((p) => ({ slug: `loja:${p.slug}`, nome: `Apostila: ${p.nome}`, destino: `/loja/${p.slug}` }));
  const planos = [...cursos, ...(apostilas.length ? [{ slug: "loja:*", nome: "Todas as apostilas", destino: "/loja" }, ...apostilas] : [])];
  const validosDe = (lista: string[] | null) => (lista?.length ? planos.filter((p) => lista.includes(p.slug) || (lista.includes("loja:*") && p.slug.startsWith("loja:"))) : cursos);
  const nomePlano = new Map(planos.map((p) => [p.slug, p.nome]));
  const uso = new Map<string, { n: number; total: number }>();
  for (const v of (vendas ?? []) as { cupom: string; valor: number; status: string }[]) {
    if (v.status !== "aprovada") continue;
    const u = uso.get(v.cupom) ?? { n: 0, total: 0 };
    u.n++; u.total += Number(v.valor); uso.set(v.cupom, u);
  }
  const emEdicao = cupons.find((c) => c.codigo === editar);
  const paraEnviar = cupons.find((c) => c.codigo === enviar);
  const alunos = paraEnviar
    ? (((await supabase.rpc("admin_publico_campanha")).data ?? []) as { id: string; nome: string | null; whatsapp: string | null; escola: string | null; bloqueado: boolean }[])
        .filter((a) => !a.bloqueado).map((a) => ({ id: a.id, nome: a.nome ?? "Sem nome", whatsapp: a.whatsapp, escola: a.escola }))
    : [];

  return (
    <>
      <Titulo sub="Descontos para parceiros e escolas. O aluno digita o código no checkout ou recebe um link com o cupom já aplicado. O desconto do Pix continua valendo por cima.">Cupons</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0047_cupons.sql</strong> no Supabase para ativar esta página.</p> : (
        <>
          {salvo && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Cupom {salvo} salvo ✓</p>}
          {paraEnviar && (
            <Card>
              <div id="enviar" className="flex scroll-mt-24 flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold">Enviar o cupom {paraEnviar.codigo} pelo WhatsApp</h2>
                <Link href={`/admin/cupons#${paraEnviar.codigo}`} className="text-[14px] font-semibold underline underline-offset-4">Fechar</Link>
              </div>
              <EnviarCupomWhatsapp codigo={paraEnviar.codigo} desconto={rotuloCupom(paraEnviar)} site={SITE} alunos={alunos} conectado={whatsappConfigurado()}
                planos={validosDe(paraEnviar.produtos)} />
            </Card>
          )}
          {emEdicao ? (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold">Editando {emEdicao.codigo}</h2>
                <Link href="/admin/cupons" className="text-[14px] font-semibold underline underline-offset-4">Cancelar</Link>
              </div>
              <CupomForm c={emEdicao} planos={planos} />
            </Card>
          ) : (
            <details className="group rounded-[22px] border-2 border-dashed border-[#c9cedb] bg-white open:border-solid open:border-navy" open={!cupons.length}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-display text-lg font-extrabold text-navy">
                <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition-transform group-open:rotate-45">+</span>
                Novo cupom
              </summary>
              <div className="px-5 pb-5"><CupomForm planos={planos} /></div>
            </details>
          )}

          {!cupons.length ? <p className="text-ink-2">Nenhum cupom ainda.</p> : cupons.map((c) => {
            const u = uso.get(c.codigo) ?? { n: 0, total: 0 };
            const st = situacao(c, u.n);
            const validos = validosDe(c.produtos);
            return (
              <Card key={c.codigo}>
                <div id={c.codigo} className="flex scroll-mt-24 flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-2xl font-extrabold tracking-wide">
                      🏷️ {c.codigo} <span className={`ml-1 rounded-full px-2.5 py-0.5 align-middle font-sans text-[12px] font-semibold tracking-normal ${st.cor}`}>{st.t}</span>
                    </h2>
                    <p className="text-[15px] text-ink-2">{c.parceiro ? <strong className="text-navy">{c.parceiro} · </strong> : null}{rotuloCupom(c)} · {c.produtos?.length ? c.produtos.map((s) => nomePlano.get(s) ?? s).join(", ") : "todos os cursos"}</p>
                    <p className="text-[14px] text-muted">
                      {c.inicio || c.fim ? `Validade: ${c.inicio ? `de ${dataBR(c.inicio)} ` : ""}${c.fim ? `até ${dataBR(c.fim)}` : "sem data final"}` : "Sem validade"} ·{" "}
                      Usos: <strong className="text-navy">{u.n}{c.limite_usos ? ` de ${c.limite_usos}` : ""}</strong> · Vendido: <strong className="text-navy">{reais(u.total)}</strong>
                    </p>
                    {c.observacao && <p className="text-[13px] text-muted">{c.observacao}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/cupons?editar=${c.codigo}`} className="min-h-10 py-2 text-[14px] font-semibold text-navy underline underline-offset-4">Editar</Link>
                    <form action={alternarCupom}><input type="hidden" name="codigo" value={c.codigo} /><input type="hidden" name="ativo" value={c.ativo ? "0" : "1"} />
                      <button className="min-h-10 cursor-pointer py-2 text-[14px] font-semibold text-navy underline underline-offset-4">{c.ativo ? "Desativar" : "Ativar"}</button></form>
                    <form action={excluirCupom}><input type="hidden" name="codigo" value={c.codigo} />
                      <button className="min-h-10 cursor-pointer py-2 text-[14px] font-semibold text-brand-deep underline underline-offset-4" title={u.n ? "Já usado em compras: será só desativado" : undefined}>Excluir</button></form>
                  </div>
                </div>
                <CompartilharCupom codigo={c.codigo} rotulo={rotuloCupom(c)} planos={validos} site={SITE} />
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}
