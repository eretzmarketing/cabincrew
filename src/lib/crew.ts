export type Modulo = {
  id: number;
  ordem: number;
  titulo: string;
  descricao: string | null;
  fase: string | null;
  publicado: boolean;
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
