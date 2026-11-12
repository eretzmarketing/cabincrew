import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 10 · Landing and arrival. Conteúdo original Cabin Crew. */
export const MODULO_10: AulaIngles[] = [
  /* ------------------------------------------------------------------ 10.1 */
  {
    modulo: 10,
    numero: 1,
    titulo: "Preparando a cabine para o pouso",
    tituloEn: "Preparing the cabin for landing",
    objetivo: "Fazer o anúncio de descida e as checagens finais: cinto, encosto, mesinha, eletrônicos e lixo.",
    foto: "/img/ingles/cena-17.jpg",
    fotoAlt: "Comissária confere o cinto e a mesinha de um passageiro",
    minutos: 15,
    intro:
      "A preparação para o pouso é parecida com a da decolagem, com alguns itens a mais: recolher o lixo, os fones e os copos. Os anúncios dão o horário previsto e a temperatura no destino.",
    dialogo: {
      titulo: "We've started our descent",
      contexto: "Faltam 30 minutos para o pouso em Londres. Grace faz o anúncio e Leila passa pelo corredor.",
      personagens: ["Grace", "Leila", "Clarke"],
      falas: [
        { quem: "Grace", en: "Ladies and gentlemen, we have started our descent into London Heathrow. We expect to land in about thirty minutes.", pt: "Senhoras e senhores, iniciamos a descida para Londres Heathrow. Esperamos pousar em cerca de trinta minutos." },
        { quem: "Grace", en: "The local time is 6:45 in the morning, and the temperature is eight degrees Celsius.", pt: "O horário local é 6h45 da manhã, e a temperatura é de oito graus Celsius." },
        { quem: "Grace", en: "Please return to your seats, fasten your seatbelts, and make sure your seat backs and tray tables are in the upright position.", pt: "Por favor, voltem aos seus assentos, afivelem os cintos e verifiquem se os encostos e as mesinhas estão na posição vertical." },
        { quem: "Leila", en: "Excuse me, sir. May I take your cup and headphones?", pt: "Com licença, senhor. Posso levar o seu copo e os fones?" },
        { quem: "Clarke", en: "Sure. Is there time to use the lavatory?", pt: "Claro. Dá tempo de ir ao banheiro?" },
        { quem: "Leila", en: "Yes, but please be quick. The seatbelt sign will be on in a few minutes.", pt: "Sim, mas, por favor, seja rápido. O aviso de cinto vai acender em alguns minutos." },
        { quem: "Clarke", en: "Thanks, I'll go now.", pt: "Obrigado, vou agora." },
        { quem: "Grace", en: "Cabin crew, please prepare the cabin for landing.", pt: "Tripulação, por favor, preparem a cabine para o pouso." },
      ],
    },
    vocabulario: [
      { en: "descent", pt: "descida" },
      { en: "to land / landing", pt: "pousar / pouso" },
      { en: "local time", pt: "horário local" },
      { en: "degrees Celsius", pt: "graus Celsius" },
      { en: "rubbish / trash", pt: "lixo" },
      { en: "headphones", pt: "fones de ouvido" },
      { en: "to be quick", pt: "ser rápido" },
      { en: "in a few minutes", pt: "em alguns minutos" },
    ],
    expressoes: [
      { en: "We have started our descent into…", pt: "Iniciamos a descida para…", uso: "Abre o anúncio de descida." },
      { en: "We expect to land in about … minutes.", pt: "Esperamos pousar em cerca de … minutos.", uso: "Previsão." },
      { en: "The local time is…", pt: "O horário local é…", uso: "Informação útil para o passageiro." },
      { en: "May I take your cup?", pt: "Posso levar o seu copo?", uso: "Recolher itens antes do pouso." },
      { en: "Cabin crew, please prepare the cabin for landing.", pt: "Tripulação, preparem a cabine para o pouso.", uso: "Ordem para a equipe." },
    ],
    dica: "Temperaturas: no Reino Unido e no Brasil se usa Celsius; nos Estados Unidos, Fahrenheit. Em anúncios para os EUA, muitas companhias dão as duas.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "When do they expect to land?", opcoes: [{ texto: "In about thirty minutes", certa: true }, { texto: "In about thirteen minutes" }, { texto: "In one hour" }], explicacao: "\"We expect to land in about thirty minutes.\"" },
          { pergunta: "What is the temperature in London?", opcoes: [{ texto: "18°C" }, { texto: "8°C", certa: true }, { texto: "6°C" }], explicacao: "\"the temperature is eight degrees Celsius\"" },
          { pergunta: "What does Leila take from Mr. Clarke?", opcoes: [{ texto: "His blanket and pillow" }, { texto: "His cup and headphones", certa: true }, { texto: "His tray" }], explicacao: "\"May I take your cup and headphones?\"" },
        ],
      },
      { tipo: "ditado", frases: ["We have started our descent.", "The local time is 6:45 in the morning.", "May I take your cup?"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o anúncio na ordem certa.",
        falas: ["Ladies and gentlemen, we have started our descent into Miami.", "We expect to land in about twenty minutes.", "The local time is 3:10 in the afternoon.", "Please return to your seats and fasten your seatbelts.", "Thank you."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["descent", "descida"],
          ["local time", "horário local"],
          ["rubbish", "lixo"],
          ["landing", "pouso"],
          ["to be quick", "ser rápido"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "We have started our ___ into London.", resposta: "descent" },
          { frase: "We expect to ___ in about thirty minutes.", resposta: "land" },
          { frase: "The ___ time is 6:45.", resposta: "local" },
          { frase: "May I ___ your cup?", resposta: "take" },
          { frase: "Please prepare the cabin for ___.", resposta: "landing" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Ladies and gentlemen, we have started our descent.", pt: "Senhoras e senhores, iniciamos a descida." },
          { en: "The local time is ten past seven, and the temperature is twenty-five degrees.", pt: "O horário local é sete e dez, e a temperatura é de vinte e cinco graus." },
          { en: "May I take your cup and headphones, please?", pt: "Posso levar o seu copo e os fones, por favor?" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Preparação para o pouso. Um passageiro ainda está com a mesinha aberta e os fones.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Are we landing soon?", modelo: "Yes, sir. We expect to land in about twenty minutes." },
          { outro: "OK.", modelo: "May I take your headphones and your cup, please?" },
          { outro: "Here you go.", modelo: "Thank you. Please stow your tray table and fasten your seatbelt." },
          { outro: "Done.", modelo: "Thank you very much." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Descent\" é:", opcoes: [{ texto: "descida", certa: true }, { texto: "decente" }, { texto: "desconto" }], explicacao: "Descent = descida. Decent = decente." },
      { pergunta: "\"Local time\" é:", opcoes: [{ texto: "horário local", certa: true }, { texto: "tempo de voo" }, { texto: "horário de Brasília" }], explicacao: "O horário no destino." },
      { pergunta: "O que se recolhe antes do pouso?", opcoes: [{ texto: "Copos, lixo e fones", certa: true }, { texto: "Os cintos" }, { texto: "Os coletes" }], explicacao: "Itens soltos precisam ser recolhidos." },
      { pergunta: "\"Please be quick\" significa:", opcoes: [{ texto: "Por favor, seja rápido.", certa: true }, { texto: "Por favor, fique quieto." }, { texto: "Por favor, espere." }], explicacao: "Quick = rápido." },
      { pergunta: "Quem dá a ordem \"Cabin crew, prepare the cabin for landing\"?", opcoes: [{ texto: "Um passageiro" }, { texto: "A chefe de cabine ou o comandante", certa: true }, { texto: "A torre de controle" }], explicacao: "A ordem vem da liderança da tripulação." },
    ],
  },

  /* ------------------------------------------------------------------ 10.2 */
  {
    modulo: 10,
    numero: 2,
    titulo: "Depois do pouso",
    tituloEn: "After landing",
    objetivo: "Fazer o anúncio de chegada e orientar os passageiros a permanecerem sentados até o aviso apagar.",
    foto: "/img/ingles/cena-10.jpg",
    fotoAlt: "Família se prepara para desembarcar com ajuda da comissária",
    minutos: 12,
    intro:
      "Logo depois do pouso, muitos passageiros querem se levantar. O anúncio de chegada pede que permaneçam sentados, lembra dos pertences e informa as conexões. Firmeza e simpatia andam juntas.",
    dialogo: {
      titulo: "Welcome to London",
      contexto: "A aeronave acabou de pousar e ainda está taxiando. Grace faz o anúncio. Ana orienta Mrs. Lopez.",
      personagens: ["Grace", "Lopez", "Ana"],
      falas: [
        { quem: "Grace", en: "Ladies and gentlemen, welcome to London Heathrow. Please remain seated with your seatbelt fastened until the aircraft has come to a complete stop and the seatbelt sign is off.", pt: "Senhoras e senhores, bem-vindos a Londres Heathrow. Por favor, permaneçam sentados com o cinto afivelado até a aeronave parar completamente e o aviso de cinto apagar." },
        { quem: "Grace", en: "Please be careful when opening the overhead bins, as items may have moved during the flight.", pt: "Por favor, tenham cuidado ao abrir os bagageiros, pois os itens podem ter se movido durante o voo." },
        { quem: "Grace", en: "Passengers with connecting flights, please follow the transfer signs in the terminal.", pt: "Passageiros com voos de conexão, por favor, sigam as placas de conexão (transfer) no terminal." },
        { quem: "Lopez", en: "Excuse me, can we get our stroller at the door?", pt: "Com licença, podemos pegar o carrinho na porta?" },
        { quem: "Ana", en: "Yes, it will be at the aircraft door. Please stay seated for now; we're still taxiing.", pt: "Sim, ele vai estar na porta da aeronave. Por favor, permaneçam sentadas por enquanto; ainda estamos taxiando." },
        { quem: "Lopez", en: "OK. Lily, sit down, sweetie.", pt: "Tá. Lily, senta, querida." },
        { quem: "Grace", en: "On behalf of the whole crew, thank you for flying with us. We hope to see you again soon.", pt: "Em nome de toda a tripulação, obrigada por voar conosco. Esperamos ver vocês novamente em breve." },
      ],
    },
    vocabulario: [
      { en: "to remain seated", pt: "permanecer sentado" },
      { en: "complete stop", pt: "parada completa" },
      { en: "to taxi", pt: "taxiar" },
      { en: "belongings", pt: "pertences" },
      { en: "terminal", pt: "terminal" },
      { en: "transfer signs", pt: "placas de conexão" },
      { en: "on behalf of", pt: "em nome de" },
      { en: "to move (items)", pt: "mudar de lugar, se deslocar" },
    ],
    expressoes: [
      { en: "Welcome to…", pt: "Bem-vindos a…", uso: "Abre o anúncio de chegada." },
      { en: "Please remain seated until the seatbelt sign is off.", pt: "Por favor, permaneçam sentados até o aviso de cinto apagar.", uso: "Pedido mais importante após o pouso." },
      { en: "Items may have moved during the flight.", pt: "Os itens podem ter se movido durante o voo.", uso: "Aviso sobre os bagageiros." },
      { en: "Please follow the transfer signs.", pt: "Por favor, sigam as placas de conexão.", uso: "Orientação para conexões." },
      { en: "On behalf of the whole crew, thank you for flying with us.", pt: "Em nome de toda a tripulação, obrigado por voar conosco.", uso: "Encerramento do anúncio." },
    ],
    dica: "\"Please make sure you have all your belongings with you\" (verifiquem se estão com todos os pertences) é outra frase comum no anúncio de chegada.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "Until when should passengers remain seated?", opcoes: [{ texto: "Until the seatbelt sign is off", certa: true }, { texto: "Until the doors open" }, { texto: "For five minutes" }], explicacao: "\"until the aircraft has come to a complete stop and the seatbelt sign is off\"" },
          { pergunta: "Where will the stroller be?", opcoes: [{ texto: "At the baggage belt" }, { texto: "At the aircraft door", certa: true }, { texto: "In the terminal" }], explicacao: "\"It will be at the aircraft door.\"" },
          { pergunta: "What should connecting passengers follow?", opcoes: [{ texto: "The crew" }, { texto: "The transfer signs", certa: true }, { texto: "The exit signs" }], explicacao: "\"please follow the transfer signs in the terminal\"" },
        ],
      },
      { tipo: "ditado", frases: ["Welcome to London.", "Please remain seated.", "Thank you for flying with us."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o anúncio de chegada na ordem certa.",
        falas: ["Ladies and gentlemen, welcome to Lisbon.", "Please remain seated until the seatbelt sign is off.", "Please be careful when opening the overhead bins.", "Passengers with connecting flights, please follow the transfer signs.", "Thank you for flying with us."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["belongings", "pertences"],
          ["to taxi", "taxiar"],
          ["on behalf of", "em nome de"],
          ["complete stop", "parada completa"],
          ["to remain seated", "permanecer sentado"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Please ___ seated.", resposta: "remain", aceitas: ["stay"] },
          { frase: "…until the aircraft has come to a complete ___.", resposta: "stop" },
          { frase: "Items may have ___ during the flight.", resposta: "moved" },
          { frase: "Please follow the ___ signs.", resposta: "transfer" },
          { frase: "On ___ of the whole crew, thank you.", resposta: "behalf" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Ladies and gentlemen, welcome to London Heathrow.", pt: "Senhoras e senhores, bem-vindos a Londres Heathrow." },
          { en: "Please remain seated until the seatbelt sign is off.", pt: "Por favor, permaneçam sentados até o aviso de cinto apagar." },
          { en: "On behalf of the whole crew, thank you for flying with us.", pt: "Em nome de toda a tripulação, obrigado(a) por voar conosco." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "O avião ainda está taxiando e um passageiro se levanta para pegar a mala.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A passenger stands up and opens the bin.)", modelo: "Excuse me, sir. Please remain seated. We're still taxiing." },
          { outro: "I'm in a hurry. I have a connection.", modelo: "I understand. Please wait until the seatbelt sign is off. It won't be long." },
          { outro: "OK, OK.", modelo: "Thank you. And please be careful when you open the bin later." },
          { outro: "Will do.", modelo: "Thank you for flying with us." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"To taxi\" (avião) é:", opcoes: [{ texto: "pegar um táxi" }, { texto: "taxiar, se deslocar em solo", certa: true }, { texto: "pagar taxas" }], explicacao: "O avião taxia até o portão." },
      { pergunta: "\"Belongings\" é:", opcoes: [{ texto: "pertences", certa: true }, { texto: "saudades" }, { texto: "bagagem despachada apenas" }], explicacao: "Belongings = seus objetos pessoais." },
      { pergunta: "Por que ter cuidado ao abrir o bagageiro?", opcoes: [{ texto: "Os itens podem ter se movido e cair", certa: true }, { texto: "Pode estar trancado" }, { texto: "Pode estar quente" }], explicacao: "\"Items may have moved during the flight.\"" },
      { pergunta: "\"On behalf of\" significa:", opcoes: [{ texto: "em nome de", certa: true }, { texto: "atrás de" }, { texto: "metade de" }], explicacao: "On behalf of the crew = em nome da tripulação." },
      { pergunta: "\"Transfer signs\" são:", opcoes: [{ texto: "placas de conexão", certa: true }, { texto: "placas de saída de emergência" }, { texto: "avisos de cinto" }], explicacao: "Indicam o caminho para conexões." },
    ],
  },

  /* ------------------------------------------------------------------ 10.3 */
  {
    modulo: 10,
    numero: 3,
    titulo: "Imigração e formulários",
    tituloEn: "Immigration and landing forms",
    objetivo: "Explicar formulários de chegada e responder perguntas sobre imigração, alfândega e documentos.",
    foto: "/img/ingles/cena-08.jpg",
    fotoAlt: "Comissária ajuda um passageiro com documentos no corredor",
    minutos: 15,
    intro:
      "Alguns países exigem formulários de chegada ou declaração de alfândega. O comissário não é agente de imigração, mas ajuda o passageiro a entender o que é pedido e onde buscar mais informação.",
    dialogo: {
      titulo: "Do I need to fill this in?",
      contexto: "Antes do pouso, Ana distribui formulários. Ms. Kim tem dúvidas.",
      personagens: ["Ana", "Kim"],
      falas: [
        { quem: "Ana", en: "Excuse me, madam. Would you like a customs declaration form?", pt: "Com licença, senhora. Gostaria de um formulário de declaração de alfândega?" },
        { quem: "Kim", en: "Do I need to fill it in? I only have clothes and some gifts.", pt: "Preciso preencher? Só tenho roupas e alguns presentes." },
        { quem: "Ana", en: "The rules depend on what you're bringing. The form explains it, and you can ask the customs officers when you arrive.", pt: "As regras dependem do que a senhora está trazendo. O formulário explica, e a senhora pode perguntar aos agentes da alfândega na chegada." },
        { quem: "Kim", en: "OK. Can I write in pencil?", pt: "Tá. Posso escrever a lápis?" },
        { quem: "Ana", en: "Please use a pen and write in capital letters. Would you like to borrow a pen?", pt: "Por favor, use caneta e escreva em letra de forma maiúscula. Quer uma caneta emprestada?" },
        { quem: "Kim", en: "Yes, please. And what's my address here? I'm staying at a hotel.", pt: "Sim, por favor. E qual é o meu endereço aqui? Vou ficar num hotel." },
        { quem: "Ana", en: "You can write the name and address of your hotel.", pt: "A senhora pode escrever o nome e o endereço do hotel." },
        { quem: "Kim", en: "Great. Do I show this at passport control?", pt: "Ótimo. Eu mostro isto no controle de passaportes?" },
        { quem: "Ana", en: "Keep it with your passport. The officers will tell you when they need it.", pt: "Guarde junto com o passaporte. Os agentes vão dizer quando precisarem." },
      ],
    },
    vocabulario: [
      { en: "immigration / passport control", pt: "imigração / controle de passaportes" },
      { en: "customs", pt: "alfândega" },
      { en: "declaration form", pt: "formulário de declaração" },
      { en: "to fill in / to fill out", pt: "preencher" },
      { en: "capital letters", pt: "letras maiúsculas (de forma)" },
      { en: "to borrow / to lend", pt: "pegar emprestado / emprestar" },
      { en: "officer", pt: "agente, oficial" },
      { en: "address", pt: "endereço" },
    ],
    expressoes: [
      { en: "Would you like a customs declaration form?", pt: "Gostaria de um formulário de alfândega?", uso: "Ao distribuir os formulários." },
      { en: "The rules depend on…", pt: "As regras dependem de…", uso: "Honesto: você não é agente da alfândega." },
      { en: "Please use a pen and write in capital letters.", pt: "Use caneta e escreva em letra de forma.", uso: "Instrução comum." },
      { en: "Would you like to borrow a pen?", pt: "Quer uma caneta emprestada?", uso: "Borrow = pegar emprestado." },
      { en: "Keep it with your passport.", pt: "Guarde junto com o passaporte.", uso: "Orientação prática." },
    ],
    dica: "Cuidado com borrow e lend: o passageiro diz \"Can I borrow a pen?\" (posso pegar emprestada?) e você responde \"Sure, I can lend you one\" (claro, posso emprestar uma).",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What form does Ana offer?", opcoes: [{ texto: "A customs declaration form", certa: true }, { texto: "A complaint form" }, { texto: "A visa form" }], explicacao: "\"Would you like a customs declaration form?\"" },
          { pergunta: "How should Ms. Kim fill it in?", opcoes: [{ texto: "In pencil" }, { texto: "With a pen, in capital letters", certa: true }, { texto: "On her phone" }], explicacao: "\"Please use a pen and write in capital letters.\"" },
          { pergunta: "What address does she write?", opcoes: [{ texto: "Her home address" }, { texto: "Her hotel's address", certa: true }, { texto: "The airport's address" }], explicacao: "\"You can write the name and address of your hotel.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Please use a pen.", "Write in capital letters.", "Keep it with your passport."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa na ordem certa.",
        falas: ["Would you like a landing card?", "Yes, please. Can I borrow a pen?", "Sure, I can lend you one.", "Thanks. What do I write here?", "Your passport number."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["customs", "alfândega"],
          ["to fill in", "preencher"],
          ["capital letters", "letras maiúsculas"],
          ["to borrow", "pegar emprestado"],
          ["to lend", "emprestar"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Would you like a customs ___ form?", resposta: "declaration" },
          { frase: "Do I need to ___ it in?", resposta: "fill" },
          { frase: "Please write in ___ letters.", resposta: "capital" },
          { frase: "Would you like to ___ a pen?", resposta: "borrow" },
          { frase: "Keep it ___ your passport.", resposta: "with" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Would you like a customs declaration form?", pt: "Gostaria de um formulário de alfândega?" },
          { en: "Please use a pen and write in capital letters.", pt: "Por favor, use caneta e escreva em letra de forma." },
          { en: "The rules depend on what you're bringing. You can ask the officers when you arrive.", pt: "As regras dependem do que você está trazendo. Pode perguntar aos agentes na chegada." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro pergunta se precisa declarar um notebook novo.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "I bought a new laptop. Do I need to declare it?", modelo: "The rules depend on the country and the value. The form explains it." },
          { outro: "Can't you tell me?", modelo: "I'm sorry, I'm not a customs officer. You can ask them when you arrive." },
          { outro: "OK. Can I borrow a pen?", modelo: "Sure, I can lend you one." },
          { outro: "Thanks.", modelo: "You're welcome. Please keep the form with your passport." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Customs\" no aeroporto é:", opcoes: [{ texto: "costumes" }, { texto: "alfândega", certa: true }, { texto: "imigração" }], explicacao: "Customs = alfândega (falso cognato!)." },
      { pergunta: "\"Can I borrow a pen?\" significa:", opcoes: [{ texto: "Posso pegar uma caneta emprestada?", certa: true }, { texto: "Posso te emprestar uma caneta?" }, { texto: "Posso comprar uma caneta?" }], explicacao: "Borrow = pegar emprestado." },
      { pergunta: "\"Capital letters\" são:", opcoes: [{ texto: "letras maiúsculas", certa: true }, { texto: "letras da capital" }, { texto: "letras cursivas" }], explicacao: "Capital letters = MAIÚSCULAS." },
      { pergunta: "O passageiro pergunta uma regra de alfândega que você não sabe. Você:", opcoes: [{ texto: "inventa uma resposta" }, { texto: "diz que as regras dependem e indica os agentes", certa: true }, { texto: "diz que não precisa declarar" }], explicacao: "Não dê informação que pode estar errada." },
      { pergunta: "\"To fill in a form\" é:", opcoes: [{ texto: "preencher um formulário", certa: true }, { texto: "dobrar um formulário" }, { texto: "assinar um formulário" }], explicacao: "Fill in / fill out = preencher." },
    ],
  },

  /* ------------------------------------------------------------------ 10.4 */
  {
    modulo: 10,
    numero: 4,
    titulo: "Despedida na porta",
    tituloEn: "Saying goodbye",
    objetivo: "Despedir-se dos passageiros com variedade e simpatia, e responder a agradecimentos e elogios.",
    foto: "/img/ingles/cena-07.jpg",
    fotoAlt: "Comissária sorri e se despede de passageiros na porta do avião",
    minutos: 12,
    intro:
      "A despedida é a última impressão do voo. Varie as frases, olhe para cada passageiro e responda aos elogios com naturalidade. Um \"Have a great stay\" bem dito fica na memória.",
    dialogo: {
      titulo: "Have a lovely day",
      contexto: "Desembarque em Londres. Ana e Tom se despedem dos passageiros na porta.",
      personagens: ["Ana", "Lily", "Lopez", "Tom", "Clarke"],
      falas: [
        { quem: "Ana", en: "Goodbye, Lily! It was lovely to meet you.", pt: "Tchau, Lily! Foi um prazer te conhecer." },
        { quem: "Lily", en: "Bye! I didn't see the pilots…", pt: "Tchau! Eu não vi os pilotos…" },
        { quem: "Ana", en: "The captain says you can say hello now. He's just here.", pt: "O comandante disse que você pode dar um oi agora. Ele está bem aqui." },
        { quem: "Lopez", en: "Thank you so much for everything. You were wonderful.", pt: "Muito obrigada por tudo. Vocês foram maravilhosos." },
        { quem: "Ana", en: "That's so kind of you. Have a lovely holiday!", pt: "Que gentileza. Tenham ótimas férias!" },
        { quem: "Tom", en: "Goodbye, sir. Thank you for flying with us.", pt: "Até logo, senhor. Obrigado por voar conosco." },
        { quem: "Clarke", en: "Thank you. Good luck with your meeting… oh, wait, that's me!", pt: "Obrigado. Boa sorte na reunião… ah, espera, sou eu!" },
        { quem: "Tom", en: "Ha! Good luck with your meeting, then. Have a great day!", pt: "Ha! Então boa sorte na sua reunião. Tenha um ótimo dia!" },
      ],
    },
    vocabulario: [
      { en: "goodbye / bye", pt: "tchau, até logo" },
      { en: "holiday / vacation", pt: "férias" },
      { en: "stay", pt: "estadia" },
      { en: "wonderful", pt: "maravilhoso(a)" },
      { en: "kind", pt: "gentil" },
      { en: "good luck", pt: "boa sorte" },
      { en: "trip", pt: "viagem" },
      { en: "to see you again", pt: "ver você de novo" },
    ],
    expressoes: [
      { en: "Thank you for flying with us.", pt: "Obrigado(a) por voar conosco.", uso: "A despedida mais comum." },
      { en: "Have a lovely day / a great stay / a nice trip.", pt: "Tenha um ótimo dia / uma ótima estadia / uma boa viagem.", uso: "Varie conforme o passageiro." },
      { en: "It was lovely to meet you.", pt: "Foi um prazer conhecer você.", uso: "Para quem você atendeu de perto." },
      { en: "That's so kind of you.", pt: "Que gentileza.", uso: "Resposta a um elogio." },
      { en: "We hope to see you again soon.", pt: "Esperamos ver você de novo em breve.", uso: "Convite a voltar." },
    ],
    dica: "Em despedidas, \"Have a nice day\" pode soar automático se repetido 200 vezes do mesmo jeito. Varie: \"Have a lovely evening\", \"Enjoy London!\", \"Safe travels!\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "Who can Lily say hello to?", opcoes: [{ texto: "The captain", certa: true }, { texto: "The purser" }, { texto: "Another child" }], explicacao: "\"The captain says you can say hello now.\"" },
          { pergunta: "What does Ana wish Mrs. Lopez?", opcoes: [{ texto: "A lovely holiday", certa: true }, { texto: "Good luck" }, { texto: "A safe flight home" }], explicacao: "\"Have a lovely holiday!\"" },
          { pergunta: "Who has a meeting?", opcoes: [{ texto: "Tom" }, { texto: "Mr. Clarke", certa: true }, { texto: "Mrs. Lopez" }], explicacao: "Mr. Clarke brinca porque é ele quem tem a reunião." },
        ],
      },
      { tipo: "ditado", frases: ["Thank you for flying with us.", "It was lovely to meet you.", "Have a great stay!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a despedida na ordem certa.",
        falas: ["Goodbye, madam. Thank you for flying with us.", "Thank you! The crew was fantastic.", "That's so kind of you.", "Have a lovely day!", "You too!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue a despedida à situação.",
        pares: [
          ["Have a lovely holiday!", "Família de férias"],
          ["Good luck with your meeting!", "Passageiro a trabalho"],
          ["Welcome home!", "Passageiro voltando para casa"],
          ["Have a lovely evening!", "Chegada à noite"],
          ["Safe travels!", "Passageiro que segue viagem"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Thank you for ___ with us.", resposta: "flying" },
          { frase: "It was lovely to ___ you.", resposta: "meet" },
          { frase: "That's so ___ of you.", resposta: "kind" },
          { frase: "Have a lovely ___!", resposta: "holiday", aceitas: ["day", "vacation", "evening", "trip"] },
          { frase: "We hope to see you ___ soon.", resposta: "again" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Goodbye, and thank you for flying with us.", pt: "Até logo, e obrigado(a) por voar conosco." },
          { en: "That's so kind of you. Have a lovely holiday!", pt: "Que gentileza. Tenham ótimas férias!" },
          { en: "We hope to see you again soon.", pt: "Esperamos ver vocês de novo em breve." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Desembarque. Os passageiros se despedem de você na porta.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Thank you, the flight was great.", modelo: "That's so kind of you. Thank you for flying with us." },
          { outro: "I'm here for a conference.", modelo: "Good luck with your conference! Have a great stay." },
          { outro: "(a family) Bye! We're going to Disney!", modelo: "Wow! Have a lovely holiday!" },
          { outro: "I'm finally home!", modelo: "Welcome home! Have a lovely evening." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Qual é a despedida mais comum na porta?", opcoes: [{ texto: "Thank you for flying with us.", certa: true }, { texto: "Go now." }, { texto: "See you never." }], explicacao: "Agradece a escolha da companhia." },
      { pergunta: "Como responder a um elogio?", opcoes: [{ texto: "I know." }, { texto: "That's so kind of you.", certa: true }, { texto: "No, we were bad." }], explicacao: "Aceite o elogio com gentileza." },
      { pergunta: "\"Holiday\" (inglês britânico) é:", opcoes: [{ texto: "feriado apenas" }, { texto: "férias", certa: true }, { texto: "hotel" }], explicacao: "Holiday (GB) = vacation (US) = férias." },
      { pergunta: "\"Safe travels!\" é dito para:", opcoes: [{ texto: "quem ainda vai seguir viagem", certa: true }, { texto: "quem chegou em casa" }, { texto: "quem reclamou" }], explicacao: "Deseja boa viagem a quem continua viajando." },
      { pergunta: "\"Stay\" em \"Have a great stay\" é:", opcoes: [{ texto: "estadia", certa: true }, { texto: "fique" }, { texto: "pare" }], explicacao: "Stay (substantivo) = estadia." },
    ],
  },
];
