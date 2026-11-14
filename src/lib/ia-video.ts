/**
 * Feedback da IA no vídeo de apresentação (OpenAI): transcreve a fala e avalia o vídeo
 * (texto da fala + algumas fotos tiradas da gravação) como um avaliador de seleção de comissários.
 * A chave fica só no servidor, no arquivo ~/.cabincrew-openai.json (Admin › Configurações › Inteligência artificial).
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { BLOCOS_VIDEO } from "@/lib/video";
import { CRITERIOS_IA, type FeedbackIA } from "@/lib/ia-video-tipos";

export { CRITERIOS_IA, type FeedbackIA };

export const ARQUIVO_OPENAI = process.env.OPENAI_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-openai.json");
const API = () => process.env.OPENAI_API_BASE || "https://api.openai.com";

export type ConfigIA = { chave: string; modelo: string; transcricao: string; porDia: number; ativo: boolean };
export const MODELO_PADRAO = "gpt-5-mini";
export const TRANSCRICAO_PADRAO = "gpt-4o-mini-transcribe";

export function configIA(): ConfigIA | null {
  try {
    const j = JSON.parse(readFileSync(ARQUIVO_OPENAI, "utf8")) as Partial<ConfigIA>;
    if (!j.chave) return null;
    return { chave: j.chave, modelo: j.modelo || MODELO_PADRAO, transcricao: j.transcricao || TRANSCRICAO_PADRAO, porDia: j.porDia ?? 3, ativo: j.ativo !== false };
  } catch {
    return null;
  }
}

export class ErroIA extends Error {}

async function erroDaApi(r: Response) {
  const j = (await r.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
  if (r.status === 401) return new ErroIA("A chave da OpenAI não é válida. Confira em Admin › Configurações › Inteligência artificial.");
  if (r.status === 429) return new ErroIA(j?.error?.code === "insufficient_quota" ? "A conta da OpenAI está sem crédito. Adicione saldo em platform.openai.com." : "A OpenAI está ocupada agora. Tente de novo em instantes.");
  return new ErroIA(`A OpenAI respondeu ${r.status}${j?.error?.message ? `: ${j.error.message.slice(0, 200)}` : "."}`);
}

/** Confere a chave antes de salvar. */
export async function testarChaveIA(chave: string): Promise<string | null> {
  try {
    const r = await fetch(`${API()}/v1/models`, { headers: { Authorization: `Bearer ${chave}` }, signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!r.ok) return (await erroDaApi(r)).message;
    return null;
  } catch {
    return "Não foi possível falar com a OpenAI agora.";
  }
}

/** Fala do vídeo em texto (português). */
export async function transcrever(cfg: ConfigIA, video: Blob, nome: string): Promise<string> {
  const fd = new FormData();
  fd.set("file", video, nome);
  fd.set("model", cfg.transcricao);
  fd.set("language", "pt");
  fd.set("response_format", "json");
  const r = await fetch(`${API()}/v1/audio/transcriptions`, { method: "POST", headers: { Authorization: `Bearer ${cfg.chave}` }, body: fd, signal: AbortSignal.timeout(120000) });
  if (!r.ok) throw await erroDaApi(r);
  const j = (await r.json()) as { text?: string };
  return (j.text ?? "").trim();
}

/* ------------------------------------------------------------------ avaliação */

const ESQUEMA = {
  type: "object", additionalProperties: false,
  required: ["nota", "resumo", "criterios", "pontos_fortes", "melhorar", "abertura_sugerida"],
  properties: {
    nota: { type: "integer", description: "Nota geral de 0 a 100" },
    resumo: { type: "string", description: "Duas ou três frases com a impressão geral, falando direto com o candidato (você)" },
    criterios: {
      type: "array", description: "Um item para cada um dos 11 critérios",
      items: {
        type: "object", additionalProperties: false, required: ["id", "nota", "comentario"],
        properties: {
          id: { type: "string", enum: CRITERIOS_IA.map((c) => c.id) },
          nota: { type: "integer", description: "0 a 10" },
          comentario: { type: "string", description: "Uma frase objetiva, com o que viu e o que fazer" },
        },
      },
    },
    pontos_fortes: { type: "array", items: { type: "string" }, description: "2 a 4 pontos fortes" },
    melhorar: { type: "array", items: { type: "string" }, description: "3 a 5 ações práticas para a próxima gravação, em ordem de importância" },
    abertura_sugerida: { type: "string", description: "Sugestão de como reescrever os primeiros 15 segundos da fala, no estilo do candidato" },
  },
};

/** Contagem simples na transcrição: palavras por minuto e vícios de linguagem. */
export function medirFala(texto: string, duracao: number) {
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  const baixo = ` ${texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z\s]/g, " ")} `;
  const conta = (p: string) => (baixo.match(new RegExp(`\\s${p}\\s`, "g")) ?? []).length;
  const vicios = { "é…/eh": conta("e+h+") + conta("ahn*") + conta("hum+"), tipo: conta("tipo"), "né": conta("ne"), "então": conta("entao"), "aí": conta("ai") };
  return { palavras, ppm: duracao ? Math.round((palavras / duracao) * 60) : 0, vicios };
}

export async function avaliarVideo(cfg: ConfigIA, d: {
  transcricao: string; duracao: number; meta: number; roteiro: Record<string, string>; companhia?: string; fotos: string[];
}): Promise<FeedbackIA> {
  const fala = medirFala(d.transcricao, d.duracao);
  const roteiro = BLOCOS_VIDEO.map((b) => `- ${b.titulo}: ${(d.roteiro[b.id] ?? "").trim() || "(sem tópicos)"}`).join("\n");
  const sistema = [
    "Você é avaliador(a) experiente de processos seletivos de comissário(a) de voo no Brasil (LATAM, GOL, Azul).",
    "Avalie o vídeo de apresentação de um candidato: o que ele fala (transcrição) e como aparece (fotos tiradas da gravação, em ordem).",
    "Seja específico, gentil e direto, em português do Brasil, falando com o candidato (você). Não invente o que não dá para ver ou ouvir: se a transcrição estiver vazia ou as fotos não mostrarem algo, diga isso.",
    "Critérios do recrutador: apresentação (nome, idade, cidade), experiência com atendimento e um exemplo concreto com resultado, motivação além de 'gosto de viajar' (servir, segurança), por que a companhia, fechamento com agradecimento;",
    "fala clara, calma, sem excesso de vícios ('é...', 'tipo', 'né'), natural e não decorada; olhar para a lente; sorriso no início e no fim; postura, roupa e cabelo como no dia da seleção (imagem alinhada ao padrão de comissários); fundo neutro, boa luz no rosto, enquadramento do peito para cima.",
    "Nota geral de 0 a 100: 80 ou mais significa pronto para enviar. Dê nota a cada critério de 0 a 10.",
  ].join("\n");
  const texto = [
    `Tempo pedido: ${d.meta} s. Duração da gravação: ${d.duracao} s.`,
    d.companhia ? `Companhia-alvo: ${d.companhia}.` : "",
    `Fala: ${fala.palavras} palavras (${fala.ppm} palavras por minuto; o ideal fica entre 120 e 160). Vícios contados: ${Object.entries(fala.vicios).map(([k, v]) => `${k} ${v}`).join(", ")}.`,
    `Roteiro que o candidato planejou (tópicos):\n${roteiro}`,
    `Transcrição da fala:\n"""${d.transcricao || "(não foi possível entender a fala)"}"""`,
    `A seguir, ${d.fotos.length} fotos da gravação, do começo ao fim.`,
  ].filter(Boolean).join("\n\n");

  const corpo = {
    model: cfg.modelo,
    messages: [
      { role: "system", content: sistema },
      { role: "user", content: [{ type: "text", text: texto }, ...d.fotos.map((url) => ({ type: "image_url", image_url: { url, detail: "low" } }))] },
    ],
    response_format: { type: "json_schema", json_schema: { name: "feedback_video", strict: true, schema: ESQUEMA } },
  };
  const r = await fetch(`${API()}/v1/chat/completions`, {
    method: "POST", headers: { Authorization: `Bearer ${cfg.chave}`, "Content-Type": "application/json" },
    body: JSON.stringify(corpo), signal: AbortSignal.timeout(150000),
  });
  if (!r.ok) throw await erroDaApi(r);
  const j = (await r.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
  const conteudo = j.choices?.[0]?.message?.content;
  if (!conteudo) throw new ErroIA(j.choices?.[0]?.message?.refusal ? "A IA não conseguiu avaliar este vídeo." : "A IA não devolveu a avaliação. Tente de novo.");
  const f = JSON.parse(conteudo) as FeedbackIA;
  const n = (x: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));
  const ids = new Set<string>(CRITERIOS_IA.map((c) => c.id));
  return {
    nota: n(f.nota, 100),
    resumo: String(f.resumo ?? "").slice(0, 800),
    criterios: (f.criterios ?? []).filter((c) => ids.has(c.id)).map((c) => ({ id: c.id, nota: n(c.nota, 10), comentario: String(c.comentario ?? "").slice(0, 400) })),
    pontos_fortes: (f.pontos_fortes ?? []).slice(0, 5).map((x) => String(x).slice(0, 300)),
    melhorar: (f.melhorar ?? []).slice(0, 6).map((x) => String(x).slice(0, 300)),
    abertura_sugerida: String(f.abertura_sugerida ?? "").slice(0, 800),
  };
}
