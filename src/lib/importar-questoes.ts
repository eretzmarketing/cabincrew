/** Leitura e validação da planilha de importação de questões (usada no navegador e no servidor). */

export const LETRAS = ["A", "B", "C", "D", "E"] as const;

export type QuestaoImportada = {
  id: string | null; // preenchido quando a planilha veio do "Exportar CSV": atualiza a questão existente
  categoria: string | null;
  contexto: string | null;
  enunciado: string;
  imagem_url: string | null;
  alternativas: { letra: string; texto: string | null; imagem_url: string | null }[];
  correta: string;
  explicacao: string | null;
  ativo: boolean;
};

export type LinhaLida = { linha: number; questao?: QuestaoImportada; erro?: string };

/** Colunas aceitas (o nome do cabeçalho pode variar um pouco). */
const COLUNAS: Record<string, string[]> = {
  id: ["id"],
  categoria: ["tema", "categoria", "materia", "bloco", "assunto"],
  contexto: ["texto de apoio", "contexto", "texto", "apoio"],
  enunciado: ["enunciado", "pergunta", "questao", "question"],
  imagem_url: ["imagem", "imagem da questao", "imagem_url", "url da imagem"],
  A: ["a", "alternativa a", "opcao a", "option_a"],
  B: ["b", "alternativa b", "opcao b", "option_b"],
  C: ["c", "alternativa c", "opcao c", "option_c"],
  D: ["d", "alternativa d", "opcao d", "option_d"],
  E: ["e", "alternativa e", "opcao e", "option_e"],
  correta: ["correta", "resposta", "resposta correta", "gabarito", "correct_answer"],
  explicacao: ["explicacao", "comentario", "justificativa"],
  ativo: ["nos simulados", "ativo", "usar nos simulados"],
};

const normal = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9_ ]/g, " ").replace(/\s+/g, " ").trim();

/** Decodifica o arquivo: UTF-8 ou, se falhar, o padrão do Excel no Windows (Windows-1252). */
export function decodificar(buf: ArrayBuffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}

/** CSV com ";" (Excel em português) ou ",", com aspas e quebras de linha dentro das células. */
export function lerCsv(texto: string): string[][] {
  const primeira = texto.slice(0, texto.indexOf("\n") >>> 0 || texto.length);
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; } else aspas = false;
      } else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      if (linha.some((v) => v.trim())) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((v) => v.trim())) linhas.push(linha);
  return linhas;
}

/** Descobre qual coluna é qual. Devolve o índice de cada campo e as colunas obrigatórias que faltam. */
export function mapearCabecalho(cab: string[]) {
  const idx: Record<string, number> = {};
  cab.forEach((h, i) => {
    const n = normal(h);
    for (const [campo, nomes] of Object.entries(COLUNAS)) if (idx[campo] === undefined && nomes.includes(n)) idx[campo] = i;
  });
  const faltam = ["enunciado", "A", "B", "correta"].filter((c) => idx[c] === undefined);
  return { idx, faltam };
}

const limpo = (v: string | undefined, max: number) => {
  const s = (v ?? "").trim().replace(/^'(?=[=+\-@])/, ""); // tira o apóstrofo que o Exportar CSV coloca antes de "=" etc.
  return s ? s.slice(0, max) : null;
};
const ehUrl = (v: string) => /^https?:\/\/\S+$/i.test(v) || v.startsWith("/");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Converte e valida uma linha da planilha. */
export function lerLinha(cells: string[], idx: Record<string, number>, linha: number): LinhaLida {
  const v = (campo: string, max = 4000) => (idx[campo] === undefined ? null : limpo(cells[idx[campo]], max));
  const enunciado = v("enunciado");
  if (!enunciado) return { linha, erro: "Enunciado vazio." };

  const alternativas: QuestaoImportada["alternativas"] = [];
  for (const L of LETRAS) {
    const bruto = v(L, 2000);
    if (!bruto) continue;
    // a célula pode ter texto e/ou um endereço de imagem no fim
    const m = bruto.match(/^(.*?)\s*(https?:\/\/\S+|\/\S+\.(?:png|jpe?g|webp|gif|svg))$/i);
    alternativas.push({ letra: L, texto: m ? m[1].trim() || null : bruto, imagem_url: m ? m[2] : null });
  }
  if (alternativas.length < 2) return { linha, erro: "Preencha pelo menos duas alternativas." };

  const corretaBruta = (v("correta", 10) ?? "").toUpperCase().replace(/[^A-E]/g, "");
  const pos = alternativas.findIndex((a) => a.letra === corretaBruta);
  if (corretaBruta.length !== 1 || pos < 0) return { linha, erro: `Resposta correta "${v("correta", 10) ?? ""}" inválida: use a letra de uma alternativa preenchida.` };

  const imagem = v("imagem_url", 500);
  if (imagem && !ehUrl(imagem)) return { linha, erro: "Imagem da questão: use um endereço que comece com https://." };

  // letras sem buraco (se pulou a C, a D vira C)
  const alts = alternativas.map((a, i) => ({ ...a, letra: LETRAS[i] }));
  const ativoBruto = normal(v("ativo", 10) ?? "sim");
  const id = v("id", 40);

  return {
    linha,
    questao: {
      id: id && UUID.test(id) ? id : null,
      categoria: v("categoria", 120),
      contexto: v("contexto", 6000),
      enunciado,
      imagem_url: imagem,
      alternativas: alts,
      correta: LETRAS[pos],
      explicacao: v("explicacao"),
      ativo: !["nao", "n", "false", "0", "fora"].includes(ativoBruto),
    },
  };
}

/** Texto comparável para achar questões repetidas. */
export const chaveEnunciado = (s: string) => normal(s).slice(0, 300);

/** Cabeçalho e linhas de exemplo da planilha-modelo (as linhas de exemplo são ignoradas na importação). */
export const CABECALHO_MODELO = ["tema", "texto de apoio", "enunciado", "imagem", "A", "B", "C", "D", "E", "correta", "explicação", "nos simulados"];
export const EXEMPLOS: Record<string, string[][]> = {
  anac: [
    ["Segurança e Emergência", "", "Em caso de despressurização da cabine, o comissário deve primeiro:", "", "Colocar a própria máscara de oxigênio", "Ajudar os passageiros", "Avisar o comandante", "Pegar o extintor", "", "A", "Primeiro a própria máscara: sem oxigênio o comissário perde a consciência e não ajuda ninguém.", "sim"],
    ["Legislação Aeronáutica", "", "Qual órgão regula a aviação civil no Brasil?", "", "INFRAERO", "ANAC", "DECEA", "CENIPA", "", "B", "", "sim"],
  ],
  portugues: [["Concordância", "", "Assinale a frase correta:", "", "Fazem dois anos que voei.", "Faz dois anos que voei.", "Fazem dois ano que voei.", "Faz dois ano que voei.", "", "B", "O verbo fazer indicando tempo é impessoal: fica no singular.", "sim"]],
  ingles: [["Vocabulary", "", "What does \"boarding pass\" mean?", "", "A baggage tag", "A document to enter the aircraft", "A visa", "A seat belt", "", "B", "", "sim"]],
  logico: [
    ["Sequências", "", "Qual número continua a sequência 2, 4, 8, 16, ...?", "", "18", "24", "32", "64", "", "C", "Cada número é o dobro do anterior.", "sim"],
    ["Matrizes", "", "Qual figura completa a matriz?", "/raven-questions/raven-q15.png", "A", "B", "C", "D", "", "B", "Quando a figura já mostra as opções A–D, as alternativas são só as letras.", "sim"],
  ],
  numerico: [["Raciocínio numérico", "Vendas por trimestre: T1 = 120, T2 = 150, T3 = 90, T4 = 140.", "Qual foi o total vendido no ano?", "", "480", "500", "520", "460", "", "B", "120 + 150 + 90 + 140 = 500.", "sim"]],
  verbal: [["Raciocínio verbal", "As companhias aéreas exigem inglês intermediário para voos internacionais.", "Com base no texto, é correto afirmar que:", "", "Todos os voos exigem inglês", "Voos internacionais exigem inglês intermediário", "Inglês não é exigido", "Só voos nacionais exigem inglês", "", "B", "", "sim"]],
  sjt: [["Julgamento situacional", "", "Um passageiro se recusa a apertar o cinto antes do pouso. Qual a melhor atitude?", "", "Ignorar e seguir para o assento", "Explicar com calma o motivo de segurança e pedir de novo", "Chamar a polícia imediatamente", "Apertar o cinto à força", "", "B", "", "sim"]],
  tecnico: [["Equipamentos", "", "Qual a função do PBE?", "", "Flutuação na água", "Proteção respiratória em caso de fumaça", "Comunicação de emergência", "Iluminação da cabine", "", "B", "", "sim"]],
};

export const ENUNCIADOS_EXEMPLO = new Set(Object.values(EXEMPLOS).flat().map((l) => chaveEnunciado(l[2])));
