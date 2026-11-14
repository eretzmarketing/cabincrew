/**
 * Gera a narração (MP3) das aulas de texto do Head Hunter com a API do ElevenLabs (Text to Speech)
 * e grava em <pasta de mídia>/audios/head-hunter/<id da aula>-<versão>.mp3. A página da aula mostra o player sozinha.
 *
 * Rode pelo deploy/gerar-audios.sh --head-hunter (ele pede a chave sem mostrar na tela).
 * Opções:  --modulo 12     só um módulo (número que aparece no site: Módulo 12)
 *          --custo         só mostra quantos caracteres seriam usados
 *          --voz           escolher a voz do narrador de novo
 *
 * A "versão" no nome do arquivo muda quando o texto ou a voz mudam. Rodar de novo só gera o que mudou.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

const API = process.env.ELEVEN_API_BASE || "https://api.elevenlabs.io";
const MODELO = process.env.ELEVEN_MODEL || "eleven_v4";
const CHAVE_ELEVEN = process.env.ELEVENLABS_API_KEY || "";
const PASTA = path.join(process.env.MIDIA_DIR || path.join(os.homedir(), "midia"), "audios", "head-hunter");
const ARQ_VOZ = path.join(os.homedir(), ".cabincrew-voz-aulas.json");
const SUGESTAO = "Paulo Radames";

const args = process.argv.slice(2);
const opc = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const SO_MODULO = opc("--modulo");
const SO_CUSTO = args.includes("--custo");
const REFAZER_VOZ = args.includes("--voz") || args.includes("--vozes");

/* ------------------------------------------------------------------ configuração do site */

function lerEnv() {
  const env: Record<string, string> = {};
  for (const arq of [".env.local", ".env.production", ".env"]) {
    if (!existsSync(arq)) continue;
    for (const l of readFileSync(arq, "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/.exec(l);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  }
  return env;
}

function chaveDoSite() {
  const arq = process.env.MP_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-mercadopago.json");
  try { return (JSON.parse(readFileSync(arq, "utf8")) as { chave?: string }).chave ?? ""; } catch { return ""; }
}

type AulaTexto = { id: string; modulo: number; modulo_titulo: string; ordem: number; titulo: string; conteudo: string };

async function buscarAulas(): Promise<AulaTexto[]> {
  const env = lerEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const chave = chaveDoSite();
  if (!url || !key) throw new Error("Não achei o endereço do Supabase (.env.local). Rode na pasta do site.");
  if (!chave) throw new Error("Não achei a chave do site. Conecte o Mercado Pago em Admin › Configurações › Pagamentos.");
  const r = await fetch(`${url}/rest/v1/rpc/aulas_para_audio`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_chave: chave, p_modulo: SO_MODULO ? Number(SO_MODULO) : null }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.includes("aulas_para_audio") ? "Rode o SQL 0053_audio_aulas.sql no Supabase." : `Supabase respondeu ${r.status}: ${t.slice(0, 200)}`);
  }
  return (await r.json()) as AulaTexto[];
}

/* ------------------------------------------------------------------ texto para a voz */

const ENTIDADES: Record<string, string> = { nbsp: " ", amp: "&", quot: "\"", apos: "'", lt: "<", gt: ">", ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’" };

/** HTML da aula -> texto corrido para a narração (parágrafos separados por linha em branco). */
export function paraFala(titulo: string, html: string) {
  const texto = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m)
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean)
    .map((l) => (/[.!?:…"”)]$/.test(l) ? l : `${l}.`))   // títulos e itens de lista viram frases (pausa na leitura)
    .join("\n\n");
  return `${titulo}.\n\n${texto}`;
}

/** Divide em pedaços de até ~2.500 caracteres, sempre entre parágrafos. */
function pedacos(t: string, max = 2500) {
  const out: string[] = [];
  let atual = "";
  for (const p of t.split("\n\n")) {
    if (atual && (atual + "\n\n" + p).length > max) { out.push(atual); atual = p; }
    else atual = atual ? `${atual}\n\n${p}` : p;
  }
  if (atual) out.push(atual);
  return out;
}

/* ------------------------------------------------------------------ ElevenLabs */

type Voz = { voice_id: string; name: string; labels?: Record<string, string> };

async function api(caminho: string, init?: RequestInit) {
  const r = await fetch(API + caminho, { ...init, headers: { "xi-api-key": CHAVE_ELEVEN, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`ElevenLabs respondeu ${r.status}: ${(await r.text().catch(() => "")).slice(0, 400)}`);
  return r;
}

async function escolherVoz(): Promise<string> {
  try {
    const s = JSON.parse(await readFile(ARQ_VOZ, "utf8")) as { voz?: string };
    if (s.voz && !REFAZER_VOZ) return s.voz;
  } catch { /* primeira vez */ }
  const vozes = ((await (await api("/v1/voices")).json()) as { voices: Voz[] }).voices.sort((a, b) => a.name.localeCompare(b.name));
  console.log("\nVozes da sua conta no ElevenLabs:");
  vozes.forEach((v, i) => {
    const l = v.labels ?? {};
    const d = [l.gender, l.age, l.accent].filter(Boolean).join(", ");
    console.log(`  ${String(i + 1).padStart(2)}. ${v.name}${d ? `  (${d})` : ""}`);
  });
  const padrao = vozes.findIndex((v) => v.name.toLowerCase().startsWith(SUGESTAO.toLowerCase()));
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  const linhas = rl[Symbol.asyncIterator]();
  for (;;) {
    process.stdout.write(`\nNarrador das aulas (voz em português do Brasil)${padrao >= 0 ? ` [Enter = ${vozes[padrao].name}]` : ""}: `);
    const r = await linhas.next();
    if (r.done) throw new Error("escolha da voz cancelada");
    const t = String(r.value).trim();
    const n = t === "" ? padrao : Number(t) - 1;
    if (n >= 0 && n < vozes.length) {
      rl.close();
      await writeFile(ARQ_VOZ, JSON.stringify({ voz: vozes[n].voice_id, nome: vozes[n].name }, null, 2));
      console.log(`  ✓ Narrador = ${vozes[n].name} (para trocar depois, rode com --voz)\n`);
      return vozes[n].voice_id;
    }
    console.log("  Número inválido.");
  }
}

async function narrar(texto: string, voz: string, destino: string) {
  const partes: Buffer[] = [];
  for (const p of pedacos(texto)) {
    const r = await api(`/v1/text-to-speech/${encodeURIComponent(voz)}?output_format=mp3_44100_128`, {
      method: "POST",
      body: JSON.stringify({ text: p, model_id: MODELO, language_code: "pt" }),
    });
    partes.push(Buffer.from(await r.arrayBuffer()));
  }
  const buf = Buffer.concat(partes);
  if (buf.length < 2000) throw new Error("o áudio veio vazio");
  await writeFile(destino + ".tmp", buf);
  await rename(destino + ".tmp", destino);
  return buf.length;
}

/* ------------------------------------------------------------------ principal */

async function main() {
  const aulas = await buscarAulas();
  if (!aulas.length) { console.log(SO_MODULO ? `Nenhuma aula de texto publicada no Módulo ${SO_MODULO}.` : "Nenhuma aula de texto publicada."); return; }
  const textos = aulas.map((a) => ({ a, t: paraFala(a.titulo, a.conteudo) }));
  const total = textos.reduce((s, x) => s + x.t.length, 0);
  const mods = [...new Set(aulas.map((a) => `Módulo ${String(a.modulo).padStart(2, "0")} · ${a.modulo_titulo}`))];
  console.log(`Head Hunter: ${aulas.length} aula(s) de texto, ${total.toLocaleString("pt-BR")} caracteres no total (modelo ${MODELO}).`);
  mods.forEach((m) => console.log(`  ${m}`));
  if (SO_CUSTO) return;
  if (!CHAVE_ELEVEN) throw new Error("Falta a chave da API. Rode pelo deploy/gerar-audios.sh --head-hunter.");

  const voz = await escolherVoz();
  await mkdir(PASTA, { recursive: true });
  const existentes = await readdir(PASTA);
  let feitas = 0, puladas = 0, falhas = 0;
  for (const { a, t } of textos) {
    const versao = createHash("sha256").update(JSON.stringify({ m: MODELO, v: voz, t })).digest("hex").slice(0, 10);
    const nome = `${a.id}-${versao}.mp3`;
    if (existentes.includes(nome)) { puladas++; continue; }
    process.stdout.write(`  ${String(a.modulo).padStart(2, "0")}.${String(a.ordem).padEnd(3)} ${a.titulo.slice(0, 60)} … `);
    try {
      const bytes = await narrar(t, voz, path.join(PASTA, nome));
      for (const n of existentes) if (n.startsWith(`${a.id}-`) && n !== nome) await unlink(path.join(PASTA, n)).catch(() => {});
      console.log(`ok (${Math.round(bytes / 1024)} KB)`);
      feitas++;
    } catch (e) {
      console.log(`ERRO: ${(e as Error).message}`);
      falhas++;
      if (/\b(401|402|403)\b/.test((e as Error).message)) { console.log("\nParei: verifique a chave e os créditos da sua conta ElevenLabs."); break; }
    }
  }
  console.log(`\nPronto: ${feitas} gerada(s), ${puladas} já estavam em dia, ${falhas} com erro.`);
  console.log(`Arquivos em ${PASTA}. As aulas já mostram o áudio (atualize a página).`);
}

if (process.argv[1]?.includes("gerar-audios-aulas")) main().catch((e) => { console.error("\nErro:", (e as Error).message); process.exit(1); });
