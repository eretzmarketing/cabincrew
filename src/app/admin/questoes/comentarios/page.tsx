import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo, btnSecundario } from "@/components/admin-ui";
import { moderarComentario, responderComoEquipe } from "@/app/questoes-admin-actions";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Comentários das questões" };
export const dynamic = "force-dynamic";

type Com = { id: number; questao_id: string; enunciado: string; pai_id: number | null; texto: string; apagado: boolean; oculto: boolean; created_at: string; aluno_id: string; aluno: string | null; email: string | null; equipe: boolean };
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default async function ComentariosAdmin({ searchParams }: { searchParams: Promise<{ filtro?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const filtro = sp.filtro === "ocultos" ? "ocultos" : "recentes";
  const { supabase } = await getUser();
  const { data, error } = await supabase.rpc("admin_comentarios", { p_filtro: filtro });
  const lista = (data ?? []) as Com[];
  const aqui = `/admin/questoes/comentarios?filtro=${filtro}`;

  return (
    <>
      <Titulo sub="O que os alunos estão comentando nas questões. Esconda o que não for adequado ou responda como Equipe Cabin Crew.">Comentários das questões</Titulo>
      {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{sp.ok}</p>}
      {sp.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">{sp.erro}</p>}
      {error && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">Rode o SQL 0070_questoes_comunidade.sql no Supabase para usar esta página.</p>}

      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {[["recentes", "Mais recentes"], ["ocultos", "Escondidos"]].map(([v, t]) => (
          <Link key={v} href={`/admin/questoes/comentarios?filtro=${v}`} aria-current={filtro === v ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${filtro === v ? "bg-navy text-white" : "border-2 border-line bg-white text-navy hover:border-navy"}`}>{t}</Link>
        ))}
      </nav>

      {!lista.length ? <Card><p className="text-ink-2">Nenhum comentário ainda.</p></Card> : lista.map((c) => (
        <Card key={c.id} className={c.oculto ? "opacity-70" : ""}>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted">
              {quando(c.created_at)} · {c.equipe ? <strong className="text-brand-deep">Equipe</strong> : <Link href={`/admin/usuarios/${c.aluno_id}`} className="font-semibold text-navy underline">{c.aluno ?? "Aluno"}</Link>}
              {c.email && !c.equipe ? ` · ${c.email}` : ""}{c.pai_id ? " · resposta" : ""}{c.oculto ? " · ESCONDIDO" : ""}{c.apagado ? " · apagado pelo autor" : ""}
            </span>
            <Link href={`/admin/questoes/${c.questao_id}?voltar=${encodeURIComponent(aqui)}`} className="line-clamp-1 text-[14px] text-ink-2 hover:text-navy">Questão: {c.enunciado}</Link>
          </div>
          <p className="text-[16px] leading-relaxed break-words whitespace-pre-line">{c.texto}</p>
          <div className="flex flex-wrap gap-2">
            <form action={moderarComentario}>
              <input type="hidden" name="id" value={c.id} /><input type="hidden" name="voltar" value={aqui} />
              <button name="acao" value={c.oculto ? "mostrar" : "ocultar"} className={btnSecundario}>{c.oculto ? "Mostrar de novo" : "Esconder dos alunos"}</button>
            </form>
            <form action={moderarComentario}>
              <input type="hidden" name="id" value={c.id} /><input type="hidden" name="voltar" value={aqui} />
              <button name="acao" value="apagar" className={`${btnSecundario} text-brand-deep`}>Excluir</button>
            </form>
          </div>
          {!c.oculto && !c.apagado && (
            <details className="rounded-xl border border-line">
              <summary className="flex min-h-11 cursor-pointer items-center px-4 text-[14px] font-semibold text-navy">Responder como Equipe Cabin Crew</summary>
              <form action={responderComoEquipe} className="flex flex-col gap-2 p-4 pt-0">
                <input type="hidden" name="questao_id" value={c.questao_id} /><input type="hidden" name="pai_id" value={c.pai_id ?? c.id} /><input type="hidden" name="voltar" value={aqui} />
                <textarea name="texto" rows={3} required maxLength={2000} placeholder="Escreva a resposta da equipe…"
                  className="rounded-xl border border-[#c9cedb] px-4 py-2.5 text-[15px] outline-none focus:border-navy" />
                <button className={`${btnSecundario} self-start`}>Publicar resposta</button>
              </form>
            </details>
          )}
        </Card>
      ))}
    </>
  );
}
