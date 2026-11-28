import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { excluirReporte, resolverReporte } from "@/app/questoes-admin-actions";
import { BANCOS } from "@/lib/crew";
import { TIPO_REPORTE, quandoReporte, situacaoReporte, type Reporte } from "@/lib/reportes";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questão reportada" };
export const dynamic = "force-dynamic";

export default async function ReporteDetalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ f?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await getUser();
  const { data } = await supabase.rpc("admin_reportes", { p_status: "todos" });
  const r = ((data ?? []) as Reporte[]).find((x) => x.id === Number(id));
  if (!r) notFound();
  // abrir o reporte muda de "Aberto" para "Pendente"
  const { data: v } = await supabase.from("questao_reportes").select("visto_em").eq("id", r.id).maybeSingle();
  let vistoEm = (v as { visto_em: string | null } | null)?.visto_em ?? null;
  if (!vistoEm && r.status === "aberto") {
    vistoEm = new Date().toISOString();
    await supabase.from("questao_reportes").update({ visto_em: vistoEm }).eq("id", r.id);
  }
  const st = situacaoReporte(r.status, vistoEm);
  const lista = `/admin/questoes/reportes?f=${["abertos", "fechados", "todos"].includes(sp.f ?? "") ? sp.f : "abertos"}`;
  const aqui = `/admin/questoes/reportes/${r.id}`;

  return (
    <>
      <Link href={lista} className="text-sm font-semibold text-navy">← Questões reportadas</Link>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] text-muted">#{r.id} · {quandoReporte(r.created_at)} · {BANCOS[r.banco] ?? r.banco}{r.categoria ? ` · ${r.categoria}` : ""}</span>
          <span className="flex items-center gap-2">
            {r.reportes_da_questao > 1 && <span className="rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-bold text-[#7a5a00]">{r.reportes_da_questao} reportes abertos nesta questão</span>}
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.rotulo}{st.detalhe ? ` · ${st.detalhe}` : ""}</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-brand-soft/60 px-4 py-3">
          <strong className="text-[15px] text-brand-deep">🚩 {TIPO_REPORTE[r.tipo] ?? r.tipo}</strong>
          {r.mensagem && <p className="text-[15px] whitespace-pre-line">“{r.mensagem}”</p>}
          <span className="text-[13px] text-muted">
            Por <Link href={`/admin/usuarios/${r.aluno_id}`} className="font-semibold text-navy underline">{r.aluno ?? "Aluno"}</Link>{r.email ? ` · ${r.email}` : ""}
          </span>
        </div>
        <p className="text-[16px] leading-relaxed font-semibold whitespace-pre-line">{r.enunciado}</p>
        <ul className="flex flex-col gap-1.5">
          {r.alternativas.map((a) => (
            <li key={a.letra} className={`flex gap-3 rounded-xl border-2 px-3 py-2 text-[15px] ${a.letra === r.correta ? "border-[#2e9e62] bg-[#e5f6ec]" : "border-line"}`}>
              <strong className="font-display">{a.letra}</strong><span className="flex-1">{a.texto}</span>
              {a.letra === r.correta && <span className="text-xs font-bold text-[#0f6b3a]">CORRETA NO SISTEMA</span>}
            </li>
          ))}
        </ul>
        {r.explicacao && <p className="rounded-xl bg-soft px-4 py-3 text-[15px]"><strong>Explicação: </strong>{r.explicacao}</p>}
        <Link href={`/admin/questoes/${r.questao_id}?voltar=${encodeURIComponent(aqui)}`} className={`${btnSecundario} self-start`}>✏️ Abrir e corrigir a questão</Link>

        {r.status === "aberto" ? (
          <form action={resolverReporte} className="flex flex-col gap-3 border-t border-line pt-4">
            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="voltar" value={lista} />
            <label className="flex flex-col gap-1 text-[14px] font-semibold">Mensagem para o aluno (opcional)
              <textarea name="resposta" rows={3} maxLength={1500} placeholder="Ex.: Você tem razão! Ajustamos a alternativa correta para a C."
                className="rounded-xl border border-[#c9cedb] px-4 py-2.5 text-[15px] font-normal outline-none focus:border-navy" />
            </label>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1 text-[14px] font-semibold">Avisar o aluno</legend>
              <span className="flex min-h-9 items-center gap-2 text-[14px] text-ink-2">🔔 No painel de notificações dele (sempre)</span>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 text-[14px]"><input type="checkbox" name="avisar_whats" defaultChecked className="h-5 w-5 accent-navy" />No WhatsApp (ou SMS, conforme o aviso “Questão reportada respondida”)</label>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 text-[14px]"><input type="checkbox" name="avisar" defaultChecked className="h-5 w-5 accent-navy" />Por e-mail</label>
              {r.reportes_da_questao > 1 && (
                <label className="mt-1 flex min-h-9 cursor-pointer items-center gap-2 rounded-xl bg-[#fff8e6] px-3 text-[14px] font-semibold text-[#7a5a00]"><input type="checkbox" name="todos" defaultChecked className="h-5 w-5 accent-navy" />Responder os {r.reportes_da_questao} reportes abertos desta questão de uma vez</label>
              )}
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <button name="status" value="corrigido" className={btnPrimario}>✓ Corrigi a questão</button>
              <button name="status" value="sem_erro" className={btnSecundario}>A questão está certa</button>
            </div>
          </form>
        ) : (
          <form action={resolverReporte} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="voltar" value={aqui} />
            <span className="text-[14px] text-ink-2">Respondido em {r.resolvido_em ? quandoReporte(r.resolvido_em) : "—"}{r.resposta ? ` · “${r.resposta}”` : ""}</span>
            <button name="status" value="aberto" className={btnSecundario}>Reabrir</button>
          </form>
        )}

        <details className="rounded-xl border border-line p-4">
          <summary className="min-h-8 cursor-pointer text-[14px] font-semibold text-brand-deep">🗑️ Excluir sem responder</summary>
          <form action={excluirReporte} className="flex flex-wrap items-center gap-3 pt-3">
            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="voltar" value={lista} />
            <p className="text-[14px] text-ink-2">Use quando o aluno já foi atendido por outro canal (em sala, WhatsApp…). O reporte some da lista e o aluno <strong>não</strong> recebe aviso.</p>
            <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep">Sim, excluir este reporte</button>
          </form>
        </details>
      </Card>
    </>
  );
}
