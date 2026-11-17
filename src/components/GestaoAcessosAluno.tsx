"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { alterarCursoAluno, prorrogarCursoAluno, resetarModuloAluno, type DadosGestao } from "@/app/alunos-actions";

type Res = { msg?: string; erro?: string };

const ST: Record<string, { t: string; cor: string }> = {
  ativo: { t: "Ativo", cor: "bg-[#e5f6ec] text-[#0f6b3a]" }, suspenso: { t: "Suspenso", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  revogado: { t: "Removido", cor: "bg-[#eceef3] text-ink-2" }, concluido: { t: "Encerrado", cor: "bg-[#eef1ff] text-navy" },
};
const botao = "inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-[14px] font-semibold disabled:opacity-50";
const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function Aviso({ r }: { r: Res }) {
  if (r.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{r.erro}</p>;
  if (r.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{r.msg}</p>;
  return null;
}

function useAcao() {
  const router = useRouter();
  const [res, setRes] = useState<Res>({});
  const [pend, iniciar] = useTransition();
  const agir = (f: () => Promise<Res>, depois?: () => void) => iniciar(async () => { setRes(await f()); depois?.(); router.refresh(); });
  return { res, pend, agir };
}

/** Cursos do aluno: status, prazo, prorrogar, suspender, reativar, remover e liberar. */
export function CursosAluno({ id, email, d, agora }: { id: string; email: string | null; d: DadosGestao; agora: number }) {
  const { res, pend, agir } = useAcao();
  const [remover, setRemover] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {d.cursos.map(({ slug: c, nome }) => {
          const ac = d.acessos.find((x) => x.produto === c);
          const st = ac ? (ac.status === "ativo" && ac.expira_em && Date.parse(ac.expira_em) < agora ? "concluido" : ac.status) : null;
          const liberar = `/admin/usuarios/adicionar?email=${encodeURIComponent(email ?? "")}&produto=${c}`;
          return (
            <li key={c} className="flex flex-col gap-3 rounded-2xl border border-line p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="font-display text-[17px]">{nome}</strong>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${st ? ST[st]?.cor : "bg-[#eceef3] text-ink-2"}`}>{st ? ST[st]?.t ?? st : "Sem acesso"}</span>
                </span>
                {ac?.expira_em && (st === "ativo" || st === "concluido") && (
                  <span className="text-[14px] text-ink-2">
                    {st === "concluido" ? "Acesso terminou em " : "Acesso até "}{dataBR(ac.expira_em)}{ac.concluido_em ? " (curso concluído)" : ""}
                  </span>
                )}
                {st === "ativo" && !ac?.expira_em && <span className="text-[14px] text-ink-2">Sem data de término (vale até concluir o curso)</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ac?.expira_em && (st === "ativo" || st === "concluido") && [7, 30, 90].map((n) => (
                  <button key={n} type="button" disabled={pend} onClick={() => agir(() => prorrogarCursoAluno(id, c, n))} className={`${botao} border border-line text-navy hover:border-navy`}>+{n} dias</button>
                ))}
                {st === "ativo" && (
                  <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(id, c, "suspender"))} className={`${botao} border border-line hover:border-navy`}>Suspender</button>
                )}
                {st === "ativo" && (remover === c ? (
                  <>
                    <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(id, c, "remover"), () => setRemover(null))} className={`${botao} bg-brand-strong text-white`}>Confirmar remoção</button>
                    <button type="button" onClick={() => setRemover(null)} className={`${botao} text-ink-2`}>Cancelar</button>
                  </>
                ) : (
                  <button type="button" disabled={pend} onClick={() => setRemover(c)} className={`${botao} border border-line text-brand-deep hover:border-brand-deep`}>Remover do curso</button>
                ))}
                {st === "suspenso" && <button type="button" disabled={pend} onClick={() => agir(() => alterarCursoAluno(id, c, "reativar"))} className={`${botao} bg-navy text-white`}>Reativar</button>}
                {(!st || st === "revogado" || st === "concluido") && <Link href={liberar} className={`${botao} bg-navy text-white hover:bg-navy-deep`}>{st ? "Liberar de novo" : "Liberar acesso"}</Link>}
              </div>
            </li>
          );
        })}
      </ul>
      <Aviso r={res} />
      <span className="text-[13px] text-muted">“Liberar acesso” abre o formulário de cortesia/Pix direto (registra a compra e avisa o aluno). Compras pelo site liberam sozinhas.</span>
    </div>
  );
}

/** Progresso por módulo, com reset. */
export function ModulosAluno({ id, d }: { id: string; d: DadosGestao }) {
  const { res, pend, agir } = useAcao();
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const secoes = d.secoes.filter((s) => s.mods.some((m) => m.total > 0));
  if (!secoes.length) return <p className="text-ink-2">Nenhum módulo para mostrar.</p>;
  return (
    <div className="flex flex-col gap-4">
      {secoes.map(({ curso: c, titulo: t, mods }) => (
        <details key={c} className="group rounded-2xl border border-line" open={secoes.length === 1}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-display font-extrabold">
            {t}
            <span className="text-[13px] font-semibold text-muted">
              {mods.reduce((n, m) => n + m.feitas, 0)}/{mods.reduce((n, m) => n + m.total, 0)} aulas <span aria-hidden="true" className="inline-block transition group-open:rotate-90">▸</span>
            </span>
          </summary>
          <ul className="flex flex-col divide-y divide-[#eceef3] border-t border-line">
            {mods.filter((m) => m.total > 0).map((m) => {
              const k = `${c}-${m.id}`;
              return (
                <li key={k} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                  <span className="min-w-0 flex-1 text-[15px]"><span className="font-semibold">{m.titulo}</span> <span className="text-muted">· {m.feitas}/{m.total} aulas</span></span>
                  {confirmar === k ? (
                    <span className="flex gap-2">
                      <button type="button" disabled={pend} onClick={() => agir(() => resetarModuloAluno(id, c, m.id), () => setConfirmar(null))} className={`${botao} bg-brand-strong text-white`}>Confirmar reset</button>
                      <button type="button" onClick={() => setConfirmar(null)} className={`${botao} text-ink-2`}>Cancelar</button>
                    </span>
                  ) : (
                    <button type="button" disabled={!m.feitas || pend} onClick={() => setConfirmar(k)} className={`${botao} border border-line hover:border-navy disabled:cursor-default`}>Resetar</button>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      ))}
      <Aviso r={res} />
      <span className="text-[13px] text-muted">Resetar apaga as aulas concluídas e os simulados das aulas daquele módulo. Não dá para desfazer.</span>
    </div>
  );
}
