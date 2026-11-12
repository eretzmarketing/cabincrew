/** Painel de alunos do Head Hunter (admin): tipos, situação e risco. */
import { TODAS_AULAS } from "@/lib/ingles-a-bordo";
import { COMPANHIAS, META, diaSP } from "@/lib/jornada";

export type LinhaAluno = {
  id: string; nome: string | null; apelido: string | null; email: string | null; whatsapp: string | null;
  cadastro: string; bloqueado: boolean; companhia: string | null; data_meta: string | null;
  ultima: string | null; dias_14: number; aulas: number; treinos: number; media_treino_30: number | null;
  provas: number; melhor_prova: number | null; media_prova: number | null; ingles: number; opq: number;
  melhor_video: number | null; pontos_semana: number;
};

export type Situacao = "ativo" | "esfriando" | "parado" | "nunca";

export const SITUACOES: Record<Situacao, { rotulo: string; cor: string; explica: string }> = {
  ativo: { rotulo: "Ativo", cor: "bg-[#e5f6ec] text-[#0f6b3a]", explica: "estudou nos últimos 2 dias" },
  esfriando: { rotulo: "Esfriando", cor: "bg-[#fff8e6] text-[#7a5a00]", explica: "3 a 6 dias sem estudar" },
  parado: { rotulo: "Parado", cor: "bg-brand-soft text-brand-deep", explica: "7 dias ou mais sem estudar" },
  nunca: { rotulo: "Não começou", cor: "bg-[#eceef3] text-ink-2", explica: "cadastrado, sem nenhuma atividade" },
};

export const TOTAL_INGLES = TODAS_AULAS.length;

export function diasDesde(iso: string | null, hoje = diaSP(new Date())) {
  if (!iso) return null;
  return Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${diaSP(iso)}T12:00:00Z`)) / 86400000);
}

export function situacao(l: LinhaAluno): Situacao {
  const d = diasDesde(l.ultima);
  if (d === null) return "nunca";
  if (d <= 2) return "ativo";
  if (d <= 6) return "esfriando";
  return "parado";
}

export function diasParaMeta(l: { data_meta: string | null }, hoje = diaSP(new Date())) {
  if (!l.data_meta) return null;
  return Math.round((Date.parse(`${l.data_meta}T12:00:00Z`) - Date.parse(`${hoje}T12:00:00Z`)) / 86400000);
}

/** Motivos para o aluno estar em risco (lista vazia = sem risco). */
export function riscos(l: LinhaAluno): string[] {
  if (situacao(l) === "nunca") return [];
  const r: string[] = [];
  const faltam = diasParaMeta(l);
  const s = situacao(l);
  if (faltam !== null && faltam >= 0 && faltam <= 45) {
    if (s !== "ativo") r.push(`seleção em ${faltam} dias e ${s === "parado" ? "parado" : "esfriando"}`);
    if (l.media_treino_30 !== null && l.media_treino_30 < META) r.push(`média ${l.media_treino_30}% nos treinos, faltando ${faltam} dias`);
  }
  if (s === "parado" && l.dias_14 === 0 && l.aulas + l.treinos >= 3) r.push("estudava e parou");
  if (l.treinos >= 5 && l.media_treino_30 !== null && l.media_treino_30 < 50) r.push(`média baixa nos treinos (${l.media_treino_30}%)`);
  return r;
}

export const nomeAluno = (l: { nome: string | null; apelido: string | null; email?: string | null }) => l.nome || l.apelido || l.email || "Sem nome";
export const nomeCompanhia = (slug: string | null) => COMPANHIAS.find((c) => c.slug === slug)?.nome ?? null;

/** Link de WhatsApp com mensagem pronta. */
export function linkWhatsapp(whatsapp: string | null, texto: string) {
  const n = (whatsapp ?? "").replace(/\D/g, "");
  if (n.length < 10) return null;
  const numero = n.length <= 11 ? `55${n}` : n;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function mensagemSugerida(l: LinhaAluno) {
  const primeiro = nomeAluno(l).split(" ")[0];
  const s = situacao(l);
  const cia = nomeCompanhia(l.companhia);
  if (s === "nunca") return `Oi, ${primeiro}! Aqui é o Daniel, do Cabin Crew. Vi que você se cadastrou no Head Hunter, mas ainda não começou. Comece pelo check-in: em 2 minutos você monta a sua jornada${cia ? "" : " para a companhia dos seus sonhos"}. Posso te ajudar em algo?`;
  if (s === "ativo") return `Oi, ${primeiro}! Aqui é o Daniel, do Cabin Crew. Parabéns pela constância no Head Hunter! Continue assim${cia ? ` rumo à ${cia}` : ""}. ✈️`;
  return `Oi, ${primeiro}! Aqui é o Daniel, do Cabin Crew. Senti sua falta no Head Hunter${cia ? ` e na sua preparação para a ${cia}` : ""}. Que tal voltar hoje com a Missão do dia? São só 30 minutos. Se estiver com alguma dificuldade, me conta!`;
}

export const dataCurta = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }) : "—");

export function quando(iso: string | null) {
  const d = diasDesde(iso);
  if (d === null) return "nunca";
  if (d === 0) return "hoje";
  if (d === 1) return "ontem";
  return `há ${d} dias`;
}
