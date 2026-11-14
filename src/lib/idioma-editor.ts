/**
 * Editor das aulas de idioma no admin: cada lista vira texto simples (uma linha por item, partes separadas por " | ")
 * e volta para o formato da aula. Funciona no navegador e no servidor.
 */
import type { Atividade, AulaIngles, Questao } from "@/lib/ingles-a-bordo";

const linhas = (t: string) => t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const partes = (l: string) => l.split("|").map((p) => p.trim());

/* ---------- diálogo: "Quem | fala no idioma | tradução" ---------- */
export const falasParaTexto = (a: AulaIngles) => a.dialogo.falas.map((f) => `${f.quem} | ${f.en} | ${f.pt}`).join("\n");
export function textoParaFalas(t: string) {
  const erros: string[] = [];
  const falas = linhas(t).map((l, i) => {
    const [quem, en, pt] = partes(l);
    if (!quem || !en) erros.push(`Diálogo, linha ${i + 1}: use "Quem | fala | tradução".`);
    return { quem: (quem ?? "").slice(0, 40), en: (en ?? "").slice(0, 600), pt: (pt ?? "").slice(0, 600) };
  });
  return { falas, erros };
}

/* ---------- vocabulário: "palavra | tradução" ---------- */
export const vocabParaTexto = (a: AulaIngles) => a.vocabulario.map((v) => `${v.en} | ${v.pt}`).join("\n");
export function textoParaVocab(t: string) {
  const erros: string[] = [];
  const itens = linhas(t).map((l, i) => {
    const [en, pt] = partes(l);
    if (!en || !pt) erros.push(`Vocabulário, linha ${i + 1}: use "palavra | tradução".`);
    return { en: (en ?? "").slice(0, 200), pt: (pt ?? "").slice(0, 200) };
  });
  return { itens, erros };
}

/* ---------- expressões: "expressão | tradução | quando usar (opcional)" ---------- */
export const expressoesParaTexto = (a: AulaIngles) => a.expressoes.map((e) => [e.en, e.pt, e.uso].filter((x) => x !== undefined && x !== "").join(" | ")).join("\n");
export function textoParaExpressoes(t: string) {
  const erros: string[] = [];
  const itens = linhas(t).map((l, i) => {
    const [en, pt, uso] = partes(l);
    if (!en || !pt) erros.push(`Expressões, linha ${i + 1}: use "expressão | tradução | quando usar".`);
    return { en: (en ?? "").slice(0, 300), pt: (pt ?? "").slice(0, 300), ...(uso ? { uso: uso.slice(0, 300) } : {}) };
  });
  return { itens, erros };
}

/* ---------- quiz ----------
   Pergunta na primeira linha; "*" antes da certa, "-" antes das erradas, "=" antes da explicação.
   Uma linha em branco entre as perguntas. */
export const quizParaTexto = (q: Questao[]) =>
  q.map((x) => [x.pergunta, ...x.opcoes.map((o) => `${o.certa ? "*" : "-"} ${o.texto}`), x.explicacao ? `= ${x.explicacao}` : ""].filter(Boolean).join("\n")).join("\n\n");
export function textoParaQuiz(t: string, nome = "Quiz") {
  const erros: string[] = [];
  const blocos = t.split(/\r?\n\s*\r?\n/).map((b) => linhas(b)).filter((b) => b.length);
  const questoes: Questao[] = blocos.map((b, i) => {
    const pergunta = b[0].replace(/^\d+[).]\s*/, "").slice(0, 500);
    const opcoes = b.slice(1).filter((l) => /^[*-]/.test(l)).map((l) => ({ texto: l.slice(1).trim().slice(0, 300), ...(l.startsWith("*") ? { certa: true } : {}) }));
    const explicacao = b.slice(1).filter((l) => l.startsWith("=")).map((l) => l.slice(1).trim()).join(" ").slice(0, 800);
    if (opcoes.length < 2) erros.push(`${nome}, pergunta ${i + 1}: coloque pelo menos 2 alternativas (linhas começando com * ou -).`);
    if (opcoes.filter((o) => o.certa).length !== 1) erros.push(`${nome}, pergunta ${i + 1}: marque exatamente 1 alternativa certa com *.`);
    return { pergunta, opcoes, explicacao };
  });
  return { questoes, erros };
}

/* ---------- atividades (formato avançado, em JSON) ---------- */
const TIPOS = ["compreensao", "ditado", "ordenar", "ligar", "lacunas", "falar", "roleplay"];
export const atividadesParaTexto = (a: AulaIngles) => JSON.stringify(a.atividades, null, 2);
export function textoParaAtividades(t: string): { atividades: Atividade[]; erros: string[] } {
  if (!t.trim()) return { atividades: [], erros: [] };
  try {
    const v = JSON.parse(t) as unknown;
    if (!Array.isArray(v)) return { atividades: [], erros: ["Atividades: o texto precisa começar com [ e terminar com ]."] };
    const ruins = v.filter((x) => !x || typeof x !== "object" || !TIPOS.includes((x as { tipo?: string }).tipo ?? ""));
    if (ruins.length) return { atividades: [], erros: [`Atividades: cada atividade precisa de "tipo" (${TIPOS.join(", ")}).`] };
    return { atividades: v as Atividade[], erros: [] };
  } catch (e) {
    return { atividades: [], erros: [`Atividades: o formato está com erro (${(e as Error).message.slice(0, 120)}). Desfaça a última mudança ou use "Restaurar o original".`] };
  }
}
