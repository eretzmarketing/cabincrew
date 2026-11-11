import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo, btnSecundario } from "@/components/admin-ui";
import OpqAdminForm, { type AfirmacaoAdmin } from "@/components/OpqAdminForm";
import { TRACOS_OPQ } from "@/lib/opq";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Perfil comportamental" };

export default async function AdminOpq({ searchParams }: { searchParams: Promise<{ traco?: string }> }) {
  const { traco: t } = await searchParams;
  const traco = TRACOS_OPQ.some((x) => x.nome === t) ? t! : TRACOS_OPQ[0].nome;
  const { supabase } = await getUser();
  const [todas, lista, tent] = await Promise.all([
    supabase.from("opq_afirmacoes").select("traco, direcao, ativo").limit(5000),
    supabase.from("opq_afirmacoes").select("id, codigo, texto, traco, direcao, ativo, origem").eq("traco", traco).order("ativo", { ascending: false }).order("direcao", { ascending: false }).order("codigo"),
    supabase.from("opq_tentativas").select("user_id", { count: "exact" }).limit(5000),
  ]);
  const semSql = !!todas.error;
  const linhas = (todas.data ?? []) as { traco: string; direcao: number; ativo: boolean }[];
  const conta = (nome: string, d: number) => linhas.filter((l) => l.ativo && l.traco === nome && l.direcao === d).length;
  const alunos = new Set(((tent.data ?? []) as { user_id: string }[]).map((x) => x.user_id)).size;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Afirmações do treino de personalidade (estilo OPQ/SHL). Cada sessão sorteia 3 afirmações de cada traço, sempre com pelo menos uma de cada direção.">Perfil comportamental</Titulo>
        <Link href="/head-hunter/perfil-comportamental" target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
      </div>

      {semSql && (
        <p className="rounded-2xl border border-[#f3c3cf] bg-brand-soft p-5 text-brand-deep">
          Falta rodar no Supabase o <strong>0023_opq.sql</strong> e depois o <strong>0024_opq_afirmacoes.sql</strong>.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="Afirmações ativas" valor={linhas.filter((l) => l.ativo).length} detalhe={`${TRACOS_OPQ.length} traços`} />
        <Numero rotulo="Sessões feitas" valor={tent.count ?? 0} />
        <Numero rotulo="Alunos que treinaram" valor={alunos} />
      </div>

      <Card>
        <h2 className="font-display text-xl font-bold">Traços</h2>
        <div className="flex flex-wrap gap-2">
          {TRACOS_OPQ.map((x) => {
            const pos = conta(x.nome, 1), neg = conta(x.nome, -1);
            return (
              <Link key={x.nome} href={`/admin/opq?traco=${encodeURIComponent(x.nome)}`} aria-current={x.nome === traco}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold ${x.nome === traco ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
                {x.emoji} {x.nome}
                <span className={`text-[12px] font-normal ${x.nome === traco ? "text-white/80" : pos < 3 || neg < 3 ? "text-brand-deep" : "text-muted"}`}>{pos}+ · {neg}−</span>
              </Link>
            );
          })}
        </div>
        <p className="text-[13px] text-muted">+ concordar indica mais do traço · − concordar indica menos do traço. Cada traço precisa de pelo menos 2 ativas de cada lado.</p>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold">{traco}</h2>
        <p className="text-[14px] text-ink-2">{TRACOS_OPQ.find((x) => x.nome === traco)?.mede}</p>
        <h3 className="pt-1 font-display font-bold">Nova afirmação</h3>
        <OpqAdminForm a={{ texto: "", traco, direcao: 1, ativo: true }} />
        <h3 className="pt-3 font-display font-bold">Afirmações ({(lista.data ?? []).length})</h3>
        <div className="flex flex-col gap-2">
          {((lista.data ?? []) as AfirmacaoAdmin[]).map((a) => <OpqAdminForm key={a.id} a={a} />)}
        </div>
      </Card>
    </>
  );
}
