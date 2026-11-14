/**
 * Cursos de idioma para comissários (Flight Attendant English e Flight Attendant Spanish).
 * Os dois usam o mesmo formato de aula, as mesmas páginas e o mesmo gerador de áudio;
 * o que muda está descrito aqui.
 */
import { ELENCO, MODULOS_INGLES, TODAS_AULAS, acharAula, roteiroAula, type AulaIngles, type ModuloIngles, type Personagem } from "@/lib/ingles-a-bordo";
import { ELENCO_ES, MODULOS_ESPANHOL, TODAS_AULAS_ESPANHOL, acharAulaEspanhol, roteiroAulaEspanhol } from "@/lib/espanhol-a-bordo";

export type ProdutoIdioma = "english" | "spanish";

export type CursoIdioma = {
  produto: ProdutoIdioma;
  nome: string;
  base: string;                       // /english
  lang: "en" | "es";
  bcp: string;                        // voz e reconhecimento de fala do navegador
  idioma: string;                     // "inglês"
  bandeira: string;
  tabela: "ingles_progresso" | "espanhol_progresso";
  galeria: string | null;             // função do banco com os MP3 subidos na galeria de Mídia
  pastaAudios: string;
  eventoModulo: string;               // avisos de WhatsApp
  eventoConcluido: string;
  modulos: ModuloIngles[];
  todas: AulaIngles[];
  elenco: Record<string, Personagem>;
  achar: (modulo: number, numero: number) => { modulo: ModuloIngles; aula: AulaIngles } | null;
  roteiro: (a: AulaIngles) => string;
  textos: { selo: string; destaque: string; sub: string; parabens: string; despedida: string; capa: string };
};

export const INGLES: CursoIdioma = {
  produto: "english", nome: "Flight Attendant English", base: "/english", lang: "en", bcp: "en-US", idioma: "inglês", bandeira: "🇬🇧",
  tabela: "ingles_progresso", galeria: "audios_ingles", pastaAudios: "audios/ingles",
  eventoModulo: "ingles_modulo", eventoConcluido: "ingles_concluido",
  modulos: MODULOS_INGLES, todas: TODAS_AULAS, elenco: ELENCO, achar: acharAula, roteiro: roteiroAula,
  textos: {
    selo: "Curso completo de inglês para aviação", destaque: "English",
    sub: "O inglês que o comissário usa de verdade, do briefing ao desembarque. Ouça diálogos, pratique a fala, escreva e teste o que aprendeu em cada aula.",
    parabens: "Congratulations", despedida: "Have a nice flight!", capa: "/img/ingles/cena-01.jpg",
  },
};

export const ESPANHOL: CursoIdioma = {
  produto: "spanish", nome: "Flight Attendant Spanish", base: "/spanish", lang: "es", bcp: "es-ES", idioma: "espanhol", bandeira: "🇪🇸",
  tabela: "espanhol_progresso", galeria: null, pastaAudios: "audios/espanhol",
  eventoModulo: "espanhol_modulo", eventoConcluido: "espanhol_concluido",
  modulos: MODULOS_ESPANHOL, todas: TODAS_AULAS_ESPANHOL, elenco: ELENCO_ES, achar: acharAulaEspanhol, roteiro: roteiroAulaEspanhol,
  textos: {
    selo: "Curso completo de espanhol para aviação", destaque: "Spanish",
    sub: "O espanhol que o comissário usa a bordo, do briefing ao desembarque, com atenção aos falsos amigos do português. Ouça diálogos, pratique a fala, escreva e teste o que aprendeu em cada aula.",
    parabens: "¡Felicidades", despedida: "¡Buen viaje!", capa: "/img/ingles/cena-05.jpg",
  },
};

export const CURSOS_IDIOMA: Record<ProdutoIdioma, CursoIdioma> = { english: INGLES, spanish: ESPANHOL };

/** Para o componente da aula (roda no navegador): só o necessário, sem o conteúdo do curso inteiro. */
export function idiomaDaAula(c: CursoIdioma, a: AulaIngles) {
  const quem = new Set([...a.dialogo.personagens, ...a.dialogo.falas.map((f) => f.quem)]);
  return {
    produto: c.produto, lang: c.lang, bcp: c.bcp, nome: c.idioma, base: c.base,
    elenco: Object.fromEntries([...quem].filter((q) => c.elenco[q]).map((q) => [q, c.elenco[q]])),
  };
}
