/**
 * SuperFrete (https://superfrete.com): etiquetas dos pedidos da loja.
 * Fluxo de um clique: cria o envio no carrinho (/api/v0/cart), paga com o saldo da carteira SuperFrete
 * (/api/v0/checkout), lê o rastreio (/api/v0/order/info/{id}) e pega o link do PDF (/api/v0/tag/print).
 * O token e os dados do remetente ficam só no servidor, no arquivo ~/.cabincrew-superfrete.json
 * (gravado pelo Admin › Configurações › Envios).
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const ARQUIVO_SUPERFRETE = process.env.SUPERFRETE_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-superfrete.json");

export type Remetente = {
  nome: string; documento: string; cep: string; rua: string; numero: string; complemento?: string; bairro: string; cidade: string; uf: string;
};
export type ConfigSuperfrete = { token: string; sandbox?: boolean; servico: number; remetente: Remetente };

export const SERVICOS: { id: number; nome: string; dica: string }[] = [
  { id: 1, nome: "PAC", dica: "mais barato" },
  { id: 2, nome: "SEDEX", dica: "mais rápido" },
  { id: 17, nome: "Mini Envios", dica: "até 300 g e 4 cm de altura" },
];
export const nomeServico = (id: number | null | undefined) => SERVICOS.find((s) => s.id === id)?.nome ?? "—";

export function configSuperfrete(): ConfigSuperfrete | null {
  try {
    const j = JSON.parse(readFileSync(ARQUIVO_SUPERFRETE, "utf8")) as Partial<ConfigSuperfrete>;
    if (j.token && j.remetente?.cep) return { servico: 1, ...j } as ConfigSuperfrete;
  } catch { /* sem arquivo */ }
  return null;
}

export class ErroSuperfrete extends Error {}

function base(sandbox?: boolean) {
  return process.env.SUPERFRETE_API_BASE || (sandbox ? "https://sandbox.superfrete.com" : "https://api.superfrete.com");
}

/** Texto curto do erro devolvido pelo SuperFrete (para saber o que corrigir). */
function detalhe(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const j = json as { message?: unknown; error?: unknown; errors?: unknown };
  const partes: string[] = [];
  if (typeof j.message === "string") partes.push(j.message);
  if (typeof j.error === "string") partes.push(j.error);
  if (j.errors && typeof j.errors === "object") {
    for (const v of Object.values(j.errors as Record<string, unknown>)) {
      if (typeof v === "string") partes.push(v);
      else if (Array.isArray(v)) partes.push(...v.filter((x): x is string => typeof x === "string"));
    }
  }
  return partes.join(" ").replace(/\s+/g, " ").trim().slice(0, 300);
}

async function chamar(cfg: Pick<ConfigSuperfrete, "token" | "sandbox">, caminho: string, metodo: "GET" | "POST", corpo?: unknown) {
  let r: Response;
  try {
    r = await fetch(`${base(cfg.sandbox)}${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json", accept: "application/json",
        "User-Agent": "Cabin Crew (hello@cabincrew.com.br)",
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(20000), cache: "no-store",
    });
  } catch {
    throw new ErroSuperfrete("Não foi possível falar com o SuperFrete agora. Tente de novo em instantes.");
  }
  const json = await r.json().catch(() => null);
  if (r.status === 401 || r.status === 403) throw new ErroSuperfrete("Token do SuperFrete inválido. Confira em Configurações › Envios.");
  if (!r.ok) throw new ErroSuperfrete(detalhe(json) || `O SuperFrete respondeu ${r.status}.`);
  return json as Record<string, unknown> | unknown[] | null;
}

/** Confere o token antes de salvar. */
export async function testarTokenSuperfrete(token: string, sandbox: boolean): Promise<string | null> {
  try {
    await chamar({ token, sandbox }, "/api/v0/user/addresses", "GET");
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

const so = (s: string | null | undefined) => String(s ?? "").replace(/\D/g, "");
const corta = (s: string | null | undefined, n: number) => String(s ?? "").trim().slice(0, n).trim();

type Endereco = { cep: string; rua: string; numero: string; complemento?: string; bairro?: string; cidade: string; uf: string };

function endereco(nome: string, doc: string, e: Endereco) {
  const o: Record<string, string> = {
    name: corta(nome, 100), document: so(doc), address: corta(e.rua, 50), number: corta(e.numero, 10) || "S/N",
    district: corta(e.bairro, 50) || "NA", city: corta(e.cidade, 50), state_abbr: e.uf, postal_code: so(e.cep),
  };
  const comp = corta(e.complemento, 20);
  if (comp) o.complement = comp;
  return o;
}

export type Pacote = { altura: number; largura: number; comprimento: number; pesoG: number };

export type DadosEtiqueta = {
  pedido: number; nome: string; cpf: string; email?: string | null; telefone?: string | null; endereco: Endereco;
  produto: string; quantidade: number; valorUnitario: number; pacote: Pacote;
};

/** Cria o envio no carrinho do SuperFrete. Devolve o id do envio lá. */
export async function criarEtiqueta(cfg: ConfigSuperfrete, d: DadosEtiqueta, servico: number): Promise<string> {
  const to = endereco(d.nome, d.cpf, d.endereco);
  if (d.email) to.email = d.email;
  if (d.telefone) to.phone = so(d.telefone).replace(/^55(?=\d{10,11}$)/, "");
  const corpo = {
    from: endereco(cfg.remetente.nome, cfg.remetente.documento, cfg.remetente),
    to,
    service: servico,
    products: [{ name: corta(d.produto, 100), quantity: String(d.quantidade), unitary_value: d.valorUnitario.toFixed(2) }],
    volumes: {
      height: Math.max(0.4, d.pacote.altura), width: Math.max(8, d.pacote.largura), length: Math.max(13, d.pacote.comprimento),
      weight: Math.round(d.pacote.pesoG) / 1000,
    },
    options: { own_hand: false, receipt: false, non_commercial: true, tags: [{ tag: `cabincrew-${d.pedido}`, url: null }] },
    platform: "Cabin Crew",
  };
  const r = (await chamar(cfg, "/api/v0/cart", "POST", corpo)) as { id?: unknown } | null;
  const id = r && (typeof r.id === "string" || typeof r.id === "number") ? String(r.id) : "";
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new ErroSuperfrete("O SuperFrete não devolveu o número do envio.");
  return id;
}

/** Paga a etiqueta com o saldo da carteira SuperFrete. */
export async function pagarEtiqueta(cfg: ConfigSuperfrete, id: string) {
  await chamar(cfg, "/api/v0/checkout", "POST", { orders: [id] });
}

export type InfoEtiqueta = { status: string; rastreio: string | null; preco: number | null };

/** Situação: pending (no carrinho, sem pagar), released (paga), posted, delivered, canceled. */
export async function infoEtiqueta(cfg: ConfigSuperfrete, id: string): Promise<InfoEtiqueta> {
  const j = (await chamar(cfg, `/api/v0/order/info/${encodeURIComponent(id)}`, "GET")) as { status?: unknown; tracking?: unknown; price?: unknown } | null;
  const st = typeof j?.status === "string" ? j.status.toLowerCase() : "pending";
  const rastreio = typeof j?.tracking === "string" && /^[A-Za-z0-9]{5,40}$/.test(j.tracking.trim()) ? j.tracking.trim().toUpperCase() : null;
  const preco = j?.price !== undefined && j.price !== null && Number.isFinite(Number(j.price)) ? Number(j.price) : null;
  return { status: st === "cancelled" ? "canceled" : st, rastreio, preco };
}

export const etiquetaPaga = (status: string | null | undefined) => !!status && !["pending", "canceled", "criando"].includes(status);

/** Link do PDF da etiqueta (depois de paga). */
export async function imprimirEtiqueta(cfg: ConfigSuperfrete, id: string): Promise<string | null> {
  const j = (await chamar(cfg, "/api/v0/tag/print", "POST", { orders: [id] })) as { url?: unknown } | null;
  return typeof j?.url === "string" && j.url.startsWith("https://") ? j.url : null;
}

/** Cancela a etiqueta no SuperFrete (o valor volta para a carteira, conforme as regras deles). */
export async function cancelarEtiqueta(cfg: ConfigSuperfrete, id: string, motivo: string) {
  await chamar(cfg, "/api/v0/order/cancel", "POST", { order: { id, description: corta(motivo, 200) || "Cancelado pela Cabin Crew" } });
}
