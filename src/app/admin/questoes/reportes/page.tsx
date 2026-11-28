import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { BANCOS } from "@/lib/crew";
import { TIPO_REPORTE, quandoReporte, situacaoReporte, type Reporte } from "@/lib/reportes";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questões reportadas" };
export const dynamic = "force-dynamic";

const FILTROS: [string, string][] = [["abertos", "Em aberto"], ["fechados", "Fechados"], ["todos", "Todos"]];

export default async function Reportes({ searchParams }: { searchParams: Promise<{ f?: string; ok?: string }> }) {
  const sp = await searchParams;
  const f = FILTROS.some(([v]) => v === sp.f) ? sp.f! : "abertos";
  const { supabase } = await getUser();
  const { data, error } = await supabase.rpc("admin_reportes", { p_status: f === "abertos" ? "aberto" : "todos" });
  const todos = (data ?? []) as Reporte[];
  const lista = f === "fechados" ? todos.filter((r) => r.status !== "aberto") : todos;
  const ids = lista.map((r) => r.id);
  const alunos = [...new Set(lista.map((r) => r.aluno_id))];
  const [{ data: vistos }, { data: perfis }] = await Promise.all([
    ids.length ? supabase.from("questao_reportes").select("id, visto_em").in("id", ids) : Promise.resolve({ data: [] }),
    alunos.length ? supabase.from("profiles").select("id, avatar_em, escola").in("id", alunos) : Promise.resolve({ data: [] }),
  ]);
  const visto = new Map(((vistos ?? []) as { id: number; visto_em: string | null }[]).map((v) => [v.id, v.visto_em]));
  const perfil = new Map(((perfis ?? []) as { id: string; avatar_em: string | null; escola: string | null }[]).map((p) => [p.id, p]));

  return (
    <>
      <Titulo sub="Questões que os alunos marcaram com erro. Clique no olho para ver tudo, responder (painel de notificações, WhatsApp e e-mail) ou excluir.">Questões reportadas</Titulo>
      {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{sp.ok}</p>}
      {error && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">Rode o SQL 0070_questoes_comunidade.sql no Supabase para usar esta página.</p>}

      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {FILTROS.map(([v, t]) => (
          <Link key={v} href={`/admin/questoes/reportes?f=${v}`} aria-current={f === v ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${f === v ? "bg-navy text-white" : "border-2 border-line bg-white text-navy hover:border-navy"}`}>{t}</Link>
        ))}
      </nav>

      {!lista.length ? (
        <Card><p className="text-ink-2">{f === "abertos" ? "Nenhum reporte em aberto. 🎉" : "Nada por aqui."}</p></Card>
      ) : (
        <ul aria-label="Reportes" className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {lista.map((r) => {
            const st = situacaoReporte(r.status, visto.get(r.id));
            const p = perfil.get(r.aluno_id);
            const foto = avatarUrl(r.aluno_id, p?.avatar_em);
            const nome = r.aluno ?? "Aluno";
            return (
              <li key={r.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${st.rotulo === "Aberto" ? "bg-[#fffafa]" : ""}`}>
                <div className="flex min-w-0 flex-[1_1_230px] items-center gap-3">
                  {foto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={foto} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e3e6ee] text-[13px] font-bold text-navy uppercase" aria-hidden="true">{nome.slice(0, 2)}</span>}
                  <span className="flex min-w-0 flex-col">
                    <span className={`truncate text-[15px] text-navy ${st.rotulo === "Aberto" ? "font-bold" : "font-semibold"}`}>{nome}</span>
                    <span className="truncate text-[13px] text-muted">{TIPO_REPORTE[r.tipo] ?? r.tipo}{r.reportes_da_questao > 1 && r.status === "aberto" ? ` · ${r.reportes_da_questao} reportes nesta questão` : ""}</span>
                  </span>
                </div>
                <span className="w-[130px] text-[14px] text-ink-2">{quandoReporte(r.created_at)}</span>
                <span className="min-w-0 flex-[1_1_180px] truncate text-[14px] text-ink-2" title={`${BANCOS[r.banco] ?? r.banco}${r.categoria ? ` · ${r.categoria}` : ""}`}>
                  {BANCOS[r.banco] ?? r.banco}{r.categoria ? ` · ${r.categoria}` : ""}
                </span>
                <span className={`w-[104px] rounded-full px-3 py-1 text-center text-[12px] font-bold ${st.cls}`}>{st.rotulo}{st.detalhe && <span className="block text-[11px] font-semibold opacity-80">{st.detalhe}</span>}</span>
                <Link href={`/admin/questoes/reportes/${r.id}?f=${f}`} aria-label={`Ver o reporte de ${nome}`} title="Ver"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-line text-navy hover:border-navy">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[13px] text-muted"><strong>Aberto</strong>: ainda não visto · <strong>Pendente</strong>: já visto, falta responder · <strong>Fechado</strong>: respondido.</p>
    </>
  );
}
