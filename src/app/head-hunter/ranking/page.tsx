import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { alternarRanking } from "@/app/crew-actions";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { carregarJornada } from "@/lib/jornada-dados";
import { calcularMedalhas } from "@/lib/medalhas";

export const metadata: Metadata = { title: "Ranking e medalhas · Head Hunter", robots: { index: false } };
export const dynamic = "force-dynamic";

type Linha = { posicao: number; apelido: string; pontos: number; eu: boolean };

const PONTOS = [
  ["Aula concluída", "10"],
  ["Aula do Flight Attendant English concluída", "10"],
  ["Treino de 10 questões", "5 (+5 com 80% ou mais)"],
  ["Simulado no modo Prova real", "20 (+10 com 80% ou mais)"],
  ["Sessão do perfil comportamental", "10"],
  ["Vídeo de apresentação avaliado", "10 (+5 com 80% ou mais)"],
];

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ semana?: string }> }) {
  const { semana } = await searchParams;
  const passada = semana === "passada";
  const { supabase, user, liberado } = await exigirCrewSelect("/head-hunter/ranking");
  if (!liberado) redirect("/head-hunter");

  const [rk, perfil, { dados, jornada }] = await Promise.all([
    supabase.rpc("ranking_semana", { p_semanas_atras: passada ? 1 : 0 }),
    supabase.from("profiles").select("ranking_oculto").eq("id", user.id).maybeSingle(),
    carregarJornada(supabase, user.id),
  ]);
  const linhas = (rk.data ?? []) as Linha[];
  const eu = linhas.find((l) => l.eu);
  const oculto = perfil.data?.ranking_oculto === true;
  const medalhas = calcularMedalhas(dados, jornada);
  const ganhas = medalhas.filter((m) => m.ganha).length;
  const podio = ["🥇", "🥈", "🥉"];

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href="/head-hunter" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Head Hunter</Link>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Ranking e medalhas</h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Cada aula, treino e simulado vale pontos. O ranking zera toda segunda-feira, então qualquer um pode chegar ao topo: o que conta é a constância.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1000px] gap-8 px-4 pt-8 md:px-6 lg:grid-cols-[1.1fr_.9fr]">
        <section aria-labelledby="rk" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="rk" className="font-display text-2xl font-extrabold">Ranking</h2>
            <nav aria-label="Semana" className="flex gap-1 rounded-full bg-white p-1">
              <Link href="/head-hunter/ranking" aria-current={!passada ? "page" : undefined} className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold ${!passada ? "bg-navy text-white" : "text-navy"}`}>Esta semana</Link>
              <Link href="/head-hunter/ranking?semana=passada" aria-current={passada ? "page" : undefined} className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold ${passada ? "bg-navy text-white" : "text-navy"}`}>Semana passada</Link>
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-navy p-5 text-white">
            <span className="flex flex-col">
              <span className="text-sm text-[#d7dbe6]">Sua posição</span>
              <strong className="font-display text-3xl font-extrabold">{eu ? `${eu.posicao}º` : "–"}</strong>
            </span>
            <span className="flex flex-col text-right">
              <span className="text-sm text-[#d7dbe6]">Seus pontos</span>
              <strong className="font-display text-3xl font-extrabold">{eu?.pontos ?? 0}</strong>
            </span>
            {!eu && !passada && <span className="w-full text-[15px] text-[#d7dbe6]">Faça a missão do dia para entrar no ranking desta semana.</span>}
          </div>

          {rk.error ? (
            <p className="rounded-2xl bg-white p-5">O ranking ainda não está disponível. Volte em breve.</p>
          ) : linhas.length === 0 ? (
            <p className="rounded-2xl bg-white p-5">Ninguém pontuou {passada ? "na semana passada" : "ainda nesta semana"}. Seja o primeiro!</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {linhas.map((l) => (
                <li key={`${l.posicao}-${l.apelido}`} aria-current={l.eu ? "true" : undefined}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${l.eu ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                  <span className="w-10 text-center font-display text-xl font-extrabold">{podio[l.posicao - 1] ?? `${l.posicao}º`}</span>
                  <span className="flex-1 truncate font-semibold">{l.apelido}{l.eu && " (você)"}</span>
                  <span className="font-display font-extrabold">{l.pontos} pts</span>
                </li>
              ))}
            </ol>
          )}

          <form action={alternarRanking} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
            <span>{oculto ? "Você está escondido(a) do ranking: só você vê a sua posição." : "Os outros alunos veem só o seu apelido e os seus pontos."}</span>
            <input type="hidden" name="oculto" value={oculto ? "0" : "1"} />
            <button className="min-h-10 cursor-pointer rounded-full border-2 border-navy px-4 font-semibold text-navy hover:bg-soft">{oculto ? "Aparecer no ranking" : "Esconder meu nome"}</button>
          </form>

          <details className="rounded-2xl border border-line bg-white px-4 py-3">
            <summary className="min-h-10 cursor-pointer py-2 font-semibold">Como ganhar pontos</summary>
            <table className="mt-2 w-full text-[15px]">
              <tbody>
                {PONTOS.map(([o, p]) => (
                  <tr key={o} className="border-t border-line"><td className="py-2 pr-3">{o}</td><td className="py-2 text-right font-semibold whitespace-nowrap">{p}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="pt-2 text-sm text-muted">Máximo de 150 pontos por dia. A semana vai de segunda a domingo (horário de Brasília).</p>
          </details>
        </section>

        <section aria-labelledby="md" className="flex flex-col gap-4">
          <h2 id="md" className="font-display text-2xl font-extrabold">Medalhas <span className="text-muted">{ganhas}/{medalhas.length}</span></h2>
          <ul className="grid grid-cols-2 gap-3">
            {medalhas.map((m) => (
              <li key={m.id} className={`flex flex-col gap-1 rounded-2xl border p-4 ${m.ganha ? "border-[#f3c3cf] bg-white" : "border-dashed border-line bg-white/60"}`}>
                <span aria-hidden="true" className={`text-3xl ${m.ganha ? "" : "opacity-30 grayscale"}`}>{m.emoji}</span>
                <strong className={`font-display text-[15px] ${m.ganha ? "" : "text-muted"}`}>{m.nome}{m.ganha && <span className="sr-only"> (conquistada)</span>}</strong>
                <span className="text-[13px] leading-snug text-ink-2">{m.como}</span>
                {!m.ganha && m.progresso && <span className="text-[13px] font-semibold text-brand-strong">{m.progresso}</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
