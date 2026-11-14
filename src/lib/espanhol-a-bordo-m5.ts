import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 5 · Ventas y comodidad. Conteúdo original Cabin Crew. */
export const MODULO_ES_5: AulaIngles[] = [
  /* ------------------------------------------------------------------ 5.1 */
  {
    modulo: 5,
    numero: 1,
    titulo: "Vendas a bordo e pagamento",
    tituloEn: "Ventas a bordo",
    objetivo: "Vender produtos a bordo, informar preços e receber pagamento com cartão ou dinheiro.",
    foto: "/img/ingles/cena-23.jpg",
    fotoAlt: "Passageiro paga uma compra a bordo enquanto a comissária segura a máquina de cartão",
    minutos: 15,
    intro:
      "Nas vendas a bordo você informa o preço, a moeda aceita e a forma de pagamento. Números e moedas são o centro da conversa: \"Son quince dólares\", \"¿Paga con tarjeta o en efectivo?\".",
    dialogo: {
      titulo: "¿Cuánto cuesta?",
      contexto: "Voo para Santiago. Diego passa com o carrinho de vendas e atende o senhor Ramírez.",
      personagens: ["Diego", "Ramírez"],
      falas: [
        { quem: "Diego", en: "Señoras y señores, en unos minutos pasaremos con el carrito de ventas.", pt: "Senhoras e senhores, em alguns minutos passaremos com o carrinho de vendas." },
        { quem: "Ramírez", en: "Disculpe, ¿cuánto cuesta el perfume?", pt: "Com licença, quanto custa o perfume?" },
        { quem: "Diego", en: "Cuesta cuarenta y cinco dólares. Hoy tiene un diez por ciento de descuento.", pt: "Custa quarenta e cinco dólares. Hoje tem dez por cento de desconto." },
        { quem: "Ramírez", en: "Muy bien, me lo llevo. ¿Aceptan pesos?", pt: "Muito bem, vou levar. Vocês aceitam pesos?" },
        { quem: "Diego", en: "Lo siento, solo aceptamos tarjeta de crédito o débito. ¿Cómo desea pagar?", pt: "Sinto muito, só aceitamos cartão de crédito ou débito. Como deseja pagar?" },
        { quem: "Ramírez", en: "Con tarjeta de crédito.", pt: "Com cartão de crédito." },
        { quem: "Diego", en: "Perfecto. Son cuarenta dólares con cincuenta. Acerque la tarjeta, por favor.", pt: "Perfeito. São quarenta dólares e cinquenta. Aproxime o cartão, por favor." },
        { quem: "Ramírez", en: "¿Así?", pt: "Assim?" },
        { quem: "Diego", en: "Sí, listo. Aprobado. ¿Quiere el recibo?", pt: "Sim, pronto. Aprovado. Quer o comprovante?" },
        { quem: "Ramírez", en: "No, gracias.", pt: "Não, obrigado." },
      ],
    },
    vocabulario: [
      { en: "carrito de ventas", pt: "carrinho de vendas" },
      { en: "precio", pt: "preço" },
      { en: "descuento", pt: "desconto" },
      { en: "tarjeta de crédito / débito", pt: "cartão de crédito / débito" },
      { en: "efectivo", pt: "dinheiro vivo" },
      { en: "cambio / vuelto", pt: "troco" },
      { en: "recibo", pt: "recibo, comprovante" },
      { en: "aprobado / rechazado", pt: "aprovado / recusado" },
    ],
    expressoes: [
      { en: "¿Cuánto cuesta?", pt: "Quanto custa?", uso: "Para um item. Para vários: \"¿Cuánto es todo?\"." },
      { en: "Me lo llevo.", pt: "Vou levar.", uso: "Quando o passageiro decide comprar." },
      { en: "¿Cómo desea pagar?", pt: "Como deseja pagar?", uso: "Pergunte antes de passar o cartão." },
      { en: "Solo aceptamos tarjeta.", pt: "Só aceitamos cartão.", uso: "Muitas companhias não aceitam dinheiro." },
      { en: "Acerque la tarjeta, por favor.", pt: "Aproxime o cartão, por favor.", uso: "Pagamento por aproximação." },
    ],
    dica: "Troco: \"cambio\" na Espanha e no México, \"vuelto\" na Argentina, Chile e Peru. \"Efectivo\" é dinheiro em espécie. Falso amigo: \"cobrar\" é cobrar, mas \"cubrir\" é cobrir. E \"propina\" é gorjeta!",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuánto cuesta el perfume sin descuento?", opcoes: [{ texto: "40 dólares" }, { texto: "45 dólares", certa: true }, { texto: "55 dólares" }], explicacao: "\"Cuesta cuarenta y cinco dólares.\"" },
          { pergunta: "¿Qué formas de pago aceptan?", opcoes: [{ texto: "Pesos y dólares en efectivo" }, { texto: "Solo tarjeta de crédito o débito", certa: true }, { texto: "Cualquier forma" }], explicacao: "\"Solo aceptamos tarjeta de crédito o débito.\"" },
          { pergunta: "¿Quiere el recibo el señor Ramírez?", opcoes: [{ texto: "Sí" }, { texto: "No", certa: true }, { texto: "Por correo" }], explicacao: "\"No, gracias.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Cuánto cuesta?", "¿Cómo desea pagar?", "Solo aceptamos tarjeta."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a venda na ordem.",
        falas: ["¿Cuánto cuesta el chocolate?", "Cuesta ocho dólares.", "Me lo llevo.", "¿Cómo desea pagar?", "Con tarjeta de débito."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["efectivo", "dinheiro vivo"],
          ["vuelto", "troco"],
          ["propina", "gorjeta"],
          ["descuento", "desconto"],
          ["rechazado", "recusado"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿Cuánto ___ el perfume?", resposta: "cuesta" },
          { frase: "Muy bien, me lo ___.", resposta: "llevo" },
          { frase: "¿Cómo desea ___?", resposta: "pagar" },
          { frase: "Solo aceptamos ___ de crédito.", resposta: "tarjeta" },
          { frase: "Hoy tiene un diez por ciento de ___.", resposta: "descuento" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Cuesta cuarenta y cinco dólares.", pt: "Custa quarenta e cinco dólares." },
          { en: "Lo siento, solo aceptamos tarjeta de crédito o débito.", pt: "Sinto muito, só aceitamos cartão de crédito ou débito." },
          { en: "Acerque la tarjeta, por favor.", pt: "Aproxime o cartão, por favor." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro quer comprar um fone de ouvido e pagar em dinheiro.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "¿Cuánto cuestan los auriculares?", modelo: "Cuestan veinte dólares." },
          { outro: "¿Puedo pagar en efectivo?", modelo: "Lo siento, solo aceptamos tarjeta de crédito o débito." },
          { outro: "Bueno, con débito.", modelo: "Perfecto. Acerque la tarjeta, por favor." },
          { outro: "¿Ya está?", modelo: "Sí, aprobado. ¿Quiere el recibo?" },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Efectivo\" é:", opcoes: [{ texto: "Dinheiro em espécie", certa: true }, { texto: "Pagamento efetuado" }, { texto: "Cartão de débito" }], explicacao: "\"¿Paga en efectivo?\" = Paga em dinheiro?" },
      { pergunta: "\"Propina\" em espanhol significa:", opcoes: [{ texto: "Propina, suborno" }, { texto: "Gorjeta", certa: true }, { texto: "Recibo" }], explicacao: "Falso amigo! Suborno é \"soborno\"." },
      { pergunta: "\"Me lo llevo\" quer dizer:", opcoes: [{ texto: "Vou levar.", certa: true }, { texto: "Leve para mim." }, { texto: "Não quero." }], explicacao: "O passageiro decidiu comprar." },
      { pergunta: "Como se diz troco na Argentina?", opcoes: [{ texto: "vuelto", certa: true }, { texto: "troco" }, { texto: "resto" }], explicacao: "\"Vuelto\" (Argentina, Chile); \"cambio\" (Espanha, México)." },
      { pergunta: "\"Son cuarenta dólares con cincuenta\":", opcoes: [{ texto: "US$ 40,50", certa: true }, { texto: "US$ 45" }, { texto: "US$ 450" }], explicacao: "\"Con cincuenta\" = e cinquenta centavos." },
    ],
  },

  /* ------------------------------------------------------------------ 5.2 */
  {
    modulo: 5,
    numero: 2,
    titulo: "Conforto do passageiro",
    tituloEn: "¿Le puedo ayudar en algo?",
    objetivo: "Atender pedidos de conforto: frio, cobertor, travesseiro, fone e luz de leitura.",
    foto: "/img/ingles/cena-16.jpg",
    fotoAlt: "Comissária ajeita o cobertor de uma passageira que descansa",
    minutos: 15,
    intro:
      "Durante o voo a luz de chamada acende e o passageiro pede algo para ficar mais confortável. Responda com \"Enseguida\" (já, em seguida) e cumpra o combinado.",
    dialogo: {
      titulo: "La luz de llamada",
      contexto: "Voo noturno para Lima. Valeria chama a tripulação e Ana atende.",
      personagens: ["Ana", "Valeria"],
      falas: [
        { quem: "Ana", en: "Buenas noches, señorita. ¿Le puedo ayudar en algo?", pt: "Boa noite, senhorita. Posso ajudar em algo?" },
        { quem: "Valeria", en: "Sí, tengo mucho frío. ¿Me podría dar una manta?", pt: "Sim, estou com muito frio. Poderia me dar um cobertor?" },
        { quem: "Ana", en: "Claro. Enseguida se la traigo. ¿Necesita también una almohada?", pt: "Claro. Já trago para a senhora. Precisa também de um travesseiro?" },
        { quem: "Valeria", en: "Sí, por favor. Y los auriculares no funcionan.", pt: "Sim, por favor. E os fones não funcionam." },
        { quem: "Ana", en: "Déjeme ver. Ah, hay que conectarlos aquí, en el reposabrazos.", pt: "Deixe-me ver. Ah, tem que conectar aqui, no apoio de braço." },
        { quem: "Valeria", en: "¡Ahora sí! Gracias. ¿Y cómo enciendo la luz de lectura?", pt: "Agora sim! Obrigada. E como acendo a luz de leitura?" },
        { quem: "Ana", en: "Con este botón, arriba de su asiento. Aquí tiene la manta y la almohada.", pt: "Com este botão, em cima do seu assento. Aqui está o cobertor e o travesseiro." },
        { quem: "Valeria", en: "Muchísimas gracias. Muy amable.", pt: "Muitíssimo obrigada. Muito gentil." },
        { quem: "Ana", en: "Con gusto. Que descanse.", pt: "Com prazer. Descanse bem." },
      ],
    },
    vocabulario: [
      { en: "manta / frazada", pt: "cobertor" },
      { en: "almohada", pt: "travesseiro" },
      { en: "auriculares / audífonos", pt: "fones de ouvido" },
      { en: "luz de lectura", pt: "luz de leitura" },
      { en: "encender / apagar", pt: "acender, ligar / apagar, desligar" },
      { en: "frío / calor", pt: "frio / calor" },
      { en: "funcionar", pt: "funcionar" },
      { en: "enseguida", pt: "já, em seguida" },
    ],
    expressoes: [
      { en: "¿Le puedo ayudar en algo?", pt: "Posso ajudar em algo?", uso: "Ao atender a luz de chamada." },
      { en: "Tengo frío.", pt: "Estou com frio.", uso: "Em espanhol se \"tem\" frio, calor, fome, sede." },
      { en: "Enseguida se la traigo.", pt: "Já trago para o(a) senhor(a).", uso: "\"Se la\" = para a senhora + ela (a manta)." },
      { en: "Déjeme ver.", pt: "Deixe-me ver.", uso: "Antes de checar um problema." },
      { en: "Que descanse.", pt: "Descanse bem.", uso: "Despedida simpática em voos noturnos." },
    ],
    dica: "Em espanhol: \"tener frío/calor/hambre/sed\" (estar com frio, calor, fome, sede). Fones: \"auriculares\" (Espanha, Argentina), \"audífonos\" (México, Colômbia, Chile). Cobertor: \"manta\" ou \"frazada\" (Argentina) ou \"cobija\" (México, Colômbia).",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué le pasa a Valeria?", opcoes: [{ texto: "Tiene calor" }, { texto: "Tiene frío", certa: true }, { texto: "Tiene hambre" }], explicacao: "\"Tengo mucho frío.\"" },
          { pergunta: "¿Cuál es el problema de los auriculares?", opcoes: [{ texto: "Están rotos" }, { texto: "No estaban conectados en el lugar correcto", certa: true }, { texto: "No hay auriculares" }], explicacao: "Era preciso conectar no apoio de braço." },
          { pergunta: "¿Dónde está el botón de la luz?", opcoes: [{ texto: "Arriba del asiento", certa: true }, { texto: "En la mesita" }, { texto: "En la ventanilla" }], explicacao: "\"Con este botón, arriba de su asiento.\"" },
        ],
      },
      { tipo: "ditado", frases: ["¿Le puedo ayudar en algo?", "Tengo mucho frío.", "Enseguida se la traigo."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o atendimento na ordem.",
        falas: ["¿Le puedo ayudar en algo?", "Sí, tengo calor.", "Déjeme ver. Puede abrir esta salida de aire.", "¡Qué bien, gracias!", "Con gusto."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["almohada", "travesseiro"],
          ["manta", "cobertor"],
          ["audífonos", "fones de ouvido"],
          ["encender", "acender"],
          ["enseguida", "já, em seguida"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¿Le puedo ___ en algo?", resposta: "ayudar" },
          { frase: "Tengo mucho ___. ¿Me da una manta?", resposta: "frío", aceitas: ["frio"] },
          { frase: "___ se la traigo.", resposta: "Enseguida" },
          { frase: "¿Cómo ___ la luz de lectura?", resposta: "enciendo" },
          { frase: "Con gusto. Que ___.", resposta: "descanse" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Buenas noches. ¿Le puedo ayudar en algo?", pt: "Boa noite. Posso ajudar em algo?" },
          { en: "Claro. Enseguida se la traigo.", pt: "Claro. Já trago para a senhora." },
          { en: "La luz de lectura se enciende con este botón.", pt: "A luz de leitura acende com este botão." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Um passageiro aperta o botão de chamada.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A luz de chamada acende.)", modelo: "Buenas noches, señor. ¿Le puedo ayudar en algo?" },
          { outro: "¿Me trae una almohada?", modelo: "Claro. Enseguida se la traigo." },
          { outro: "Y la pantalla no funciona.", modelo: "Déjeme ver. Voy a reiniciarla. Un momento, por favor." },
          { outro: "Gracias.", modelo: "Con gusto. Que descanse." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Almohada\" é:", opcoes: [{ texto: "Almofada de sofá" }, { texto: "Travesseiro", certa: true }, { texto: "Cobertor" }], explicacao: "No avião, \"almohada\" é o travesseiro." },
      { pergunta: "Como dizer \"Estou com frio\"?", opcoes: [{ texto: "Estoy frío." }, { texto: "Tengo frío.", certa: true }, { texto: "Hago frío." }], explicacao: "\"Tener frío\". \"Estoy frío\" seria \"estou gelado\" (o corpo)." },
      { pergunta: "\"Enseguida\" significa:", opcoes: [{ texto: "Em seguida, já", certa: true }, { texto: "Depois do pouso" }, { texto: "Ensinado" }], explicacao: "\"Enseguida se lo traigo.\"" },
      { pergunta: "\"Encender la luz\":", opcoes: [{ texto: "Apagar a luz" }, { texto: "Acender a luz", certa: true }, { texto: "Trocar a lâmpada" }], explicacao: "Encender = acender; apagar = apagar." },
      { pergunta: "Fones no México:", opcoes: [{ texto: "audífonos", certa: true }, { texto: "cascos" }, { texto: "fonos" }], explicacao: "\"Audífonos\" no México e Colômbia; \"auriculares\" na Espanha e Argentina." },
    ],
  },

  /* ------------------------------------------------------------------ 5.3 */
  {
    modulo: 5,
    numero: 3,
    titulo: "Crianças a bordo",
    tituloEn: "Niños a bordo",
    objetivo: "Falar com crianças e pais: cinto infantil, kit de atividades e menor desacompanhado.",
    foto: "/img/ingles/cena-18.jpg",
    fotoAlt: "Comissária entrega um brinquedo a uma menina sentada com a família",
    minutos: 15,
    intro:
      "Com crianças, use \"tú\" e uma linguagem simples e animada. Com os pais, continue no \"usted\". Nesta aula você também confere a documentação de um menor desacompanhado na chegada.",
    dialogo: {
      titulo: "Mateo y el kit",
      contexto: "Sofía conversa com Mateo e a mãe dele, a senhora Fernández.",
      personagens: ["Sofía", "Mateo", "Fernández"],
      falas: [
        { quem: "Sofía", en: "¡Hola! ¿Cómo te llamas?", pt: "Oi! Como você se chama?" },
        { quem: "Mateo", en: "Me llamo Mateo. Tengo ocho años.", pt: "Meu nome é Mateo. Tenho oito anos." },
        { quem: "Sofía", en: "¡Qué bien, Mateo! Te traje un kit para colorear. ¿Te gusta dibujar?", pt: "Que legal, Mateo! Trouxe um kit de colorir para você. Você gosta de desenhar?" },
        { quem: "Mateo", en: "¡Sí! ¿Puedo dibujar un avión?", pt: "Sim! Posso desenhar um avião?" },
        { quem: "Sofía", en: "¡Claro! Y si quieres, después del vuelo te muestro la cabina de mando.", pt: "Claro! E se quiser, depois do voo eu te mostro a cabine de comando." },
        { quem: "Fernández", en: "¡Ay, gracias! Está muy emocionado. Es su primer vuelo.", pt: "Ai, obrigada! Ele está muito empolgado. É o primeiro voo dele." },
        { quem: "Sofía", en: "Señora, durante el despegue el niño tiene que estar sentado con el cinturón abrochado.", pt: "Senhora, durante a decolagem o menino tem que estar sentado com o cinto afivelado." },
        { quem: "Fernández", en: "Entendido. Mateo, ¿escuchaste a la señorita?", pt: "Entendido. Mateo, você ouviu a moça?" },
        { quem: "Mateo", en: "¡Sí! Cinturón abrochado, como un piloto.", pt: "Sim! Cinto afivelado, como um piloto." },
      ],
    },
    vocabulario: [
      { en: "niño / niña", pt: "menino / menina, criança" },
      { en: "bebé", pt: "bebê" },
      { en: "cinturón para bebé", pt: "cinto de extensão para bebê" },
      { en: "kit para colorear", pt: "kit de colorir" },
      { en: "dibujar", pt: "desenhar" },
      { en: "juguete", pt: "brinquedo" },
      { en: "cabina de mando", pt: "cabine de comando" },
      { en: "emocionado", pt: "empolgado, animado" },
    ],
    expressoes: [
      { en: "¿Cómo te llamas?", pt: "Como você se chama?", uso: "Com crianças, \"tú\"." },
      { en: "¿Cuántos años tienes?", pt: "Quantos anos você tem?", uso: "Pergunta clássica para crianças." },
      { en: "Te traje un kit.", pt: "Trouxe um kit para você.", uso: "\"Traje\" = trouxe (verbo traer)." },
      { en: "Tiene que estar sentado.", pt: "Tem que estar sentado.", uso: "\"Tener que\" = ter que." },
      { en: "Está muy emocionado.", pt: "Está muito empolgado.", uso: "\"Emocionado\" é animado, empolgado." },
    ],
    dica: "\"Niño\" é criança (também no plural: \"los niños\"). Falso amigo: \"salsa\" é molho, e \"perro\" é cachorro, enquanto \"cachorro\" em espanhol é filhote! Com menor desacompanhado, só entregue a criança à pessoa autorizada, conferindo o documento.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Cuántos años tiene Mateo?", opcoes: [{ texto: "Seis" }, { texto: "Ocho", certa: true }, { texto: "Diez" }], explicacao: "\"Tengo ocho años.\"" },
          { pergunta: "¿Qué quiere dibujar Mateo?", opcoes: [{ texto: "Un avión", certa: true }, { texto: "Un perro" }, { texto: "Su casa" }], explicacao: "\"¿Puedo dibujar un avión?\"" },
          { pergunta: "¿Qué tiene que hacer Mateo en el despegue?", opcoes: [{ texto: "Dormir" }, { texto: "Estar sentado con el cinturón abrochado", certa: true }, { texto: "Ir a la cabina de mando" }], explicacao: "Sofía explica à mãe." },
        ],
      },
      { tipo: "ditado", frases: ["¿Cómo te llamas?", "¿Te gusta dibujar?", "Tiene que estar sentado."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque a conversa com a criança na ordem.",
        falas: ["¡Hola! ¿Cómo te llamas?", "Me llamo Lucas.", "¿Cuántos años tienes?", "Tengo seis años.", "¡Te traje un juguete!"],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue os falsos amigos e palavras.",
        pares: [
          ["perro", "cachorro"],
          ["cachorro", "filhote"],
          ["juguete", "brinquedo"],
          ["dibujar", "desenhar"],
          ["salsa", "molho"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "¡Hola! ¿Cómo te ___?", resposta: "llamas" },
          { frase: "¿Cuántos años ___?", resposta: "tienes" },
          { frase: "Te ___ un kit para colorear.", resposta: "traje" },
          { frase: "¿Te gusta ___?", resposta: "dibujar" },
          { frase: "El niño tiene que estar ___.", resposta: "sentado" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "¡Hola! ¿Cómo te llamas? ¿Cuántos años tienes?", pt: "Oi! Como você se chama? Quantos anos você tem?" },
          { en: "Te traje un kit para colorear.", pt: "Trouxe um kit de colorir para você." },
          { en: "Durante el despegue, el niño tiene que estar sentado.", pt: "Durante a decolagem, a criança tem que estar sentada." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Uma menina viaja com o pai. Fale com ela e com ele.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A menina olha pela janela, animada.)", modelo: "¡Hola! ¿Cómo te llamas?" },
          { outro: "Me llamo Sara. ¡Tengo cinco años!", modelo: "¡Qué bien, Sara! Te traje un kit para colorear." },
          { outro: "(O pai) Gracias. ¿Puede estar sin cinturón?", modelo: "Durante el despegue tiene que estar sentada con el cinturón abrochado, señor." },
        ],
      },
    ],
    quiz: [
      { pergunta: "Com crianças você usa:", opcoes: [{ texto: "tú", certa: true }, { texto: "usted" }, { texto: "ustedes" }], explicacao: "Com crianças, \"tú\"; com os pais, \"usted\"." },
      { pergunta: "\"Cachorro\" em espanhol é:", opcoes: [{ texto: "Cachorro adulto" }, { texto: "Filhote", certa: true }, { texto: "Gato" }], explicacao: "Cachorro (cão) é \"perro\"." },
      { pergunta: "\"Te traje un juguete\":", opcoes: [{ texto: "Trouxe um brinquedo para você.", certa: true }, { texto: "Troque o brinquedo." }, { texto: "Traje de brinquedo." }], explicacao: "\"Traje\" = trouxe; \"juguete\" = brinquedo." },
      { pergunta: "\"Emocionado\" no diálogo quer dizer:", opcoes: [{ texto: "Chorando" }, { texto: "Empolgado", certa: true }, { texto: "Com medo" }], explicacao: "Mateo está animado com o primeiro voo." },
      { pergunta: "\"¿Cuántos años tienes?\":", opcoes: [{ texto: "Quantos anos você tem?", certa: true }, { texto: "Há quantos anos você voa?" }, { texto: "Quando é seu aniversário?" }], explicacao: "Em espanhol se \"tem\" anos, como em português." },
    ],
  },
];
