import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { moderarRelato, mudarStatusSelecao } from "@/app/actions";
import { CriarSelecaoForm } from "@/components/forms";
import { STATUS_SELECAO, mesAno, type Selecao } from "@/lib/forum";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Moderação", robots: { index: false } };

type Pendente = {
  id: string;
  texto: string;
  status: "publicado" | "oculto";
  selecoes: { slug: string } | null;
  denuncias: { motivo: string; resolvida: boolean }[];
};

export default async function ModeracaoPage() {
  const { supabase, profile } = await getUser();
  if (!profile?.is_admin) redirect("/");

  const [{ data: companhias }, { data: selecoes }, { data: relatos }, { count: espera }, { data: cadastros, count: totalCadastros }] = await Promise.all([
    supabase.from("companhias").select("id, nome").order("nome"),
    supabase.from("selecoes_resumo").select("*").order("mes_ref", { ascending: false }),
    supabase
      .from("relatos")
      .select("id, texto, status, selecoes(slug), denuncias(motivo, resolvida)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("lista_espera").select("email", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("nome, whatsapp, escola, pontos, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const pendentes = ((relatos ?? []) as unknown as Pendente[]).filter(
    (r) => r.status === "oculto" || r.denuncias.some((d) => !d.resolvida),
  );

  const btn = "min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold";

  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[32px] font-extrabold">Moderação</h1>
          <span className="text-[15px] text-ink-2">Lista de espera do Crew Select: <strong className="text-navy">{espera ?? 0}</strong> e-mails</span>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">Relatos denunciados ou ocultos ({pendentes.length})</h2>
          {pendentes.length === 0 && <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">Nada pendente.</p>}
          {pendentes.map((r) => (
            <article key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap gap-2 text-[13px]">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${r.status === "oculto" ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>{r.status}</span>
                {r.denuncias.filter((d) => !d.resolvida).map((d, i) => (
                  <span key={i} className="rounded-full bg-soft px-2.5 py-1 text-ink-2">{d.motivo}</span>
                ))}
                {r.selecoes && <Link href={`/forum/${r.selecoes.slug}`} className="py-1 font-semibold">ver seleção</Link>}
              </div>
              <p className="text-[15px] leading-relaxed whitespace-pre-line">{r.texto}</p>
              <form action={moderarRelato} className="flex flex-wrap gap-2">
                <input type="hidden" name="relato_id" value={r.id} />
                <button name="acao" value="publicar" className={`${btn} bg-navy text-white`}>Manter publicado</button>
                <button name="acao" value="ocultar" className={`${btn} border-2 border-line bg-white text-navy`}>Ocultar</button>
                <button name="acao" value="apagar" className={`${btn} text-brand-deep`}>Apagar</button>
              </form>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">Cadastros ({totalCadastros ?? 0})</h2>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-[15px]">
              <thead className="border-b border-line text-sm text-muted">
                <tr><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">WhatsApp</th><th className="p-3 font-semibold">Escola</th><th className="p-3 font-semibold">Pontos</th><th className="p-3 font-semibold">Cadastro</th></tr>
              </thead>
              <tbody>
                {(cadastros ?? []).map((c, i) => (
                  <tr key={i} className="border-b border-[#eceef3] last:border-0">
                    <td className="p-3">{c.nome ?? "—"}</td>
                    <td className="p-3">
                      {c.whatsapp ? <a href={`https://wa.me/${c.whatsapp.replace("+", "")}`} target="_blank" rel="noreferrer">{c.whatsapp}</a> : "—"}
                    </td>
                    <td className="p-3">{c.escola ?? "—"}</td>
                    <td className="p-3">{c.pontos}</td>
                    <td className="p-3">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="text-sm text-muted">Mostrando os 100 mais recentes. Para exportar todos: Supabase › Table Editor › profiles › Export CSV.</span>
        </section>

        <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
          <h2 className="font-display text-xl font-bold">Nova seleção</h2>
          <CriarSelecaoForm companhias={companhias ?? []} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">Seleções</h2>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead className="border-b border-line text-sm text-muted">
                <tr><th className="p-3 font-semibold">Seleção</th><th className="p-3 font-semibold">Relatos</th><th className="p-3 font-semibold">Status</th></tr>
              </thead>
              <tbody>
                {((selecoes ?? []) as Selecao[]).map((s) => (
                  <tr key={s.id} className="border-b border-[#eceef3] last:border-0">
                    <td className="p-3"><Link href={`/forum/${s.slug}`} className="font-semibold text-navy">{s.companhia} · {s.base} · {mesAno(s.mes_ref)}</Link></td>
                    <td className="p-3">{s.total_relatos}</td>
                    <td className="p-3">
                      <form action={mudarStatusSelecao} className="flex gap-2">
                        <input type="hidden" name="id" value={s.id} />
                        <label className="sr-only" htmlFor={`st-${s.id}`}>Status</label>
                        <select id={`st-${s.id}`} name="status" defaultValue={s.status} className="min-h-11 rounded-lg border border-[#c9cedb] px-2 text-sm">
                          {Object.entries(STATUS_SELECAO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button className={`${btn} bg-soft text-navy`}>Salvar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
