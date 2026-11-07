/** Países do campo de celular. "#" = dígito. min = menor quantidade de dígitos aceita (padrão: a máscara cheia). */
export type Pais = { iso: string; nome: string; ddi: string; mascara: string; min?: number };

export const PAISES: Pais[] = [
  { iso: "BR", nome: "Brasil", ddi: "55", mascara: "(##) #####-####", min: 10 },
  { iso: "PT", nome: "Portugal", ddi: "351", mascara: "### ### ###" },
  { iso: "US", nome: "Estados Unidos", ddi: "1", mascara: "(###) ###-####" },
  { iso: "CA", nome: "Canadá", ddi: "1", mascara: "(###) ###-####" },
  { iso: "AR", nome: "Argentina", ddi: "54", mascara: "## ####-####" },
  { iso: "UY", nome: "Uruguai", ddi: "598", mascara: "## ### ###" },
  { iso: "PY", nome: "Paraguai", ddi: "595", mascara: "### ### ###" },
  { iso: "CL", nome: "Chile", ddi: "56", mascara: "# #### ####" },
  { iso: "BO", nome: "Bolívia", ddi: "591", mascara: "#### ####" },
  { iso: "PE", nome: "Peru", ddi: "51", mascara: "### ### ###" },
  { iso: "CO", nome: "Colômbia", ddi: "57", mascara: "### ### ####" },
  { iso: "EC", nome: "Equador", ddi: "593", mascara: "## ### ####" },
  { iso: "VE", nome: "Venezuela", ddi: "58", mascara: "### ### ####" },
  { iso: "MX", nome: "México", ddi: "52", mascara: "## #### ####" },
  { iso: "ES", nome: "Espanha", ddi: "34", mascara: "### ## ## ##" },
  { iso: "IT", nome: "Itália", ddi: "39", mascara: "### ### ####", min: 9 },
  { iso: "FR", nome: "França", ddi: "33", mascara: "# ## ## ## ##" },
  { iso: "DE", nome: "Alemanha", ddi: "49", mascara: "#### ########", min: 10 },
  { iso: "GB", nome: "Reino Unido", ddi: "44", mascara: "#### ######" },
  { iso: "IE", nome: "Irlanda", ddi: "353", mascara: "## ### ####" },
  { iso: "NL", nome: "Holanda", ddi: "31", mascara: "# ########" },
  { iso: "BE", nome: "Bélgica", ddi: "32", mascara: "### ## ## ##" },
  { iso: "CH", nome: "Suíça", ddi: "41", mascara: "## ### ## ##" },
  { iso: "AE", nome: "Emirados Árabes", ddi: "971", mascara: "## ### ####" },
  { iso: "QA", nome: "Catar", ddi: "974", mascara: "#### ####" },
  { iso: "JP", nome: "Japão", ddi: "81", mascara: "## #### ####" },
  { iso: "AU", nome: "Austrália", ddi: "61", mascara: "### ### ###" },
  { iso: "NZ", nome: "Nova Zelândia", ddi: "64", mascara: "## ### ####", min: 8 },
  { iso: "AO", nome: "Angola", ddi: "244", mascara: "### ### ###" },
  { iso: "MZ", nome: "Moçambique", ddi: "258", mascara: "## ### ####" },
];

export const paisPorIso = (iso: string) => PAISES.find((p) => p.iso === iso);

const maxDigitos = (p: Pais) => p.mascara.split("#").length - 1;

/** Aplica a máscara enquanto a pessoa digita. */
export function formatarTelefone(p: Pais, bruto: string) {
  const d = bruto.replace(/\D/g, "").slice(0, maxDigitos(p));
  // Brasil: fixo (10 dígitos) ou celular (11)
  const mascara = p.iso === "BR" && d.length <= 10 ? "(##) ####-####" : p.mascara;
  let out = "";
  let i = 0;
  for (const c of mascara) {
    if (i >= d.length) break;
    if (c === "#") out += d[i++];
    else out += c;
  }
  return out;
}

/** Devolve o número no formato internacional (+5511987654321) ou null se estiver incompleto. */
export function telefoneInternacional(p: Pais, bruto: string) {
  const d = bruto.replace(/\D/g, "");
  if (d.length < (p.min ?? maxDigitos(p)) || d.length > maxDigitos(p)) return null;
  if (p.iso === "BR" && (Number(d.slice(0, 2)) < 11 || d[2] === "0")) return null;
  return `+${p.ddi}${d}`;
}

export const exemploTelefone = (p: Pais) => p.mascara.replace(/#/g, "0").replace(/^\(00\) 00000-0000$/, "(11) 98765-4321");
