/** Critérios e formato do feedback da IA (servem no navegador e no servidor). */
export const CRITERIOS_IA = [
  { id: "estrutura", nome: "Roteiro e estrutura", grupo: "Conteúdo" },
  { id: "exemplo", nome: "Exemplo concreto", grupo: "Conteúdo" },
  { id: "motivacao", nome: "Motivação e companhia", grupo: "Conteúdo" },
  { id: "tempo", nome: "Tempo", grupo: "Conteúdo" },
  { id: "clareza", nome: "Clareza e ritmo da fala", grupo: "Comunicação" },
  { id: "vicios", nome: "Vícios de linguagem", grupo: "Comunicação" },
  { id: "naturalidade", nome: "Naturalidade", grupo: "Comunicação" },
  { id: "olhar", nome: "Olhar para a câmera", grupo: "Imagem" },
  { id: "expressao", nome: "Sorriso e expressão", grupo: "Imagem" },
  { id: "imagem", nome: "Postura, roupa e cabelo", grupo: "Imagem" },
  { id: "ambiente", nome: "Luz, fundo e enquadramento", grupo: "Imagem" },
] as const;

export type FeedbackIA = {
  nota: number;
  resumo: string;
  criterios: { id: string; nota: number; comentario: string }[];
  pontos_fortes: string[];
  melhorar: string[];
  abertura_sugerida: string;
};

