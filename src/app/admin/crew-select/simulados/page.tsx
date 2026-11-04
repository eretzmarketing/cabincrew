import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { SimuladoForm } from "@/components/admin-forms";
import { BANCOS, type Simulado } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Simulados" };

export default async function AdminSimulados({ searchParams }: { searchParams: Promise<{ editar?: string }> }) {
  const { editar } = await searchParams;
  const { supabase } = await getUser();
  const [{ data: sims }, { data: contagem }, { data: aulas }, { data: tent }] = await Promise.all([
    supabase.from("simulados").select("*").order("titulo"),
    supabase.rpc("contagem_bancos"),
    supabase.from("aulas").select("simulado_id, publicado").not("simulado_id", "is", null),
    supabase.from("tentativas").select("simulado_id, nota").not("finalizada_em", "is", null).limit(5000),
  ]);
  const simulados = (sims ?? []) as Simulado[];
  const emEdicao = simulados.find((s) => String(s.id) === editar);

  const porBanco = new Map<string, number>();
  for (const c of (contagem ?? []) as { banco: string; total: number }[]) porBanco.set(c.banco, (porBanco.get(c.banco) ?? 0) + Number(c.total));
  const pub = new Map<number, boolean>();
  for (const a of aulas ?? []) if (a.simulado_id) pub.set(a.simulado_id, (pub.get(a.simulado_id) ?? false) || a.publicado);
  const stats = new Map<number, { n: number; soma: number }>();
  for (const t of tent ?? []) {
    const s = stats.get(t.simulado_id) ?? { n: 0, soma: 0 };
    s.n += 1;
    s.soma += t.nota ?? 0;
    stats.set(t.simulado_id, s);
  }

  return (
    <>
      <Link href="/admin/crew-select" className="text-sm font-semibold text-muted hover:text-navy">← Crew Select</Link>
      <Titulo sub="Cada simulado sorteia questões dos bancos escolhidos. Ele aparece para o aluno pela aula do tipo Simulado.">Simulados e questões</Titulo>

      <Card>
        <h2 className="font-display text-xl font-bold">Bancos de questões</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(BANCOS).map(([k, v]) => (
            <div key={k} className="flex flex-[1_1_180px] flex-col rounded-xl border border-line px-4 py-3">
              <span className="text-[13px] text-muted">{v}</span>
              <strong className="font-display text-2xl">{(porBanco.get(k) ?? 0).toLocaleString("pt-BR")}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr><th className="p-3 font-semibold">Simulado</th><th className="p-3 font-semibold">Formato</th><th className="p-3 font-semibold">Feitos</th><th className="p-3 font-semibold">Média</th><th className="p-3 font-semibold">Aula</th></tr>
          </thead>
          <tbody>
            {simulados.map((s) => {
              const st = stats.get(s.id);
              const visivel = pub.get(s.id);
              return (
                <tr key={s.id} className="border-b border-[#eceef3] last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/crew-select/simulados?editar=${s.id}#editar`} className="font-semibold text-navy hover:text-brand-strong">{s.titulo}</Link>
                    <span className="block text-[13px] text-muted">{s.bancos.map((b) => BANCOS[b] ?? b).join(", ")}{s.categorias?.length ? ` · ${s.categorias.join(", ")}` : ""}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{s.qtd_questoes} questões{s.tempo_min ? ` · ${s.tempo_min} min` : ""} · mín. {s.nota_minima}%</td>
                  <td className="p-3">{st?.n ?? 0}</td>
                  <td className="p-3">{st?.n ? `${Math.round(st.soma / st.n)}%` : "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${visivel ? "bg-[#e5f6ec] text-[#0f6b3a]" : visivel === false ? "bg-[#fff3e0] text-[#8a4b00]" : "bg-[#eef0f4] text-ink-2"}`}>
                      {visivel ? "Publicada" : visivel === false ? "Rascunho" : "Sem aula"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!simulados.length && <tr><td colSpan={5} className="p-6 text-center text-ink-2">Nenhum simulado ainda.</td></tr>}
          </tbody>
        </table>
      </div>

      <Card>
        <h2 id="editar" className="font-display text-xl font-bold">{emEdicao ? `Editar: ${emEdicao.titulo}` : "Novo simulado"}</h2>
        <SimuladoForm key={emEdicao?.id ?? "novo"} s={emEdicao} />
        {emEdicao && <Link href="/admin/crew-select/simulados" className="text-sm font-semibold">Criar um novo em vez de editar</Link>}
      </Card>
    </>
  );
}
