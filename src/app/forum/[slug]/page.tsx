import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternarConfirmacao, apagarMeuRelato, denunciar } from "@/app/actions";
import { Check, Flag, Shield } from "@/components/icons";
import { FASES, RESULTADO, STATUS_SELECAO, dataBR, mesAno, nomeFase, type Relato, type Selecao } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fase?: string; publicado?: string; denunciado?: string }>;
};

async function buscarSelecao(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("selecoes_resumo").select("*").eq("slug", slug).maybeSingle();
  return { supabase, selecao: data as Selecao | null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { selecao: s } = await buscarSelecao(slug);
  if (!s) return { title: "Seleção não encontrada" };
  return {
    title: `${s.companhia} · ${s.cargo} · ${s.base} · ${mesAno(s.mes_ref)}`,
    description: `Relatos de candidatos da seleção ${s.companhia} ${s.base} ${mesAno(s.mes_ref)}, organizados por fase.`,
  };
}

export default async function SelecaoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { supabase, selecao: s } = await buscarSelecao(slug);
  if (!s) notFound();

  const [{ data: todos }, { data: auth }] = await Promise.all([
    supabase
      .from("relatos_publicos")
      .select("*")
      .eq("selecao_id", s.id)
      .order("data_etapa", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);
  const relatosTodos = (todos ?? []) as Relato[];
  const logado = !!auth.user;

  const contagem = new Map<number, number>();
  relatosTodos.forEach((r) => contagem.set(r.fase_id, (contagem.get(r.fase_id) ?? 0) + 1));

  const faseParam = Number(sp.fase);
  const fase = faseParam >= 1 && faseParam <= 7 ? faseParam : s.fase_max ?? 1;
  const relatos = relatosTodos.filter((r) => r.fase_id === fase);

  // primeira data relatada em cada fase → linha do tempo
  const linhaDoTempo = FASES.map((f) => {
    const datas = relatosTodos.filter((r) => r.fase_id === f.id).map((r) => r.data_etapa).sort();
    return { ...f, primeira: datas[0] };
  }).filter((f) => f.primeira);

  const st = STATUS_SELECAO[s.status];

  return (
    <main className="bg-soft">
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-6 pt-8">
          <nav aria-label="Você está em" className="flex flex-wrap gap-2 text-sm text-muted">
            <Link href="/forum" className="hover:text-navy">Fórum</Link><span aria-hidden="true">›</span>
            <Link href={`/forum?companhia=${s.companhia_slug}`} className="hover:text-navy">{s.companhia}</Link><span aria-hidden="true">›</span>
            <span className="font-semibold text-navy">{s.base} · {mesAno(s.mes_ref)}</span>
          </nav>

          {sp.publicado && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Relato publicado. Obrigado por ajudar quem vem depois!</p>}
          {sp.denunciado && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Denúncia recebida. A moderação vai revisar.</p>}

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-2.5">
              <span className={`self-start rounded-full px-3 py-1.5 text-[13px] font-semibold ${st.cls}`}>{st.label}</span>
              <h1 className="font-display text-[30px] font-extrabold tracking-[-0.01em] md:text-[38px]">
                {s.companhia} · {s.cargo} · Base {s.base}
              </h1>
              <p className="text-base text-ink-2">
                {s.base_nome ? `${s.base_nome} · ` : ""}{mesAno(s.mes_ref)}
                {s.aberta_em ? ` · Processo aberto em ${dataBR(s.aberta_em)}` : ""}
              </p>
            </div>
            {s.status !== "encerrada" && (
              <Link
                href={logado ? `/forum/${slug}/relatar?fase=${fase}` : `/entrar?next=/forum/${slug}/relatar?fase=${fase}`}
                className="inline-flex min-h-12 items-center rounded-full bg-brand-strong px-[22px] font-display text-[15px] font-bold text-white hover:bg-brand-deep"
              >
                Relatar minha etapa
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-[1_1_200px] flex-col gap-1 rounded-2xl border border-line px-5 py-4">
              <span className="text-[13px] text-muted">Relatos publicados</span>
              <span className="font-display text-[28px] font-extrabold">{s.total_relatos}</span>
            </div>
            <div className="flex flex-[1_1_200px] flex-col gap-1 rounded-2xl border border-line px-5 py-4">
              <span className="text-[13px] text-muted">Relatos verificados</span>
              <span className="font-display text-[28px] font-extrabold">{relatosTodos.filter((r) => r.verificado).length}</span>
            </div>
            <div className="flex flex-[1_1_200px] flex-col gap-1 rounded-2xl border border-line px-5 py-4">
              <span className="text-[13px] text-muted">Fase mais avançada relatada</span>
              <span className="font-display text-xl leading-relaxed font-extrabold">{s.fase_max ? nomeFase(s.fase_max) : "—"}</span>
            </div>
          </div>

          <nav aria-label="Fases da seleção" className="mt-2 flex gap-1 overflow-x-auto">
            {FASES.map((f) => {
              const ativo = f.id === fase;
              return (
                <Link
                  key={f.id}
                  href={`/forum/${slug}?fase=${f.id}`}
                  scroll={false}
                  aria-current={ativo ? "page" : undefined}
                  className={`inline-flex min-h-[52px] shrink-0 items-center gap-2 border-b-[3px] px-4 font-display text-[15px] ${
                    ativo ? "border-brand font-bold text-navy" : "border-transparent font-semibold text-muted hover:text-navy"
                  }`}
                >
                  {f.nome}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ativo ? "bg-brand text-white" : "bg-[#eef0f4] text-ink-2"}`}>
                    {contagem.get(f.id) ?? 0}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-7 px-6 pt-8 pb-20">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-[18px]">
          <h2 className="font-display text-[22px] font-extrabold">Relatos · {nomeFase(fase)}</h2>

          {relatos.length === 0 && (
            <div className="flex flex-col items-center gap-3.5 rounded-[20px] border border-dashed border-[#c9cedb] bg-white px-8 py-12 text-center">
              <strong className="font-display text-lg">Ainda não há relatos nesta fase</strong>
              <span className="max-w-[420px] text-[15px] text-ink-2">Se você já passou por ela neste processo, seu relato vai ajudar muitos candidatos.</span>
              {s.status !== "encerrada" && (
                <Link href={logado ? `/forum/${slug}/relatar?fase=${fase}` : `/entrar?next=/forum/${slug}/relatar?fase=${fase}`} className="rounded-full bg-brand-strong px-[22px] py-3.5 font-display text-[15px] font-bold text-white hover:bg-brand-deep">
                  Seja o primeiro a relatar
                </Link>
              )}
            </div>
          )}

          {relatos.map((r) => {
            const res = RESULTADO[r.resultado];
            const nome = r.autor_nome ?? "Candidato(a) anônimo(a)";
            return (
              <article key={r.id} className="flex flex-col gap-4 rounded-[20px] border border-line bg-white px-[26px] py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eef0f4] text-[15px] font-bold uppercase" aria-hidden="true">
                      {r.autor_nome ? r.autor_nome.slice(0, 2) : "CA"}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold">
                        {nome}
                        {r.verificado && <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1d5fbf]"><Shield size={15} width={2.2} />Verificado</span>}
                        {r.meu && <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-muted">seu relato</span>}
                      </span>
                      <span className="text-[13px] text-muted">{dataBR(r.data_etapa)}{r.base ? ` · Base ${r.base}` : ""}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${res.cls}`}>{res.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink-2">{r.formato === "online" ? "Online" : "Presencial"}</span>
                  {r.duracao && <span className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink-2">{r.duracao}</span>}
                  {r.participantes && <span className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink-2">{r.participantes === 1 ? "Individual" : `${r.participantes} participantes`}</span>}
                </div>
                <p className="text-base leading-[1.65] whitespace-pre-line">{r.texto}</p>
                <div className="flex flex-wrap items-center gap-2 border-t border-[#eceef3] pt-3.5">
                  {!r.meu && (
                    <form action={alternarConfirmacao}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="relato_id" value={r.id} />
                      <input type="hidden" name="confirmei" value={String(!!r.confirmei)} />
                      <button
                        type="submit"
                        aria-pressed={!!r.confirmei}
                        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold ${r.confirmei ? "bg-navy text-white" : "bg-soft text-navy hover:bg-[#eceef3]"}`}
                      >
                        <Check size={16} width={2.2} /> Passei por isso também ({r.confirmacoes})
                      </button>
                    </form>
                  )}
                  {r.meu ? (
                    <form action={apagarMeuRelato} className="ml-auto">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="relato_id" value={r.id} />
                      <button type="submit" className="min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold text-muted hover:text-brand-deep">Apagar meu relato</button>
                    </form>
                  ) : (
                    <details className="ml-auto">
                      <summary className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full text-muted hover:text-navy" aria-label="Denunciar relato">
                        <Flag />
                      </summary>
                      <form action={denunciar} className="mt-2 flex flex-col gap-2 rounded-xl border border-line bg-white p-3">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="relato_id" value={r.id} />
                        <input type="hidden" name="fase" value={fase} />
                        <label className="text-sm font-semibold">
                          Motivo
                          <select name="motivo" className="mt-1 block min-h-11 w-full rounded-lg border border-[#c9cedb] px-2 text-sm font-normal">
                            <option>Reproduz questões de prova</option>
                            <option>Informação falsa ou boato</option>
                            <option>Ofensivo ou desrespeitoso</option>
                            <option>Spam ou propaganda</option>
                          </select>
                        </label>
                        <button type="submit" className="min-h-11 cursor-pointer rounded-full bg-navy px-4 text-sm font-semibold text-white">Enviar denúncia</button>
                      </form>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="flex flex-[1_1_300px] flex-col gap-5">
          <div className="flex flex-col gap-3.5 rounded-[20px] bg-navy p-[26px] text-white">
            <strong className="font-display text-[19px]">Já passou por alguma fase?</strong>
            <span className="text-[15px] leading-relaxed text-[#d7dbe6]">Leva dois minutos. Relatos confirmados por outros candidatos ganham o selo de verificado.</span>
            <Link href={logado ? `/forum/${slug}/relatar?fase=${fase}` : `/entrar?next=/forum/${slug}/relatar?fase=${fase}`} className="self-start rounded-full bg-brand-strong px-5 py-3 font-display text-[15px] font-bold text-white hover:bg-brand-deep">
              Relatar minha etapa
            </Link>
          </div>

          {linhaDoTempo.length > 0 && (
            <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
              <strong className="font-display text-[17px]">Linha do tempo relatada</strong>
              <ol className="flex flex-col gap-3.5">
                {linhaDoTempo.map((f, i) => (
                  <li key={f.id} className="flex gap-3">
                    <span className={`mt-[5px] h-3 w-3 shrink-0 rounded-full ${i === linhaDoTempo.length - 1 ? "bg-brand" : "bg-navy"}`} aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{f.nome}</span>
                      <span className="text-[13px] text-muted">Primeiro relato da fase: {dataBR(f.primeira!)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex flex-col gap-2.5 rounded-[20px] border border-brand-line bg-brand-soft p-6">
            <strong className="font-display text-[17px]">Foi chamado para a próxima fase?</strong>
            <span className="text-[15px] leading-relaxed text-ink-2">O Crew Select vai montar um plano de treino até a sua próxima etapa, com base nestes relatos.</span>
            <Link href="/#crew-select" className="py-2.5 font-display text-[15px] font-bold text-[#b0002a]">Entrar na lista de espera →</Link>
          </div>

          <div className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-6">
            <strong className="font-display text-[17px]">Regras deste fórum</strong>
            <ul className="flex list-disc flex-col gap-2 pl-[18px] text-sm leading-normal text-ink-2">
              <li>Conte o formato e a experiência, nunca as questões dos testes.</li>
              <li>Sem boatos: informe só o que você viveu.</li>
              <li>Respeito com candidatos, avaliadores e companhias.</li>
            </ul>
            <Link href="/regras" className="text-sm font-semibold">Ler as regras completas</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
