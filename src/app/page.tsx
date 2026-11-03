import Image from "next/image";
import Link from "next/link";
import SelecaoCard from "@/components/SelecaoCard";
import { ListaEsperaForm } from "@/components/forms";
import { Arrow, Chat, Check, Lock, Search, Shield, Star, User } from "@/components/icons";
import { FASES, type Selecao } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("selecoes_resumo")
    .select("*")
    .neq("status", "encerrada")
    .order("ultimo_relato", { ascending: false, nullsFirst: false })
    .limit(3);
  const selecoes = (data ?? []) as Selecao[];

  return (
    <main>
      {/* Hero */}
      {/* No celular, a foto aparece inteira acima do texto */}
      <div className="relative h-72 md:hidden">
        <Image src="/img/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[22%_30%]" />
      </div>
      <section className="relative isolate flex items-center overflow-hidden md:min-h-[640px]">
        <Image src="/img/hero.jpg" alt="" fill priority sizes="100vw" className="-z-20 hidden object-cover object-left md:block" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(255,255,255,0)_30%,rgba(255,255,255,.88)_52%,rgba(255,255,255,.96)_100%)] md:block"
        />
        <div className="mx-auto flex w-full max-w-[1200px] justify-end px-6 pt-10 pb-16 md:py-[72px]">
          <div className="flex max-w-[560px] flex-col gap-6">
            <span className="self-start rounded-full bg-[#ffe5ec] px-3.5 py-2 font-display text-[13px] font-bold tracking-[.08em] text-[#b0002a] uppercase">
              A comunidade de quem quer voar
            </span>
            <h1 className="font-display text-[38px] leading-[1.08] font-extrabold tracking-[-0.02em] md:text-[52px]">
              Cada seleção de comissário, fase a fase, contada por quem está participando.
            </h1>
            <p className="text-lg leading-relaxed text-ink-2 md:text-[19px]">
              Saiba quem já foi chamado, como foi a dinâmica de ontem e quanto tempo leva até a próxima etapa. Relatos organizados
              por companhia, processo e fase, num só lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/forum" className="inline-flex items-center gap-2.5 rounded-full bg-brand-strong px-7 py-4 font-display text-base font-bold text-white hover:bg-brand-deep">
                Ver seleções abertas <Arrow />
              </Link>
              <Link href="/forum" className="inline-flex items-center rounded-full border-2 border-navy bg-white px-[26px] py-3.5 font-display text-base font-bold text-navy hover:bg-navy hover:text-white">
                Relatar minha seleção
              </Link>
            </div>
            <p className="text-sm text-muted">Gratuito. Sem cartão. Relatos moderados e sem questões de provas.</p>
          </div>
        </div>
      </section>

      {/* Seleções em andamento */}
      <section className="bg-soft px-6 py-[88px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <h2 className="font-display text-[32px] font-extrabold tracking-[-0.01em] md:text-4xl">Seleções em andamento</h2>
              <p className="text-[17px] text-ink-2">Acompanhe o que os candidatos estão relatando.</p>
            </div>
            <Link href="/forum" className="py-3 font-display text-[15px] font-bold text-brand-strong hover:text-brand-deep">
              Ver todas as seleções →
            </Link>
          </div>
          {selecoes.length ? (
            <div className="flex flex-wrap gap-6">
              {selecoes.map((s) => <SelecaoCard key={s.id} s={s} />)}
            </div>
          ) : (
            <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">
              Nenhuma seleção aberta no momento. Volte em breve.
            </p>
          )}
        </div>
      </section>

      {/* Fases */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
          <div className="flex max-w-[720px] flex-col gap-3">
            <span className="font-display text-[13px] font-bold tracking-[.1em] text-[#b0002a] uppercase">Como o fórum é organizado</span>
            <h2 className="font-display text-[32px] font-extrabold tracking-[-0.01em] md:text-4xl">Os relatos seguem as fases reais da seleção.</h2>
            <p className="text-[17px] leading-relaxed text-ink-2">
              Você vai direto para a etapa em que está e lê só o que importa agora: como foi, quanto durou, quantas pessoas
              participaram e quem já avançou.
            </p>
          </div>
          <ol className="flex flex-wrap gap-3">
            {FASES.map((f) => (
              <li key={f.id} className="flex flex-[1_1_150px] flex-col gap-2.5 rounded-2xl border border-line p-5">
                <span className="font-display text-[28px] font-extrabold text-brand">{String(f.id).padStart(2, "0")}</span>
                <span className="text-base font-semibold">{f.nome}</span>
                <span className="text-sm text-muted">{f.descricao}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-white px-6 pb-24">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-6">
          {[
            { icon: <Search color="#d10030" />, t: "Encontre a sua seleção", d: "Filtre por companhia. Cada processo seletivo tem uma página própria com a linha do tempo de todas as fases." },
            { icon: <Chat color="#d10030" />, t: "Leia relatos comparáveis", d: "Todo relato tem os mesmos campos: fase, base, data, formato e resultado. Dá para comparar experiências sem garimpar grupos de WhatsApp." },
            { icon: <Star color="#d10030" />, t: "Conte e ganhe pontos", d: "Relatos confirmados por outros candidatos recebem o selo de verificado e somam pontos para você." },
          ].map((c) => (
            <div key={c.t} className="flex flex-[1_1_300px] flex-col gap-3.5 rounded-[20px] bg-soft p-8">
              {c.icon}
              <h3 className="font-display text-[21px] font-bold">{c.t}</h3>
              <p className="text-base leading-relaxed text-ink-2">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Crew Select */}
      <section id="crew-select" className="scroll-mt-4 bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-stretch">
          <div className="relative hidden min-h-[560px] flex-[1_1_380px] md:block">
            <Image src="/img/crew-select.jpg" alt="Comissária com mala de bordo no aeroporto" fill sizes="(min-width: 768px) 40vw, 0px" className="object-cover object-[center_20%]" />
          </div>
          <div className="flex flex-[999_1_480px] flex-col gap-6 px-6 py-20 md:px-12 md:py-[88px]">
            <span className="self-start rounded-full bg-brand px-3.5 py-2 font-display text-[13px] font-bold tracking-[.08em] uppercase">Em breve</span>
            <h2 className="font-display text-[32px] leading-[1.12] font-extrabold tracking-[-0.01em] md:text-[40px]">
              Crew Select: o preparatório que acompanha a sua seleção.
            </h2>
            <p className="text-lg leading-relaxed text-[#d7dbe6]">
              Diga em qual processo você está e em qual fase. O Crew Select monta seu plano de treino até a próxima etapa, com
              base no que os relatos mostram que está sendo cobrado.
            </p>
            <ul className="flex flex-col gap-3.5 text-base">
              {[
                "13 módulos na ordem das fases, do diagnóstico à admissão",
                "Entrevista com IA em português e inglês, simulados e dinâmicas ao vivo",
                "Assinatura que encerra automaticamente quando você conclui",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3"><Check color="#ff5c7f" className="shrink-0" /> {t}</li>
              ))}
            </ul>
            <ListaEsperaForm />
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section className="bg-white px-6 py-[88px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-9">
          <h2 className="text-center font-display text-[32px] font-extrabold">Um fórum em que dá para confiar</h2>
          <div className="flex flex-wrap gap-8">
            {[
              { icon: <Shield />, t: "Relatos verificados", d: "Conta obrigatória e confirmação por outros candidatos da mesma fase." },
              { icon: <Lock />, t: "Sem questões de provas", d: "Falamos de formato e experiência, nunca do conteúdo sigiloso dos testes." },
              { icon: <User />, t: "Publique como anônimo", d: "Seu nome nunca aparece para outros candidatos, se você preferir." },
            ].map((c) => (
              <div key={c.t} className="flex flex-[1_1_260px] items-start gap-4">
                <span className="shrink-0">{c.icon}</span>
                <div className="flex flex-col gap-1.5">
                  <strong className="font-display text-[17px]">{c.t}</strong>
                  <span className="text-[15px] leading-relaxed text-ink-2">{c.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
