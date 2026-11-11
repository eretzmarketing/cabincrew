/** Treino de vídeo de apresentação: roteiro em blocos e checklist de autoavaliação. */

export type BlocoVideo = { id: string; titulo: string; pergunta: string; exemplo: string; peso: number };

/** peso = fração do tempo total recomendada para o bloco */
export const BLOCOS_VIDEO: BlocoVideo[] = [
  { id: "quem", titulo: "Quem é você", pergunta: "Nome, idade e cidade. Uma frase que resume você.", exemplo: "Olá, meu nome é Ana, tenho 24 anos e moro em Campinas.", peso: 0.13 },
  { id: "experiencia", titulo: "Sua experiência", pergunta: "Onde trabalhou com atendimento e um resultado concreto.", exemplo: "Trabalho há 3 anos na recepção de um hotel, atendendo hóspedes de vários países. Fui eleita destaque do atendimento em 2025.", peso: 0.27 },
  { id: "motivo", titulo: "Por que comissário(a)", pergunta: "Sua motivação real, com um exemplo. Fale de servir e de segurança, e não só de viajar.", exemplo: "Gosto de cuidar de pessoas em momentos importantes da vida delas, e a cabine é o lugar onde isso acontece com responsabilidade pela segurança de todos.", peso: 0.27 },
  { id: "companhia", titulo: "Por que esta companhia", pergunta: "O que você admira nela e como isso combina com você.", exemplo: "Admiro o cuidado da companhia com o atendimento e quero crescer junto com as novas rotas.", peso: 0.2 },
  { id: "fechamento", titulo: "Fechamento", pergunta: "Agradecimento e disponibilidade.", exemplo: "Obrigada pela oportunidade. Tenho disponibilidade total e estou pronta para essa nova etapa.", peso: 0.13 },
];

export const METAS_VIDEO = [
  { seg: 60, rotulo: "1 minuto" },
  { seg: 90, rotulo: "1 min e 30" },
  { seg: 120, rotulo: "2 minutos" },
];

export const CHECKLIST_VIDEO: { id: string; grupo: string; texto: string }[] = [
  { id: "tempo", grupo: "Conteúdo", texto: "Terminei dentro do tempo (nem muito antes, nem depois)." },
  { id: "blocos", grupo: "Conteúdo", texto: "Passei pelos 5 blocos do roteiro, na ordem." },
  { id: "exemplo", grupo: "Conteúdo", texto: "Contei pelo menos um exemplo concreto da minha experiência." },
  { id: "motivo", grupo: "Conteúdo", texto: "Minha motivação não ficou só em \"gosto de viajar\"." },
  { id: "olhar", grupo: "Comunicação", texto: "Olhei para a lente da câmera, e não para a tela ou para o papel." },
  { id: "voz", grupo: "Comunicação", texto: "Falei com calma, voz clara e sem muitos \"é…\", \"tipo\", \"né\"." },
  { id: "natural", grupo: "Comunicação", texto: "Pareci natural: não soou como texto decorado ou lido." },
  { id: "sorriso", grupo: "Imagem", texto: "Sorri no começo e no fim, com expressão simpática." },
  { id: "imagem", grupo: "Imagem", texto: "Roupa, cabelo e postura estão como no dia da seleção." },
  { id: "ambiente", grupo: "Imagem", texto: "Fundo neutro, boa luz no rosto e sem barulho." },
];

export const NOTA_VIDEO = 80;

/** O item "tempo" é marcado pela duração real: entre 75% da meta e 10 s acima dela. */
export const dentroDoTempo = (duracao: number, meta: number) => duracao >= meta * 0.75 && duracao <= meta + 10;

/** Tempo (em segundos) em que cada bloco começa, para a meta escolhida. */
export function marcosVideo(meta: number) {
  let acc = 0;
  return BLOCOS_VIDEO.map((b) => { const ini = acc; acc += b.peso * meta; return { id: b.id, ini: Math.round(ini), fim: Math.round(acc) }; });
}

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
