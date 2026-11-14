import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 6 · Salud y emergencias. Conteúdo original Cabin Crew. */
export const MODULO_ES_6: AulaIngles[] = [
  /* ------------------------------------------------------------------ 6.1 */
  {
    modulo: 6,
    numero: 1,
    titulo: "Passageiro passando mal",
    tituloEn: "No me siento bien",
    objetivo: "Perguntar sintomas, entender as respostas e oferecer ajuda inicial.",
    foto: "/img/ingles/cena-29.jpg",
    fotoAlt: "Comissária conversa com um passageiro preocupado durante o voo",
    minutos: 18,
    intro:
      "Quando alguém passa mal, as primeiras perguntas são sempre as mesmas: o que sente, desde quando, se toma algum remédio e se tem alguma doença. Fale devagar, com frases curtas, e chame a chefe de cabine.",
    dialogo: {
      titulo: "Me duele la cabeza",
      contexto: "No meio do voo, o senhor Ortega chama a tripulação. Ana atende.",
      personagens: ["Ana", "Ortega", "Lucía"],
      falas: [
        { quem: "Ana", en: "Señor Ortega, ¿se encuentra bien?", pt: "Senhor Ortega, o senhor está bem?" },
        { quem: "Ortega", en: "No me siento bien. Estoy mareado y me duele la cabeza.", pt: "Não me sinto bem. Estou tonto e com dor de cabeça." },
        { quem: "Ana", en: "¿Desde cuándo se siente así?", pt: "Desde quando se sente assim?" },
        { quem: "Ortega", en: "Desde hace media hora, más o menos.", pt: "Há mais ou menos meia hora." },
        { quem: "Ana", en: "¿Toma algún medicamento? ¿Tiene alguna enfermedad, como diabetes o presión alta?", pt: "Toma algum remédio? Tem alguma doença, como diabetes ou pressão alta?" },
        { quem: "Ortega", en: "Tomo una pastilla para la presión, pero hoy se me olvidó.", pt: "Tomo um comprimido para a pressão, mas hoje esqueci." },
        { quem: "Ana", en: "Entiendo. Voy a traerle agua y avisar a la jefa de cabina. Afloje la corbata y respire despacio.", pt: "Entendo. Vou trazer água e avisar a chefe de cabine. Afrouxe a gravata e respire devagar." },
        { quem: "Lucía", en: "Señor, soy Lucía, la jefa de cabina. Vamos a darle oxígeno, ¿de acuerdo?", pt: "Senhor, sou a Lucía, a chefe de cabine. Vamos dar oxigênio ao senhor, tudo bem?" },
        { quem: "Ortega", en: "Sí, gracias. Ya me siento un poco mejor.", pt: "Sim, obrigado. Já me sinto um pouco melhor." },
      ],
    },
    vocabulario: [
      { en: "mareado / mareada", pt: "tonto(a), enjoado(a)" },
      { en: "dolor de cabeza", pt: "dor de cabeça" },
      { en: "náuseas", pt: "náusea, enjoo" },
      { en: "pastilla", pt: "comprimido" },
      { en: "medicamento", pt: "remédio" },
      { en: "presión alta", pt: "pressão alta" },
      { en: "enfermedad", pt: "doença" },
      { en: "oxígeno", pt: "oxigênio" },
    ],
    expressoes: [
      { en: "¿Se encuentra bien?", pt: "O(a) senhor(a) está bem?", uso: "Primeira pergunta." },
      { en: "No me siento bien.", pt: "Não me sinto bem.", uso: "Frase típica do passageiro." },
      { en: "Me duele la cabeza.", pt: "Estou com dor de cabeça.", uso: "\"Me duele\" + parte do corpo." },
      { en: "¿Desde cuándo se siente así?", pt: "Desde quando se sente assim?", uso: "Para saber há quanto tempo." },
      { en: "¿Toma algún medicamento?", pt: "Toma algum remédio?", uso: "Pergunta essencial." },
    ],
    dica: "\"Me duele\" funciona como \"me dói\": \"me duele el estómago\", \"me duele el pecho\" (peito). Dor no peito é sinal de alerta: avise a chefe de cabine na hora. Falso amigo: \"constipado\" na Espanha é resfriado, não com prisão de ventre!",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué siente el señor Ortega?", opcoes: [{ texto: "Dolor de estómago" }, { texto: "Mareo y dolor de cabeza", certa: true }, { texto: "Frío" }], explicacao: "\"Estoy mareado y me duele la cabeza.\"" },
          { pergunta: "¿Desde cuándo se siente mal?", opcoes: [{ texto: "Desde hace media hora", certa: true }, { texto: "Desde el despegue" }, { texto: "Desde ayer" }], explicacao: "\"Desde hace media hora, más o menos.\"" },
          { pergunta: "¿Qué se le olvidó?", opcoes: [{ texto: "Su pasaporte" }, { texto: "Su pastilla para la presión", certa: true }, { texto: "Su almohada" }], explicacao: "\"Tomo una pastilla para la presión, pero hoy se me olvidó.\"" },
        ],
      },
      { tipo: "ditado", frases: ["No me siento bien.", "Me duele la cabeza.", "¿Toma algún medicamento?"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque as perguntas na ordem do atendimento.",
        falas: ["¿Se encuentra bien?", "¿Qué siente?", "¿Desde cuándo se siente así?", "¿Toma algún medicamento?", "Voy a avisar a la jefa de cabina."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["mareado", "tonto, enjoado"],
          ["pastilla", "comprimido"],
          ["enfermedad", "doença"],
          ["pecho", "peito"],
          ["constipado", "resfriado"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "No me ___ bien.", resposta: "siento" },
          { frase: "Me ___ la cabeza.", resposta: "duele" },
          { frase: "¿Desde ___ se siente así?", resposta: "cuándo", aceitas: ["cuando"] },
          { frase: "¿Toma algún ___?", resposta: "medicamento" },
          { frase: "Tomo una ___ para la presión.", resposta: "pastilla" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "¿Se encuentra bien? ¿Qué siente?", pt: "O senhor está bem? O que está sentindo?" },
          { en: "¿Desde cuándo se siente así?", pt: "Desde quando se sente assim?" },
          { en: "Voy a avisar a la jefa de cabina.", pt: "Vou avisar a chefe de cabine." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Uma passageira está pálida e chama você.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Disculpe… no me siento bien.", modelo: "¿Qué siente, señora?" },
          { outro: "Tengo náuseas.", modelo: "¿Desde cuándo se siente así?" },
          { outro: "Desde que comí.", modelo: "¿Toma algún medicamento o tiene alguna enfermedad?" },
          { outro: "No, nada.", modelo: "Voy a traerle agua y una bolsa. Y aviso a la jefa de cabina." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Estoy mareado\" significa:", opcoes: [{ texto: "Estou tonto/enjoado.", certa: true }, { texto: "Estou cansado." }, { texto: "Estou com frio." }], explicacao: "\"Mareo\" = tontura, enjoo." },
      { pergunta: "Como dizer \"estou com dor de cabeça\"?", opcoes: [{ texto: "Tengo duele la cabeza." }, { texto: "Me duele la cabeza.", certa: true }, { texto: "Me dolor cabeza." }], explicacao: "\"Me duele\" + parte do corpo." },
      { pergunta: "\"Pastilla\" é:", opcoes: [{ texto: "Bala" }, { texto: "Comprimido", certa: true }, { texto: "Pastel" }], explicacao: "No contexto médico, comprimido." },
      { pergunta: "Na Espanha, \"estoy constipado\" significa:", opcoes: [{ texto: "Estou com prisão de ventre." }, { texto: "Estou resfriado.", certa: true }, { texto: "Estou com fome." }], explicacao: "Falso amigo: constipado = resfriado." },
      { pergunta: "Qual sintoma exige avisar a chefe de cabine imediatamente?", opcoes: [{ texto: "Dolor en el pecho", certa: true }, { texto: "Un poco de frío" }, { texto: "Sed" }], explicacao: "Dor no peito pode ser grave." },
    ],
  },

  /* ------------------------------------------------------------------ 6.2 */
  {
    modulo: 6,
    numero: 2,
    titulo: "Há um médico a bordo?",
    tituloEn: "¿Hay un médico a bordo?",
    objetivo: "Fazer o anúncio pedindo um médico e conversar com o profissional que se apresenta.",
    foto: "/img/ingles/cena-15.jpg",
    fotoAlt: "Comissária conversa com um passageiro sentado",
    minutos: 15,
    intro:
      "Em uma situação médica séria, a chefe de cabine pede ajuda pelo sistema de som. Quando um médico se apresenta, você confirma quem é, explica o que aconteceu e mostra o equipamento disponível.",
    dialogo: {
      titulo: "La doctora Herrera",
      contexto: "O senhor Ortega piorou. Lucía faz o anúncio e a doutora Herrera se apresenta.",
      personagens: ["Lucía", "Herrera", "Ana"],
      falas: [
        { quem: "Lucía", en: "Señoras y señores, si hay un médico o profesional de la salud a bordo, por favor identifíquese con la tripulación.", pt: "Senhoras e senhores, se houver um médico ou profissional de saúde a bordo, por favor identifique-se com a tripulação." },
        { quem: "Herrera", en: "Disculpe, soy médica. Me llamo Paula Herrera. ¿En qué puedo ayudar?", pt: "Com licença, sou médica. Meu nome é Paula Herrera. Em que posso ajudar?" },
        { quem: "Ana", en: "Muchas gracias, doctora. ¿Me puede mostrar algún documento profesional?", pt: "Muito obrigada, doutora. Pode me mostrar algum documento profissional?" },
        { quem: "Herrera", en: "Claro, aquí tiene mi credencial.", pt: "Claro, aqui está minha carteira profissional." },
        { quem: "Ana", en: "Es un pasajero de cincuenta años. Está mareado, tiene dolor de cabeza y olvidó su pastilla para la presión.", pt: "É um passageiro de cinquenta anos. Está tonto, com dor de cabeça e esqueceu o comprimido de pressão." },
        { quem: "Herrera", en: "¿Tienen un tensiómetro a bordo?", pt: "Vocês têm um aparelho de pressão a bordo?" },
        { quem: "Ana", en: "Sí, en el botiquín médico. También tenemos oxígeno y un desfibrilador.", pt: "Sim, no kit médico. Também temos oxigênio e um desfibrilador." },
        { quem: "Herrera", en: "Perfecto. Tráiganme el tensiómetro, por favor. Voy a examinarlo.", pt: "Perfeito. Tragam o aparelho de pressão, por favor. Vou examiná-lo." },
        { quem: "Lucía", en: "Voy a informar al comandante. Doctora, gracias por su ayuda.", pt: "Vou informar o comandante. Doutora, obrigada pela ajuda." },
      ],
    },
    vocabulario: [
      { en: "médico / médica", pt: "médico / médica" },
      { en: "profesional de la salud", pt: "profissional de saúde" },
      { en: "enfermero / enfermera", pt: "enfermeiro / enfermeira" },
      { en: "credencial", pt: "carteira profissional, crachá" },
      { en: "tensiómetro", pt: "aparelho de pressão" },
      { en: "botiquín médico", pt: "kit médico" },
      { en: "desfibrilador", pt: "desfibrilador" },
      { en: "examinar", pt: "examinar" },
    ],
    expressoes: [
      { en: "¿Hay un médico a bordo?", pt: "Há um médico a bordo?", uso: "Pergunta-chave em emergências médicas." },
      { en: "Por favor, identifíquese con la tripulación.", pt: "Por favor, identifique-se com a tripulação.", uso: "Parte do anúncio." },
      { en: "¿En qué puedo ayudar?", pt: "Em que posso ajudar?", uso: "O médico se oferece." },
      { en: "¿Me puede mostrar algún documento?", pt: "Pode me mostrar algum documento?", uso: "Procedimento de muitas companhias." },
      { en: "Gracias por su ayuda.", pt: "Obrigado(a) pela ajuda.", uso: "Sempre agradeça ao voluntário." },
    ],
    dica: "\"Doctor\" e \"doctora\" são usados para chamar médicos. Mantenha o comandante informado: ele decide se o avião precisa desviar (\"desviar el vuelo\") para outro aeroporto.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué profesión tiene Paula Herrera?", opcoes: [{ texto: "Enfermera" }, { texto: "Médica", certa: true }, { texto: "Piloto" }], explicacao: "\"Soy médica.\"" },
          { pergunta: "¿Qué pide la doctora?", opcoes: [{ texto: "Un tensiómetro", certa: true }, { texto: "Un desfibrilador" }, { texto: "Agua" }], explicacao: "\"¿Tienen un tensiómetro a bordo?\" e depois pede que tragam." },
          { pergunta: "¿A quién va a informar Lucía?", opcoes: [{ texto: "A la familia" }, { texto: "Al comandante", certa: true }, { texto: "Al aeropuerto" }], explicacao: "\"Voy a informar al comandante.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Hay un médico a bordo?", "Soy médica.", "Gracias por su ayuda."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o atendimento ao médico na ordem.",
        falas: ["Disculpe, soy médico. ¿En qué puedo ayudar?", "Gracias, doctor. ¿Me puede mostrar algún documento?", "Claro, aquí tiene.", "Es una pasajera con dolor en el pecho.", "Tráiganme el botiquín, por favor."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["tensiómetro", "aparelho de pressão"],
          ["enfermera", "enfermeira"],
          ["credencial", "carteira profissional"],
          ["desviar el vuelo", "desviar o voo"],
          ["botiquín", "kit médico"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿___ un médico a bordo?", resposta: "Hay" },
          { frase: "Por favor, ___ con la tripulación.", resposta: "identifíquese", aceitas: ["identifiquese"] },
          { frase: "¿En qué puedo ___?", resposta: "ayudar" },
          { frase: "Tenemos oxígeno y un ___.", resposta: "desfibrilador" },
          { frase: "Gracias por su ___.", resposta: "ayuda" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Si hay un médico a bordo, por favor identifíquese con la tripulación.", pt: "Se houver um médico a bordo, por favor identifique-se com a tripulação." },
          { en: "Muchas gracias, doctora. ¿Me puede mostrar algún documento?", pt: "Muito obrigado(a), doutora. Pode me mostrar algum documento?" },
          { en: "Tenemos oxígeno y un desfibrilador.", pt: "Temos oxigênio e um desfibrilador." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um enfermeiro se apresenta para ajudar.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Hola, soy enfermero. ¿Puedo ayudar?", modelo: "Muchas gracias. ¿Me puede mostrar algún documento?" },
          { outro: "Sí, aquí tiene.", modelo: "Es una pasajera con mucho dolor de estómago." },
          { outro: "¿Qué tienen en el botiquín?", modelo: "Tenemos un tensiómetro, oxígeno y algunos medicamentos." },
          { outro: "Bien, vamos a verla.", modelo: "Por aquí, por favor. Gracias por su ayuda." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Qual é a frase do anúncio?", opcoes: [{ texto: "¿Hay un médico a bordo?", certa: true }, { texto: "¿Está un médico a bordo?" }, { texto: "¿Tiene un médico a bordo?" }], explicacao: "\"Hay\" = há, existe." },
      { pergunta: "\"Tensiómetro\" serve para:", opcoes: [{ texto: "Medir a pressão", certa: true }, { texto: "Medir a febre" }, { texto: "Dar oxigênio" }], explicacao: "É o aparelho de pressão." },
      { pergunta: "Quem decide desviar o voo?", opcoes: [{ texto: "O médico" }, { texto: "O comandante", certa: true }, { texto: "O passageiro" }], explicacao: "O médico recomenda; o comandante decide." },
      { pergunta: "\"¿En qué puedo ayudar?\":", opcoes: [{ texto: "Em que posso ajudar?", certa: true }, { texto: "Quem pode ajudar?" }, { texto: "Quando posso ajudar?" }], explicacao: "O voluntário se oferece." },
      { pergunta: "\"Enfermera\" é:", opcoes: [{ texto: "Doente" }, { texto: "Enfermeira", certa: true }, { texto: "Enfermaria" }], explicacao: "Doente = \"enfermo\"." },
    ],
  },

  /* ------------------------------------------------------------------ 6.3 */
  {
    modulo: 6,
    numero: 3,
    titulo: "Comandos de emergência e evacuação",
    tituloEn: "¡Evacuación!",
    objetivo: "Dar e entender os comandos de posição de impacto e de evacuação em espanhol.",
    foto: "/img/ingles/cena-13.jpg",
    fotoAlt: "Comissária aponta para a saída de emergência sobre a asa enquanto fala com passageiros",
    minutos: 18,
    intro:
      "Em uma emergência os comandos são curtos, fortes e repetidos. Não há tempo para \"por favor\". Nesta aula você ouve a preparação para um pouso de emergência e a evacuação.",
    dialogo: {
      titulo: "Aterrizaje de emergencia",
      contexto: "Treinamento: o comandante anuncia um pouso de emergência. Lucía e Diego dão os comandos.",
      personagens: ["Comandante", "Lucía", "Diego"],
      falas: [
        { quem: "Comandante", en: "Tripulación, prepárense para un aterrizaje de emergencia. Dos minutos.", pt: "Tripulação, preparem-se para um pouso de emergência. Dois minutos." },
        { quem: "Lucía", en: "¡Abróchense los cinturones! ¡Quítense los zapatos de tacón!", pt: "Afivelem os cintos! Tirem os sapatos de salto!" },
        { quem: "Diego", en: "¡Agáchense! ¡Cabeza abajo! ¡Posición de impacto!", pt: "Abaixem-se! Cabeça para baixo! Posição de impacto!" },
        { quem: "Lucía", en: "¡Agáchense! ¡Cabeza abajo! ¡No se muevan!", pt: "Abaixem-se! Cabeça para baixo! Não se mexam!" },
        { quem: "Comandante", en: "¡Evacuar, evacuar, evacuar!", pt: "Evacuar, evacuar, evacuar!" },
        { quem: "Diego", en: "¡Suelten los cinturones! ¡Vengan por aquí! ¡Dejen todo!", pt: "Soltem os cintos! Venham por aqui! Deixem tudo!" },
        { quem: "Lucía", en: "¡Salten y deslícense! ¡Aléjense del avión!", pt: "Pulem e deslizem! Afastem-se do avião!" },
        { quem: "Diego", en: "¡Esta salida está bloqueada! ¡Vayan hacia adelante!", pt: "Esta saída está bloqueada! Vão para a frente!" },
      ],
    },
    vocabulario: [
      { en: "aterrizaje de emergencia", pt: "pouso de emergência" },
      { en: "amerizaje", pt: "pouso na água" },
      { en: "posición de impacto", pt: "posição de impacto (brace)" },
      { en: "agacharse", pt: "abaixar-se" },
      { en: "tobogán", pt: "escorregador (de evacuação)" },
      { en: "deslizarse", pt: "deslizar, escorregar" },
      { en: "bloqueado", pt: "bloqueado" },
      { en: "alejarse", pt: "afastar-se" },
    ],
    expressoes: [
      { en: "¡Agáchense! ¡Cabeza abajo!", pt: "Abaixem-se! Cabeça para baixo!", uso: "Comando de posição de impacto." },
      { en: "¡Suelten los cinturones!", pt: "Soltem os cintos!", uso: "Primeiro comando da evacuação." },
      { en: "¡Vengan por aquí!", pt: "Venham por aqui!", uso: "Para chamar os passageiros à saída." },
      { en: "¡Dejen todo!", pt: "Deixem tudo!", uso: "Nada de bagagem na evacuação." },
      { en: "¡Salten y deslícense!", pt: "Pulem e deslizem!", uso: "Na porta, para usar o escorregador." },
    ],
    dica: "Nos comandos se usa o imperativo de \"ustedes\": agáchense, suelten, vengan, salten. Grite com voz firme e repita. Cada companhia tem seus comandos padrão; use sempre os do manual da sua empresa.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuánto tiempo hay hasta el aterrizaje?", opcoes: [{ texto: "Dos minutos", certa: true }, { texto: "Diez minutos" }, { texto: "Media hora" }], explicacao: "\"Dos minutos.\"" },
          { pergunta: "¿Qué tienen que quitarse los pasajeros?", opcoes: [{ texto: "Los zapatos de tacón", certa: true }, { texto: "Los chalecos" }, { texto: "Las gafas" }], explicacao: "\"¡Quítense los zapatos de tacón!\"" },
          { pergunta: "¿Qué hace Diego si la salida está bloqueada?", opcoes: [{ texto: "Abre otra vez" }, { texto: "Manda a los pasajeros hacia adelante", certa: true }, { texto: "Espera al comandante" }], explicacao: "\"¡Vayan hacia adelante!\"" },
        ],
      },
      { tipo: "ditado", frases: ["¡Agáchense! ¡Cabeza abajo!", "¡Suelten los cinturones!", "¡Dejen todo!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque os comandos da evacuação na ordem.",
        falas: ["¡Suelten los cinturones!", "¡Vengan por aquí!", "¡Dejen todo!", "¡Salten y deslícense!", "¡Aléjense del avión!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue os comandos.",
        pares: [
          ["¡Agáchense!", "Abaixem-se!"],
          ["¡Dejen todo!", "Deixem tudo!"],
          ["¡Aléjense!", "Afastem-se!"],
          ["tobogán", "escorregador"],
          ["amerizaje", "pouso na água"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¡Agáchense! ¡Cabeza ___!", resposta: "abajo" },
          { frase: "¡___ los cinturones!", resposta: "Suelten" },
          { frase: "¡Vengan por ___!", resposta: "aquí", aceitas: ["aqui"] },
          { frase: "¡Salten y ___!", resposta: "deslícense", aceitas: ["deslicense"] },
          { frase: "¡Esta salida está ___!", resposta: "bloqueada" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "¡Agáchense! ¡Cabeza abajo! ¡Posición de impacto!", pt: "Abaixem-se! Cabeça para baixo! Posição de impacto!" },
          { en: "¡Suelten los cinturones! ¡Vengan por aquí!", pt: "Soltem os cintos! Venham por aqui!" },
          { en: "¡Salten y deslícense! ¡Aléjense del avión!", pt: "Pulem e deslizem! Afastem-se do avião!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Treinamento de evacuação: você está na sua porta.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(Comandante) ¡Evacuar, evacuar, evacuar!", modelo: "¡Suelten los cinturones! ¡Vengan por aquí!" },
          { outro: "(Passageiro) ¡Mi maleta!", modelo: "¡Dejen todo! ¡Vengan por aquí!" },
          { outro: "(Na porta, o passageiro hesita.)", modelo: "¡Salten y deslícense! ¡Aléjense del avión!" },
        ],
      },
    ],
    quiz: [
      { pergunta: "Qual é o comando da posição de impacto?", opcoes: [{ texto: "¡Agáchense! ¡Cabeza abajo!", certa: true }, { texto: "¡Levántense!" }, { texto: "¡Corran!" }], explicacao: "Abaixar e cabeça para baixo." },
      { pergunta: "\"¡Dejen todo!\" significa:", opcoes: [{ texto: "Peguem tudo!" }, { texto: "Deixem tudo!", certa: true }, { texto: "Esperem todos!" }], explicacao: "Sem bagagem na evacuação." },
      { pergunta: "\"Tobogán\" é:", opcoes: [{ texto: "O escorregador de evacuação", certa: true }, { texto: "O colete" }, { texto: "A porta" }], explicacao: "O escorregador inflável das portas." },
      { pergunta: "\"Amerizaje\" é:", opcoes: [{ texto: "Pouso na água", certa: true }, { texto: "Pouso na América" }, { texto: "Decolagem" }], explicacao: "Pouso de emergência no mar ou em rio." },
      { pergunta: "Por que os comandos não usam \"por favor\"?", opcoes: [{ texto: "Porque é falta de educação" }, { texto: "Porque precisam ser curtos e firmes", certa: true }, { texto: "Porque é proibido" }], explicacao: "Em emergência, comandos curtos salvam tempo." },
    ],
  },
];
