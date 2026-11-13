import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Numero, Titulo } from "@/components/admin-ui";
import { EnviarWhatsappForm } from "@/components/WhatsappForms";
import { whatsappConfigurado } from "@/lib/whatsapp";
import { BANCOS } from "@/lib/crew";
import { META, maiorSequencia } from "@/lib/jornada";
import { carregarJornada } from "@/lib/jornada-dados";
import { calcularMedalhas } from "@/lib/medalhas";
import {
  SITUACOES, TOTAL_INGLES, dataCurta, diasParaMeta, linkWhatsapp, mensagemSugerida, nomeAluno, nomeCompanhia, quando, riscos, situacao,
  type LinhaAluno,
} from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";
import { alterarAcesso } from "@/app/pagamentos-actions";
import { STATUS_COMPRA, dataHoraBR, dinheiro, fimArrependimento, type Compra } from "@/lib/compras";

export const metadata: Metadata = { title: "Aluno · Head Hunter" };
export const dynamic = "force-dynamic";

export default async function AlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await getUser();
  const [{ data: linha }, { dados, dataMeta, jornada }, { data: recentes }, { data: comprasAluno }, { data: acessosAluno }] = await Promise.all([
    supabase.rpc("admin_hh_alunos", { p_busca: "", p_id: id }),
    carregarJornada(supabase, id),
    supabase.from("tentativas").select("nota, iniciada_em, finalizada_em, saidas_aba, simulados(titulo, origem)").eq("user_id", id).order("iniciada_em", { ascending: false }).limit(15),
    supabase.from("compras").select("*").eq("user_id", id).order("comprada_em", { ascending: false }),
    supabase.from("acessos").select("*").eq("user_id", id),
  ]);
  const l = ((linha ?? []) as LinhaAluno[])[0];
  if (!l) notFound();

  const st = situacao(l);
  const rs = riscos(l);
  const faltam = diasParaMeta({ data_meta: dataMeta });
  const wa = linkWhatsapp(l.whatsapp, mensagemSugerida(l));
  const medalhas = calcularMedalhas(dados, jornada);

  // desempenho por banco (treinos e simulados de um banco só)
  const porBanco = new Map<string, number[]>();
  for (const t of dados.tentativas) {
    const s = dados.simulados.get(t.simulado_id);
    if (!s || s.bancos.length !== 1 || t.nota === null) continue;
    porBanco.set(s.bancos[0], [...(porBanco.get(s.bancos[0]) ?? []), t.nota]); // já vem do mais recente para o mais antigo
  }
  const bancos = [...porBanco.entries()]
    .map(([b, notas]) => ({ b, n: notas.length, ult5: Math.round(notas.slice(0, 5).reduce((x, y) => x + y, 0) / Math.min(5, notas.length)), melhor: Math.max(...notas) }))
    .sort((a, b) => a.ult5 - b.ult5);

  type Recente = { nota: number | null; iniciada_em: string; finalizada_em: string | null; saidas_aba: number | null; simulados: { titulo: string; origem: string | null } | null };

  return (
    <>
      <Link href="/admin/head-hunter/alunos" className="text-sm font-semibold text-navy">← Alunos do Head Hunter</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Titulo sub={<>{l.email ?? "sem e-mail"}{l.whatsapp && <> · {l.whatsapp}</>} · cadastro em {new Date(l.cadastro).toLocaleDateString("pt-BR")}</>}>
          {nomeAluno(l)} <span className={`ml-2 inline-block rounded-full px-3 py-1 align-middle text-sm font-semibold ${SITUACOES[st].cor}`}>{SITUACOES[st].rotulo}</span>
        </Titulo>
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-[#25d366] px-5 font-semibold text-[#0b3d20] hover:brightness-95">Chamar no WhatsApp</a>}
      </div>

      {rs.length > 0 && (
        <p role="status" className="rounded-2xl bg-brand-soft px-5 py-4 font-semibold text-brand-deep">⚠ Em risco: {rs.join(" · ")}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="Última atividade" valor={quando(l.ultima)} detalhe={l.ultima ? new Date(l.ultima).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : undefined} />
        <Numero rotulo="Dias ativos (14 dias)" valor={l.dias_14} detalhe={`sequência atual ${jornada.sequencia.dias} · recorde ${maiorSequencia(dados)}`} />
        <Numero rotulo="Jornada" valor={`${jornada.pctGeral}%`} detalhe={nomeCompanhia(jornada.principal) ? `rumo à ${nomeCompanhia(jornada.principal)}` : undefined} />
        <Numero rotulo="Seleção" valor={faltam === null ? "—" : faltam < 0 ? "passou" : `${faltam} dias`} detalhe={dataMeta ? new Date(`${dataMeta}T12:00:00Z`).toLocaleDateString("pt-BR") : "sem data definida"} />
        <Numero rotulo="Pontos da semana" valor={l.pontos_semana} detalhe={`${medalhas.filter((m) => m.ganha).length} de ${medalhas.length} medalhas`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="font-display text-xl font-extrabold">Jornada</h2>
          {dados.companhias.length === 0 && <p className="text-[15px] text-ink-2">Ainda não fez o check-in; a jornada abaixo usa a ordem padrão (LATAM).</p>}
          <ol className="flex flex-col gap-3">
            {[...jornada.etapas, jornada.ingles].map((e, i) => (
              <li key={e.id} className={`rounded-2xl border p-4 ${e.feita ? "border-[#bfe6cd] bg-[#f3fbf6]" : i === jornada.atual ? "border-navy" : "border-line"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="font-display">{e.titulo}</strong>
                  <span className="text-sm font-semibold">{e.vazia ? "em breve" : e.feita ? "✓ concluída" : `${e.pct}%`}{i === jornada.atual && !e.feita && " · etapa atual"}</span>
                </div>
                {!e.vazia && (
                  <ul className="mt-2 flex flex-col gap-1 text-[14px] text-ink-2">
                    {e.status.filter((x) => !x.oculta).map((x, k) => (
                      <li key={k} className="flex flex-wrap justify-between gap-2">
                        <span>{x.feito ? "✓" : "○"} {x.titulo}</span>
                        <span className="text-muted">{x.bloqueada ?? x.detalhe}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="font-display text-xl font-extrabold">Desempenho por assunto</h2>
            {bancos.length === 0 ? <p className="text-[15px] text-ink-2">Ainda não fez treinos nem simulados.</p> : (
              <table className="w-full text-left text-[14px]">
                <thead className="text-[13px] text-muted"><tr><th className="pb-2 font-semibold">Assunto</th><th className="pb-2 font-semibold">Feitos</th><th className="pb-2 font-semibold">Últimos 5</th><th className="pb-2 font-semibold">Melhor</th></tr></thead>
                <tbody>
                  {bancos.map((x) => (
                    <tr key={x.b} className="border-t border-[#eceef3]">
                      <td className="py-2 pr-2">{BANCOS[x.b] ?? x.b}</td>
                      <td className="py-2">{x.n}</td>
                      <td className={`py-2 font-semibold ${x.ult5 >= META ? "text-[#0f6b3a]" : x.ult5 < 60 ? "text-brand-strong" : ""}`}>{x.ult5}%</td>
                      <td className="py-2">{x.melhor}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-[13px] text-muted">Ordenado do assunto mais fraco para o mais forte. Meta: {META}%.</p>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-extrabold">Outros treinos</h2>
            <ul className="flex flex-col gap-1.5 text-[15px]">
              <li>Aulas concluídas: <strong>{l.aulas}</strong></li>
              <li>Flight Attendant English: <strong>{l.ingles}/{TOTAL_INGLES}</strong> aulas</li>
              <li>Perfil comportamental: <strong>{l.opq}</strong> sessões{dados.opq[0] && <> · última {dados.opq[0].perfil.incoerentes.length ? `com ${dados.opq[0].perfil.incoerentes.length} incoerência(s)` : "coerente"}</>}</li>
              <li>Vídeo de apresentação: <strong>{dados.videos.length}</strong> gravações{l.melhor_video !== null && <> · melhor {l.melhor_video}%</>}</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-extrabold">Atividade recente</h2>
            {!(recentes ?? []).length ? <p className="text-[15px] text-ink-2">Nenhum treino ou simulado ainda.</p> : (
              <ul className="flex flex-col gap-2 text-[14px]">
                {((recentes ?? []) as unknown as Recente[]).map((t, k) => (
                  <li key={k} className="flex flex-wrap justify-between gap-2 border-t border-[#eceef3] pt-2 first:border-0 first:pt-0">
                    <span>{t.simulados?.origem?.startsWith("cc-treino-") ? "Treino · " : ""}{t.simulados?.titulo ?? "Simulado"}</span>
                    <span className="text-muted">
                      {t.finalizada_em ? <strong className="text-ink">{t.nota ?? 0}%</strong> : "não terminou"}
                      {(t.saidas_aba ?? 0) > 0 && <> · {t.saidas_aba} saída(s) da aba</>} · {dataCurta(t.iniciada_em)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {l.whatsapp && whatsappConfigurado() && (
            <Card>
              <h2 className="font-display text-xl font-extrabold">Mandar mensagem</h2>
              <p className="text-[14px] text-ink-2">Sai do seu número no Wawp e fica no histórico em Configurações → WhatsApp.</p>
              <EnviarWhatsappForm alunoId={l.id} textoInicial={mensagemSugerida(l)} />
            </Card>
          )}

          <Card>
            <h2 className="font-display text-xl font-extrabold">Acesso aos cursos</h2>
            {([["head-hunter", "Head Hunter"], ["english", "Flight Attendant English"]] as const).map(([curso, rotulo]) => {
              const acesso = ((acessosAluno ?? []) as { produto: string; status: string; liberado_em: string; encerrado_em: string | null; concluido_em: string | null; expira_em: string | null; motivo: string | null }[]).find((x) => x.produto === curso);
              const ativo = acesso?.status === "ativo" && (!acesso.expira_em || Date.parse(acesso.expira_em) > Date.parse(new Date().toISOString()));
              return (
                <div key={curso} className="flex flex-col gap-2 border-t border-line pt-3 first-of-type:border-0 first-of-type:pt-0">
                  <p className="text-[15px]">
                    <strong className="font-display">{rotulo}:</strong>{" "}
                    {!acesso ? "sem acesso." : ativo ? <><strong className="text-[#0f6b3a]">ativo</strong> desde {dataHoraBR(acesso.liberado_em)}</>
                      : <><strong>{acesso.status === "revogado" ? "encerrado" : "concluído"}</strong> em {dataHoraBR(acesso.encerrado_em ?? acesso.expira_em ?? acesso.liberado_em)}</>}
                    {acesso?.concluido_em && <span className="block text-[14px]">Concluiu o curso em {dataHoraBR(acesso.concluido_em)}{acesso.expira_em ? ` · acesso até ${dataHoraBR(acesso.expira_em)}` : ""}</span>}
                    {acesso?.motivo && <span className="block text-[13px] text-muted">{acesso.motivo}</span>}
                  </p>
                  {ativo ? (
                    <form action={alterarAcesso}>
                      <input type="hidden" name="user_id" value={l.id} /><input type="hidden" name="produto" value={curso} />
                      <button name="acao" value="encerrar" className="min-h-11 cursor-pointer rounded-full border-2 border-line px-4 text-[14px] font-semibold text-brand-deep hover:border-brand-deep">Encerrar acesso</button>
                    </form>
                  ) : (
                    <Link href={`/admin/head-hunter/alunos/adicionar?email=${encodeURIComponent(l.email ?? "")}&produto=${curso}`} className="inline-flex min-h-11 items-center self-start rounded-full bg-navy px-4 text-[14px] font-semibold text-white hover:bg-navy-deep">{acesso ? "Liberar de novo" : "Liberar acesso"}</Link>
                  )}
                </div>
              );
            })}
            <span className="text-[13px] text-muted">Compras pelo Mercado Pago liberam sozinhas. Para cortesia, Pix direto ou curso presencial, use Liberar acesso.</span>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold">Compras</h2>
              <Link href="/admin/compras/nova" className="text-sm font-semibold underline underline-offset-4">+ Registrar</Link>
            </div>
            {!(comprasAluno ?? []).length ? <p className="text-[15px] text-ink-2">Nenhuma compra registrada.</p> : (
              <ul className="flex flex-col gap-2 text-[14px]">
                {((comprasAluno ?? []) as Compra[]).map((c) => (
                  <li key={c.id} className="border-t border-[#eceef3] pt-2 first:border-0 first:pt-0">
                    <Link href={`/admin/compras/${c.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{c.produto} · {dinheiro(Number(c.valor), c.moeda)}</Link>
                    <span className="block text-muted">{dataHoraBR(c.comprada_em)} · {STATUS_COMPRA[c.status]?.rotulo ?? c.status} · arrependimento {fimArrependimento(c.comprada_em) > new Date() ? "em aberto" : "encerrado"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-xl font-extrabold">Medalhas</h2>
            <p className="text-[15px]">{medalhas.filter((m) => m.ganha).map((m) => `${m.emoji} ${m.nome}`).join(" · ") || "Nenhuma ainda."}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
