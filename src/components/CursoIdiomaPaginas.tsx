/** Páginas dos cursos de idioma (Flight Attendant English e Flight Attendant Spanish): início, módulo e aula. */
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CursoPlayer from "@/components/CursoPlayer";
import InglesAula from "@/components/InglesAula";
import { NOTA_MINIMA, chaveAula } from "@/lib/ingles-a-bordo";
import { aulaLiberadaEm, carregarIdioma } from "@/lib/ingles-dados";
import { exigirCurso } from "@/lib/crew-gate";
import { navegacaoIdioma } from "@/lib/curso-navegacao";
import { idiomaDaAula, type CursoIdioma } from "@/lib/cursos-idioma";

const data = (d: string) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export async function InicioIdioma({ c }: { c: CursoIdioma }) {
  const { supabase, user, profile, liberado, acesso, pago, encerrado } = await exigirCurso(c.produto, c.base);
  if (!liberado) {
    if (!encerrado) redirect(`/planos#${c.produto}`);
    return (
      <main className="bg-soft">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 px-6 py-20 text-center">
          <span aria-hidden="true" className="text-[64px] leading-none">{c.bandeira}</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold">{c.textos.parabens}, {(profile.nome ?? profile.apelido).split(" ")[0]}! Você concluiu o {c.nome}.</h1>
          <p className="text-[17px] leading-relaxed text-ink-2">Você completou todas as aulas e o seu acesso ao curso terminou{acesso?.expira_em ? ` em ${data(acesso.expira_em)}` : ""}. {c.textos.despedida} ✈️</p>
          <Link href={`/certificado/novo/${c.produto}`} className="inline-flex min-h-12 items-center rounded-xl bg-navy px-6 font-semibold text-white hover:bg-navy-deep">🎓 Baixar meu certificado</Link>
          <Link href={`/comprar/${c.produto}`} className="inline-flex min-h-12 items-center rounded-xl border-2 border-navy px-6 font-semibold text-navy hover:bg-navy hover:text-white">Comprar novo acesso</Link>
        </div>
      </main>
    );
  }
  const revisaoAte = pago && acesso?.concluido_em && acesso.expira_em ? acesso.expira_em : null;
  const { progresso, comProgresso } = await carregarIdioma(c, supabase, user.id);
  const livre = profile.is_admin || !comProgresso;

  const feitas = c.todas.filter((a) => progresso[chaveAula(a)]?.concluida).length;
  const total = c.todas.length;
  const pct = total ? Math.round((feitas / total) * 100) : 0;
  const proxima = c.todas.find((a) => !progresso[chaveAula(a)]?.concluida);

  return (
    <main className="bg-soft pb-20">
      {revisaoAte && (
        <p className="bg-[#e5f6ec] px-6 py-3 text-center text-[15px] font-semibold text-[#0f6b3a]" role="status">
          {c.bandeira} Você concluiu o curso! Seu acesso continua até {data(revisaoAte)} para revisar.{" "}
          <Link href={`/certificado/novo/${c.produto}`} className="underline underline-offset-4">🎓 Baixar meu certificado</Link>
        </p>
      )}
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src={c.textos.capa} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="relative mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-8 px-6 pt-8 pb-14">
          <div className="flex max-w-[640px] flex-col gap-4">
            <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">{c.textos.selo}</span>
            <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[48px]">Flight Attendant <span className="text-[#ff5a7a]">{c.textos.destaque}</span></h1>
            <p className="text-[17px] leading-relaxed text-[#e3e6ee]">{c.textos.sub}</p>
          </div>
          <div className="flex w-full max-w-[320px] flex-col gap-3 rounded-[20px] bg-white/10 p-6 backdrop-blur">
            <div className="flex items-end justify-between">
              <span className="text-sm text-[#d7dbe6]">Seu progresso</span>
              <span className="font-display text-3xl font-extrabold">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20" aria-hidden="true"><div className="h-2.5 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
            <span className="text-sm text-[#d7dbe6]">{feitas} de {total} aulas concluídas</span>
            {proxima && (
              <Link href={`${c.base}/${proxima.modulo}/${proxima.numero}`} className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">
                {feitas ? "Continuar" : "Começar a primeira aula"} →
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pt-10 md:px-6">
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["🎧", "Ouça", "Diálogos de situações reais a bordo."],
            ["🎤", "Fale", "O site ouve você e mostra o que precisa melhorar."],
            ["✍️", "Escreva", "Ditado, lacunas e frases para montar."],
            ["✅", "Avance", "Quiz no fim de cada aula libera a próxima."],
          ].map(([i, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
              <span aria-hidden="true" className="text-2xl">{i}</span>
              <span className="flex flex-col gap-0.5"><strong className="font-display">{t}</strong><span className="text-[14px] text-ink-2">{d}</span></span>
            </div>
          ))}
        </section>

        <section aria-labelledby="mods" className="flex flex-col gap-5">
          <h2 id="mods" className="font-display text-2xl font-extrabold">Os {c.modulos.length} módulos do voo</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.modulos.map((m) => {
              const n = m.aulas.length;
              const f = m.aulas.filter((a) => progresso[chaveAula(a)]?.concluida).length;
              const aberto = n > 0 && aulaLiberadaEm(c, chaveAula(m.aulas[0]), progresso, livre);
              const conteudo = (
                <>
                  <span className="relative block aspect-[16/9] overflow-hidden">
                    <Image src={m.foto} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px" className={`object-cover transition duration-300 ${n ? "group-hover:scale-[1.03]" : "grayscale-[60%]"}`} />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-display text-xs font-bold text-navy">Módulo {m.numero}</span>
                    {n === 0 && <span className="absolute top-3 right-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">Em breve</span>}
                    {n > 0 && !aberto && <span className="absolute top-3 right-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">🔒 Bloqueado</span>}
                  </span>
                  <span className="flex flex-1 flex-col gap-1.5 p-5">
                    <strong className="font-display text-lg leading-tight">{m.titulo}</strong>
                    <span lang={c.lang} className="text-[13px] font-semibold text-muted">{m.tituloEn}</span>
                    <span className="text-[14px] leading-relaxed text-ink-2">{m.resumo}</span>
                    {n > 0 && (
                      <span className="mt-auto flex flex-col gap-1.5 pt-3">
                        <span className="h-1.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-1.5 rounded-full bg-brand" style={{ width: `${Math.round((f / n) * 100)}%` }} /></span>
                        <span className="text-[13px] text-muted">{f} de {n} aulas</span>
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <li key={m.numero}>
                  {n > 0 ? (
                    <Link href={`${c.base}/${m.numero}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">{conteudo}</Link>
                  ) : (
                    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy opacity-80">{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}

export async function ModuloIdioma({ c, modulo }: { c: CursoIdioma; modulo: string }) {
  const m = c.modulos.find((x) => String(x.numero) === modulo);
  if (!m || !m.aulas.length) notFound();
  const { supabase, user, profile, liberado } = await exigirCurso(c.produto, `${c.base}/${modulo}`);
  if (!liberado) redirect(c.base);
  const { progresso, comProgresso } = await carregarIdioma(c, supabase, user.id);
  const livre = profile.is_admin || !comProgresso;
  const nav = navegacaoIdioma(c, progresso, livre, { modulo: m.numero });
  const daqui = nav.secoes.find((x) => x.atual)?.itens ?? [];
  const seguir = daqui.find((x) => !x.feita && !x.bloqueada) ?? daqui[0];

  return (
    <CursoPlayer curso={c.nome} voltar={{ href: c.base, rotulo: c.nome }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total}
      rodape={seguir && !seguir.bloqueada ? (
        <>
          <span className="text-[14px] text-muted">{daqui.filter((x) => x.feita).length} de {daqui.length} aulas concluídas</span>
          <Link href={seguir.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">{daqui.some((x) => x.feita) ? "Continuar" : "Começar o módulo"} →</Link>
        </>
      ) : undefined}>
     <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[24px] bg-navy text-white">
        <Image src={m.foto} alt="" fill priority sizes="(min-width: 1024px) 880px, 100vw" className="object-cover opacity-30" />
        <div className="relative flex flex-col gap-3 px-6 pt-10 pb-10 md:px-9">
          <span className="font-display text-sm font-bold tracking-[.08em] text-[#ffb3c4] uppercase">Módulo {m.numero}</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">{m.titulo}</h1>
          <p lang={c.lang} className="text-[17px] font-semibold text-[#d7dbe6]">{m.tituloEn}</p>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-[#e3e6ee]">{m.resumo}</p>
        </div>
      </section>

      <ol className="flex flex-col gap-3">
        {m.aulas.map((a) => {
          const k = chaveAula(a);
          const p = progresso[k];
          const aberta = aulaLiberadaEm(c, k, progresso, livre);
          const corpo = (
            <>
              <span className="relative hidden h-[84px] w-[130px] shrink-0 overflow-hidden rounded-xl sm:block">
                <Image src={a.foto} alt="" fill sizes="130px" className={`object-cover ${aberta ? "" : "grayscale"}`} />
              </span>
              <span aria-hidden="true" className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display font-bold sm:hidden ${p?.concluida ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft"}`}>
                {p?.concluida ? "✓" : aberta ? a.numero : "🔒"}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-muted">Aula {k} · {a.minutos} min</span>
                <strong className="font-display text-[18px] leading-snug">{a.titulo}</strong>
                <span lang={c.lang} className="text-[14px] text-ink-2">{a.tituloEn}</span>
              </span>
              <span className="shrink-0 text-right text-[13px] font-semibold">
                {p?.concluida ? <span className="rounded-full bg-[#e5f6ec] px-3 py-1 text-[#0f6b3a]">✓ {p.nota}%</span>
                  : p ? <span className="rounded-full bg-brand-soft px-3 py-1 text-brand-deep">{p.nota}% · precisa {NOTA_MINIMA}%</span>
                  : aberta ? <span className="text-brand-strong">Começar →</span>
                  : <span className="text-muted">🔒 Conclua a anterior</span>}
              </span>
            </>
          );
          return (
            <li key={k}>
              {aberta ? (
                <Link href={`${c.base}/${m.numero}/${a.numero}`} className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-3 pr-5 text-navy hover:border-navy">{corpo}</Link>
              ) : (
                <div aria-disabled="true" className="flex items-center gap-4 rounded-[20px] border border-line bg-white/60 p-3 pr-5 text-navy">{corpo}</div>
              )}
            </li>
          );
        })}
      </ol>
     </div>
    </CursoPlayer>
  );
}

export function tituloAula(c: CursoIdioma, modulo: string, aula: string) {
  const r = c.achar(Number(modulo), Number(aula));
  return { title: r ? `${r.aula.titulo} · ${c.nome}` : c.nome, robots: { index: false } };
}

export async function AulaIdioma({ c, modulo, aula }: { c: CursoIdioma; modulo: string; aula: string }) {
  if (!/^\d+$/.test(modulo) || !/^\d+$/.test(aula)) notFound();
  const r = c.achar(Number(modulo), Number(aula));
  if (!r) notFound();
  const { supabase, user, profile, liberado } = await exigirCurso(c.produto, `${c.base}/${modulo}/${aula}`);
  if (!liberado) redirect(c.base);
  const { audios, progresso, comProgresso } = await carregarIdioma(c, supabase, user.id);
  const chave = chaveAula(r.aula);
  const livre = profile.is_admin || !comProgresso;
  if (!aulaLiberadaEm(c, chave, progresso, livre)) redirect(`${c.base}/${modulo}`);

  const i = c.todas.findIndex((a) => chaveAula(a) === chave);
  const prox = c.todas[i + 1];
  const a = r.aula;
  const nav = navegacaoIdioma(c, progresso, livre, { chave });
  const { anterior, proxima } = nav;
  const feita = !!progresso[chave]?.concluida;

  return (
    <CursoPlayer curso={c.nome} voltar={{ href: c.base, rotulo: c.nome }} secoes={nav.secoes} feitas={nav.feitas} total={nav.total}
      rodape={
        <>
          {anterior ? <Link href={anterior.href} className="inline-flex min-h-12 items-center rounded-full px-3 font-semibold text-navy hover:bg-soft">← <span className="ml-1 hidden sm:inline">Anterior</span></Link> : <span />}
          {feita && proxima && !proxima.bloqueada ? (
            <Link href={proxima.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-display font-bold text-white hover:bg-navy-deep">Próxima aula →</Link>
          ) : feita ? (
            <span className="inline-flex min-h-12 items-center rounded-full border-2 border-[#0f6b3a] bg-[#e5f6ec] px-5 font-semibold text-[#0f6b3a]">✓ Aula concluída</span>
          ) : (
            <a href="#quiz" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Fazer o quiz para concluir ↓</a>
          )}
        </>
      }>
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-[24px] bg-navy text-white">
          <Image src={a.foto} alt="" fill priority sizes="(min-width: 1024px) 880px, 100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" aria-hidden="true" />
          <div className="relative flex flex-col gap-3 px-6 pt-10 pb-8 md:px-9">
            <span className="font-display text-sm font-bold tracking-[.08em] text-[#ffb3c4] uppercase">Módulo {r.modulo.numero} · Aula {chave} · {a.minutos} min</span>
            <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">{a.titulo}</h1>
            <p lang={c.lang} className="text-[18px] font-semibold text-[#d7dbe6]">{a.tituloEn}</p>
            <p className="max-w-[680px] rounded-2xl bg-white/10 px-4 py-3 text-[16px] leading-relaxed"><strong>🎯 Objetivo:</strong> {a.objetivo}</p>
          </div>
        </section>
        <p className="text-[17px] leading-relaxed text-ink-2">{a.intro}</p>
        <InglesAula
          idioma={idiomaDaAula(c, a)}
          aula={a}
          chave={chave}
          audio={audios[chave]}
          notaAnterior={progresso[chave]?.nota}
          logado={comProgresso}
          proxima={prox ? { href: `${c.base}/${prox.modulo}/${prox.numero}`, titulo: prox.titulo } : undefined}
        />
      </div>
    </CursoPlayer>
  );
}
