import type { Metadata } from "next";
import Link from "next/link";
import IniciarSimulado from "@/components/IniciarSimulado";
import { AvisoPlus } from "@/components/AcoesQuestao";
import TirarFavorita from "@/components/TirarFavorita";
import { iniciarFavoritas } from "@/app/questoes-actions";
import { FAVORITAS_MINIMO, plusStatus } from "@/lib/plus";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minhas questões favoritas", robots: { index: false } };

type Fav = { questao_id: string; categoria: string | null; enunciado: string; correta: string | null; texto_correta: string | null; favoritada_em: string };

export default async function Favoritas({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { supabase } = await exigirLogin("/simulados-anac/favoritas");
  const plus = await plusStatus(supabase);
  const { data } = plus.pronto ? await supabase.rpc("minhas_favoritas") : { data: [] };
  const lista = (data ?? []) as Fav[];
  const faltam = Math.max(0, FAVORITAS_MINIMO - lista.length);
  const liberado = plus.tem && faltam === 0;
  const plusTela = { cobrar: plus.cobrar, preco: plus.preco, tem: plus.tem };

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4 px-6 pt-8 pb-12">
          <Link href="/simulados-anac" className="self-start text-sm font-semibold text-[#d7dbe6] hover:text-white">← Simulados ANAC</Link>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">⭐ Minhas questões favoritas</h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#d7dbe6]">
            Ao terminar uma prova, favorite no gabarito as questões que quer revisar. Com {FAVORITAS_MINIMO} favoritas, você libera um simulado exclusivo só com elas.
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-6 flex max-w-[900px] flex-col gap-6 px-4 md:px-6">
        <section className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 shadow-[0_20px_40px_-30px_rgba(35,42,61,.5)] md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[22px] font-extrabold">Simulado de favoritas</h2>
              <p className="text-[15px] text-ink-2">
                {!plus.tem ? "Recurso do Questões Plus."
                  : liberado ? "Liberado! As suas favoritas em ordem aleatória, sem cronômetro."
                  : `Faltam ${faltam} ${faltam === 1 ? "favorita" : "favoritas"} para liberar.`}
              </p>
            </div>
            <span className="font-display text-[28px] font-extrabold text-navy">{lista.length}<span className="text-[18px] text-muted"> / {FAVORITAS_MINIMO}</span></span>
          </div>
          <div className="h-3 rounded-full bg-[#f2e3bd]" aria-hidden="true">
            <div className="h-3 rounded-full bg-[#e0a100]" style={{ width: `${Math.min(100, (lista.length / FAVORITAS_MINIMO) * 100)}%` }} />
          </div>
          {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] font-semibold text-brand-deep">Não foi possível começar o simulado. Confira se você tem pelo menos {FAVORITAS_MINIMO} favoritas.</p>}
          {!plus.tem ? <AvisoPlus plus={plusTela} /> : liberado ? (
            <IniciarSimulado simuladoId={0} aulaId="" acao={iniciarFavoritas} titulo="Simulado com as suas questões favoritas" rotulo="Fazer simulado de favoritas"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep" />
          ) : (
            <Link href="/simulados-anac" className="inline-flex min-h-12 items-center justify-center self-start rounded-full border-2 border-navy px-6 font-display font-bold text-navy hover:bg-navy hover:text-white">Fazer um simulado e favoritar</Link>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-extrabold">Questões favoritadas</h2>
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
