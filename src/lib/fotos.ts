/**
 * Banco de fotos do Cabin Crew (enviadas pelo Daniel, em public/img/banco).
 * Use estes nomes ao montar páginas novas; "uso" lista onde a foto já aparece.
 */
export const FOTOS = {
  "comissaria-aviao-miniatura": { alt: "Comissária sorridente segurando um avião em miniatura", formato: "paisagem", uso: ["Entrevista em inglês · parte 1"] },
  "comissaria-cinto-seguranca": { alt: "Comissária mostrando o cinto de segurança", formato: "paisagem larga (pessoa à direita, espaço para texto à esquerda)", uso: [] },
  "avioes-patio-por-do-sol": { alt: "Avião no pátio do aeroporto ao pôr do sol", formato: "paisagem", uso: [] },
  "comissaria-corredor-cabine": { alt: "Comissária caminhando pelo corredor da cabine durante o voo", formato: "paisagem", uso: [] },
  "porta-aviao-salto": { alt: "Silhueta de pernas de salto alto na porta do avião, com o aeroporto ao fundo", formato: "retrato", uso: [] },
  "tripulantes-assento-porta": { alt: "Duas comissárias sentadas nos assentos de tripulação junto à porta de emergência", formato: "paisagem", uso: [] },
  "aviao-entre-predios": { alt: "Avião visto de baixo passando entre prédios, em preto e branco", formato: "retrato", uso: [] },
  "aeroporto-esteira": { alt: "Esteira rolante num corredor de aeroporto com placas de portões", formato: "paisagem", uso: [] },
  "aeroporto-vista-aerea": { alt: "Vista aérea de um terminal com aviões de várias companhias", formato: "paisagem", uso: [] },
  "mapa-mundi-aviao": { alt: "Mão levando um avião de brinquedo sobre um mapa-múndi desenhado a giz", formato: "paisagem", uso: ["Entrevista em inglês · parte 4"] },
  "comissaria-cabine-bracos-cruzados": { alt: "Comissária sorridente de braços cruzados na cabine cheia de passageiros", formato: "paisagem", uso: ["Entrevista em inglês · parte 5"] },
  "comissaria-demonstracao-seguranca": { alt: "Comissária fazendo a demonstração de segurança no corredor da cabine", formato: "paisagem", uso: ["Entrevista em inglês · parte 8"] },
  "comissaria-cauda-aviao": { alt: "Comissária sorrindo ao sol junto à cauda do avião", formato: "retrato", uso: [] },
  "comissaria-e-piloto": { alt: "Comissária e piloto lado a lado na cabine de passageiros", formato: "paisagem", uso: ["Entrevista em inglês · parte 7"] },
  "aviao-visto-de-baixo-1": { alt: "Avião visto de baixo contra o céu escuro", formato: "retrato", uso: [] },
  "aviao-visto-de-baixo-2": { alt: "Avião visto de baixo contra o céu escuro", formato: "retrato", uso: [] },
  "comissaria-painel-voos": { alt: "Comissária de costas olhando o painel de voos do aeroporto", formato: "paisagem larga", uso: ["Entrevista em inglês · parte 3"] },
  "patio-avioes-anoitecer": { alt: "Aviões estacionados no pátio ao anoitecer", formato: "paisagem larga", uso: [] },
  "familia-praia": { alt: "Família sorrindo e brincando na praia", formato: "paisagem", uso: ["Entrevista em inglês · parte 2"] },
  "criancas-brincando": { alt: "Crianças brincando de patinete e patins numa estrada arborizada", formato: "paisagem", uso: ["Entrevista em inglês · parte 6"] },
} as const;

export type NomeFoto = keyof typeof FOTOS;
export const foto = (nome: NomeFoto) => ({ src: `/img/banco/${nome}.jpg`, alt: FOTOS[nome].alt });
