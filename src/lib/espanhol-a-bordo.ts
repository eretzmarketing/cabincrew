/**
 * Flight Attendant Spanish · curso de espanhol operacional para comissários (conteúdo original Cabin Crew).
 * Mesmo formato do Flight Attendant English: cada aula tem um diálogo (que vira o MP3 gerado no ElevenLabs),
 * vocabulário, expressões, atividades e quiz. No tipo AulaIngles, o campo "en" guarda a fala em espanhol.
 */
import type { AulaIngles, ModuloIngles, Personagem } from "@/lib/ingles-a-bordo";
import { chaveAula } from "@/lib/ingles-a-bordo";
import { MODULO_ES_1 } from "@/lib/espanhol-a-bordo-m1";
import { MODULO_ES_2 } from "@/lib/espanhol-a-bordo-m2";
import { MODULO_ES_3 } from "@/lib/espanhol-a-bordo-m3";
import { MODULO_ES_4 } from "@/lib/espanhol-a-bordo-m4";
import { MODULO_ES_5 } from "@/lib/espanhol-a-bordo-m5";
import { MODULO_ES_6 } from "@/lib/espanhol-a-bordo-m6";
import { MODULO_ES_7 } from "@/lib/espanhol-a-bordo-m7";
import { MODULO_ES_8 } from "@/lib/espanhol-a-bordo-m8";

/** Elenco fixo do curso: a mesma tripulação e os mesmos passageiros aparecem nas aulas, como numa série. */
export const ELENCO_ES: Record<string, Personagem> = {
  Ana: { nome: "Ana Souza", papel: "Comissária brasileira, nova na companhia", voz: "f", sotaque: "BR", vozSugerida: "Mulher jovem, espanhol fluente com leve sotaque brasileiro" },
  Lucía: { nome: "Lucía Martín", papel: "Chefe de cabine, espanhola", voz: "f", sotaque: "ES", vozSugerida: "Mulher de 40 e poucos anos, espanhol da Espanha, calma e firme" },
  Diego: { nome: "Diego Pereyra", papel: "Comissário argentino, experiente", voz: "m", sotaque: "AR", vozSugerida: "Homem de 30 e poucos anos, sotaque argentino, simpático" },
  Sofía: { nome: "Sofía Restrepo", papel: "Comissária colombiana", voz: "f", sotaque: "CO", vozSugerida: "Mulher jovem, sotaque colombiano, animada e clara" },
  Comandante: { nome: "Comandante Javier Morales", papel: "Comandante, mexicano", voz: "m", sotaque: "MX", vozSugerida: "Homem de 50 anos, sotaque mexicano, voz grave e tranquila" },
  // passageiros
  Ramírez: { nome: "Sr. Alberto Ramírez", papel: "Passageiro mexicano, viaja a trabalho", voz: "m", sotaque: "MX", vozSugerida: "Homem de 50 anos, sotaque mexicano, educado e formal" },
  Fernández: { nome: "Sra. Carolina Fernández", papel: "Passageira argentina, viaja com o filho", voz: "f", sotaque: "AR", vozSugerida: "Mulher de 35 anos, sotaque argentino, simpática e um pouco cansada" },
  Mateo: { nome: "Mateo Fernández", papel: "Filho da Carolina, 8 anos", voz: "m", sotaque: "AR", vozSugerida: "Menino de 8 anos, sotaque argentino, curioso" },
  Ortega: { nome: "Sr. Manuel Ortega", papel: "Passageiro espanhol, impaciente", voz: "m", sotaque: "ES", vozSugerida: "Homem de 45 anos, espanhol da Espanha, firme e direto" },
  Valeria: { nome: "Srta. Valeria Castro", papel: "Passageira chilena, viaja sozinha", voz: "f", sotaque: "CL", vozSugerida: "Mulher de 30 anos, sotaque chileno, educada e um pouco ansiosa" },
  Herrera: { nome: "Dra. Paula Herrera", papel: "Médica colombiana, viajando como passageira", voz: "f", sotaque: "CO", vozSugerida: "Mulher de 45 anos, sotaque colombiano, calma e segura" },
};

const MODULOS_BASE: Omit<ModuloIngles, "aulas">[] = [
  { numero: 1, titulo: "Conhecendo a tripulação", tituloEn: "Conociendo a la tripulación", resumo: "Apresentar-se, funções a bordo e o briefing antes do voo.", foto: "/img/ingles/cena-01.jpg" },
  { numero: 2, titulo: "Embarque", tituloEn: "Bienvenidos a bordo", resumo: "Receber passageiros, cartões de embarque, assentos e bagagem de mão.", foto: "/img/ingles/cena-07.jpg" },
  { numero: 3, titulo: "Segurança e decolagem", tituloEn: "Seguridad y despegue", resumo: "Demonstração de segurança, checagens finais e turbulência.", foto: "/img/ingles/cena-11.jpg" },
  { numero: 4, titulo: "Serviço de bordo", tituloEn: "Servicio a bordo", resumo: "Bebidas, refeições, refeições especiais e alergias.", foto: "/img/ingles/cena-19.jpg" },
  { numero: 5, titulo: "Vendas e conforto", tituloEn: "Ventas y comodidad", resumo: "Vendas a bordo, pagamentos, conforto do passageiro e crianças a bordo.", foto: "/img/ingles/cena-21.jpg" },
  { numero: 6, titulo: "Saúde e emergências", tituloEn: "Salud y emergencias", resumo: "Passageiro passando mal, médico a bordo e comandos de evacuação.", foto: "/img/ingles/cena-29.jpg" },
  { numero: 7, titulo: "Atrasos e reclamações", tituloEn: "Retrasos y reclamos", resumo: "Explicar atrasos, conexões perdidas e acalmar passageiros irritados.", foto: "/img/ingles/cena-27.jpg" },
  { numero: 8, titulo: "Pouso e chegada", tituloEn: "Aterrizaje y llegada", resumo: "Preparar a cabine, anúncio de chegada, documentos e despedida.", foto: "/img/ingles/cena-10.jpg" },
];

const CONTEUDO: Record<number, AulaIngles[]> = {
  1: MODULO_ES_1, 2: MODULO_ES_2, 3: MODULO_ES_3, 4: MODULO_ES_4,
  5: MODULO_ES_5, 6: MODULO_ES_6, 7: MODULO_ES_7, 8: MODULO_ES_8,
};

export const MODULOS_ESPANHOL: ModuloIngles[] = MODULOS_BASE.map((m) => ({ ...m, aulas: CONTEUDO[m.numero] ?? [] }));

/** Ordem de todas as aulas do curso, para liberar uma depois da outra. */
export const TODAS_AULAS_ESPANHOL: AulaIngles[] = MODULOS_ESPANHOL.flatMap((m) => m.aulas);

export function acharAulaEspanhol(modulo: number, numero: number) {
  const m = MODULOS_ESPANHOL.find((x) => x.numero === modulo);
  const a = m?.aulas.find((x) => x.numero === numero);
  return m && a ? { modulo: m, aula: a } : null;
}

/** Roteiro de uma aula pronto para colar no ElevenLabs (uma fala por linha, com o nome do personagem). */
export function roteiroAulaEspanhol(a: AulaIngles) {
  return [
    `Arquivo: ${chaveAula(a)}.mp3  ·  Aula ${chaveAula(a)} – ${a.tituloEn}`,
    ...a.dialogo.personagens.map((q) => `  Voz de ${q}: ${ELENCO_ES[q]?.vozSugerida ?? ""}`),
    "",
    ...a.dialogo.falas.map((f) => `${f.quem}: ${f.en}`),
  ].join("\n");
}
