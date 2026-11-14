import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 7 · Retrasos y reclamos. Conteúdo original Cabin Crew. */
export const MODULO_ES_7: AulaIngles[] = [
  /* ------------------------------------------------------------------ 7.1 */
  {
    modulo: 7,
    numero: 1,
    titulo: "Explicando um atraso",
    tituloEn: "Tenemos un retraso",
    objetivo: "Anunciar e explicar um atraso: motivo, tempo de espera e o que o passageiro pode fazer.",
    foto: "/img/ingles/cena-28.jpg",
    fotoAlt: "Passageiro gesticula enquanto a comissária explica a situação",
    minutos: 15,
    intro:
      "Atrasos acontecem por clima, tráfego aéreo ou manutenção. O passageiro quer três informações: por quê, quanto tempo e o que acontece com ele. Seja claro, honesto e não prometa o que não sabe.",
    dialogo: {
      titulo: "Retraso en la pista",
      contexto: "O avião está parado no pátio. O comandante faz um anúncio e o senhor Ortega pergunta para Diego.",
      personagens: ["Comandante", "Ortega", "Diego"],
      falas: [
        { quem: "Comandante", en: "Señoras y señores, les habla el comandante. Por el mal tiempo en el aeropuerto de destino, tenemos un retraso de unos cuarenta minutos.", pt: "Senhoras e senhores, quem fala é o comandante. Por causa do mau tempo no aeroporto de destino, temos um atraso de uns quarenta minutos." },
        { quem: "Comandante", en: "Lamentamos las molestias y les agradecemos su paciencia.", pt: "Lamentamos o transtorno e agradecemos a paciência." },
        { quem: "Ortega", en: "¿Cuarenta minutos? ¡Tengo una reunión importante!", pt: "Quarenta minutos? Tenho uma reunião importante!" },
        { quem: "Diego", en: "Lo entiendo perfectamente, señor. El retraso es por seguridad. No podemos despegar hasta que mejore el tiempo.", pt: "Entendo perfeitamente, senhor. O atraso é por segurança. Não podemos decolar até o tempo melhorar." },
        { quem: "Ortega", en: "¿Y puedo usar el teléfono mientras tanto?", pt: "E posso usar o telefone enquanto isso?" },
        { quem: "Diego", en: "Sí, mientras estemos en tierra puede usarlo. ¿Le traigo un vaso de agua?", pt: "Sim, enquanto estivermos em solo pode usar. Trago um copo de água?" },
        { quem: "Ortega", en: "Sí, por favor. Gracias.", pt: "Sim, por favor. Obrigado." },
        { quem: "Diego", en: "En cuanto tengamos más información, se la damos.", pt: "Assim que tivermos mais informação, nós passamos ao senhor." },
      ],
    },
    vocabulario: [
      { en: "retraso / demora", pt: "atraso" },
      { en: "mal tiempo", pt: "mau tempo" },
      { en: "tráfico aéreo", pt: "tráfego aéreo" },
      { en: "mantenimiento", pt: "manutenção" },
      { en: "destino", pt: "destino" },
      { en: "reunión", pt: "reunião" },
      { en: "molestias", pt: "transtorno, incômodo" },
      { en: "mientras tanto", pt: "enquanto isso" },
    ],
    expressoes: [
      { en: "Tenemos un retraso de…", pt: "Temos um atraso de…", uso: "Dê sempre a estimativa de tempo." },
      { en: "Lamentamos las molestias.", pt: "Lamentamos o transtorno.", uso: "Pedido de desculpas formal." },
      { en: "Les agradecemos su paciencia.", pt: "Agradecemos a paciência.", uso: "Fecha o anúncio." },
      { en: "Lo entiendo perfectamente.", pt: "Entendo perfeitamente.", uso: "Mostra empatia." },
      { en: "En cuanto tengamos más información…", pt: "Assim que tivermos mais informação…", uso: "Não prometa horário que você não sabe." },
    ],
    dica: "Falso amigo: \"molestar\" é incomodar (não tem sentido sexual). \"Disculpe las molestias\" é uma frase educadíssima. Atraso é \"retraso\" na Espanha e \"demora\" ou \"retraso\" na América Latina.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Por qué hay un retraso?", opcoes: [{ texto: "Por mantenimiento" }, { texto: "Por el mal tiempo en el destino", certa: true }, { texto: "Por un pasajero" }], explicacao: "\"Por el mal tiempo en el aeropuerto de destino.\"" },
          { pergunta: "¿De cuánto es el retraso?", opcoes: [{ texto: "Unos cuarenta minutos", certa: true }, { texto: "Unos catorce minutos" }, { texto: "Dos horas" }], explicacao: "\"Unos cuarenta minutos.\"" },
          { pergunta: "¿Puede el señor Ortega usar el teléfono?", opcoes: [{ texto: "No, nunca" }, { texto: "Sí, mientras estén en tierra", certa: true }, { texto: "Solo en el baño" }], explicacao: "\"Mientras estemos en tierra puede usarlo.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Tenemos un retraso de cuarenta minutos.", "Lamentamos las molestias.", "Lo entiendo perfectamente."] },
      {
        tipo: "ordenar",
        instrucao: "Monte o anúncio de atraso.",
        falas: ["Señoras y señores, les habla el comandante.", "Por el tráfico aéreo,", "tenemos un retraso de unos veinte minutos.", "Lamentamos las molestias", "y les agradecemos su paciencia."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["retraso", "atraso"],
          ["molestias", "transtorno"],
          ["mantenimiento", "manutenção"],
          ["mientras tanto", "enquanto isso"],
          ["reunión", "reunião"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Tenemos un ___ de cuarenta minutos.", resposta: "retraso", aceitas: ["demora"] },
          { frase: "Lamentamos las ___.", resposta: "molestias" },
          { frase: "Les agradecemos su ___.", resposta: "paciencia" },
          { frase: "Lo ___ perfectamente, señor.", resposta: "entiendo" },
          { frase: "En ___ tengamos más información, se la damos.", resposta: "cuanto" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Por el mal tiempo, tenemos un retraso de unos cuarenta minutos.", pt: "Por causa do mau tempo, temos um atraso de uns quarenta minutos." },
          { en: "Lamentamos las molestias y les agradecemos su paciencia.", pt: "Lamentamos o transtorno e agradecemos a paciência." },
          { en: "En cuanto tengamos más información, se la damos.", pt: "Assim que tivermos mais informação, passamos ao senhor." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "O voo está atrasado por manutenção e uma passageira pergunta.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "¿Por qué no despegamos?", modelo: "Tenemos un retraso por un control de mantenimiento, señora." },
          { outro: "¿Y cuánto va a tardar?", modelo: "Unos treinta minutos, más o menos." },
          { outro: "¡Qué pesadez!", modelo: "Lo entiendo perfectamente. En cuanto tengamos más información, se la damos." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Retraso\" é:", opcoes: [{ texto: "Retrato" }, { texto: "Atraso", certa: true }, { texto: "Retorno" }], explicacao: "\"Tenemos un retraso\" = Temos um atraso." },
      { pergunta: "\"Lamentamos las molestias\" quer dizer:", opcoes: [{ texto: "Lamentamos o transtorno.", certa: true }, { texto: "Lamentamos as moléstias (doenças)." }, { texto: "Lamentamos a demora do serviço." }], explicacao: "\"Molestia\" = incômodo." },
      { pergunta: "O passageiro pergunta o horário exato e você não sabe. Diga:", opcoes: [{ texto: "Despegamos a las tres en punto, seguro." }, { texto: "En cuanto tengamos más información, se la damos.", certa: true }, { texto: "No sé, no es mi problema." }], explicacao: "Nunca prometa o que você não sabe." },
      { pergunta: "\"Mal tiempo\":", opcoes: [{ texto: "Pouco tempo" }, { texto: "Mau tempo (clima)", certa: true }, { texto: "Hora errada" }], explicacao: "\"Tiempo\" também é clima." },
      { pergunta: "\"Mientras tanto\":", opcoes: [{ texto: "Enquanto isso", certa: true }, { texto: "Muito tempo" }, { texto: "Mentira" }], explicacao: "Indica o que fazer durante a espera." },
    ],
  },

  /* ------------------------------------------------------------------ 7.2 */
  {
    modulo: 7,
    numero: 2,
    titulo: "Conexões",
    tituloEn: "Voy a perder mi conexión",
    objetivo: "Orientar passageiros com conexão apertada ou perdida.",
    foto: "/img/ingles/cena-14.jpg",
    fotoAlt: "Comissária conversa com um passageiro que procura algo no assento",
    minutos: 15,
    intro:
      "Depois de um atraso, muitos passageiros têm medo de perder a conexão. A tripulação informa o que sabe: o portão, se a companhia vai esperar e onde pedir ajuda em terra (o balcão de conexões).",
    dialogo: {
      titulo: "La conexión",
      contexto: "Pouco antes do pouso em Lima, Valeria pergunta sobre a conexão para Cusco.",
      personagens: ["Valeria", "Sofía"],
      falas: [
        { quem: "Valeria", en: "Disculpe, tengo una conexión a Cusco a las cuatro y cuarto. ¿Voy a llegar a tiempo?", pt: "Com licença, tenho uma conexão para Cusco às quatro e quinze. Vou chegar a tempo?" },
        { quem: "Sofía", en: "Déjeme ver su tarjeta de embarque. Vamos a aterrizar a las tres y media.", pt: "Deixe-me ver seu cartão de embarque. Vamos pousar às três e meia." },
        { quem: "Valeria", en: "¿Solo cuarenta y cinco minutos? ¡Tengo que pasar por migración!", pt: "Só quarenta e cinco minutos? Tenho que passar pela imigração!" },
        { quem: "Sofía", en: "No se preocupe. El comandante pidió que la puerta de embarque espere a los pasajeros en conexión.", pt: "Não se preocupe. O comandante pediu que o portão de embarque espere os passageiros em conexão." },
        { quem: "Sofía", en: "Al bajar del avión, busque al personal de tierra con el cartel de conexiones.", pt: "Ao descer do avião, procure o pessoal de solo com a placa de conexões." },
        { quem: "Valeria", en: "¿Y si pierdo el vuelo?", pt: "E se eu perder o voo?" },
        { quem: "Sofía", en: "En ese caso, la aerolínea la reubica en el próximo vuelo sin costo. Vaya al mostrador de conexiones.", pt: "Nesse caso, a companhia coloca a senhora no próximo voo sem custo. Vá ao balcão de conexões." },
        { quem: "Valeria", en: "Bueno, me quedo más tranquila. Gracias.", pt: "Bom, fico mais tranquila. Obrigada." },
        { quem: "Sofía", en: "Les pediremos a los demás pasajeros que dejen salir primero a los que tienen conexión.", pt: "Vamos pedir aos outros passageiros que deixem sair primeiro quem tem conexão." },
      ],
    },
    vocabulario: [
      { en: "conexión / escala", pt: "conexão / escala" },
      { en: "perder el vuelo", pt: "perder o voo" },
      { en: "puerta de embarque", pt: "portão de embarque" },
      { en: "migración / inmigración", pt: "imigração" },
      { en: "personal de tierra", pt: "pessoal de solo" },
      { en: "mostrador", pt: "balcão" },
      { en: "reubicar", pt: "realocar (em outro voo)" },
      { en: "a tiempo", pt: "a tempo" },
    ],
    expressoes: [
      { en: "¿Voy a llegar a tiempo?", pt: "Vou chegar a tempo?", uso: "Pergunta típica de conexão." },
      { en: "Busque al personal de tierra.", pt: "Procure o pessoal de solo.", uso: "Orientação ao desembarcar." },
      { en: "Vaya al mostrador de conexiones.", pt: "Vá ao balcão de conexões.", uso: "Onde resolver em terra." },
      { en: "Me quedo más tranquila.", pt: "Fico mais tranquila.", uso: "\"Quedarse\" = ficar." },
      { en: "a las tres y media / a las cuatro y cuarto", pt: "às três e meia / às quatro e quinze", uso: "Horas em espanhol." },
    ],
    dica: "Horas: \"y cuarto\" (e quinze), \"y media\" (e meia), \"menos cuarto\" (quinze para): 4h45 = \"las cinco menos cuarto\". Falso amigo: \"escala\" é escala mesmo; mas \"salir\" é sair, e \"subir/bajar del avión\" é embarcar/desembarcar.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿A qué hora es la conexión de Valeria?", opcoes: [{ texto: "A las cuatro y cuarto", certa: true }, { texto: "A las tres y media" }, { texto: "A las cuatro menos cuarto" }], explicacao: "\"A las cuatro y cuarto\" = 16h15." },
          { pergunta: "¿Adónde va Valeria?", opcoes: [{ texto: "A Lima" }, { texto: "A Cusco", certa: true }, { texto: "A Santiago" }], explicacao: "\"Una conexión a Cusco.\"" },
          { pergunta: "Si pierde el vuelo, ¿qué pasa?", opcoes: [{ texto: "Paga un vuelo nuevo" }, { texto: "La reubican en el próximo vuelo sin costo", certa: true }, { texto: "Vuelve a Brasil" }], explicacao: "\"La aerolínea la reubica en el próximo vuelo sin costo.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Voy a llegar a tiempo?", "Vaya al mostrador de conexiones.", "No se preocupe."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a orientação na ordem.",
        falas: ["Tengo una conexión a Bogotá.", "¿A qué hora sale su vuelo?", "A las seis y media.", "Vamos a aterrizar a las cinco.", "Tiene tiempo suficiente, no se preocupe."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as horas e palavras.",
        pares: [
          ["las tres y media", "15h30"],
          ["las cuatro y cuarto", "16h15"],
          ["las cinco menos cuarto", "16h45"],
          ["mostrador", "balcão"],
          ["personal de tierra", "pessoal de solo"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿Voy a llegar a ___?", resposta: "tiempo" },
          { frase: "Tengo que pasar por ___.", resposta: "migración", aceitas: ["migracion", "inmigración", "inmigracion"] },
          { frase: "Busque al personal de ___.", resposta: "tierra" },
          { frase: "Vaya al ___ de conexiones.", resposta: "mostrador" },
          { frase: "Vamos a aterrizar a las tres y ___.", resposta: "media" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Vamos a aterrizar a las tres y media.", pt: "Vamos pousar às três e meia." },
          { en: "Al bajar del avión, busque al personal de tierra.", pt: "Ao descer do avião, procure o pessoal de solo." },
          { en: "Si pierde el vuelo, vaya al mostrador de conexiones.", pt: "Se perder o voo, vá ao balcão de conexões." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro está preocupado com a conexão.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Tengo una conexión en una hora. ¿Llego?", modelo: "Déjeme ver su tarjeta de embarque, por favor." },
          { outro: "Aquí tiene. Sale a las siete.", modelo: "Vamos a aterrizar a las seis y cuarto. Busque al personal de tierra al bajar." },
          { outro: "¿Y si lo pierdo?", modelo: "Vaya al mostrador de conexiones. Lo reubican en el próximo vuelo." },
        ],
      },
    ],
    quiz: [
      { pergunta: "16h45 em espanhol:", opcoes: [{ texto: "las cuatro y cuarenta y cinco ou las cinco menos cuarto", certa: true }, { texto: "las cinco y cuarto" }, { texto: "las cuatro y media" }], explicacao: "\"Menos cuarto\" = quinze para." },
      { pergunta: "\"Mostrador\" é:", opcoes: [{ texto: "Mostruário" }, { texto: "Balcão", certa: true }, { texto: "Painel de voos" }], explicacao: "\"Mostrador de conexiones\" = balcão de conexões." },
      { pergunta: "\"Bajar del avión\" significa:", opcoes: [{ texto: "Pousar o avião" }, { texto: "Descer do avião, desembarcar", certa: true }, { texto: "Baixar o assento" }], explicacao: "\"Subir al avión\" = embarcar." },
      { pergunta: "\"Reubicar\" um passageiro é:", opcoes: [{ texto: "Colocá-lo em outro voo", certa: true }, { texto: "Mudar de assento" }, { texto: "Mandá-lo de volta" }], explicacao: "A companhia realoca no próximo voo." },
      { pergunta: "\"Me quedo más tranquila\":", opcoes: [{ texto: "Fico mais tranquila.", certa: true }, { texto: "Quero ficar quieta." }, { texto: "Estou cansada." }], explicacao: "\"Quedarse\" = ficar." },
    ],
  },

  /* ------------------------------------------------------------------ 7.3 */
  {
    modulo: 7,
    numero: 3,
    titulo: "Passageiro irritado",
    tituloEn: "Un pasajero molesto",
    objetivo: "Ouvir a reclamação, pedir desculpas, oferecer uma solução e manter a calma.",
    foto: "/img/ingles/cena-26.jpg",
    fotoAlt: "Passageira reclama com a comissária, que ouve com atenção",
    minutos: 18,
    intro:
      "Com um passageiro irritado, siga quatro passos: escutar sem interromper, pedir desculpas, oferecer uma solução possível e agradecer. Fale baixo e devagar. Se a situação passar dos limites, chame a chefe de cabine.",
    dialogo: {
      titulo: "¡Esto es inaceptable!",
      contexto: "A tela de entretenimento e a luz de leitura do senhor Ortega não funcionam. Ele está irritado.",
      personagens: ["Ortega", "Ana", "Lucía"],
      falas: [
        { quem: "Ortega", en: "¡Señorita! Es la tercera vez que llamo. La pantalla no funciona y la luz tampoco. ¡Esto es inaceptable!", pt: "Moça! É a terceira vez que chamo. A tela não funciona e a luz também não. Isso é inaceitável!" },
        { quem: "Ana", en: "Tiene toda la razón, señor. Le pido disculpas por la espera.", pt: "O senhor tem toda razão. Peço desculpas pela espera." },
        { quem: "Ortega", en: "Pagué mucho por este billete. Quiero un servicio decente.", pt: "Paguei caro por esta passagem. Quero um serviço decente." },
        { quem: "Ana", en: "Lo entiendo. Ya intenté reiniciar la pantalla y no funcionó. Hay un asiento libre en la fila nueve con todo funcionando. ¿Le gustaría cambiarse?", pt: "Entendo. Já tentei reiniciar a tela e não funcionou. Há um assento livre na fileira nove com tudo funcionando. Gostaria de trocar?" },
        { quem: "Ortega", en: "¿Es ventanilla?", pt: "É janela?" },
        { quem: "Ana", en: "Es pasillo, señor, pero tiene más espacio para las piernas.", pt: "É corredor, senhor, mas tem mais espaço para as pernas." },
        { quem: "Ortega", en: "Bueno, está bien.", pt: "Bom, tudo bem." },
        { quem: "Lucía", en: "Señor Ortega, soy la jefa de cabina. Voy a registrar el problema para que la aerolínea se comunique con usted.", pt: "Senhor Ortega, sou a chefe de cabine. Vou registrar o problema para que a companhia entre em contato com o senhor." },
        { quem: "Ortega", en: "Se lo agradezco. Disculpen el tono.", pt: "Agradeço. Desculpem o tom." },
        { quem: "Ana", en: "No se preocupe. Gracias por su paciencia.", pt: "Não se preocupe. Obrigada pela paciência." },
      ],
    },
    vocabulario: [
      { en: "molesto / enojado", pt: "irritado, bravo" },
      { en: "queja / reclamo", pt: "reclamação" },
      { en: "pantalla", pt: "tela" },
      { en: "billete / boleto / pasaje", pt: "passagem" },
      { en: "espacio para las piernas", pt: "espaço para as pernas" },
      { en: "registrar", pt: "registrar" },
      { en: "inaceptable", pt: "inaceitável" },
      { en: "tono", pt: "tom (de voz)" },
    ],
    expressoes: [
      { en: "Tiene toda la razón.", pt: "O(a) senhor(a) tem toda razão.", uso: "Valida a reclamação sem discutir." },
      { en: "Le pido disculpas por…", pt: "Peço desculpas por…", uso: "Pedido de desculpas formal." },
      { en: "¿Le gustaría cambiarse?", pt: "Gostaria de trocar de lugar?", uso: "Ofereça uma solução concreta." },
      { en: "Voy a registrar el problema.", pt: "Vou registrar o problema.", uso: "Mostra que a reclamação não se perde." },
      { en: "Se lo agradezco.", pt: "Agradeço (ao senhor).", uso: "Agradecimento formal." },
    ],
    dica: "\"Estar molesto\" é estar irritado (não doente). Passagem: \"billete\" na Espanha, \"boleto\" no México, \"pasaje\" na Argentina e no Chile. Nunca diga \"no es mi culpa\" (não é culpa minha): isso piora a situação.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué no funciona?", opcoes: [{ texto: "La pantalla y la luz", certa: true }, { texto: "El cinturón" }, { texto: "El baño" }], explicacao: "\"La pantalla no funciona y la luz tampoco.\"" },
          { pergunta: "¿Qué solución ofrece Ana?", opcoes: [{ texto: "Un descuento" }, { texto: "Un asiento en la fila nueve", certa: true }, { texto: "Una comida extra" }], explicacao: "\"Hay un asiento libre en la fila nueve.\"" },
          { pergunta: "¿Qué hace Lucía?", opcoes: [{ texto: "Registra el problema", certa: true }, { texto: "Llama al comandante" }, { texto: "Le da dinero" }], explicacao: "\"Voy a registrar el problema.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Tiene toda la razón.", "Le pido disculpas por la espera.", "¿Le gustaría cambiarse?"] },
      {
        tipo: "ordenar",
        instrucao: "Os quatro passos com um passageiro irritado.",
        falas: ["(Escuchar sin interrumpir.)", "Tiene toda la razón, señor.", "Le pido disculpas.", "¿Le gustaría cambiarse a la fila nueve?", "Gracias por su paciencia."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["molesto", "irritado"],
          ["pantalla", "tela"],
          ["queja", "reclamação"],
          ["pasaje", "passagem"],
          ["Se lo agradezco.", "Agradeço."],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Tiene toda la ___, señor.", resposta: "razón", aceitas: ["razon"] },
          { frase: "Le pido ___ por la espera.", resposta: "disculpas" },
          { frase: "La ___ no funciona.", resposta: "pantalla" },
          { frase: "¿Le ___ cambiarse?", resposta: "gustaría", aceitas: ["gustaria"] },
          { frase: "Voy a ___ el problema.", resposta: "registrar" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Tiene toda la razón, señor. Le pido disculpas.", pt: "O senhor tem toda razão. Peço desculpas." },
          { en: "Hay un asiento libre en la fila nueve. ¿Le gustaría cambiarse?", pt: "Há um assento livre na fileira nove. Gostaria de trocar?" },
          { en: "Voy a registrar el problema. Gracias por su paciencia.", pt: "Vou registrar o problema. Obrigado(a) pela paciência." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Uma passageira reclama que o café chegou frio.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "¡Este café está frío! ¡Qué mal servicio!", modelo: "Tiene toda la razón, señora. Le pido disculpas." },
          { outro: "Siempre pasa lo mismo.", modelo: "Lo entiendo. Enseguida le traigo un café caliente." },
          { outro: "Bueno, gracias.", modelo: "Con gusto. Gracias por su paciencia." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Estar molesto\" significa:", opcoes: [{ texto: "Estar doente" }, { texto: "Estar irritado", certa: true }, { texto: "Estar molhado" }], explicacao: "\"Molesto\" = irritado, incomodado." },
      { pergunta: "Qual frase valida a reclamação?", opcoes: [{ texto: "No es mi culpa." }, { texto: "Tiene toda la razón.", certa: true }, { texto: "Cálmese ya." }], explicacao: "Validar acalma; discutir piora." },
      { pergunta: "\"Pantalla\" é:", opcoes: [{ texto: "Pantufa" }, { texto: "Tela", certa: true }, { texto: "Calça" }], explicacao: "A tela de entretenimento. Calça é \"pantalón\"." },
      { pergunta: "Passagem no México:", opcoes: [{ texto: "boleto", certa: true }, { texto: "pasaje" }, { texto: "billete" }], explicacao: "\"Boleto\" no México; \"pasaje\" na Argentina; \"billete\" na Espanha." },
      { pergunta: "Qual é a ordem dos passos?", opcoes: [{ texto: "Discutir, explicar, agradecer" }, { texto: "Escutar, pedir desculpas, oferecer solução, agradecer", certa: true }, { texto: "Chamar a polícia primeiro" }], explicacao: "Os quatro passos da aula." },
    ],
  },
];
