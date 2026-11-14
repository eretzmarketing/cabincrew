import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 3 · Seguridad y despegue. Conteúdo original Cabin Crew. */
export const MODULO_ES_3: AulaIngles[] = [
  /* ------------------------------------------------------------------ 3.1 */
  {
    modulo: 3,
    numero: 1,
    titulo: "A demonstração de segurança",
    tituloEn: "La demostración de seguridad",
    objetivo: "Entender e falar o anúncio de segurança: cinto, máscaras de oxigênio, colete e saídas.",
    foto: "/img/ingles/cena-11.jpg",
    fotoAlt: "Comissária demonstra o colete salva-vidas no corredor do avião",
    minutos: 18,
    intro:
      "O anúncio de segurança (\"anuncio de seguridad\") tem frases fixas que todo comissário precisa dominar. Nesta aula, Lucía faz o anúncio enquanto Ana e Diego demonstram no corredor. Repare no uso do imperativo com \"ustedes\": abrochen, coloquen, tiren.",
    dialogo: {
      titulo: "Anuncio de seguridad",
      contexto: "Antes da decolagem, Lucía lê o anúncio de segurança no sistema de som da cabine.",
      personagens: ["Lucía"],
      falas: [
        { quem: "Lucía", en: "Señoras y señores, les pedimos su atención para la demostración de seguridad.", pt: "Senhoras e senhores, pedimos a sua atenção para a demonstração de segurança." },
        { quem: "Lucía", en: "Para abrochar el cinturón, introduzcan la parte metálica en la hebilla y ajústenlo. Para soltarlo, levanten la hebilla.", pt: "Para afivelar o cinto, encaixem a parte metálica na fivela e ajustem. Para soltar, levantem a fivela." },
        { quem: "Lucía", en: "Si la cabina pierde presión, caerán máscaras de oxígeno. Tiren de la máscara, colóquenla sobre la nariz y la boca y respiren normalmente.", pt: "Se a cabine perder pressão, cairão máscaras de oxigênio. Puxem a máscara, coloquem sobre o nariz e a boca e respirem normalmente." },
        { quem: "Lucía", en: "Colóquense su máscara antes de ayudar a otras personas.", pt: "Coloquem a sua máscara antes de ajudar outras pessoas." },
        { quem: "Lucía", en: "El chaleco salvavidas está debajo de su asiento. Inflen el chaleco solo al salir del avión.", pt: "O colete salva-vidas está embaixo do seu assento. Inflem o colete só ao sair do avião." },
        { quem: "Lucía", en: "Este avión tiene ocho salidas de emergencia. Localicen la salida más cercana; puede estar detrás de ustedes.", pt: "Este avião tem oito saídas de emergência. Localizem a saída mais próxima; ela pode estar atrás de vocês." },
        { quem: "Lucía", en: "Las luces en el piso los guiarán hasta las salidas.", pt: "As luzes no piso vão guiá-los até as saídas." },
        { quem: "Lucía", en: "Les recordamos que está prohibido fumar a bordo, también en los baños. Gracias por su atención.", pt: "Lembramos que é proibido fumar a bordo, inclusive nos banheiros. Obrigada pela atenção." },
      ],
    },
    vocabulario: [
      { en: "abrochar el cinturón", pt: "afivelar o cinto" },
      { en: "hebilla", pt: "fivela" },
      { en: "máscara de oxígeno", pt: "máscara de oxigênio" },
      { en: "chaleco salvavidas", pt: "colete salva-vidas" },
      { en: "inflar", pt: "inflar" },
      { en: "salida de emergencia", pt: "saída de emergência" },
      { en: "luces en el piso", pt: "luzes no piso" },
      { en: "baño", pt: "banheiro (lavatório)" },
    ],
    expressoes: [
      { en: "Les pedimos su atención.", pt: "Pedimos a sua atenção.", uso: "Abertura de qualquer anúncio importante." },
      { en: "Abrochen su cinturón.", pt: "Afivelem o cinto.", uso: "Imperativo com \"ustedes\"." },
      { en: "Respiren normalmente.", pt: "Respirem normalmente.", uso: "Parte do anúncio das máscaras." },
      { en: "Localicen la salida más cercana.", pt: "Localizem a saída mais próxima.", uso: "Lembre que pode estar atrás." },
      { en: "Está prohibido fumar a bordo.", pt: "É proibido fumar a bordo.", uso: "Inclui cigarro eletrônico (\"cigarrillo electrónico\")." },
    ],
    dica: "\"Baño\" no avião é o banheiro (também \"lavabo\" ou \"aseo\" na Espanha). Em espanhol, \"banho\" de tomar é \"ducha\" ou \"baño\". E atenção: \"abrochar\" é afivelar; \"broche\" é a fivela de bijuteria.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Dónde está el chaleco salvavidas?", opcoes: [{ texto: "En el compartimento superior" }, { texto: "Debajo del asiento", certa: true }, { texto: "En el baño" }], explicacao: "\"El chaleco salvavidas está debajo de su asiento.\"" },
          { pergunta: "¿Cuándo se infla el chaleco?", opcoes: [{ texto: "Al salir del avión", certa: true }, { texto: "Al ponérselo" }, { texto: "Antes del aterrizaje" }], explicacao: "\"Inflen el chaleco solo al salir del avión.\"" },
          { pergunta: "¿Cuántas salidas tiene el avión?", opcoes: [{ texto: "Seis" }, { texto: "Cuatro" }, { texto: "Ocho", certa: true }], explicacao: "\"Este avión tiene ocho salidas de emergencia.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Abrochen su cinturón.", "Respiren normalmente.", "Está prohibido fumar a bordo."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o anúncio das máscaras na ordem.",
        falas: ["Si la cabina pierde presión, caerán máscaras.", "Tiren de la máscara hacia ustedes.", "Colóquenla sobre la nariz y la boca.", "Respiren normalmente.", "Colóquense su máscara antes de ayudar a otros."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o espanhol ao português.",
        pares: [
          ["hebilla", "fivela"],
          ["chaleco salvavidas", "colete salva-vidas"],
          ["salida", "saída"],
          ["piso", "chão, piso"],
          ["baño", "banheiro"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Les ___ su atención para la demostración.", resposta: "pedimos" },
          { frase: "Para soltar el cinturón, levanten la ___.", resposta: "hebilla" },
          { frase: "Si la cabina pierde ___, caerán máscaras.", resposta: "presión", aceitas: ["presion"] },
          { frase: "El chaleco está ___ de su asiento.", resposta: "debajo" },
          { frase: "Está ___ fumar a bordo.", resposta: "prohibido" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Señoras y señores, les pedimos su atención.", pt: "Senhoras e senhores, pedimos a sua atenção." },
          { en: "Colóquense su máscara antes de ayudar a otras personas.", pt: "Coloquem a sua máscara antes de ajudar outras pessoas." },
          { en: "Localicen la salida más cercana.", pt: "Localizem a saída mais próxima." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro curioso faz perguntas depois da demonstração.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Perdón, ¿dónde está mi chaleco?", modelo: "Está debajo de su asiento, señor." },
          { outro: "¿Lo inflo ahora?", modelo: "No, solo al salir del avión." },
          { outro: "¿Y cuál es la salida más cercana?", modelo: "Está dos filas detrás de usted, a la derecha." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Abrochen su cinturón\" quer dizer:", opcoes: [{ texto: "Soltem o cinto." }, { texto: "Afivelem o cinto.", certa: true }, { texto: "Ajustem o assento." }], explicacao: "\"Abrochar\" = afivelar; \"soltar\" ou \"desabrochar\" = soltar." },
      { pergunta: "Quando o passageiro deve colocar a máscara?", opcoes: [{ texto: "Depois de ajudar os outros" }, { texto: "Antes de ajudar os outros", certa: true }, { texto: "Só se o comissário mandar" }], explicacao: "\"Colóquense su máscara antes de ayudar a otras personas.\"" },
      { pergunta: "Como se diz \"colete salva-vidas\"?", opcoes: [{ texto: "chaleco salvavidas", certa: true }, { texto: "colete salvavida" }, { texto: "chaqueta de vida" }], explicacao: "\"Chaleco\" = colete." },
      { pergunta: "O que guia os passageiros até as saídas?", opcoes: [{ texto: "Las luces en el piso", certa: true }, { texto: "Las máscaras" }, { texto: "El cinturón" }], explicacao: "As luzes de emergência no piso." },
      { pergunta: "\"Hebilla\" é:", opcoes: [{ texto: "Fivela", certa: true }, { texto: "Agulha" }, { texto: "Botão" }], explicacao: "A parte do cinto que se levanta para soltar." },
    ],
  },

  /* ------------------------------------------------------------------ 3.2 */
  {
    modulo: 3,
    numero: 2,
    titulo: "Checagens antes da decolagem",
    tituloEn: "Verificaciones antes del despegue",
    objetivo: "Pedir com educação: cinto afivelado, encosto na vertical, mesinha fechada e janela aberta.",
    foto: "/img/ingles/cena-17.jpg",
    fotoAlt: "Comissária confere o cinto e a mesinha de um passageiro",
    minutos: 15,
    intro:
      "Antes da decolagem você passa pelo corredor conferindo cada fileira. As frases são curtas e educadas: \"¿Podría…, por favor?\". Inclui também a conversa com o passageiro da saída de emergência, que precisa aceitar ajudar.",
    dialogo: {
      titulo: "Cabina lista",
      contexto: "Diego confere a cabine antes da decolagem e conversa com o senhor Ramírez, sentado na saída de emergência.",
      personagens: ["Diego", "Ramírez", "Valeria"],
      falas: [
        { quem: "Diego", en: "Disculpe, señorita. ¿Podría poner el respaldo en posición vertical, por favor?", pt: "Com licença, senhorita. Poderia colocar o encosto na posição vertical, por favor?" },
        { quem: "Valeria", en: "Ah, sí, claro.", pt: "Ah, sim, claro." },
        { quem: "Diego", en: "Y cierre la mesita, por favor. También necesito la cortina de la ventanilla abierta.", pt: "E feche a mesinha, por favor. Também preciso da persiana da janela aberta." },
        { quem: "Diego", en: "Señor Ramírez, usted está sentado en una salida de emergencia.", pt: "Senhor Ramírez, o senhor está sentado em uma saída de emergência." },
        { quem: "Diego", en: "En caso de emergencia, ¿estaría dispuesto a ayudarnos a abrir esta puerta?", pt: "Em caso de emergência, o senhor estaria disposto a nos ajudar a abrir esta porta?" },
        { quem: "Ramírez", en: "Sí, sin problema.", pt: "Sim, sem problema." },
        { quem: "Diego", en: "Muchas gracias. Por favor, lea la tarjeta de seguridad. Su mochila tiene que ir en el compartimento superior.", pt: "Muito obrigado. Por favor, leia o cartão de segurança. Sua mochila tem que ir no compartimento superior." },
        { quem: "Ramírez", en: "Entendido. ¿Puedo usar el teléfono?", pt: "Entendido. Posso usar o telefone?" },
        { quem: "Diego", en: "Sí, en modo avión. Gracias.", pt: "Sim, no modo avião. Obrigado." },
      ],
    },
    vocabulario: [
      { en: "respaldo", pt: "encosto do assento" },
      { en: "posición vertical", pt: "posição vertical" },
      { en: "mesita", pt: "mesinha" },
      { en: "cortina de la ventanilla", pt: "persiana da janela" },
      { en: "reposabrazos", pt: "apoio de braço" },
      { en: "tarjeta de seguridad", pt: "cartão de segurança" },
      { en: "modo avión", pt: "modo avião" },
      { en: "dispuesto", pt: "disposto" },
    ],
    expressoes: [
      { en: "¿Podría poner el respaldo en posición vertical?", pt: "Poderia colocar o encosto na vertical?", uso: "Pedido padrão antes de decolar e pousar." },
      { en: "Cierre la mesita, por favor.", pt: "Feche a mesinha, por favor.", uso: "Imperativo com \"usted\"." },
      { en: "¿Estaría dispuesto a ayudarnos?", pt: "Estaria disposto a nos ajudar?", uso: "Pergunta obrigatória na saída de emergência." },
      { en: "Su mochila tiene que ir arriba.", pt: "Sua mochila tem que ir em cima.", uso: "Na saída de emergência, nada no chão." },
      { en: "En modo avión.", pt: "No modo avião.", uso: "Para celulares e tablets." },
    ],
    dica: "Na Espanha o celular é \"el móvil\"; na América Latina, \"el celular\". \"El teléfono\" serve em todo lugar. E \"cortina\" da janela também é chamada de \"persiana\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué tiene que hacer Valeria?", opcoes: [{ texto: "Cambiar de asiento" }, { texto: "Poner el respaldo vertical y cerrar la mesita", certa: true }, { texto: "Apagar el teléfono" }], explicacao: "Diego pede o encosto na vertical, a mesinha fechada e a persiana aberta." },
          { pergunta: "¿Dónde está sentado el señor Ramírez?", opcoes: [{ texto: "En una salida de emergencia", certa: true }, { texto: "En la primera fila" }, { texto: "Junto al baño" }], explicacao: "\"Usted está sentado en una salida de emergencia.\"" },
          { pergunta: "¿Dónde tiene que ir su mochila?", opcoes: [{ texto: "Debajo del asiento" }, { texto: "En el piso" }, { texto: "En el compartimento superior", certa: true }], explicacao: "Na saída de emergência nada fica no chão." },
        ],
      },
      { tipo: "ditado", frases: ["Cierre la mesita, por favor.", "Usted está en una salida de emergencia.", "En modo avión, por favor."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa da saída de emergência na ordem.",
        falas: ["Señora, usted está en una salida de emergencia.", "¿Estaría dispuesta a ayudarnos a abrir la puerta?", "Sí, claro.", "Gracias. Por favor, lea la tarjeta de seguridad.", "De acuerdo."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["respaldo", "encosto"],
          ["mesita", "mesinha"],
          ["reposabrazos", "apoio de braço"],
          ["móvil / celular", "celular"],
          ["dispuesto", "disposto"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿Podría poner el ___ en posición vertical?", resposta: "respaldo" },
          { frase: "___ la mesita, por favor.", resposta: "Cierre" },
          { frase: "¿Estaría ___ a ayudarnos?", resposta: "dispuesto" },
          { frase: "Por favor, lea la ___ de seguridad.", resposta: "tarjeta" },
          { frase: "Puede usar el teléfono en modo ___.", resposta: "avión", aceitas: ["avion"] },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "¿Podría poner el respaldo en posición vertical, por favor?", pt: "Poderia colocar o encosto na vertical, por favor?" },
          { en: "¿Estaría dispuesto a ayudarnos en caso de emergencia?", pt: "Estaria disposto a nos ajudar em caso de emergência?" },
          { en: "Su mochila tiene que ir en el compartimento superior.", pt: "Sua mochila tem que ir no compartimento superior." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Você confere a cabine antes da decolagem.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A passageira está com a mesinha aberta e o encosto reclinado.)", modelo: "Disculpe, ¿podría cerrar la mesita y poner el respaldo vertical?" },
          { outro: "Sí, perdón.", modelo: "Gracias. Y abra la cortina de la ventanilla, por favor." },
          { outro: "¿Puedo seguir con el celular?", modelo: "Sí, en modo avión. Gracias." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Respaldo\" é:", opcoes: [{ texto: "Encosto", certa: true }, { texto: "Reserva" }, { texto: "Apoio de pé" }], explicacao: "O encosto do assento." },
      { pergunta: "O que perguntar ao passageiro da saída de emergência?", opcoes: [{ texto: "¿Le gusta este asiento?" }, { texto: "¿Estaría dispuesto a ayudarnos?", certa: true }, { texto: "¿Tiene hambre?" }], explicacao: "Ele precisa aceitar ajudar em uma emergência." },
      { pergunta: "\"Cierre la mesita\":", opcoes: [{ texto: "Abra a mesinha" }, { texto: "Feche a mesinha", certa: true }, { texto: "Limpe a mesinha" }], explicacao: "\"Cerrar\" = fechar." },
      { pergunta: "Como se diz celular na Espanha?", opcoes: [{ texto: "el móvil", certa: true }, { texto: "el portátil" }, { texto: "el celu" }], explicacao: "\"Móvil\" na Espanha, \"celular\" na América Latina." },
      { pergunta: "Na saída de emergência, a mochila vai:", opcoes: [{ texto: "No chão, à frente" }, { texto: "No compartimento superior", certa: true }, { texto: "No colo" }], explicacao: "A área da saída precisa ficar livre." },
    ],
  },

  /* ------------------------------------------------------------------ 3.3 */
  {
    modulo: 3,
    numero: 3,
    titulo: "Turbulência",
    tituloEn: "Turbulencia",
    objetivo: "Fazer o anúncio de turbulência e tranquilizar um passageiro com medo.",
    foto: "/img/ingles/cena-29.jpg",
    fotoAlt: "Comissária conversa com um passageiro preocupado durante o voo",
    minutos: 15,
    intro:
      "Quando o avião entra em turbulência, o comandante acende o aviso de cintos e a tripulação faz um anúncio curto. Depois, alguém com medo pode precisar de uma palavra calma. Tom de voz tranquilo e frases simples.",
    dialogo: {
      titulo: "Zona de turbulencia",
      contexto: "No meio do voo, o comandante avisa sobre turbulência. Depois Sofía conversa com Valeria, que está nervosa.",
      personagens: ["Comandante", "Sofía", "Valeria"],
      falas: [
        { quem: "Comandante", en: "Señoras y señores, les habla el comandante. Estamos entrando en una zona de turbulencia. Por favor, regresen a sus asientos y abróchense el cinturón.", pt: "Senhoras e senhores, quem fala é o comandante. Estamos entrando em uma área de turbulência. Por favor, voltem aos seus assentos e afivelem o cinto." },
        { quem: "Sofía", en: "Señorita, ¿se encuentra bien?", pt: "Senhorita, a senhora está bem?" },
        { quem: "Valeria", en: "No mucho. Me da miedo la turbulencia.", pt: "Não muito. Tenho medo de turbulência." },
        { quem: "Sofía", en: "Es normal sentir miedo. La turbulencia es muy común y el avión está preparado para esto.", pt: "É normal sentir medo. A turbulência é muito comum e o avião está preparado para isso." },
        { quem: "Valeria", en: "¿Va a durar mucho?", pt: "Vai durar muito?" },
        { quem: "Sofía", en: "El comandante dice que unos quince minutos. Mantenga el cinturón abrochado y respire despacio.", pt: "O comandante diz que uns quinze minutos. Mantenha o cinto afivelado e respire devagar." },
        { quem: "Valeria", en: "Gracias. ¿Me trae un vaso de agua?", pt: "Obrigada. Pode me trazer um copo de água?" },
        { quem: "Sofía", en: "Ahora no podemos servir, pero en cuanto se apague la señal de cinturones, se lo traigo.", pt: "Agora não podemos servir, mas assim que o aviso de cintos apagar, eu trago." },
      ],
    },
    vocabulario: [
      { en: "turbulencia", pt: "turbulência" },
      { en: "señal de cinturones", pt: "aviso de atar cintos" },
      { en: "miedo", pt: "medo" },
      { en: "regresar / volver", pt: "voltar" },
      { en: "despacio", pt: "devagar" },
      { en: "durar", pt: "durar" },
      { en: "vaso", pt: "copo" },
      { en: "en cuanto", pt: "assim que" },
    ],
    expressoes: [
      { en: "Les habla el comandante.", pt: "Quem fala é o comandante.", uso: "Abertura dos anúncios da cabine de comando." },
      { en: "Regresen a sus asientos.", pt: "Voltem aos seus assentos.", uso: "Na Espanha: \"Vuelvan a sus asientos\"." },
      { en: "¿Se encuentra bien?", pt: "O(a) senhor(a) está bem?", uso: "Forma educada de \"¿Está bien?\"." },
      { en: "Me da miedo…", pt: "Tenho medo de…", uso: "Literalmente: \"me dá medo\"." },
      { en: "En cuanto se apague la señal, se lo traigo.", pt: "Assim que o aviso apagar, eu trago.", uso: "Promessa com prazo." },
    ],
    dica: "Falso amigo clássico: \"vaso\" é copo! O vaso de flores é \"florero\". E \"taza\" é xícara. Durante turbulência forte, a tripulação também se senta: \"Tripulación, tomen asiento\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué pide el comandante?", opcoes: [{ texto: "Regresar a los asientos y abrocharse el cinturón", certa: true }, { texto: "Apagar los teléfonos" }, { texto: "Preparar la cabina para aterrizar" }], explicacao: "\"Regresen a sus asientos y abróchense el cinturón.\"" },
          { pergunta: "¿Cuánto va a durar la turbulencia?", opcoes: [{ texto: "Cinco minutos" }, { texto: "Unos quince minutos", certa: true }, { texto: "Una hora" }], explicacao: "\"Unos quince minutos.\"" },
          { pergunta: "¿Qué pide Valeria?", opcoes: [{ texto: "Una manta" }, { texto: "Un vaso de agua", certa: true }, { texto: "Cambiar de asiento" }], explicacao: "\"¿Me trae un vaso de agua?\"" },
        ],
      },
      { tipo: "ditado", frases: ["Regresen a sus asientos.", "Es normal sentir miedo.", "Respire despacio."] },
      {
        tipo: "ordenar",
        instrucao: "Monte o anúncio de turbulência.",
        falas: ["Señoras y señores,", "estamos entrando en una zona de turbulencia.", "Por favor, regresen a sus asientos", "y abróchense el cinturón.", "Gracias."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue os falsos amigos e palavras novas.",
        pares: [
          ["vaso", "copo"],
          ["taza", "xícara"],
          ["despacio", "devagar"],
          ["miedo", "medo"],
          ["en cuanto", "assim que"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Señoras y señores, les ___ el comandante.", resposta: "habla" },
          { frase: "Por favor, ___ a sus asientos.", resposta: "regresen", aceitas: ["vuelvan"] },
          { frase: "Me da ___ la turbulencia.", resposta: "miedo" },
          { frase: "Respire ___.", resposta: "despacio" },
          { frase: "¿Me trae un ___ de agua?", resposta: "vaso" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Estamos entrando en una zona de turbulencia.", pt: "Estamos entrando em uma área de turbulência." },
          { en: "Es normal sentir miedo. El avión está preparado para esto.", pt: "É normal sentir medo. O avião está preparado para isso." },
          { en: "Mantenga el cinturón abrochado, por favor.", pt: "Mantenha o cinto afivelado, por favor." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Durante a turbulência, um passageiro está assustado.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "¡Ay! ¿Es peligroso?", modelo: "No se preocupe. La turbulencia es muy común." },
          { outro: "¿Va a durar mucho?", modelo: "Unos diez minutos. Mantenga el cinturón abrochado." },
          { outro: "¿Puedo ir al baño?", modelo: "Ahora no, señor. En cuanto se apague la señal, puede ir." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Vaso\" em espanhol é:", opcoes: [{ texto: "Vaso de flores" }, { texto: "Copo", certa: true }, { texto: "Xícara" }], explicacao: "Falso amigo. Vaso de flores = \"florero\"." },
      { pergunta: "Como acalmar o passageiro?", opcoes: [{ texto: "Es normal sentir miedo.", certa: true }, { texto: "¡Qué miedo!" }, { texto: "No sé qué pasa." }], explicacao: "Valide o sentimento e dê informação." },
      { pergunta: "\"En cuanto se apague la señal\" significa:", opcoes: [{ texto: "Quando o sinal tocar" }, { texto: "Assim que o aviso apagar", certa: true }, { texto: "Enquanto o aviso estiver aceso" }], explicacao: "\"En cuanto\" = assim que; \"apagarse\" = apagar." },
      { pergunta: "\"Respire despacio\":", opcoes: [{ texto: "Respire rápido" }, { texto: "Respire devagar", certa: true }, { texto: "Pare de respirar" }], explicacao: "\"Despacio\" = devagar." },
      { pergunta: "Abertura de anúncio do comandante:", opcoes: [{ texto: "Les habla el comandante.", certa: true }, { texto: "Aquí es el comandante." }, { texto: "Yo comandante hablo." }], explicacao: "Frase fixa: \"Les habla el comandante\"." },
    ],
  },
];
