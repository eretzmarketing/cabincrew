"""Inglês para seleções de comissário: vocabulário de aviação, gramática, leitura e situações. Conteúdo original Cabin Crew."""

def Q(enunciado, certa, erradas, explicacao, contexto=None):
    return {"cat": "Inglês", "enunciado": enunciado, "certa": certa, "erradas": erradas, "explicacao": explicacao, "contexto": contexto}

PA_1 = ("Ladies and gentlemen, the captain has turned on the fasten seat belt sign. We are now crossing a zone of "
        "turbulence. Please return to your seats and keep your seat belts fastened. The lavatories should not be used "
        "at this time. Cabin service will resume as soon as conditions improve. Thank you.")

PA_2 = ("Good evening, ladies and gentlemen. Welcome to Lisbon. The local time is 6:25 a.m. and the temperature is "
        "14 degrees Celsius. Please remain seated until the captain switches off the seat belt sign. Passengers "
        "connecting to Madrid should proceed to gate 18. Thank you for flying with us.")

EMAIL = ("Dear Ms. Carter,\nThank you for your application for the Flight Attendant position. We are pleased to invite "
         "you to a group dynamic on Tuesday, May 12, at 9:00 a.m. Please bring your passport, a printed copy of your "
         "résumé and arrive 30 minutes early. Smart casual dress is required.\nKind regards,\nRecruitment Team")

QUESTOES = [
    # ------------------------------------------------------------------ vocabulário de aviação
    Q("What is the \"galley\" on an aircraft?", "The area where food and drinks are prepared", ["The pilots' room", "The baggage hold", "The emergency exit"], "Galley é a cozinha do avião."),
    Q("The \"overhead bin\" is:", "the compartment above the seats for hand luggage", ["the seat pocket", "the cargo hold", "the trolley"], "Overhead bin (ou overhead locker) é o bagageiro acima das poltronas."),
    Q("Which word means \"pouso\"?", "landing", ["take-off", "boarding", "taxiing"], "Landing = pouso. Take-off = decolagem. Boarding = embarque."),
    Q("\"Cockpit\" is another word for:", "flight deck", ["galley", "aisle", "cabin crew"], "Cockpit e flight deck são a cabine de comando."),
    Q("A passenger asks for a \"blanket\". What do you bring?", "Um cobertor", ["Um travesseiro", "Fones de ouvido", "O cardápio"], "Blanket = cobertor. Pillow = travesseiro."),
    Q("What is a \"layover\"?", "A stop between two flights on a journey", ["A delayed flight", "A seat upgrade", "A cancelled flight"], "Layover é a parada entre dois voos (escala longa, conexão com espera)."),
    Q("\"Turbulence\" means:", "irregular air movement that makes the aircraft shake", ["a technical failure in the engine", "a delay at the gate", "a change of runway"], "Turbulência é o movimento irregular do ar."),
    Q("Which item is used in case of a landing on water?", "life vest", ["oxygen mask", "seat belt extension", "fire extinguisher"], "Life vest (life jacket) = colete salva-vidas."),
    Q("The \"aisle seat\" is next to the:", "corridor", ["window", "emergency exit door", "galley"], "Aisle = corredor. Aisle seat é o assento do corredor."),
    Q("\"Boarding pass\" in Portuguese is:", "cartão de embarque", ["passaporte", "bilhete de bagagem", "portão de embarque"], "Boarding pass = cartão de embarque. Gate = portão."),
    Q("What does \"ETA\" stand for?", "Estimated Time of Arrival", ["Expected Take-off Altitude", "Emergency Time Alert", "Extra Travel Allowance"], "ETA = horário estimado de chegada. ETD = horário estimado de partida."),
    Q("The \"purser\" is:", "the senior flight attendant in charge of the cabin", ["the co-pilot", "a ground staff agent", "a passenger with special needs"], "Purser (ou cabin manager) é o chefe de cabine."),
    Q("A \"jet bridge\" is:", "the tunnel that connects the gate to the aircraft", ["a type of engine", "a runway light", "a cockpit instrument"], "Jet bridge (jetway) é a ponte de embarque, o \"finger\"."),
    Q("Which word means \"bagagem despachada\"?", "checked baggage", ["carry-on", "hand luggage", "personal item"], "Checked baggage vai no porão. Carry-on e hand luggage vão na cabine."),
    Q("\"Lavatory\" on an aircraft is the:", "toilet", ["galley", "crew rest area", "exit row"], "Lavatory é o banheiro do avião."),
    Q("If a flight is \"diverted\", it:", "lands at a different airport than planned", ["takes off early", "is cancelled", "changes the gate"], "Divert = desviar para outro aeroporto."),
    Q("\"Duty-free\" products are:", "sold without certain taxes", ["free of charge", "only for crew members", "forbidden on board"], "Duty-free são produtos vendidos sem alguns impostos, não de graça."),
    Q("What do you say to ask a passenger to put the seat in the upright position?", "Could you please bring your seat back to the upright position?", ["Could you please lie down your seat?", "Please put your seat on the floor.", "Can you upright your chair, please?"], "Frase padrão: bring your seat back to the upright position."),

    # ------------------------------------------------------------------ gramática
    Q("Choose the correct option: \"The passengers ___ boarding now.\"", "are", ["is", "be", "am"], "Passengers é plural: they are boarding."),
    Q("Choose the correct option: \"I ___ as a flight attendant since 2021.\"", "have worked", ["work", "worked", "am working"], "Com since + ação que continua até hoje usa-se o present perfect: have worked."),
    Q("Choose the correct option: \"Yesterday the flight ___ two hours late.\"", "arrived", ["arrives", "has arrived", "arriving"], "Yesterday indica passado concluído: simple past (arrived)."),
    Q("Choose the correct option: \"If the weather ___ bad, the flight will be delayed.\"", "is", ["will be", "was", "be"], "Primeira condicional: if + presente, will + verbo."),
    Q("Choose the correct option: \"There ___ two emergency exits on each side.\"", "are", ["is", "has", "have"], "There are + plural (two exits)."),
    Q("Choose the correct option: \"Could you tell me where ___?\"", "the gate is", ["is the gate", "the gate it is", "is it the gate"], "Em pergunta indireta, a ordem é sujeito + verbo: where the gate is."),
    Q("Choose the correct option: \"She is ___ experienced flight attendant on the crew.\"", "the most", ["the more", "most", "more"], "Superlativo de adjetivo longo: the most experienced."),
    Q("Choose the correct option: \"We have ___ time before boarding, so please hurry.\"", "little", ["few", "many", "a few"], "Time é incontável: little (pouco). Few é para contáveis."),
    Q("Choose the correct option: \"The meal ___ served after take-off.\"", "will be", ["will", "is being to", "will being"], "Voz passiva no futuro: will be served."),
    Q("Choose the correct option: \"How ___ bags are you checking in?\"", "many", ["much", "long", "often"], "Bags é contável: how many."),
    Q("Choose the correct option: \"You ___ smoke on board. It is forbidden.\"", "must not", ["don't have to", "mustn't to", "needn't"], "Must not = proibição. Don't have to = não é obrigatório."),
    Q("Choose the correct option: \"The captain asked us ___ our seats.\"", "to return to", ["return", "returning", "to returning"], "Ask someone to do something: asked us to return to our seats."),
    Q("Choose the correct option: \"I'm looking forward ___ you at the interview.\"", "to meeting", ["to meet", "meeting", "for meet"], "Look forward to + verbo com -ing."),
    Q("Choose the correct option: \"By the time we landed, the passengers ___ dinner.\"", "had already had", ["have already had", "already have", "are already having"], "Ação concluída antes de outra no passado: past perfect (had had)."),
    Q("Choose the correct option: \"Neither the captain ___ the first officer was in the cockpit.\"", "nor", ["or", "and", "but"], "Neither ... nor = nem ... nem."),
    Q("Choose the correct option: \"This is the passenger ___ suitcase was lost.\"", "whose", ["who", "which", "who's"], "Whose indica posse: o passageiro cuja mala foi perdida."),
    Q("Choose the correct option: \"Please fasten your seat belt ___ the sign is on.\"", "while", ["during", "for", "meanwhile"], "While + frase (sujeito + verbo). During + substantivo (during the flight)."),
    Q("Choose the correct option: \"I would like ___ a vegetarian meal, please.\"", "to order", ["ordering", "order", "to ordering"], "Would like + to + verbo."),
    Q("Choose the correct option: \"The flight was cancelled ___ the storm.\"", "because of", ["because", "although", "despite of"], "Because of + substantivo. Because + frase."),
    Q("Choose the correct option: \"He has never ___ to Japan.\"", "been", ["went", "gone to be", "go"], "Have been to = já ter ido (e voltado). He has never been to Japan."),

    # ------------------------------------------------------------------ situações a bordo
    Q("A passenger says: \"I'm feeling dizzy.\" What is the best response?", "I'm sorry to hear that. Please sit down and I'll get you some water.", ["That's not my problem.", "Please go to the lavatory.", "We will land soon, so don't worry about it."], "Mostre empatia e ofereça ajuda imediata."),
    Q("A passenger asks: \"Can I use my phone now?\" The aircraft is taxiing. What do you say?", "Yes, but please keep it in flight mode.", ["No, phones are forbidden on all flights.", "Yes, you can make calls during take-off.", "Only if you turn the volume up."], "Hoje a maioria das companhias permite o celular em modo avião."),
    Q("How do you politely tell a passenger that the chicken meal is no longer available?", "I'm afraid we've run out of chicken. Would you like the pasta?", ["There is no chicken, take the pasta.", "The chicken finished.", "You are late for the chicken."], "\"I'm afraid...\" suaviza a má notícia, e você oferece uma alternativa."),
    Q("A passenger in the exit row asks why they must put their bag in the overhead bin. Best answer:", "The exit area must be kept clear in case of an emergency.", ["Because I say so.", "It is more comfortable for you.", "Bags are not allowed on this airline."], "Explique o motivo de segurança com educação."),
    Q("What does \"Would you mind switching seats?\" mean?", "Você se importaria de trocar de assento?", ["Você gostaria de reclinar o assento?", "Seu assento está quebrado?", "Você pode desligar a luz?"], "Would you mind + -ing = você se importaria de..."),
    Q("A passenger complains loudly about a delay. Which response is most professional?", "I completely understand your frustration. I'll update you as soon as I have more information.", ["Calm down, everybody is waiting.", "It's not our fault, it's the airport.", "Please stop shouting at me."], "Valide o sentimento e comprometa-se a informar."),
    Q("Which sentence is a correct way to offer help?", "How may I help you?", ["What do you want?", "Why are you calling me?", "Do you need something or not?"], "How may I help you? é a forma cortês padrão."),
    Q("\"Please stow your tray table\" means:", "feche e trave a mesinha", ["coloque a bandeja no chão", "peça outra bandeja", "abra a mesinha"], "Stow = guardar, recolher. Tray table = mesinha."),
    Q("A passenger asks: \"Where is the nearest exit?\" You point and say:", "It's two rows behind you, on your right.", ["It's behind of you, at right.", "Is two rows back you.", "It stays on the right two rows."], "Behind you (sem of), on your right."),
    Q("Which sentence would you use in an emergency evacuation?", "Release your seat belts! Get out!", ["Would you kindly leave the aircraft?", "Please take your belongings and follow me.", "Excuse me, could you stand up?"], "Em emergência, comandos curtos e firmes, sem bagagem."),
    Q("A passenger says \"I'd like a refill.\" What do they want?", "More of the same drink", ["A new meal", "A blanket", "To change seats"], "Refill = mais da mesma bebida."),
    Q("What is the correct response to \"Thank you for your help\"?", "You're welcome. Enjoy your flight.", ["No thanks.", "You welcome.", "Is nothing."], "You're welcome (com o verbo be)."),

    # ------------------------------------------------------------------ anúncios (leitura)
    Q("According to the announcement, why should passengers return to their seats?", "Because the aircraft is crossing turbulence.", ["Because the plane is about to land.", "Because meals will be served.", "Because the lavatories are closed for cleaning."], "\"We are now crossing a zone of turbulence.\"", contexto=PA_1),
    Q("What does the announcement say about the lavatories?", "They should not be used at this time.", ["They are out of order.", "They can be used normally.", "They will be cleaned."], "\"The lavatories should not be used at this time.\"", contexto=PA_1),
    Q("When will cabin service resume?", "As soon as conditions improve.", ["After landing.", "In ten minutes.", "It will not resume."], "\"Cabin service will resume as soon as conditions improve.\"", contexto=PA_1),
    Q("What is the local time in Lisbon?", "6:25 a.m.", ["6:25 p.m.", "2:25 p.m.", "6:52 a.m."], "\"The local time is 6:25 a.m.\"", contexto=PA_2),
    Q("Where should passengers going to Madrid go?", "To gate 18", ["To gate 80", "To the baggage claim", "To the transfer desk"], "\"Passengers connecting to Madrid should proceed to gate 18.\"", contexto=PA_2),
    Q("Which word in the announcement means \"permanecer\"?", "remain", ["proceed", "switch off", "connect"], "Remain seated = permaneçam sentados.", contexto=PA_2),
    Q("What does the announcement contain that is inconsistent?", "It says \"Good evening\" but the local time is in the morning.", ["The temperature is in Fahrenheit.", "There is no gate number.", "It does not mention the city."], "6:25 a.m. é de manhã, então o correto seria \"Good morning\". Atenção a detalhes como esse nos testes.", contexto=PA_2),

    # ------------------------------------------------------------------ e-mail do recrutamento
    Q("What is Ms. Carter invited to?", "A group dynamic", ["A medical exam", "A final interview", "A training course"], "\"We are pleased to invite you to a group dynamic.\"", contexto=EMAIL),
    Q("What time should Ms. Carter arrive?", "8:30 a.m.", ["9:00 a.m.", "9:30 a.m.", "8:00 a.m."], "A dinâmica é às 9:00 e ela deve chegar 30 minutos antes: 8:30.", contexto=EMAIL),
    Q("Which item is NOT mentioned in the e-mail?", "A photo", ["Passport", "Printed résumé", "Smart casual clothes"], "O e-mail pede passaporte, currículo impresso e traje smart casual. Foto não é mencionada.", contexto=EMAIL),
    Q("\"Kind regards\" in the e-mail is:", "a polite way to end a message", ["a greeting at the beginning", "a request for information", "an apology"], "Kind regards = atenciosamente (encerramento).", contexto=EMAIL),

    # ------------------------------------------------------------------ entrevista
    Q("In an interview, the recruiter says: \"Tell me about yourself.\" What is the best approach?", "Give a short summary of your background, experience and why you want the job.", ["Talk about your family and hobbies for ten minutes.", "Say \"There is nothing special about me.\"", "Read your résumé word by word."], "Resposta curta e profissional: quem você é, experiência e motivação."),
    Q("Which answer best shows teamwork?", "In my last job, I helped a colleague finish a task so our team could meet the deadline.", ["I prefer to work alone because it's faster.", "I always do the work of my colleagues.", "Teamwork is not important to me."], "Dê um exemplo concreto e mostre o resultado para a equipe."),
    Q("\"What are your strengths?\" Which answer is the most appropriate?", "I'm calm under pressure and I enjoy helping people.", ["I don't have any weaknesses.", "I'm perfect for every job.", "I like travelling for free."], "Cite qualidades ligadas à função, sem exageros."),
    Q("How do you say \"Eu tenho experiência com atendimento ao cliente\"?", "I have experience in customer service.", ["I have experiences with client attendance.", "I am experience in customer service.", "I has experience with customer attendance."], "Customer service = atendimento ao cliente. Experience aqui é incontável."),
    Q("Choose the best answer to \"Why do you want to be a flight attendant?\"", "I love working with people and I want a career focused on safety and service.", ["Because I want to travel for free.", "Because the salary is good and the work is easy.", "I don't know, my friend suggested it."], "Mostre motivação ligada à função: pessoas, segurança e serviço."),
    Q("\"I'm a fast learner\" means:", "Eu aprendo rápido.", ["Eu ensino rápido.", "Eu trabalho rápido.", "Eu estudo à noite."], "Fast learner = alguém que aprende rápido."),

    # ------------------------------------------------------------------ números e horas
    Q("How do you say the flight number \"LA 8064\" in the radio/aviation style?", "L A eight zero six four", ["L A eighty sixty-four", "L A eight thousand sixty-four", "L A eight oh sixty-four"], "Em aviação, os números são lidos dígito por dígito."),
    Q("\"Quarter to five\" is:", "4:45", ["5:15", "4:15", "5:45"], "Quarter to five = quinze para as cinco."),
    Q("Seat \"17C\" is read as:", "seventeen C", ["one seven C", "seventy C", "seven teen sea"], "Assentos são lidos como número inteiro + letra: seventeen C."),
    Q("What is \"half past three\"?", "3:30", ["2:30", "3:15", "3:45"], "Half past three = três e meia."),
    Q("The temperature is 30 degrees Celsius. Which sentence is correct?", "It's thirty degrees Celsius.", ["It's thirteen degrees Celsius.", "It has thirty degrees.", "It makes thirty degrees."], "Thirty = 30. Thirteen = 13. Usa-se It's ... degrees."),

    # ------------------------------------------------------------------ falsos cognatos
    Q("\"Actually\" means:", "na verdade", ["atualmente", "exatamente", "realmente agora"], "Falso cognato: actually = na verdade. Atualmente = currently."),
    Q("\"Pretend\" means:", "fingir", ["pretender", "prender", "preparar"], "Falso cognato: pretend = fingir. Pretender = intend."),
    Q("\"Push\" on a door means:", "empurre", ["puxe", "abra", "pressione o botão"], "Push = empurrar. Pull = puxar."),
    Q("\"Exit\" means:", "saída", ["êxito", "entrada", "sucesso"], "Exit = saída. Êxito = success."),
    Q("\"Assist\" in English usually means:", "ajudar", ["assistir a um filme", "sentar", "observar"], "Assist = ajudar. Assistir (TV) = watch."),
]
