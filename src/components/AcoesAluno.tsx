"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { alterarCursoAluno, banirAluno, dadosGestaoAluno, excluirAluno, resetarModuloAluno, type DadosGestao } from "@/app/alunos-actions";
import BotaoWhatsapp, { type Sugestao } from "@/components/BotaoWhatsapp";
import { CURSOS } from "@/lib/cursos";

type Aluno = { id: string; nome: string; email: string | null; whatsapp: string | null; bloqueado: boolean };
type Res = { msg?: string; erro?: string };

const icone = "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-navy hover:border-navy hover:bg-soft";
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const IOlho = () => <Svg><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>;
const ILapis = () => <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>;
const IBanir = () => <Svg><circle cx="12" cy="12" r="9" /><path d="m5.7 5.7 12.6 12.6" /></Svg>;
const ILixo = () => <Svg><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></Svg>;

function Janela({ titulo, sub, fechar, children }: { titulo: string; sub?: string; fechar: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [fechar]);
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1220]/50 sm:items-center sm:p-4" onClick={fechar}>
      <div className="flex max-h-[92vh] w-full max-w-[600px] flex-col gap-4 overflow-auto rounded-t-[22px] bg-white p-5 text-left shadow-xl sm:rounded-[22px] sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col"><h3 className="font-display text-xl font-extrabold">{titulo}</h3>{sub && <span className="text-[14px] text-muted">{sub}</span>}</div>
          <button type="button" autoFocus onClick={fechar} aria-label="Fechar" className="-mt-1 -mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-2xl text-ink-2 hover:bg-[#eceef3]">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Aviso({ r }: { r: Res }) {
  if (r.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{r.erro}</p>;
  if (r.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{r.msg}</p>;
  return null;
}

const NOMES: Record<string, string> = Object.fromEntries(CURSOS.map((c) => [c.slug, c.nome]));
const ST: Record<string, { t: string; cor: string }> = {
  ativo: { t: "Ativo", cor: "bg-[#e5f6ec] text-[#0f6b3a]" }, suspenso: { t: "Suspenso", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  revogado: { t: "Removido", cor: "bg-[#eceef3] text-ink-2" }, concluido: { t: "Concluído", cor: "bg-[#eef1ff] text-navy" },
};

function Editar({ a, fechar }: { a: Aluno; fechar: () => void }) {
  const router = useRouter();
  const [d, setD] = useState<DadosGestao | null>(null);
  const [res, setRes] = useState<Res>({});
  const [pend, iniciar] = useTransition();
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [agora, setAgora] = useState(0);
  const recarregar = () => dadosGestaoAluno(a.id).then((x) => { setD(x); setAgora(new Date().getTime()); });
  useEffect(() => { dadosGestaoAluno(a.id).then((x) => { setD(x); setAgora(new Date().getTime()); }); }, [a.id]);
  const agir = (f: () => Promise<Res>) => iniciar(async () => { setRes(await f()); setConfirmar(null); await recarregar(); router.refresh(); });

  return (
    <Janela titulo={`Editar ${a.nome}`} sub={a.email ?? undefined} fechar={fechar}>
      {!d ? <p className="text-ink-2" role="status">Carregando…</p> : (
        <>
          <section className="flex flex-col gap-2">
            <h4 className="font-display font-extrabold">Cursos</h4>
            {CURSOS.map(({ slug: c }) => {
              const ac = d.acessos.find((x) => x.produto === c);
              const st = ac ? (ac.status === "ativo" && ac.expira_em && Date.parse(ac.expira_em) < agora ? "concluido" : ac.status) : null;
              return (
                <div key={c} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold">{NOMES[c]}
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${st ? ST[st]?.cor : "bg-[#eceef3] text-ink-2"}`}>{st ? ST[st]?.t ?? st : "Sem acesso"}</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {st === "ativo" && <>
                      <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(a.id, c, "suspender"))} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy">Suspender</button>
                      <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(a.id, c, "remover"))} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold text-brand-deep hover:border-brand-deep">Remover do curso</button>
                    </>}
                    {st === "suspenso" && <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(a.id, c, "reativar"))} className="min-h-9 cursor-pointer rounded-full bg-navy px-3 text-[13px] font-semibold text-white">Reativar</button>}
                    {(!st || st === "revogado" || st === "concluido") && <Link href={`/admin/head-hunter/alunos/adicionar?email=${encodeURIComponent(a.email ?? "")}&produto=${c}`} className="inline-flex min-h-9 items-center rounded-full bg-navy px-3 text-[13px] font-semibold text-white">Adicionar ao curso</Link>}
                  </span>
                </div>
              );
            })}
          </section>

          {([["head-hunter", "Módulos do Head Hunter", d.hh], ["english", "Módulos do Flight Attendant English", d.en], ["spanish", "Módulos do Flight Attendant Spanish", d.es ?? []]] as const).map(([c, t, mods]) => (
            <section key={c} className="flex flex-col gap-2">
              <h4 className="font-display font-extrabold">{t}</h4>
              <ul className="flex flex-col divide-y divide-[#eceef3] rounded-xl border border-line">
                {mods.filter((m) => m.total > 0).map((m) => {
                  const k = `${c}-${m.id}`;
                  return (
                    <li key={k} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                      <span className="min-w-0 flex-1 text-[14px]"><span className="font-semibold">{m.titulo}</span> <span className="text-muted">· {m.feitas}/{m.total} aulas</span></span>
                      {confirmar === k ? (
                        <span className="flex gap-2">
                          <button type="button" disabled={pend} onClick={() => agir(() => resetarModuloAluno(a.id, c, m.id))} className="min-h-9 cursor-pointer rounded-full bg-brand-strong px-3 text-[13px] font-semibold text-white">Confirmar reset</button>
                          <button type="button" onClick={() => setConfirmar(null)} className="min-h-9 cursor-pointer px-2 text-[13px] font-semibold">Cancelar</button>
                        </span>
                      ) : (
                        <button type="button" disabled={!m.feitas} onClick={() => setConfirmar(k)} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[13px] font-semibold hover:border-navy disabled:cursor-default disabled:opacity-40">Resetar</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <span className="text-[13px] text-muted">Resetar apaga as aulas concluídas{" "}e os simulados das aulas daquele módulo. Não dá para desfazer.</span>
          <Aviso r={res} />
        </>
      )}
    </Janela>
  );
}

function Banir({ a, fechar }: { a: Aluno; fechar: () => void }) {
  const router = useRouter();
  const [res, setRes] = useState<Res>({});
  const [pend, iniciar] = useTransition();
  return (
    <Janela titulo={a.bloqueado ? `Remover banimento de ${a.nome}?` : `Banir ${a.nome}?`} fechar={fechar}>
      <p className="text-[15px] text-ink-2">{a.bloqueado ? "O aluno volta a conseguir entrar e usar os cursos que tiver." : "O aluno continua com a conta, mas não consegue usar nenhum curso, simulado ou o fórum. Dá para desfazer depois."}</p>
      <Aviso r={res} />
      {res.msg ? <button type="button" onClick={fechar} className="min-h-11 cursor-pointer self-end rounded-full bg-navy px-5 font-semibold text-white">Fechar</button> : (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={fechar} className="min-h-11 cursor-pointer rounded-full border-2 border-line px-5 font-semibold">Cancelar</button>
          <button type="button" disabled={pend} onClick={() => iniciar(async () => { setRes(await banirAluno(a.id, !a.bloqueado)); router.refresh(); })}
            className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-5 font-semibold text-white">{pend ? "…" : a.bloqueado ? "Remover banimento" : "Banir aluno"}</button>
        </div>
      )}
    </Janela>
  );
}

function Excluir({ a, fechar, voltarPara }: { a: Aluno; fechar: () => void; voltarPara?: string }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [conf, setConf] = useState("");
  const [res, setRes] = useState<Res>({});
  const [pend, iniciar] = useTransition();
  return (
    <Janela titulo={`Excluir a conta de ${a.nome}?`} fechar={fechar}>
      {res.msg ? (
        <><Aviso r={res} /><button type="button" onClick={() => { fechar(); if (voltarPara) router.push(voltarPara); else router.refresh(); }} className="min-h-11 cursor-pointer self-end rounded-full bg-navy px-5 font-semibold text-white">Fechar</button></>
      ) : (
        <>
          <p className="text-[15px] text-ink-2">Apaga o login, o perfil e todo o progresso. <strong>Não dá para desfazer.</strong> Ficam guardados o registro em Contas excluídas (nome, e-mail, WhatsApp, uso) e as compras no livro.</p>
          <label htmlFor={`mot-${a.id}`} className="text-[14px] font-semibold">Motivo <span className="font-normal text-muted">(opcional, fica no registro)</span></label>
          <input id={`mot-${a.id}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-11 rounded-xl border border-[#c9cedb] px-3" />
          <label htmlFor={`conf-${a.id}`} className="text-[14px] font-semibold">Digite EXCLUIR para confirmar</label>
          <input id={`conf-${a.id}`} value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="off" className="min-h-11 rounded-xl border border-[#c9cedb] px-3 uppercase" />
          <Aviso r={res} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={fechar} className="min-h-11 cursor-pointer rounded-full border-2 border-line px-5 font-semibold">Cancelar</button>
            <button type="button" disabled={pend || conf.trim().toUpperCase() !== "EXCLUIR"} onClick={() => iniciar(async () => {
              const r = await excluirAluno(a.id, motivo, conf);
              if (r.ok) { fechar(); router.push(`${voltarPara ?? "/admin/head-hunter/alunos"}?excluido=${encodeURIComponent(a.nome)}`); router.refresh(); } else setRes(r);
            })}
              className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-5 font-semibold text-white disabled:opacity-40">{pend ? "Excluindo…" : "Excluir conta"}</button>
          </div>
        </>
      )}
    </Janela>
  );
}

/** Ícones de ação de um aluno: ver ficha, WhatsApp, editar, banir e excluir. */
export default function AcoesAluno({ aluno, sugestoes, verFicha = true, voltarPara }: { aluno: Aluno; sugestoes?: Sugestao[]; verFicha?: boolean; voltarPara?: string }) {
  const [aberto, setAberto] = useState<"editar" | "banir" | "excluir" | null>(null);
  const fechar = () => setAberto(null);
  return (
    <div className="flex items-center justify-end gap-1.5">
      {verFicha && <Link href={`/admin/usuarios/${aluno.id}`} className={icone} title="Ver ficha completa" aria-label={`Ver ficha de ${aluno.nome}`}><IOlho /></Link>}
      {aluno.whatsapp ? <BotaoWhatsapp telefone={aluno.whatsapp} nome={aluno.nome} userId={aluno.id} sugestoes={sugestoes} tamanho="sm" /> : <span className="w-9" aria-hidden="true" />}
      <button type="button" className={icone} onClick={() => setAberto("editar")} title="Editar cursos e módulos" aria-label={`Editar ${aluno.nome}`}><ILapis /></button>
      <button type="button" className={`${icone} ${aluno.bloqueado ? "border-brand-deep bg-brand-soft text-brand-deep" : ""}`} onClick={() => setAberto("banir")} title={aluno.bloqueado ? "Banido (clique para remover)" : "Banir"} aria-label={aluno.bloqueado ? `Remover banimento de ${aluno.nome}` : `Banir ${aluno.nome}`}><IBanir /></button>
      <button type="button" className={`${icone} hover:border-brand-deep hover:text-brand-deep`} onClick={() => setAberto("excluir")} title="Excluir conta" aria-label={`Excluir ${aluno.nome}`}><ILixo /></button>
      {aberto === "editar" && <Editar a={aluno} fechar={fechar} />}
      {aberto === "banir" && <Banir a={aluno} fechar={fechar} />}
      {aberto === "excluir" && <Excluir a={aluno} fechar={fechar} voltarPara={voltarPara} />}
    </div>
  );
}
