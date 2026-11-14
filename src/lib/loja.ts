/** Loja de apostilas físicas: tipos e utilidades comuns (navegador e servidor). */

export type ProdutoLoja = {
  slug: string; nome: string; resumo: string | null; descricao: string | null; preco: number; preco_de: number | null;
  desconto_pix: number; imagens: string[]; frete: number; prazo: string; estoque: number | null; ativo: boolean; ordem: number;
  peso_g?: number; altura_cm?: number; largura_cm?: number; comprimento_cm?: number;
};

export type Endereco = { cep: string; rua: string; numero: string; complemento?: string; bairro?: string; cidade: string; uf: string };

export type PedidoLoja = {
  id: number; user_id: string | null; produto: string; produto_nome: string; quantidade: number; valor_itens: number; frete: number;
  total: number; total_pix: number; status: StatusPedido; metodo: string | null; pago_valor: number | null; mp_id: string | null;
  nome: string; cpf: string | null; telefone: string | null; email: string | null; endereco: Endereco; rastreio: string | null;
  observacao: string | null; criado_em: string; pago_em: string | null; enviado_em: string | null; entregue_em: string | null;
  etiqueta_id?: string | null; etiqueta_status?: string | null; etiqueta_servico?: number | null; etiqueta_url?: string | null; etiqueta_preco?: number | null;
};

export type StatusPedido = "aguardando" | "pago" | "enviado" | "entregue" | "cancelado" | "reembolsado";

export const STATUS_PEDIDO: Record<StatusPedido, { rotulo: string; cor: string }> = {
  aguardando: { rotulo: "Aguardando pagamento", cor: "bg-[#eceef3] text-ink-2" },
  pago: { rotulo: "Pago · a enviar", cor: "bg-[#fff8e6] text-[#7a5a00]" },
  enviado: { rotulo: "Enviado", cor: "bg-[#eef1ff] text-navy" },
  entregue: { rotulo: "Entregue", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  cancelado: { rotulo: "Cancelado", cor: "bg-[#eceef3] text-muted" },
  reembolsado: { rotulo: "Reembolsado", cor: "bg-brand-soft text-brand-deep" },
};

export const reais = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const enderecoEmLinha = (e: Endereco) =>
  `${e.rua}, ${e.numero}${e.complemento ? ` · ${e.complemento}` : ""}${e.bairro ? ` · ${e.bairro}` : ""} · ${e.cidade}/${e.uf} · CEP ${e.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}`;

export const linkRastreio = (codigo: string) => `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(codigo)}`;

/** external_reference dos pagamentos da loja: "cl:<pedido>:<user_id>" */
export const referenciaLoja = (pedido: number, userId: string) => `cl:${pedido}:${userId}`;
export function lerReferenciaLoja(ref?: string) {
  const m = /^cl:(\d{1,18}):([0-9a-f-]{36})$/i.exec(ref ?? "");
  return m ? { pedido: Number(m[1]), userId: m[2] } : null;
}
