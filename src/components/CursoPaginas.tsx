/** Páginas de módulo e de aula dos cursos com módulos e aulas (Head Hunter e cursos criados no admin). */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CursoPlayer from "@/components/CursoPlayer";
import { Arrow, Check } from "@/components/icons";
import AvisoTreino from "@/components/AvisoTreino";
import { exigirCurso, revisaoAte } from "@/lib/crew-gate";
import { navegacaoHeadHunter } from "@/lib/curso-navegacao";
import Conteudo from "@/components/Conteudo";
import { alternarAulaConcluida, iniciarSimulado } from "@/app/crew-actions";
import { audioDaAula } from "@/lib/audio-aulas";
import { TIPO_AULA, arquivoDeMidia, duracao, numeroModulo, videoEmbed, type Aula, type Modulo, type Simulado, type Tentativa } from "@/lib/crew";

/** Curso aberto: slug, endereço base para o aluno e nomes para a navegação. */
export type CtxCurso = { slug: string; base: string; nome: string; voltar: string };
export const CTX_HEAD_HUNTER: CtxCurso = { slug: "head-hunter", base: "/head-hunter", nome: "Head Hunter", voltar: "Painel do Head Hunter" };

export async function PaginaModulo({ c, id }: { c: CtxCurso; id: string }) {
  const { supabase, user, liberado, acesso, pago } = await exigirCurso(c.slug, `${c.base}/modulo/${id}`);
  if (!liberado) redirect(c.base);
  if (!/^\d+$/.test(id)) notFound();
  const hh = c.slug === "head-hunter";

  const [{ data: modulo }, { data: aulas }, { data: feitas }, nav] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo, tipo, resumo, duracao_min, publicado").eq("modulo_id", Number(id)).eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id),
    navegacaoHeadHunter(supabase, user.id, { moduloId: Number(id) }, c.slug, c.base),
  ]);
  const m = modulo as (Modulo & { curso?: string }) | null;
  if (!m || (m.curso ?? "head-hunter") !== c.slug) notFound();
  // no módulo com a página Simulados ANAC, os simulados ficam lá (não repetem na lista de aulas)
  const lista = ((aulas ?? []) as Aula[]).filter((a) => !(m?.recurso === "anac" && a.tipo === "simulado"));
  const concluidas = new Set((feitas ?? []).map((f) => f.aula_id));
  const primeira = lista.find((a) => !concluidas.has(a.id)) ?? lista[0];

  return (
    <CursoPlayer curso={c.nome} voltar={{ href: c.base, rotulo: c.voltar }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total}
      rodape={primeira ? (
        <>
          <span className="text-[14px] text-muted">{lista.filter((a) => concluidas.has(a.id)).length} de {lista.length} aulas concluídas</span>
          <Link href={`${c.base}/aula/${primeira.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
            {lista.some((a) => concluidas.has(a.id)) ? "Continuar" : "Começar o módulo"} <Arrow size={16} />
          </Link>
        </>
      ) : undefined}>
      <div className="flex flex-col gap-6">
        {m.treino_pos_curso && revisaoAte(acesso, pago) && <AvisoTreino ate={revisaoAte(acesso, pago)!} />}
        <div className="flex flex-col gap-2">
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#b0002a] uppercase">Módulo {numeroModulo(m.ordem)}{m.fase ? ` · ${m.fase}` : ""}</span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{m.titulo}</h1>
          {m.descricao && <p className="text-[17px] leading-relaxed text-ink-2">{m.descricao}</p>}
        </div>

        {hh && m.recurso === "dinamicas" && (
          <Link href="/head-hunter/dinamicas" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Biblioteca de dinâmicas</strong>
              <span className="text-[15px] text-[#d7dbe6]">As dinâmicas usadas nas seleções, com como se destacar em cada uma.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {hh && m.ordem === 6 && (
          <Link href="/head-hunter/perfil-comportamental" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Perfil comportamental (OPQ / SHL)</strong>
              <span className="text-[15px] text-[#d7dbe6]">Treine o teste de personalidade e veja seu perfil em 11 traços, com alerta de respostas incoerentes.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {hh && m.ordem === 8 && (
          <Link href="/head-hunter/entrevista-ingles" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Entrevista em inglês</strong>
              <span className="text-[15px] text-[#d7dbe6]">Perguntas reais com áudio, respostas-modelo e simulação com gravação.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {hh && m.recurso === "anac" && (
          <Link href="/simulados-anac" className="flex items-center justify-between gap-4 rounded-[20px] bg-navy p-6 text-white hover:bg-navy-deep">
            <span className="flex flex-col gap-1">
              <strong className="font-display text-lg">Simulados ANAC</strong>
              <span className="text-[15px] text-[#d7dbe6]">Treine por bloco ou faça a prova completa, com seu histórico de notas.</span>
            </span>
            <span aria-hidden="true" className="text-2xl">→</span>
          </Link>
        )}

        {lista.length === 0 && !m.recurso && m.ordem !== 8 ? (
          <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
            As aulas deste módulo estão sendo preparadas. Volte em breve.
          </p>
        ) : lista.length === 0 ? null : (
          <ol className="flex flex-col gap-3">
            {lista.map((a, i) => {
              const ok = concluidas.has(a.id);
              return (
                <li key={a.id}>
                  <Link href={`${c.base}/aula/${a.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 text-navy hover:border-navy">
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-navy"}`}
                      aria-hidden="true"
                    >
                      {ok ? <Check size={18} /> : i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-semibold">{a.titulo}</span>
                      <span className="text-[13px] text-muted">
                        {TIPO_AULA[a.tipo]}{a.duracao_min ? ` · ${duracao(a.duracao_min)}` : ""}{ok ? " · Concluída" : ""}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </CursoPlayer>
  );
}

const UUID = /^[0-9a-f-]{36}$/i;

export async function PaginaAula({ c, id, erro }: { c: CtxCurso; id: string; erro?: string }) {
  const { supabase, user, profile, liberado, acesso, pago } = await exigirCurso(c.slug, `${c.base}/aula/${id}`);
  if (!liberado) redirect(c.base);
  if (!UUID.test(id)) notFound();

  const { data } = await supabase.from("aulas").select("*").eq("id", id).maybeSingle();
  const aula = data as Aula | null;
  if (!aula || (!aula.publicado && !profile.is_admin) || ((aula as Aula & { curso?: string }).curso ?? "head-hunter") !== c.slug) notFound();

  const [{ data: modulo }, { data: feita }, simRes, tentRes, nav, audio] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", aula.modulo_id).single(),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id).eq("aula_id", aula.id).maybeSingle(),
    aula.simulado_id
      ? supabase.from("simulados").select("*").eq("id", aula.simulado_id).maybeSingle()
      : Promise.resolve({ data: null }),
    aula.simulado_id
      ? supabase.from("tentativas").select("*").eq("user_id", user.id).eq("simulado_id", aula.simulado_id).order("iniciada_em", { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
    navegacaoHeadHunter(supabase, user.id, { aulaId: id }, c.slug, c.base),
    aula.tipo === "texto" ? audioDaAula(aula.id) : Promise.resolve(null),
  ]);
  const simulado = simRes.data as Simulado | null;
  const tentativas = (tentRes.data ?? []) as Tentativa[];
  const m = modulo as Modulo;
  const { anterior, proxima } = nav;
  const proximaId = proxima?.href.split("/").pop() ?? "";
  const concluida = !!feita;
  const embed = videoEmbed(aula.video_url);
  const agora = new Date().getTime();

  const rodape = (
    <>
      {anterior ? (
        <Link href={anterior.href} className="inline-flex min-h-12 items-center rounded-full px-3 font-semibold text-navy hover:bg-soft">← <span className="ml-1 hidden sm:inline">Anterior</span></Link>
      ) : <span />}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <form action={alternarAulaConcluida}>
          <input type="hidden" name="aula_id" value={aula.id} />
          <input type="hidden" name="concluida" value={String(concluida)} />
          <input type="hidden" name="proxima" value={concluida ? "" : proximaId} />
          {concluida ? (
            <button type="submit" aria-pressed="true" title="Clique para desmarcar"
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-[#0f6b3a] bg-[#e5f6ec] px-5 font-semibold text-[#0f6b3a]">
              <Check size={18} /> Concluída
            </button>
          ) : (
            <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
              {proxima ? <>Concluir e próxima <Arrow size={16} /></> : <><Check size={18} /> Concluir aula</>}
            </button>
          )}
        </form>
        {concluida && proxima && (
          <Link href={proxima.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-display font-bold text-white hover:bg-navy-deep">Próxima <Arrow size={16} /></Link>
        )}
      </div>
    </>
  );

  return (
    <CursoPlayer curso={c.nome} voltar={{ href: c.base, rotulo: c.voltar }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total} rodape={rodape}>
      <article className="flex flex-col gap-6">
        {m.treino_pos_curso && revisaoAte(acesso, pago) && <AvisoTreino ate={revisaoAte(acesso, pago)!} />}
        {!aula.publicado && (
          <p className="rounded-xl border border-[#ffe0b2] bg-[#fff3e0] px-4 py-3 text-sm text-[#8a4b00]">Rascunho: só administradores veem esta aula.</p>
        )}

        <header className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-muted">
            Módulo {numeroModulo(m.ordem)} · {m.titulo}
          </span>
          <span className="text-sm font-semibold text-[#b0002a]">
            {TIPO_AULA[aula.tipo]}{aula.duracao_min ? ` · ${duracao(aula.duracao_min)}` : ""}
          </span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">{aula.titulo}</h1>
          {aula.resumo && <p className="text-[17px] leading-relaxed text-ink-2">{aula.resumo}</p>}
        </header>

        {aula.tipo === "ao_vivo" ? <AoVivo aula={aula} agora={agora} /> : aula.tipo === "audio" ? (
          aula.video_url && (
            <section aria-label="Áudio da aula" className="flex flex-col gap-2 rounded-[20px] bg-navy p-5 text-white">
              <span className="text-xs font-bold tracking-[.12em] text-[#ffb3c4] uppercase">🎧 Ouça a aula</span>
              <audio controls preload="metadata" src={aula.video_url} className="w-full" />
            </section>
          )
        ) : <Player url={aula.video_url} titulo={aula.titulo} embed={embed} />}

        {aula.tipo === "pdf" && aula.arquivo_url?.startsWith("/midia/") && (
          <iframe src={aula.arquivo_url} title={`Material: ${aula.titulo}`} className="h-[75vh] w-full rounded-[20px] border border-line bg-white" />
        )}

        {simulado && (
          <CartaoSimulado simulado={simulado} tentativas={tentativas} aulaId={aula.id} erro={!!erro} />
        )}

        {audio && (
          <section aria-label="Ouvir esta aula" className="flex flex-col gap-2 rounded-[20px] bg-navy p-5 text-white">
            <span className="text-xs font-bold tracking-[.12em] text-[#ffb3c4] uppercase">🎧 Ouça esta aula</span>
            <audio controls preload="none" src={audio} className="w-full" />
            <span className="text-[13px] text-white/75">Ouça no caminho ou acompanhe lendo o texto abaixo.</span>
          </section>
        )}

        {aula.conteudo && (
          <div className="aula-conteudo rounded-[20px] border border-line bg-white p-6 md:p-9">
            <Conteudo texto={aula.conteudo} />
          </div>
        )}

        {aula.arquivo_url && (
          <a href={aula.arquivo_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 font-semibold text-navy hover:border-navy">
            {aula.tipo === "pdf" ? "Baixar o material" : "Baixar material de apoio"} <span aria-hidden="true">↓</span>
          </a>
        )}
      </article>
    </CursoPlayer>
  );
}

/** Vídeo da aula: YouTube/Vimeo, arquivo da galeria do site ou link externo. */
function Player({ url, titulo, embed }: { url: string | null; titulo: string; embed: string | null }) {
  if (embed) return (
    <div className="relative aspect-video overflow-hidden rounded-[20px] bg-navy">
      <iframe src={embed} title={titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full" />
    </div>
  );
  if (arquivoDeMidia(url)) return <video src={url!} controls preload="metadata" playsInline controlsList="nodownload" className="aspect-video w-full rounded-[20px] bg-navy" />;
  if (url) return <a href={url} target="_blank" rel="noreferrer" className="rounded-2xl border border-line bg-white p-5 font-semibold">Assistir ao vídeo da aula ↗</a>;
  return null;
}

const horaBR = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Aula ao vivo: antes mostra quando começa; na hora, o link da transmissão; depois, a gravação (se houver). */
function AoVivo({ aula, agora }: { aula: Aula; agora: number }) {
  const inicio = aula.ao_vivo_em ? new Date(aula.ao_vivo_em) : null;
  const fase = !inicio ? "sem-data" : agora < inicio.getTime() - 15 * 60_000 ? "antes" : agora < inicio.getTime() + 3 * 3600_000 ? "agora" : "depois";
  const grav = aula.gravacao_url ? <Player url={aula.gravacao_url} titulo={`Gravação: ${aula.titulo}`} embed={videoEmbed(aula.gravacao_url)} /> : null;
  return (
    <section aria-label="Aula ao vivo" className="flex flex-col gap-4">
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-[20px] p-5 md:p-6 ${fase === "agora" ? "bg-brand-strong text-white" : "bg-navy text-white"}`}>
        <span className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-[.12em] uppercase opacity-80">{fase === "agora" ? "🔴 Ao vivo agora" : fase === "depois" ? "Aula ao vivo encerrada" : "📡 Aula ao vivo"}</span>
          {inicio && <strong className="font-display text-xl first-letter:uppercase">{horaBR(inicio)}</strong>}
          {fase === "antes" && <span className="text-[14px] opacity-85">O link abre a transmissão. Entre uns minutos antes.</span>}
          {fase === "depois" && <span className="text-[14px] opacity-85">{grav ? "Assista à gravação abaixo." : "A gravação vai aparecer aqui quando estiver pronta."}</span>}
        </span>
        {aula.video_url && fase !== "depois" && (
          <a href={aula.video_url} target="_blank" rel="noreferrer" className={`inline-flex min-h-12 items-center rounded-full px-6 font-display font-bold ${fase === "agora" ? "bg-white text-brand-deep" : "bg-brand-strong text-white hover:bg-brand-deep"}`}>
            Entrar na transmissão ↗
          </a>
        )}
      </div>
      {grav}
    </section>
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
