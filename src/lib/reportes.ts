/** Questões reportadas pelos alunos (admin). */
export type Reporte = {
  id: number; questao_id: string; banco: string; categoria: string | null; enunciado: string; alternativas: { letra: string; texto: string | null }[];
  correta: string | null; explicacao: string | null; tipo: string; mensagem: string | null; status: string; resposta: string | null;
  created_at: string; resolvido_em: string | null; aluno_id: string; aluno: string | null; email: string | null; reportes_da_questao: number;
};
export const TIPO_REPORTE: Record<string, string> = { gabarito: "Resposta certa errada", enunciado: "Erro no enunciado", alternativas: "Erro nas alternativas", explicacao: "Erro na explicação", outro: "Outro problema" };
export const quandoReporte = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Aberto = ninguém olhou ainda · Pendente = já foi aberto, falta responder · Fechado = respondido. */
export function situacaoReporte(status: string, vistoEm: string | null | undefined) {
  if (status !== "aberto") return { rotulo: "Fechado", detalhe: status === "corrigido" ? "corrigida" : "sem erro", cls: "bg-[#e5f6ec] text-[#0f6b3a]" };
  if (vistoEm) return { rotulo: "Pendente", detalhe: "", cls: "bg-[#fff8e6] text-[#7a5a00]" };
  return { rotulo: "Aberto", detalhe: "", cls: "bg-brand-soft text-brand-deep" };
}
