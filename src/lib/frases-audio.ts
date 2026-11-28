/**
 * Áudios curtos das aulas de idioma (vocabulário, expressões, ditado, ordenar, falar, role-play e falas do diálogo),
 * gerados no ElevenLabs por deploy/gerar-audios.sh --frases e gravados em <pasta do curso>/frases/<chave>.mp3.
 * A mesma chave é calculada aqui no site e no script, por isso as regras de texto ficam neste arquivo.
 */
import type { AulaIngles } from "@/lib/ingles-a-bordo";

export type FraseAudio = { texto: string; quem?: string };

/** Texto exatamente como o botão 🔊 fala (sem colchetes, espaços normalizados). */
export const textoFrase = (t: string) => t.replace(/\[([^\]]+)\]/g, "$1").replace(/\s+/g, " ").trim();

/** Chave curta e estável (FNV-1a de 2 x 32 bits) de idioma + personagem + texto. */
export function chaveFrase(lang: string, texto: string, quem?: string) {
  const s = `${lang}|${quem ?? ""}|${textoFrase(texto)}`;
  let a = 0x811c9dc5, b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0").slice(0, 4);
}

/** Todas as frases que têm botão 🔊 numa aula (a mesma lista que o componente usa). */
export function frasesDaAula(a: AulaIngles, comDialogo = true): FraseAudio[] {
  const lista: FraseAudio[] = [];
  if (comDialogo) for (const f of a.dialogo.falas) lista.push({ texto: f.en, quem: f.quem });
  for (const v of a.vocabulario) lista.push({ texto: vocabParaFala(v.en) });
  for (const e of a.expressoes) lista.push({ texto: expressaoParaFala(e.en) });
  for (const at of a.atividades) {
    if (at.tipo === "ditado") at.frases.forEach((f) => lista.push({ texto: f }));
    if (at.tipo === "ordenar") at.falas.forEach((f) => lista.push({ texto: f }));
    if (at.tipo === "falar") at.frases.forEach((f) => lista.push({ texto: f.en }));
    if (at.tipo === "roleplay") at.turnos.forEach((t) => { lista.push({ texto: t.outro }); lista.push({ texto: t.modelo.split(" / ")[0] }); });
  }
  const vistos = new Set<string>();
  return lista.filter((f) => { const k = `${f.quem ?? ""}|${textoFrase(f.texto)}`; if (!textoFrase(f.texto) || vistos.has(k)) return false; vistos.add(k); return true; });
}
export const vocabParaFala = (en: string) => en.split(" (")[0].replace(" / ", ", ");
export const expressaoParaFala = (en: string) => en.replace("…", "");
