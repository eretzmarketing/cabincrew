import { type Anexo, DEPARTAMENTOS, quando, urlAnexo } from "@/lib/suporte";

export type Ticket = { id: number; user_id: string; departamento: string; assunto: string; status: "aberto" | "fechado"; aguardando: "equipe" | "aluno"; criado_em: string; atualizado_em: string };
export type MensagemTicket = { id: number; autor_id: string | null; da_equipe: boolean; texto: string; anexos: Anexo[]; criado_em: string };

export function SeloStatus({ t, visao }: { t: Pick<Ticket, "status" | "aguardando">; visao: "aluno" | "equipe" }) {
  if (t.status === "fechado") return <span className="rounded-full bg-[#eceef3] px-3 py-1 text-[13px] font-semibold text-ink-2">Fechado</span>;
  if (t.aguardando === "equipe") {
    return visao === "equipe"
      ? <span className="rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand-deep">Aguardando resposta</span>
      : <span className="rounded-full bg-[#fff6dd] px-3 py-1 text-[13px] font-semibold text-[#7a5a00]">Em análise</span>;
  }
  return visao === "equipe"
    ? <span className="rounded-full bg-[#e5f6ec] px-3 py-1 text-[13px] font-semibold text-[#0f6b3a]">Respondido</span>
    : <span className="rounded-full bg-[#e5f6ec] px-3 py-1 text-[13px] font-semibold text-[#0f6b3a]">Respondido ✓</span>;
}

export const nomeDepartamento = (d: string) => DEPARTAMENTOS[d] ?? d;

/** Conversa do chamado: mensagens do aluno à direita (visão do aluno) e da equipe à esquerda. */
export function Conversa({ mensagens, visao, nomeAluno }: { mensagens: MensagemTicket[]; visao: "aluno" | "equipe"; nomeAluno: string }) {
  return (
    <ol className="flex flex-col gap-4">
      {mensagens.map((m) => {
        const minha = visao === "equipe" ? m.da_equipe : !m.da_equipe;
        return (
          <li key={m.id} className={`flex flex-col gap-1.5 ${minha ? "items-end" : "items-start"}`}>
            <span className="px-1 text-[13px] text-muted">
              <strong className="text-ink-2">{m.da_equipe ? "Equipe Cabin Crew" : nomeAluno}</strong> · {quando(m.criado_em)}
            </span>
            <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap sm:max-w-[80%] ${m.da_equipe ? "border border-[#cfd5e3] bg-[#eef1f7]" : "border border-line bg-white"}`}>
              {m.texto}
              {m.anexos?.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.anexos.map((a) => (
                    <li key={a.arquivo}>
                      <a href={urlAnexo(a)} target="_blank" rel="noreferrer" className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-[14px] font-semibold text-navy hover:border-navy">
                        {a.tipo.startsWith("image/")
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={urlAnexo(a)} alt="" className="h-9 w-9 rounded-md object-cover" />
                          : <span aria-hidden="true">📄</span>}
                        <span className="max-w-[200px] truncate">{a.nome}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
