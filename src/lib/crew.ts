export type Modulo = {
  id: number;
  ordem: number;
  titulo: string;
  descricao: string | null;
  fase: string | null;
  publicado: boolean;
  recurso: string | null;
};

export type Aula = {
  id: string;
  modulo_id: number;
  ordem: number;
  titulo: string;
  tipo: "texto" | "video" | "pdf" | "simulado";
  resumo: string | null;
  conteudo: string | null;
  video_url: string | null;
  arquivo_url: string | null;
  duracao_min: number | null;
  publicado: boolean;
  simulado_id: number | null;
};

export type Simulado = {
  id: number;
  titulo: string;
  descricao: string | null;
  bancos: string[];
  categorias: string[] | null;
  qtd_questoes: number;
  tempo_min: number | null;
  nota_minima: number;
  mostrar_gabarito: boolean;
};

export type Tentativa = {
  id: string;
  simulado_id: number;
  total: number;
  acertos: number | null;
  nota: number | null;
  iniciada_em: string;
  prazo: string | null;
  finalizada_em: string | null;
};

export type Alternativa = { letra: string; texto: string | null; imagem_url: string | null };

export type QuestaoProva = {
  ordem: number;
  id: string;
  categoria: string | null;
  contexto: string | null;
  enunciado: string;
  imagem_url: string | null;
  alternativas: Alternativa[];
  resposta: string | null;
};

export type QuestaoGabarito = QuestaoProva & { correta: string | null; explicacao: string | null };

export const BANCOS: Record<string, string> = {
  anac: "Banca ANAC",
  tecnico: "Técnicas",
  portugues: "Português",
  ingles: "Inglês",
  logico: "Raciocínio lógico",
  numerico: "Raciocínio numérico",
  verbal: "Raciocínio verbal",
  sjt: "Julgamento situacional (SJT)",
};

export const TIPO_AULA: Record<Aula["tipo"], string> = {
  texto: "Leitura",
  video: "Vídeo",
  pdf: "Material em PDF",
  simulado: "Simulado",
};

export function numeroModulo(ordem: number) {
  return String(ordem).padStart(2, "0");
}

/** Converte links do YouTube e do Vimeo em endereço de incorporação; outros links ficam como estão. */
export function videoEmbed(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
    if (host === "player.vimeo.com") return url;
    return null;
  } catch {
    return null;
  }
}

export function duracao(min: number | null) {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
