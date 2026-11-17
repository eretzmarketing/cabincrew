import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AcoesAluno from "@/components/AcoesAluno";
import { Card, Titulo } from "@/components/admin-ui";
import { CursosAluno, ModulosAluno } from "@/components/GestaoAcessosAluno";
import { LiberarIAForm } from "@/components/IAForm";
import { dadosGestaoAluno } from "@/app/alunos-actions";
import { liberarPlus, removerPlus } from "@/app/questoes-admin-actions";
import { getConfig } from "@/lib/config";
import { POR_ALUNO_PADRAO, configIA, saldoVideoIA } from "@/lib/ia-video";
import { nomeAluno, type LinhaAluno } from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acessos do aluno" };
export const dynamic = "force-dynamic";

const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const SECOES = [["cursos", "Cursos"], ["plus", "Questões Plus"], ["ia", "Inteligência artificial"], ["progresso", "Progresso"]] as const;

function Secao({ id, icone, titulo, sub, children }: { id: string; icone: string; titulo: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="scroll-mt-24" >
      <div id={id} className="flex scroll-mt-24 items-start gap-3">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-[22px]">{icone}</span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-xl font-extrabold">{titulo}</h2>
          {sub && <p className="text-[14px] text-ink-2">{sub}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export default async function AcessosAluno({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await getUser();
  const cfgIA = configIA();
  const [{ data: linha }, d, { data: plusAluno, error: semPlus }, cfgSite, saldoIA, saldoCV] = await Promise.all([
    supabase.rpc("admin_hh_alunos", { p_busca: "", p_id: id }),
    dadosGestaoAluno(id),
    supabase.from("plus_assinantes").select("ate, observacao").eq("user_id", id).maybeSingle(),
    getConfig(),
    saldoVideoIA(supabase, id, cfgIA?.porAluno ?? POR_ALUNO_PADRAO),
    saldoVideoIA(supabase, id, cfgIA?.porAlunoCv ?? POR_ALUNO_PADRAO, "curriculo"),
  ]);
  const l = ((linha ?? []) as LinhaAluno[])[0];
  if (!l || !d) notFound();
  const agora = Date.parse(new Date().toISOString());
  const plusAtivo = !!plusAluno && (!plusAluno.ate || Date.parse(plusAluno.ate) > agora);
  const aqui = `/admin/usuarios/${id}/acessos`;
  const nome = nomeAluno(l);

  return (
    <>
      <Link href={`/admin/usuarios/${id}`} className="text-sm font-semibold text-navy">← Ficha de {nome}</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Titulo sub={<>{l.email ?? "sem e-mail"}{l.whatsapp && <> · {l.whatsapp}</>}</>}>
          Acessos de {nome}
          {l.bloqueado && <span className="ml-2 inline-block rounded-full bg-brand-soft px-3 py-1 align-middle text-sm font-semibold text-brand-deep">Banido</span>}
        </Titulo>
        <AcoesAluno aluno={{ id: l.id, nome, email: l.email, whatsapp: l.whatsapp, bloqueado: l.bloqueado }} editar={false} voltarPara="/admin/usuarios" />
      </div>
      <p className="text-[15px] text-ink-2">Tudo o que o aluno pode usar, num lugar só: cursos, Questões Plus e análises da IA. Os Simulados ANAC são grátis para todo cadastrado.</p>

      <nav aria-label="Seções" className="sticky top-0 z-10 -mx-1 flex gap-2 overflow-x-auto bg-soft/95 px-1 py-2 backdrop-blur">
        {SECOES.map(([k, t]) => (
          <a key={k} href={`#${k}`} className="inline-flex min-h-10 shrink-0 items-center rounded-full border-2 border-line bg-white px-4 text-[14px] font-semibold text-navy hover:border-navy">{t}</a>
        ))}
      </nav>

      {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{sp.ok}</p>}
      {sp.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">{sp.erro}</p>}

      <Secao id="cursos" icone="📚" titulo="Cursos" sub="Suspender pausa o acesso; remover encerra. Prorrogar soma dias ao prazo.">
        <CursosAluno id={id} email={l.email} d={d} agora={agora} />
      </Secao>

      <Secao id="plus" icone="⭐" titulo="Questões Plus" sub="Comentários nas questões (fórum) e favoritas com simulado exclusivo.">
        {semPlus ? <p className="text-ink-2">Rode o SQL 0070_questoes_comunidade.sql no Supabase para usar.</p> : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[15px]">
              <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${plusAtivo ? "bg-[#e5f6ec] text-[#0f6b3a]" : plusAluno ? "bg-brand-soft text-brand-deep" : "bg-[#eceef3] text-ink-2"}`}>
                {plusAtivo ? "Liberado" : plusAluno ? "Vencido" : "Não liberado"}
              </span>
              {plusAluno && <span>{plusAluno.ate ? `${plusAtivo ? "até" : "venceu em"} ${dataBR(plusAluno.ate)}` : "sem prazo"}{plusAluno.observacao ? ` · ${plusAluno.observacao}` : ""}</span>}
            </div>
            <p className={`rounded-xl px-4 py-2.5 text-[14px] ${cfgSite.plus_cobrar ? "bg-[#fff8e6] text-[#7a5a00]" : "bg-soft text-ink-2"}`}>
              {cfgSite.plus_cobrar
                ? "A cobrança está ligada: sem liberação, o aluno não comenta nem favorita."
                : "A cobrança está desligada: hoje todos usam de graça. A liberação passa a valer quando você ligar a cobrança."}{" "}
              <Link href="/admin/questoes/plus" className="font-semibold underline">Configurar cobrança</Link>
            </p>
            <div className="flex flex-wrap gap-2">
              {[["30", "+1 mês"], ["90", "+3 meses"], ["365", "+1 ano"], ["sem", "Sem prazo"]].map(([v, t]) => (
                <form key={v} action={liberarPlus}>
                  <input type="hidden" name="user_id" value={id} /><input type="hidden" name="prazo" value={v} /><input type="hidden" name="voltar" value={`${aqui}#plus`} />
                  <button className="min-h-11 cursor-pointer rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy-deep">{t}</button>
                </form>
              ))}
              {plusAluno && (
                <form action={removerPlus}>
                  <input type="hidden" name="user_id" value={id} /><input type="hidden" name="voltar" value={`${aqui}#plus`} />
                  <button className="min-h-11 cursor-pointer rounded-full border-2 border-line px-5 text-[14px] font-semibold text-brand-deep hover:border-brand-deep">Remover</button>
                </form>
              )}
            </div>
          </>
        )}
      </Secao>

      <Secao id="ia" icone="🤖" titulo="Inteligência artificial" sub="Cada compra do Head Hunter dá um número de análises. Aqui você libera análises extras.">
        <div className="grid gap-4 lg:grid-cols-2">
          {([["🎥 Vídeo de apresentação", saldoIA, "video"], ["📄 Currículo", saldoCV, "curriculo"]] as const).map(([t, s, r]) => (
            <div key={r} className="flex flex-col gap-3 rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="font-display text-[17px]">{t}</strong>
                {!("erro" in s) && (
                  <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${s.restantes > 0 ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-soft text-brand-deep"}`}>
                    {s.restantes > 0 ? `${s.restantes} disponível(is)` : "Esgotadas"}
                  </span>
                )}
              </div>
              {"erro" in s ? <p className="text-[14px] text-ink-2">{s.erro}</p> : (
                <p className="text-[14px] text-ink-2">Usou <strong>{s.usadas}</strong> de <strong>{s.limite}</strong>{s.extras ? ` (${s.extras} liberada(s) por você)` : ""}.</p>
              )}
              <LiberarIAForm aluno={id} recurso={r} />
            </div>
          ))}
        </div>
      </Secao>

      <Secao id="progresso" icone="🔄" titulo="Progresso nos cursos" sub="Veja quantas aulas o aluno concluiu em cada módulo e, se precisar, resete um módulo.">
        <ModulosAluno id={id} d={d} />
      </Secao>
    </>
  );
}
