import type { AulaIngles } from "@/lib/ingles-a-bordo";

/**
 * Módulo 8 · Emergencies. Conteúdo original Cabin Crew.
 * Foco no idioma: os comandos e procedimentos oficiais são os do manual de cada companhia.
 */
export const MODULO_8: AulaIngles[] = [
  /* ------------------------------------------------------------------ 8.1 */
  {
    modulo: 8,
    numero: 1,
    titulo: "Turbulência",
    tituloEn: "Turbulence",
    objetivo: "Entender os avisos de turbulência, orientar os passageiros e interromper o serviço com segurança.",
    foto: "/img/ingles/cena-12.jpg",
    fotoAlt: "Comissária confere os bagageiros e orienta os passageiros",
    minutos: 15,
    intro:
      "A turbulência é a situação \"anormal\" mais comum. O comandante avisa, a tripulação reforça o cinto e, se for forte, todos se sentam, inclusive os comissários. Frases curtas e firmes, sem alarmar.",
    dialogo: {
      titulo: "Please return to your seats",
      contexto: "No meio do serviço, o comandante avisa sobre turbulência. Grace faz o anúncio e Tom orienta um passageiro.",
      personagens: ["Captain", "Grace", "Tom", "Becker"],
      falas: [
        { quem: "Captain", en: "Ladies and gentlemen, we're expecting some turbulence in the next few minutes. Please return to your seats and fasten your seatbelts.", pt: "Senhoras e senhores, esperamos alguma turbulência nos próximos minutos. Por favor, voltem aos seus assentos e afivelem os cintos." },
        { quem: "Grace", en: "Cabin crew, please secure the cabin and take your seats.", pt: "Tripulação, por favor, protejam a cabine e sentem-se." },
        { quem: "Tom", en: "Sir, please return to your seat. The seatbelt sign is on.", pt: "Senhor, por favor, volte ao seu assento. O aviso de cinto está aceso." },
        { quem: "Becker", en: "I just need the lavatory. It's urgent.", pt: "Eu só preciso ir ao banheiro. É urgente." },
        { quem: "Tom", en: "I'm sorry, sir. It isn't safe right now. Please wait until the sign is off.", pt: "Sinto muito, senhor. Não é seguro agora. Por favor, espere o aviso apagar." },
        { quem: "Becker", en: "How long will it take?", pt: "Quanto tempo vai demorar?" },
        { quem: "Tom", en: "Hopefully just a few minutes. I'll let you know as soon as it's safe.", pt: "Espero que só alguns minutos. Eu aviso o senhor assim que for seguro." },
        { quem: "Grace", en: "Ladies and gentlemen, the captain has switched on the seatbelt sign. Please make sure your seatbelt is securely fastened. Our service will continue shortly.", pt: "Senhoras e senhores, o comandante acendeu o aviso de cinto. Por favor, verifiquem se o cinto está bem afivelado. O nosso serviço continuará em breve." },
      ],
    },
    vocabulario: [
      { en: "turbulence", pt: "turbulência" },
      { en: "seatbelt sign", pt: "aviso de atar cintos" },
      { en: "to switch on / off", pt: "ligar / desligar (acender / apagar)" },
      { en: "to secure the cabin", pt: "proteger a cabine (guardar carrinhos e objetos)" },
      { en: "to take your seat", pt: "sentar-se" },
      { en: "securely fastened", pt: "bem afivelado" },
      { en: "shortly", pt: "em breve" },
      { en: "urgent", pt: "urgente" },
    ],
    expressoes: [
      { en: "Please return to your seat.", pt: "Por favor, volte ao seu assento.", uso: "Pedido firme e educado." },
      { en: "The seatbelt sign is on.", pt: "O aviso de cinto está aceso.", uso: "O motivo do pedido." },
      { en: "It isn't safe right now.", pt: "Não é seguro agora.", uso: "Explica a negativa." },
      { en: "I'll let you know as soon as it's safe.", pt: "Eu aviso assim que for seguro.", uso: "Dá ao passageiro uma perspectiva." },
      { en: "Our service will continue shortly.", pt: "O nosso serviço continuará em breve.", uso: "Tranquiliza no anúncio." },
    ],
    dica: "Em turbulência forte, a prioridade do comissário também é se sentar e afivelar o cinto. O passageiro que insiste em levantar deve ser orientado com firmeza, e o caso reportado ao chefe de cabine.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What does the captain ask passengers to do?", opcoes: [{ texto: "Return to their seats and fasten their seatbelts", certa: true }, { texto: "Prepare for landing" }, { texto: "Put on their life jackets" }], explicacao: "\"Please return to your seats and fasten your seatbelts.\"" },
          { pergunta: "What does Mr. Becker want?", opcoes: [{ texto: "Water" }, { texto: "The lavatory", certa: true }, { texto: "To change seats" }], explicacao: "\"I just need the lavatory.\"" },
          { pergunta: "When will the service continue?", opcoes: [{ texto: "After landing" }, { texto: "Shortly", certa: true }, { texto: "In an hour" }], explicacao: "\"Our service will continue shortly.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Please return to your seat.", "The seatbelt sign is on.", "It isn't safe right now."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa na ordem certa.",
        falas: ["Excuse me, madam. Please return to your seat.", "Why? I'm just stretching my legs.", "The seatbelt sign is on. We're expecting turbulence.", "Oh, OK. Sorry.", "Thank you. I'll let you know when it's safe."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["seatbelt sign", "aviso de cinto"],
          ["shortly", "em breve"],
          ["to switch on", "acender, ligar"],
          ["securely fastened", "bem afivelado"],
          ["to take your seat", "sentar-se"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Please ___ to your seat.", resposta: "return", aceitas: ["go back"] },
          { frase: "The seatbelt ___ is on.", resposta: "sign" },
          { frase: "It isn't ___ right now.", resposta: "safe" },
          { frase: "I'll let you know as ___ as it's safe.", resposta: "soon" },
          { frase: "Our service will continue ___.", resposta: "shortly" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Sir, please return to your seat. The seatbelt sign is on.", pt: "Senhor, por favor, volte ao seu assento. O aviso de cinto está aceso." },
          { en: "I'm sorry, it isn't safe right now.", pt: "Sinto muito, não é seguro agora." },
          { en: "Please make sure your seatbelt is securely fastened.", pt: "Por favor, verifique se o cinto está bem afivelado." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Aviso de cinto aceso. Uma passageira quer pegar algo no bagageiro.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "I just need my book from the overhead bin.", modelo: "I'm sorry, madam. The seatbelt sign is on. It isn't safe right now." },
          { outro: "It'll only take a second.", modelo: "Things can fall out of the bin in turbulence. Please stay seated." },
          { outro: "OK… When can I get it?", modelo: "As soon as the sign is off. I'll let you know." },
          { outro: "Fine, thanks.", modelo: "Thank you for understanding." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"The seatbelt sign is on\" significa:", opcoes: [{ texto: "O aviso de cinto está aceso.", certa: true }, { texto: "O cinto está no assento." }, { texto: "O aviso quebrou." }], explicacao: "On = aceso, ligado." },
      { pergunta: "\"Secure the cabin\" é:", opcoes: [{ texto: "trancar a porta" }, { texto: "deixar a cabine segura (guardar carrinhos e objetos)", certa: true }, { texto: "chamar a segurança" }], explicacao: "Secure = deixar seguro, fixar." },
      { pergunta: "O passageiro insiste em levantar na turbulência. Você:", opcoes: [{ texto: "deixa, se for rápido" }, { texto: "orienta com firmeza e explica que não é seguro", certa: true }, { texto: "ignora" }], explicacao: "Segurança vem antes." },
      { pergunta: "\"Shortly\" significa:", opcoes: [{ texto: "rapidamente" }, { texto: "em breve", certa: true }, { texto: "curto" }], explicacao: "Shortly = em breve." },
      { pergunta: "Qual frase dá uma perspectiva ao passageiro?", opcoes: [{ texto: "Sit down." }, { texto: "I'll let you know as soon as it's safe.", certa: true }, { texto: "Not now." }], explicacao: "Ele sabe que você vai avisar." },
    ],
  },

  /* ------------------------------------------------------------------ 8.2 */
  {
    modulo: 8,
    numero: 2,
    titulo: "Despressurização",
    tituloEn: "Decompression",
    objetivo: "Reconhecer e usar os comandos curtos de uma despressurização: máscara, cinto e permanecer sentado.",
    foto: "/img/ingles/cena-11.jpg",
    fotoAlt: "Comissária demonstra equipamentos de segurança na cabine",
    minutos: 15,
    intro:
      "Numa despressurização, as máscaras caem e o comissário grita comandos curtos, repetidos, com voz firme. Não há tempo para frases longas. Os comandos oficiais estão no manual da sua companhia; aqui você aprende o vocabulário e o tom.",
    dialogo: {
      titulo: "Masks on!",
      contexto: "Simulação de treinamento. As máscaras caem e Tom dá os comandos. Depois, o comandante fala.",
      personagens: ["Tom", "Captain"],
      falas: [
        { quem: "Tom", en: "Pull down your mask! Put it on!", pt: "Puxe a máscara! Coloque!" },
        { quem: "Tom", en: "Fasten your seatbelt! Stay seated!", pt: "Afivele o cinto! Permaneça sentado!" },
        { quem: "Tom", en: "Put on your own mask first! Then help others!", pt: "Coloque a sua máscara primeiro! Depois ajude os outros!" },
        { quem: "Tom", en: "Breathe normally! Keep your mask on!", pt: "Respire normalmente! Mantenha a máscara!" },
        { quem: "Captain", en: "Ladies and gentlemen, this is the captain. We've had a loss of cabin pressure, and we're descending to a safe altitude.", pt: "Senhoras e senhores, aqui é o comandante. Tivemos uma perda de pressão na cabine e estamos descendo para uma altitude segura." },
        { quem: "Captain", en: "Please keep your masks on until a crew member tells you to remove them.", pt: "Por favor, mantenham as máscaras até que um tripulante diga para retirá-las." },
        { quem: "Tom", en: "Everyone, stay seated. Keep your masks on. We'll tell you when to remove them.", pt: "Todos, permaneçam sentados. Mantenham as máscaras. Nós avisaremos quando retirar." },
      ],
    },
    vocabulario: [
      { en: "decompression", pt: "despressurização" },
      { en: "loss of cabin pressure", pt: "perda de pressão na cabine" },
      { en: "to pull down", pt: "puxar para baixo" },
      { en: "to put on / to remove", pt: "colocar / retirar" },
      { en: "to descend", pt: "descer" },
      { en: "altitude", pt: "altitude" },
      { en: "to stay seated", pt: "permanecer sentado" },
      { en: "command", pt: "comando, ordem" },
    ],
    expressoes: [
      { en: "Pull down your mask!", pt: "Puxe a máscara!", uso: "Comando curto, gritado." },
      { en: "Fasten your seatbelt!", pt: "Afivele o cinto!", uso: "Comando curto." },
      { en: "Put on your own mask first!", pt: "Coloque a sua máscara primeiro!", uso: "Regra essencial." },
      { en: "Keep your mask on!", pt: "Mantenha a máscara!", uso: "Repetir até a ordem de retirar." },
      { en: "We're descending to a safe altitude.", pt: "Estamos descendo para uma altitude segura.", uso: "O que o comandante costuma informar." },
    ],
    dica: "Comandos de emergência são curtos, no imperativo, gritados e repetidos. Não use \"please\" nem frases longas nessa hora: clareza salva tempo.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What happened?", opcoes: [{ texto: "An engine fire" }, { texto: "A loss of cabin pressure", certa: true }, { texto: "Strong turbulence" }], explicacao: "\"We've had a loss of cabin pressure.\"" },
          { pergunta: "What is the plane doing?", opcoes: [{ texto: "Climbing" }, { texto: "Descending to a safe altitude", certa: true }, { texto: "Landing in the sea" }], explicacao: "\"We're descending to a safe altitude.\"" },
          { pergunta: "When can passengers remove their masks?", opcoes: [{ texto: "When a crew member tells them", certa: true }, { texto: "After one minute" }, { texto: "When they want" }], explicacao: "\"Keep your masks on until a crew member tells you to remove them.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Pull down your mask!", "Fasten your seatbelt!", "Keep your mask on!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque os comandos na ordem certa.",
        falas: ["Pull down your mask!", "Put it on!", "Fasten your seatbelt!", "Put on your own mask first!", "Then help others!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["to descend", "descer"],
          ["to remove", "retirar"],
          ["to stay seated", "permanecer sentado"],
          ["loss of pressure", "perda de pressão"],
          ["to pull down", "puxar para baixo"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Pull ___ your mask!", resposta: "down" },
          { frase: "Put on your own mask ___!", resposta: "first" },
          { frase: "Stay ___!", resposta: "seated" },
          { frase: "Keep your mask ___!", resposta: "on" },
          { frase: "We're ___ to a safe altitude.", resposta: "descending" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Pull down your mask! Put it on!", pt: "Puxe a máscara! Coloque!" },
          { en: "Fasten your seatbelt! Stay seated!", pt: "Afivele o cinto! Permaneça sentado!" },
          { en: "Put on your own mask first! Then help others!", pt: "Coloque a sua máscara primeiro! Depois ajude os outros!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Simulação: as máscaras caíram. Responda a cada situação com um comando curto.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A passenger is looking at the mask, confused.)", modelo: "Pull down your mask! Put it on!" },
          { outro: "(A mother is trying to put a mask on her child first.)", modelo: "Put on your own mask first! Then help your child!" },
          { outro: "(A passenger stands up.)", modelo: "Stay seated! Fasten your seatbelt!" },
          { outro: "(A passenger wants to take the mask off.)", modelo: "Keep your mask on! We'll tell you when to remove it." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Como são os comandos de emergência?", opcoes: [{ texto: "Longos e detalhados" }, { texto: "Curtos, firmes e repetidos", certa: true }, { texto: "Sussurrados" }], explicacao: "Clareza e rapidez." },
      { pergunta: "\"To descend\" é:", opcoes: [{ texto: "descer", certa: true }, { texto: "decolar" }, { texto: "desligar" }], explicacao: "Descend = descer; climb = subir." },
      { pergunta: "Quem coloca a máscara primeiro?", opcoes: [{ texto: "A criança" }, { texto: "O adulto responsável", certa: true }, { texto: "Quem estiver mais perto da janela" }], explicacao: "Primeiro a sua, depois ajude os outros." },
      { pergunta: "\"Keep your mask on\" significa:", opcoes: [{ texto: "Mantenha a máscara colocada.", certa: true }, { texto: "Guarde a máscara." }, { texto: "Ligue a máscara." }], explicacao: "Keep … on = manter colocado." },
      { pergunta: "Onde estão os comandos oficiais que você vai usar?", opcoes: [{ texto: "No manual da sua companhia", certa: true }, { texto: "Em qualquer site" }, { texto: "Você inventa na hora" }], explicacao: "Os comandos variam por companhia; siga o manual." },
    ],
  },

  /* ------------------------------------------------------------------ 8.3 */
  {
    modulo: 8,
    numero: 3,
    titulo: "Pouso de emergência e posição de impacto",
    tituloEn: "Emergency landing and brace position",
    objetivo: "Entender o anúncio de preparação para pouso de emergência e os comandos de posição de impacto.",
    foto: "/img/ingles/cena-13.jpg",
    fotoAlt: "Comissária indica uma saída e orienta os passageiros",
    minutos: 18,
    intro:
      "Num pouso de emergência planejado, a tripulação prepara a cabine e ensina a posição de impacto (brace position). Na hora do impacto, os comandos são curtos e repetidos. Treine o vocabulário para entender o manual e o treinamento.",
    dialogo: {
      titulo: "Prepare the cabin",
      contexto: "Simulação de treinamento. Grace faz o anúncio de preparação e Ana demonstra a posição de impacto.",
      personagens: ["Grace", "Ana"],
      falas: [
        { quem: "Grace", en: "Ladies and gentlemen, the captain has asked us to prepare for an emergency landing. Please listen carefully to the crew.", pt: "Senhoras e senhores, o comandante pediu que nos preparemos para um pouso de emergência. Por favor, ouçam com atenção a tripulação." },
        { quem: "Grace", en: "Please remove high-heeled shoes, glasses and sharp objects, and put them in the seat pocket in front of you.", pt: "Por favor, retirem sapatos de salto alto, óculos e objetos pontiagudos, e coloquem no bolso do assento à frente." },
        { quem: "Grace", en: "Fasten your seatbelt tight and low across your hips.", pt: "Afivelem o cinto bem apertado e baixo, na altura do quadril." },
        { quem: "Ana", en: "This is the brace position. Feet flat on the floor. Lean forward. Put your head against the seat in front, with your hands on your head.", pt: "Esta é a posição de impacto. Pés apoiados no chão. Incline-se para a frente. Encoste a cabeça no assento da frente, com as mãos sobre a cabeça." },
        { quem: "Grace", en: "When you hear the command \"Brace\", take the brace position and stay in it until the aircraft stops completely.", pt: "Quando ouvirem o comando \"Brace\", adotem a posição de impacto e permaneçam nela até a aeronave parar completamente." },
        { quem: "Ana", en: "Brace! Brace! Heads down! Stay down!", pt: "Posição de impacto! Posição de impacto! Cabeça abaixada! Fiquem abaixados!" },
        { quem: "Ana", en: "Heads down! Stay down!", pt: "Cabeça abaixada! Fiquem abaixados!" },
      ],
    },
    vocabulario: [
      { en: "emergency landing", pt: "pouso de emergência" },
      { en: "brace position", pt: "posição de impacto" },
      { en: "high-heeled shoes", pt: "sapatos de salto alto" },
      { en: "sharp objects", pt: "objetos pontiagudos ou cortantes" },
      { en: "tight and low", pt: "apertado e baixo" },
      { en: "hips", pt: "quadril" },
      { en: "to lean forward", pt: "inclinar-se para a frente" },
      { en: "to stop completely", pt: "parar completamente" },
    ],
    expressoes: [
      { en: "Please listen carefully to the crew.", pt: "Por favor, ouçam com atenção a tripulação.", uso: "Prepara os passageiros para as instruções." },
      { en: "Remove high-heeled shoes, glasses and sharp objects.", pt: "Retirem sapatos de salto, óculos e objetos pontiagudos.", uso: "Parte da preparação da cabine." },
      { en: "Feet flat on the floor. Lean forward.", pt: "Pés no chão. Incline-se para a frente.", uso: "Instruções da posição de impacto." },
      { en: "Brace! Brace!", pt: "Posição de impacto!", uso: "Comando de impacto (confira o comando oficial da sua companhia)." },
      { en: "Heads down! Stay down!", pt: "Cabeça abaixada! Fiquem abaixados!", uso: "Repetido até a aeronave parar." },
    ],
    dica: "A posição de impacto varia (com ou sem assento à frente, gestantes, crianças de colo). Esta aula ensina o vocabulário; a técnica correta você aprende e pratica no treinamento da companhia.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What should passengers remove?", opcoes: [{ texto: "Their seatbelts" }, { texto: "High heels, glasses and sharp objects", certa: true }, { texto: "Their jackets" }], explicacao: "\"Please remove high-heeled shoes, glasses and sharp objects.\"" },
          { pergunta: "How should the seatbelt be?", opcoes: [{ texto: "Loose and high" }, { texto: "Tight and low across the hips", certa: true }, { texto: "Unfastened" }], explicacao: "\"Fasten your seatbelt tight and low across your hips.\"" },
          { pergunta: "How long should passengers stay in the brace position?", opcoes: [{ texto: "Ten seconds" }, { texto: "Until the aircraft stops completely", certa: true }, { texto: "Until the lights go on" }], explicacao: "\"Stay in it until the aircraft stops completely.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Please listen carefully to the crew.", "Feet flat on the floor.", "Heads down! Stay down!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a preparação na ordem certa.",
        falas: ["The captain has asked us to prepare for an emergency landing.", "Please remove sharp objects and high-heeled shoes.", "Fasten your seatbelt tight and low.", "This is the brace position.", "Stay in it until the aircraft stops completely."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["brace position", "posição de impacto"],
          ["sharp objects", "objetos pontiagudos"],
          ["hips", "quadril"],
          ["to lean forward", "inclinar-se para a frente"],
          ["high-heeled shoes", "sapatos de salto alto"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Please listen ___ to the crew.", resposta: "carefully" },
          { frase: "Fasten your seatbelt tight and ___.", resposta: "low" },
          { frase: "Feet ___ on the floor.", resposta: "flat" },
          { frase: "Lean ___.", resposta: "forward" },
          { frase: "Heads down! Stay ___!", resposta: "down" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Please remove high-heeled shoes, glasses and sharp objects.", pt: "Por favor, retirem sapatos de salto alto, óculos e objetos pontiagudos." },
          { en: "Feet flat on the floor. Lean forward. Hands on your head.", pt: "Pés no chão. Incline-se para a frente. Mãos sobre a cabeça." },
          { en: "Brace! Brace! Heads down! Stay down!", pt: "Posição de impacto! Cabeça abaixada! Fiquem abaixados!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Simulação de preparação. Um passageiro faz perguntas antes do pouso de emergência.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "What should I do with my glasses?", modelo: "Please remove them and put them in the seat pocket in front of you." },
          { outro: "Is my seatbelt OK like this?", modelo: "Please fasten it tight and low across your hips." },
          { outro: "What's the brace position?", modelo: "Feet flat on the floor. Lean forward, head against the seat in front, hands on your head." },
          { outro: "When do I do it?", modelo: "When you hear \"Brace\". Stay down until the aircraft stops completely." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Brace position\" é:", opcoes: [{ texto: "posição de impacto", certa: true }, { texto: "posição de abraço" }, { texto: "posição de dormir" }], explicacao: "Brace = se preparar para um impacto." },
      { pergunta: "Por que tirar sapatos de salto?", opcoes: [{ texto: "Por conforto" }, { texto: "Podem rasgar o escorregador e machucar", certa: true }, { texto: "Por regra de moda" }], explicacao: "Saltos podem danificar o escorregador e causar ferimentos." },
      { pergunta: "\"Tight and low\" se refere a:", opcoes: [{ texto: "como o cinto deve estar", certa: true }, { texto: "a voz do comissário" }, { texto: "a altura da bagagem" }], explicacao: "Cinto apertado e baixo, no quadril." },
      { pergunta: "\"Lean forward\" é:", opcoes: [{ texto: "incline-se para a frente", certa: true }, { texto: "aprenda rápido" }, { texto: "deite para trás" }], explicacao: "Lean = inclinar-se." },
      { pergunta: "Até quando fica na posição de impacto?", opcoes: [{ texto: "Até o comandante falar" }, { texto: "Até a aeronave parar completamente", certa: true }, { texto: "Até contar até dez" }], explicacao: "\"Until the aircraft stops completely.\"" },
    ],
  },

  /* ------------------------------------------------------------------ 8.4 */
  {
    modulo: 8,
    numero: 4,
    titulo: "Comandos de evacuação",
    tituloEn: "Evacuation commands",
    objetivo: "Conhecer os comandos de evacuação em inglês: soltar cintos, deixar tudo, vir por aqui, pular e escorregar.",
    foto: "/img/ingles/cena-05.jpg",
    fotoAlt: "Duas comissárias junto à porta do avião",
    minutos: 15,
    intro:
      "Numa evacuação, cada segundo conta. Os comissários gritam comandos curtos para tirar todos do avião rapidamente. Cada companhia tem a sua lista oficial; os comandos abaixo são exemplos muito usados em treinamentos, para você conhecer o vocabulário.",
    dialogo: {
      titulo: "Evacuate!",
      contexto: "Simulação de treinamento. A aeronave parou e o comandante dá a ordem de evacuação. Tom e Leila comandam as portas.",
      personagens: ["Captain", "Tom", "Leila"],
      falas: [
        { quem: "Captain", en: "Evacuate! Evacuate! Evacuate!", pt: "Evacuar! Evacuar! Evacuar!" },
        { quem: "Tom", en: "Release seatbelts! Get out!", pt: "Soltem os cintos! Saiam!" },
        { quem: "Tom", en: "Leave everything! Come this way!", pt: "Deixem tudo! Venham por aqui!" },
        { quem: "Leila", en: "Jump and slide! Jump and slide!", pt: "Pulem e escorreguem! Pulem e escorreguem!" },
        { quem: "Leila", en: "Move away from the aircraft!", pt: "Afastem-se da aeronave!" },
        { quem: "Tom", en: "This exit is blocked! Go that way!", pt: "Esta saída está bloqueada! Vão por ali!" },
        { quem: "Leila", en: "Hurry! Keep moving!", pt: "Rápido! Continuem andando!" },
      ],
    },
    vocabulario: [
      { en: "to evacuate", pt: "evacuar" },
      { en: "to release", pt: "soltar" },
      { en: "to get out", pt: "sair" },
      { en: "to leave everything", pt: "deixar tudo" },
      { en: "slide", pt: "escorregador (de evacuação)" },
      { en: "blocked", pt: "bloqueado(a)" },
      { en: "to move away", pt: "afastar-se" },
      { en: "to hurry", pt: "apressar-se" },
    ],
    expressoes: [
      { en: "Release seatbelts! Get out!", pt: "Soltem os cintos! Saiam!", uso: "Primeiro comando, logo após a ordem de evacuação." },
      { en: "Leave everything!", pt: "Deixem tudo!", uso: "Bagagem atrasa a evacuação e pode furar o escorregador." },
      { en: "Come this way!", pt: "Venham por aqui!", uso: "Dirige o fluxo até a saída." },
      { en: "Jump and slide!", pt: "Pulem e escorreguem!", uso: "Na porta, para usar o escorregador." },
      { en: "This exit is blocked! Go that way!", pt: "Esta saída está bloqueada! Vão por ali!", uso: "Redireciona os passageiros para outra saída." },
    ],
    dica: "Os comandos de evacuação são decorados no treinamento e testados nos exames práticos. Use a lista oficial da sua companhia; esta aula serve para você entender e pronunciar com segurança.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What is the first command after \"Evacuate\"?", opcoes: [{ texto: "Jump and slide!" }, { texto: "Release seatbelts! Get out!", certa: true }, { texto: "Move away!" }], explicacao: "Primeiro, soltar os cintos e sair." },
          { pergunta: "What should passengers do with their bags?", opcoes: [{ texto: "Take them" }, { texto: "Leave them", certa: true }, { texto: "Throw them out first" }], explicacao: "\"Leave everything!\"" },
          { pergunta: "What does Tom say when an exit can't be used?", opcoes: [{ texto: "This exit is blocked! Go that way!", certa: true }, { texto: "Stop! Wait here!" }, { texto: "Sit down!" }], explicacao: "Ele redireciona os passageiros." },
        ],
      },
      { tipo: "ditado", frases: ["Release seatbelts! Get out!", "Leave everything!", "Jump and slide!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque os comandos na ordem de uma evacuação.",
        falas: ["Evacuate! Evacuate!", "Release seatbelts! Get out!", "Leave everything! Come this way!", "Jump and slide!", "Move away from the aircraft!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["slide", "escorregador"],
          ["blocked", "bloqueada"],
          ["to move away", "afastar-se"],
          ["to release", "soltar"],
          ["to hurry", "apressar-se"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Release seatbelts! Get ___!", resposta: "out" },
          { frase: "Leave ___!", resposta: "everything" },
          { frase: "Come this ___!", resposta: "way" },
          { frase: "Jump and ___!", resposta: "slide" },
          { frase: "This exit is ___! Go that way!", resposta: "blocked" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Release seatbelts! Get out!", pt: "Soltem os cintos! Saiam!" },
          { en: "Leave everything! Come this way!", pt: "Deixem tudo! Venham por aqui!" },
          { en: "Jump and slide! Move away from the aircraft!", pt: "Pulem e escorreguem! Afastem-se da aeronave!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Simulação de evacuação. Responda a cada situação com o comando certo.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(The captain calls \"Evacuate!\")", modelo: "Release seatbelts! Get out!" },
          { outro: "(A passenger is opening the overhead bin.)", modelo: "Leave everything! Come this way!" },
          { outro: "(A passenger stops at the door, afraid of the slide.)", modelo: "Jump and slide! Jump and slide!" },
          { outro: "(Passengers are standing next to the aircraft.)", modelo: "Move away from the aircraft! Keep moving!" },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Leave everything!\" significa:", opcoes: [{ texto: "Deixem tudo!", certa: true }, { texto: "Peguem tudo!" }, { texto: "Saiam todos!" }], explicacao: "Leave = deixar." },
      { pergunta: "Por que deixar a bagagem numa evacuação?", opcoes: [{ texto: "Ela atrasa a saída e pode danificar o escorregador", certa: true }, { texto: "Ela fica mais segura no avião" }, { texto: "A companhia devolve depois" }], explicacao: "Tempo e segurança." },
      { pergunta: "\"Blocked\" é:", opcoes: [{ texto: "bloqueado(a)", certa: true }, { texto: "aberto(a)" }, { texto: "escuro(a)" }], explicacao: "Blocked = bloqueado, sem passagem." },
      { pergunta: "\"Move away from the aircraft\" é dito:", opcoes: [{ texto: "antes de embarcar" }, { texto: "depois que os passageiros saem do avião", certa: true }, { texto: "durante o voo" }], explicacao: "Para afastar os passageiros da aeronave." },
      { pergunta: "Onde está a lista oficial de comandos?", opcoes: [{ texto: "No manual da companhia", certa: true }, { texto: "No cartão de embarque" }, { texto: "Em qualquer filme" }], explicacao: "Cada companhia define os seus comandos." },
    ],
  },
];
