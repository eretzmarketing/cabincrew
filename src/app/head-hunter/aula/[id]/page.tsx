import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Conteudo from "@/components/Conteudo";
import { alternarAulaConcluida, iniciarSimulado } from "@/app/crew-actions";
import { Arrow, Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { TIPO_AULA, duracao, numeroModulo, videoEmbed, type Aula, type Modulo, type Simulado, type Tentativa } from "@/lib/crew";

export const metadata: Metadata = { title: "Aula · Head Hunter", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AulaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { id } = await params;
  const { erro } = await searchParams;
  const { supabase, user, profile, liberado } = await exigirCrewSelect(`/head-hunter/aula/${id}`);
  if (!liberado) redirect("/head-hunter");
  if (!UUID.test(id)) notFound();

  const { data } = await supabase.from("aulas").select("*").eq("id", id).maybeSingle();
  const aula = data as Aula | null;
  if (!aula || (!aula.publicado && !profile.is_admin)) notFound();

  const [{ data: modulo }, { data: irmas }, { data: feita }, simRes, tentRes] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", aula.modulo_id).single(),
    supabase.from("aulas").select("id, ordem, titulo").eq("modulo_id", aula.modulo_id).eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id).eq("aula_id", aula.id).maybeSingle(),
    aula.simulado_id
      ? supabase.from("simulados").select("*").eq("id", aula.simulado_id).maybeSingle()
      : Promise.resolve({ data: null }),
    aula.simulado_id
      ? supabase.from("tentativas").select("*").eq("user_id", user.id).eq("simulado_id", aula.simulado_id).order("iniciada_em", { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);
  const simulado = simRes.data as Simulado | null;
  const tentativas = (tentRes.data ?? []) as Tentativa[];
  const m = modulo as Modulo;
  const lista = irmas ?? [];
  const pos = lista.findIndex((a) => a.id === aula.id);
  const anterior = pos > 0 ? lista[pos - 1] : null;
  const proxima = pos >= 0 && pos < lista.length - 1 ? lista[pos + 1] : null;
  const concluida = !!feita;
  const embed = videoEmbed(aula.video_url);

  return (
    <main className="bg-soft px-6 py-10 pb-20">
      <article className="mx-auto flex max-w-[860px] flex-col gap-6">
        <Link href={`/head-hunter/modulo/${m.id}`} className="text-sm font-semibold text-muted hover:text-navy">
          ← Módulo {numeroModulo(m.ordem)} · {m.titulo}
        </Link>

        {!aula.publicado && (
          <p className="rounded-xl border border-[#ffe0b2] bg-[#fff3e0] px-4 py-3 text-sm text-[#8a4b00]">Rascunho: só administradores veem esta aula.</p>
        )}

        <header className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#b0002a]">
            {TIPO_AULA[aula.tipo]}{aula.duracao_min ? ` · ${duracao(aula.duracao_min)}` : ""}
          </span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{aula.titulo}</h1>
          {aula.resumo && <p className="text-[17px] leading-relaxed text-ink-2">{aula.resumo}</p>}
        </header>

        {embed ? (
          <div className="relative aspect-video overflow-hidden rounded-[20px] bg-navy">
            <iframe
              src={embed}
              title={aula.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : aula.video_url ? (
          <a href={aula.video_url} target="_blank" rel="noreferrer" className="rounded-2xl border border-line bg-white p-5 font-semibold">Assistir ao vídeo da aula ↗</a>
        ) : null}

        {simulado && (
          <CartaoSimulado simulado={simulado} tentativas={tentativas} aulaId={aula.id} erro={!!erro} />
        )}

        {aula.conteudo && (
          <div className="aula-conteudo rounded-[20px] border border-line bg-white p-6 md:p-9">
            <Conteudo texto={aula.conteudo} />
          </div>
        )}

        {aula.arquivo_url && (
          <a href={aula.arquivo_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 font-semibold text-navy hover:border-navy">
            Baixar material de apoio <span aria-hidden="true">↓</span>
          </a>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <form action={alternarAulaConcluida}>
            <input type="hidden" name="aula_id" value={aula.id} />
            <input type="hidden" name="concluida" value={String(concluida)} />
            <input type="hidden" name="proxima" value={proxima?.id ?? ""} />
            <button
              type="submit"
              aria-pressed={concluida}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-6 font-display font-bold ${
                concluida ? "border-2 border-[#0f6b3a] bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-strong text-white hover:bg-brand-deep"
              }`}
            >
              <Check size={18} /> {concluida ? "Aula concluída" : proxima ? "Concluir e ir para a próxima" : "Marcar como concluída"}
            </button>
          </form>
          <nav aria-label="Navegação entre aulas" className="flex gap-2">
            {anterior && (
              <Link href={`/head-hunter/aula/${anterior.id}`} className="inline-flex min-h-12 items-center rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">← Anterior</Link>
            )}
            {proxima && (
              <Link href={`/head-hunter/aula/${proxima.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">Próxima <Arrow size={16} /></Link>
            )}
          </nav>
        </div>
      </article>
    </main>
  );
}

function CartaoSimulado({ simulado, tentativas, aulaId, erro }: { simulado: Simulado; tentativas: Tentativa[]; aulaId: string; erro: boolean }) {
  const agora = new Date().toISOString();
  const aberta = tentativas.find((t) => !t.finalizada_em && (!t.prazo || t.prazo > agora));
  const feitas = tentativas.filter((t) => t.finalizada_em);
  const melhor = feitas.reduce<number | null>((m, t) => (t.nota !== null && (m === null || t.nota > m) ? t.nota : m), null);
  const aprovado = melhor !== null && melhor >= simulado.nota_minima;

  return (
    <section className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-6 md:p-8">
      <div className="flex flex-wrap gap-3">
        <span className="rounded-xl bg-soft px-4 py-3 text-[15px]"><strong className="font-display text-xl">{simulado.qtd_questoes}</strong> questões</span>
        {simulado.tempo_min && <span className="rounded-xl bg-soft px-4 py-3 text-[15px]"><strong className="font-display text-xl">{duracao(simulado.tempo_min)}</strong> de prova</span>}
        <span className="rounded-xl bg-soft px-4 py-3 text-[15px]">nota mínima <strong className="font-display text-xl">{simulado.nota_minima}%</strong></span>
      </div>
      <p className="text-[15px] leading-relaxed text-ink-2">
        As questões são sorteadas a cada tentativa. {simulado.tempo_min ? "O cronômetro começa quando você inicia e a prova é entregue automaticamente quando o tempo acaba." : "Não há limite de tempo."} Suas respostas ficam salvas se a página fechar.
      </p>
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">Não foi possível iniciar o simulado agora. Tente de novo em instantes.</p>}
      <form action={iniciarSimulado} className="flex flex-wrap items-center gap-4">
        <input type="hidden" name="simulado_id" value={simulado.id} />
        <input type="hidden" name="aula_id" value={aulaId} />
        <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep">
          {aberta ? "Continuar simulado" : feitas.length ? "Fazer de novo" : "Começar simulado"}
        </button>
        {melhor !== null && (
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${aprovado ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff3e0] text-[#8a4b00]"}`}>
            Sua melhor nota: {melhor}%{aprovado ? " · aprovado" : ""}
          </span>
        )}
      </form>
      {feitas.length > 0 && (
        <div className="flex flex-col gap-2">
          <strong className="text-sm">Suas tentativas</strong>
          <ul className="flex flex-col divide-y divide-[#eceef3] rounded-xl border border-line">
            {feitas.slice(0, 5).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[15px]">
                <span>{new Date(t.finalizada_em!).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</span>
                <span className="flex items-center gap-4">
                  <strong>{t.nota}%</strong>
                  <span className="text-muted">{t.acertos}/{t.total}</span>
                  <Link href={`/head-hunter/simulado/${t.id}/resultado?aula=${aulaId}`} className="text-sm font-semibold">Ver gabarito</Link>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
