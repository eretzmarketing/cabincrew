import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ranking · Head Hunter" };
export const dynamic = "force-dynamic";

type Linha = { posicao: number; apelido: string; pontos: number };

const podio = ["🥇", "🥈", "🥉"];

function Lista({ titulo, r }: { titulo: string; r: { data: unknown; error: unknown } }) {
  return (
    <Card>
      <h2 className="font-display text-xl font-extrabold">{titulo}</h2>
      {r.error ? <p className="text-ink-2">Rode o SQL <strong>0034_ranking.sql</strong> no Supabase.</p>
        : !((r.data ?? []) as Linha[]).length ? <p className="text-ink-2">Ninguém pontuou nesta semana ainda.</p> : (
          <ol className="flex flex-col gap-1.5">
            {((r.data ?? []) as Linha[]).map((l) => (
              <li key={`${l.posicao}-${l.apelido}`} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                <span className="w-9 text-center font-display font-extrabold">{podio[l.posicao - 1] ?? `${l.posicao}º`}</span>
                <span className="flex-1 truncate font-semibold">{l.apelido}</span>
                <span className="font-display font-extrabold">{l.pontos} pts</span>
              </li>
            ))}
          </ol>
        )}
    </Card>
  );
}

export default async function RankingAdminPage() {
  const { supabase } = await getUser();
  const [atual, passada] = await Promise.all([
    supabase.rpc("ranking_semana", { p_semanas_atras: 0 }),
    supabase.rpc("ranking_semana", { p_semanas_atras: 1 }),
  ]);
  return (
    <>
      <Titulo sub={<>Top 20 de cada semana (segunda a domingo). Alunos que escolheram se esconder não aparecem. Para agir sobre um aluno, use a aba <Link href="/admin/head-hunter/alunos" className="font-semibold underline underline-offset-4">Alunos</Link>.</>}>Ranking</Titulo>
      <div className="grid gap-6 lg:grid-cols-2">
        <Lista titulo="Esta semana" r={atual} />
        <Lista titulo="Semana passada" r={passada} />
      </div>
    </>
  );
}
