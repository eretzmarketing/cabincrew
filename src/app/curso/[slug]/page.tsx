import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Arrow, Check } from "@/components/icons";
import { dataBR, exigirCurso, revisaoAte } from "@/lib/crew-gate";
import { TIPO_AULA, duracao, numeroModulo, type Modulo } from "@/lib/crew";
import { infoCurso, type InfoCurso } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Prod = { preco: number; desconto_pix: number; ativo: boolean; dias_apos_conclusao: number | null; topicos: string[] | null } | null;
const reais = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Curso visível? Rascunho só o admin vê; os cursos originais têm endereço próprio. */
async function carregar(slug: string) {
  const info = await infoCurso(slug);
  if (!info) notFound();
  if (info.tipo !== "padrao") redirect(info.endereco);
  const { profile } = await getUser();
  if (!info.publicado && !profile?.is_admin) notFound();
  return info;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const info = await infoCurso((await params).slug);
  return info ? { title: info.titulo, description: info.descricao.slice(0, 160) } : { title: "Curso" };
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = await carregar(slug);
  const { user, supabase } = await getUser();
  const { data: prod } = await supabase.from("produtos").select("preco, desconto_pix, ativo, dias_apos_conclusao, topicos").eq("slug", slug).maybeSingle();
  if (!user) return <Venda info={info} prod={prod as Prod} />;

  const ctx = await exigirCurso(slug, info.endereco);
  if (!ctx.liberado) return <Venda info={info} prod={prod as Prod} encerrado={ctx.encerrado ? ctx.acesso?.expira_em ?? ctx.acesso?.encerrado_em ?? null : null} />;

  const [{ data: mods }, { data: aulas }, { data: feitas }] = await Promise.all([
    ctx.supabase.from("modulos").select("*").eq("curso", slug).eq("publicado", true).order("ordem"),
    ctx.supabase.from("aulas").select("id, modulo_id, ordem, titulo, tipo, duracao_min").eq("curso", slug).eq("publicado", true).order("ordem"),
    ctx.supabase.from("progresso").select("aula_id").eq("user_id", ctx.user.id),
  ]);
  const ok = new Set((feitas ?? []).map((f) => f.aula_id as string));
  const lista = (mods ?? []) as Modulo[];
  const todas = ((aulas ?? []) as { id: string; modulo_id: number; titulo: string; tipo: keyof typeof TIPO_AULA; duracao_min: number | null }[]).filter((a) => lista.some((m) => m.id === a.modulo_id));
  const ordenadas = lista.flatMap((m) => todas.filter((a) => a.modulo_id === m.id));
  const feitasN = ordenadas.filter((a) => ok.has(a.id)).length;
  const pct = ordenadas.length ? Math.round((feitasN / ordenadas.length) * 100) : 0;
  const proxima = ordenadas.find((a) => !ok.has(a.id));
  const ate = revisaoAte(ctx.acesso, ctx.pago);
  const concluido = ordenadas.length > 0 && feitasN === ordenadas.length;
  const minutos = todas.reduce((s, a) => s + (a.duracao_min ?? 0), 0);

  return (
    <main className="bg-soft pb-20">
      {(ate || concluido) && (
        <p className="bg-[#e5f6ec] px-6 py-3 text-center text-[15px] font-semibold text-[#0f6b3a]" role="status">
          🎓 Você concluiu o curso!{ate ? ` Seu acesso continua até ${dataBR(ate)} para revisar.` : ""}{" "}
          <Link href={`/certificado/novo/${slug}`} className="underline underline-offset-4">Baixar meu certificado</Link>
        </p>
      )}
      <section className="relative overflow-hidden bg-navy text-white">
        <Image src={info.imagem} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="relative mx-auto flex max-w-[1100px] flex-wrap items-end justify-between gap-8 px-6 pt-10 pb-14">
          <div className="flex max-w-[640px] flex-col gap-4">
            <span className="self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Curso Cabin Crew{!info.publicado ? " · rascunho" : ""}</span>
            <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[46px]">{info.titulo}</h1>
            {info.descricao && <p className="text-[17px] leading-relaxed whitespace-pre-line text-[#e3e6ee]">{info.descricao.split(/\n\s*\n/)[0]}</p>}
          </div>
          <div className="flex w-full max-w-[320px] flex-col gap-3 rounded-[20px] bg-white/10 p-6 backdrop-blur">
            <div className="flex items-end justify-between">
              <span className="text-sm text-[#d7dbe6]">Seu progresso</span>
              <span className="font-display text-3xl font-extrabold">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20" aria-hidden="true"><div className="h-2.5 rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
            <span className="text-sm text-[#d7dbe6]">{feitasN} de {ordenadas.length} aulas{minutos ? ` · ${duracao(minutos)} de conteúdo` : ""}</span>
            {proxima && (
              <Link href={`${info.endereco}/aula/${proxima.id}`} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">
                {feitasN ? "Continuar" : "Começar a primeira aula"} <Arrow />
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-5 px-4 pt-10 md:px-6">
        <h2 className="font-display text-2xl font-extrabold">Módulos</h2>
        {!lista.length && <p className="rounded-[20px] border border-dashed border-[#c9cedb] bg-white p-10 text-center text-ink-2">As aulas deste curso estão sendo preparadas. Volte em breve.</p>}
        <ol className="flex flex-col gap-4">
          {lista.map((m) => {
            const daqui = todas.filter((a) => a.modulo_id === m.id);
            const f = daqui.filter((a) => ok.has(a.id)).length;
            return (
              <li key={m.id} className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5 md:p-6">
                <Link href={`${info.endereco}/modulo/${m.id}`} className="flex flex-wrap items-start justify-between gap-3 text-navy">
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-sm font-bold tracking-[.08em] text-[#b0002a] uppercase">Módulo {numeroModulo(m.ordem)}</span>
                    <strong className="font-display text-xl leading-snug font-extrabold">{m.titulo}</strong>
                    {m.descricao && <span className="text-[15px] text-ink-2">{m.descricao}</span>}
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-[13px] font-semibold">{f}/{daqui.length} aulas</span>
                </Link>
                {daqui.length > 0 && (
                  <ul className="flex flex-col divide-y divide-[#eceef3] border-t border-line">
                    {daqui.map((a) => (
                      <li key={a.id}>
                        <Link href={`${info.endereco}/aula/${a.id}`} className="flex items-center gap-3 py-3 text-navy hover:text-brand-strong">
                          <span aria-hidden="true" className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] ${ok.has(a.id) ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft"}`}>{ok.has(a.id) ? <Check size={14} /> : "•"}</span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="font-semibold">{a.titulo}</span>
                            <span className="text-[13px] text-muted">{TIPO_AULA[a.tipo]}{a.duracao_min ? ` · ${duracao(a.duracao_min)}` : ""}{ok.has(a.id) ? " · Concluída" : ""}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

function Venda({ info, prod, encerrado }: { info: InfoCurso; prod: Prod; encerrado?: string | null }) {
  const pix = prod ? Math.round(Number(prod.preco) * (100 - Number(prod.desconto_pix))) / 100 : 0;
  const dias = prod?.dias_apos_conclusao ?? 30;
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-6 py-16">
        <div className="relative h-[300px] w-full flex-[1_1_320px] overflow-hidden rounded-3xl md:h-[440px]">
          <Image src={info.imagem} alt="" fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-[999_1_420px] flex-col gap-4">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Curso Cabin Crew</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[42px]">{info.titulo}</h1>
          {encerrado !== undefined && encerrado !== null && <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-[15px] text-[#7a5a00]">Seu acesso terminou em {dataBR(encerrado)}. <Link href={`/certificado/novo/${info.slug}`} className="font-semibold underline">Baixar meu certificado</Link></p>}
          {info.descricao.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i} className="text-[17px] leading-relaxed whitespace-pre-line text-ink-2">{p.trim()}</p>)}
          {!!prod?.topicos?.length && (
            <ul className="flex flex-col gap-2 text-[16px]">
              {[...prod.topicos, dias > 0 ? `Acesso até você concluir, mais ${dias} dias para revisar` : "Acesso até você concluir"].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-brand-strong"><Check /></span>{t}</li>
              ))}
            </ul>
          )}
          {prod?.ativo ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong className="font-display text-[32px] font-extrabold text-navy">{reais(prod.preco)}</strong>
                <span className="text-[15px] text-ink-2">no cartão, em até 12x</span>
              </div>
              {Number(prod.desconto_pix) > 0 && <p className="text-[16px]"><strong className="text-[#0f6b3a]">{reais(pix)} no Pix</strong> ({Number(prod.desconto_pix)}% de desconto)</p>}
              <Link href={`/comprar/${info.slug}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand-strong px-6 font-display text-[17px] font-bold text-white hover:bg-brand-deep">Quero este curso <Arrow /></Link>
              <span className="text-[13px] text-muted">Pagamento seguro pelo Mercado Pago. Acesso liberado na hora.</span>
            </div>
          ) : <p className="rounded-2xl border border-line bg-white p-5 text-[17px] text-ink-2">As inscrições abrem em breve.</p>}
        </div>
      </div>
    </main>
  );
}
