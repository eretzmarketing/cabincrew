/**
 * Inglês a bordo · curso de inglês operacional para comissários (conteúdo original Cabin Crew).
 * Cada aula tem um diálogo (que vira o MP3 "M.A.mp3" gerado no ElevenLabs), vocabulário,
 * expressões e atividades. Enquanto o MP3 não existe, o site lê o diálogo com a voz do navegador.
 */
import { MODULO_1 } from "@/lib/ingles-a-bordo-m1";

export type Personagem = {
  nome: string;
  papel: string;           // em português, para o aluno
  voz: "f" | "m";
  sotaque: "US" | "GB" | "AU" | "BR";
  vozSugerida: string;     // dica para escolher a voz no ElevenLabs
};

export type Fala = { quem: string; en: string; pt: string };
export type Opcao = { texto: string; certa?: boolean };
export type Questao = { pergunta: string; opcoes: Opcao[]; explicacao: string };

export type Atividade =
  | { tipo: "compreensao"; questoes: Questao[] }
  | { tipo: "ditado"; frases: string[] }
  | { tipo: "ordenar"; instrucao: string; falas: string[] }                 // na ordem certa; o site embaralha
  | { tipo: "ligar"; instrucao: string; pares: [string, string][] }
  | { tipo: "lacunas"; itens: { frase: string; resposta: string; aceitas?: string[]; dica?: string }[] } // use ___ na frase
  | { tipo: "falar"; frases: { en: string; pt: string }[] }
  | { tipo: "roleplay"; situacao: string; voce: string; turnos: { outro: string; modelo: string }[] };

export type AulaIngles = {
  modulo: number;
  numero: number;
  titulo: string;
  tituloEn: string;
  objetivo: string;
  foto: string;
  fotoAlt: string;
  minutos: number;
  intro: string;
  dialogo: { titulo: string; contexto: string; personagens: string[]; falas: Fala[] };
  vocabulario: { en: string; pt: string }[];
  expressoes: { en: string; pt: string; uso?: string }[];
  dica?: string;
  atividades: Atividade[];
  quiz: Questao[];
};

export type ModuloIngles = { numero: number; titulo: string; tituloEn: string; resumo: string; foto: string; aulas: AulaIngles[] };

/** Elenco fixo do curso: as mesmas pessoas aparecem nas aulas, como numa série. */
export const ELENCO: Record<string, Personagem> = {
  Ana: { nome: "Ana Souza", papel: "Comissária brasileira, nova na companhia", voz: "f", sotaque: "BR", vozSugerida: "Mulher jovem, inglês fluente com leve sotaque brasileiro" },
  Tom: { nome: "Tom Hughes", papel: "Comissário britânico, experiente", voz: "m", sotaque: "GB", vozSugerida: "Homem de 30 e poucos anos, sotaque britânico, simpático" },
  Grace: { nome: "Grace Miller", papel: "Chefe de cabine (purser), americana", voz: "f", sotaque: "US", vozSugerida: "Mulher de 40 e poucos anos, sotaque americano, calma e firme" },
  Leila: { nome: "Leila Haddad", papel: "Comissária australiana", voz: "f", sotaque: "AU", vozSugerida: "Mulher jovem, sotaque australiano, animada" },
  Captain: { nome: "Captain David Reyes", papel: "Comandante, americano", voz: "m", sotaque: "US", vozSugerida: "Homem de 50 anos, sotaque americano, voz grave e tranquila" },
  Marco: { nome: "Marco Bianchi", papel: "Comissário italiano", voz: "m", sotaque: "GB", vozSugerida: "Homem jovem, inglês fluente com leve sotaque italiano" },
};

const MODULOS_BASE: Omit<ModuloIngles, "aulas">[] = [
  { numero: 1, titulo: "Conhecendo a tripulação", tituloEn: "Meeting your crew", resumo: "Apresentar-se, conversar com colegas, funções a bordo e o briefing pré-voo.", foto: "/img/ingles/cena-01.jpg" },
  { numero: 2, titulo: "Embarque", tituloEn: "Welcome on board", resumo: "Receber passageiros, cartões de embarque, assentos e bagagem de mão.", foto: "/img/ingles/cena-07.jpg" },
  { numero: 3, titulo: "Segurança e decolagem", tituloEn: "Safety and take-off", resumo: "Demonstração de segurança, checagens finais e anúncios antes da decolagem.", foto: "/img/ingles/cena-11.jpg" },
  { numero: 4, titulo: "Serviço de bordo", tituloEn: "Food and drinks", resumo: "Oferecer opções, servir bebidas, refeições especiais e alergias.", foto: "/img/ingles/cena-19.jpg" },
  { numero: 5, titulo: "Duty-free e pagamentos", tituloEn: "Duty-free and payments", resumo: "Vender a bordo, moedas, cartões e troco.", foto: "/img/ingles/cena-20.jpg" },
  { numero: 6, titulo: "Pedidos e pequenos problemas", tituloEn: "Passenger needs", resumo: "Conforto, temperatura, assentos, objetos perdidos e crianças a bordo.", foto: "/img/ingles/cena-13.jpg" },
  { numero: 7, titulo: "Situações médicas", tituloEn: "Medical situations", resumo: "Perguntar sintomas, chamar um médico a bordo e acalmar passageiros.", foto: "/img/ingles/cena-16.jpg" },
  { numero: 8, titulo: "Emergências e evacuação", tituloEn: "Emergencies", resumo: "Turbulência forte, despressurização, pouso de emergência e comandos de evacuação.", foto: "/img/ingles/cena-12.jpg" },
  { numero: 9, titulo: "Atrasos e passageiros difíceis", tituloEn: "Delays and complaints", resumo: "Explicar atrasos, conexões, pedir desculpas e lidar com reclamações.", foto: "/img/ingles/cena-27.jpg" },
  { numero: 10, titulo: "Pouso e desembarque", tituloEn: "Landing and arrival", resumo: "Preparar a cabine, anúncios de chegada, imigração e despedida.", foto: "/img/ingles/cena-10.jpg" },
  { numero: 11, titulo: "Simulação final", tituloEn: "Final flight simulation", resumo: "Um voo completo do briefing ao desembarque, com todas as situações.", foto: "/img/ingles/cena-03.jpg" },
];

const CONTEUDO: Record<number, AulaIngles[]> = { 1: MODULO_1 };

export const MODULOS_INGLES: ModuloIngles[] = MODULOS_BASE.map((m) => ({ ...m, aulas: CONTEUDO[m.numero] ?? [] }));

export const NOTA_MINIMA = 70;

/** "1.3": identifica a aula no progresso e no nome do arquivo de áudio (1.3.mp3). */
export const chaveAula = (a: { modulo: number; numero: number }) => `${a.modulo}.${a.numero}`;

export function acharAula(modulo: number, numero: number) {
  const m = MODULOS_INGLES.find((x) => x.numero === modulo);
  const a = m?.aulas.find((x) => x.numero === numero);
  return m && a ? { modulo: m, aula: a } : null;
}

/** Ordem de todas as aulas do curso, para liberar uma depois da outra. */
export const TODAS_AULAS: AulaIngles[] = MODULOS_INGLES.flatMap((m) => m.aulas);

/** Lê "1.3.mp3", "1.3 - Briefing.mp3", "Aula 1.3.m4a"… e devolve "1.3". */
export function chaveDoArquivo(nome: string): string | null {
  const m = nome.match(/^\s*(?:aula\s*)?(\d{1,2})\.(\d{1,2})(?=[^\d]|$)/i);
  return m ? `${Number(m[1])}.${Number(m[2])}` : null;
}

/** Roteiro de uma aula pronto para colar no ElevenLabs (uma fala por linha, com o nome do personagem). */
export function roteiroAula(a: AulaIngles) {
  const nome = (q: string) => (q === "Captain" ? "Captain" : q);
  return [
    `Arquivo: ${chaveAula(a)}.mp3  ·  Aula ${chaveAula(a)} – ${a.tituloEn}`,
    ...a.dialogo.personagens.map((q) => `  Voz de ${nome(q)}: ${ELENCO[q]?.vozSugerida ?? ""}`),
    "",
    ...a.dialogo.falas.map((f) => `${nome(f.quem)}: ${f.en}`),
  ].join("\n");
}
