import type { AulaIngles } from "@/lib/ingles-a-bordo";

/** Módulo 8 · Aterrizaje y llegada. Conteúdo original Cabin Crew. */
export const MODULO_ES_8: AulaIngles[] = [
  /* ------------------------------------------------------------------ 8.1 */
  {
    modulo: 8,
    numero: 1,
    titulo: "Preparando a cabine para o pouso",
    tituloEn: "Preparación para el aterrizaje",
    objetivo: "Fazer o anúncio de descida, recolher o serviço e conferir a cabine para o pouso.",
    foto: "/img/ingles/cena-25.jpg",
    fotoAlt: "Comissária recolhe a bandeja de uma passageira depois da refeição",
    minutos: 15,
    intro:
      "Uns 30 minutos antes do pouso começa a descida. A tripulação recolhe copos e bandejas, faz o anúncio e repete as checagens da decolagem: cinto, encosto, mesinha, janela e bagagem guardada.",
    dialogo: {
      titulo: "Iniciamos el descenso",
      contexto: "Chegando a Buenos Aires. Lucía faz o anúncio; Diego recolhe o serviço e confere a cabine.",
      personagens: ["Lucía", "Diego", "Fernández", "Mateo"],
      falas: [
        { quem: "Lucía", en: "Señoras y señores, hemos iniciado el descenso hacia Buenos Aires. Aterrizaremos en unos veinte minutos.", pt: "Senhoras e senhores, iniciamos a descida para Buenos Aires. Pousaremos em uns vinte minutos." },
        { quem: "Lucía", en: "Por favor, regresen a sus asientos, abróchense el cinturón y pongan el respaldo en posición vertical.", pt: "Por favor, voltem aos seus assentos, afivelem o cinto e coloquem o encosto na posição vertical." },
        { quem: "Diego", en: "Señora, ¿ya terminó? ¿Me permite la bandeja?", pt: "Senhora, já terminou? Me permite a bandeja?" },
        { quem: "Fernández", en: "Sí, gracias. Y el vaso de Mateo también.", pt: "Sim, obrigada. E o copo do Mateo também." },
        { quem: "Diego", en: "Gracias. Mateo, ¿puedes cerrar tu mesita? Vamos a aterrizar.", pt: "Obrigado. Mateo, você pode fechar a sua mesinha? Vamos pousar." },
        { quem: "Mateo", en: "¿Ya llegamos? ¡Se ven las luces de la ciudad!", pt: "Já chegamos? Dá para ver as luzes da cidade!" },
        { quem: "Diego", en: "¡Casi! Señora, la mochila tiene que ir debajo del asiento, no en el piso.", pt: "Quase! Senhora, a mochila tem que ir embaixo do assento, não no chão." },
        { quem: "Fernández", en: "Perdón, ya la guardo.", pt: "Desculpe, já guardo." },
        { quem: "Lucía", en: "Tripulación, cabina lista para el aterrizaje.", pt: "Tripulação, cabine pronta para o pouso." },
      ],
    },
    vocabulario: [
      { en: "descenso", pt: "descida" },
      { en: "aterrizar", pt: "pousar" },
      { en: "bandeja", pt: "bandeja" },
      { en: "recoger", pt: "recolher" },
      { en: "guardar", pt: "guardar" },
      { en: "piso / suelo", pt: "chão" },
      { en: "listo / lista", pt: "pronto / pronta" },
      { en: "casi", pt: "quase" },
    ],
    expressoes: [
      { en: "Hemos iniciado el descenso.", pt: "Iniciamos a descida.", uso: "Abertura do anúncio de descida." },
      { en: "Aterrizaremos en unos veinte minutos.", pt: "Pousaremos em uns vinte minutos.", uso: "Dê o tempo estimado." },
      { en: "¿Ya terminó?", pt: "Já terminou?", uso: "Antes de recolher a bandeja." },
      { en: "¿Me permite la bandeja?", pt: "Me permite a bandeja?", uso: "Para recolher com educação." },
      { en: "Cabina lista para el aterrizaje.", pt: "Cabine pronta para o pouso.", uso: "Aviso da chefe de cabine para a tripulação." },
    ],
    dica: "\"Ya\" é muito usado: \"¿Ya terminó?\" (já terminou?), \"ya la guardo\" (já guardo). \"Listo\" significa pronto, e não esperto. Chão: \"piso\" na América Latina, \"suelo\" na Espanha.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿En cuánto tiempo aterrizan?", opcoes: [{ texto: "En unos veinte minutos", certa: true }, { texto: "En dos horas" }, { texto: "En cinco minutos" }], explicacao: "\"Aterrizaremos en unos veinte minutos.\"" },
          { pergunta: "¿Qué recoge Diego?", opcoes: [{ texto: "Las mantas" }, { texto: "La bandeja y el vaso", certa: true }, { texto: "Los auriculares" }], explicacao: "Ele recolhe a bandeja e o copo do Mateo." },
          { pergunta: "¿Dónde tiene que ir la mochila?", opcoes: [{ texto: "En el piso" }, { texto: "En el pasillo" }, { texto: "Debajo del asiento", certa: true }], explicacao: "\"Tiene que ir debajo del asiento, no en el piso.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Hemos iniciado el descenso.", "¿Me permite la bandeja?", "Cabina lista para el aterrizaje."] },
      {
        tipo: "ordenar",
        instrucao: "Coloque o anúncio de descida na ordem.",
        falas: ["Señoras y señores,", "hemos iniciado el descenso.", "Aterrizaremos en unos quince minutos.", "Por favor, regresen a sus asientos", "y abróchense el cinturón."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["descenso", "descida"],
          ["listo", "pronto"],
          ["recoger", "recolher"],
          ["suelo", "chão"],
          ["casi", "quase"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Hemos iniciado el ___.", resposta: "descenso" },
          { frase: "___ en unos veinte minutos.", resposta: "Aterrizaremos" },
          { frase: "¿Me permite la ___?", resposta: "bandeja" },
          { frase: "La mochila va debajo del asiento, no en el ___.", resposta: "piso", aceitas: ["suelo"] },
          { frase: "Cabina ___ para el aterrizaje.", resposta: "lista" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Hemos iniciado el descenso. Aterrizaremos en unos veinte minutos.", pt: "Iniciamos a descida. Pousaremos em uns vinte minutos." },
          { en: "¿Ya terminó? ¿Me permite la bandeja?", pt: "Já terminou? Me permite a bandeja?" },
          { en: "Por favor, ponga el respaldo en posición vertical.", pt: "Por favor, coloque o encosto na posição vertical." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Descida. Você confere as fileiras.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(Passageiro dormindo com o encosto reclinado.)", modelo: "Disculpe, señor. Vamos a aterrizar. ¿Podría poner el respaldo vertical?" },
          { outro: "Ah, sí. ¿Ya llegamos?", modelo: "Casi. Aterrizamos en unos quince minutos." },
          { outro: "¿Me retira este vaso?", modelo: "Claro. Y abróchese el cinturón, por favor." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Hemos iniciado el descenso\":", opcoes: [{ texto: "Iniciamos a descida.", certa: true }, { texto: "Iniciamos o serviço." }, { texto: "Descemos do avião." }], explicacao: "\"Descenso\" = descida." },
      { pergunta: "\"Listo\" significa:", opcoes: [{ texto: "Esperto" }, { texto: "Pronto", certa: true }, { texto: "Lista de compras" }], explicacao: "\"Cabina lista\" = cabine pronta." },
      { pergunta: "\"¿Ya terminó?\":", opcoes: [{ texto: "Já terminou?", certa: true }, { texto: "Ainda não terminou?" }, { texto: "Vai terminar?" }], explicacao: "\"Ya\" = já." },
      { pergunta: "Chão na Espanha:", opcoes: [{ texto: "suelo", certa: true }, { texto: "chan" }, { texto: "tierra" }], explicacao: "\"Suelo\" (Espanha), \"piso\" (América Latina)." },
      { pergunta: "Antes do pouso, a mochila vai:", opcoes: [{ texto: "No colo" }, { texto: "Embaixo do assento da frente ou no compartimento", certa: true }, { texto: "No corredor" }], explicacao: "Nunca solta no chão." },
    ],
  },

  /* ------------------------------------------------------------------ 8.2 */
  {
    modulo: 8,
    numero: 2,
    titulo: "Anúncio de chegada e documentos",
    tituloEn: "Bienvenidos a Buenos Aires",
    objetivo: "Fazer o anúncio de chegada: hora local, temperatura, documentos de imigração e bagagem.",
    foto: "/img/ingles/cena-10.jpg",
    fotoAlt: "Família se prepara para desembarcar com ajuda da comissária",
    minutos: 15,
    intro:
      "Depois do pouso, o anúncio de boas-vindas informa a hora local e a temperatura, pede que os passageiros fiquem sentados até o aviso de cintos apagar e lembra dos documentos de imigração.",
    dialogo: {
      titulo: "Anuncio de llegada",
      contexto: "O avião pousou em Buenos Aires. Lucía faz o anúncio e Ana responde a uma pergunta do senhor Ramírez.",
      personagens: ["Lucía", "Ramírez", "Ana"],
      falas: [
        { quem: "Lucía", en: "Señoras y señores, bienvenidos a Buenos Aires. Son las nueve y diez de la noche, hora local, y la temperatura es de dieciocho grados.", pt: "Senhoras e senhores, bem-vindos a Buenos Aires. A hora local é nove e dez da noite e a temperatura é de dezoito graus." },
        { quem: "Lucía", en: "Por su seguridad, permanezcan sentados con el cinturón abrochado hasta que se apague la señal de cinturones.", pt: "Para a sua segurança, permaneçam sentados com o cinto afivelado até o aviso de cintos apagar." },
        { quem: "Lucía", en: "Tengan cuidado al abrir los compartimentos superiores: el equipaje puede haberse movido durante el vuelo.", pt: "Cuidado ao abrir os compartimentos superiores: a bagagem pode ter se movido durante o voo." },
        { quem: "Lucía", en: "Les recordamos tener a mano su pasaporte o documento de identidad para migración.", pt: "Lembramos de ter em mãos o passaporte ou documento de identidade para a imigração." },
        { quem: "Ramírez", en: "Disculpe, ¿necesito llenar algún formulario?", pt: "Com licença, preciso preencher algum formulário?" },
        { quem: "Ana", en: "Para Argentina, la declaración de aduana es solo si trae algo para declarar. Le dejo un formulario por si acaso.", pt: "Para a Argentina, a declaração de alfândega é só se o senhor trouxer algo para declarar. Deixo um formulário por via das dúvidas." },
        { quem: "Ramírez", en: "Gracias. ¿Y dónde recojo mi equipaje?", pt: "Obrigado. E onde retiro minha bagagem?" },
        { quem: "Ana", en: "En la cinta de equipaje, después de migración. El número de la cinta aparece en las pantallas.", pt: "Na esteira de bagagem, depois da imigração. O número da esteira aparece nas telas." },
      ],
    },
    vocabulario: [
      { en: "hora local", pt: "hora local" },
      { en: "temperatura / grados", pt: "temperatura / graus" },
      { en: "pasaporte", pt: "passaporte" },
      { en: "documento de identidad", pt: "documento de identidade" },
      { en: "migración", pt: "imigração" },
      { en: "aduana", pt: "alfândega" },
      { en: "llenar un formulario", pt: "preencher um formulário" },
      { en: "a mano", pt: "à mão, em mãos" },
    ],
    expressoes: [
      { en: "Bienvenidos a…", pt: "Bem-vindos a…", uso: "Abertura do anúncio de chegada." },
      { en: "Son las nueve y diez, hora local.", pt: "São nove e dez, hora local.", uso: "Para horas se usa \"son las\" (e \"es la una\" para 1h)." },
      { en: "Permanezcan sentados.", pt: "Permaneçam sentados.", uso: "Até o aviso de cintos apagar." },
      { en: "Tengan cuidado al abrir los compartimentos.", pt: "Cuidado ao abrir os compartimentos.", uso: "Frase padrão de chegada." },
      { en: "Tengan a mano su pasaporte.", pt: "Tenham o passaporte em mãos.", uso: "Para voos internacionais." },
    ],
    dica: "\"Llenar\" é preencher (formulário) e também encher (copo). Na Espanha se diz \"rellenar un formulario\". E \"aduana\" é a alfândega, diferente de \"migración\" (controle de passaporte).",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué hora es en Buenos Aires?", opcoes: [{ texto: "Las nueve y diez de la noche", certa: true }, { texto: "Las diez y nueve" }, { texto: "Las once y diez" }], explicacao: "\"Son las nueve y diez de la noche, hora local.\"" },
          { pergunta: "¿Qué temperatura hace?", opcoes: [{ texto: "Ocho grados" }, { texto: "Dieciocho grados", certa: true }, { texto: "Veintiocho grados" }], explicacao: "\"Dieciocho grados.\"" },
          { pergunta: "¿Dónde aparece el número de la cinta?", opcoes: [{ texto: "En la tarjeta de embarque" }, { texto: "En las pantallas", certa: true }, { texto: "En el pasaporte" }], explicacao: "\"El número de la cinta aparece en las pantallas.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Bienvenidos a Buenos Aires.", "Permanezcan sentados.", "Tengan a mano su pasaporte."] },
      {
        tipo: "ordenar",
        instrucao: "Monte o anúncio de chegada.",
        falas: ["Bienvenidos a Santiago.", "Son las tres de la tarde, hora local.", "Permanezcan sentados hasta que se apague la señal.", "Tengan cuidado al abrir los compartimentos.", "Gracias por volar con nosotros."],
      },
      {
        tipo: "ligar",
        instrucao: "Ligue as palavras.",
        pares: [
          ["aduana", "alfândega"],
          ["migración", "imigração"],
          ["llenar", "preencher"],
          ["grados", "graus"],
          ["a mano", "em mãos"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "___ a Buenos Aires.", resposta: "Bienvenidos" },
          { frase: "Son las nueve y diez, hora ___.", resposta: "local" },
          { frase: "Permanezcan ___ con el cinturón abrochado.", resposta: "sentados" },
          { frase: "Tengan a ___ su pasaporte.", resposta: "mano" },
          { frase: "¿Necesito ___ algún formulario?", resposta: "llenar", aceitas: ["rellenar"] },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Bienvenidos a Buenos Aires. Son las nueve y diez, hora local.", pt: "Bem-vindos a Buenos Aires. São nove e dez, hora local." },
          { en: "Permanezcan sentados hasta que se apague la señal de cinturones.", pt: "Permaneçam sentados até o aviso de cintos apagar." },
          { en: "Tengan cuidado al abrir los compartimentos superiores.", pt: "Cuidado ao abrir os compartimentos superiores." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Depois do pouso, uma passageira se levanta antes da hora.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(A passageira levanta e abre o bagageiro.)", modelo: "Disculpe, señora. Permanezca sentada, por favor. La señal de cinturones está encendida." },
          { outro: "Ah, perdón. ¿Dónde está migración?", modelo: "Siga las señales al bajar del avión. Tenga a mano su pasaporte." },
          { outro: "¿Y las maletas?", modelo: "En la cinta de equipaje, después de migración." },
        ],
      },
    ],
    quiz: [
      { pergunta: "\"Aduana\" é:", opcoes: [{ texto: "Alfândega", certa: true }, { texto: "Imigração" }, { texto: "Portão" }], explicacao: "Controle de mercadorias. Passaporte = migración." },
      { pergunta: "\"Llenar un formulario\":", opcoes: [{ texto: "Preencher um formulário", certa: true }, { texto: "Ler um formulário" }, { texto: "Levar um formulário" }], explicacao: "Na Espanha: \"rellenar\"." },
      { pergunta: "21h10 no anúncio:", opcoes: [{ texto: "las nueve y diez de la noche", certa: true }, { texto: "las veintiuno y diez" }, { texto: "las diez y nueve de la noche" }], explicacao: "No dia a dia se usa o relógio de 12 horas com \"de la noche\"." },
      { pergunta: "\"Permanezcan sentados\":", opcoes: [{ texto: "Permaneçam sentados", certa: true }, { texto: "Levantem-se" }, { texto: "Sentem-se rápido" }], explicacao: "Até o aviso de cintos apagar." },
      { pergunta: "Por que ter cuidado ao abrir os compartimentos?", opcoes: [{ texto: "A bagagem pode ter se movido", certa: true }, { texto: "Estão trancados" }, { texto: "São de outro passageiro" }], explicacao: "\"El equipaje puede haberse movido durante el vuelo.\"" },
    ],
  },

  /* ------------------------------------------------------------------ 8.3 */
  {
    modulo: 8,
    numero: 3,
    titulo: "Despedida e revisão do voo",
    tituloEn: "¡Gracias por volar con nosotros!",
    objetivo: "Despedir-se dos passageiros na porta e revisar, num voo completo, as frases do curso.",
    foto: "/img/ingles/cena-03.jpg",
    fotoAlt: "Tripulação com malas caminhando no aeroporto em frente ao painel de voos",
    minutos: 18,
    intro:
      "A última impressão também conta. Na porta, agradeça e deseje uma boa estadia. Depois, a tripulação faz o debriefing. Esta aula retoma as frases-chave de todo o curso, do briefing ao desembarque.",
    dialogo: {
      titulo: "En la puerta y el debriefing",
      contexto: "Desembarque em Buenos Aires. Ana e Diego se despedem dos passageiros; depois Lucía faz o debriefing.",
      personagens: ["Ana", "Ramírez", "Diego", "Fernández", "Mateo", "Lucía"],
      falas: [
        { quem: "Ana", en: "Gracias por volar con nosotros, señor Ramírez. ¡Que tenga una buena estadía!", pt: "Obrigada por voar conosco, senhor Ramírez. Tenha uma boa estadia!" },
        { quem: "Ramírez", en: "Gracias a ustedes. Muy buen servicio.", pt: "Obrigado a vocês. Serviço muito bom." },
        { quem: "Diego", en: "¡Chau, Mateo! ¿Te gustó tu primer vuelo?", pt: "Tchau, Mateo! Gostou do seu primeiro voo?" },
        { quem: "Mateo", en: "¡Me encantó! Cuando sea grande quiero ser piloto.", pt: "Amei! Quando eu crescer quero ser piloto." },
        { quem: "Fernández", en: "Muchas gracias por todo. Fueron muy amables.", pt: "Muito obrigada por tudo. Vocês foram muito gentis." },
        { quem: "Diego", en: "Fue un placer, señora. ¡Hasta pronto!", pt: "Foi um prazer, senhora. Até breve!" },
        { quem: "Lucía", en: "Bueno, equipo, buen trabajo hoy. ¿Algo que reportar?", pt: "Bom, equipe, bom trabalho hoje. Algo a relatar?" },
        { quem: "Ana", en: "Sí. El pasajero del 14C se sintió mal, pero se recuperó con oxígeno. Ya está en el informe.", pt: "Sim. O passageiro do 14C passou mal, mas se recuperou com oxigênio. Já está no relatório." },
        { quem: "Lucía", en: "Perfecto, Ana. Para ser tu primer vuelo en español, lo hiciste muy bien.", pt: "Perfeito, Ana. Para o seu primeiro voo em espanhol, você foi muito bem." },
        { quem: "Ana", en: "¡Gracias! Aprendí muchísimo con ustedes.", pt: "Obrigada! Aprendi muitíssimo com vocês." },
      ],
    },
    vocabulario: [
      { en: "despedirse", pt: "despedir-se" },
      { en: "estadía / estancia", pt: "estadia" },
      { en: "¡Chau! / ¡Adiós!", pt: "Tchau!" },
      { en: "¡Hasta pronto!", pt: "Até breve!" },
      { en: "debriefing / reunión final", pt: "debriefing" },
      { en: "reportar", pt: "relatar" },
      { en: "informe", pt: "relatório" },
      { en: "recuperarse", pt: "recuperar-se" },
    ],
    expressoes: [
      { en: "Gracias por volar con nosotros.", pt: "Obrigado(a) por voar conosco.", uso: "Frase padrão na porta." },
      { en: "¡Que tenga una buena estadía!", pt: "Tenha uma boa estadia!", uso: "Na Espanha: \"buena estancia\"." },
      { en: "Fue un placer.", pt: "Foi um prazer.", uso: "Resposta a um agradecimento." },
      { en: "¿Algo que reportar?", pt: "Algo a relatar?", uso: "Pergunta do debriefing." },
      { en: "Lo hiciste muy bien.", pt: "Você foi muito bem.", uso: "Elogio entre colegas (\"tú\")." },
    ],
    dica: "\"Chau\" é tchau na Argentina, no Uruguai e no Chile; na Espanha e no México se diz mais \"adiós\" ou \"hasta luego\". Revisão do curso: \"usted\" com passageiros, \"tú\" com colegas e crianças, e cuidado com os falsos amigos: vaso, embarazada, exquisito, propina, apellido.",
    atividades: [
      {
        tipo: "compreensao",
        questoes: [
          { pergunta: "¿Qué quiere ser Mateo?", opcoes: [{ texto: "Piloto", certa: true }, { texto: "Médico" }, { texto: "Tripulante de cabina" }], explicacao: "\"Cuando sea grande quiero ser piloto.\"" },
          { pergunta: "¿Qué reporta Ana en el debriefing?", opcoes: [{ texto: "Un pasajero que se sintió mal", certa: true }, { texto: "Una maleta perdida" }, { texto: "Un retraso" }], explicacao: "\"El pasajero del 14C se sintió mal.\"" },
          { pergunta: "¿Qué dice Lucía de Ana?", opcoes: [{ texto: "Que necesita estudiar más" }, { texto: "Que lo hizo muy bien", certa: true }, { texto: "Que llegó tarde" }], explicacao: "\"Lo hiciste muy bien.\"" },
        ],
      },
      { tipo: "ditado", frases: ["Gracias por volar con nosotros.", "Fue un placer.", "¿Algo que reportar?"] },
      {
        tipo: "ordenar",
        instrucao: "Revisão: coloque as etapas do voo na ordem.",
        falas: ["Hoy operamos el vuelo a Madrid.", "Buenas tardes, bienvenido a bordo.", "¿Qué desea tomar?", "Hemos iniciado el descenso.", "Gracias por volar con nosotros."],
      },
      {
        tipo: "ligar",
        instrucao: "Revisão de falsos amigos.",
        pares: [
          ["vaso", "copo"],
          ["embarazada", "grávida"],
          ["propina", "gorjeta"],
          ["apellido", "sobrenome"],
          ["exquisito", "delicioso"],
        ],
      },
      {
        tipo: "lacunas",
        itens: [
          { frase: "Gracias por ___ con nosotros.", resposta: "volar" },
          { frase: "¡Que tenga una buena ___!", resposta: "estadía", aceitas: ["estadia", "estancia"] },
          { frase: "Fue un ___, señora.", resposta: "placer" },
          { frase: "¿Algo que ___?", resposta: "reportar" },
          { frase: "Ya está en el ___.", resposta: "informe" },
        ],
      },
      {
        tipo: "falar",
        frases: [
          { en: "Gracias por volar con nosotros. ¡Que tenga una buena estadía!", pt: "Obrigado(a) por voar conosco. Tenha uma boa estadia!" },
          { en: "Fue un placer. ¡Hasta pronto!", pt: "Foi um prazer. Até breve!" },
          { en: "El pasajero del catorce C se sintió mal, pero se recuperó.", pt: "O passageiro do 14C passou mal, mas se recuperou." },
        ],
      },
      {
        tipo: "roleplay",
        situacao: "Revisão final: um voo inteiro em quatro momentos.",
        voce: "Comissário(a)",
        turnos: [
          { outro: "(Embarque) Buenas noches. Tengo el 10A.", modelo: "Buenas noches, bienvenido a bordo. Siga derecho, a la izquierda." },
          { outro: "(Serviço) ¿Qué tienen para tomar?", modelo: "Tenemos agua, jugos, gaseosas, café y té. ¿Qué desea tomar?" },
          { outro: "(Descida) ¿Ya llegamos?", modelo: "Casi. Por favor, abróchese el cinturón y ponga el respaldo vertical." },
          { outro: "(Porta) ¡Muchas gracias!", modelo: "Gracias por volar con nosotros. ¡Que tenga una buena estadía!" },
        ],
      },
    ],
    quiz: [
      { pergunta: "Frase padrão na porta, no desembarque:", opcoes: [{ texto: "Gracias por volar con nosotros.", certa: true }, { texto: "Bienvenido a bordo." }, { texto: "Abróchese el cinturón." }], explicacao: "\"Bienvenido a bordo\" é para o embarque." },
      { pergunta: "Com passageiros adultos você usa:", opcoes: [{ texto: "usted", certa: true }, { texto: "tú" }, { texto: "vos" }], explicacao: "\"Usted\" com passageiros; \"tú\" com colegas e crianças." },
      { pergunta: "\"Informe\" no debriefing é:", opcoes: [{ texto: "Relatório", certa: true }, { texto: "Uniforme" }, { texto: "Informação ao passageiro" }], explicacao: "\"Ya está en el informe.\"" },
      { pergunta: "\"Fue un placer\" responde a:", opcoes: [{ texto: "Um agradecimento", certa: true }, { texto: "Uma reclamação" }, { texto: "Uma pergunta sobre o voo" }], explicacao: "Foi um prazer." },
      { pergunta: "Qual destas palavras é um falso amigo?", opcoes: [{ texto: "pasaporte" }, { texto: "propina", certa: true }, { texto: "temperatura" }], explicacao: "\"Propina\" = gorjeta." },
    ],
  },
];
