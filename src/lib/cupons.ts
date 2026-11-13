/** Cupons de desconto: cálculo do preço (usado no navegador e no servidor, sempre com o mesmo resultado). */
export type Cupom = { codigo: string; tipo: "percentual" | "valor"; valor: number };

export const normalizarCupom = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
const centavos = (v: number) => Math.round(v * 100) / 100;

/** Preço com o cupom (mínimo de R$ 1,00, exigido pelo Mercado Pago). */
export function comCupom(preco: number, cupom: Cupom | null) {
  if (!cupom) return { preco: centavos(preco), desconto: 0 };
  const desconto = cupom.tipo === "percentual" ? preco * Number(cupom.valor) / 100 : Number(cupom.valor);
  const final = Math.max(1, centavos(preco - desconto));
  return { preco: final, desconto: centavos(preco - final) };
}

/** Preços no cartão e no Pix: primeiro o cupom, depois o desconto do Pix por cima. */
export function precosFinais(preco: number, descontoPix: number, cupom: Cupom | null) {
  const c = comCupom(Number(preco), cupom);
  const pix = Math.max(1, Math.round(c.preco * (100 - Number(descontoPix))) / 100);
  return { cartao: c.preco, pix, descontoCupom: c.desconto };
}

export const rotuloCupom = (c: Pick<Cupom, "tipo" | "valor">) =>
  c.tipo === "percentual" ? `${Number(c.valor).toLocaleString("pt-BR")}% de desconto` : `${Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de desconto`;
