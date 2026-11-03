export const FASES = [
  { id: 1, nome: "Inscrição", descricao: "Gupy ou site da companhia" },
  { id: 2, nome: "Testes online", descricao: "Lógica, perfil e inglês" },
  { id: 3, nome: "Dinâmica de grupo", descricao: "Online ou presencial" },
  { id: 4, nome: "Entrevista RH", descricao: "Por competências" },
  { id: 5, nome: "Entrevista em inglês", descricao: "Conversação e leitura" },
  { id: 6, nome: "Exames admissionais", descricao: "Médicos e documentação" },
  { id: 7, nome: "Treinamento", descricao: "Curso na companhia" },
] as const;

export const TOTAL_FASES = FASES.length;

export function nomeFase(id: number | null | undefined) {
  return FASES.find((f) => f.id === id)?.nome ?? "—";
}

export type Selecao = {
  id: string;
  companhia: string;
  companhia_slug: string;
  cargo: string;
  base: string;
  base_nome: string | null;
  mes_ref: string;
  slug: string;
  status: "inscricoes" | "andamento" | "encerrada";
  aberta_em: string | null;
  total_relatos: number;
  fase_max: number | null;
  ultimo_relato: string | null;
};

export type Relato = {
  id: string;
  selecao_id: string;
  fase_id: number;
  base: string | null;
  data_etapa: string;
  formato: "online" | "presencial";
  duracao: string | null;
  participantes: number | null;
  resultado: "avancou" | "aguardando" | "nao_avancou";
  texto: string;
  created_at: string;
  autor_nome: string | null;
  confirmacoes: number;
  verificado: boolean;
  confirmei: boolean | null;
  meu: boolean | null;
};

export const STATUS_SELECAO = {
  inscricoes: { label: "Inscrições abertas", cls: "bg-[#fff3e0] text-[#8a4b00]" },
  andamento: { label: "Em andamento", cls: "bg-[#e5f6ec] text-[#0f6b3a]" },
  encerrada: { label: "Encerrada", cls: "bg-[#eef0f4] text-ink-2" },
} as const;

export const RESULTADO = {
  avancou: { label: "Avançou de fase", cls: "bg-[#e5f6ec] text-[#0f6b3a]" },
  aguardando: { label: "Aguardando retorno", cls: "bg-[#fff3e0] text-[#8a4b00]" },
  nao_avancou: { label: "Não avançou", cls: "bg-[#eef0f4] text-ink-2" },
} as const;

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** "2026-11-01" → "Nov/2026" */
export function mesAno(iso: string) {
  const [a, m] = iso.split("-");
  return `${MESES[Number(m) - 1]}/${a}`;
}

/** "2026-10-28" → "28/10/2026" */
export function dataBR(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function haQuantoTempo(iso: string | null) {
  if (!iso) return "sem relatos ainda";
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

export function tituloSelecao(s: Pick<Selecao, "companhia" | "base" | "mes_ref">) {
  return `${s.companhia} · ${s.base} · ${mesAno(s.mes_ref)}`;
}

export function slugify(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
