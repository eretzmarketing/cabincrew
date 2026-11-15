import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Arrow, Check } from "@/components/icons";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "Cabin Crew · A maior plataforma preparatória para seleções de comissários de voo do Brasil" },
  description: "Simulados da banca ANAC grátis, preparatório para LATAM, GOL e Azul, testes SHL, dinâmicas de grupo e análise do vídeo de apresentação e da entrevista com inteligência artificial.",
  alternates: { canonical: "/" },
};

/* ------------------------------------------------------------------ peças */

const btnPrim = "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand-strong px-8 font-display text-[17px] font-bold text-white shadow-[0_10px_30px_-10px_rgba(209,0,48,.7)] transition hover:bg-brand-deep";
const btnClaro = "inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-white/35 px-7 font-display text-[16px] font-bold text-white transition hover:border-white hover:bg-white/10";
const btnNavy = "inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-navy px-7 font-display text-[16px] font-bold text-navy transition hover:bg-navy hover:text-white";

/** Print da plataforma numa “janela” de navegador. */
function Tela({ src, alt, prioridade = false, className = "", altura = 875 }: { src: string; alt: string; prioridade?: boolean; className?: string; altura?: number }) {
  return (
    <figure className={`overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_30px_70px_-30px_rgba(35,42,61,.55)] ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-line bg-[#f3f4f8] px-4" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 hidden h-5 flex-1 max-w-[260px] items-center rounded-md bg-white px-3 text-[11px] text-muted sm:flex">cabincrew.com.br</span>
      </div>
      <Image src={src} alt={alt} width={1400} height={altura} priority={prioridade} sizes="(min-width: 1024px) 640px, 100vw" className="block h-auto w-full" />
    </figure>
  );
}

function Celular({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[30px] border-[7px] border-navy-deep bg-navy-deep shadow-[0_30px_60px_-25px_rgba(35,42,61,.7)] ${className}`}>
      <Image src={src} alt={alt} width={560} height={953} sizes="220px" className="block h-auto w-full rounded-[22px]" />
    </div>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {itens.map((t) => (
        <li key={t} className="flex gap-3 text-[16px] leading-snug text-ink-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5f6ec] text-[#0f6b3a]"><Check size={15} /></span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

type Servico = { num: string; selo?: string; titulo: string; texto: string; itens: string[]; img: string; alt: string; img2?: string; alt2?: string };

const SERVICOS: Servico[] = [
  {
    num: "01", selo: "Grátis", titulo: "Simulados para a banca ANAC",
    texto: "Treine para a prova teórica de comissário como se fosse o dia da prova. É só criar a conta: sem pagar nada e sem limite de tentativas.",
    itens: ["Questões no estilo da banca ANAC, com explicação", "4 blocos: Segurança, Legislação, Primeiros Socorros e Conhecimentos Técnicos", "Prova completa com 80 questões, cronômetro e nota mínima de 70%", "Gabarito comentado e desempenho por bloco"],
    img: "/img/lp/anac.webp", alt: "Tela dos Simulados ANAC com estudo por bloco e prova completa", img2: "/img/lp/anac-prova.webp", alt2: "Prova da ANAC em andamento com cronômetro",
  },
  {
    num: "02", titulo: "Preparatório para as principais companhias aéreas",
    texto: "Cada companhia faz a seleção de um jeito. No Head Hunter você escolhe a sua (LATAM, GOL ou Azul) e a plataforma monta o seu plano de voo na ordem real do processo dela.",
    itens: ["Jornada em 7 etapas, da inscrição à admissão", "Missão do dia: 30 minutos de estudo sem precisar pensar no que fazer", "13 módulos e 83 aulas, com versão em áudio", "Contagem regressiva para a data da sua seleção"],
    img: "/img/lp/jornada.webp", alt: "Jornada do Head Hunter com a missão do dia e as etapas da seleção",
  },
  {
    num: "03", titulo: "Testes SHL e testes online",
    texto: "Os testes online são o filtro que mais elimina candidatos, e quase ninguém treina. Aqui você pratica no mesmo estilo dos testes que as companhias aplicam.",
    itens: ["Raciocínio lógico, numérico e verbal", "Português, inglês e julgamento situacional (SJT)", "Treino do perfil comportamental com alerta de respostas incoerentes", "Correção na hora, priorizando o que você errou"],
    img: "/img/lp/testes-online.webp", alt: "Módulo de testes online", img2: "/img/lp/perfil.webp", alt2: "Treino do perfil comportamental",
  },
  {
    num: "04", titulo: "Dinâmicas de grupo",
    texto: "Na dinâmica, o recrutador observa como você se comporta em equipe. Saiba o que ele está avaliando antes de entrar na sala.",
    itens: ["Os tipos de dinâmica usados nas seleções de comissário", "O que o avaliador observa e o que elimina na hora", "Como liderar sem dominar e participar sem sumir", "Situações de cabine para treinar o raciocínio de atendimento"],
    img: "/img/crew-select.jpg", alt: "Tripulação de comissários de voo",
  },
  {
    num: "05", selo: "Com inteligência artificial", titulo: "Análise de entrevista e do vídeo de apresentação",
    texto: "Grave a sua apresentação com o roteiro na tela e receba, em cerca de 1 minuto, a avaliação de uma IA treinada com os critérios dos recrutadores.",
    itens: ["Nota de 0 a 100 em 11 critérios: conteúdo, comunicação e imagem", "Olhar para a câmera, ritmo da fala e vícios como “né” e “tipo”", "Perguntas reais de entrevista em inglês, com áudio e respostas-modelo", "Simulação de entrevista com perguntas sorteadas e cronômetro"],
    img: "/img/lp/video-ia.webp", alt: "Feedback da inteligência artificial sobre o vídeo de apresentação", img2: "/img/lp/entrevista.webp", alt2: "Treino de entrevista em inglês",
  },
];

const FAQ: [string, string][] = [
  ["Preciso pagar para começar?", "Não. Os simulados da banca ANAC são grátis: crie a conta e comece a treinar hoje. O preparatório completo (Head Hunter) e os cursos de idioma são pagos, e você escolhe o plano quando quiser."],
  ["Serve para quem ainda está fazendo o curso de comissário?", "Sim. Comece pelos simulados da ANAC para a prova teórica. Quando a seleção das companhias estiver perto, o Head Hunter leva você por todas as etapas."],
  ["Funciona no celular?", "Sim, tudo funciona no celular sem instalar aplicativo, inclusive os simulados e a gravação do vídeo de apresentação."],
  ["Tem certificado?", "Sim. Ao concluir o curso você emite o certificado com carga horária e código de autenticação, pronto para o LinkedIn."],
  ["E se eu não gostar?", "Você tem 7 dias de garantia: se achar que não é para você, devolvemos o valor."],
];

/* ------------------------------------------------------------------ página */

export default async function Home() {
  const { user, profile } = await getUser();
  // alunos logados vão direto para o painel; o administrador vê a página para conferir
  if (user && !profile?.is_admin) redirect("/head-hunter");

  return (
    <main className="overflow-x-clip">
      {/* HERO */}
      <section className="relative bg-navy-deep text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(239,0,54,.28),transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(83,98,140,.45),transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[14px] font-semibold text-[#ffd3dd]">✈︎ LATAM · GOL · Azul</span>
            <h1 className="font-display text-[36px] leading-[1.08] font-extrabold tracking-[-0.02em] sm:text-[46px] lg:text-[54px]">
              A maior plataforma preparatória para seleções de <span className="text-[#ff4d74]">comissários de voo</span> do Brasil
            </h1>
            <p className="max-w-[560px] text-[18px] leading-relaxed text-[#d7dbe6]">
              Da prova da ANAC à entrevista final: treine cada etapa da seleção, na ordem da companhia que você escolheu, com correção na hora e feedback de inteligência artificial.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/entrar?modo=cadastro" className={btnPrim}>Começar grátis <Arrow /></Link>
              <Link href="/planos" className={btnClaro}>Ver planos</Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#c4c9d8]">
              <li className="flex items-center gap-2"><span className="text-[#7ee2a8]"><Check size={16} /></span>Simulados ANAC grátis</li>
              <li className="flex items-center gap-2"><span className="text-[#7ee2a8]"><Check size={16} /></span>Sem cartão para começar</li>
              <li className="flex items-center gap-2"><span className="text-[#7ee2a8]"><Check size={16} /></span>Garantia de 7 dias</li>
            </ul>
          </div>
          <div className="relative pb-10 lg:pb-0">
            <Tela src="/img/lp/painel.webp" alt="Painel do aluno no Head Hunter com a jornada e o progresso" prioridade />
            <Celular src="/img/lp/cel-missao.webp" alt="Missão do dia no celular" className="absolute -bottom-2 -left-3 w-[30%] max-w-[190px] sm:-left-8 lg:-bottom-14" />
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="border-b border-line bg-white">
        <dl className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-4">
          {[["3", "companhias: LATAM, GOL e Azul"], ["7", "etapas da seleção cobertas"], ["11", "critérios na análise de IA"], ["7 dias", "de garantia"]].map(([n, t]) => (
            <div key={t} className="flex flex-col items-center gap-1 text-center">
              <dt className="order-2 text-[15px] text-ink-2">{t}</dt>
              <dd className="order-1 font-display text-[34px] leading-none font-extrabold text-brand-strong md:text-[40px]">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* PROBLEMA */}
      <section className="bg-soft">
        <div className="mx-auto flex max-w-[860px] flex-col items-center gap-5 px-6 py-20 text-center">
          <span className="font-display text-[14px] font-bold tracking-[.14em] text-brand-strong uppercase">Por que tanta gente é eliminada</span>
          <h2 className="font-display text-[30px] leading-tight font-extrabold md:text-[40px]">A seleção não é uma prova só. É um funil, e você pode cair em qualquer etapa.</h2>
          <p className="text-[18px] leading-relaxed text-ink-2">Prova técnica, testes online, dinâmica, vídeo, entrevista em inglês… A maioria dos candidatos estuda só para a ANAC e é eliminada nos testes ou na entrevista. Na Cabin Crew você se prepara para <strong className="text-navy">todas</strong> as etapas.</p>
          <ol className="mt-4 flex flex-wrap justify-center gap-2">
            {["Inscrição", "Prova ANAC", "Testes SHL", "Dinâmica", "Vídeo", "Entrevistas", "Aprovação ✈︎"].map((e, i, a) => (
              <li key={e} className={`flex items-center gap-2 rounded-full px-4 py-2 font-display text-[14px] font-bold ${i === a.length - 1 ? "bg-brand-strong text-white" : "border border-line bg-white text-navy"}`}>
                {i < a.length - 1 && <span className="text-[12px] text-muted">{i + 1}</span>}{e}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-24 px-6 py-24">
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 text-center">
            <span className="font-display text-[14px] font-bold tracking-[.14em] text-brand-strong uppercase">O que você encontra</span>
            <h2 className="font-display text-[30px] leading-tight font-extrabold md:text-[40px]">Tudo o que você precisa para passar, em um só lugar</h2>
          </div>
          {SERVICOS.map((s, i) => (
            <article key={s.num} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={`flex flex-col gap-5 ${i % 2 ? "lg:order-2" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-[15px] font-extrabold text-brand-strong">{s.num}</span>
                  {s.selo && <span className="rounded-full bg-brand-soft px-3 py-1 text-[13px] font-bold text-brand-deep">{s.selo}</span>}
                </div>
                <h3 className="font-display text-[28px] leading-tight font-extrabold md:text-[34px]">{s.titulo}</h3>
                <p className="text-[17px] leading-relaxed text-ink-2">{s.texto}</p>
                <Lista itens={s.itens} />
              </div>
              <div className={`relative ${i % 2 ? "lg:order-1" : ""} ${s.img2 ? "pb-16 sm:pb-24" : ""}`}>
                {s.img.endsWith(".jpg") ? (
                  <div className="relative overflow-hidden rounded-[24px] shadow-[0_30px_70px_-30px_rgba(35,42,61,.55)]">
                    <Image src={s.img} alt={s.alt} width={600} height={900} sizes="(min-width: 1024px) 560px, 100vw" className="h-[340px] w-full object-cover object-[center_30%] md:h-[420px]" />
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:right-5 sm:w-[300px]">
                      <p className="font-display text-[15px] font-extrabold">O que o avaliador observa</p>
                      <ul className="mt-2 flex flex-col gap-1 text-[14px] text-ink-2">
                        <li>✓ Escuta e respeito à vez do outro</li><li>✓ Postura e comunicação</li><li>✓ Foco no cliente e na segurança</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Tela src={s.img} alt={s.alt} altura={s.img.includes("video-ia") ? 1200 : 875} />
                )}
                {s.img2 && (
                  <Tela src={s.img2} alt={s.alt2 ?? ""} className={`absolute bottom-0 w-[62%] ${i % 2 ? "-left-2 sm:-left-6" : "-right-2 sm:-right-6"}`} />
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="font-display text-[14px] font-bold tracking-[.14em] text-[#ff8aa5] uppercase">Como funciona</span>
              <h2 className="font-display text-[30px] leading-tight font-extrabold md:text-[40px]">Do cadastro à aprovação, em 3 passos</h2>
            </div>
            <ol className="flex flex-col gap-6">
              {[
                ["Crie sua conta grátis", "Em menos de um minuto você já faz o primeiro simulado da ANAC e descobre o seu nível."],
                ["Escolha a sua companhia", "No Head Hunter, informe a companhia e a data da seleção: o seu plano de voo é montado na hora."],
                ["Treine todos os dias", "Siga a Missão do dia, suba no ranking, grave o seu vídeo e chegue à seleção preparado(a)."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-strong font-display text-[20px] font-extrabold">{i + 1}</span>
                  <div className="flex flex-col gap-1"><strong className="font-display text-[20px]">{t}</strong><p className="text-[16px] leading-relaxed text-[#d7dbe6]">{d}</p></div>
                </li>
              ))}
            </ol>
            <p className="text-[15px] text-[#c4c9d8]">📱 Funciona no computador e no celular, sem instalar nada.</p>
          </div>
          <div className="flex items-end justify-center gap-4">
            <Celular src="/img/lp/cel-anac.webp" alt="Simulados ANAC no celular" className="w-[31%] max-w-[210px] translate-y-6" />
            <Celular src="/img/lp/cel-painel.webp" alt="Painel do Head Hunter no celular" className="w-[35%] max-w-[230px]" />
            <Celular src="/img/lp/cel-missao.webp" alt="Missão do dia no celular" className="w-[31%] max-w-[210px] translate-y-6" />
          </div>
        </div>
      </section>

      {/* GARANTIA + FAQ */}
      <section className="bg-soft">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-5">
            <span className="font-display text-[14px] font-bold tracking-[.14em] text-brand-strong uppercase">Dúvidas</span>
            <h2 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">Perguntas frequentes</h2>
            <div className="flex gap-4 rounded-[20px] border border-line bg-white p-6">
              <span className="text-3xl" aria-hidden="true">🛡️</span>
              <div className="flex flex-col gap-1">
                <strong className="font-display text-[18px]">Garantia de 7 dias</strong>
                <p className="text-[15px] leading-relaxed text-ink-2">Entrou e achou que não é para você? Devolvemos o valor, sem burocracia.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {FAQ.map(([p, r]) => (
              <details key={p} className="group rounded-[18px] border border-line bg-white px-6 py-1 open:pb-5">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                  {p}<span className="text-2xl text-brand-strong transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="text-[16px] leading-relaxed text-ink-2">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="relative overflow-hidden rounded-[32px] bg-navy-deep px-6 py-16 text-center text-white md:px-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_90%_at_50%_0%,rgba(239,0,54,.35),transparent_70%)]" aria-hidden="true" />
            <div className="relative mx-auto flex max-w-[680px] flex-col items-center gap-6">
              <h2 className="font-display text-[30px] leading-tight font-extrabold md:text-[42px]">A sua vaga na cabine começa com o primeiro simulado</h2>
              <p className="text-[18px] text-[#d7dbe6]">Crie sua conta grátis agora e descubra em minutos o quanto falta para você ser aprovado(a).</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/entrar?modo=cadastro" className={btnPrim}>Criar conta grátis <Arrow /></Link>
                <Link href="/planos" className={`${btnNavy} border-white/35 text-white hover:border-white hover:bg-white/10`}>Ver planos</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
