/** Perfil comportamental (estilo OPQ/SHL): os traços medidos e o que cada um significa para as companhias. */

export type TracoOpq = {
  nome: string;
  emoji: string;
  mede: string;          // o que o traço descreve
  companhias: string;    // o que a seleção observa
  baixo: string;         // leitura quando o resultado vem baixo
};

export const TRACOS_OPQ: TracoOpq[] = [
  { nome: "Orientação a Serviço", emoji: "🤝", mede: "Prazer em atender, receber bem e resolver o problema do cliente.", companhias: "É a base da profissão. As três companhias pedem experiência em atendimento e observam hospitalidade na dinâmica e na entrevista.", baixo: "Pense em situações reais em que você atendeu bem alguém. Se o atendimento não te motiva, vale refletir se a profissão combina com você." },
  { nome: "Disciplina e Segurança", emoji: "🛡️", mede: "Seguir procedimentos, respeitar a hierarquia e reportar riscos e erros.", companhias: "Segurança vem antes de tudo na aviação. Quem relativiza regras é um sinal de alerta forte para os avaliadores.", baixo: "Na aviação, seguir o procedimento não é falta de iniciativa: é o que protege todos a bordo. Reveja suas respostas sobre regras e checagens." },
  { nome: "Trabalho em Equipe", emoji: "👥", mede: "Colaborar, dividir tarefas e apoiar os colegas.", companhias: "A cada voo você trabalha com uma equipe diferente. A dinâmica de grupo mede exatamente isso.", baixo: "Mesmo quem rende bem sozinho precisa mostrar que coopera. Lembre de exemplos em que você ajudou um colega." },
  { nome: "Comunicação", emoji: "💬", mede: "Clareza, escuta e adaptação da fala a cada pessoa.", companhias: "Avaliada em todas as etapas presenciais: dinâmica, entrevista e vídeo.", baixo: "Treine falar com frases curtas e confirmar se a pessoa entendeu. A entrevista e a dinâmica são ótimas para praticar." },
  { nome: "Empatia", emoji: "💗", mede: "Perceber e respeitar o que o outro sente e precisa.", companhias: "Essencial com passageiros com medo, idosos, crianças e pessoas com deficiência.", baixo: "Empatia não é concordar com todo mundo: é entender o momento do outro antes de agir." },
  { nome: "Resiliência", emoji: "🌱", mede: "Calma sob pressão e recuperação rápida depois de dias difíceis.", companhias: "Jornadas longas, atrasos e passageiros difíceis fazem parte da rotina. A seleção procura estabilidade emocional.", baixo: "Observe como você reage ao cansaço e às críticas. Respiração, descanso e rotina ajudam muito na profissão." },
  { nome: "Flexibilidade", emoji: "🔄", mede: "Adaptação a mudanças de escala, de cidade, de equipe e de cultura.", companhias: "Escala variável, pernoites e possível mudança de base. As companhias perguntam sobre isso na entrevista.", baixo: "Pense se você está pronto(a) para horários irregulares e mudanças de cidade, que são parte do dia a dia." },
  { nome: "Organização", emoji: "🗂️", mede: "Pontualidade, planejamento e cuidado com documentos e apresentação.", companhias: "Atrasos e documentos vencidos eliminam. A apresentação pessoal também é avaliada.", baixo: "Use agenda e checklists. Pontualidade é inegociável na aviação." },
  { nome: "Proatividade", emoji: "🚀", mede: "Antecipar problemas e agir sem esperar alguém pedir.", companhias: "Comissário bom percebe a necessidade antes do passageiro pedir.", baixo: "Proatividade a bordo é perceber e avisar, sempre dentro do procedimento." },
  { nome: "Liderança", emoji: "🧭", mede: "Assumir a frente, coordenar e motivar quando a situação pede.", companhias: "Não é preciso ser chefe: a seleção quer quem assume a frente numa emergência e respeita a hierarquia no dia a dia.", baixo: "Na dinâmica, liderar não é falar mais alto: é organizar o grupo e dar voz a todos." },
  { nome: "Integridade", emoji: "⚖️", mede: "Honestidade, discrição com informações e coerência entre o que diz e o que faz.", companhias: "A LATAM revisa toda a trajetória do candidato antes da proposta. Inconsistências eliminam em qualquer fase.", baixo: "Respostas sinceras são o caminho. Testes comportamentais detectam respostas forçadas." },
];

export const TRACO_POR_NOME = Object.fromEntries(TRACOS_OPQ.map((t) => [t.nome, t]));

export type PerfilOpq = {
  tracos: { traco: string; pontos: number; n: number }[];
  incoerentes: string[];
  extremos: number;     // % de respostas no extremo "favorável"
  respondidas: number;
};

export const faixa = (p: number) => (p >= 70 ? "Alto" : p >= 40 ? "Médio" : "Baixo");

export const ESCALA = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
