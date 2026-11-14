import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 4 · Servicio a bordo. Conteúdo original Cabin Crew. */
export const MODULO_ES_4: AulaIngles[] = [
  /* ------------------------------------------------------------------ 4.1 */
  {
    modulo: 4,
    numero: 1,
    titulo: "Servindo bebidas",
    tituloEn: "¿Qué desea tomar?",
    objetivo: "Oferecer bebidas, entender o pedido e perguntar sobre gelo, limão e açúcar.",
    foto: "/img/ingles/cena-20.jpg",
    fotoAlt: "Comissária serve bebidas com o carrinho no corredor",
    minutos: 15,
    intro:
      "No serviço de bebidas a pergunta-chave é \"¿Qué desea tomar?\". Em espanhol, \"tomar\" é beber. O passageiro pode pedir água com ou sem gás, refrigerante, suco, café ou chá. Preste atenção nos nomes que mudam de país para país.",
    dialogo: {
      titulo: "Con el carrito",
      contexto: "Serviço de bebidas no voo para Bogotá. Diego e Ana empurram o carrinho.",
      personagens: ["Diego", "Ramírez", "Ana", "Fernández", "Mateo"],
      falas: [
        { quem: "Diego", en: "Buenas tardes, señor. ¿Qué desea tomar?", pt: "Boa tarde, senhor. O que deseja beber?" },
        { quem: "Ramírez", en: "Un café, por favor. Con leche y sin azúcar.", pt: "Um café, por favor. Com leite e sem açúcar." },
        { quem: "Diego", en: "Con mucho gusto. Cuidado, está caliente.", pt: "Com muito prazer. Cuidado, está quente." },
        { quem: "Ana", en: "Señora, ¿le ofrezco algo de tomar?", pt: "Senhora, posso lhe oferecer algo para beber?" },
        { quem: "Fernández", en: "Agua sin gas, por favor. ¿Y qué jugos tienen?", pt: "Água sem gás, por favor. E que sucos vocês têm?" },
        { quem: "Ana", en: "Tenemos jugo de naranja, de manzana y de tomate.", pt: "Temos suco de laranja, de maçã e de tomate." },
        { quem: "Mateo", en: "¡Yo quiero una gaseosa!", pt: "Eu quero um refrigerante!" },
        { quem: "Fernández", en: "Mateo, ¿cómo se dice?", pt: "Mateo, como é que se diz?" },
        { quem: "Mateo", en: "¡Una gaseosa, por favor!", pt: "Um refrigerante, por favor!" },
        { quem: "Ana", en: "Aquí tienes. ¿Con hielo?", pt: "Aqui está. Com gelo?" },
        { quem: "Mateo", en: "Sí, ¡con mucho hielo!", pt: "Sim, com muito gelo!" },
      ],
    },
    vocabulario: [
      { en: "tomar / beber", pt: "beber" },
      { en: "agua con gas / sin gas", pt: "água com gás / sem gás" },
      { en: "jugo (zumo, en España)", pt: "suco" },
      { en: "gaseosa / refresco", pt: "refrigerante" },
      { en: "café con leche", pt: "café com leite" },
      { en: "té", pt: "chá" },
      { en: "hielo", pt: "gelo" },
      { en: "azúcar / edulcorante", pt: "açúcar / adoçante" },
    ],
    expressoes: [
      { en: "¿Qué desea tomar?", pt: "O que deseja beber?", uso: "Pergunta padrão no serviço." },
      { en: "¿Le ofrezco algo de tomar?", pt: "Posso oferecer algo para beber?", uso: "Variação educada." },
      { en: "¿Con hielo?", pt: "Com gelo?", uso: "Sempre pergunte para refrigerantes e sucos." },
      { en: "Cuidado, está caliente.", pt: "Cuidado, está quente.", uso: "Ao entregar café e chá." },
      { en: "Con mucho gusto.", pt: "Com muito prazer / Às ordens.", uso: "Resposta simpática muito usada na Colômbia e no México." },
    ],
    dica: "Suco: \"jugo\" na América Latina, \"zumo\" na Espanha. Refrigerante: \"gaseosa\" (Argentina, Colômbia), \"refresco\" (México, Espanha). E cuidado: \"tomar\" é beber; \"pegar um avião\" é \"tomar un avión\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cómo toma el café el señor Ramírez?", opcoes: [{ texto: "Con leche y sin azúcar", certa: true }, { texto: "Solo y con azúcar" }, { texto: "Con leche y azúcar" }], explicacao: "\"Con leche y sin azúcar.\"" },
          { pergunta: "¿Qué jugos tienen?", opcoes: [{ texto: "Naranja, uva y piña" }, { texto: "Naranja, manzana y tomate", certa: true }, { texto: "Solo naranja" }], explicacao: "\"Jugo de naranja, de manzana y de tomate.\"" },
          { pergunta: "¿Qué pide Mateo?", opcoes: [{ texto: "Agua" }, { texto: "Jugo de manzana" }, { texto: "Una gaseosa con hielo", certa: true }], explicacao: "Ele pede uma \"gaseosa\" com muito gelo." },
        ],
      },
      { tipo: "ditado", frases: ["¿Qué desea tomar?", "Agua sin gas, por favor.", "Cuidado, está caliente."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o atendimento na ordem.",
        falas: ["Buenas tardes. ¿Qué desea tomar?", "¿Qué jugos tienen?", "Tenemos naranja y manzana.", "Naranja, por favor.", "¿Con hielo?"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue o espanhol ao português.",
        pares: [
          ["hielo", "gelo"],
          ["zumo / jugo", "suco"],
          ["gaseosa", "refrigerante"],
          ["té", "chá"],
          ["caliente", "quente"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿Qué desea ___?", resposta: "tomar", aceitas: ["beber"] },
          { frase: "Agua sin ___, por favor.", resposta: "gas" },
          { frase: "Un café con ___ y sin azúcar.", resposta: "leche" },
          { frase: "¿Con ___?", resposta: "hielo", dica: "gelo" },
          { frase: "Cuidado, está ___.", resposta: "caliente" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Buenas tardes. ¿Qué desea tomar?", pt: "Boa tarde. O que deseja beber?" },
          { en: "Tenemos jugo de naranja, de manzana y de tomate.", pt: "Temos suco de laranja, de maçã e de tomate." },
          { en: "Cuidado, el café está caliente.", pt: "Cuidado, o café está quente." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Você está com o carrinho de bebidas.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(Passageira olha para o carrinho.)", modelo: "Buenos días, señora. ¿Qué desea tomar?" },
          { outro: "¿Tienen té?", modelo: "Sí, tenemos té negro y té verde." },
          { outro: "Un té verde, por favor.", modelo: "¿Con azúcar o edulcorante?" },
          { outro: "Sin nada, gracias.", modelo: "Aquí tiene. Cuidado, está caliente." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Em espanhol, \"tomar\" no serviço de bordo significa:", opcoes: [{ texto: "Pegar" }, { texto: "Beber", certa: true }, { texto: "Retirar" }], explicacao: "\"¿Qué desea tomar?\" = O que deseja beber?" },
      { pergunta: "Como se diz suco na Espanha?", opcoes: [{ texto: "jugo" }, { texto: "zumo", certa: true }, { texto: "suco" }], explicacao: "\"Zumo\" na Espanha; \"jugo\" na América Latina." },
      { pergunta: "\"Hielo\" é:", opcoes: [{ texto: "Gelo", certa: true }, { texto: "Gelado" }, { texto: "Leite" }], explicacao: "\"¿Con hielo?\" = Com gelo?" },
      { pergunta: "O que dizer ao entregar café?", opcoes: [{ texto: "Cuidado, está caliente.", certa: true }, { texto: "Cuidado, está calor." }, { texto: "Cuidado, está frío." }], explicacao: "\"Caliente\" = quente (para objetos e bebidas)." },
      { pergunta: "\"Refrigerante\" no México:", opcoes: [{ texto: "refrigerante" }, { texto: "refresco", certa: true }, { texto: "nevera" }], explicacao: "\"Refresco\" no México e na Espanha; \"gaseosa\" na Argentina e Colômbia." },
    ],
  },

  /* ------------------------------------------------------------------ 4.2 */
  {
    modulo: 4,
    numero: 2,
    titulo: "Refeições: frango ou massa?",
    tituloEn: "¿Pollo o pasta?",
    objetivo: "Oferecer as opções de refeição, explicar os pratos e lidar com uma opção que acabou.",
    foto: "/img/ingles/cena-19.jpg",
    fotoAlt: "Comissária serve o jantar a um passageiro durante o voo",
    minutos: 15,
    intro:
      "Na hora da refeição você oferece as opções, descreve o prato e, às vezes, precisa dizer que uma opção acabou. Diga com educação e ofereça a alternativa: \"Lo siento, se nos acabó el pollo. ¿Le gustaría la pasta?\".",
    dialogo: {
      titulo: "La cena",
      contexto: "Jantar no voo para Madri. Sofía serve o senhor Ortega e depois Valeria.",
      personagens: ["Sofía", "Ortega", "Valeria"],
      falas: [
        { quem: "Sofía", en: "Buenas noches. Para la cena tenemos pollo con arroz o pasta con salsa de tomate. ¿Qué prefiere?", pt: "Boa noite. Para o jantar temos frango com arroz ou massa com molho de tomate. O que prefere?" },
        { quem: "Ortega", en: "El pollo, por favor. ¿Y qué hay de postre?", pt: "O frango, por favor. E o que tem de sobremesa?" },
        { quem: "Sofía", en: "Hay un pastel de chocolate. ¿Desea vino con la cena?", pt: "Tem um bolo de chocolate. Deseja vinho com o jantar?" },
        { quem: "Ortega", en: "Sí, un vino tinto, por favor.", pt: "Sim, um vinho tinto, por favor." },
        { quem: "Sofía", en: "Aquí tiene. ¡Que aproveche!", pt: "Aqui está. Bom apetite!" },
        { quem: "Valeria", en: "Hola. Yo también quiero el pollo.", pt: "Oi. Eu também quero o frango." },
        { quem: "Sofía", en: "Lo siento mucho, señorita. Se nos acabó el pollo. ¿Le gustaría la pasta? Está muy rica.", pt: "Sinto muito, senhorita. O frango acabou. Gostaria da massa? Está muito gostosa." },
        { quem: "Valeria", en: "Bueno, está bien. La pasta.", pt: "Bom, tudo bem. A massa." },
        { quem: "Sofía", en: "Gracias por su comprensión. Si quiere más pan, me avisa.", pt: "Obrigada pela compreensão. Se quiser mais pão, me avisa." },
      ],
    },
    vocabulario: [
      { en: "desayuno / almuerzo / cena", pt: "café da manhã / almoço / jantar" },
      { en: "pollo", pt: "frango" },
      { en: "carne / pescado", pt: "carne / peixe" },
      { en: "pasta", pt: "massa" },
      { en: "postre", pt: "sobremesa" },
      { en: "pastel / torta", pt: "bolo / torta" },
      { en: "vino tinto / blanco", pt: "vinho tinto / branco" },
      { en: "pan", pt: "pão" },
    ],
    expressoes: [
      { en: "¿Qué prefiere?", pt: "O que prefere?", uso: "Para oferecer as opções." },
      { en: "¿Qué hay de postre?", pt: "O que tem de sobremesa?", uso: "Pergunta comum do passageiro." },
      { en: "¡Que aproveche!", pt: "Bom apetite!", uso: "Também se diz \"¡Buen provecho!\"." },
      { en: "Se nos acabó el pollo.", pt: "O frango acabou.", uso: "Forma educada de dizer que acabou." },
      { en: "Gracias por su comprensión.", pt: "Obrigado(a) pela compreensão.", uso: "Depois de um pequeno problema." },
    ],
    dica: "\"Pescado\" é o peixe para comer; \"pez\" é o peixe vivo. E falso amigo: \"pastel\" em muitos países é bolo; \"rico\" para comida é gostoso. \"Polvo\" é pó; o polvo do mar é \"pulpo\".",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuáles son las opciones de la cena?", opcoes: [{ texto: "Pollo con arroz o pasta", certa: true }, { texto: "Carne o pescado" }, { texto: "Pollo o pescado" }], explicacao: "\"Pollo con arroz o pasta con salsa de tomate.\"" },
          { pergunta: "¿Qué bebe el señor Ortega?", opcoes: [{ texto: "Vino blanco" }, { texto: "Agua" }, { texto: "Vino tinto", certa: true }], explicacao: "\"Un vino tinto, por favor.\"" },
          { pergunta: "¿Por qué Valeria come pasta?", opcoes: [{ texto: "Es vegetariana" }, { texto: "Se acabó el pollo", certa: true }, { texto: "No le gusta el pollo" }], explicacao: "\"Se nos acabó el pollo.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Qué prefiere?", "Se nos acabó el pollo.", "¡Que aproveche!"] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a oferta da refeição na ordem.",
        falas: ["Buenas noches. Tenemos carne o pescado.", "¿Qué prefiere?", "El pescado, por favor.", "¿Desea vino con la cena?", "No, gracias. Agua."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["postre", "sobremesa"],
          ["pescado", "peixe (comida)"],
          ["pulpo", "polvo (do mar)"],
          ["rico", "gostoso"],
          ["cena", "jantar"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Tenemos pollo o pasta. ¿Qué ___?", resposta: "prefiere" },
          { frase: "¿Qué hay de ___?", resposta: "postre" },
          { frase: "Lo siento, se nos ___ el pollo.", resposta: "acabó", aceitas: ["acabo"] },
          { frase: "¿Le ___ la pasta?", resposta: "gustaría", aceitas: ["gustaria"] },
          { frase: "Gracias por su ___.", resposta: "comprensión", aceitas: ["comprension"] },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Para la cena tenemos pollo o pasta. ¿Qué prefiere?", pt: "Para o jantar temos frango ou massa. O que prefere?" },
          { en: "Lo siento, se nos acabó el pollo. ¿Le gustaría la pasta?", pt: "Sinto muito, o frango acabou. Gostaria da massa?" },
          { en: "¡Que aproveche!", pt: "Bom apetite!" },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Serviço de almoço. Só restou a opção de massa.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Hola. ¿Qué hay para almorzar?", modelo: "Tenemos pasta con salsa de tomate. Lo siento, se nos acabó la carne." },
          { outro: "Ay, qué pena. Bueno, la pasta.", modelo: "Gracias por su comprensión. ¿Qué desea tomar?" },
          { outro: "Un jugo de naranja.", modelo: "Aquí tiene. ¡Que aproveche!" },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Cena\" significa:", opcoes: [{ texto: "Cena de filme" }, { texto: "Jantar", certa: true }, { texto: "Café da manhã" }], explicacao: "Desayuno, almuerzo, cena." },
      { pergunta: "Como dizer que o frango acabou, com educação?", opcoes: [{ texto: "No hay más nada." }, { texto: "Se nos acabó el pollo.", certa: true }, { texto: "El pollo terminó su vida." }], explicacao: "\"Se nos acabó\" é natural e educado." },
      { pergunta: "\"Pescado\" é:", opcoes: [{ texto: "Peixe preparado para comer", certa: true }, { texto: "Pescaria" }, { texto: "Pescoço" }], explicacao: "O peixe vivo é \"pez\"." },
      { pergunta: "\"¡Que aproveche!\" é:", opcoes: [{ texto: "Aproveite a viagem!" }, { texto: "Bom apetite!", certa: true }, { texto: "Aproveite a promoção!" }], explicacao: "Também \"¡Buen provecho!\"." },
      { pergunta: "O que é \"postre\"?", opcoes: [{ texto: "Pôster" }, { texto: "Sobremesa", certa: true }, { texto: "Prato principal" }], explicacao: "\"¿Qué hay de postre?\"" },
    ],
  },

  /* ------------------------------------------------------------------ 4.3 */
  {
    modulo: 4,
    numero: 3,
    titulo: "Refeições especiais e alergias",
    tituloEn: "Comidas especiales y alergias",
    objetivo: "Confirmar refeições especiais e reagir com segurança a um passageiro com alergia.",
    foto: "/img/ingles/cena-24.jpg",
    fotoAlt: "Comissária entrega uma refeição a uma passageira e confere o pedido",
    minutos: 15,
    intro:
      "Refeições especiais (vegetariana, sem glúten, infantil) são entregues primeiro e sempre conferindo nome e assento. Alergias são assunto de segurança: nunca prometa que a comida é \"100% livre\" do alérgeno; informe o que está na embalagem.",
    dialogo: {
      titulo: "Soy alérgica",
      contexto: "Antes do serviço, Ana entrega as refeições especiais. Valeria tem alergia a amendoim.",
      personagens: ["Ana", "Valeria", "Lucía"],
      falas: [
        { quem: "Ana", en: "Disculpe, ¿señorita Castro? Usted pidió una comida especial, ¿verdad?", pt: "Com licença, senhorita Castro? A senhora pediu uma refeição especial, certo?" },
        { quem: "Valeria", en: "Sí, la comida sin gluten. Y además soy alérgica al maní.", pt: "Sim, a refeição sem glúten. E além disso sou alérgica a amendoim." },
        { quem: "Ana", en: "Gracias por avisarnos. ¿Es una alergia grave?", pt: "Obrigada por nos avisar. É uma alergia grave?" },
        { quem: "Valeria", en: "Bastante. Llevo mi autoinyector en la cartera.", pt: "Bastante. Levo meu autoinjetor na bolsa." },
        { quem: "Ana", en: "Muy bien. Voy a informar a la jefa de cabina. No vamos a servir maní en las filas cercanas.", pt: "Muito bem. Vou informar a chefe de cabine. Não vamos servir amendoim nas fileiras próximas." },
        { quem: "Lucía", en: "Señorita, le recomiendo revisar los ingredientes en el paquete. No podemos garantizar que el avión esté libre de maní.", pt: "Senhorita, recomendo conferir os ingredientes na embalagem. Não podemos garantir que o avião esteja livre de amendoim." },
        { quem: "Valeria", en: "Entiendo. Muchas gracias por la atención.", pt: "Entendo. Muito obrigada pela atenção." },
        { quem: "Lucía", en: "Si se siente mal, presione el botón de llamada de inmediato.", pt: "Se sentir mal, aperte o botão de chamada imediatamente." },
      ],
    },
    vocabulario: [
      { en: "comida especial", pt: "refeição especial" },
      { en: "vegetariano / vegano", pt: "vegetariano / vegano" },
      { en: "sin gluten / sin lactosa", pt: "sem glúten / sem lactose" },
      { en: "maní (cacahuete, en España)", pt: "amendoim" },
      { en: "frutos secos", pt: "castanhas, nozes" },
      { en: "ingredientes", pt: "ingredientes" },
      { en: "autoinyector", pt: "autoinjetor (de adrenalina)" },
      { en: "botón de llamada", pt: "botão de chamada" },
    ],
    expressoes: [
      { en: "Usted pidió una comida especial, ¿verdad?", pt: "O(a) senhor(a) pediu uma refeição especial, certo?", uso: "Sempre confirme nome e assento." },
      { en: "Soy alérgico / alérgica a…", pt: "Sou alérgico(a) a…", uso: "\"Alérgico al maní\", \"a los mariscos\"." },
      { en: "¿Es una alergia grave?", pt: "É uma alergia grave?", uso: "Para avaliar o risco." },
      { en: "No podemos garantizar…", pt: "Não podemos garantir…", uso: "Seja honesto(a) sobre o ambiente do avião." },
      { en: "Presione el botón de llamada.", pt: "Aperte o botão de chamada.", uso: "Para qualquer necessidade." },
    ],
    dica: "Amendoim: \"maní\" na América Latina, \"cacahuete\" na Espanha, \"cacahuate\" no México. \"Mariscos\" são frutos do mar. E falso amigo: \"embarazada\" é grávida, não envergonhada (envergonhada é \"avergonzada\").",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué comida pidió Valeria?", opcoes: [{ texto: "Vegetariana" }, { texto: "Sin gluten", certa: true }, { texto: "Infantil" }], explicacao: "\"La comida sin gluten.\"" },
          { pergunta: "¿A qué es alérgica?", opcoes: [{ texto: "Al maní", certa: true }, { texto: "A los mariscos" }, { texto: "A la leche" }], explicacao: "\"Soy alérgica al maní.\"" },
          { pergunta: "¿Qué no puede garantizar la tripulación?", opcoes: [{ texto: "Que la comida esté caliente" }, { texto: "Que el avión esté libre de maní", certa: true }, { texto: "Que haya comida especial" }], explicacao: "Lucía é honesta: não pode garantir ambiente livre de amendoim." },
        ],
      },
      { tipo: "ditado", frases: ["Soy alérgica al maní.", "¿Es una alergia grave?", "Presione el botón de llamada."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a entrega da refeição especial na ordem.",
        falas: ["Disculpe, ¿señor Ramírez?", "Sí, soy yo.", "Usted pidió una comida vegetariana, ¿verdad?", "Sí, exacto.", "Aquí tiene. ¡Buen provecho!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["maní", "amendoim"],
          ["mariscos", "frutos do mar"],
          ["embarazada", "grávida"],
          ["frutos secos", "castanhas"],
          ["sin lactosa", "sem lactose"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Usted ___ una comida especial, ¿verdad?", resposta: "pidió", aceitas: ["pidio"] },
          { frase: "Soy ___ al maní.", resposta: "alérgica", aceitas: ["alergica", "alérgico", "alergico"] },
          { frase: "¿Es una alergia ___?", resposta: "grave" },
          { frase: "No podemos ___ que el avión esté libre de maní.", resposta: "garantizar" },
          { frase: "Presione el botón de ___.", resposta: "llamada" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Usted pidió una comida sin gluten, ¿verdad?", pt: "A senhora pediu uma refeição sem glúten, certo?" },
          { en: "Gracias por avisarnos. ¿Es una alergia grave?", pt: "Obrigado(a) por nos avisar. É uma alergia grave?" },
          { en: "Le recomiendo revisar los ingredientes en el paquete.", pt: "Recomendo conferir os ingredientes na embalagem." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro avisa que tem alergia a frutos do mar.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "Perdón, soy alérgico a los mariscos.", modelo: "Gracias por avisarnos. ¿Es una alergia grave?" },
          { outro: "Sí, bastante.", modelo: "Hoy tenemos pollo o pasta, sin mariscos. Le recomiendo revisar los ingredientes." },
          { outro: "Perfecto, el pollo.", modelo: "Aquí tiene. Si se siente mal, presione el botón de llamada." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Embarazada\" significa:", opcoes: [{ texto: "Envergonhada" }, { texto: "Grávida", certa: true }, { texto: "Embarcada" }], explicacao: "Falso amigo famoso! Envergonhada = \"avergonzada\"." },
      { pergunta: "Amendoim na Espanha:", opcoes: [{ texto: "maní" }, { texto: "cacahuete", certa: true }, { texto: "almendra" }], explicacao: "\"Maní\" na América do Sul, \"cacahuate\" no México." },
      { pergunta: "O que NÃO dizer a um passageiro alérgico?", opcoes: [{ texto: "Le recomiendo revisar los ingredientes." }, { texto: "El avión está 100% libre de maní.", certa: true }, { texto: "Presione el botón si se siente mal." }], explicacao: "Nunca garanta ambiente livre do alérgeno." },
      { pergunta: "\"Mariscos\" são:", opcoes: [{ texto: "Frutos do mar", certa: true }, { texto: "Mariscos de rio só" }, { texto: "Peixes de água doce" }], explicacao: "Camarão, lula, mexilhão…" },
      { pergunta: "Refeições especiais são entregues:", opcoes: [{ texto: "Por último" }, { texto: "Primeiro, conferindo nome e assento", certa: true }, { texto: "Só se o passageiro pedir" }], explicacao: "Confirme sempre: \"¿Señor…? Usted pidió…\"." },
    ],
  },
];
