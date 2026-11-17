import type { Metadata } from "next";
import Link from "next/link";
import IniciarSimulado from "@/components/IniciarSimulado";
import { AvisoPlus } from "@/components/AcoesQuestao";
import TirarFavorita from "@/components/TirarFavorita";
import { iniciarFavoritas } from "@/app/questoes-actions";
import { FAVORITAS_MINIMO, OUTRAS, blocoDe, plusStatus } from "@/lib/plus";

const ORDEM = ["Segurança e Emergência", "Legislação Aeronáutica", "Primeiros Socorros", "Conhecimentos Técnicos"];
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minhas questões favoritas", robots: { index: false } };

type Fav = { questao_id: string; categoria: string | null; enunciado: string; correta: string | null; texto_correta: string | null; favoritada_em: string };

export default async function Favoritas({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { supabase } = await exigirLogin("/simulados-anac/favoritas");
  const plus = await plusStatus(supabase);
  const { data } = plus.pronto ? await supabase.rpc("minhas_favoritas") : { data: [] };
  const lista = (data ?? []) as Fav[];
  // os 4 blocos da ANAC sempre aparecem; outros blocos só se tiverem favoritas
  const contagem = new Map<string, number>(ORDEM.map((b) => [b, 0]));
  for (const f of lista) contagem.set(blocoDe(f.categoria), (contagem.get(blocoDe(f.categoria)) ?? 0) + 1);
  const blocos = [...contagem].sort(([a], [b]) => (ORDEM.indexOf(a) + 1 || (a === OUTRAS ? 99 : 50)) - (ORDEM.indexOf(b) + 1 || (b === OUTRAS ? 99 : 50)));
  const plusTela = { cobrar: plus.cobrar, preco: plus.preco, tem: plus.tem };

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 px-6 pt-8 pb-12">
          <Link href="/simulados-anac" className="self-start text-sm font-semibold text-[#d7dbe6] hover:text-white">← Simulados ANAC</Link>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">⭐ Minhas questões favoritas</h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#d7dbe6]">
            Ao terminar uma prova, favorite no gabarito as questões que quer revisar. Com {FAVORITAS_MINIMO} favoritas de um bloco, você libera um simulado exclusivo daquele bloco, no padrão da prova.
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-6 flex max-w-[900px] flex-col gap-6 px-4 md:px-6">
        <section className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 shadow-[0_20px_40px_-30px_rgba(35,42,61,.5)] md:p-7">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[22px] font-extrabold">Simulados de favoritas por bloco</h2>
            <p className="text-[15px] text-ink-2">
              Igual à prova: 20 questões sorteadas das suas favoritas do bloco, em 30 minutos. Cada bloco libera com {FAVORITAS_MINIMO} favoritas, e você pode favoritar quantas quiser.
            </p>
          </div>
          {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] font-semibold text-brand-deep">Não foi possível começar o simulado. Confira se o bloco tem pelo menos {FAVORITAS_MINIMO} favoritas.</p>}
          {!plus.tem && <AvisoPlus plus={plusTela} />}
          <ul className="grid gap-3 md:grid-cols-2">
            {blocos.map(([bloco, n], i) => {
              const ok = n >= FAVORITAS_MINIMO;
              return (
                <li key={bloco} className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${ok && plus.tem ? "border-[#e0a100] bg-[#fffaf0]" : "border-line"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <strong className="font-display text-[17px]">{bloco}</strong>
                    <span className="shrink-0 font-display text-[18px] font-extrabold text-navy">{n}<span className="text-[14px] text-muted"> / {FAVORITAS_MINIMO}</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#f2e3bd]" aria-hidden="true">
                    <div className="h-2.5 rounded-full bg-[#e0a100]" style={{ width: `${Math.min(100, (n / FAVORITAS_MINIMO) * 100)}%` }} />
                  </div>
                  {ok && plus.tem ? (
                    <IniciarSimulado simuladoId={1000 + i} aulaId="" acao={iniciarFavoritas} extras={{ bloco }}
                      titulo={`Favoritas · ${bloco}: 20 questões sorteadas, 30 minutos`} rotulo="Fazer simulado"
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep" />
                  ) : (
                    <span className="text-[14px] text-ink-2">{ok ? "Recurso do Questões Plus." : `Faltam ${FAVORITAS_MINIMO - n} ${FAVORITAS_MINIMO - n === 1 ? "favorita" : "favoritas"} neste bloco.`}</span>
                  )}
                </li>
              );
            })}
          </ul>
          {!lista.length && (
            <Link href="/simulados-anac" className="inline-flex min-h-12 items-center justify-center self-start rounded-full border-2 border-navy px-6 font-display font-bold text-navy hover:bg-navy hover:text-white">Fazer um simulado e favoritar</Link>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-extrabold">Questões favoritadas ({lista.length})</h2>
          {!lista.length ? (
            <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-8 text-center text-ink-2">
              Você ainda não favoritou nenhuma questão. Termine uma prova e toque em <strong>☆ Favoritar</strong> no gabarito.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lista.map((f) => (
                <li key={f.questao_id} className="flex flex-col gap-2 rounded-[18px] border border-line bg-white p-4 md:flex-row md:items-start md:gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {f.categoria && <span className="text-[13px] font-semibold text-muted">{f.categoria}</span>}
                    <p className="line-clamp-3 text-[15px] leading-relaxed font-semibold">{f.enunciado}</p>
                    {f.correta && <p className="text-[14px] text-[#0f6b3a]"><strong>Resposta: {f.correta}</strong>{f.texto_correta ? ` · ${f.texto_correta}` : ""}</p>}
                  </div>
                  <TirarFavorita questaoId={f.questao_id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
