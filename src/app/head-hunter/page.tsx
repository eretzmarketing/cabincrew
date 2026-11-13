import type { Metadata } from "next";
import { avisarAluno } from "@/lib/whatsapp";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Check } from "@/components/icons";
import JornadaPainel from "@/components/JornadaPainel";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { carregarJornada } from "@/lib/jornada-dados";
import { calcularMedalhas } from "@/lib/medalhas";
import { numeroModulo, type Modulo } from "@/lib/crew";

export const metadata: Metadata = { title: "Head Hunter", robots: { index: false } };

export default async function CrewSelectPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const { supabase, user, profile, liberado, acesso, pago, encerrado } = await exigirCrewSelect("/head-hunter");

  if (!liberado) {
    if (encerrado) return <Concluido nome={profile.nome ?? profile.apelido} em={acesso?.expira_em ?? acesso?.encerrado_em ?? null} />;
    const { data: prod } = await supabase.from("produtos").select("*").eq("slug", "head-hunter").maybeSingle();
    return <Venda nome={profile.nome ?? profile.apelido} prod={prod} revogado={acesso?.status === "revogado"} />;
  }

  const [{ data: modulos }, { data: aulas }, { data: feitas }, anac, { dados, dataMeta, jornada }] = await Promise.all([
    supabase.from("modulos").select("*").eq("publicado", true).order("ordem"),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo").eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id),
    supabase.rpc("anac_liberado"),
    carregarJornada(supabase, user.id),
  ]);
  const { data: rk } = await supabase.rpc("ranking_semana", { p_semanas_atras: 0 });
  const minhaPos = ((rk ?? []) as { posicao: number; pontos: number; eu: boolean }[]).find((l) => l.eu);
  const medalhas = calcularMedalhas(dados, jornada);
  const ganhas = medalhas.filter((m) => m.ganha);
  const temAnac = anac.error ? true : anac.data === true;

  const concluidas = new Set((feitas ?? []).map((f) => f.aula_id));
  const porModulo = new Map<number, { total: number; feitas: number; proxima?: string }>();
  for (const a of aulas ?? []) {
    const m = porModulo.get(a.modulo_id) ?? { total: 0, feitas: 0 };
    m.total += 1;
    if (concluidas.has(a.id)) m.feitas += 1;
    else if (!m.proxima) m.proxima = a.id;
    porModulo.set(a.modulo_id, m);
  }
  const total = aulas?.length ?? 0;
  const feitasTotal = (aulas ?? []).filter((a) => concluidas.has(a.id)).length;

  const lista = (modulos ?? []) as Modulo[];
  const continuar = lista.find((m) => porModulo.get(m.id)?.proxima);
  const continuarAula = continuar ? porModulo.get(continuar.id)?.proxima : undefined;
  const primeiroNome = (profile.nome ?? profile.apelido).split(" ")[0];

  // jornada completa: parabéns no WhatsApp (uma única vez)
  if (jornada.etapas.some((e) => !e.vazia) && jornada.etapas.every((e) => e.vazia || e.feita)) {
    avisarAluno(supabase, "jornada_concluida");
    // acesso comprado: ao concluir a jornada começam os dias extras para revisar
    if (pago && !acesso?.concluido_em && !profile.is_admin) {
      const { data: fim } = await supabase.rpc("hh_concluir_acesso");
      if (acesso && fim) { acesso.concluido_em = new Date().toISOString(); acesso.expira_em = fim as string; }
    }
  }
  const revisaoAte = pago && acesso?.concluido_em && acesso.expira_em ? acesso.expira_em : null;

  return (
    <main className="bg-soft">
      {revisaoAte && (
        <div className="bg-[#e5f6ec] text-[#0f6b3a]" role="status">
          <p className="mx-auto max-w-[1200px] px-6 py-3 text-[15px] font-semibold">
            👑 Você concluiu toda a jornada! Seu acesso continua até {new Date(revisaoAte).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} para você revisar antes da seleção.{" "}
            <Link href="/certificado/novo/head-hunter" className="underline underline-offset-4">🎓 Baixar meu certificado</Link>
          </p>
        </div>
      )}
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-8 px-6 py-12">
          <div className="flex max-w-[640px] flex-col gap-3">
            <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] uppercase">Head Hunter</span>
            <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">Olá, {primeiroNome}! Seu plano de voo até a aprovação.</h1>
            <p className="text-[17px] leading-relaxed text-[#d7dbe6]">
              Sua jornada segue a ordem real do processo seletivo. Cumpra a missão do dia e avance etapa por etapa.
            </p>
          </div>
          <div className="flex w-full max-w-[340px] flex-col gap-3 rounded-[20px] bg-white/10 p-6">
            <div className="flex items-end justify-between">
              <span className="text-sm text-[#d7dbe6]">Sua jornada</span>
              <span className="font-display text-3xl font-extrabold">{jornada.pctGeral}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20" aria-hidden="true">
              <div className="h-2.5 rounded-full bg-brand" style={{ width: `${jornada.pctGeral}%` }} />
            </div>
            <span className="text-sm text-[#d7dbe6]">Etapa {jornada.atual + 1} de {jornada.etapas.length}: {jornada.etapas[jornada.atual]?.titulo} · 🔥 {jornada.sequencia.dias} {jornada.sequencia.dias === 1 ? "dia" : "dias"} · {feitasTotal} de {total} aulas</span>
            {continuarAula && (
              <Link href={`/head-hunter/aula/${continuarAula}`} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">
                {feitasTotal ? "Continuar de onde parei" : "Começar agora"} <Arrow />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 pb-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
          {erro === "treino" && (
            <p role="alert" className="rounded-2xl bg-brand-soft px-5 py-4 text-brand-deep">Não foi possível começar o treino agora. Se o problema continuar, fale com a equipe Cabin Crew.</p>
          )}
          <JornadaPainel j={jornada} temCheckin={dados.companhias.length > 0} dataMeta={dataMeta} hoje={dados.hoje} />
          <h2 className="pt-6 font-display text-2xl font-extrabold">Atalhos</h2>
          {temAnac && lista.some((m) => m.recurso === "anac") && (
            <Link href="/simulados-anac" className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-2 border-brand-line bg-white p-6 text-navy hover:border-brand">
              <span className="flex flex-col gap-1">
                <span className="self-start rounded-full bg-brand-soft px-3 py-1 font-display text-xs font-bold tracking-[.08em] text-brand-strong uppercase">Simulados ANAC</span>
                <strong className="font-display text-xl font-extrabold">Treine para a prova da ANAC</strong>
                <span className="text-[15px] text-ink-2">Estudo por bloco ou prova completa, com sua evolução e o gabarito comentado.</span>
              </span>
              <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white">Abrir simulados <Arrow /></span>
            </Link>
          )}
          <Link href="/head-hunter/ranking" className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-2 border-brand-line bg-white p-6 text-navy hover:border-brand">
            <span className="flex flex-col gap-1">
              <span className="self-start rounded-full bg-brand-soft px-3 py-1 font-display text-xs font-bold tracking-[.08em] text-brand-strong uppercase">Ranking da semana</span>
              <strong className="font-display text-xl font-extrabold">
                {minhaPos ? `Você está em ${minhaPos.posicao}º com ${minhaPos.pontos} pontos` : "Pontue nesta semana e entre no ranking"}
              </strong>
              <span className="text-[15px] text-ink-2">
                {ganhas.length} de {medalhas.length} medalhas {ganhas.length > 0 && <span aria-hidden="true">· {ganhas.slice(-6).map((m) => m.emoji).join(" ")}</span>}
              </span>
            </span>
            <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white">Ver ranking <Arrow /></span>
          </Link>
          <Link href="/head-hunter/video-apresentacao" className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-2 border-brand-line bg-white p-6 text-navy hover:border-brand">
            <span className="flex flex-col gap-1">
              <span className="self-start rounded-full bg-brand-soft px-3 py-1 font-display text-xs font-bold tracking-[.08em] text-brand-strong uppercase">Novo · Treino</span>
              <strong className="font-display text-xl font-extrabold">Vídeo de apresentação</strong>
              <span className="text-[15px] text-ink-2">Roteiro guiado, gravação pela câmera com cronômetro e autoavaliação. O vídeo fica só no seu aparelho.</span>
            </span>
            <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white">Treinar <Arrow /></span>
          </Link>
          <h2 id="modulos" className="scroll-mt-6 pt-4 font-display text-2xl font-extrabold">Todos os módulos</h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lista.map((m) => {
              const p = porModulo.get(m.id) ?? { total: 0, feitas: 0 };
              const completo = p.total > 0 && p.feitas === p.total;
              const pm = p.total ? Math.round((p.feitas / p.total) * 100) : 0;
              return (
                <li key={m.id}>
                  <Link
                    href={`/head-hunter/modulo/${m.id}`}
                    className="flex h-full flex-col gap-3 rounded-[20px] border border-line bg-white p-6 text-navy transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(49,57,80,.35)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-[28px] leading-none font-extrabold text-brand">{numeroModulo(m.ordem)}</span>
                      {completo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f6ec] px-2.5 py-1 text-xs font-semibold text-[#0f6b3a]"><Check size={14} />Concluído</span>
                      ) : p.total === 0 && !m.recurso ? (
                        <span className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-xs font-semibold text-ink-2">Em breve</span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-lg leading-snug font-bold">{m.titulo}</h3>
                      {m.fase && <span className="text-[13px] font-semibold text-[#b0002a]">{m.fase}</span>}
                      {m.descricao && <p className="text-[15px] leading-relaxed text-ink-2">{m.descricao}</p>}
                    </div>
                    {p.total > 0 && (
                      <div className="mt-auto flex flex-col gap-1.5 pt-2">
                        <div className="h-1.5 rounded-full bg-[#eceef3]" aria-hidden="true">
                          <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pm}%` }} />
                        </div>
                        <span className="text-[13px] text-muted">{p.feitas} de {p.total} {p.total === 1 ? "aula" : "aulas"}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </main>
  );
}

type Prod = { nome: string; descricao: string | null; preco: number; desconto_pix: number; ativo: boolean; dias_apos_conclusao?: number; topicos?: string[] | null } | null;
const reais = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Venda({ nome, prod, revogado }: { nome: string; prod: Prod; revogado: boolean }) {
  const pix = prod ? Math.round(Number(prod.preco) * (100 - Number(prod.desconto_pix))) / 100 : 0;
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-6 py-16">
        <div className="relative hidden h-[460px] flex-[1_1_320px] overflow-hidden rounded-3xl md:block">
          <Image src="/img/head-hunter.jpg" alt="Comissária com mala de bordo no aeroporto" fill sizes="40vw" className="object-cover object-[center_20%]" />
        </div>
        <div className="flex flex-[999_1_420px] flex-col gap-4">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Head Hunter</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold">{nome.split(" ")[0]}, seu plano de voo até a aprovação.</h1>
          {revogado && <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-[15px] text-[#7a5a00]">Seu acesso anterior foi encerrado. Para voltar a estudar, faça uma nova compra.</p>}
          <p className="text-[17px] leading-relaxed text-ink-2">{prod?.descricao ?? "Preparatório completo para a seleção de comissário(a) de voo."}</p>
          <ul className="flex flex-col gap-2 text-[16px]">
            {[...(prod?.topicos?.length ? prod.topicos : ["Jornada personalizada para a companhia que você quer", "Aulas, simulados no estilo das seleções e dinâmicas de grupo", "Treino de entrevista em inglês e vídeo de apresentação"]), (prod?.dias_apos_conclusao ?? 30) > 0 ? `Acesso até você concluir toda a jornada, mais ${prod?.dias_apos_conclusao ?? 30} dias para revisar` : "Acesso até você concluir toda a jornada"].map((t) => (
              <li key={t} className="flex gap-2"><span className="text-brand-strong"><Check /></span>{t}</li>
            ))}
          </ul>
          {prod?.ativo ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong className="font-display text-[32px] font-extrabold text-navy">{reais(prod.preco)}</strong>
                <span className="text-[15px] text-ink-2">no cartão, em até 12x</span>
              </div>
              {Number(prod.desconto_pix) > 0 && <p className="text-[16px]"><strong className="text-[#0f6b3a]">{reais(pix)} no Pix</strong> ({Number(prod.desconto_pix)}% de desconto)</p>}
              <Link href="/comprar/head-hunter" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand-strong px-6 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Quero começar agora <Arrow /></Link>
              <Link href="/planos" className="text-center text-[15px] font-semibold text-navy underline underline-offset-4">Ver todos os planos</Link>
              <span className="text-[13px] text-muted">Pagamento seguro pelo Mercado Pago. Acesso liberado na hora.</span>
            </div>
          ) : <p className="text-[17px] text-ink-2">As inscrições abrem em breve. Avisaremos você pelo WhatsApp.</p>}
        </div>
      </div>
    </main>
  );
}

function Concluido({ nome, em }: { nome: string; em: string | null }) {
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 px-6 py-20 text-center">
        <span aria-hidden="true" className="text-[64px] leading-none">👑</span>
        <h1 className="font-display text-[34px] leading-tight font-extrabold">Parabéns, {nome.split(" ")[0]}! Você concluiu o Head Hunter.</h1>
        <p className="text-[17px] leading-relaxed text-ink-2">
          Você completou toda a jornada e o seu acesso ao curso terminou{em ? ` em ${new Date(em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : ""}. Agora é com você: chegue confiante na seleção. Boa sorte! ✈️
        </p>
        <Link href="/certificado/novo/head-hunter" className="inline-flex min-h-12 items-center rounded-xl bg-navy px-6 font-semibold text-white hover:bg-navy-deep">🎓 Baixar meu certificado</Link>
        <p className="text-[15px] text-muted">Quer revisar tudo antes da prova? Você pode comprar um novo acesso.</p>
        <Link href="/comprar/head-hunter" className="inline-flex min-h-12 items-center rounded-xl border-2 border-navy px-6 font-semibold text-navy hover:bg-navy hover:text-white">Comprar novo acesso</Link>
      </div>
    </main>
  );
}
