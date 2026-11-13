/** Livro de compras: tipos, rótulos e prazo de arrependimento (CDC, art. 49: 7 dias). */
export type Compra = {
  cupom?: string | null; desconto_cupom?: number | null;
  id: number; user_id: string | null; nome: string; email: string | null; whatsapp: string | null; documento: string | null;
  produto: string; valor: number; moeda: string; forma_pagamento: string; parcelas: number | null; plataforma: string;
  id_transacao: string | null; status: string; comprada_em: string; liberada_em: string | null; observacao: string | null;
  created_at: string; updated_at: string;
};

export const FORMAS: Record<string, string> = {
  pix: "Pix", cartao_credito: "Cartão de crédito", cartao_debito: "Cartão de débito", boleto: "Boleto", transferencia: "Transferência", outro: "Outro",
};

export const STATUS_COMPRA: Record<string, { rotulo: string; cor: string }> = {
  aprovada: { rotulo: "Aprovada", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  pendente: { rotulo: "Pendente", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  reembolsada: { rotulo: "Reembolsada", cor: "bg-[#eceef3] text-ink-2" },
  cancelada: { rotulo: "Cancelada", cor: "bg-[#eceef3] text-ink-2" },
  contestada: { rotulo: "Contestada (chargeback)", cor: "bg-brand-soft text-brand-deep" },
};

export const DIAS_ARREPENDIMENTO = 7;

/** Data e hora em que termina o prazo de arrependimento (7 dias corridos após a compra). */
export const fimArrependimento = (compradaEm: string) => new Date(Date.parse(compradaEm) + DIAS_ARREPENDIMENTO * 86400000);

export const dataHoraBR = (v: string | Date | null | undefined) =>
  v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—";

export const dinheiro = (v: number, moeda = "BRL") => Number(v).toLocaleString("pt-BR", { style: "currency", currency: moeda });
