/**
 * Gera os MP3 dos diálogos do Inglês a bordo com a API do ElevenLabs (Text to Dialogue, modelo Eleven v4)
 * e grava em <pasta de mídia>/audios/ingles/<aula>-<versão>.mp3. O site usa esses arquivos sozinho.
 *
 * Rode pelo deploy/gerar-audios.sh (ele pede a chave sem mostrar na tela).
 * Opções:  --modulo 3      só um módulo
 *          --aula 3.2      só uma aula
 *          --custo         só mostra quantos caracteres seriam usados
 *          --vozes         escolher as vozes de novo
 *
 * A "versão" no nome do arquivo muda quando o texto ou as vozes mudam. Rodar de novo só gera o que mudou.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { ELENCO, TODAS_AULAS, chaveAula, type AulaIngles } from "@/lib/ingles-a-bordo";

const API = process.env.ELEVEN_API_BASE || "https://api.elevenlabs.io";
const MODELO = process.env.ELEVEN_MODEL || "eleven_v4";
const CHAVE = process.env.ELEVENLABS_API_KEY || "";
const PASTA = path.join(process.env.MIDIA_DIR || path.join(os.homedir(), "midia"), "audios", "ingles");
const ARQ_VOZES = path.join(os.homedir(), ".cabincrew-vozes-ingles.json");

/** Vozes que você já escolheu no ElevenLabs (nome da voz na sua conta). */
const SUGESTAO: Record<string, string> = { Ana: "Misa", Grace: "Ana Lu", Tom: "Adam", Leila: "Maya", Marco: "John" };

const args = process.argv.slice(2);
const opc = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const SO_MODULO = opc("--modulo");
const SO_AULA = opc("--aula");
const SO_CUSTO = args.includes("--custo");
const REFAZER_VOZES = args.includes("--vozes");

/* ------------------------------------------------------------------ texto para a voz */

const UNID = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DEZ = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ate99 = (n: number) => (n < 20 ? UNID[n] : DEZ[Math.floor(n / 10)] + (n % 10 ? "-" + UNID[n % 10] : ""));
const digitos = (s: string) => s.split("").map((d) => UNID[Number(d)]).join(" ");

/** Escreve por extenso o que a voz poderia ler errado: assentos, portas, voos e horários. */
export function paraFala(t: string) {
  return t
    .replace(/\[|\]/g, "")
    .replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h, m) => `${ate99(Number(h))} ${m === "00" ? "o'clock" : Number(m) < 10 ? "oh " + UNID[Number(m)] : ate99(Number(m))}`)
    .replace(/\bflight (\d{3,4})\b/gi, (_, n) => `flight ${digitos(n)}`)
    .replace(/\b(\d{1,2})([A-KLR])\b/g, (_, n, l) => `${ate99(Number(n))} ${l}`)
    .replace(/\brow (\d{1,2})\b/gi, (_, n) => `row ${ate99(Number(n))}`)
    .replace(/\bJFK\b/g, "J F K");
}

/* ------------------------------------------------------------------ API */

type Voz = { voice_id: string; name: string; category?: string; labels?: Record<string, string> };

async function api(caminho: string, init?: RequestInit) {
  const r = await fetch(API + caminho, { ...init, headers: { "xi-api-key": CHAVE, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!r.ok) {
    const corpo = await r.text().catch(() => "");
    throw new Error(`ElevenLabs respondeu ${r.status}: ${corpo.slice(0, 400)}`);
  }
  return r;
}

async function listarVozes(): Promise<Voz[]> {
  const r = await api("/v1/voices");
  const j = (await r.json()) as { voices: Voz[] };
  return j.voices.sort((a, b) => a.name.localeCompare(b.name));
}

async function escolherVozes(personagens: string[]): Promise<Record<string, string>> {
  let salvas: Record<string, string> = {};
  try { salvas = JSON.parse(await readFile(ARQ_VOZES, "utf8")); } catch { /* primeira vez */ }
  const faltam = personagens.filter((p) => REFAZER_VOZES || !salvas[p]);
  if (!faltam.length) return salvas;

  const vozes = await listarVozes();
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  const linhas = rl[Symbol.asyncIterator]();
  const perguntar = async (q: string) => {
    process.stdout.write(q);
    const r = await linhas.next();
    if (r.done) throw new Error("respostas encerradas antes de escolher todas as vozes");
    return String(r.value);
  };
  console.log("\nVozes da sua conta no ElevenLabs:");
  vozes.forEach((v, i) => {
    const l = v.labels ?? {};
    const desc = [l.gender, l.age, l.accent].filter(Boolean).join(", ");
    console.log(`  ${String(i + 1).padStart(2)}. ${v.name}${desc ? `  (${desc})` : ""}`);
  });
  for (const p of faltam) {
    const sugestao = vozes.findIndex((v) => SUGESTAO[p] && v.name.toLowerCase().startsWith(SUGESTAO[p].toLowerCase()));
    const atual = vozes.findIndex((v) => v.voice_id === salvas[p]);
    const padrao = atual >= 0 ? atual : sugestao;
    const pergunta = `\n${p} — ${ELENCO[p]?.nome} (${ELENCO[p]?.papel}). Ideal: ${ELENCO[p]?.vozSugerida}\n  Número da voz${padrao >= 0 ? ` [Enter = ${vozes[padrao].name}]` : ""}: `;
    for (;;) {
      const r = (await perguntar(pergunta)).trim();
      const n = r === "" ? padrao : Number(r) - 1;
      if (n >= 0 && n < vozes.length) {
        salvas[p] = vozes[n].voice_id;
        await writeFile(ARQ_VOZES, JSON.stringify(salvas, null, 2)); // salva a cada escolha
        console.log(`  ✓ ${p} = ${vozes[n].name}`);
        break;
      }
      console.log("  Número inválido.");
    }
  }
  rl.close();
  await writeFile(ARQ_VOZES, JSON.stringify(salvas, null, 2));
  console.log(`\nVozes salvas em ${ARQ_VOZES}. Para trocar depois, rode com --vozes.\n`);
  return salvas;
}

/* ------------------------------------------------------------------ geração */

function versao(a: AulaIngles, vozes: Record<string, string>) {
  const base = JSON.stringify({ m: MODELO, f: a.dialogo.falas.map((f) => [vozes[f.quem], paraFala(f.en)]) });
  return createHash("sha256").update(base).digest("hex").slice(0, 10);
}

async function gerar(a: AulaIngles, vozes: Record<string, string>, destino: string) {
  const inputs = a.dialogo.falas.map((f) => ({ text: paraFala(f.en), voice_id: vozes[f.quem] }));
  const r = await api(`/v1/text-to-dialogue?output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify({ inputs, model_id: MODELO, language_code: "en" }),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 2000) throw new Error("o áudio veio vazio");
  await writeFile(destino + ".tmp", buf);
  await rename(destino + ".tmp", destino);
  return buf.length;
}

async function main() {
  const aulas = TODAS_AULAS.filter((a) => (!SO_MODULO || String(a.modulo) === SO_MODULO) && (!SO_AULA || chaveAula(a) === SO_AULA));
  if (!aulas.length) { console.log("Nenhuma aula encontrada com esse filtro."); return; }
  const caracteres = aulas.reduce((s, a) => s + a.dialogo.falas.reduce((x, f) => x + paraFala(f.en).length, 0), 0);
  console.log(`${aulas.length} aula(s), ${caracteres.toLocaleString("pt-BR")} caracteres no total (modelo ${MODELO}).`);
  if (SO_CUSTO) return;
  if (!CHAVE) throw new Error("Falta a chave da API. Rode pelo deploy/gerar-audios.sh.");

  const personagens = [...new Set(aulas.flatMap((a) => a.dialogo.falas.map((f) => f.quem)))];
  const vozes = await escolherVozes(personagens);
  await mkdir(PASTA, { recursive: true });
  const existentes = new Set(await readdir(PASTA));

  let feitas = 0, puladas = 0, falhas = 0;
  for (const a of aulas) {
    const k = chaveAula(a);
    const nome = `${k}-${versao(a, vozes)}.mp3`;
    if (existentes.has(nome)) { puladas++; continue; }
    process.stdout.write(`  ${k.padEnd(5)} ${a.tituloEn} … `);
    try {
      const bytes = await gerar(a, vozes, path.join(PASTA, nome));
      // apaga as versões antigas desta aula
      for (const n of existentes) if (n.startsWith(`${k}-`) && n !== nome) await unlink(path.join(PASTA, n)).catch(() => {});
      console.log(`ok (${Math.round(bytes / 1024)} KB)`);
      feitas++;
    } catch (e) {
      console.log(`ERRO: ${(e as Error).message}`);
      falhas++;
      if (/\b(401|402|403)\b/.test((e as Error).message)) { console.log("\nParei: verifique a chave e os créditos da sua conta ElevenLabs."); break; }
    }
  }
  console.log(`\nPronto: ${feitas} gerada(s), ${puladas} já estavam em dia, ${falhas} com erro.`);
  console.log(`Arquivos em ${PASTA}. As aulas já usam os áudios novos (atualize a página).`);
}

main().catch((e) => { console.error("\nErro:", (e as Error).message); process.exit(1); });
