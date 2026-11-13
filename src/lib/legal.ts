/**
 * Dados do responsável pela plataforma e versão dos textos legais.
 * Ao mudar Termos, Privacidade ou Reembolso, atualize VERSAO_LEGAL: os novos aceites passam a registrar a nova data.
 */
export const VERSAO_LEGAL = "2026-11-13";
export const VERSAO_LEGAL_EXTENSO = "13 de novembro de 2026";

// Dados aprovados pelo advogado. Razão social, CNPJ e encarregado em branco: não aparecem nas páginas.
export const EMPRESA = {
  marca: "Cabin Crew",
  razaoSocial: "",
  cnpj: "",
  endereco: "Calçada das Orquídeas, 245, Centro Comercial Alphaville, Barueri/SP",
  cidadeForo: "Barueri/SP",
  email: "hello@cabincrew.com.br",
  whatsapp: "(11) 96648-4209",
  whatsappLink: "https://wa.me/5511966484209",
  encarregado: "",
  site: "cabincrew.com.br",
};

export const faltaPreencher = Object.values(EMPRESA).some((v) => v.startsWith("["));
