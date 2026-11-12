import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 5 · Duty-free and payments. Conteúdo original Cabin Crew. */
export const MODULO_5: AulaIngles[] = [
  /* ------------------------------------------------------------------ 5.1 */
  {
    modulo: 5,
    numero: 1,
    titulo: "Vendendo a bordo",
    tituloEn: "Selling on board",
    objetivo: "Apresentar produtos, responder perguntas sobre preço e tamanho e fazer uma sugestão de venda.",
    foto: "/img/ingles/cena-22.jpg",
    fotoAlt: "Comissária apresenta produtos do carrinho de vendas a passageiros",
    minutos: 15,
    intro:
      "Muitas companhias vendem produtos a bordo: perfumes, lanches, fones de ouvido. Vender bem não é insistir: é apresentar com clareza, responder dúvidas e sugerir quando faz sentido.",
    dialogo: {
      titulo: "Duty-free shopping",
      contexto: "No voo internacional, Marco passa com o carrinho de duty-free. Ms. Kim procura um presente.",
      personagens: ["Marco", "Kim"],
      falas: [
        { quem: "Marco", en: "Good afternoon. Would you like to see our duty-free selection?", pt: "Boa tarde. Gostaria de ver a nossa seleção de duty-free?" },
        { quem: "Kim", en: "Yes, actually. I'm looking for a gift for my mother.", pt: "Na verdade, sim. Estou procurando um presente para a minha mãe." },
        { quem: "Marco", en: "Lovely. We have perfumes, skincare and chocolates. What does she like?", pt: "Que legal. Temos perfumes, cuidados com a pele e chocolates. Do que ela gosta?" },
        { quem: "Kim", en: "She likes floral perfumes. How much is this one?", pt: "Ela gosta de perfumes florais. Quanto custa este?" },
        { quem: "Marco", en: "That one is sixty-five dollars for fifty millilitres. It's one of our best-sellers.", pt: "Esse custa sessenta e cinco dólares, o de cinquenta mililitros. É um dos mais vendidos." },
        { quem: "Kim", en: "Is there a smaller size?", pt: "Tem um tamanho menor?" },
        { quem: "Marco", en: "I'm afraid this is the only size on board. Would you like to try it?", pt: "Infelizmente, esse é o único tamanho a bordo. Gostaria de experimentar?" },
        { quem: "Kim", en: "Yes, please. Oh, it's beautiful. I'll take it.", pt: "Sim, por favor. Ah, é lindo. Vou levar." },
        { quem: "Marco", en: "Great choice. If you buy two items, you get ten per cent off. Would you like some chocolates as well?", pt: "Ótima escolha. Comprando dois itens, a senhora ganha dez por cento de desconto. Gostaria de levar chocolates também?" },
        { quem: "Kim", en: "Why not? The dark chocolate, please.", pt: "Por que não? O chocolate amargo, por favor." },
      ],
    },
    vocabulario: [
      { en: "duty-free", pt: "isento de impostos (loja a bordo)" },
      { en: "gift / present", pt: "presente" },
      { en: "perfume / fragrance", pt: "perfume / fragrância" },
      { en: "size", pt: "tamanho" },
      { en: "best-seller", pt: "mais vendido" },
      { en: "discount / per cent off", pt: "desconto / por cento de desconto" },
      { en: "item", pt: "item, produto" },
      { en: "dark chocolate", pt: "chocolate amargo" },
    ],
    expressoes: [
      { en: "Would you like to see our duty-free selection?", pt: "Gostaria de ver nossa seleção de duty-free?", uso: "Convite, sem pressionar." },
      { en: "What does she like?", pt: "Do que ela gosta?", uso: "Pergunta para recomendar o produto certo." },
      { en: "It's one of our best-sellers.", pt: "É um dos mais vendidos.", uso: "Argumento de venda simples." },
      { en: "I'm afraid this is the only size.", pt: "Infelizmente, este é o único tamanho.", uso: "\"I'm afraid\" suaviza uma resposta negativa." },
      { en: "Would you like … as well?", pt: "Gostaria de levar … também?", uso: "Sugestão de um segundo item." },
    ],
    dica: "\"I'm afraid…\" não tem nada a ver com medo aqui: é uma forma educada de dar uma notícia negativa. \"I'm afraid we don't have it\" = \"Infelizmente, não temos\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "Who is the gift for?", opcoes: [{ texto: "Her sister" }, { texto: "Her mother", certa: true }, { texto: "Her friend" }], explicacao: "\"I'm looking for a gift for my mother.\"" },
          { pergunta: "How much is the perfume?", opcoes: [{ texto: "$56" }, { texto: "$65", certa: true }, { texto: "$75" }], explicacao: "\"sixty-five dollars\"" },
          { pergunta: "What is the offer?", opcoes: [{ texto: "10% off for two items", certa: true }, { texto: "A free perfume" }, { texto: "20% off for chocolates" }], explicacao: "\"If you buy two items, you get ten per cent off.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Would you like to see our duty-free selection?", "It's one of our best-sellers.", "I'm afraid this is the only size."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa na ordem certa.",
        falas: ["Would you like to see our duty-free selection?", "Yes. How much is this watch?", "It's one hundred and twenty dollars.", "OK, I'll take it.", "Great choice. Would you like a gift bag as well?"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["gift", "presente"],
          ["best-seller", "mais vendido"],
          ["discount", "desconto"],
          ["size", "tamanho"],
          ["I'm afraid…", "Infelizmente…"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Would you like to ___ our duty-free selection?", resposta: "see" },
          { frase: "How ___ is this perfume?", resposta: "much" },
          { frase: "It's one of our best-___.", resposta: "sellers" },
          { frase: "I'm ___ this is the only size.", resposta: "afraid" },
          { frase: "Would you like some chocolates as ___?", resposta: "well" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Would you like to see our duty-free selection?", pt: "Gostaria de ver a nossa seleção de duty-free?" },
          { en: "It's sixty-five dollars. It's one of our best-sellers.", pt: "Custa sessenta e cinco dólares. É um dos mais vendidos." },
          { en: "If you buy two items, you get ten per cent off.", pt: "Comprando dois itens, você ganha dez por cento de desconto." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro procura um presente para a esposa.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Excuse me, do you sell gifts?", modelo: "Yes, sir. We have perfumes, jewellery and chocolates. Who is it for?" },
          { outro: "For my wife. How much is this necklace?", modelo: "That one is ninety dollars. It's one of our best-sellers." },
          { outro: "Do you have it in gold?", modelo: "I'm afraid we only have it in silver on board." },
          { outro: "That's fine. I'll take it.", modelo: "Great choice. Would you like a gift bag as well?" },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"I'm afraid we don't have it\" significa:", opcoes: [{ texto: "Tenho medo de não ter." }, { texto: "Infelizmente, não temos.", certa: true }, { texto: "Talvez tenha." }], explicacao: "\"I'm afraid\" suaviza a notícia negativa." },
      { pergunta: "Como perguntar o preço?", opcoes: [{ texto: "How much is it?", certa: true }, { texto: "How many is it?" }, { texto: "What cost?" }], explicacao: "\"How much is it?\" ou \"How much does it cost?\"" },
      { pergunta: "\"Best-seller\" é:", opcoes: [{ texto: "o melhor vendedor" }, { texto: "o produto mais vendido", certa: true }, { texto: "a melhor oferta" }], explicacao: "Best-seller = produto mais vendido." },
      { pergunta: "\"Ten per cent off\" é:", opcoes: [{ texto: "10% de desconto", certa: true }, { texto: "10% de taxa" }, { texto: "10 produtos grátis" }], explicacao: "\"Off\" indica desconto." },
      { pergunta: "Qual frase sugere um segundo produto?", opcoes: [{ texto: "Anything else? No? OK." }, { texto: "Would you like some chocolates as well?", certa: true }, { texto: "You must buy two." }], explicacao: "Sugestão educada, sem pressão." },
    ],
  },

  /* ------------------------------------------------------------------ 5.2 */
  {
    modulo: 5,
    numero: 2,
    titulo: "Formas de pagamento",
    tituloEn: "Paying by card or cash",
    objetivo: "Informar as formas de pagamento, moedas aceitas e conduzir o pagamento com cartão.",
    foto: "/img/ingles/cena-23.jpg",
    fotoAlt: "Passageiro paga uma compra a bordo enquanto a comissária segura a máquina de cartão",
    minutos: 15,
    intro:
      "No pagamento, clareza evita confusão: diga o total, a moeda e as formas aceitas. Com cartão, explique o que o passageiro precisa fazer (aproximar, inserir, digitar a senha).",
    dialogo: {
      titulo: "How would you like to pay?",
      contexto: "Mr. Becker compra fones de ouvido e um lanche. Leila conduz o pagamento.",
      personagens: ["Leila", "Becker"],
      falas: [
        { quem: "Leila", en: "So that's the headphones and the sandwich. Your total is thirty-two euros.", pt: "Então são os fones de ouvido e o sanduíche. O total é trinta e dois euros." },
        { quem: "Becker", en: "Can I pay in dollars?", pt: "Posso pagar em dólares?" },
        { quem: "Leila", en: "I'm sorry, we only accept card payments on this flight. We take Visa, Mastercard and American Express.", pt: "Sinto muito, neste voo só aceitamos cartão. Aceitamos Visa, Mastercard e American Express." },
        { quem: "Becker", en: "OK, no problem. Here's my card.", pt: "Tá, sem problema. Aqui está o meu cartão." },
        { quem: "Leila", en: "Thank you. Would you like to pay in euros or in your home currency?", pt: "Obrigada. O senhor prefere pagar em euros ou na moeda do seu país?" },
        { quem: "Becker", en: "In euros, please.", pt: "Em euros, por favor." },
        { quem: "Leila", en: "Sure. Please tap your card here. Or insert it and enter your PIN.", pt: "Claro. Por favor, aproxime o cartão aqui. Ou insira e digite a senha." },
        { quem: "Becker", en: "Done.", pt: "Pronto." },
        { quem: "Leila", en: "It's gone through. Here's your receipt. Enjoy your sandwich!", pt: "Foi aprovado. Aqui está o seu comprovante. Bom lanche!" },
      ],
    },
    vocabulario: [
      { en: "total", pt: "total" },
      { en: "cash", pt: "dinheiro em espécie" },
      { en: "card payment", pt: "pagamento com cartão" },
      { en: "currency", pt: "moeda (de um país)" },
      { en: "to tap", pt: "aproximar (pagamento por aproximação)" },
      { en: "to insert", pt: "inserir" },
      { en: "PIN", pt: "senha do cartão" },
      { en: "receipt", pt: "comprovante, recibo (o p é mudo)" },
    ],
    expressoes: [
      { en: "Your total is…", pt: "O total é…", uso: "Diga o valor e a moeda." },
      { en: "How would you like to pay?", pt: "Como gostaria de pagar?", uso: "Pergunta padrão." },
      { en: "We only accept card payments.", pt: "Só aceitamos cartão.", uso: "Informe as regras do voo." },
      { en: "Please tap your card here.", pt: "Por favor, aproxime o cartão aqui.", uso: "Instrução para pagamento por aproximação." },
      { en: "It's gone through.", pt: "Foi aprovado.", uso: "Quando o pagamento é aceito." },
    ],
    dica: "Atenção à pronúncia: \"receipt\" se diz \"ri-SIIT\", com o p mudo. E \"currency\" é moeda de país (euro, dólar), enquanto \"coin\" é a moeda de metal.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What is the total?", opcoes: [{ texto: "€23" }, { texto: "€32", certa: true }, { texto: "$32" }], explicacao: "\"Your total is thirty-two euros.\"" },
          { pergunta: "Can Mr. Becker pay in dollars cash?", opcoes: [{ texto: "Yes" }, { texto: "No, only by card", certa: true }, { texto: "Only coins" }], explicacao: "\"We only accept card payments on this flight.\"" },
          { pergunta: "Which currency does he choose?", opcoes: [{ texto: "Dollars" }, { texto: "Euros", certa: true }, { texto: "Pounds" }], explicacao: "\"In euros, please.\"" },
        ],
      },
      { tipo: "ditado", frases: ["How would you like to pay?", "Please tap your card here.", "Here's your receipt."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa na ordem certa.",
        falas: ["Your total is eighteen dollars.", "Can I pay by card?", "Of course. Please tap your card here.", "OK. Done.", "It's gone through. Here's your receipt."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["cash", "dinheiro em espécie"],
          ["currency", "moeda de um país"],
          ["coin", "moeda de metal"],
          ["receipt", "comprovante"],
          ["PIN", "senha do cartão"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Your ___ is thirty-two euros.", resposta: "total" },
          { frase: "How would you like to ___?", resposta: "pay" },
          { frase: "We only ___ card payments.", resposta: "accept", aceitas: ["take"] },
          { frase: "Please ___ your card here.", resposta: "tap" },
          { frase: "Here's your ___.", resposta: "receipt" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Your total is twenty-four dollars. How would you like to pay?", pt: "O total é vinte e quatro dólares. Como gostaria de pagar?" },
          { en: "I'm sorry, we only accept card payments on this flight.", pt: "Sinto muito, neste voo só aceitamos cartão." },
          { en: "Please insert your card and enter your PIN.", pt: "Por favor, insira o cartão e digite a senha." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro compra um lanche de 12 dólares e quer pagar em dinheiro, mas o voo só aceita cartão.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "How much is that?", modelo: "Your total is twelve dollars." },
          { outro: "Here's twenty dollars in cash.", modelo: "I'm sorry, sir, we only accept card payments on this flight." },
          { outro: "Oh. OK, here's my card.", modelo: "Thank you. Please tap your card here." },
          { outro: "Is that it?", modelo: "Yes, it's gone through. Here's your receipt." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Cash\" é:", opcoes: [{ texto: "cartão" }, { texto: "dinheiro em espécie", certa: true }, { texto: "caixa" }], explicacao: "Cash = notas e moedas." },
      { pergunta: "\"It's gone through\" significa:", opcoes: [{ texto: "O pagamento foi aprovado.", certa: true }, { texto: "O cartão caiu." }, { texto: "O produto acabou." }], explicacao: "\"Go through\" = ser aprovado (pagamento)." },
      { pergunta: "Como pedir pagamento por aproximação?", opcoes: [{ texto: "Please tap your card here.", certa: true }, { texto: "Please knock your card." }, { texto: "Please put your card down." }], explicacao: "Tap = encostar rapidamente." },
      { pergunta: "\"Currency\" é:", opcoes: [{ texto: "moeda de metal" }, { texto: "moeda de um país (euro, dólar…)", certa: true }, { texto: "corrente" }], explicacao: "Coin = moeda de metal; currency = moeda de um país." },
      { pergunta: "Como se pronuncia \"receipt\"?", opcoes: [{ texto: "Com o p mudo: ri-SIIT", certa: true }, { texto: "re-CEP-it" }, { texto: "RE-cipe" }], explicacao: "O p de receipt é mudo." },
    ],
  },

  /* ------------------------------------------------------------------ 5.3 */
  {
    modulo: 5,
    numero: 3,
    titulo: "Problemas no pagamento",
    tituloEn: "Payment problems",
    objetivo: "Lidar com cartão recusado, troco e produto em falta, mantendo a calma e oferecendo saídas.",
    foto: "/img/ingles/cena-21.jpg",
    fotoAlt: "Comissária atende um passageiro com o carrinho de vendas no corredor",
    minutos: 15,
    intro:
      "Cartão recusado é constrangedor para o passageiro. Fale baixo, sem julgamento, e ofereça alternativas: tentar de novo, outro cartão ou outra forma de pagamento.",
    dialogo: {
      titulo: "Your card has been declined",
      contexto: "Mr. Clarke compra uma garrafa de vinho, mas o pagamento não passa.",
      personagens: ["Tom", "Clarke"],
      falas: [
        { quem: "Tom", en: "I'm sorry, sir. It seems your card has been declined.", pt: "Sinto muito, senhor. Parece que o seu cartão foi recusado." },
        { quem: "Clarke", en: "Really? That's strange. It worked at the airport.", pt: "Sério? Que estranho. Funcionou no aeroporto." },
        { quem: "Tom", en: "Sometimes it's just the connection. Shall we try again?", pt: "Às vezes é só a conexão. Vamos tentar de novo?" },
        { quem: "Clarke", en: "Yes, please.", pt: "Sim, por favor." },
        { quem: "Tom", en: "Hmm, it's still not going through. Do you have another card?", pt: "Hum, ainda não está passando. O senhor tem outro cartão?" },
        { quem: "Clarke", en: "Let me see… Yes, try this one.", pt: "Deixa eu ver… Sim, tenta este." },
        { quem: "Tom", en: "That's worked. Thank you for your patience, sir.", pt: "Esse funcionou. Obrigado pela paciência, senhor." },
        { quem: "Clarke", en: "Oh, and do you have the white wine as well?", pt: "Ah, e vocês têm o vinho branco também?" },
        { quem: "Tom", en: "I'm afraid we've sold out of white wine. I can check the other trolley for you.", pt: "Infelizmente, o vinho branco esgotou. Posso verificar o outro carrinho para o senhor." },
        { quem: "Clarke", en: "That's kind of you. Thanks.", pt: "É gentileza sua. Obrigado." },
      ],
    },
    vocabulario: [
      { en: "declined", pt: "recusado (cartão)" },
      { en: "connection", pt: "conexão" },
      { en: "to try again", pt: "tentar de novo" },
      { en: "another card", pt: "outro cartão" },
      { en: "change", pt: "troco" },
      { en: "sold out", pt: "esgotado" },
      { en: "patience", pt: "paciência" },
      { en: "to check", pt: "verificar" },
    ],
    expressoes: [
      { en: "It seems your card has been declined.", pt: "Parece que o seu cartão foi recusado.", uso: "\"It seems\" deixa a frase mais suave." },
      { en: "Shall we try again?", pt: "Vamos tentar de novo?", uso: "Sugestão colaborativa." },
      { en: "Do you have another card?", pt: "O(a) senhor(a) tem outro cartão?", uso: "Alternativa." },
      { en: "Thank you for your patience.", pt: "Obrigado(a) pela paciência.", uso: "Encerra o problema com gentileza." },
      { en: "We've sold out of…", pt: "O/A … esgotou.", uso: "Quando o produto acabou." },
    ],
    dica: "Fale baixo quando um cartão for recusado. Outros passageiros não precisam ouvir. E nunca sugira que o passageiro não tem dinheiro: culpe a conexão ou o sistema.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "What happened to the first card?", opcoes: [{ texto: "It was declined.", certa: true }, { texto: "It was lost." }, { texto: "It was broken." }], explicacao: "\"It seems your card has been declined.\"" },
          { pergunta: "How does Mr. Clarke finally pay?", opcoes: [{ texto: "In cash" }, { texto: "With another card", certa: true }, { texto: "He doesn't pay." }], explicacao: "\"Do you have another card?\" … \"That's worked.\"" },
          { pergunta: "What has sold out?", opcoes: [{ texto: "Red wine" }, { texto: "White wine", certa: true }, { texto: "Chocolate" }], explicacao: "\"We've sold out of white wine.\"" },
        ],
      },
      { tipo: "ditado", frases: ["It seems your card has been declined.", "Shall we try again?", "Thank you for your patience."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa na ordem certa.",
        falas: ["I'm sorry, it seems your card has been declined.", "Oh no. Can you try again?", "Of course. Hmm, it's still not going through.", "Here, try this one.", "That's worked. Thank you for your patience."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o inglês ao português.",
        pares: [
          ["declined", "recusado"],
          ["sold out", "esgotado"],
          ["change", "troco"],
          ["patience", "paciência"],
          ["to try again", "tentar de novo"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "It ___ your card has been declined.", resposta: "seems" },
          { frase: "Shall we ___ again?", resposta: "try" },
          { frase: "Do you have ___ card?", resposta: "another" },
          { frase: "Thank you for your ___.", resposta: "patience" },
          { frase: "We've sold ___ of white wine.", resposta: "out" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "I'm sorry, it seems your card has been declined.", pt: "Sinto muito, parece que o seu cartão foi recusado." },
          { en: "Shall we try again? Sometimes it's just the connection.", pt: "Vamos tentar de novo? Às vezes é só a conexão." },
          { en: "I'm afraid we've sold out. I can check the other trolley.", pt: "Infelizmente, esgotou. Posso verificar o outro carrinho." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "O cartão da passageira é recusado duas vezes.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Is it OK?", modelo: "I'm sorry, madam. It seems your card has been declined." },
          { outro: "That's impossible!", modelo: "Sometimes it's just the connection. Shall we try again?" },
          { outro: "Yes. Did it work?", modelo: "I'm afraid it's still not going through. Do you have another card?" },
          { outro: "Yes, here.", modelo: "That's worked. Thank you for your patience." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Declined\" (cartão) é:", opcoes: [{ texto: "aprovado" }, { texto: "recusado", certa: true }, { texto: "bloqueado para sempre" }], explicacao: "Declined = recusado." },
      { pergunta: "Qual frase é mais discreta?", opcoes: [{ texto: "YOUR CARD DOESN'T WORK!" }, { texto: "It seems your card has been declined.", certa: true }, { texto: "You have no money?" }], explicacao: "Suave, sem julgamento, em voz baixa." },
      { pergunta: "\"Sold out\" é:", opcoes: [{ texto: "esgotado", certa: true }, { texto: "em promoção" }, { texto: "vendido para fora" }], explicacao: "Sold out = esgotado." },
      { pergunta: "\"Change\" no pagamento é:", opcoes: [{ texto: "troca" }, { texto: "troco", certa: true }, { texto: "câmbio" }], explicacao: "\"Here's your change\" = aqui está o seu troco." },
      { pergunta: "\"Shall we try again?\" é:", opcoes: [{ texto: "Uma sugestão de tentar de novo", certa: true }, { texto: "Uma ordem" }, { texto: "Uma recusa" }], explicacao: "\"Shall we…?\" = vamos…?" },
    ],
  },
];
