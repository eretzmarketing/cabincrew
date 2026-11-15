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

/** nivel: "alerta" = encontrado, mas com problema; "dica" = opcional (diferencial) */
export type ConferenciaCV = { id: string; texto: string; ok: boolean; nivel?: "alerta" | "dica" };

export const TIPOS_REQUISITO = {
  exigido: { nome: "Exigido", plural: "Exigidos", desc: "As companhias pedem. Se faltar, o currículo perde pontos." },
  diferencial: { nome: "Diferencial", plural: "Diferenciais", desc: "Opcional, mas conta muito a favor." },
  palavra: { nome: "Palavra-chave", plural: "Palavras-chave", desc: "Termo que o robô de triagem procura." },
} as const;
export type TipoRequisito = keyof typeof TIPOS_REQUISITO;

/** Requisito configurado no admin (Admin › Head Hunter › Currículo: requisitos). */
export type RequisitoCV = { id: number; nome: string; tipo: TipoRequisito; termos: string[]; validade_meses: number | null; instrucao: string | null; ativo: boolean; ordem: number };

/** Resultado da busca de um requisito no texto do currículo. */
export type ResultadoRequisito = { nome: string; tipo: TipoRequisito; status: "ok" | "ausente" | "sem_validade" | "vencendo"; detalhe?: string };

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
  /** requisitos e palavras-chave configurados no admin, procurados no texto */
  requisitos?: ResultadoRequisito[];
};

export const NOTA_CV_OK = 80;
