import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { resolverReporte } from "@/app/questoes-admin-actions";
import { BANCOS } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questões reportadas" };
export const dynamic = "force-dynamic";

type Rep = {
  id: number; questao_id: string; banco: string; categoria: string | null; enunciado: string; alternativas: { letra: string; texto: string | null }[];
  correta: string | null; explicacao: string | null; tipo: string; mensagem: string | null; status: string; resposta: string | null;
  created_at: string; resolvido_em: string | null; aluno_id: string; aluno: string | null; email: string | null; reportes_da_questao: number;
};
const TIPO: Record<string, string> = { gabarito: "Resposta certa errada", enunciado: "Erro no enunciado", alternativas: "Erro nas alternativas", explicacao: "Erro na explicação", outro: "Outro problema" };
const STATUS: Record<string, [string, string]> = {
  aberto: ["Aberto", "bg-brand-soft text-brand-deep"],
  corrigido: ["Corrigido", "bg-[#e5f6ec] text-[#0f6b3a]"],
  sem_erro: ["Sem erro", "bg-[#eef0f4] text-ink-2"],
};
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Reportes({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const status = ["aberto", "corrigido", "sem_erro", "todos"].includes(sp.status ?? "") ? sp.status! : "aberto";
  const { supabase } = await getUser();
  const { data, error } = await supabase.rpc("admin_reportes", { p_status: status });
  const lista = (data ?? []) as Rep[];
  const aqui = `/admin/questoes/reportes?status=${status}`;

  return (
    <>
      <Titulo sub="Questões que os alunos marcaram com erro. Uma cópia também vai para o e-mail e os WhatsApps da equipe (Suporte › E-mail e avisos).">Questões reportadas</Titulo>
      {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{sp.ok}</p>}
      {error && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">Rode o SQL 0070_questoes_comunidade.sql no Supabase para usar esta página.</p>}

      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {[["aberto", "Abertos"], ["corrigido", "Corrigidos"], ["sem_erro", "Sem erro"], ["todos", "Todos"]].map(([v, t]) => (
          <Link key={v} href={`/admin/questoes/reportes?status=${v}`} aria-current={status === v ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${status === v ? "bg-navy text-white" : "border-2 border-line bg-white text-navy hover:border-navy"}`}>{t}</Link>
        ))}
      </nav>

      {!lista.length ? (
        <Card><p className="text-ink-2">{status === "aberto" ? "Nenhum reporte aberto. 🎉" : "Nada por aqui."}</p></Card>
      ) : lista.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[14px] text-muted">
              #{r.id} · {quando(r.created_at)} · {BANCOS[r.banco] ?? r.banco}{r.categoria ? ` · ${r.categoria}` : ""}
            </span>
            <span className="flex items-center gap-2">
              {r.reportes_da_questao > 1 && <span className="rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-bold text-[#7a5a00]">{r.reportes_da_questao} reportes abertos nesta questão</span>}
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status]?.[1]}`}>{STATUS[r.status]?.[0] ?? r.status}</span>
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-brand-soft/60 px-4 py-3">
            <strong className="text-[15px] text-brand-deep">🚩 {TIPO[r.tipo] ?? r.tipo}</strong>
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
              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="voltar" value={aqui} />
              <label className="flex flex-col gap-1 text-[14px] font-semibold">Mensagem para o aluno (opcional)
                <textarea name="resposta" rows={2} maxLength={1500} placeholder="Ex.: Você tem razão! Ajustamos a alternativa correta para a C."
                  className="rounded-xl border border-[#c9cedb] px-4 py-2.5 text-[15px] font-normal outline-none focus:border-navy" />
              </label>
              <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="avisar" defaultChecked className="h-4 w-4 accent-navy" />Avisar o aluno por e-mail</label>
              <div className="flex flex-wrap gap-2">
                <button name="status" value="corrigido" className={btnPrimario}>✓ Corrigi a questão</button>
                <button name="status" value="sem_erro" className={btnSecundario}>A questão está certa</button>
              </div>
            </form>
          ) : (
            <form action={resolverReporte} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="voltar" value={aqui} />
              <span className="text-[14px] text-ink-2">Resolvido em {r.resolvido_em ? quando(r.resolvido_em) : "—"}{r.resposta ? ` · “${r.resposta}”` : ""}</span>
              <button name="status" value="aberto" className={btnSecundario}>Reabrir</button>
            </form>
          )}
        </Card>
      ))}
    </>
  );
}
