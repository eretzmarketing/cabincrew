#!/usr/bin/env python3
"""Gera supabase/importacao/0029_aulas_head_hunter_reescritas.sql.

As imagens (infográficos) do curso Head Hunter se perderam no site da Horsky. Estas aulas foram
reescritas em texto completo, no lugar das imagens. As demais aulas do Head Hunter só perdem as
imagens quebradas (o texto delas já é completo).
"""
from pathlib import Path

AULAS = {}

AULAS["72ccb73e-33d7-4645-b820-1b7abad47a15"] = """
<p>Entenda a estrutura completa dos processos seletivos das companhias aéreas, do edital à contratação, e o que realmente diferencia quem é aprovado de quem é eliminado em cada etapa.</p>

<h3>O funil da seleção</h3>
<p>Uma seleção de comissários funciona como um funil: milhares de inscritos no começo e poucas dezenas de contratados no fim. Cada etapa elimina uma parte dos candidatos e, em várias delas, o que conta é o <strong>ranking</strong>, não só passar.</p>
<table>
<thead><tr><th>Etapa</th><th>O que acontece</th><th>O que elimina</th></tr></thead>
<tbody>
<tr><td>1. Inscrição e triagem</td><td>Cadastro na plataforma da companhia e checagem automática dos requisitos.</td><td>Requisito faltando (CMA, curso, idade, idioma, experiência em atendimento) e currículo mal preenchido.</td></tr>
<tr><td>2. Provas online</td><td>Prova técnica de conhecimentos da ANAC, português, raciocínio e testes de perfil (como os da SHL).</td><td>Nota abaixo do corte ou fora do ranking. Na LATAM, a prova técnica tem câmera e bloqueio de troca de aba.</td></tr>
<tr><td>3. Testes comportamentais</td><td>Perfil de personalidade, julgamento situacional e fit cultural.</td><td>Respostas incoerentes, perfil distante dos valores da companhia.</td></tr>
<tr><td>4. Dinâmica de grupo</td><td>Atividades em grupo observadas por recrutadores.</td><td>Dominar demais, sumir no grupo, desrespeitar colegas, postura e imagem inadequadas.</td></tr>
<tr><td>5. Entrevistas</td><td>RH e gestores, às vezes com parte em inglês.</td><td>Respostas decoradas, incoerência com o que mostrou antes, inglês abaixo do esperado.</td></tr>
<tr><td>6. Exames e admissão</td><td>Exames médicos, documentos e proposta.</td><td>Pendência médica ou documental, informações falsas.</td></tr>
</tbody>
</table>
<p>A ordem muda de uma companhia para outra. Na GOL, por exemplo, a dinâmica vem antes das provas; na Azul, o teste de perfil vem logo depois da inscrição. A sua jornada no Crew Select segue a ordem da companhia que você escolheu no check-in.</p>

<h3>Os motivos de eliminação mais comuns</h3>
<ul>
<li><strong>Documentação:</strong> CMA vencido, passaporte com validade curta, falta de vacina de febre amarela (CIVP) ou de comprovação de experiência.</li>
<li><strong>Prova técnica fraca:</strong> estudar só o suficiente para "passar" e ficar no meio do ranking.</li>
<li><strong>Perfil forçado:</strong> responder o teste comportamental tentando adivinhar "a resposta certa", gerando incoerências.</li>
<li><strong>Postura na dinâmica:</strong> interromper, impor opinião, ou passar a dinâmica inteira calado(a).</li>
<li><strong>Imagem pessoal:</strong> roupa, cabelo, maquiagem ou acessórios fora do padrão profissional.</li>
<li><strong>Entrevista decorada:</strong> respostas prontas que não resistem a uma pergunta de aprofundamento.</li>
<li><strong>Inglês:</strong> nível abaixo do pedido, ou travar na hora de falar.</li>
</ul>

<h3>Os seis eixos que os recrutadores observam</h3>
<p>Em todas as etapas, os avaliadores olham para os mesmos seis eixos de comportamento:</p>
<ol>
<li><strong>Segurança em primeiro lugar:</strong> respeito a regras, procedimentos e hierarquia.</li>
<li><strong>Atendimento e hospitalidade:</strong> gosto genuíno por servir e resolver o problema do outro.</li>
<li><strong>Trabalho em equipe:</strong> colaborar com pessoas que você acabou de conhecer.</li>
<li><strong>Comunicação:</strong> clareza, educação e escuta.</li>
<li><strong>Equilíbrio emocional:</strong> calma sob pressão, cansaço e conflito.</li>
<li><strong>Imagem e postura:</strong> apresentação pessoal coerente com a marca da companhia.</li>
</ol>

<h3>Perfil aprovado e perfil reprovado</h3>
<table>
<thead><tr><th>Quem é aprovado(a)</th><th>Quem é eliminado(a)</th></tr></thead>
<tbody>
<tr><td>Conhece o processo e se prepara para cada etapa.</td><td>Estuda só a prova técnica e improvisa no resto.</td></tr>
<tr><td>Responde com exemplos reais da própria vida.</td><td>Repete frases prontas da internet.</td></tr>
<tr><td>Escuta, inclui os colegas e contribui na dinâmica.</td><td>Disputa protagonismo ou some do grupo.</td></tr>
<tr><td>Mostra a mesma pessoa em todas as etapas.</td><td>Muda de perfil conforme acha que agrada.</td></tr>
<tr><td>Cuida da imagem desde a chegada ao local.</td><td>Só "liga o modo seleção" quando entra na sala.</td></tr>
</tbody>
</table>

<blockquote><p>Recrutadores experientes afirmam que decidem sobre muitos candidatos nos primeiros 5 minutos de contato, antes de qualquer resposta formal. Cuide de cada detalhe desde a chegada ao local de seleção.</p></blockquote>
"""

AULAS["05e5f6d8-4811-4102-9b7f-a28d340c095d"] = """
<p>Antes de qualquer técnica, existe uma forma de pensar. A mentalidade certa é o que separa os candidatos aprovados daqueles que sabem as respostas, mas não convencem ninguém.</p>

<h3>Os quatro pilares da mentalidade de comissário</h3>
<ol>
<li><strong>Segurança antes de tudo.</strong> Comissário(a) é, antes de qualquer coisa, um profissional de segurança. O serviço de bordo é importante, mas nunca passa na frente de um procedimento.</li>
<li><strong>Servir com prazer.</strong> Hospitalidade não é ser "bonzinho": é perceber o que o passageiro precisa e resolver com educação, mesmo quando ele não é gentil.</li>
<li><strong>Equipe acima do ego.</strong> Você vai voar com pessoas diferentes quase todo dia. Quem precisa ser o centro das atenções sofre na aviação.</li>
<li><strong>Responsabilidade o tempo todo.</strong> Pontualidade, documentos em dia, descanso adequado e comportamento coerente, dentro e fora do avião.</li>
</ol>

<blockquote><p>Mentalidade não é o que você diz que tem: é o que aparece quando as coisas ficam difíceis. Recrutadores criam situações de pressão justamente para ver qual mentalidade aparece.</p></blockquote>

<h3>Postura e imagem</h3>
<ul>
<li>Postura ereta, ombros relaxados, olhar no rosto de quem fala.</li>
<li>Sorriso natural, não forçado: ele aparece quando faz sentido.</li>
<li>Roupa social discreta, cabelo arrumado, unhas e maquiagem neutras, poucos acessórios.</li>
<li>Celular guardado durante toda a seleção, inclusive nos intervalos.</li>
<li>Educação com todos: recepção, segurança, outros candidatos. Tudo é observado.</li>
</ul>

<h3>Comunicação que convence</h3>
<ul>
<li><strong>Clareza:</strong> frases curtas, começo, meio e fim.</li>
<li><strong>Exemplos reais:</strong> "No meu trabalho no hotel, uma vez…" vale mais do que "sou muito comunicativa".</li>
<li><strong>Escuta ativa:</strong> deixe a pessoa terminar, confirme o que entendeu e responda ao que foi perguntado.</li>
<li><strong>Linguagem profissional:</strong> sem gírias, sem palavrões e sem críticas a empregos anteriores.</li>
</ul>

<h3>Comportamento em grupo</h3>
<ul>
<li>Participe cedo, mas não monopolize a conversa.</li>
<li>Traga quem está calado para a conversa: "O que você acha, Mariana?"</li>
<li>Discorde com respeito e com argumento, nunca com ironia.</li>
<li>Ajude o grupo a cumprir o tempo e o objetivo da atividade.</li>
<li>Quando a ideia de outra pessoa for melhor, apoie. Isso também é liderança.</li>
</ul>

<blockquote><p>Recrutadores muitas vezes decidem com base no que observam nos momentos sem roteiro: a espera, o intervalo, a conversa no corredor. A seleção começa antes de você entrar na sala.</p></blockquote>

<h3>Perguntas para reflexão</h3>
<ul>
<li>Se alguém te observasse sem você saber, diria que você tem postura de comissário(a)?</li>
<li>Em situações de pressão, sua comunicação melhora ou piora? Por quê?</li>
<li>Em um grupo, você tende a falar mais ou menos do que deveria?</li>
<li>Qual dos quatro pilares você precisa desenvolver mais?</li>
</ul>
"""

AULAS["9733bb24-9b6e-4ede-81f2-b38ee0803e3e"] = """
<p>Dominar os pontos de gramática que mais aparecem nas provas de seleção elimina erros bobos e aumenta a nota sem exigir estudo enciclopédico.</p>

<h3>Os pontos mais cobrados</h3>
<h4>1. Crase</h4>
<ul>
<li>Use crase antes de palavra feminina quando o verbo ou nome pede "a": <em>Dirija-se <strong>à</strong> porta de emergência.</em></li>
<li>Não use antes de masculino, verbo ou pronome de tratamento: <em>Fale <strong>a</strong> Vossa Senhoria; começou <strong>a</strong> embarcar.</em></li>
<li>Horas: <em>O embarque será <strong>às</strong> 14h.</em></li>
<li>Dica: troque por uma palavra masculina. Se virar "ao", leva crase: <em>vou à sala / vou ao saguão.</em></li>
</ul>
<h4>2. Concordância verbal e nominal</h4>
<ul>
<li><em><strong>Fazem</strong> dez anos</em> está errado: com sentido de tempo, "fazer" fica no singular. Certo: <em>Faz dez anos.</em></li>
<li><em><strong>Houve</strong> atrasos</em> (e não "houveram"): "haver" com sentido de existir não vai para o plural.</li>
<li><em>Seguem <strong>anexas</strong> as declarações</em>: o adjetivo concorda com o substantivo.</li>
<li><em>É <strong>proibido</strong> entrada</em> / <em>É <strong>proibida</strong> a entrada</em>: com artigo, concorda.</li>
</ul>
<h4>3. Regência</h4>
<ul>
<li><em>Assistir <strong>ao</strong> briefing</em> (no sentido de ver, presenciar).</li>
<li><em>Chegar <strong>a</strong> Lisboa</em> (e não "chegar em").</li>
<li><em>Preferir isto <strong>a</strong> aquilo</em> (e não "preferir mais… do que").</li>
<li><em>Obedecer <strong>aos</strong> procedimentos.</em></li>
</ul>
<h4>4. Pontuação</h4>
<ul>
<li>Não se separa sujeito do verbo com vírgula. Errado: <em>Os passageiros, devem permanecer sentados.</em> Certo: <em>Os passageiros devem permanecer sentados.</em></li>
<li>Vírgula antes de "mas", e para isolar expressões explicativas: <em>A tripulação, que chegou cedo, fez o briefing.</em></li>
</ul>
<h4>5. Palavras que confundem</h4>
<table>
<thead><tr><th>Use</th><th>Quando</th></tr></thead>
<tbody>
<tr><td>mas / mais</td><td><em>mas</em> = porém; <em>mais</em> = quantidade.</td></tr>
<tr><td>mal / mau</td><td><em>mal</em> é o oposto de bem; <em>mau</em> é o oposto de bom.</td></tr>
<tr><td>a fim de / afim</td><td><em>a fim de</em> = para; <em>afim</em> = semelhante.</td></tr>
<tr><td>há / a</td><td><em>há</em> para tempo passado (<em>há dez minutos</em>); <em>a</em> para futuro ou distância (<em>daqui a dez minutos</em>).</td></tr>
<tr><td>por que / porque / por quê / porquê</td><td>pergunta / resposta / fim de frase / substantivo (<em>o porquê</em>).</td></tr>
</tbody>
</table>

<h3>Vocabulário técnico da aviação</h3>
<p>Conhecer as palavras certas mostra preparo, tanto na prova escrita quanto na entrevista.</p>
<table>
<thead><tr><th>Termo</th><th>Significado</th></tr></thead>
<tbody>
<tr><td>Aeronave</td><td>O avião (termo técnico).</td></tr>
<tr><td>Tripulação técnica / de cabine</td><td>Pilotos / comissários.</td></tr>
<tr><td>Chefe de cabine</td><td>Comissário(a) que lidera a equipe de cabine.</td></tr>
<tr><td>Galley</td><td>Cozinha de bordo.</td></tr>
<tr><td>Pernoite</td><td>Descanso da tripulação fora da base.</td></tr>
<tr><td>Base</td><td>Cidade onde a escala do tripulante começa e termina.</td></tr>
<tr><td>Escala</td><td>Programação de voos e folgas do tripulante.</td></tr>
<tr><td>Briefing</td><td>Reunião antes do voo com as informações da operação.</td></tr>
<tr><td>CMA</td><td>Certificado Médico Aeronáutico.</td></tr>
<tr><td>Evacuação</td><td>Saída de emergência dos ocupantes da aeronave.</td></tr>
<tr><td>Despressurização</td><td>Perda de pressão da cabine.</td></tr>
</tbody>
</table>

<blockquote><p>Muitas questões de português usam textos sobre aviação. Conhecer o vocabulário técnico acelera a leitura e evita erros de interpretação por desconhecimento do tema.</p></blockquote>
"""

AULAS["e64413dd-e538-44f9-a8f9-10da3898c259"] = """
<p>Textos instrucionais e regulatórios são base frequente das provas de português. Interpretar com precisão, sem acrescentar nem tirar informação, é exatamente o que as questões avaliam.</p>

<h3>O que a prova realmente avalia</h3>
<ul>
<li><strong>Localizar informação:</strong> o que o texto diz, literalmente.</li>
<li><strong>Inferir:</strong> o que se conclui com segurança a partir do texto, e só isso.</li>
<li><strong>Identificar a ideia principal:</strong> do texto inteiro ou de um parágrafo.</li>
<li><strong>Entender o sentido das palavras no contexto:</strong> sinônimos e expressões.</li>
<li><strong>Relação entre as partes:</strong> causa, consequência, oposição, condição (conectivos como <em>porém, portanto, caso, embora</em>).</li>
</ul>

<h3>As três armadilhas clássicas</h3>
<ol>
<li><strong>Extrapolação:</strong> a alternativa diz algo que faz sentido no mundo real, mas o texto não diz.</li>
<li><strong>Redução:</strong> a alternativa pega só parte da ideia e a apresenta como se fosse tudo.</li>
<li><strong>Contradição sutil:</strong> troca "pode" por "deve", "alguns" por "todos", "geralmente" por "sempre".</li>
</ol>

<h3>Exemplo comentado</h3>
<blockquote><p><strong>Texto:</strong> "Durante a decolagem e o pouso, os passageiros devem manter o encosto da poltrona na posição vertical e a mesa fechada. Os comissários verificam o cumprimento dessas medidas antes do sinal de pouso. Bagagens de mão podem ser colocadas sob a poltrona à frente, desde que não obstruam a passagem."</p></blockquote>
<table>
<thead><tr><th>Afirmação</th><th>Certa ou errada?</th><th>Por quê</th></tr></thead>
<tbody>
<tr><td>O encosto deve ficar na vertical durante o pouso.</td><td>Certa</td><td>Está literalmente no texto.</td></tr>
<tr><td>Os comissários verificam as medidas durante todo o voo.</td><td>Errada</td><td>O texto diz "antes do sinal de pouso" (contradição sutil).</td></tr>
<tr><td>Bagagens de mão nunca podem ficar sob a poltrona.</td><td>Errada</td><td>O texto permite, com uma condição.</td></tr>
<tr><td>A mesa fechada evita ferimentos em caso de emergência.</td><td>Errada como resposta</td><td>Pode ser verdade, mas o texto não diz (extrapolação).</td></tr>
</tbody>
</table>

<h3>Método em 4 passos</h3>
<ol>
<li>Leia a pergunta antes do texto, para saber o que procurar.</li>
<li>Leia o texto inteiro uma vez, sem parar.</li>
<li>Volte ao trecho exato que responde à pergunta.</li>
<li>Elimine as alternativas com extrapolação, redução ou troca de palavra-chave.</li>
</ol>

<h3>Comunicação formal com passageiros</h3>
<p>Na escrita e na fala, o comissário usa uma linguagem educada, clara e objetiva.</p>
<table>
<thead><tr><th>Evite</th><th>Prefira</th></tr></thead>
<tbody>
<tr><td>"Não pode."</td><td>"Por segurança, não é permitido. Posso ajudar a guardar em outro lugar?"</td></tr>
<tr><td>"Peraí."</td><td>"Um momento, por favor. Já volto para atender o(a) senhor(a)."</td></tr>
<tr><td>"Ninguém avisou você?"</td><td>"Vou explicar como funciona."</td></tr>
<tr><td>"Não é comigo."</td><td>"Vou verificar com o responsável e trago uma resposta."</td></tr>
</tbody>
</table>

<blockquote><p>A forma como você fala revela o quanto se preparou. Recrutadores percebem na hora quem praticou a comunicação formal e quem apenas decorou respostas.</p></blockquote>
"""

AULAS["13bd7dd9-16c8-486c-bcb8-6b01e3cc8557"] = """
<p>O inglês da aviação tem um repertório próprio de palavras e frases que todo comissário precisa dominar, organizadas na sequência real do voo, do embarque ao pouso. Para treinar a pronúncia, use o curso <strong>Inglês a bordo</strong> e a <strong>Entrevista em inglês</strong> do Crew Select.</p>

<h3>Vocabulário essencial</h3>
<table>
<thead><tr><th>Segurança</th><th>Serviço de bordo</th><th>Aeronave</th><th>Operação</th></tr></thead>
<tbody>
<tr><td>seat belt (cinto)</td><td>trolley / cart (carrinho)</td><td>overhead bin / locker (bagageiro)</td><td>boarding (embarque)</td></tr>
<tr><td>life vest (colete)</td><td>meal / snack (refeição / lanche)</td><td>galley (cozinha)</td><td>departure / arrival (partida / chegada)</td></tr>
<tr><td>oxygen mask (máscara de oxigênio)</td><td>beverage (bebida)</td><td>lavatory (banheiro)</td><td>delay (atraso)</td></tr>
<tr><td>emergency exit (saída de emergência)</td><td>special meal (refeição especial)</td><td>aisle / window seat (corredor / janela)</td><td>connecting flight (conexão)</td></tr>
<tr><td>brace position (posição de impacto)</td><td>duty-free</td><td>tray table (mesa)</td><td>gate (portão)</td></tr>
<tr><td>evacuation (evacuação)</td><td>blanket / pillow (cobertor / travesseiro)</td><td>cockpit / flight deck</td><td>turbulence (turbulência)</td></tr>
</tbody>
</table>

<h3>Frases padrão: embarque</h3>
<ul>
<li><em>Good morning, welcome on board. May I see your boarding pass, please?</em></li>
<li><em>Your seat is on the left, by the window.</em></li>
<li><em>Please place your bag in the overhead bin or under the seat in front of you.</em></li>
</ul>

<h3>Frases padrão: demonstração de segurança</h3>
<ul>
<li><em>Please fasten your seat belt by inserting the metal tip into the buckle.</em></li>
<li><em>In the unlikely event of a loss of cabin pressure, oxygen masks will drop from the panel above you.</em></li>
<li><em>Please take a moment to locate your nearest exit, which may be behind you.</em></li>
</ul>

<h3>Frases padrão: serviço de bordo</h3>
<ul>
<li><em>Would you like chicken or pasta?</em></li>
<li><em>Can I get you something to drink?</em></li>
<li><em>I'm sorry, we've run out of chicken. May I offer you the pasta?</em></li>
</ul>

<h3>Frases padrão: turbulência</h3>
<ul>
<li><em>Ladies and gentlemen, the captain has switched on the fasten seat belt sign. Please return to your seats and fasten your seat belts.</em></li>
<li><em>Sir, please return to your seat. It's for your safety.</em></li>
</ul>

<h3>Frases padrão: pouso</h3>
<ul>
<li><em>We will shortly begin our descent. Please make sure your seat back is upright and your tray table is stowed.</em></li>
<li><em>Please remain seated until the seat belt sign has been switched off.</em></li>
</ul>

<h3>Frases padrão: emergências</h3>
<p>Em emergência, os comandos são curtos, firmes e repetidos:</p>
<ul>
<li><em>Brace! Brace! Heads down, stay down!</em></li>
<li><em>Release your seat belts! Get out!</em></li>
<li><em>Come this way! Leave everything!</em></li>
<li><em>Jump and slide!</em></li>
</ul>

<blockquote><p>Em emergências, a clareza e a firmeza da voz são tão importantes quanto as palavras. Pratique os comandos de evacuação em voz alta: o tom transmite autoridade e controla o pânico.</p></blockquote>
"""

AULAS["f56ef31c-e539-49f2-b011-7754559476ca"] = """
<p>Lógica proposicional, analogias e silogismos são a base das questões de raciocínio formal nas seleções. Dominar as regras elimina a dependência da intuição, que costuma falhar nesse tipo de questão.</p>

<h3>Proposições e conectivos</h3>
<p>Uma proposição é uma frase que pode ser verdadeira (V) ou falsa (F). Os conectivos ligam proposições:</p>
<table>
<thead><tr><th>Conectivo</th><th>Símbolo</th><th>É verdadeiro quando…</th><th>Exemplo</th></tr></thead>
<tbody>
<tr><td>Negação (não)</td><td>¬A</td><td>A é falsa.</td><td>"O voo não atrasou."</td></tr>
<tr><td>Conjunção (e)</td><td>A ∧ B</td><td>As duas são verdadeiras.</td><td>"Ana fala inglês e espanhol."</td></tr>
<tr><td>Disjunção (ou)</td><td>A ∨ B</td><td>Pelo menos uma é verdadeira.</td><td>"Vou de ônibus ou de táxi."</td></tr>
<tr><td>Condicional (se… então)</td><td>A → B</td><td>Só é falsa quando A é verdadeira e B é falsa.</td><td>"Se chover, o voo atrasa."</td></tr>
<tr><td>Bicondicional (se e somente se)</td><td>A ↔ B</td><td>As duas têm o mesmo valor.</td><td>"Embarca se e somente se tiver cartão."</td></tr>
</tbody>
</table>
<h4>Negações que mais caem</h4>
<ul>
<li>Negar "A e B" → "não A <strong>ou</strong> não B".</li>
<li>Negar "A ou B" → "não A <strong>e</strong> não B".</li>
<li>Negar "Se A, então B" → "A <strong>e</strong> não B". Ex.: "Choveu e o voo não atrasou."</li>
<li>Negar "Todos são" → "Algum não é". Negar "Nenhum é" → "Algum é".</li>
</ul>
<p>Use a <strong>contrapositiva</strong>: se A → B, então ¬B → ¬A. Se toda aprovada passou no inglês, quem não passou no inglês não foi aprovada.</p>

<h3>Analogias: tipos de relação</h3>
<table>
<thead><tr><th>Relação</th><th>Exemplo</th></tr></thead>
<tbody>
<tr><td>Profissional : local de trabalho</td><td>Médico : hospital :: piloto : aeroporto</td></tr>
<tr><td>Parte : todo</td><td>Asa : avião :: roda : carro</td></tr>
<tr><td>Ferramenta : uso</td><td>Tesoura : cortar :: caneta : escrever</td></tr>
<tr><td>Causa : efeito</td><td>Chuva : enchente :: atraso : reclamação</td></tr>
<tr><td>Sinônimo / antônimo</td><td>Decolar : pousar :: subir : descer</td></tr>
<tr><td>Grau / intensidade</td><td>Brisa : vendaval :: chuvisco : tempestade</td></tr>
</tbody>
</table>
<p>Dica: transforme o par em uma frase ("o médico trabalha no hospital") e teste a mesma frase nas alternativas.</p>

<h3>Silogismos: conclusões válidas a partir de premissas</h3>
<p>Um silogismo tem duas premissas e uma conclusão. A conclusão só é válida se for <strong>obrigatória</strong> a partir das premissas.</p>
<table>
<thead><tr><th>Premissas</th><th>Conclusão</th><th>Válida?</th></tr></thead>
<tbody>
<tr><td>Todo comissário tem CMA. Paula é comissária.</td><td>Paula tem CMA.</td><td>Sim</td></tr>
<tr><td>Todo comissário tem CMA. Paula tem CMA.</td><td>Paula é comissária.</td><td>Não: outras pessoas também têm CMA.</td></tr>
<tr><td>Nenhum piloto é passageiro. Alguns tripulantes são pilotos.</td><td>Alguns tripulantes não são passageiros.</td><td>Sim</td></tr>
<tr><td>Alguns comissários falam espanhol. Alguns que falam espanhol moram em SP.</td><td>Alguns comissários moram em SP.</td><td>Não: os grupos podem não se cruzar.</td></tr>
</tbody>
</table>
<p>Desenhe os conjuntos (diagramas de Venn) quando a frase tiver "todo", "algum" e "nenhum": a resposta aparece no desenho.</p>

<blockquote><p>Conclusões que <em>parecem razoáveis</em> são a principal armadilha dos silogismos. Se a informação não está nas premissas, não pode estar na conclusão.</p></blockquote>
"""

AULAS["3b7120d2-38f5-41e9-b3dc-78bcaf003c28"] = """
<p>Recrutadores não procuram o candidato mais inteligente. Procuram o perfil cognitivo mais adequado ao ambiente da aviação: pressão, imprevisibilidade e responsabilidade por muitas pessoas ao mesmo tempo.</p>

<h3>As cinco dimensões avaliadas</h3>
<table>
<thead><tr><th>Dimensão</th><th>O que mede</th><th>Onde aparece a bordo</th></tr></thead>
<tbody>
<tr><td>Raciocínio lógico</td><td>Encontrar padrões e tirar conclusões corretas.</td><td>Decidir o que fazer quando algo foge do previsto.</td></tr>
<tr><td>Atenção e precisão</td><td>Notar detalhes e evitar erros.</td><td>Checagens de segurança, documentos, alergias.</td></tr>
<tr><td>Velocidade de processamento</td><td>Resolver bem com pouco tempo.</td><td>Emergências e serviço com tempo curto.</td></tr>
<tr><td>Compreensão verbal</td><td>Entender instruções e textos com exatidão.</td><td>Manuais, comunicados, anúncios.</td></tr>
<tr><td>Inteligência emocional</td><td>Perceber e lidar com emoções, as suas e as dos outros.</td><td>Passageiros com medo, irritados ou em crise.</td></tr>
</tbody>
</table>

<h3>Quatro perfis comuns</h3>
<table>
<thead><tr><th>Perfil</th><th>Como aparece</th><th>Risco na seleção</th></tr></thead>
<tbody>
<tr><td><strong>Equilibrado (o ideal)</strong></td><td>Bom em tudo, sem pontos muito baixos.</td><td>Baixo. É o que as companhias procuram.</td></tr>
<tr><td>Lógico, mas desatento</td><td>Acerta as difíceis e erra as fáceis por pressa.</td><td>Perde pontos em detalhes e em procedimentos.</td></tr>
<tr><td>Rápido, mas impreciso</td><td>Termina a prova antes de todos e com muitos erros.</td><td>Nota baixa em testes que descontam ou comparam acertos.</td></tr>
<tr><td>Emocional alto, lógica baixa</td><td>Ótimo com pessoas, trava em questões de raciocínio.</td><td>Eliminado nas provas online antes de mostrar o seu ponto forte.</td></tr>
</tbody>
</table>

<h3>Como ajustar o seu perfil</h3>
<ul>
<li><strong>Se você é rápido(a) e erra muito:</strong> releia o enunciado antes de marcar e confira as unidades nas questões numéricas.</li>
<li><strong>Se você é preciso(a), mas lento(a):</strong> treine com cronômetro e pule as questões em que travar.</li>
<li><strong>Se a lógica é o ponto fraco:</strong> 10 questões por dia de sequências, silogismos e analogias por 4 semanas fazem diferença.</li>
<li><strong>Se a parte emocional é o ponto fraco:</strong> treine o julgamento situacional (SJT) e reflita sobre o porquê de cada resposta.</li>
</ul>

<h3>O que os recrutadores comparam</h3>
<ul>
<li>A sua nota em relação aos <strong>outros candidatos</strong> (percentil), e não só a nota absoluta.</li>
<li>A <strong>coerência</strong> entre o teste cognitivo, o teste de perfil e o que você mostra na dinâmica e na entrevista.</li>
<li>O equilíbrio entre <strong>velocidade e precisão</strong>.</li>
</ul>

<h3>Como se preparar</h3>
<ul>
<li>Faça os treinos rápidos da Missão do dia: eles priorizam as questões que você ainda não viu e as que errou.</li>
<li>Uma vez por semana, faça um simulado completo no modo Prova real, com tempo e sem consulta.</li>
<li>Durma bem na véspera: privação de sono derruba atenção e velocidade.</li>
<li>Faça os testes num lugar silencioso, com internet estável e o celular longe.</li>
</ul>

<h3>Mitos sobre os testes cognitivos</h3>
<table>
<thead><tr><th>Mito</th><th>Realidade</th></tr></thead>
<tbody>
<tr><td>"Não dá para treinar, ou você tem ou não tem."</td><td>Treino melhora bastante o desempenho, principalmente pela familiaridade com o formato.</td></tr>
<tr><td>"É só chutar o que sobrar no fim."</td><td>Depende do teste. Alguns penalizam erros ou adaptam a dificuldade; o melhor é responder com método.</td></tr>
<tr><td>"Precisa acertar tudo."</td><td>Ninguém acerta tudo. O que conta é a sua posição em relação aos outros candidatos.</td></tr>
</tbody>
</table>

<blockquote><p>Cognição pode ser treinada, especialmente as dimensões que mais pesam na avaliação aérea. Com preparação consistente, o desempenho pode mudar bastante em 4 a 8 semanas.</p></blockquote>
"""

AULAS["680306e1-33e0-466a-b7a9-3b077c0f7eac"] = """
<p>A SHL é uma das maiores fornecedoras de testes psicométricos para seleção de pessoal, e aparece em processos de companhias aéreas como a LATAM. Conhecer o formato antes da seleção elimina o efeito surpresa, que gasta tempo e atenção preciosos nas primeiras questões.</p>

<h3>Como os testes são aplicados</h3>
<ul>
<li>Online, pelo computador, com tempo marcado e uma questão por vez.</li>
<li>Em geral não é possível voltar para revisar uma questão já respondida.</li>
<li>Algumas versões são <strong>adaptativas</strong>: a dificuldade da próxima questão depende das suas respostas.</li>
<li>Os testes de raciocínio vêm acompanhados de um teste de <strong>perfil comportamental</strong> (personalidade), que não tem tempo rígido e não tem resposta certa.</li>
</ul>

<h3>As baterias que mais aparecem para comissários</h3>
<p>Os tempos e o número de questões abaixo são referências comuns; a versão aplicada pode variar.</p>
<table>
<thead><tr><th>Bateria</th><th>Formato</th><th>O que mede</th><th>Estratégia</th></tr></thead>
<tbody>
<tr><td><strong>Raciocínio verbal</strong><br>cerca de 19 min, 30 questões</td><td>Texto curto e uma afirmação: Verdadeiro, Falso ou Não é possível dizer.</td><td>Interpretação exata, sem conhecimento externo.</td><td>Responda só com o que está no texto. "Não é possível dizer" quando faltar informação.</td></tr>
<tr><td><strong>Raciocínio numérico</strong><br>cerca de 25 min, 18 questões</td><td>Tabelas e gráficos com perguntas de porcentagem, proporção e variação.</td><td>Ler dados e calcular com precisão.</td><td>Leia o título e as unidades da tabela antes da pergunta. Use calculadora quando for permitido.</td></tr>
<tr><td><strong>Raciocínio indutivo</strong><br>cerca de 25 min, 24 questões</td><td>Sequências de figuras: qual vem a seguir.</td><td>Encontrar padrões novos.</td><td>Analise um atributo por vez: forma, posição, cor, quantidade.</td></tr>
<tr><td><strong>Raciocínio dedutivo</strong><br>cerca de 20 min, 20 questões</td><td>Silogismos e regras lógicas.</td><td>Tirar conclusões obrigatórias de premissas.</td><td>Descarte as erradas em vez de confirmar a certa. Use a contrapositiva. Nunca acrescente informação.</td></tr>
<tr><td><strong>Julgamento situacional (SJT)</strong><br>cerca de 30 min, 26 cenários</td><td>Situações de trabalho com opções de reação para ordenar ou avaliar.</td><td>Bom senso profissional e valores da empresa.</td><td>Segurança primeiro, depois o passageiro, depois a equipe. Evite opções passivas e opções que passam por cima da hierarquia.</td></tr>
</tbody>
</table>
<p>Na LATAM, o edital mais recente lista na etapa SHL os testes comportamental, psicométrico, de raciocínio dedutivo e de português como eliminatórios, além de inglês e espanhol.</p>

<h3>Como a nota é calculada</h3>
<ul>
<li>O resultado é comparado com um <strong>grupo de referência</strong> (outros candidatos parecidos com você).</li>
<li><strong>Percentil:</strong> "você foi melhor do que 70% do grupo" = percentil 70.</li>
<li><strong>Escala sten (1 a 10) ou estanino (1 a 9):</strong> divide o grupo em faixas. Notas no meio da escala são a média; as companhias costumam usar um corte e depois o ranking.</li>
<li>Por isso, dez pontos a mais na prova podem significar dezenas de posições a mais no ranking.</li>
</ul>

<h3>Antes e durante a aplicação</h3>
<ul>
<li>Use computador (não celular), internet estável e um lugar silencioso.</li>
<li>Faça os exemplos de treino que aparecem antes de cada teste: eles não contam nota.</li>
<li>Tenha papel, lápis e, se permitido, calculadora.</li>
<li>Controle o tempo: se travar numa questão, decida rápido e siga.</li>
<li>No teste de perfil, responda com sinceridade e coerência. Respostas "perfeitas" demais chamam atenção.</li>
</ul>

<h3>Treine no Crew Select</h3>
<ul>
<li>Treinos rápidos de raciocínio lógico, numérico, verbal e SJT, com correção na hora.</li>
<li>Simulados no modo Prova real, com tempo e sem consulta.</li>
<li>Perfil comportamental com alerta de respostas incoerentes ou forçadas.</li>
</ul>
"""

SQL_TOPO = """-- Cabin Crew · Aulas do Head Hunter reescritas em texto
-- As imagens (infográficos) do curso se perderam também no site da Horsky.
-- 8 aulas que dependiam das imagens foram reescritas em texto completo;
-- as outras aulas do Head Hunter só perdem as imagens quebradas.
-- Gerado por scripts/aulas-hh-reescritas.py. Pode rodar mais de uma vez.
"""


def q(s):
    return "'" + s.replace("'", "''") + "'"


def main():
    partes = [SQL_TOPO]
    for lid, html in AULAS.items():
        partes.append(f"update aulas set conteudo = {q(html.strip())}, updated_at = now() where origem = {q('horsky-hh-' + lid)};\n")
    partes.append(
        "-- remove as imagens quebradas que sobraram nas outras aulas do Head Hunter\n"
        "update aulas set conteudo = regexp_replace(regexp_replace(conteudo, '<p>\\s*<img[^>]*(horsky\\.com\\.br|/midia/imagens/aulas/head-hunter/)[^>]*>\\s*</p>', '', 'g'),\n"
        "                                     '<img[^>]*(horsky\\.com\\.br|/midia/imagens/aulas/head-hunter/)[^>]*>', '', 'g'), updated_at = now()\n"
        "where origem like 'horsky-hh-%' and (conteudo like '%horsky.com.br%' or conteudo like '%/midia/imagens/aulas/head-hunter/%');\n\n"
        "select count(*) filter (where conteudo like '%<img%') as aulas_com_imagem, count(*) as aulas_head_hunter\n"
        "from aulas where origem like 'horsky-hh-%';\n"
    )
    destino = Path(__file__).resolve().parent.parent / "supabase/importacao/0029_aulas_head_hunter_reescritas.sql"
    destino.write_text("\n".join(partes), encoding="utf-8")
    print(destino, len(AULAS))


if __name__ == "__main__":
    main()
