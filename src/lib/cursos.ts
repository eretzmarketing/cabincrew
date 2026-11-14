/** Cursos vendidos na plataforma (cada plano libera um ou mais destes). */
export const CURSOS = [
  { slug: "head-hunter", nome: "Head Hunter", sigla: "HH", endereco: "/head-hunter" },
  { slug: "english", nome: "Flight Attendant English", sigla: "EN", endereco: "/english" },
  { slug: "spanish", nome: "Flight Attendant Spanish", sigla: "ES", endereco: "/spanish" },
] as const;

export type SlugCurso = (typeof CURSOS)[number]["slug"];
export const SLUGS_CURSOS: readonly string[] = CURSOS.map((c) => c.slug);
export const ehCurso = (s: unknown): s is SlugCurso => typeof s === "string" && SLUGS_CURSOS.includes(s);
export const nomeCurso = (s: string) => CURSOS.find((c) => c.slug === s)?.nome ?? s.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
/** Sigla para etiquetas pequenas (cursos criados no admin: iniciais do endereço). */
export const siglaCurso = (s: string) => CURSOS.find((c) => c.slug === s)?.sigla ?? s.split("-").map((p) => p.charAt(0)).join("").slice(0, 3).toUpperCase();
