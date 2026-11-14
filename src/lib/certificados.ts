/** Certificados: modelo (imagem + campos posicionados) e texto de cada campo. */
export type CampoId = "nome" | "curso" | "data" | "nota" | "codigo" | "livre";
export type Fonte = "manuscrita" | "classica" | "titulo" | "texto";
export type Campo = {
  id: string;                 // único no modelo
  tipo: CampoId;
  texto: string;              // com {nome}, {curso}, {data}, {nota}, {codigo}, {link}
  x: number; y: number;       // posição do ponto de ancoragem, em % da largura/altura
  tamanho: number;            // em % da largura da imagem
  cor: string;
  fonte: Fonte;
  negrito: boolean;
  alinhamento: "left" | "center" | "right";
  largura: number;            // largura máxima do texto, em % da largura
  visivel: boolean;
};
export type Modelo = { curso: string; imagem: string | null; largura: number; altura: number; campos: Campo[]; ativo?: boolean; carga_horaria?: string | null; descricao?: string | null };
export type Dados = { nome: string; curso: string; concluido_em: string; nota: number | null; codigo: string; carga?: string | null };

export const CURSOS_CERT: Record<string, string> = { "head-hunter": "Head Hunter", english: "Flight Attendant English", spanish: "Flight Attendant Spanish" };
export const NOMES_CURSO_CERT: Record<string, string> = {
  "head-hunter": "Head Hunter · Preparatório para Seleção de Comissário(a) de Voo",
  english: "Flight Attendant English · Inglês para Aviação",
  spanish: "Flight Attendant Spanish · Espanhol para Aviação",
};

export const FONTES: Record<Fonte, { rotulo: string; familia: string }> = {
  manuscrita: { rotulo: "Manuscrita (Great Vibes)", familia: "'Great Vibes', cursive" },
  classica: { rotulo: "Clássica (Playfair Display)", familia: "'Playfair Display', Georgia, serif" },
  titulo: { rotulo: "Títulos do site (Montserrat)", familia: "var(--font-montserrat), sans-serif" },
  texto: { rotulo: "Texto do site (Inter)", familia: "var(--font-inter), sans-serif" },
};

export const ROTULO_CAMPO: Record<CampoId, string> = { nome: "Nome do aluno", curso: "Curso", data: "Data de conclusão", nota: "Nota", codigo: "Código de verificação", livre: "Texto livre" };

export const CAMPOS_PADRAO: Campo[] = [
  { id: "nome", tipo: "nome", texto: "{nome}", x: 50, y: 46, tamanho: 6, cor: "#1f2a44", fonte: "manuscrita", negrito: false, alinhamento: "center", largura: 80, visivel: true },
  { id: "curso", tipo: "curso", texto: "concluiu o curso {curso}", x: 50, y: 58, tamanho: 1.8, cor: "#3d4660", fonte: "classica", negrito: false, alinhamento: "center", largura: 70, visivel: true },
  { id: "data", tipo: "data", texto: "Concluído em {data}", x: 30, y: 78, tamanho: 1.4, cor: "#3d4660", fonte: "texto", negrito: false, alinhamento: "center", largura: 35, visivel: true },
  { id: "nota", tipo: "nota", texto: "Aproveitamento: {nota}%", x: 70, y: 78, tamanho: 1.4, cor: "#3d4660", fonte: "texto", negrito: false, alinhamento: "center", largura: 35, visivel: true },
  { id: "codigo", tipo: "codigo", texto: "Código {codigo} · verifique em {link}", x: 50, y: 93, tamanho: 0.9, cor: "#6b7287", fonte: "texto", negrito: false, alinhamento: "center", largura: 80, visivel: true },
];

export const dataExtenso = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

export function textoDoCampo(c: Campo, d: Dados, site: string) {
  return c.texto
    .replaceAll("{nome}", d.nome)
    .replaceAll("{curso}", d.curso)
    .replaceAll("{data}", dataExtenso(d.concluido_em))
    .replaceAll("{nota}", d.nota == null ? "—" : Number(d.nota).toLocaleString("pt-BR", { maximumFractionDigits: 1 }))
    .replaceAll("{codigo}", d.codigo)
    .replaceAll("{carga}", d.carga || "")
    .replaceAll("{link}", `${site.replace(/^https?:\/\//, "")}/autenticar`);
}

export const EXEMPLO: Dados = { nome: "Ana Beatriz Carvalho Lima", curso: "", concluido_em: "2026-11-13T15:00:00-03:00", nota: 87.5, codigo: "AB12CD34" };
