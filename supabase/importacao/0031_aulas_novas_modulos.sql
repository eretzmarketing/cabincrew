-- Cabin Crew · Aulas novas dos módulos 00, 02, 03, 07, 08 e 09 (21 aulas, conteúdo original)
-- Gerado por scripts/aulas-novas-modulos.py. Pode rodar mais de uma vez (atualiza, não duplica).
-- Entram como RASCUNHO. Para publicar, rode 0032_publicar_aulas_novas.sql.

insert into aulas (modulo_id, ordem, titulo, resumo, conteudo, duracao_min, origem, tipo, publicado)
select m.id, v.ordem, v.titulo, v.resumo, v.conteudo, v.dur, v.origem, 'texto', false
from (values
  (0, 1, 'Como usar o Head Hunter', 'O mapa da plataforma: jornada, missão do dia, treinos, prova real, perfil comportamental e inglês.', '<p>O Head Hunter foi feito para levar você do zero até a aprovação, na ordem certa. Em vez de estudar tudo ao mesmo tempo, você segue uma <strong>jornada</strong> que imita as etapas do processo seletivo da companhia que escolheu.</p>

<h3>1. Faça o check-in</h3>
<p>No <a href="/head-hunter/checkin">check-in</a> você escolhe a sua companhia principal (LATAM, GOL ou Azul), as outras que também vai tentar e, se quiser, a data em que quer estar pronto(a). A partir daí a ordem das etapas segue o processo daquela companhia.</p>

<h3>2. Cumpra a Missão do dia</h3>
<p>Todo dia aparecem três tarefas, cerca de 30 minutos no total:</p>
<ul>
<li><strong>Treinar:</strong> 10 questões do assunto em que você está mais fraco(a), com correção na hora.</li>
<li><strong>Estudar:</strong> a próxima aula da sua etapa.</li>
<li><strong>Inglês:</strong> a próxima aula do curso Inglês a bordo.</li>
</ul>
<p>Cada dia com estudo aumenta a sua <strong>sequência 🔥</strong>. Constância vale mais do que maratona: 30 minutos por dia durante dois meses rendem mais do que um fim de semana inteiro de estudo.</p>

<h3>3. Avance pelas etapas</h3>
<p>Cada etapa da jornada tem aulas e treinos. Ela fica concluída quando você termina as aulas e atinge <strong>80% de média</strong> nos treinos dela. As etapas seguintes ficam visíveis, mas o ideal é seguir a ordem.</p>

<h3>4. Use os dois modos de questões</h3>
<table>
<thead><tr><th>Modo</th><th>Para quê</th><th>Como funciona</th></tr></thead>
<tbody>
<tr><td><strong>Treino</strong></td><td>Aprender</td><td>10 questões, correção na hora com explicação. Prioriza as que você nunca viu e as que errou.</td></tr>
<tr><td><strong>Prova real</strong></td><td>Simular o dia da prova</td><td>Cronômetro, sem consulta e com aviso se você sair da aba, como nas provas online das companhias.</td></tr>
</tbody>
</table>

<h3>5. Treine o que não é prova</h3>
<ul>
<li><a href="/head-hunter/perfil-comportamental">Perfil comportamental</a>: o teste de personalidade, com alerta de respostas incoerentes.</li>
<li><a href="/head-hunter/dinamicas">Biblioteca de dinâmicas</a>: as atividades em grupo mais usadas e como se destacar.</li>
<li><a href="/head-hunter/entrevista-ingles">Entrevista em inglês</a>: perguntas reais com áudio e simulação.</li>
<li><a href="/head-hunter/ingles-a-bordo">Inglês a bordo</a>: o inglês do dia a dia do comissário.</li>
</ul>

<blockquote><p>Comece hoje pela próxima aula, o seu diagnóstico. Ele mostra em 10 minutos onde você está e quanto tempo precisa.</p></blockquote>', 8, 'cc-aula-como-usar-o-head-hunter'),
  (0, 2, 'Seu diagnóstico e plano de voo', 'Descubra seus pontos fortes e fracos e monte um plano de estudo realista para a data da seleção.', '<p>Antes de estudar, responda com sinceridade às perguntas abaixo. Elas mostram onde está o seu maior risco de eliminação.</p>

<h3>Parte 1 · Requisitos (elimina na triagem)</h3>
<ul>
<li>Tenho ensino médio completo?</li>
<li>Tenho o curso de comissário de voo, ou vou concluir antes da inscrição?</li>
<li>Tenho o CMA (Certificado Médico Aeronáutico) válido, com pelo menos 1 ano de validade?</li>
<li>Tenho experiência comprovada em atendimento, serviços ou vendas?</li>
<li>Tenho passaporte válido, ou sei quanto tempo leva para tirar?</li>
<li>Tenho a vacina de febre amarela com o certificado internacional (CIVP)?</li>
</ul>
<p>Cada "não" aqui é a sua <strong>prioridade número 1</strong>, porque não adianta tirar 100% na prova sem cumprir os requisitos. Veja o Módulo 03.</p>

<h3>Parte 2 · Provas (elimina no ranking)</h3>
<p>Faça um treino rápido de cada assunto e anote a nota:</p>
<table>
<thead><tr><th>Assunto</th><th>Minha nota</th></tr></thead>
<tbody>
<tr><td>Prova técnica (ANAC)</td><td></td></tr>
<tr><td>Português</td><td></td></tr>
<tr><td>Raciocínio lógico</td><td></td></tr>
<tr><td>Raciocínio numérico</td><td></td></tr>
<tr><td>Julgamento situacional</td><td></td></tr>
</tbody>
</table>
<p><strong>Abaixo de 60%:</strong> prioridade alta. <strong>De 60% a 79%:</strong> treinar. <strong>80% ou mais:</strong> manter com revisões.</p>

<h3>Parte 3 · Comportamento (elimina na dinâmica e na entrevista)</h3>
<p>Dê uma nota de 1 a 5 para você mesmo(a):</p>
<ul>
<li>Falo em público sem travar.</li>
<li>Em grupo, participo sem dominar a conversa.</li>
<li>Consigo contar uma experiência de trabalho com começo, meio e fim.</li>
<li>Sei explicar por que quero ser comissário(a) sem frases prontas.</li>
<li>Minha imagem pessoal (roupa, cabelo, postura) está pronta para uma seleção.</li>
</ul>

<h3>Parte 4 · Inglês</h3>
<ul>
<li><strong>Básico:</strong> entendo frases simples, mas não consigo conversar.</li>
<li><strong>Intermediário:</strong> converso sobre assuntos do dia a dia com algumas pausas.</li>
<li><strong>Avançado:</strong> converso com naturalidade sobre qualquer assunto.</li>
</ul>
<p>Na LATAM, metade das vagas vai para quem comprova inglês nível ICAO 4 ou mais; na GOL e na Azul, um segundo idioma é requisito. Se você está no básico, o inglês precisa entrar na sua rotina <strong>hoje</strong>.</p>

<h3>Monte o seu plano</h3>
<table>
<thead><tr><th>Tempo até a seleção</th><th>Por dia</th><th>Foco</th></tr></thead>
<tbody>
<tr><td>4 semanas</td><td>1h30</td><td>Requisitos, prova técnica e testes; dinâmica e entrevista nos fins de semana.</td></tr>
<tr><td>8 semanas</td><td>1h</td><td>Uma etapa da jornada por semana, com inglês todos os dias.</td></tr>
<tr><td>12 semanas ou mais</td><td>30 a 45 min</td><td>Missão do dia completa, simulado de prova real a cada 15 dias.</td></tr>
</tbody>
</table>

<h3>Regras do plano</h3>
<ol>
<li>Estude em horário fixo. O hábito sustenta o plano nos dias sem vontade.</li>
<li>Não pule a Missão do dia. Em dia corrido, faça só o treino de 10 questões.</li>
<li>Uma vez por semana, revise os erros da semana.</li>
<li>Refaça este diagnóstico a cada mês e compare.</li>
</ol>

<blockquote><p>Defina a sua data no <a href="/head-hunter/checkin">check-in</a>: a contagem regressiva aparece na sua jornada.</p></blockquote>', 12, 'cc-aula-seu-diagnostico-e-plano-de-voo'),
  (2, 1, 'LATAM', 'Como é o processo seletivo de comissários da LATAM e o que a companhia valoriza.', '<p>A LATAM faz parte do maior grupo de companhias aéreas da América Latina, com voos nacionais e internacionais. No Brasil, as seleções de comissários costumam ter muitos inscritos e usam <strong>ranking</strong> em várias etapas.</p>

<h3>Requisitos (edital mais recente)</h3>
<ul>
<li>Ser maior de 18 anos, com ensino médio completo.</li>
<li>CMA com validade mínima de 1 ano no ato da inscrição.</li>
<li>Curso profissionalizante de comissário de voo. Candidatos podem participar com ou sem CCT (o certificado da prova teórica da ANAC).</li>
<li><strong>Imprescindível:</strong> experiência em serviços, atendimento ao cliente ou vendas.</li>
<li>Passaporte brasileiro com pelo menos 2 anos de validade a partir da entrevista.</li>
<li>Certificado internacional de vacinação de febre amarela (CIVP) na admissão.</li>
<li>Carência de 6 meses desde a última participação.</li>
<li>Diferenciais: inglês e/ou espanhol validados pela metodologia ICAO nível 4; carteira de A320 ou Embraer E2.</li>
</ul>

<h3>As etapas</h3>
<ol>
<li><strong>Inscrição e triagem</strong> dos dados informados (que são checados ao longo de todo o processo).</li>
<li><strong>Teste na plataforma JobCoach:</strong> prova técnica online, com câmera e recursos que impedem a troca de aba.</li>
<li><strong>Testes na plataforma SHL:</strong> comportamental, psicométrico, raciocínio dedutivo e português (eliminatórios), além de inglês e espanhol (que mapeiam o nível).</li>
<li><strong>Dinâmica em grupo</strong>, presencial ou online.</li>
<li><strong>Entrevista individual</strong> com RH e gestão.</li>
<li><strong>Avaliação de idiomas ICAO</strong> para quem tem inglês e/ou espanhol.</li>
<li><strong>Exames</strong> (toxicológico e admissional) e proposta.</li>
<li><strong>Treinamento</strong> presencial na academia da companhia em São Paulo, instrução em rota e check de competência.</li>
</ol>
<p>As notas formam um ranking com 1ª e 2ª chamada. Por isso, a meta não é "passar": é ficar entre os melhores.</p>

<h3>O peso do inglês</h3>
<p>No edital mais recente, <strong>50% das vagas</strong> são destinadas a candidatos com proficiência ICAO 4 ou superior em inglês e/ou espanhol. Na prática, quem tem inglês disputa metade das vagas com muito menos concorrentes.</p>

<h3>Como se preparar para a LATAM</h3>
<ul>
<li>Faça os simulados da ANAC no modo <strong>Prova real</strong>: a JobCoach não deixa trocar de aba.</li>
<li>Treine raciocínio dedutivo e português até passar de 80% com folga.</li>
<li>Faça o perfil comportamental várias vezes e cuide da coerência.</li>
<li>Comece o inglês desde o primeiro dia da jornada.</li>
<li>Leia o edital inteiro assim que ele sair: as regras mudam de um processo para outro.</li>
</ul>

<blockquote><p>A LATAM avisa nos editais que nunca pede pagamento de nenhum tipo durante a seleção. Desconfie de qualquer mensagem que peça dinheiro "para garantir a vaga".</p></blockquote>', 12, 'cc-aula-latam'),
  (2, 2, 'GOL', 'Como é o processo seletivo de comissários da GOL e o que muda em relação às outras companhias.', '<p>A GOL é uma companhia brasileira de voos nacionais e internacionais com frota de aviões Boeing 737. A seleção de comissários tem uma particularidade importante: <strong>a dinâmica de grupo vem logo no começo</strong>.</p>

<h3>Requisitos mais pedidos</h3>
<ul>
<li>Ensino médio completo e curso de comissário de voo.</li>
<li>CMA de 2ª classe válido.</li>
<li>Passaporte válido (na seleção mais recente divulgada, com pelo menos 6 meses de validade).</li>
<li><strong>Conversação em inglês e espanhol</strong>, que nas seleções recentes apareceu como requisito, e não só como diferencial.</li>
</ul>

<h3>As etapas mais comuns</h3>
<ol>
<li>Inscrição pelo site de carreiras.</li>
<li><strong>Dinâmica de grupo.</strong></li>
<li>Testes psicológicos e de idioma.</li>
<li>Entrevistas com a área de Gente e Cultura e com gestores.</li>
<li>Exames e, em alguns processos, um período em espera (stand by) até a proposta.</li>
</ol>

<h3>O que isso muda na sua preparação</h3>
<ul>
<li>A primeira impressão vem <strong>em grupo</strong>. Treine dinâmicas antes de qualquer outra coisa (Módulo 07).</li>
<li>O espanhol não pode ficar para depois. Mesmo o básico de conversação faz diferença.</li>
<li>A imagem pessoal conta desde o primeiro contato, porque a dinâmica é a primeira etapa.</li>
<li>Prepare respostas sobre disponibilidade para mudar de cidade e trabalhar em escala.</li>
</ul>

<blockquote><p>Os detalhes mudam a cada seleção. Sempre confira o anúncio oficial da vaga no site de carreiras da GOL antes de se inscrever.</p></blockquote>', 10, 'cc-aula-gol'),
  (2, 3, 'Azul', 'Como é o processo seletivo de comissários da Azul e por que o perfil vem primeiro.', '<p>A Azul é uma companhia brasileira com uma das maiores malhas de cidades atendidas no país, frota variada (jatos Embraer, turboélices ATR e Airbus) e o principal centro de conexões em Campinas (Viracopos). Na seleção, o <strong>perfil e o fit cultural</strong> aparecem cedo.</p>

<h3>Requisitos mais pedidos</h3>
<ul>
<li>Ensino médio completo e curso de comissário de voo, incluindo a parte de <strong>sobrevivência na selva e no mar</strong>.</li>
<li>CMA válido.</li>
<li>Um segundo idioma em nível intermediário: inglês, espanhol, francês ou Libras.</li>
<li>Carência de 12 meses para quem participou de um processo recente.</li>
</ul>

<h3>As etapas mais comuns</h3>
<ol>
<li>Inscrição.</li>
<li><strong>Teste de perfil e fit cultural.</strong></li>
<li><strong>Vídeo de apresentação</strong> (falar sobre você em poucos minutos).</li>
<li>Prova técnica.</li>
<li>Etapa presencial: dinâmica e entrevistas.</li>
<li>Exames e treinamento.</li>
</ol>

<h3>O que isso muda na sua preparação</h3>
<ul>
<li>Treine o <a href="/head-hunter/perfil-comportamental">perfil comportamental</a> logo no início: ele é a primeira barreira.</li>
<li>Pesquise a cultura e os valores da Azul no site de carreiras e pense em exemplos seus que combinam com eles.</li>
<li>Grave o vídeo de apresentação com antecedência e assista: postura, voz e tempo (Módulo 03).</li>
<li>Se o seu segundo idioma for Libras, francês ou espanhol, ele também vale.</li>
</ul>

<blockquote><p>Os detalhes mudam a cada seleção. Sempre confira o anúncio oficial da vaga no site de carreiras da Azul antes de se inscrever.</p></blockquote>', 10, 'cc-aula-azul'),
  (2, 4, 'Como pesquisar a companhia antes da seleção', 'O que estudar sobre a companhia para responder com segurança e mostrar interesse real.', '<p>Uma das perguntas mais comuns na entrevista é "Por que você quer trabalhar aqui?". Quem responde só "porque é uma empresa grande" ou "porque amo viajar" perde a chance de se destacar.</p>

<h3>O que pesquisar</h3>
<table>
<thead><tr><th>Assunto</th><th>Onde encontrar</th><th>Como usar</th></tr></thead>
<tbody>
<tr><td>Propósito, missão e valores</td><td>Site institucional e de carreiras</td><td>Ligue cada valor a uma experiência sua.</td></tr>
<tr><td>Destinos e bases</td><td>Site de vendas, notícias</td><td>Mostre que entende onde poderá morar e voar.</td></tr>
<tr><td>Frota</td><td>Site institucional, notícias de aviação</td><td>Útil para perguntas técnicas e para mostrar interesse.</td></tr>
<tr><td>Notícias recentes</td><td>Sites de notícias de aviação, relatório de sustentabilidade</td><td>Novas rotas, prêmios, projetos sociais.</td></tr>
<tr><td>Atendimento</td><td>Redes sociais da companhia, sua própria experiência como passageiro(a)</td><td>Exemplos concretos do padrão de serviço.</td></tr>
</tbody>
</table>

<h3>Monte a sua "ficha da companhia"</h3>
<ol>
<li>Três valores da companhia, com um exemplo seu para cada.</li>
<li>Três fatos recentes (uma rota nova, um prêmio, um projeto).</li>
<li>O que diferencia o serviço dela das concorrentes.</li>
<li>Por que você quer trabalhar ali, em duas frases suas.</li>
<li>Uma pergunta inteligente para fazer ao entrevistador.</li>
</ol>

<h3>Exemplo de resposta</h3>
<blockquote><p>"Quero trabalhar na companhia porque ela coloca a segurança e o cuidado com as pessoas no centro, e é exatamente o que eu fazia no meu trabalho no hotel, onde atendia hóspedes de vários países. Também acompanho a expansão das rotas internacionais e quero crescer junto com a empresa."</p></blockquote>

<h3>Cuidados</h3>
<ul>
<li>Não critique concorrentes.</li>
<li>Não decore textos do site: fale com as suas palavras.</li>
<li>Não comente notícias negativas, a não ser que perguntem.</li>
<li>Nunca invente experiências.</li>
</ul>', 10, 'cc-aula-pesquisar-a-companhia'),
  (3, 1, 'Requisitos para ser comissário(a) no Brasil', 'O que a ANAC exige para a licença e o que as companhias pedem na seleção.', '<p>Existem duas listas de requisitos: a da <strong>ANAC</strong>, para ter a licença de comissário de voo, e a das <strong>companhias</strong>, para participar da seleção. Elas não são iguais.</p>

<h3>O que a ANAC exige para a licença</h3>
<p>Segundo as regras atuais (RBAC 63), para obter a licença de comissário de voo é preciso:</p>
<ul>
<li>Ter 18 anos completos.</li>
<li>Ter concluído o ensino médio.</li>
<li>Estar em dia com o serviço militar (homens de 18 a 45 anos) e com a Justiça Eleitoral.</li>
<li>Ter o <strong>CMA de 2ª classe</strong> válido.</li>
<li>Fazer o <strong>treinamento inicial</strong> em um programa aprovado pela ANAC, ter a experiência em rota e ser aprovado(a) no exame prático.</li>
</ul>
<p>Quem pede a licença é a companhia aérea, depois que você é contratado(a) e treinado(a). A licença aparece na CHT Digital da ANAC.</p>

<h3>E o curso e a "banca" da ANAC?</h3>
<p>Pelas regras atuais, a ANAC <strong>não exige</strong> mais curso teórico nem a prova teórica (a antiga "banca") para emitir a licença. Mas atenção:</p>
<ul>
<li>As companhias continuam pedindo o <strong>curso de comissário de voo</strong> nos editais.</li>
<li>A ANAC continua aplicando a prova teórica para quem quiser o <strong>CCT</strong> (Certificado de Conhecimento Teórico). A LATAM, por exemplo, aceita candidatos com ou sem CCT.</li>
<li>O conteúdo da prova (segurança, emergência, primeiros socorros, legislação e conhecimentos técnicos) continua sendo cobrado na <strong>prova técnica</strong> das companhias.</li>
</ul>

<h3>O que as companhias costumam pedir</h3>
<table>
<thead><tr><th>Requisito</th><th>Observação</th></tr></thead>
<tbody>
<tr><td>Ensino médio completo</td><td>Todas.</td></tr>
<tr><td>Curso de comissário de voo</td><td>Todas. A Azul pede a parte de sobrevivência na selva e no mar.</td></tr>
<tr><td>CMA válido</td><td>A LATAM pede pelo menos 1 ano de validade na inscrição.</td></tr>
<tr><td>Experiência em atendimento ou vendas</td><td>Imprescindível na LATAM; valorizada em todas.</td></tr>
<tr><td>Passaporte</td><td>LATAM: 2 anos de validade a partir da entrevista. GOL: pelo menos 6 meses (seleção recente).</td></tr>
<tr><td>Vacina de febre amarela (CIVP)</td><td>Exigida na admissão para voos internacionais.</td></tr>
<tr><td>Idiomas</td><td>LATAM: diferencial (ICAO 4). GOL e Azul: segundo idioma como requisito nas seleções recentes.</td></tr>
<tr><td>Carência</td><td>Tempo mínimo desde a última tentativa: 6 meses (LATAM), 12 meses (Azul).</td></tr>
</tbody>
</table>

<blockquote><p>As regras da ANAC e dos editais mudam. Antes de cada seleção, confira o edital da companhia e o site da ANAC (gov.br).</p></blockquote>', 12, 'cc-aula-requisitos-para-ser-comissario'),
  (3, 2, 'Documentos: o que providenciar e quando', 'CMA, passaporte, CIVP, comprovação de experiência e certificados, com prazos realistas.', '<p>Muita gente é eliminada não por nota, mas por um documento que venceu ou que não ficou pronto a tempo. Organize tudo <strong>antes</strong> de o edital sair.</p>

<h3>Checklist de documentos</h3>
<table>
<thead><tr><th>Documento</th><th>Onde tirar</th><th>Dica de prazo</th></tr></thead>
<tbody>
<tr><td><strong>CMA (Certificado Médico Aeronáutico)</strong></td><td>Clínicas credenciadas pela ANAC</td><td>Envolve vários exames. Comece com 1 a 2 meses de antecedência e confira a validade exigida no edital.</td></tr>
<tr><td><strong>Passaporte</strong></td><td>Polícia Federal</td><td>Depende da agenda da sua cidade. Se o seu vence nos próximos 2 anos, renove antes da seleção.</td></tr>
<tr><td><strong>CIVP (febre amarela)</strong></td><td>Tome a vacina e emita o certificado internacional (ConecteSUS ou posto credenciado da Anvisa)</td><td>Faça com antecedência e guarde o comprovante.</td></tr>
<tr><td><strong>Certificado do curso de comissário</strong></td><td>Escola onde você fez o curso</td><td>Peça a versão digital e a impressa.</td></tr>
<tr><td><strong>CCT da ANAC</strong> (se tiver)</td><td>Sistemas da ANAC</td><td>Opcional, mas tenha o comprovante em mãos.</td></tr>
<tr><td><strong>Comprovação de experiência</strong></td><td>Carteira de trabalho digital, declarações de empregadores, contratos</td><td>A LATAM considera a experiência em atendimento imprescindível.</td></tr>
<tr><td><strong>Diploma do ensino médio</strong></td><td>Escola</td><td>Tenha o certificado de conclusão ou o histórico.</td></tr>
<tr><td><strong>Certificados de idioma</strong> (se tiver)</td><td>Escolas e exames internacionais</td><td>Ajudam a comprovar o nível, mas a companhia faz a própria avaliação.</td></tr>
</tbody>
</table>

<h3>Organização digital</h3>
<ul>
<li>Crie uma pasta no celular e na nuvem com todos os documentos escaneados em PDF.</li>
<li>Use nomes claros: <em>cma-validade-2027-05.pdf</em>, <em>passaporte.pdf</em>.</li>
<li>Anote as datas de validade num calendário com aviso.</li>
</ul>

<h3>Dados verdadeiros</h3>
<p>As companhias checam os dados informados na inscrição ao longo de todo o processo. Divergências ou omissões podem eliminar mesmo depois da aprovação. Preencha tudo com calma e nunca aumente experiências.</p>

<blockquote><p>Regra de ouro: quando o edital sair, você deve se preocupar só com a prova, e não com documento.</p></blockquote>', 10, 'cc-aula-documentos'),
  (3, 3, 'Imagem pessoal para a seleção', 'Roupa, cabelo, maquiagem, barba, unhas e postura: como se apresentar na seleção.', '<p>Na aviação, a imagem pessoal faz parte do trabalho: você representa a marca da companhia. Na seleção, os avaliadores observam se você já se apresenta como alguém que poderia vestir o uniforme amanhã.</p>

<h3>Princípio geral</h3>
<p><strong>Discreto, limpo e profissional.</strong> O objetivo é que prestem atenção em você, e não na sua roupa.</p>

<h3>Roupa</h3>
<ul>
<li>Traje social ou esporte fino em cores neutras: azul-marinho, preto, cinza, branco, bege.</li>
<li>Peças bem passadas e do tamanho certo, sem decotes, transparências ou estampas grandes.</li>
<li>Sapato fechado, limpo e confortável para ficar em pé.</li>
<li>Na seleção online, a parte de cima conta tanto quanto na presencial.</li>
</ul>

<h3>Cabelo, barba e maquiagem</h3>
<ul>
<li>Cabelo limpo e arrumado. Cabelos longos presos em coque ou rabo baixo funcionam bem.</li>
<li>Barba feita ou muito bem aparada.</li>
<li>Maquiagem leve e natural; batom em tom suave ou clássico.</li>
<li>Unhas limpas e curtas ou médias, com esmalte discreto ou base.</li>
</ul>

<h3>Acessórios, tatuagens e piercings</h3>
<ul>
<li>Poucos acessórios: brincos pequenos, relógio discreto.</li>
<li>As regras sobre tatuagens visíveis e piercings variam de companhia para companhia e mudam com o tempo. Consulte o manual da companhia e, na dúvida, prefira cobrir ou retirar no dia.</li>
</ul>

<h3>Postura</h3>
<ul>
<li>Coluna ereta, ombros relaxados, sorriso natural.</li>
<li>Aperto de mão firme e olhar no rosto.</li>
<li>Celular guardado, inclusive nos intervalos.</li>
<li>Educação com todos, da recepção à segurança do prédio.</li>
</ul>

<h3>Checklist da véspera</h3>
<ol>
<li>Roupa separada e passada.</li>
<li>Documentos e cópias numa pasta.</li>
<li>Rota e horário de saída planejados, com folga.</li>
<li>Noite bem dormida.</li>
</ol>

<blockquote><p>A seleção começa quando você chega ao prédio, e não quando entra na sala.</p></blockquote>', 10, 'cc-aula-imagem-pessoal'),
  (3, 4, 'Foto e vídeo de apresentação', 'Como fazer a foto do currículo e gravar um vídeo de apresentação que convence.', '<p>Algumas seleções pedem foto no currículo e um vídeo de apresentação (a Azul costuma pedir). Os dois são a sua primeira impressão, antes de qualquer contato.</p>

<h3>A foto</h3>
<ul>
<li>Fundo claro e liso, de preferência branco.</li>
<li>Luz de frente, natural, sem sombras no rosto.</li>
<li>Enquadramento do peito para cima, olhando para a câmera.</li>
<li>Roupa e cabelo como no dia da seleção.</li>
<li>Sorriso natural. Sem filtros, sem óculos escuros, sem recortes de outras fotos.</li>
</ul>

<h3>O vídeo de apresentação</h3>
<h4>Estrutura de 1 a 2 minutos</h4>
<ol>
<li><strong>Quem você é</strong> (15 segundos): nome, idade, cidade.</li>
<li><strong>Sua experiência</strong> (30 segundos): onde trabalhou com atendimento e um resultado concreto.</li>
<li><strong>Por que comissário(a)</strong> (30 segundos): sua motivação real, com um exemplo.</li>
<li><strong>Por que esta companhia</strong> (20 segundos): o que você admira nela.</li>
<li><strong>Fechamento</strong> (10 segundos): agradecimento e disponibilidade.</li>
</ol>

<h4>Gravação</h4>
<ul>
<li>Celular na horizontal, apoiado na altura dos olhos.</li>
<li>Lugar silencioso, fundo neutro e arrumado, luz de frente.</li>
<li>Olhe para a lente da câmera, e não para a tela.</li>
<li>Fale um pouco mais devagar do que no dia a dia.</li>
<li>Respeite o tempo pedido. Passar do limite mostra falta de preparo.</li>
</ul>

<h4>Erros comuns</h4>
<ul>
<li>Ler o texto. Use tópicos e fale naturalmente.</li>
<li>Começar com "Oi, gente". Comece com "Olá, meu nome é…".</li>
<li>Falar só de viagens. A profissão é sobre servir e segurança.</li>
<li>Música de fundo e efeitos de edição.</li>
</ul>

<blockquote><p>Grave, assista e regrave pelo menos três vezes. Na terceira você já estará muito mais natural.</p></blockquote>', 10, 'cc-aula-foto-e-video-de-apresentacao'),
  (7, 1, 'O que a dinâmica de grupo avalia', 'Os comportamentos que os avaliadores observam e os papéis que você pode ter no grupo.', '<p>Na dinâmica, os avaliadores não procuram quem tem a melhor ideia. Procuram quem <strong>trabalha bem com pessoas que acabou de conhecer</strong>, exatamente como numa tripulação.</p>

<h3>O que é observado</h3>
<table>
<thead><tr><th>Comportamento</th><th>Como aparece</th></tr></thead>
<tbody>
<tr><td>Comunicação</td><td>Fala clara, escuta, tom de voz adequado.</td></tr>
<tr><td>Trabalho em equipe</td><td>Constrói em cima das ideias dos outros, divide tarefas.</td></tr>
<tr><td>Liderança situacional</td><td>Organiza o grupo quando é preciso, sem impor.</td></tr>
<tr><td>Respeito e inclusão</td><td>Dá voz a quem está calado, não interrompe.</td></tr>
<tr><td>Foco no objetivo</td><td>Ajuda o grupo a cumprir a tarefa e o tempo.</td></tr>
<tr><td>Postura e imagem</td><td>Sentado(a) ou em pé com postura, expressão receptiva.</td></tr>
<tr><td>Equilíbrio emocional</td><td>Lida bem com discordância e pressão de tempo.</td></tr>
</tbody>
</table>

<h3>Papéis no grupo</h3>
<ul>
<li><strong>Organizador(a):</strong> propõe como o grupo vai trabalhar ("Que tal cada um falar em 1 minuto e depois a gente decide?").</li>
<li><strong>Guardião(ã) do tempo:</strong> lembra o prazo com naturalidade.</li>
<li><strong>Integrador(a):</strong> junta ideias diferentes numa solução.</li>
<li><strong>Facilitador(a):</strong> traz quem está quieto para a conversa.</li>
<li><strong>Relator(a):</strong> apresenta o resultado do grupo no fim.</li>
</ul>
<p>Você não precisa ser o líder. Qualquer um desses papéis, bem feito, é bem avaliado.</p>

<h3>O que pesa contra</h3>
<ul>
<li>Monopolizar a conversa ou interromper.</li>
<li>Ficar calado(a) a dinâmica inteira.</li>
<li>Desqualificar a ideia de alguém ("isso não faz sentido").</li>
<li>Olhar para os avaliadores o tempo todo, como se estivesse se apresentando para eles.</li>
<li>Usar o celular ou conversar paralelamente.</li>
</ul>

<blockquote><p>Quem inclui os outros é lembrado. Uma frase como "Quero ouvir o que você acha, João" vale mais do que dez ideias brilhantes ditas por cima dos colegas.</p></blockquote>', 10, 'cc-aula-o-que-a-dinamica-avalia'),
  (7, 2, 'Tipos de dinâmica e como agir em cada uma', 'Debate, caso, construção, apresentação e dinâmica online: o que fazer em cada formato.', '<p>As dinâmicas mudam de nome, mas quase sempre caem em um destes formatos. Consulte também a <a href="/head-hunter/dinamicas">biblioteca de dinâmicas</a>, com exemplos detalhados.</p>

<h3>1. Apresentação pessoal</h3>
<p>Cada candidato se apresenta ao grupo, às vezes de forma criativa (com um objeto, uma palavra, apresentando o colega).</p>
<ul>
<li>Prepare uma versão de 30 segundos e outra de 1 minuto.</li>
<li>Inclua uma experiência de atendimento.</li>
<li>Preste atenção nos colegas: às vezes pedem para você lembrar o nome deles.</li>
</ul>

<h3>2. Estudo de caso</h3>
<p>O grupo recebe uma situação (por exemplo, um voo atrasado com passageiros irritados) e precisa propor uma solução.</p>
<ul>
<li>Lembre a ordem de prioridade: <strong>segurança, depois passageiros, depois equipe e empresa</strong>.</li>
<li>Proponha um caminho para o grupo organizar a discussão.</li>
<li>Seja concreto(a): "primeiro avisamos, depois oferecemos…".</li>
</ul>

<h3>3. Debate</h3>
<p>Um tema polêmico, às vezes com lados definidos pelos avaliadores.</p>
<ul>
<li>Argumente com fatos e exemplos, sem levantar a voz.</li>
<li>Reconheça os bons pontos do outro lado.</li>
<li>Não leve para o lado pessoal: avaliam como você discorda, e não quem ganha.</li>
</ul>

<h3>4. Construção ou tarefa prática</h3>
<p>Montar algo com materiais simples, ordenar itens de sobrevivência, criar um anúncio de bordo.</p>
<ul>
<li>Divida as tarefas logo no começo.</li>
<li>Coloque a mão na massa: quem só observa é mal avaliado.</li>
<li>No final, apresentem juntos e deem crédito ao grupo.</li>
</ul>

<h3>5. Dinâmica online</h3>
<ul>
<li>Câmera ligada na altura dos olhos, fundo neutro, roupa da seleção.</li>
<li>Microfone no mudo quando não estiver falando; levante a mão virtual para pedir a vez.</li>
<li>Diga o seu nome antes de falar, porque nem sempre fica claro quem está falando.</li>
<li>Internet estável e celular longe.</li>
</ul>

<h3>Frases úteis</h3>
<ul>
<li>"Gostei da ideia da Ana. Podemos complementar com…"</li>
<li>"Temos 5 minutos. Que tal fecharmos uma proposta?"</li>
<li>"Ainda não ouvimos o Pedro. O que você acha?"</li>
<li>"Entendo o seu ponto. Eu vejo de outro jeito, porque…"</li>
</ul>', 12, 'cc-aula-tipos-de-dinamica'),
  (7, 3, 'Erros que eliminam e checklist da dinâmica', 'Os comportamentos que mais derrubam candidatos e um checklist para o dia.', '<h3>Os 10 erros que mais eliminam</h3>
<ol>
<li>Falar mais do que todos e não deixar espaço.</li>
<li>Não falar nada.</li>
<li>Interromper os colegas.</li>
<li>Criticar ou ironizar a ideia de alguém.</li>
<li>Querer "aparecer" para os avaliadores em vez de trabalhar com o grupo.</li>
<li>Ignorar o tempo e deixar a tarefa sem terminar.</li>
<li>Propor soluções que passam por cima da segurança ou das regras.</li>
<li>Postura largada: braços cruzados, celular, conversa paralela.</li>
<li>Mudar de comportamento quando acha que não está sendo observado(a).</li>
<li>Chegar atrasado(a) ou com a imagem fora do padrão.</li>
</ol>

<h3>Checklist do dia</h3>
<h4>Antes</h4>
<ul>
<li>Chegue com 30 minutos de antecedência.</li>
<li>Cumprimente todos, inclusive os outros candidatos.</li>
<li>Desligue o celular e guarde.</li>
</ul>
<h4>Durante</h4>
<ul>
<li>Fale nos primeiros minutos, para quebrar o gelo.</li>
<li>Escute com o corpo: olhe para quem fala e acene.</li>
<li>Chame quem está calado(a).</li>
<li>Lembre a prioridade: segurança, passageiro, equipe.</li>
<li>Ajude o grupo a cumprir o tempo.</li>
</ul>
<h4>Depois</h4>
<ul>
<li>Agradeça aos avaliadores e aos colegas.</li>
<li>Continue com a mesma postura até sair do prédio.</li>
<li>Anote o que funcionou e o que você mudaria.</li>
</ul>

<blockquote><p>Treine com amigos: escolham uma dinâmica da biblioteca, cronometrem 15 minutos e peçam para alguém observar e anotar os pontos acima.</p></blockquote>', 8, 'cc-aula-erros-que-eliminam-na-dinamica'),
  (8, 1, 'Tipos de entrevista na seleção', 'Entrevista com RH, com gestores, em painel, por vídeo e em inglês: o que esperar de cada uma.', '<p>Na reta final da seleção, você pode passar por mais de uma entrevista. Cada uma tem um objetivo diferente.</p>

<table>
<thead><tr><th>Tipo</th><th>Quem conduz</th><th>O que busca</th></tr></thead>
<tbody>
<tr><td>Entrevista com RH</td><td>Recrutadores</td><td>Sua trajetória, motivação, comportamento, disponibilidade e coerência com o perfil.</td></tr>
<tr><td>Entrevista com gestores</td><td>Chefes de cabine, gestores da área</td><td>Se você se encaixa na operação: segurança, atendimento, trabalho em equipe.</td></tr>
<tr><td>Painel</td><td>Duas ou mais pessoas ao mesmo tempo</td><td>As mesmas coisas, com perguntas de pontos de vista diferentes.</td></tr>
<tr><td>Vídeo gravado</td><td>Plataforma online, sem entrevistador</td><td>Comunicação e presença; você responde a perguntas com tempo marcado.</td></tr>
<tr><td>Entrevista em inglês</td><td>Avaliador de idioma</td><td>Fluência, compreensão e vocabulário (na LATAM, avaliação pela metodologia ICAO).</td></tr>
</tbody>
</table>

<h3>Perguntas por competência</h3>
<p>A maioria das perguntas pede uma <strong>situação real</strong> que você viveu: "Conte uma vez em que você lidou com um cliente difícil". O avaliador quer saber como você agiu, e não como você agiria. A próxima aula ensina o método STAR para responder.</p>

<h3>Entrevista por vídeo</h3>
<ul>
<li>Teste câmera, microfone e internet antes.</li>
<li>Olhe para a lente da câmera.</li>
<li>Use a mesma roupa e postura da seleção presencial.</li>
<li>Nas plataformas gravadas, leia a pergunta com calma; normalmente há um tempo para pensar antes de gravar.</li>
</ul>

<h3>Entrevista em inglês</h3>
<p>Treine na <a href="/head-hunter/entrevista-ingles">Entrevista em inglês</a> do Head Hunter, com as perguntas mais comuns, áudio e simulação com gravação.</p>

<blockquote><p>Coerência é tudo: o que você diz na entrevista precisa bater com o seu currículo, com o teste de perfil e com o que mostrou na dinâmica.</p></blockquote>', 10, 'cc-aula-tipos-de-entrevista'),
  (8, 2, 'O método STAR para responder com exemplos', 'Como contar uma experiência com começo, meio e fim e mostrar resultado.', '<p>STAR é a forma mais usada para responder perguntas que começam com "Conte uma situação em que…". O nome vem das quatro partes da resposta:</p>

<table>
<thead><tr><th>Letra</th><th>Parte</th><th>O que dizer</th><th>Tempo</th></tr></thead>
<tbody>
<tr><td><strong>S</strong></td><td>Situação</td><td>Onde, quando, contexto.</td><td>15%</td></tr>
<tr><td><strong>T</strong></td><td>Tarefa</td><td>Qual era o seu papel ou o desafio.</td><td>10%</td></tr>
<tr><td><strong>A</strong></td><td>Ação</td><td>O que <strong>você</strong> fez, passo a passo.</td><td>50%</td></tr>
<tr><td><strong>R</strong></td><td>Resultado</td><td>O que aconteceu e o que você aprendeu.</td><td>25%</td></tr>
</tbody>
</table>

<h3>Exemplo</h3>
<p><strong>Pergunta:</strong> "Conte uma situação em que você atendeu um cliente muito irritado."</p>
<blockquote>
<p><strong>S:</strong> Eu trabalhava na recepção de um hotel e um hóspede chegou às 23h e descobriu que a reserva dele tinha sido cancelada por erro do sistema.</p>
<p><strong>T:</strong> Eu estava sozinha no turno e precisava resolver sem deixar ele sem lugar para dormir.</p>
<p><strong>A:</strong> Primeiro ouvi tudo sem interromper e pedi desculpas pelo transtorno. Expliquei com calma o que tinha acontecido, liguei para o gerente de plantão e consegui liberar um quarto de categoria superior. Enquanto o quarto era preparado, ofereci um lanche no restaurante.</p>
<p><strong>R:</strong> Ele se acalmou, agradeceu e, no dia seguinte, deixou um elogio no livro de sugestões citando meu nome. Aprendi que escutar primeiro desarma a maior parte das reclamações.</p>
</blockquote>

<h3>Erros comuns</h3>
<ul>
<li>Falar "nós" o tempo todo. O avaliador quer saber o que <strong>você</strong> fez.</li>
<li>Gastar a maior parte do tempo no contexto e quase nada na ação.</li>
<li>Terminar sem resultado.</li>
<li>Inventar histórias: as perguntas de aprofundamento revelam.</li>
<li>Usar exemplos em que você critica colegas ou ex-chefes.</li>
</ul>

<h3>Monte o seu banco de histórias</h3>
<p>Prepare <strong>seis histórias reais</strong> no formato STAR. Com elas você responde quase qualquer pergunta:</p>
<ol>
<li>Cliente difícil ou reclamação.</li>
<li>Trabalho em equipe com alguém difícil.</li>
<li>Pressão ou prazo apertado.</li>
<li>Um erro seu e o que você fez para corrigir.</li>
<li>Quando você foi além do esperado para ajudar alguém.</li>
<li>Uma situação em que você precisou seguir uma regra mesmo discordando.</li>
</ol>

<blockquote><p>Treine em voz alta e cronometre: cada história deve ter entre 1 e 2 minutos.</p></blockquote>', 12, 'cc-aula-metodo-star'),
  (8, 3, 'As perguntas mais comuns e como responder', 'As perguntas que mais aparecem nas entrevistas de comissário, com o que o avaliador quer ouvir.', '<table>
<thead><tr><th>Pergunta</th><th>O que o avaliador quer saber</th><th>Como responder</th></tr></thead>
<tbody>
<tr><td>Fale sobre você.</td><td>Se você se comunica com clareza e foco.</td><td>Em 1 a 2 minutos: formação, experiência de atendimento, por que a aviação. Sem vida pessoal demais.</td></tr>
<tr><td>Por que quer ser comissário(a)?</td><td>Motivação real, além de "gosto de viajar".</td><td>Fale de servir, cuidar de pessoas e segurança, com um exemplo da sua vida.</td></tr>
<tr><td>Por que esta companhia?</td><td>Se você pesquisou.</td><td>Use a sua ficha da companhia (Módulo 02): valores e fatos ligados a você.</td></tr>
<tr><td>Qual sua experiência com atendimento?</td><td>Se você já lidou com público de verdade.</td><td>Uma história STAR com resultado.</td></tr>
<tr><td>Conte de um cliente difícil.</td><td>Calma, empatia e solução.</td><td>STAR, focando no que você fez.</td></tr>
<tr><td>Conte de um conflito com colega.</td><td>Maturidade e trabalho em equipe.</td><td>Mostre que conversou, ouviu e chegou a um acordo.</td></tr>
<tr><td>Qual o seu maior defeito?</td><td>Autoconhecimento.</td><td>Um ponto real, que não comprometa a função, e o que você faz para melhorar.</td></tr>
<tr><td>Qual a sua maior qualidade?</td><td>Se combina com a profissão.</td><td>Uma qualidade com um exemplo concreto.</td></tr>
<tr><td>Como você lida com pressão?</td><td>Equilíbrio emocional.</td><td>Uma situação real em que manteve a calma.</td></tr>
<tr><td>Você tem disponibilidade para mudar de cidade?</td><td>Se você entende a rotina.</td><td>Seja sincero(a). Se sim, diga que já pensou na logística.</td></tr>
<tr><td>Como lida com escala, feriados e madrugadas?</td><td>Se você conhece a realidade da profissão.</td><td>Mostre que sabe como é e explique como se organiza.</td></tr>
<tr><td>O que faria se visse um colega descumprindo um procedimento?</td><td>Cultura de segurança.</td><td>Conversaria com o colega e, se preciso, reportaria ao chefe de cabine. Segurança não se negocia.</td></tr>
<tr><td>Onde você se vê em 5 anos?</td><td>Se você pretende ficar e crescer.</td><td>Crescendo na companhia, por exemplo como chefe de cabine ou instrutor(a).</td></tr>
<tr><td>Tem alguma pergunta para nós?</td><td>Interesse real.</td><td>Sempre tenha uma. Veja a próxima aula.</td></tr>
</tbody>
</table>

<h3>Como treinar</h3>
<ul>
<li>Escreva tópicos, e não textos, para cada pergunta.</li>
<li>Responda em voz alta e grave no celular.</li>
<li>Peça para alguém fazer as perguntas fora de ordem.</li>
<li>Treine também as versões em inglês na <a href="/head-hunter/entrevista-ingles">Entrevista em inglês</a>.</li>
</ul>', 15, 'cc-aula-perguntas-mais-comuns'),
  (8, 4, 'Perguntas difíceis e o fechamento da entrevista', 'Como lidar com perguntas inesperadas, lacunas no currículo e o que perguntar ao entrevistador.', '<h3>Perguntas difíceis</h3>
<h4>"Você já participou de outra seleção e não passou. Por quê?"</h4>
<p>Seja honesto(a) e mostre evolução: "Na última seleção eu travei na dinâmica. Desde então treinei com grupos e fiz um curso de oratória."</p>

<h4>"Por que ficou um tempo sem trabalhar?"</h4>
<p>Explique em uma frase, sem drama, e diga o que fez no período: estudo, curso, cuidado com a família.</p>

<h4>"Por que saiu do último emprego?"</h4>
<p>Fale do que você buscava, e nunca critique o ex-empregador.</p>

<h4>"E se você não for aprovado(a)?"</h4>
<p>Mostre persistência: "Vou entender o que posso melhorar e tentar de novo. Esse é o meu objetivo profissional."</p>

<h4>Perguntas de situação</h4>
<p>"Um passageiro se recusa a desligar o celular durante a decolagem. O que você faz?" Use a ordem: oriente com educação, explique o motivo de segurança, insista com firmeza e, se não resolver, acione o chefe de cabine.</p>

<h3>Quando não souber a resposta</h3>
<ul>
<li>Respire e peça um momento: "Posso pensar um instante?"</li>
<li>Se não entendeu, peça para repetir.</li>
<li>Se não souber algo técnico, seja honesto(a) e diga como buscaria a resposta.</li>
</ul>

<h3>Perguntas para fazer ao entrevistador</h3>
<ul>
<li>"Como é o treinamento dos novos comissários?"</li>
<li>"O que diferencia os comissários que mais se destacam no primeiro ano?"</li>
<li>"Quais são os próximos passos do processo?"</li>
</ul>
<p>Evite perguntar sobre salário e folgas na primeira entrevista, a não ser que o entrevistador puxe o assunto.</p>

<h3>O fechamento</h3>
<ul>
<li>Agradeça pelo tempo e reforce o seu interesse em uma frase.</li>
<li>Cumprimente com o mesmo cuidado da chegada.</li>
<li>Mantenha a postura até sair do prédio ou desligar a chamada.</li>
</ul>', 10, 'cc-aula-perguntas-dificeis-e-fechamento'),
  (9, 1, 'Hospitalidade a bordo', 'O que é um atendimento de excelência no avião e como mostrar isso na seleção.', '<p>A bordo, o comissário é o rosto da companhia. Em poucas horas, ele precisa garantir a segurança e fazer cada passageiro se sentir cuidado, mesmo com espaço apertado, tempo curto e imprevistos.</p>

<h3>Os pilares do atendimento</h3>
<ul>
<li><strong>Cordialidade:</strong> cumprimento, sorriso e contato visual com cada passageiro.</li>
<li><strong>Atenção:</strong> perceber necessidades antes do pedido (a pessoa com frio, o idoso com dificuldade na bagagem).</li>
<li><strong>Personalização:</strong> chamar pelo nome quando possível, lembrar de pedidos.</li>
<li><strong>Resolução:</strong> se não pode fazer o que foi pedido, oferecer uma alternativa.</li>
<li><strong>Consistência:</strong> o mesmo cuidado com o primeiro e com o último passageiro.</li>
</ul>

<h3>Linguagem que acolhe</h3>
<table>
<thead><tr><th>Evite</th><th>Prefira</th></tr></thead>
<tbody>
<tr><td>"Acabou."</td><td>"Essa opção já acabou. Posso oferecer…?"</td></tr>
<tr><td>"Não é comigo."</td><td>"Vou verificar e já volto com a resposta."</td></tr>
<tr><td>"Tem que guardar a bolsa."</td><td>"Por segurança, preciso pedir que guarde a bolsa. Posso ajudar?"</td></tr>
<tr><td>"Calma."</td><td>"Entendo. Vou fazer o possível para resolver."</td></tr>
</tbody>
</table>

<h3>Segurança e serviço juntos</h3>
<p>Hospitalidade nunca passa na frente da segurança. Se um passageiro pede algo que contraria um procedimento, a resposta é não, mas um não <strong>educado, explicado e com alternativa</strong>.</p>

<h3>Na seleção</h3>
<ul>
<li>Use exemplos reais de atendimento da sua experiência.</li>
<li>Mostre que você gosta de servir pessoas, e não só de viajar.</li>
<li>Na dinâmica, trate os colegas como trataria passageiros.</li>
</ul>', 10, 'cc-aula-hospitalidade-a-bordo'),
  (9, 2, 'Passageiro difícil e gestão de conflitos', 'Um passo a passo para acalmar passageiros irritados sem perder o controle da situação.', '<p>Atraso, conexão perdida, bagagem extraviada, cansaço: muitos passageiros já embarcam estressados. O comissário precisa resolver sem levar para o lado pessoal.</p>

<h3>O método OUVIR</h3>
<table>
<thead><tr><th>Passo</th><th>O que fazer</th><th>Exemplo</th></tr></thead>
<tbody>
<tr><td><strong>O</strong>uça</td><td>Deixe a pessoa falar sem interromper.</td><td>Olhar no rosto, acenar.</td></tr>
<tr><td><strong>U</strong>se empatia</td><td>Reconheça o sentimento.</td><td>"Entendo que é frustrante perder a conexão."</td></tr>
<tr><td><strong>V</strong>erifique</td><td>Entenda o problema real e o que pode ser feito.</td><td>"Para qual cidade é a sua conexão?"</td></tr>
<tr><td><strong>I</strong>nforme</td><td>Diga com clareza o que você vai fazer.</td><td>"Vou falar com o chefe de cabine para checar as opções."</td></tr>
<tr><td><strong>R</strong>etorne</td><td>Volte com a resposta, mesmo que ela não seja a esperada.</td><td>"Conseguimos informar o solo; um agente vai encontrar o senhor na saída."</td></tr>
</tbody>
</table>

<h3>Tom e postura</h3>
<ul>
<li>Fale baixo e devagar: isso costuma baixar o tom do outro.</li>
<li>Se possível, fique na altura dos olhos do passageiro sentado.</li>
<li>Não discuta quem tem razão. Foque na solução.</li>
<li>Nunca prometa o que não pode cumprir.</li>
</ul>

<h3>Quando escalar</h3>
<p>Acione o chefe de cabine quando:</p>
<ul>
<li>A situação envolve segurança (o passageiro se recusa a seguir uma orientação).</li>
<li>Há agressão verbal persistente ou ameaça.</li>
<li>O passageiro parece alcoolizado ou fora de controle.</li>
<li>A solução depende de outra área (solo, comandante).</li>
</ul>
<p>Em situações mais graves, existem procedimentos específicos da companhia para passageiro indisciplinado. Você vai aprendê-los no treinamento.</p>

<h3>Na seleção</h3>
<p>Perguntas sobre cliente difícil são certas na entrevista e no julgamento situacional. Prepare uma história STAR e lembre: <strong>calma, empatia, solução e segurança</strong>.</p>', 12, 'cc-aula-passageiro-dificil'),
  (9, 3, 'Passageiros que precisam de atenção especial', 'PNAE, crianças desacompanhadas, gestantes, idosos e passageiros com medo de voar.', '<p>Alguns passageiros precisam de cuidado extra. Conhecer essas situações mostra preparo na entrevista e no julgamento situacional.</p>

<h3>PNAE: passageiro com necessidade de assistência especial</h3>
<p>Pelas regras da ANAC (Resolução nº 280), PNAE inclui pessoas com deficiência, pessoas com 60 anos ou mais, gestantes, lactantes, pessoas acompanhadas de criança de colo, pessoas com mobilidade reduzida e outras que, por alguma condição, tenham limitação na sua autonomia.</p>
<ul>
<li>A assistência deve ser oferecida com respeito à dignidade e à autonomia da pessoa.</li>
<li>Pergunte <strong>como</strong> a pessoa prefere ser ajudada, em vez de supor.</li>
<li>Fale diretamente com o passageiro, e não só com o acompanhante.</li>
<li>Equipamentos como cadeira de rodas e cão-guia têm regras próprias, definidas pela ANAC e pela companhia.</li>
</ul>

<h3>Criança desacompanhada</h3>
<p>Fica sob responsabilidade da tripulação durante o voo, conforme o procedimento da companhia. Atenção redobrada, apresentação da tripulação, ajuda nas refeições e entrega apenas ao responsável autorizado no destino.</p>

<h3>Gestantes</h3>
<p>As companhias têm regras sobre a partir de quantas semanas é preciso apresentar atestado médico. A bordo: atenção ao conforto, ao cinto de segurança (abaixo da barriga) e a qualquer sinal de mal-estar.</p>

<h3>Idosos</h3>
<ul>
<li>Ofereça ajuda com bagagem e no deslocamento, sem infantilizar.</li>
<li>Fale de frente e com clareza.</li>
<li>Confira se entendeu as instruções de segurança.</li>
</ul>

<h3>Medo de voar</h3>
<ul>
<li>Apresente-se e diga que está por perto.</li>
<li>Explique sons e movimentos normais do voo de forma simples.</li>
<li>Em turbulência, mantenha a calma no rosto e na voz: o passageiro olha para o comissário.</li>
</ul>

<blockquote><p>Regras específicas (prazos de aviso, documentos, acompanhante) estão nas normas da ANAC e nos manuais das companhias e podem mudar. Na seleção, o mais importante é mostrar respeito, iniciativa e cuidado.</p></blockquote>', 12, 'cc-aula-passageiros-com-necessidades-especiais'),
  (9, 4, 'Situações de cabine no julgamento situacional', 'Como decidir rápido e certo nas questões de situação: a ordem de prioridades.', '<p>No julgamento situacional (SJT), você recebe uma situação e precisa escolher, ou ordenar, as melhores reações. Não existe "pegadinha": existe uma lógica de prioridades.</p>

<h3>A ordem de prioridades</h3>
<ol>
<li><strong>Segurança</strong> de todos a bordo.</li>
<li><strong>Bem-estar e saúde</strong> dos passageiros.</li>
<li><strong>Procedimentos e hierarquia</strong> (chefe de cabine, comandante).</li>
<li><strong>Conforto e atendimento</strong>.</li>
<li><strong>Imagem da empresa</strong> e eficiência.</li>
</ol>

<h3>Respostas que costumam ser as melhores</h3>
<ul>
<li>Agir dentro da sua alçada, sem esperar ordens para o que é óbvio.</li>
<li>Comunicar o chefe de cabine quando a situação vai além da sua função.</li>
<li>Tratar o passageiro com educação, mesmo ao negar um pedido.</li>
<li>Resolver o problema e, depois, registrar ou reportar.</li>
</ul>

<h3>Respostas que costumam ser as piores</h3>
<ul>
<li><strong>Passivas:</strong> ignorar, esperar alguém perceber.</li>
<li><strong>Agressivas:</strong> responder no mesmo tom, ameaçar.</li>
<li><strong>Por cima da hierarquia:</strong> ir direto ao comandante para algo que o chefe de cabine resolve.</li>
<li><strong>Contra a regra:</strong> abrir exceção de segurança para agradar.</li>
<li><strong>Promessas vazias:</strong> garantir algo que você não sabe se pode cumprir.</li>
</ul>

<h3>Exemplos</h3>
<h4>Passageiro quer trocar para um assento de saída de emergência</h4>
<p>Verifique se ele cumpre os critérios para sentar ali (por regra, a pessoa precisa ser capaz de ajudar numa evacuação). Se não cumprir, explique com educação e ofereça outra opção.</p>

<h4>Colega esqueceu uma checagem antes da decolagem</h4>
<p>Avise o colega na hora e, se necessário, o chefe de cabine. Segurança vem antes do constrangimento.</p>

<h4>Passageiro passando mal durante o serviço</h4>
<p>Interrompa o serviço daquela fileira, avalie, avise o chefe de cabine e siga o procedimento de primeiros socorros. O serviço espera.</p>

<blockquote><p>Treine no Head Hunter com os treinos de julgamento situacional. Depois de cada questão, leia a explicação e pergunte: qual prioridade a resposta certa respeitou?</p></blockquote>', 12, 'cc-aula-situacoes-de-cabine-e-sjt')
) v(modulo, ordem, titulo, resumo, conteudo, dur, origem)
join modulos m on m.ordem = v.modulo
on conflict (origem) do update set modulo_id = excluded.modulo_id, ordem = excluded.ordem, titulo = excluded.titulo,
  resumo = excluded.resumo, conteudo = excluded.conteudo, duracao_min = excluded.duracao_min, updated_at = now();

select m.ordem as modulo, m.titulo, count(*) as aulas
from aulas a join modulos m on m.id = a.modulo_id
where a.origem like 'cc-aula-%'
group by 1, 2 order by 1;
