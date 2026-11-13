/** Campanhas de WhatsApp: público, filtros e rótulos. */
export type PessoaAluno = {
  id: string; nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; cadastro: string;
  bloqueado: boolean; companhia: string | null; ultima: string | null; aulas: number; ingles: number; compras: number; produtos: string[];
};
export type PessoaLista = { id: string; nome: string; telefone: string; pais: string; created_at: string };

export type Destinatario = { id: string; nome: string; telefone: string | null; email?: string | null; escola?: string | null; cadastro: string; detalhe?: string };

export const CURSOS: Record<string, { rotulo: string; testa: (p: PessoaAluno) => boolean }> = {
  checkin: { rotulo: "Fez o check-in do Head Hunter", testa: (p) => !!p.companhia },
  sem_checkin: { rotulo: "Ainda não fez o check-in", testa: (p) => !p.companhia },
  estudou: { rotulo: "Concluiu alguma aula do Head Hunter", testa: (p) => p.aulas > 0 },
  nunca_estudou: { rotulo: "Nunca estudou (nenhuma atividade)", testa: (p) => !p.ultima },
  ingles: { rotulo: "Começou o Flight Attendant English", testa: (p) => p.ingles > 0 },
  ingles_completo: { rotulo: "Concluiu o Flight Attendant English", testa: (p) => p.ingles >= 44 },
  comprou: { rotulo: "Tem compra aprovada", testa: (p) => p.compras > 0 },
  nunca_comprou: { rotulo: "Nunca comprou", testa: (p) => p.compras === 0 },
};

export const SITUACOES_CAMPANHA: Record<string, { rotulo: string; testa: (dias: number | null) => boolean }> = {
  ativo: { rotulo: "Ativo (estudou nos últimos 2 dias)", testa: (d) => d !== null && d <= 2 },
  esfriando: { rotulo: "Esfriando (3 a 6 dias)", testa: (d) => d !== null && d >= 3 && d <= 6 },
  parado: { rotulo: "Parado (7 dias ou mais)", testa: (d) => d !== null && d >= 7 },
};

export const INTERVALOS = [
  { id: "15-30", min: 15, max: 30, rotulo: "15 a 30 segundos (rápido, mais risco)" },
  { id: "30-60", min: 30, max: 60, rotulo: "30 a 60 segundos (recomendado)" },
  { id: "60-120", min: 60, max: 120, rotulo: "1 a 2 minutos (mais seguro)" },
  { id: "120-300", min: 120, max: 300, rotulo: "2 a 5 minutos (bem seguro)" },
];

export const STATUS_CAMPANHA: Record<string, { rotulo: string; cor: string }> = {
  enviando: { rotulo: "Enviando", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  pausada: { rotulo: "Pausada", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  concluida: { rotulo: "Concluída", cor: "bg-[#eceef3] text-ink-2" },
  cancelada: { rotulo: "Cancelada", cor: "bg-brand-soft text-brand-deep" },
};

export function duracaoEstimada(qtd: number, min: number, max: number) {
  const s = Math.max(0, qtd - 1) * ((min + max) / 2);
  if (s < 90) return `${Math.round(s)} segundos`;
  if (s < 5400) return `${Math.round(s / 60)} minutos`;
  return `${(s / 3600).toFixed(1).replace(".", ",")} horas`;
}
