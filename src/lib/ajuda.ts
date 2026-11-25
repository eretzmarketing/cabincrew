// Central de ajuda do aluno. Respostas aceitam links no formato [texto](/caminho).
// Regras: não citar quantidade de questões do banco; não anunciar "garantia de 7 dias" (só apontar a Política de Reembolso).

export type Pergunta = { p: string; r: string };
export type Categoria = { id: string; icone: string; titulo: string; resumo: string; itens: Pergunta[] };

export const AJUDA: Categoria[] = [
  {
    id: "conta", icone: "👤", titulo: "Cadastro e conta", resumo: "Criar conta, senha, dados e exclusão.",
    itens: [
      { p: "Como criar minha conta?", r: "Clique em [Criar conta](/entrar), preencha nome, e-mail, WhatsApp e a sua escola de aviação e crie uma senha. Pronto: você já entra na plataforma e pode fazer os simulados da ANAC." },
      { p: "Esqueci minha senha. O que faço?", r: "Na tela de [entrar](/entrar?modo=esqueci), clique em “Esqueci minha senha” e informe o seu e-mail. Você recebe um link para criar uma senha nova. Não chegou? Olhe a caixa de Spam e o Lixo eletrônico." },
      { p: "Como altero meus dados ou minha foto?", r: "Entre em [Minha conta](/conta). Lá você atualiza nome, WhatsApp, escola, foto e senha." },
      { p: "Por que a plataforma pede a minha escola de aviação?", r: "Algumas escolas são parceiras da Cabin Crew e os alunos delas podem receber benefícios extras. Informe a escola em que você estuda ou estudou." },
      { p: "Posso usar a mesma conta em mais de um aparelho?", r: "Pode entrar pelo computador e pelo celular, e o seu progresso fica salvo nos dois. A conta é pessoal e intransferível: não compartilhe a sua senha." },
      { p: "Como excluo a minha conta?", r: "Em [Minha conta](/conta), no final da página, use “Excluir minha conta”. A exclusão é definitiva e encerra o acesso aos cursos. Se for pedir reembolso, peça antes de excluir (veja a [Política de Reembolso](/reembolso))." },
    ],
  },
  {
    id: "simulados", icone: "📝", titulo: "Simulados ANAC", resumo: "Treinos, simulados, gabarito e modo Prova real.",
    itens: [
      { p: "Os simulados da ANAC são grátis?", r: "Sim. Basta ter cadastro para treinar e fazer os [simulados da ANAC](/simulados-anac), por bloco da prova." },
      { p: "Como funciona um simulado?", r: "Cada simulado segue o formato da prova: 20 questões sorteadas do bloco, em 30 minutos. Ao terminar você vê a nota, o gabarito e quais questões errou." },
      { p: "O que é o modo Prova real?", r: "É o simulado feito como na prova de verdade: com tempo correndo e registro de cada vez que você sai da página. Nas provas online das companhias, sair da página é detectado e pode eliminar, então vale treinar assim." },
      { p: "Encontrei um erro numa questão. Como aviso?", r: "Depois de ver o gabarito, use o botão “Reportar erro” na própria questão. A nossa equipe confere e, se a resposta estiver errada, corrige no sistema." },
      { p: "Onde vejo meus resultados?", r: "Ao terminar cada simulado você vê a nota e o gabarito. No painel de [Minha conta](/conta) aparecem quantos simulados você fez, a sua média e a melhor nota." },
    ],
  },
  {
    id: "plus", icone: "⭐", titulo: "Questões Plus", resumo: "Comentários, favoritas e simulado das favoritas.",
    itens: [
      { p: "O que é o Questões Plus?", r: "São recursos extras nas questões: comentar e tirar dúvidas com outros alunos em cada questão, favoritar as questões que você quer revisar e fazer um simulado só com as suas favoritas." },
      { p: "Como funciona o simulado das favoritas?", r: "Quando você tem 20 questões favoritas no mesmo bloco, libera um simulado daquele bloco com 20 questões sorteadas das suas favoritas, em 30 minutos. Você pode favoritar quantas quiser." },
      { p: "Quando posso comentar ou favoritar?", r: "Depois de terminar o simulado e ver o gabarito. Assim ninguém vê a resposta antes de tentar." },
      { p: "Como consigo o Questões Plus?", r: "Ele pode vir liberado pela sua escola parceira ou pela nossa equipe. Para saber como ter, abra um chamado em [Suporte](/conta/suporte)." },
    ],
  },
  {
    id: "head-hunter", icone: "🎯", titulo: "Head Hunter", resumo: "Jornada até a aprovação, etapas e IA.",
    itens: [
      { p: "O que é o Head Hunter?", r: "É o nosso preparatório completo para as seleções de comissário(a) de voo: aulas, treinos e uma jornada passo a passo, montada conforme a companhia que você quer (LATAM, GOL ou Azul). Veja os [planos](/planos)." },
      { p: "Como funciona a jornada?", r: "No [Head Hunter](/head-hunter) você escolhe a companhia-alvo e a data da sua meta. A jornada mostra as etapas na ordem da seleção daquela companhia e o que fazer em cada uma. A etapa atual fica em destaque." },
      { p: "Posso trocar a companhia-alvo?", r: "Pode. Na primeira etapa da jornada, clique em “Revisar” e escolha outra companhia. As etapas se reorganizam na ordem da seleção dela." },
      { p: "As próximas etapas estão com cadeado. Posso adiantar?", r: "Pode abrir e estudar à vontade. O cadeado só indica a ordem recomendada. O que você adiantar passa a contar no progresso quando chegar naquela etapa." },
      { p: "Como funciona a análise do vídeo e do currículo com IA?", r: "No Head Hunter você envia o seu vídeo de apresentação e o seu currículo e recebe uma análise com pontos fortes e o que melhorar. Cada compra dá um número de análises. Precisa de mais? Fale com a gente em [Suporte](/conta/suporte)." },
    ],
  },
  {
    id: "idiomas", icone: "🌎", titulo: "Inglês e espanhol", resumo: "Cursos Flight Attendant English e Spanish.",
    itens: [
      { p: "Os cursos de inglês e espanhol estão no Head Hunter?", r: "Não, são vendidos à parte: [Flight Attendant English](/english) e [Flight Attendant Spanish](/spanish), com o vocabulário e as situações de bordo cobrados nas seleções." },
      { p: "Por que o idioma é tão importante?", r: "As companhias dão muito peso ao idioma. Na LATAM, por exemplo, metade das vagas vai para quem comprova nível ICAO 4 ou mais em inglês e/ou espanhol. Por isso vale treinar todo dia, desde o começo." },
    ],
  },
  {
    id: "pagamentos", icone: "💳", titulo: "Pagamentos e pedidos", resumo: "Pix, cartão, cupons, pedidos e reembolso.",
    itens: [
      { p: "Quais as formas de pagamento?", r: "Pix ou cartão de crédito em até 12x, pelo Mercado Pago. Quando houver desconto no Pix, ele aparece na página de compra. No cartão, os juros do parcelamento são da operadora." },
      { p: "Em quanto tempo o acesso é liberado?", r: "Assim que o pagamento é aprovado: no Pix, em poucos minutos; no cartão, logo após a aprovação. Se não liberou, abra um chamado em [Suporte](/conta/suporte) com o comprovante." },
      { p: "Como uso um cupom de desconto?", r: "Na página de pagamento, digite o código no campo de cupom e aplique antes de pagar. Cada cupom tem validade e regras próprias." },
      { p: "Onde vejo as minhas compras?", r: "Em [Minha conta](/conta) aparecem os cursos liberados para você. Os pedidos da loja de apostilas ficam em [Meus pedidos](/conta/pedidos)." },
      { p: "Como peço reembolso?", r: "Veja as regras e como pedir na [Política de Reembolso](/reembolso)." },
      { p: "O pagamento é seguro?", r: "Sim. O pagamento é feito pelo Mercado Pago, com conexão segura. A Cabin Crew não vê nem guarda os dados do seu cartão." },
    ],
  },
  {
    id: "acesso", icone: "🎓", titulo: "Acesso e certificados", resumo: "Validade do curso, certificado e validação.",
    itens: [
      { p: "Por quanto tempo tenho acesso ao curso?", r: "O acesso vale até você concluir o curso e continua por mais alguns dias para revisão. O número de dias aparece na página de compra. Os detalhes estão nos [Termos de Uso](/termos)." },
      { p: "Meu progresso fica salvo?", r: "Sim. Cada aula e treino concluído fica salvo na sua conta. Você continua de onde parou, em qualquer aparelho." },
      { p: "Como recebo o meu certificado?", r: "Ao concluir o curso, aparece o botão “Baixar meu certificado” na página do curso e em [Minha conta](/conta). O certificado continua disponível mesmo depois que o acesso termina." },
      { p: "Como alguém confere se o certificado é verdadeiro?", r: "Cada certificado tem um código. Qualquer pessoa pode conferir em [Autenticar certificado](/autenticar)." },
    ],
  },
  {
    id: "loja", icone: "📦", titulo: "Loja de apostilas", resumo: "Frete, envio e rastreio.",
    itens: [
      { p: "Como compro uma apostila?", r: "Escolha o produto na [Loja](/loja), informe o endereço para calcular o frete e pague por Pix ou cartão." },
      { p: "Como acompanho a entrega?", r: "Quando o pedido é enviado, o código de rastreio aparece em [Meus pedidos](/conta/pedidos)." },
      { p: "O pedido não chegou ou veio com problema. E agora?", r: "Abra um chamado em [Suporte](/conta/suporte) com o número do pedido e, se possível, uma foto. A gente resolve com você." },
    ],
  },
  {
    id: "suporte", icone: "💬", titulo: "Suporte", resumo: "Como falar com a equipe.",
    itens: [
      { p: "Como falo com a equipe da Cabin Crew?", r: "Se você tem conta, abra um chamado em [Minha conta › Suporte](/conta/suporte): você acompanha a resposta pelo site e recebe o aviso no WhatsApp. Sem conta, use a página de [Contato](/contato)." },
      { p: "Em quanto tempo vocês respondem?", r: "Respondemos os chamados por ordem de chegada, o mais rápido possível. Quanto mais detalhes (prints, número do pedido), mais rápido conseguimos resolver." },
    ],
  },
];

/** Perguntas em destaque no topo da central. */
export const FREQUENTES: [string, string][] = [
  ["simulados", "Os simulados da ANAC são grátis?"],
  ["conta", "Esqueci minha senha. O que faço?"],
  ["pagamentos", "Em quanto tempo o acesso é liberado?"],
  ["head-hunter", "Como funciona a jornada?"],
  ["acesso", "Como recebo o meu certificado?"],
  ["plus", "O que é o Questões Plus?"],
];
