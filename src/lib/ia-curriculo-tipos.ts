/** Critérios e formato da análise de currículo (servem no navegador e no servidor). */
export const CRITERIOS_CV = [
  { id: "leitura", nome: "Leitura pelo robô (ATS)", grupo: "Robô (ATS)" },
  { id: "palavras", nome: "Palavras-chave da vaga", grupo: "Robô (ATS)" },
  { id: "secoes", nome: "Seções e organização", grupo: "Robô (ATS)" },
  { id: "objetivo", nome: "Objetivo e resumo", grupo: "Conteúdo" },
  { id: "experiencia", nome: "Experiências com resultados", grupo: "Conteúdo" },
  { id: "requisitos", nome: "Idiomas, formação e requisitos", grupo: "Conteúdo" },
  { id: "portugues", nome: "Português e clareza", grupo: "Apresentação" },
  { id: "tamanho", nome: "Tamanho e foco", grupo: "Apresentação" },
] as const;

export type ConferenciaCV = { id: string; texto: string; ok: boolean };

export type FeedbackCV = {
  nota: number;
  resumo: string;
  criterios: { id: string; nota: number; comentario: string }[];
  pontos_fortes: string[];
  melhorar: string[];
  palavras_faltando: string[];
  resumo_sugerido: string;
  experiencias: { antes: string; depois: string }[];
  /** conferências automáticas feitas no texto do arquivo, antes da IA */
  conferencias: ConferenciaCV[];
};

export const NOTA_CV_OK = 80;
