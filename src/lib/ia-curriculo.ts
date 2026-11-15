/**
 * Análise do currículo com IA, no estilo dos sistemas de triagem (ATS) usados pelas companhias.
 * 1) lê o texto do PDF/Word como um robô de triagem leria (se não houver texto, o ATS também não lê);
 * 2) faz conferências automáticas (contato, seções, tamanho);
 * 3) a IA avalia como recrutador + ATS e sugere melhorias.
 * O arquivo fica só na memória: não é gravado no servidor.
 */
import { ErroIA, type ConfigIA } from "@/lib/ia-video";
import { CRITERIOS_CV, type ConferenciaCV, type FeedbackCV } from "@/lib/ia-curriculo-tipos";

export { CRITERIOS_CV, type FeedbackCV };

const API = () => process.env.OPENAI_API_BASE || "https://api.openai.com";
export const MAX_CV = 5 * 1024 * 1024;
const TIPOS = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export type LeituraCV = { texto: string; paginas: number | null; formato: "pdf" | "docx" };

/** Extrai o texto do arquivo, do jeito que um ATS faria. */
export async function lerCurriculo(arquivo: File): Promise<LeituraCV> {
  const nome = arquivo.name.toLowerCase();
  const buf = new Uint8Array(await arquivo.arrayBuffer());
  const ehPdf = TIPOS.pdf.includes(arquivo.type) || nome.endsWith(".pdf");
  const ehDocx = TIPOS.docx.includes(arquivo.type) || nome.endsWith(".docx");
  if (ehPdf) {
    if (String.fromCharCode(...buf.subarray(0, 4)) !== "%PDF") throw new ErroIA("Este arquivo não parece ser um PDF válido.");
    const { extractText, getDocumentProxy } = await import("unpdf");
    try {
      const pdf = await getDocumentProxy(buf);
      const { totalPages, text } = await extractText(pdf, { mergePages: true });
      return { texto: limpar(text), paginas: totalPages, formato: "pdf" };
    } catch {
      throw new ErroIA("Não foi possível abrir este PDF. Se ele tem senha, salve uma cópia sem senha e envie de novo.");
    }
  }
  if (ehDocx) {
    if (buf[0] !== 0x50 || buf[1] !== 0x4b) throw new ErroIA("Este arquivo não parece ser um Word (.docx) válido.");
    const mammoth = await import("mammoth");
    try {
      const r = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
      return { texto: limpar(r.value), paginas: null, formato: "docx" };
    } catch {
      throw new ErroIA("Não foi possível abrir este arquivo do Word. Salve de novo como .docx ou exporte em PDF.");
    }
  }
  throw new ErroIA("Envie o currículo em PDF ou Word (.docx). Arquivos .doc antigos: abra no Word e salve como .docx.");
}

const limpar = (t: string) => t.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

const SECOES: [string, RegExp][] = [
  ["Experiência", /experi[eê]ncia|hist[oó]rico profissional/i],
  ["Formação", /forma[cç][aã]o|escolaridade|educa[cç][aã]o/i],
  ["Idiomas", /idiomas?|l[ií]nguas?/i],
  ["Objetivo ou resumo", /objetivo|resumo|perfil profissional|sobre mim/i],
];

/** Conferências automáticas no texto (sem IA). */
export function conferir(l: LeituraCV): ConferenciaCV[] {
  const t = l.texto;
  const palavras = t.split(/\s+/).filter(Boolean).length;
  const c: ConferenciaCV[] = [];
  c.push({ id: "texto", ok: palavras >= 80, texto: palavras >= 80 ? "O robô consegue ler o texto do arquivo" : "O robô leu pouco texto: o currículo pode estar em imagem ou com muito design" });
  c.push({ id: "email", ok: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(t), texto: "E-mail de contato" });
  c.push({ id: "telefone", ok: /(\(?\d{2}\)?\s?)?9?\s?\d{4}[-\s.]\d{4}/.test(t), texto: "Telefone ou WhatsApp" });
  c.push({ id: "cidade", ok: /\b[A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+\s?[-–/,]\s?(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/.test(t), texto: "Cidade e estado" });
  c.push({ id: "linkedin", ok: /linkedin\.com\//i.test(t), texto: "Link do LinkedIn" });
  for (const [nome, re] of SECOES) c.push({ id: `secao-${nome}`, ok: re.test(t), texto: `Seção “${nome}”` });
  if (l.paginas !== null) c.push({ id: "paginas", ok: l.paginas <= 2, texto: l.paginas <= 2 ? `${l.paginas} página${l.paginas > 1 ? "s" : ""} (ideal: 1 ou 2)` : `${l.paginas} páginas: o ideal é 1 ou 2` });
  return c;
}

/* ------------------------------------------------------------------ IA */

const ESQUEMA = {
  type: "object", additionalProperties: false,
  required: ["nota", "resumo", "criterios", "pontos_fortes", "melhorar", "palavras_faltando", "resumo_sugerido", "experiencias"],
  properties: {
    nota: { type: "integer", description: "Nota geral de 0 a 100" },
    resumo: { type: "string", description: "Duas ou três frases com a impressão geral, falando direto com o candidato (você)" },
    criterios: {
      type: "array", description: "Um item para cada um dos 8 critérios",
      items: {
        type: "object", additionalProperties: false, required: ["id", "nota", "comentario"],
        properties: {
          id: { type: "string", enum: CRITERIOS_CV.map((c) => c.id) },
          nota: { type: "integer", description: "0 a 10" },
          comentario: { type: "string", description: "Uma frase objetiva: o que viu e o que fazer" },
        },
      },
    },
    pontos_fortes: { type: "array", items: { type: "string" }, description: "2 a 4 pontos fortes" },
    melhorar: { type: "array", items: { type: "string" }, description: "3 a 6 correções práticas, em ordem de importância" },
    palavras_faltando: { type: "array", items: { type: "string" }, description: "Até 10 palavras-chave da vaga de comissário que faltam no currículo e que o candidato poderia incluir com verdade" },
    resumo_sugerido: { type: "string", description: "Resumo profissional reescrito (3 a 5 linhas), usando apenas fatos do currículo" },
    experiencias: {
      type: "array", description: "Até 3 frases de experiência reescritas com foco em atendimento, segurança e resultados, usando só fatos do currículo",
      items: { type: "object", additionalProperties: false, required: ["antes", "depois"], properties: { antes: { type: "string" }, depois: { type: "string" } } },
    },
  },
};

export async function avaliarCurriculo(cfg: ConfigIA, d: { leitura: LeituraCV; conferencias: ConferenciaCV[]; companhia?: string }): Promise<FeedbackCV> {
  const sistema = [
    "Você é recrutador(a) experiente de comissários de voo no Brasil (LATAM, GOL, Azul) e conhece os sistemas de triagem de currículos (ATS, como a Gupy).",
    "Avalie o currículo de um candidato à vaga de comissário(a) de voo. O texto abaixo é exatamente o que o ATS conseguiu ler do arquivo: se algo importante não aparece no texto, o robô também não viu.",
    "Seja específico, gentil e direto, em português do Brasil, falando com o candidato (você). Nunca invente experiências, cursos ou dados: nas sugestões reescritas, use apenas fatos que estão no currículo.",
    "O que o recrutador procura: atendimento ao cliente e hospitalidade, trabalho em equipe, comunicação, foco em segurança, resolução de problemas e calma sob pressão, disponibilidade para morar na base e escalas, idiomas (inglês e espanhol, com nível), formação (ensino médio completo; curso de comissário, CHT/CCT ANAC e CMA quando houver), natação/primeiros socorros quando houver.",
    "Para o ATS: currículo em texto simples (sem colunas, tabelas, ícones ou texto em imagem), títulos de seção padrão, palavras-chave da vaga, datas e nomes de empresas claros, contato no topo. Tamanho ideal: 1 a 2 páginas. Não precisa de documentos (RG, CPF), estado civil detalhado ou foto, salvo se a companhia pedir.",
    "Experiências devem mostrar resultados e situações de atendimento, não só tarefas.",
    "Nota geral de 0 a 100: 80 ou mais significa pronto para enviar. Dê nota a cada critério de 0 a 10.",
  ].join("\n");
  const texto = [
    d.companhia ? `Companhia-alvo: ${d.companhia}.` : "Companhia-alvo: não informada (considere LATAM, GOL e Azul).",
    `Formato do arquivo: ${d.leitura.formato.toUpperCase()}${d.leitura.paginas ? `, ${d.leitura.paginas} página(s)` : ""}.`,
    `Conferências automáticas: ${d.conferencias.map((c) => `${c.texto}: ${c.ok ? "ok" : "não encontrado"}`).join("; ")}.`,
    `Texto lido pelo ATS:\n"""${d.leitura.texto.slice(0, 14000)}"""`,
  ].join("\n\n");
  const r = await fetch(`${API()}/v1/chat/completions`, {
    method: "POST", headers: { Authorization: `Bearer ${cfg.chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.modelo,
      messages: [{ role: "system", content: sistema }, { role: "user", content: texto }],
      response_format: { type: "json_schema", json_schema: { name: "feedback_curriculo", strict: true, schema: ESQUEMA } },
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) {
    if (r.status === 401) throw new ErroIA("A chave da OpenAI não é válida. Avise a equipe da Cabin Crew.");
    if (r.status === 429) throw new ErroIA("A análise está ocupada agora. Tente de novo em instantes.");
    throw new ErroIA("Não foi possível analisar o currículo agora. Tente de novo em instantes.");
  }
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  const conteudo = j.choices?.[0]?.message?.content;
  if (!conteudo) throw new ErroIA("A IA não devolveu a avaliação. Tente de novo.");
  const f = JSON.parse(conteudo) as Omit<FeedbackCV, "conferencias">;
  const n = (x: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));
  const ids = new Set<string>(CRITERIOS_CV.map((c) => c.id));
  const s = (x: unknown, max: number) => String(x ?? "").slice(0, max);
  return {
    nota: n(f.nota, 100),
    resumo: s(f.resumo, 800),
    criterios: (f.criterios ?? []).filter((c) => ids.has(c.id)).map((c) => ({ id: c.id, nota: n(c.nota, 10), comentario: s(c.comentario, 400) })),
    pontos_fortes: (f.pontos_fortes ?? []).slice(0, 5).map((x) => s(x, 300)),
    melhorar: (f.melhorar ?? []).slice(0, 7).map((x) => s(x, 300)),
    palavras_faltando: (f.palavras_faltando ?? []).slice(0, 12).map((x) => s(x, 60)),
    resumo_sugerido: s(f.resumo_sugerido, 1200),
    experiencias: (f.experiencias ?? []).slice(0, 4).map((e) => ({ antes: s(e.antes, 400), depois: s(e.depois, 500) })),
    conferencias: d.conferencias,
  };
}
