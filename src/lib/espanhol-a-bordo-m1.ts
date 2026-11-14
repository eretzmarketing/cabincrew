import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 1 · Conociendo a la tripulación. Conteúdo original Cabin Crew. */
export const MODULO_ES_1: AulaIngles[] = [
  /* ------------------------------------------------------------------ 1.1 */
  {
    modulo: 1,
    numero: 1,
    titulo: "Prazer, eu sou a Ana",
    tituloEn: "Mucho gusto, soy Ana",
    objetivo: "Apresentar-se para a tripulação, dizer de onde você é e há quanto tempo voa.",
    foto: "/img/ingles/cena-01.jpg",
    fotoAlt: "Comissários se cumprimentando com aperto de mão na sala da tripulação",
    minutos: 15,
    intro:
      "Na sala da tripulação, antes do voo, todo mundo se apresenta. Em espanhol, entre colegas, o normal é usar \"tú\" (você). Com passageiros, o padrão é \"usted\" (o senhor, a senhora). Nesta aula a Ana, comissária brasileira recém-chegada, conhece a tripulação do voo para Buenos Aires.",
    dialogo: {
      titulo: "En la sala de tripulación",
      contexto: "Aeroporto de Guarulhos, 6h da manhã. Ana conhece Diego e Sofía antes do voo para Buenos Aires.",
      personagens: ["Diego", "Ana", "Sofía"],
      falas: [
        { quem: "Diego", en: "¡Hola! Buenos días. Soy Diego. ¿Eres nueva?", pt: "Oi! Bom dia. Sou o Diego. Você é nova?" },
        { quem: "Ana", en: "Buenos días, Diego. Sí, soy nueva. Me llamo Ana. Mucho gusto.", pt: "Bom dia, Diego. Sim, sou nova. Meu nome é Ana. Muito prazer." },
        { quem: "Diego", en: "Encantado, Ana. ¿De dónde eres?", pt: "Encantado, Ana. De onde você é?" },
        { quem: "Ana", en: "Soy de Brasil, de Campinas. ¿Y tú?", pt: "Sou do Brasil, de Campinas. E você?" },
        { quem: "Diego", en: "Yo soy de Argentina, de Rosario. Vuelo hace seis años.", pt: "Eu sou da Argentina, de Rosário. Voo há seis anos." },
        { quem: "Sofía", en: "¡Hola, chicos! Soy Sofía. Soy de Medellín, Colombia.", pt: "Oi, pessoal! Sou a Sofía. Sou de Medellín, Colômbia." },
        { quem: "Ana", en: "Mucho gusto, Sofía. Este es mi primer vuelo a Buenos Aires.", pt: "Muito prazer, Sofía. Este é o meu primeiro voo para Buenos Aires." },
        { quem: "Sofía", en: "¡Qué bien! Bienvenida al equipo. Si necesitas algo, me avisas.", pt: "Que legal! Bem-vinda à equipe. Se precisar de algo, me avisa." },
        { quem: "Ana", en: "Muchas gracias. Muy amable.", pt: "Muito obrigada. Muito gentil." },
      ],
    },
    vocabulario: [
      { en: "tripulación", pt: "tripulação" },
      { en: "tripulante de cabina", pt: "comissário(a) de voo" },
      { en: "sala de tripulación", pt: "sala da tripulação" },
      { en: "vuelo", pt: "voo" },
      { en: "equipo", pt: "equipe" },
      { en: "nuevo / nueva", pt: "novo / nova" },
      { en: "compañero / compañera", pt: "colega" },
      { en: "primer vuelo", pt: "primeiro voo" },
    ],
    expressoes: [
      { en: "Mucho gusto.", pt: "Muito prazer.", uso: "Para responder a uma apresentação. Também se diz \"Encantado\" ou \"Encantada\"." },
      { en: "Me llamo Ana.", pt: "Meu nome é Ana.", uso: "Literalmente: \"eu me chamo Ana\"." },
      { en: "¿De dónde eres?", pt: "De onde você é?", uso: "Com \"tú\", entre colegas. Com passageiros: \"¿De dónde es usted?\"." },
      { en: "Vuelo hace seis años.", pt: "Voo há seis anos.", uso: "\"Hace\" + tempo = \"há\" + tempo." },
      { en: "Bienvenida al equipo.", pt: "Bem-vinda à equipe.", uso: "\"Bienvenido\" para homem, \"bienvenida\" para mulher." },
    ],
    dica: "Atenção aos falsos amigos: \"equipo\" é equipe (e não equipamento só); \"oficina\" é escritório; \"apellido\" é sobrenome, não apelido. Em espanhol o ponto de interrogação e o de exclamação abrem a frase invertidos: ¿…? e ¡…!",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿De dónde es Diego?", opcoes: [{ texto: "De Colombia" }, { texto: "De Argentina", certa: true }, { texto: "De Brasil" }], explicacao: "Diego diz: \"Yo soy de Argentina, de Rosario.\"" },
          { pergunta: "¿Cuántos años vuela Diego?", opcoes: [{ texto: "Seis", certa: true }, { texto: "Dos" }, { texto: "Diez" }], explicacao: "\"Vuelo hace seis años.\"" },
          { pergunta: "¿Adónde va el vuelo de Ana?", opcoes: [{ texto: "A Medellín" }, { texto: "A Rosario" }, { texto: "A Buenos Aires", certa: true }], explicacao: "Ana diz que é o primeiro voo dela a Buenos Aires." },
        ],
      },
      { tipo: "ditado", frases: ["Me llamo Ana.", "Mucho gusto.", "Soy de Brasil."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a apresentação na ordem certa.",
        falas: ["¡Hola! Soy Diego. ¿Eres nueva?", "Sí, me llamo Ana. Mucho gusto.", "Encantado. ¿De dónde eres?", "Soy de Brasil. ¿Y tú?", "Soy de Argentina."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o espanhol ao português.",
        pares: [
          ["tripulación", "tripulação"],
          ["equipo", "equipe"],
          ["apellido", "sobrenome"],
          ["Mucho gusto.", "Muito prazer."],
          ["compañera", "colega"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Buenos días. Me ___ Ana.", resposta: "llamo" },
          { frase: "Mucho ___.", resposta: "gusto" },
          { frase: "¿De ___ eres?", resposta: "dónde", aceitas: ["donde"] },
          { frase: "Soy ___ Brasil.", resposta: "de" },
          { frase: "Vuelo ___ seis años.", resposta: "hace", dica: "\"há\" seis anos" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Buenos días. Me llamo Ana. Mucho gusto.", pt: "Bom dia. Meu nome é Ana. Muito prazer." },
          { en: "Soy de Brasil. ¿Y tú?", pt: "Sou do Brasil. E você?" },
          { en: "Este es mi primer vuelo a Buenos Aires.", pt: "Este é o meu primeiro voo para Buenos Aires." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Você chega na sala da tripulação e um colega vem falar com você. Apresente-se.",
        voce: "Comissário(a) novo(a)",
        turnos: [
          { outro: "¡Hola! Soy Sofía. ¿Eres nuevo?", modelo: "Sí, soy nuevo. Me llamo [seu nome]. Mucho gusto." },
          { outro: "Encantada. ¿De dónde eres?", modelo: "Soy de Brasil, de [sua cidade]. ¿Y tú?" },
          { outro: "Soy de Colombia. ¿Es tu primer vuelo?", modelo: "Sí, es mi primer vuelo con la compañía." },
          { outro: "¡Bienvenido al equipo!", modelo: "Muchas gracias. Muy amable." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Como se diz \"Muito prazer\" em espanhol?", opcoes: [{ texto: "Mucho placer." }, { texto: "Mucho gusto.", certa: true }, { texto: "Gran gusto." }], explicacao: "\"Mucho gusto\" ou \"Encantado/Encantada\"." },
      { pergunta: "Entre colegas de tripulação, qual tratamento é o mais comum?", opcoes: [{ texto: "tú", certa: true }, { texto: "usted" }, { texto: "vosotros" }], explicacao: "Entre colegas usa-se \"tú\". Com passageiros, \"usted\"." },
      { pergunta: "O que significa \"apellido\"?", opcoes: [{ texto: "Apelido" }, { texto: "Sobrenome", certa: true }, { texto: "Nome do meio" }], explicacao: "Falso amigo: \"apellido\" é sobrenome. Apelido é \"apodo\"." },
      { pergunta: "Complete: \"Vuelo ___ cinco años.\"", opcoes: [{ texto: "desde" }, { texto: "por" }, { texto: "hace", certa: true }], explicacao: "\"Hace\" + tempo equivale a \"há\" + tempo." },
      { pergunta: "Qual pergunta está escrita corretamente?", opcoes: [{ texto: "¿De dónde eres?", certa: true }, { texto: "De dónde eres?" }, { texto: "?De dónde eres?" }], explicacao: "Em espanhol a pergunta abre com ¿ e fecha com ?." },
    ],
  },

  /* ------------------------------------------------------------------ 1.2 */
  {
    modulo: 1,
    numero: 2,
    titulo: "Funções e posições a bordo",
    tituloEn: "Funciones y posiciones",
    objetivo: "Falar das funções da tripulação e das partes do avião: galley, portas, corredor e cabine.",
    foto: "/img/ingles/cena-06.jpg",
    fotoAlt: "Dois comissários conferindo informações em um tablet na cabine",
    minutos: 15,
    intro:
      "Antes de embarcar os passageiros, cada tripulante sabe a sua posição e a sua porta. Nesta aula você aprende como se chamam as funções e os lugares do avião em espanhol. Muitas companhias usam \"galley\" em inglês mesmo; outras dizem \"cocina\".",
    dialogo: {
      titulo: "¿Cuál es tu posición?",
      contexto: "Ana e Diego conferem as posições do voo no tablet, antes do briefing.",
      personagens: ["Ana", "Diego"],
      falas: [
        { quem: "Ana", en: "Diego, ¿cuál es mi posición hoy?", pt: "Diego, qual é a minha posição hoje?" },
        { quem: "Diego", en: "Tú estás en la puerta dos izquierda, en la parte trasera.", pt: "Você está na porta dois esquerda, na parte de trás." },
        { quem: "Ana", en: "¿Y quién está en el galley delantero?", pt: "E quem está na galley dianteira?" },
        { quem: "Diego", en: "Sofía. Ella se encarga del servicio en clase ejecutiva.", pt: "A Sofía. Ela cuida do serviço na classe executiva." },
        { quem: "Ana", en: "¿Y tú?", pt: "E você?" },
        { quem: "Diego", en: "Yo estoy contigo atrás, en el galley trasero. Lucía es la jefa de cabina.", pt: "Eu estou com você atrás, na galley traseira. A Lucía é a chefe de cabine." },
        { quem: "Ana", en: "Perfecto. ¿Dónde está el botiquín de primeros auxilios?", pt: "Perfeito. Onde fica o kit de primeiros socorros?" },
        { quem: "Diego", en: "Hay uno en cada galley, en el compartimento de arriba.", pt: "Tem um em cada galley, no compartimento de cima." },
        { quem: "Ana", en: "Gracias. Voy a revisar mi equipo de emergencia.", pt: "Obrigada. Vou conferir meu equipamento de emergência." },
      ],
    },
    vocabulario: [
      { en: "jefe / jefa de cabina", pt: "chefe de cabine" },
      { en: "puerta", pt: "porta" },
      { en: "izquierda / derecha", pt: "esquerda / direita" },
      { en: "delantero / trasero", pt: "dianteiro / traseiro" },
      { en: "pasillo", pt: "corredor" },
      { en: "clase ejecutiva / económica", pt: "classe executiva / econômica" },
      { en: "botiquín de primeros auxilios", pt: "kit de primeiros socorros" },
      { en: "equipo de emergencia", pt: "equipamento de emergência" },
    ],
    expressoes: [
      { en: "¿Cuál es mi posición?", pt: "Qual é a minha posição?", uso: "Para perguntar a porta ou a área de trabalho." },
      { en: "Estás en la puerta dos izquierda.", pt: "Você está na porta dois esquerda.", uso: "As portas são numeradas da frente para trás." },
      { en: "Ella se encarga del servicio.", pt: "Ela cuida do serviço.", uso: "\"Encargarse de\" = ser responsável por." },
      { en: "Voy a revisar…", pt: "Vou conferir…", uso: "\"Revisar\" é conferir, checar." },
      { en: "Hay uno en cada galley.", pt: "Tem um em cada galley.", uso: "\"Hay\" = há, tem (existe)." },
    ],
    dica: "\"Pasillo\" é o corredor do avião. Não confunda com \"pastilla\" (comprimido). E \"cabina\" sozinha pode ser a cabine de comando; para os passageiros, diga \"cabina de pasajeros\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuál es la posición de Ana?", opcoes: [{ texto: "Puerta uno derecha" }, { texto: "Puerta dos izquierda", certa: true }, { texto: "Galley delantero" }], explicacao: "Diego diz: \"Tú estás en la puerta dos izquierda\"." },
          { pergunta: "¿Quién es la jefa de cabina?", opcoes: [{ texto: "Sofía" }, { texto: "Ana" }, { texto: "Lucía", certa: true }], explicacao: "\"Lucía es la jefa de cabina.\"" },
          { pergunta: "¿Dónde está el botiquín?", opcoes: [{ texto: "En cada galley", certa: true }, { texto: "En la cabina de mando" }, { texto: "Debajo de los asientos" }], explicacao: "\"Hay uno en cada galley.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Cuál es mi posición?", "Estás en la puerta dos.", "La jefa de cabina es Lucía."] },
      {
        tipo: "ordenar",
        instrucao: "Monte o diálogo na ordem.",
        falas: ["¿Cuál es mi posición hoy?", "Estás en la puerta uno derecha.", "¿Y quién está en el galley trasero?", "Diego. Él se encarga del servicio.", "Perfecto, gracias."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["pasillo", "corredor"],
          ["trasero", "traseiro"],
          ["izquierda", "esquerda"],
          ["botiquín", "kit de primeiros socorros"],
          ["revisar", "conferir"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿___ es mi posición hoy?", resposta: "Cuál", aceitas: ["cual"] },
          { frase: "Estás en la puerta dos ___.", resposta: "izquierda", dica: "esquerda" },
          { frase: "Lucía es la ___ de cabina.", resposta: "jefa" },
          { frase: "___ uno en cada galley.", resposta: "Hay" },
          { frase: "Voy a ___ mi equipo de emergencia.", resposta: "revisar" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "¿Cuál es mi posición hoy?", pt: "Qual é a minha posição hoje?" },
          { en: "Estoy en la puerta dos derecha.", pt: "Estou na porta dois direita." },
          { en: "Voy a revisar mi equipo de emergencia.", pt: "Vou conferir meu equipamento de emergência." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "A chefe de cabine confirma a sua posição antes do voo.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Hola. Hoy estás en la puerta uno derecha.", modelo: "Perfecto. ¿Quién está en el galley delantero?" },
          { outro: "Sofía. Ella se encarga del servicio en ejecutiva.", modelo: "Entendido. ¿Dónde está el botiquín?" },
          { outro: "En el galley, en el compartimento de arriba.", modelo: "Gracias. Voy a revisar mi equipo de emergencia." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Como se diz \"corredor\" do avião em espanhol?", opcoes: [{ texto: "corredor de pasajeros" }, { texto: "pasillo", certa: true }, { texto: "pastilla" }], explicacao: "\"Pasillo\". \"Pastilla\" é comprimido." },
      { pergunta: "\"Puerta dos izquierda\" significa:", opcoes: [{ texto: "Porta dois direita" }, { texto: "Porta dois esquerda", certa: true }, { texto: "Segunda porta da frente" }], explicacao: "\"Izquierda\" = esquerda; \"derecha\" = direita." },
      { pergunta: "O que significa \"revisar el equipo\"?", opcoes: [{ texto: "Conferir o equipamento", certa: true }, { texto: "Rever a equipe" }, { texto: "Trocar o equipamento" }], explicacao: "\"Revisar\" = conferir; \"equipo\" aqui é equipamento." },
      { pergunta: "Qual é o feminino de \"jefe de cabina\"?", opcoes: [{ texto: "chefa de cabina" }, { texto: "jefa de cabina", certa: true }, { texto: "jefesa de cabina" }], explicacao: "\"La jefa de cabina\"." },
      { pergunta: "\"Hay uno en cada galley\" quer dizer:", opcoes: [{ texto: "Tem um em cada galley.", certa: true }, { texto: "Há um galley só." }, { texto: "Cada um tem um galley." }], explicacao: "\"Hay\" = há, tem." },
    ],
  },

  /* ------------------------------------------------------------------ 1.3 */
  {
    modulo: 1,
    numero: 3,
    titulo: "O briefing antes do voo",
    tituloEn: "El briefing antes del vuelo",
    objetivo: "Entender as informações do briefing: tempo de voo, clima, passageiros especiais e perguntas de segurança.",
    foto: "/img/ingles/cena-04.jpg",
    fotoAlt: "Chefe de cabine conduzindo o briefing com a tripulação sentada",
    minutos: 18,
    intro:
      "No briefing a chefe de cabine passa as informações do voo e faz perguntas de segurança. Você precisa entender números (tempo de voo, quantidade de passageiros), o clima e os passageiros que precisam de atenção especial.",
    dialogo: {
      titulo: "Briefing con Lucía",
      contexto: "Lucía, a chefe de cabine, faz o briefing do voo 2045 de São Paulo para Buenos Aires. O comandante passa rapidamente.",
      personagens: ["Lucía", "Comandante", "Ana", "Diego"],
      falas: [
        { quem: "Lucía", en: "Buenos días a todos. Hoy operamos el vuelo 2045 a Buenos Aires.", pt: "Bom dia a todos. Hoje operamos o voo 2045 para Buenos Aires." },
        { quem: "Comandante", en: "Buenos días. El tiempo de vuelo es de dos horas y cuarenta minutos. Esperamos algo de turbulencia al despegar.", pt: "Bom dia. O tempo de voo é de duas horas e quarenta minutos. Esperamos um pouco de turbulência na decolagem." },
        { quem: "Lucía", en: "Gracias, comandante. Tenemos ciento sesenta pasajeros, un bebé y un menor no acompañado.", pt: "Obrigada, comandante. Temos cento e sessenta passageiros, um bebê e um menor desacompanhado." },
        { quem: "Lucía", en: "También hay una pasajera en silla de ruedas en la fila tres.", pt: "Também há uma passageira em cadeira de rodas na fileira três." },
        { quem: "Lucía", en: "Ana, una pregunta de seguridad: ¿dónde está el extintor más cercano a tu puerta?", pt: "Ana, uma pergunta de segurança: onde fica o extintor mais próximo da sua porta?" },
        { quem: "Ana", en: "Está en el armario detrás del último asiento, en el lado izquierdo.", pt: "Fica no armário atrás do último assento, do lado esquerdo." },
        { quem: "Lucía", en: "Muy bien. Diego, ¿cuál es la orden para una evacuación en tierra?", pt: "Muito bem. Diego, qual é o comando para uma evacuação em terra?" },
        { quem: "Diego", en: "¡Suelten los cinturones! ¡Vengan por aquí!", pt: "Soltem os cintos! Venham por aqui!" },
        { quem: "Lucía", en: "Perfecto. ¿Alguna pregunta? Entonces, ¡a trabajar y buen vuelo!", pt: "Perfeito. Alguma pergunta? Então, vamos trabalhar e bom voo!" },
      ],
    },
    vocabulario: [
      { en: "tiempo de vuelo", pt: "tempo de voo" },
      { en: "despegar / despegue", pt: "decolar / decolagem" },
      { en: "aterrizar / aterrizaje", pt: "pousar / pouso" },
      { en: "menor no acompañado", pt: "menor desacompanhado" },
      { en: "silla de ruedas", pt: "cadeira de rodas" },
      { en: "fila", pt: "fileira" },
      { en: "extintor", pt: "extintor" },
      { en: "cinturón (de seguridad)", pt: "cinto (de segurança)" },
    ],
    expressoes: [
      { en: "Hoy operamos el vuelo…", pt: "Hoje operamos o voo…", uso: "Abertura típica do briefing." },
      { en: "Esperamos algo de turbulencia.", pt: "Esperamos um pouco de turbulência.", uso: "\"Algo de\" = um pouco de." },
      { en: "¿Dónde está el extintor más cercano?", pt: "Onde fica o extintor mais próximo?", uso: "Pergunta clássica de segurança." },
      { en: "¿Alguna pregunta?", pt: "Alguma pergunta?", uso: "Para encerrar o briefing." },
      { en: "¡Buen vuelo!", pt: "Bom voo!", uso: "Desejo comum entre a tripulação." },
    ],
    dica: "Números grandes aparecem muito no briefing: 160 = \"ciento sesenta\", 100 = \"cien\", 2h40 = \"dos horas y cuarenta minutos\". Atenção: em espanhol \"ciento\" vira \"cien\" quando está sozinho ou antes de substantivo: \"cien pasajeros\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuánto dura el vuelo?", opcoes: [{ texto: "Dos horas y cuarenta minutos", certa: true }, { texto: "Cuatro horas y veinte minutos" }, { texto: "Una hora y cuarenta minutos" }], explicacao: "O comandante diz: \"dos horas y cuarenta minutos\"." },
          { pergunta: "¿Cuántos pasajeros hay?", opcoes: [{ texto: "116" }, { texto: "160", certa: true }, { texto: "106" }], explicacao: "\"Ciento sesenta pasajeros.\"" },
          { pergunta: "¿Dónde está la pasajera en silla de ruedas?", opcoes: [{ texto: "En la fila trece" }, { texto: "En la puerta dos" }, { texto: "En la fila tres", certa: true }], explicacao: "\"En la fila tres.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Hoy operamos el vuelo a Buenos Aires.", "Tenemos un menor no acompañado.", "¿Alguna pregunta?"] },
      {
        tipo: "ordenar",
        instrucao: "Ponha o briefing na ordem.",
        falas: ["Buenos días a todos.", "Hoy operamos el vuelo a Santiago.", "El tiempo de vuelo es de cuatro horas.", "Tenemos un pasajero en silla de ruedas.", "¿Alguna pregunta? ¡Buen vuelo!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o espanhol ao português.",
        pares: [
          ["despegue", "decolagem"],
          ["aterrizaje", "pouso"],
          ["silla de ruedas", "cadeira de rodas"],
          ["fila", "fileira"],
          ["cinturón", "cinto"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Hoy ___ el vuelo 2045.", resposta: "operamos" },
          { frase: "Esperamos algo de ___ al despegar.", resposta: "turbulencia" },
          { frase: "Tenemos un menor no ___.", resposta: "acompañado", aceitas: ["acompanado"] },
          { frase: "¿Dónde está el extintor más ___?", resposta: "cercano", dica: "mais próximo" },
          { frase: "¿Alguna ___?", resposta: "pregunta" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Tenemos ciento sesenta pasajeros.", pt: "Temos cento e sessenta passageiros." },
          { en: "El extintor está detrás del último asiento.", pt: "O extintor fica atrás do último assento." },
          { en: "¡Suelten los cinturones! ¡Vengan por aquí!", pt: "Soltem os cintos! Venham por aqui!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "No briefing, a chefe de cabine faz perguntas de segurança para você.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "¿Cuál es tu posición hoy?", modelo: "Estoy en la puerta uno izquierda." },
          { outro: "¿Dónde está el extintor más cercano?", modelo: "Está en el armario, al lado del galley delantero." },
          { outro: "¿Cuál es la orden para una evacuación?", modelo: "¡Suelten los cinturones! ¡Vengan por aquí!" },
          { outro: "Muy bien. ¿Alguna pregunta?", modelo: "No, todo claro. ¡Buen vuelo!" },
        ],
      },
    ],
    quiz: [
      { pergunta: "Como se diz \"decolagem\" em espanhol?", opcoes: [{ texto: "despegue", certa: true }, { texto: "decolaje" }, { texto: "salida" }], explicacao: "Despegar = decolar; despegue = decolagem." },
      { pergunta: "Como se lê 160?", opcoes: [{ texto: "cien sesenta" }, { texto: "ciento sesenta", certa: true }, { texto: "cientos sesenta" }], explicacao: "\"Ciento sesenta\". \"Cien\" só para 100 sozinho." },
      { pergunta: "\"Menor no acompañado\" é:", opcoes: [{ texto: "Criança de colo" }, { texto: "Menor desacompanhado", certa: true }, { texto: "Menor com os pais" }], explicacao: "Criança que viaja sem os responsáveis, sob cuidado da tripulação." },
      { pergunta: "Qual é o comando de evacuação usado no diálogo?", opcoes: [{ texto: "¡Abrochen los cinturones!" }, { texto: "¡Suelten los cinturones!", certa: true }, { texto: "¡Siéntense!" }], explicacao: "Na evacuação, a primeira ordem é soltar os cintos." },
      { pergunta: "\"Fila tres\" significa:", opcoes: [{ texto: "Fila de três pessoas" }, { texto: "Fileira três", certa: true }, { texto: "Porta três" }], explicacao: "\"Fila\" no avião é a fileira de assentos." },
    ],
  },
];
