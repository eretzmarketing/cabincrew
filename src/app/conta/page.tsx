import { listaEscolas } from "@/lib/escolas-dados";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sair } from "@/app/actions";
import AvatarForm from "@/components/AvatarForm";
import ExcluirContaForm from "@/components/ExcluirContaForm";
import { NovaSenhaForm, PerfilForm } from "@/components/forms";
import { CURSOS_CERT } from "@/lib/certificados";
import { FORMAS, STATUS_COMPRA } from "@/lib/compras";
import { nomesCursos } from "@/lib/cursos-dados";
import { resumoAluno, type CursoAluno } from "@/lib/painel-aluno";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };
export const dynamic = "force-dynamic";

const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SITUACAO: Record<CursoAluno["situacao"], { rotulo: string; cor: string }> = {
  ativo: { rotulo: "Em andamento", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  revisao: { rotulo: "Concluído", cor: "bg-[#eef1ff] text-navy" },
  encerrado: { rotulo: "Acesso encerrado", cor: "bg-[#eceef3] text-ink-2" },
  suspenso: { rotulo: "Suspenso", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  sem: { rotulo: "", cor: "" },
};

function CardCurso({ c }: { c: CursoAluno }) {
  const tem = c.situacao !== "sem";
  const pct = c.total ? Math.round((c.feitas / c.total) * 100) : 0;
  const pode = c.situacao === "ativo" || c.situacao === "revisao";
  return (
    <li className={`flex flex-col overflow-hidden rounded-[20px] border bg-white ${tem ? "border-line" : "border-dashed border-[#c9cedb]"}`}>
      <div className="relative h-28 bg-navy">
        {c.imagem && <Image src={c.imagem} alt="" fill sizes="(min-width: 768px) 300px, 100vw" className={`object-cover ${tem ? "" : "opacity-60 grayscale"}`} />}
        {tem && <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px] font-bold ${SITUACAO[c.situacao].cor}`}>{SITUACAO[c.situacao].rotulo}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <strong className="font-display text-[17px] leading-snug">{c.titulo}</strong>
        {tem ? (
          <>
            {c.total > 0 && (
              <div className="flex flex-col gap-1">
                <span className="flex justify-between text-[13px] text-ink-2"><span>{c.feitas} de {c.total} aulas</span><strong className="text-navy">{pct}%</strong></span>
                <span className="h-2 rounded-full bg-[#eceef3]" aria-hidden="true"><span className="block h-2 rounded-full bg-brand-strong" style={{ width: `${pct}%` }} /></span>
              </div>
            )}
            <span className="text-[13px] text-muted">
              {c.situacao === "revisao" && c.expira ? `Concluído em ${data(c.concluido)} · revisão até ${data(c.expira)}`
                : c.situacao === "ativo" ? (c.expira ? `Acesso até ${data(c.expira)}` : "Acesso até concluir o curso")
                : c.situacao === "encerrado" ? `Encerrado em ${data(c.expira)}`
                : "Acesso pausado. Fale com o suporte."}
            </span>
            <div className="mt-auto pt-1">
              {pode
                ? <Link href={c.endereco} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-strong px-4 font-display font-bold text-white hover:bg-brand-deep">{c.feitas ? "Continuar" : "Começar"}</Link>
                : <Link href={c.situacao === "suspenso" ? "/conta/suporte" : "/planos"} className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-navy px-4 font-semibold text-navy hover:bg-navy hover:text-white">{c.situacao === "suspenso" ? "Falar com o suporte" : "Comprar de novo"}</Link>}
            </div>
          </>
        ) : (
          <>
            <span className="line-clamp-2 text-[14px] text-ink-2">{c.descricao}</span>
            <Link href={c.endereco} className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border-2 border-line px-4 font-semibold text-navy hover:border-navy">Conhecer</Link>
          </>
        )}
      </div>
    </li>
  );
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: string | number; detalhe?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3.5">
      <span className="text-[13px] text-muted">{rotulo}</span>
      <strong className="font-display text-[26px] leading-tight font-extrabold">{valor}</strong>
      {detalhe && <span className="text-[12px] text-muted">{detalhe}</span>}
    </div>
  );
}

const secao = "flex scroll-mt-6 flex-col gap-4";
const h2 = "font-display text-[22px] font-extrabold";

export default async function ContaPage({ searchParams }: { searchParams: Promise<{ foto?: string; next?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) redirect("/entrar?modo=entrar&next=/conta");

  const voltar = sp.next?.startsWith("/head-hunter") ? sp.next : sp.foto ? "/head-hunter" : null;
  const [r, nomesCert, { data: certs }, { data: pedidosLoja }, { count: chamados }] = await Promise.all([
    resumoAluno(supabase, user.id),
    nomesCursos(),
    supabase.from("certificados").select("codigo, curso, concluido_em").eq("user_id", user.id).eq("revogado", false),
    supabase.from("loja_pedidos").select("id, status, total, criado_em").eq("user_id", user.id).neq("status", "aguardando").order("criado_em", { ascending: false }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "aberto").eq("aguardando", "aluno"),
  ]);
  const meus = r.cursos.filter((c) => c.situacao !== "sem");
  const outros = r.cursos.filter((c) => c.situacao === "sem");
  const pedidos = (pedidosLoja ?? []) as { id: number; status: string; total: number | null; criado_em: string }[];
  const primeiroNome = (profile.nome ?? profile.apelido).split(" ")[0];
  const iniciais = (profile.nome ?? profile.apelido).split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("");
  const precisaFoto = !!sp.foto && !profile.avatar_em;

  const fotoSecao = (
    <section id="foto" className="flex scroll-mt-6 flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold">Foto de perfil</h2>
        <p className="text-[15px] text-ink-2">Obrigatória para usar o Head Hunter e os simulados.</p>
      </div>
      <AvatarForm atual={avatarUrl(user.id, profile.avatar_em)} iniciais={iniciais} obrigatoria={precisaFoto} />
      {profile.avatar_em && voltar && (
        <Link href={voltar} className="inline-flex min-h-12 items-center self-start rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">Continuar para o Head Hunter →</Link>
      )}
    </section>
  );

  return (
    <main className="bg-soft pb-16">
      {/* topo */}
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-5 px-6 py-8">
          {profile.avatar_em
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl(user.id, profile.avatar_em) ?? ""} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-white/20" />
            : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 font-display text-xl font-bold">{iniciais}</span>}
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="font-display text-[28px] leading-tight font-extrabold md:text-[32px]">Olá, {primeiroNome}!</h1>
            <span className="truncate text-[15px] text-[#c9cedb]">{user.email}</span>
          </div>
          <nav aria-label="Atalhos da conta" className="flex flex-wrap gap-2 text-[14px] font-semibold">
            <a href="#cursos" className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 hover:bg-white/20">Cursos</a>
            <a href="#compras" className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 hover:bg-white/20">Compras</a>
            <Link href="/conta/suporte" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 hover:bg-white/20">
              Suporte {(chamados ?? 0) > 0 && <span className="rounded-full bg-brand-strong px-2 text-[12px]">{chamados}</span>}
            </Link>
            <a href="#dados" className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 hover:bg-white/20">Meus dados</a>
          </nav>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1040px] flex-col gap-10 px-4 pt-8 md:px-6">
        {precisaFoto && fotoSecao}

        {(chamados ?? 0) > 0 && (
          <Link href="/conta/suporte?aba=meus" className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-brand-line bg-white px-5 hover:border-brand">
            <span className="font-semibold">💬 {chamados === 1 ? "Seu chamado de suporte foi respondido" : `${chamados} chamados de suporte respondidos`}</span>
            <span className="text-[14px] font-semibold text-brand-strong">Ver resposta →</span>
          </Link>
        )}

        {/* cursos */}
        <section id="cursos" className={secao}>
          <h2 className={h2}>Meus cursos</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meus.map((c) => <CardCurso key={c.slug} c={c} />)}
            <li className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
              <span className="self-start rounded-full bg-[#e5f6ec] px-2.5 py-1 text-[12px] font-bold text-[#0f6b3a]">Grátis na sua conta</span>
              <strong className="font-display text-[17px] leading-snug">Simulados da banca ANAC</strong>
              <span className="text-[14px] text-ink-2">Treine para a prova teórica quantas vezes quiser, com gabarito comentado.</span>
              <Link href="/simulados-anac" className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-brand-strong px-4 font-display font-bold text-white hover:bg-brand-deep">Fazer simulado</Link>
            </li>
          </ul>
          {outros.length > 0 && (
            <>
              <h3 className="pt-2 font-display text-lg font-bold text-ink-2">Outros cursos da Cabin Crew</h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{outros.map((c) => <CardCurso key={c.slug} c={c} />)}</ul>
            </>
          )}
        </section>

        {/* atividades */}
        <section className={secao}>
          <h2 className={h2}>Resumo das atividades</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Numero rotulo="Aulas concluídas" valor={r.aulasFeitas} />
            <Numero rotulo="Simulados e treinos feitos" valor={r.simulados.feitos} />
            <Numero rotulo="Nota média" valor={r.simulados.media === null ? "—" : `${r.simulados.media}%`} detalhe={r.simulados.melhor === null ? undefined : `melhor nota: ${r.simulados.melhor}%`} />
            <Numero rotulo="Pontos" valor={profile.pontos ?? 0} />
            {r.sequencia !== null && <Numero rotulo="Sequência de estudo" valor={`${r.sequencia} ${r.sequencia === 1 ? "dia" : "dias"}`} />}
            {r.medalhas && <Numero rotulo="Medalhas" valor={`${r.medalhas.ganhas} de ${r.medalhas.total}`} />}
            {r.ia?.video !== null && r.ia?.video !== undefined && <Numero rotulo="Análises de vídeo (IA)" valor={r.ia.video} detalhe="disponíveis" />}
            {r.ia?.curriculo !== null && r.ia?.curriculo !== undefined && <Numero rotulo="Análises de currículo (IA)" valor={r.ia.curriculo} detalhe="disponíveis" />}
          </div>
          {r.medalhas && r.medalhas.lista.length > 0 && (
            <p className="rounded-2xl border border-line bg-white px-5 py-3.5 text-[15px] text-ink-2"><strong className="text-navy">Suas medalhas: </strong>{r.medalhas.lista.join(" · ")}</p>
          )}
        </section>

        {/* certificados */}
        {(certs ?? []).length > 0 && (
          <section className={secao}>
            <h2 className={h2}>Certificados</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {((certs ?? []) as { codigo: string; curso: string; concluido_em: string }[]).map((c) => (
                <li key={c.codigo}>
                  <Link href={`/certificado/${c.codigo}`} className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 hover:border-navy">
                    <span className="font-semibold">🎓 {nomesCert[c.curso] ?? CURSOS_CERT[c.curso] ?? c.curso}</span>
                    <span className="text-[14px] text-muted">{data(c.concluido_em)} · abrir</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* compras */}
        <section id="compras" className={secao}>
          <h2 className={h2}>Minhas compras</h2>
          {r.compras.length === 0 && pedidos.length === 0 ? (
            <p className="rounded-[20px] border border-line bg-white p-6 text-ink-2">Nenhuma compra ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {r.compras.map((c) => {
                const st = STATUS_COMPRA[c.status];
                return (
                  <li key={`c-${c.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-white px-5 py-3.5">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="font-semibold">{c.produto}</strong>
                      <span className="text-[13px] text-muted">
                        {data(c.comprada_em)}
                        {c.valor > 0 ? ` · ${c.forma_pagamento ? FORMAS[c.forma_pagamento] ?? c.forma_pagamento : c.plataforma ?? ""}${c.parcelas && c.parcelas > 1 ? ` em ${c.parcelas}x` : ""}` : " · cortesia"}
                      </span>
                    </span>
                    <strong className="font-display">{c.valor > 0 ? brl(c.valor) : "—"}</strong>
                    {st && <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${st.cor}`}>{st.rotulo}</span>}
                  </li>
                );
              })}
              {pedidos.length > 0 && (
                <li>
                  <Link href="/conta/pedidos" className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 hover:border-navy">
                    <span className="font-semibold">📦 Apostilas impressas: {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}</span>
                    <span className="text-[14px] text-muted">acompanhar entrega →</span>
                  </Link>
                </li>
              )}
            </ul>
          )}
          <p className="text-[13px] text-muted">Precisa de nota, reembolso ou ajuda com um pagamento? <Link href="/conta/suporte?aba=novo" className="font-semibold text-navy underline">Abra um chamado</Link>.</p>
        </section>

        {/* conta */}
        <section id="dados" className={secao}>
          <h2 className={h2}>Meus dados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {!precisaFoto && fotoSecao}
            <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-xl font-bold">Dados pessoais</h3>
                <p className="text-[15px] text-ink-2">E-mail: <strong className="text-navy">{user.email}</strong></p>
              </div>
              <PerfilForm p={profile} escolas={await listaEscolas()} />
            </section>
            <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
              <h3 className="font-display text-xl font-bold">Trocar senha</h3>
              <NovaSenhaForm />
            </section>
            {!profile.is_admin && (
              <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6">
                <h3 className="font-display text-xl font-bold">Excluir conta</h3>
                <p className="text-[15px] text-ink-2">Apaga sua conta e todos os seus dados da Cabin Crew.</p>
                <ExcluirContaForm />
              </section>
            )}
          </div>
          <form action={sair}>
            <button type="submit" className="min-h-11 cursor-pointer rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">Sair da conta</button>
          </form>
        </section>
      </div>
    </main>
  );
}
