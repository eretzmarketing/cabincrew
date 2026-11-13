/**
 * Dados do responsável pela plataforma e versão dos textos legais.
 * Ao mudar Termos, Privacidade ou Reembolso, atualize VERSAO_LEGAL: os novos aceites passam a registrar a nova data.
 */
export const VERSAO_LEGAL = "2026-11-13";
export const VERSAO_LEGAL_EXTENSO = "13 de novembro de 2026";

// TODO (dono): preencher com os dados reais antes do lançamento
export const EMPRESA = {
  marca: "Cabin Crew",
  razaoSocial: "[RAZÃO SOCIAL]",
  cnpj: "[CNPJ]",
  endereco: "[ENDEREÇO COMPLETO]",
  cidadeForo: "[CIDADE/UF]",
  email: "[E-MAIL DE CONTATO]",
  whatsapp: "[WHATSAPP DE ATENDIMENTO]",
  encarregado: "[NOME DO ENCARREGADO DE DADOS (DPO)]",
  site: "cabincrew.com.br",
};

export const faltaPreencher = Object.values(EMPRESA).some((v) => v.startsWith("["));
