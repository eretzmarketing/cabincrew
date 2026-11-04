import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { iniciarSimulado } from "@/app/crew-actions";
import { Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import type { QuestaoGabarito, Simulado, Tentativa } from "@/lib/crew";

export const metadata: Metadata = { title: "Resultado do simulado · Crew Select", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function ResultadoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aula?: string }> }) {
  const { id } = await params;
  const { aula } = await searchParams;
  if (!UUID.test(id)) notFound();
  const aulaId = aula && UUID.test(aula) ? aula : "";
  const { supabase } = await exigirCrewSelect(`/crew-select/simulado/${id}/resultado`);

  const { data: t } = await supabase.from("tentativas").select("*").eq("id", id).maybeSingle();
  const tentativa = t as Tentativa | null;
  if (!tentativa) notFound();
  if (!tentativa.finalizada_em) redirect(`/crew-select/simulado/${id}${aulaId ? `?aula=${aulaId}` : ""}`);

  const [{ data: sim }, { data: gab }] = await Promise.all([
    supabase.from("simulados").select("*").eq("id", tentativa.simulado_id).single(),
    supabase.rpc("gabarito_da_tentativa", { p_tentativa: id }),
  ]);
  const simulado = sim as Simulado;
  const gabarito = (gab ?? []) as QuestaoGabarito[];
  const nota = tentativa.nota ?? 0;
  const aprovado = nota >= simulado.nota_minima;
  const emBranco = gabarito.filter((q) => !q.resposta).length;

  // desempenho por categoria (ex.: blocos da ANAC)
  const porCategoria = new Map<string, { certas: number; total: number }>();
  for (const q of gabarito) {
    const k = q.categoria ?? "Geral";
    const c = porCategoria.get(k) ?? { certas: 0, total: 0 };
    c.total += 1;
    if (q.resposta && q.resposta === q.correta) c.certas += 1;
    porCategoria.set(k, c);
  }

  return (
    <main className="bg-soft px-4 py-8 pb-20 md:px-6">
      <div className="mx-auto flex max-w-[860px] flex-col gap-6">
        {aulaId && <Link href={`/crew-select/aula/${aulaId}`} className="text-sm font-semibold text-muted hover:text-navy">← Voltar para a aula</Link>}

        <section className={`flex flex-col gap-4 rounded-[24px] p-6 md:p-8 ${aprovado ? "bg-[#0f6b3a] text-white" : "bg-navy text-white"}`}>
          <span className="text-sm font-semibold opacity-90">{simulado.titulo}</span>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <span className="font-display text-[64px] leading-none font-extrabold">{nota}%</span>
            <span className="pb-2 text-lg">{tentativa.acertos} de {tentativa.total} acertos{emBranco ? ` · ${emBranco} em branco` : ""}</span>
          </div>
          <p className="text-[17px] leading-relaxed opacity-95">
            {aprovado
              ? `Aprovado! Você passou da nota mínima de ${simulado.nota_minima}%. Continue treinando para chegar com folga no dia.`
              : `A nota mínima é ${simulado.nota_minima}%. Revise o gabarito abaixo, principalmente os temas com menos acertos, e tente de novo.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={iniciarSimulado}>
              <input type="hidden" name="simulado_id" value={simulado.id} />
              <input type="hidden" name="aula_id" value={aulaId} />
              <button className="min-h-12 cursor-pointer rounded-full bg-white px-6 font-display font-bold text-navy">Fazer de novo</button>
            </form>
            {aulaId && (
              <Link href={`/crew-select/aula/${aulaId}`} className="inline-flex min-h-12 items-center rounded-full border-2 border-white/60 px-6 font-semibold text-white">
                Voltar para a aula
              </Link>
            )}
          </div>
        </section>

        {porCategoria.size > 1 && (
          <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6">
            <h2 className="font-display text-lg font-bold">Desempenho por tema</h2>
            <ul className="flex flex-col gap-3">
              {[...porCategoria].map(([cat, c]) => {
                const p = Math.round((c.certas / c.total) * 100);
                return (
                  <li key={cat} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[15px]"><span>{cat}</span><span className="font-semibold">{c.certas}/{c.total} · {p}%</span></div>
                    <div className="h-2 rounded-full bg-[#eceef3]" aria-hidden="true">
                      <div className={`h-2 rounded-full ${p >= simulado.nota_minima ? "bg-[#0f6b3a]" : "bg-brand"}`} style={{ width: `${p}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {gabarito.length > 0 ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-extrabold">Gabarito comentado</h2>
            {gabarito.map((q) => {
              const acertou = q.resposta === q.correta;
              return (
                <article key={q.id} className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-muted">Questão {q.ordem}{q.categoria ? ` · ${q.categoria}` : ""}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${!q.resposta ? "bg-[#eef0f4] text-ink-2" : acertou ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>
                      {!q.resposta ? "Em branco" : acertou ? "Acertou" : "Errou"}
                    </span>
                  </div>
                  {q.contexto && <div className="rounded-xl border-l-4 border-navy bg-soft px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line">{q.contexto}</div>}
                  <p className="text-[16px] leading-relaxed font-semibold whitespace-pre-line">{q.enunciado}</p>
                  {q.imagem_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={q.imagem_url} alt="Imagem da questão" className="max-h-[300px] w-auto self-start rounded-xl border border-line" />
                  )}
                  <ul className="flex flex-col gap-2">
                    {q.alternativas.map((a) => {
                      const certa = a.letra === q.correta;
                      const minha = a.letra === q.resposta;
                      return (
                        <li
                          key={a.letra}
                          className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-[15px] ${
                            certa ? "border-[#0f6b3a] bg-[#e5f6ec]" : minha ? "border-brand bg-brand-soft" : "border-line"
                          }`}
                        >
                          <span className="font-display font-bold">{a.letra}</span>
                          <span className="flex-1">
                            {a.texto}
                            {a.imagem_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.imagem_url} alt={`Alternativa ${a.letra}`} className="mt-2 max-h-32 w-auto rounded-lg border border-line" />
                            )}
                          </span>
                          {certa && <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f6b3a]"><Check size={14} />Correta</span>}
                          {minha && !certa && <span className="text-xs font-semibold text-brand-deep">Sua resposta</span>}
                        </li>
                      );
                    })}
                  </ul>
                  {q.explicacao && (
                    <p className="rounded-xl bg-soft px-4 py-3 text-[15px] leading-relaxed"><strong>Explicação: </strong>{q.explicacao}</p>
                  )}
                </article>
              );
            })}
          </section>
        ) : (
          <p className="rounded-[20px] border border-line bg-white p-6 text-ink-2">O gabarito deste simulado não é exibido.</p>
        )}
      </div>
    </main>
  );
}
