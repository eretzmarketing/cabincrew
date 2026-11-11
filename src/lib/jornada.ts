/**
 * Jornada da seleção: etapas na ordem do processo de cada companhia, tarefas com critério de conclusão
 * calculado a partir do que o aluno já fez, Missão do dia e sequência de dias de estudo.
 */
import { TODAS_AULAS, chaveAula } from "@/lib/ingles-a-bordo";
import type { PerfilOpq } from "@/lib/opq";

export const META = 80; // % para considerar um treino ou simulado "dominado"

export type Companhia = "latam" | "gol" | "azul";
export const COMPANHIAS: { slug: Companhia; nome: string; resumo: string }[] = [
  { slug: "latam", nome: "LATAM", resumo: "Prova técnica na JobCoach, testes SHL, dinâmica e entrevista. Inglês ICAO 4 conta muito." },
  { slug: "gol", nome: "GOL", resumo: "Dinâmica logo no início, depois testes e entrevistas. Pede inglês e espanhol de conversação." },
  { slug: "azul", nome: "Azul", resumo: "Teste de perfil e fit cultural primeiro, vídeo de apresentação e prova técnica. Pede um segundo idioma." },
];

export type Tarefa =
  | { tipo: "checkin"; titulo: string }
  | { tipo: "modulo"; ordem: number; titulo?: string }
  | { tipo: "treino"; banco: string; titulo: string }
  | { tipo: "simulado"; origem: string; titulo: string; href: string }
  | { tipo: "opq"; titulo: string }
  | { tipo: "ingles"; titulo: string };

type EtapaBase = { id: string; titulo: string; resumo: string; tarefas: Tarefa[]; dica?: Partial<Record<Companhia, string>> };

const ETAPAS: Record<string, EtapaBase> = {
  checkin: {
    id: "checkin", titulo: "Check-in", resumo: "Defina sua companhia-alvo e entenda a profissão e as seleções.",
    tarefas: [{ tipo: "checkin", titulo: "Escolher companhia-alvo e data da meta" }, { tipo: "modulo", ordem: 0 }, { tipo: "modulo", ordem: 1 }, { tipo: "modulo", ordem: 2 }],
  },
  documentos: {
    id: "documentos", titulo: "Documentos e triagem", resumo: "Requisitos, documentos, imagem pessoal, currículo e inscrição.",
    tarefas: [{ tipo: "modulo", ordem: 3 }, { tipo: "modulo", ordem: 4 }],
    dica: {
      latam: "A LATAM exige experiência comprovada em atendimento ou vendas, passaporte com 2 anos de validade e CIVP (febre amarela).",
      gol: "A GOL pede passaporte com pelo menos 6 meses de validade e CMA de 2ª classe.",
      azul: "A Azul pede curso com sobrevivência na selva e no mar e um segundo idioma intermediário.",
    },
  },
  tecnica: {
    id: "tecnica", titulo: "Prova técnica (ANAC)", resumo: "Conhecimentos da banca ANAC: segurança, legislação, primeiros socorros e técnicos.",
    tarefas: [
      { tipo: "treino", banco: "anac", titulo: "Treinos da banca ANAC" },
      { tipo: "simulado", origem: "cc-anac-completo", titulo: "Simulado completo da ANAC no modo Prova real", href: "/crew-select/anac" },
      { tipo: "treino", banco: "tecnico", titulo: "Questões técnicas extras" },
    ],
    dica: {
      latam: "Na LATAM a prova técnica é online (JobCoach), com câmera e bloqueio de troca de aba, e vale ranking. Faça os simulados no modo Prova real.",
      gol: "A certificação da ANAC é pré-requisito. Revise para chegar seguro(a) nas perguntas técnicas da entrevista.",
      azul: "A Azul aplica prova técnica depois do teste de perfil. Treine até passar de 80% com folga.",
    },
  },
  testes: {
    id: "testes", titulo: "Testes online", resumo: "Português, raciocínio, julgamento situacional e perfil comportamental.",
    tarefas: [
      { tipo: "treino", banco: "portugues", titulo: "Português" },
      { tipo: "treino", banco: "logico", titulo: "Raciocínio lógico e dedutivo" },
      { tipo: "treino", banco: "numerico", titulo: "Raciocínio numérico" },
      { tipo: "treino", banco: "verbal", titulo: "Raciocínio verbal" },
      { tipo: "treino", banco: "sjt", titulo: "Julgamento situacional" },
      { tipo: "opq", titulo: "Perfil comportamental coerente" },
      { tipo: "modulo", ordem: 6 },
    ],
    dica: {
      latam: "Na LATAM os testes SHL comportamental, psicométrico, dedutivo e de português são eliminatórios.",
      gol: "Na GOL os testes psicológicos vêm depois da dinâmica.",
      azul: "Na Azul o teste de perfil e fit cultural vem logo depois da inscrição. Comece pelo perfil comportamental.",
    },
  },
  dinamica: {
    id: "dinamica", titulo: "Dinâmica de grupo", resumo: "Como se comportar, liderar sem dominar e lidar com situações de cabine em grupo.",
    tarefas: [{ tipo: "modulo", ordem: 7 }, { tipo: "modulo", ordem: 9 }],
    dica: { gol: "Na GOL a dinâmica é a primeira etapa depois da inscrição. Prepare-se cedo." },
  },
  entrevista: {
    id: "entrevista", titulo: "Entrevistas", resumo: "Entrevista com RH e gestores, comunicação e apresentação pessoal.",
    tarefas: [{ tipo: "modulo", ordem: 8 }, { tipo: "modulo", ordem: 10 }],
    dica: { azul: "A Azul costuma pedir um vídeo de apresentação. Treine falar de você em 1 a 2 minutos." },
  },
  final: {
    id: "final", titulo: "Reta final e admissão", resumo: "Revisão geral, exames e o que vem depois da aprovação.",
    tarefas: [{ tipo: "modulo", ordem: 11 }, { tipo: "modulo", ordem: 12 }],
  },
};

export const ETAPA_INGLES: EtapaBase = {
  id: "ingles", titulo: "Inglês (em paralelo)", resumo: "O idioma leva tempo: estude um pouco todo dia, desde o começo.",
  tarefas: [{ tipo: "ingles", titulo: "Curso Inglês a bordo" }, { tipo: "treino", banco: "ingles", titulo: "Treinos de inglês" }],
  dica: {
    latam: "Na LATAM, 50% das vagas vão para quem tem inglês ICAO nível 4 ou mais.",
    gol: "A GOL pede conversação em inglês e espanhol.",
    azul: "A Azul pede inglês, espanhol, francês ou Libras em nível intermediário.",
  },
};

const ORDEM: Record<Companhia, string[]> = {
  latam: ["checkin", "documentos", "tecnica", "testes", "dinamica", "entrevista", "final"],
  gol: ["checkin", "documentos", "dinamica", "testes", "tecnica", "entrevista", "final"],
  azul: ["checkin", "documentos", "testes", "tecnica", "dinamica", "entrevista", "final"],
};

/* ------------------------------------------------------------------ dados do aluno */

export type DadosJornada = {
  companhias: Companhia[];
  anacLiberado: boolean;
  modulos: { id: number; ordem: number; titulo: string }[];
  aulas: { id: string; modulo_id: number; ordem: number; titulo: string }[];
  concluidas: Map<string, string>;                    // aula_id -> concluida_em
  tentativas: { simulado_id: number; nota: number | null; modo: string; finalizada_em: string }[];
  simulados: Map<number, { origem: string | null; bancos: string[] }>;
  ingles: Map<string, { concluida: boolean; updated_at: string }>;
  opq: { perfil: PerfilOpq; created_at: string }[];  // mais recente primeiro
  hoje: string;                                       // AAAA-MM-DD em São Paulo
};

export const diaSP = (iso: string | Date) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

/** Notas (mais recente primeiro) dos treinos e simulados de um único banco. */
function notasDoBanco(d: DadosJornada, banco: string) {
  return d.tentativas
    .filter((t) => { const s = d.simulados.get(t.simulado_id); return s && s.bancos.length === 1 && s.bancos[0] === banco && t.nota !== null; })
    .sort((a, b) => b.finalizada_em.localeCompare(a.finalizada_em))
    .map((t) => t.nota as number);
}

export type StatusTarefa = { feito: boolean; progresso: number; detalhe: string; href?: string; acao?: { banco: string }; bloqueada?: string; oculta?: boolean; titulo: string };

export function avaliar(t: Tarefa, d: DadosJornada): StatusTarefa {
  switch (t.tipo) {
    case "checkin": {
      const ok = d.companhias.length > 0;
      return { titulo: t.titulo, feito: ok, progresso: ok ? 1 : 0, detalhe: ok ? d.companhias.map((c) => COMPANHIAS.find((x) => x.slug === c)?.nome).join(", ") : "Leva 1 minuto", href: "/crew-select/checkin" };
    }
    case "modulo": {
      const m = d.modulos.find((x) => x.ordem === t.ordem);
      const aulas = m ? d.aulas.filter((a) => a.modulo_id === m.id) : [];
      if (!m || !aulas.length) return { titulo: t.titulo ?? m?.titulo ?? "", feito: false, progresso: 0, detalhe: "", oculta: true };
      const f = aulas.filter((a) => d.concluidas.has(a.id)).length;
      return { titulo: t.titulo ?? m.titulo, feito: f === aulas.length, progresso: f / aulas.length, detalhe: `${f} de ${aulas.length} aulas`, href: `/crew-select/modulo/${m.id}` };
    }
    case "treino": {
      if (t.banco === "anac" && !d.anacLiberado) return { titulo: t.titulo, feito: false, progresso: 0, detalhe: "", bloqueada: "Liberado pela equipe Cabin Crew" };
      const n = notasDoBanco(d, t.banco).slice(0, 3);
      const media = n.length ? Math.round(n.reduce((s, x) => s + x, 0) / n.length) : null;
      return {
        titulo: t.titulo, acao: { banco: t.banco },
        feito: media !== null && media >= META,
        progresso: media === null ? 0 : Math.min(1, media / META),
        detalhe: media === null ? "Ainda não treinou" : `Média recente ${media}% · meta ${META}%`,
      };
    }
    case "simulado": {
      if (t.origem.startsWith("cc-anac") && !d.anacLiberado) return { titulo: t.titulo, feito: false, progresso: 0, detalhe: "", bloqueada: "Liberado pela equipe Cabin Crew" };
      const ids = [...d.simulados.entries()].filter(([, s]) => s.origem === t.origem).map(([id]) => id);
      const notas = d.tentativas.filter((x) => ids.includes(x.simulado_id) && x.modo === "prova" && x.nota !== null).map((x) => x.nota as number);
      const melhor = notas.length ? Math.max(...notas) : null;
      return { titulo: t.titulo, href: t.href, feito: melhor !== null && melhor >= META, progresso: melhor === null ? 0 : Math.min(1, melhor / META), detalhe: melhor === null ? "Ainda não fez" : `Melhor nota ${melhor}% · meta ${META}%` };
    }
    case "opq": {
      const ult = d.opq[0];
      const coerente = !!ult && ult.perfil.incoerentes.length === 0 && ult.perfil.extremos < 70;
      const ok = d.opq.length >= 2 && coerente;
      return {
        titulo: t.titulo, href: "/crew-select/perfil-comportamental", feito: ok,
        progresso: ok ? 1 : Math.min(d.opq.length, 2) / 2 * (coerente ? 1 : 0.5),
        detalhe: !ult ? "Ainda não treinou" : ok ? `${d.opq.length} sessões, última coerente` : coerente ? "Faça mais uma sessão" : "Última sessão com respostas incoerentes ou forçadas",
      };
    }
    case "ingles": {
      const total = TODAS_AULAS.length;
      const f = TODAS_AULAS.filter((a) => d.ingles.get(chaveAula(a))?.concluida).length;
      return { titulo: t.titulo, href: "/crew-select/ingles-a-bordo", feito: total > 0 && f === total, progresso: total ? f / total : 0, detalhe: `${f} de ${total} aulas` };
    }
  }
}

export type EtapaAvaliada = EtapaBase & { tarefas: Tarefa[]; status: StatusTarefa[]; pct: number; feita: boolean; vazia: boolean; dicaCompanhia?: string };

function avaliarEtapa(e: EtapaBase, d: DadosJornada, principal: Companhia): EtapaAvaliada {
  // Azul: o perfil comportamental vem primeiro nos testes
  const tarefas = principal === "azul" && e.id === "testes" ? [...e.tarefas].sort((a, b) => Number(b.tipo === "opq" || (b.tipo === "treino" && b.banco === "sjt")) - Number(a.tipo === "opq" || (a.tipo === "treino" && a.banco === "sjt"))) : e.tarefas;
  const todos = tarefas.map((t) => avaliar(t, d));
  const visiveis = tarefas.map((t, i) => [t, todos[i]] as const).filter(([, s]) => !s.oculta);
  const contam = visiveis.filter(([, s]) => !s.bloqueada);
  const pct = contam.length ? Math.round((contam.reduce((s, [, x]) => s + x.progresso, 0) / contam.length) * 100) : 0;
  return {
    ...e,
    tarefas: visiveis.map(([t]) => t),
    status: visiveis.map(([, s]) => s),
    pct,
    vazia: contam.length === 0,
    feita: contam.length > 0 && contam.every(([, s]) => s.feito),
    dicaCompanhia: e.dica?.[principal],
  };
}

export function montarJornada(d: DadosJornada) {
  const principal: Companhia = d.companhias[0] ?? "latam";
  const etapas = ORDEM[principal].map((id) => avaliarEtapa(ETAPAS[id], d, principal));
  // etapas sem conteúdo publicado ainda ("em breve") não travam a jornada nem contam no percentual
  const comConteudo = etapas.filter((e) => !e.vazia);
  const atual = Math.max(0, etapas.findIndex((e) => !e.vazia && !e.feita));
  const todasFeitas = comConteudo.every((e) => e.feita);
  const ingles = avaliarEtapa(ETAPA_INGLES, d, principal);
  const pctGeral = comConteudo.length ? Math.round(comConteudo.reduce((s, e) => s + e.pct, 0) / comConteudo.length) : 0;
  const fim = Math.max(0, etapas.map((e) => !e.vazia).lastIndexOf(true));
  return { principal, etapas, atual: todasFeitas ? fim : atual, ingles, pctGeral, missao: missaoDoDia(d, etapas, todasFeitas ? fim : atual), sequencia: sequencia(d) };
}

/* ------------------------------------------------------------------ missão do dia */

export type ItemMissao = { id: "treino" | "aula" | "ingles"; titulo: string; detalhe: string; feito: boolean; href?: string; acao?: { banco: string } };

function missaoDoDia(d: DadosJornada, etapas: EtapaAvaliada[], atual: number): ItemMissao[] {
  const hojeTreinos = d.tentativas.filter((t) => t.modo === "treino" && diaSP(t.finalizada_em) === d.hoje);
  const bancoDe = (id: number) => d.simulados.get(id)?.bancos[0];

  // 1) treino rápido: o banco mais fraco a partir da etapa atual
  let treino: { banco: string; titulo: string } | undefined;
  for (let i = atual; i < etapas.length && !treino; i++) {
    const cands = etapas[i].tarefas.map((t, k) => [t, etapas[i].status[k]] as const)
      .filter(([t, s]) => t.tipo === "treino" && !s.feito && !s.bloqueada)
      .map(([t]) => t as Extract<Tarefa, { tipo: "treino" }>);
    if (cands.length) {
      const media = (b: string) => { const n = notasDoBanco(d, b).slice(0, 3); return n.length ? n.reduce((s, x) => s + x, 0) / n.length : -1; };
      treino = cands.sort((a, b) => media(a.banco) - media(b.banco))[0];
    }
  }
  treino ??= { banco: "portugues", titulo: "Português" };
  const feitoTreino = hojeTreinos.some((t) => bancoDe(t.simulado_id) !== "ingles");

  // 2) próxima aula da etapa atual (ou das seguintes)
  let aula: { id: string; titulo: string; modulo: string } | undefined;
  for (let i = atual; i < etapas.length && !aula; i++) {
    for (const t of etapas[i].tarefas) {
      if (t.tipo !== "modulo") continue;
      const m = d.modulos.find((x) => x.ordem === t.ordem);
      const a = m && d.aulas.filter((x) => x.modulo_id === m.id).sort((x, y) => x.ordem - y.ordem).find((x) => !d.concluidas.has(x.id));
      if (m && a) { aula = { id: a.id, titulo: a.titulo, modulo: m.titulo }; break; }
    }
  }
  const feitoAula = [...d.concluidas.values()].some((c) => diaSP(c) === d.hoje);

  // 3) inglês: próxima aula do Inglês a bordo, ou um treino de inglês
  const proxIngles = TODAS_AULAS.find((a) => !d.ingles.get(chaveAula(a))?.concluida);
  const feitoIngles = [...d.ingles.values()].some((x) => diaSP(x.updated_at) === d.hoje) || hojeTreinos.some((t) => bancoDe(t.simulado_id) === "ingles");

  return [
    { id: "treino", titulo: `Treino rápido: ${treino.titulo}`, detalhe: "10 questões com correção na hora, priorizando as que você ainda não viu e as que errou.", feito: feitoTreino, acao: { banco: treino.banco } },
    aula
      ? { id: "aula", titulo: `Aula: ${aula.titulo}`, detalhe: aula.modulo, feito: feitoAula, href: `/crew-select/aula/${aula.id}` }
      : { id: "aula", titulo: "Revise um módulo", detalhe: "Você concluiu as aulas disponíveis da sua etapa.", feito: feitoAula, href: "/crew-select#modulos" },
    proxIngles
      ? { id: "ingles", titulo: `Inglês: ${proxIngles.titulo}`, detalhe: `Aula ${chaveAula(proxIngles)} do Inglês a bordo`, feito: feitoIngles, href: `/crew-select/ingles-a-bordo/${proxIngles.modulo}/${proxIngles.numero}` }
      : { id: "ingles", titulo: "Treino rápido de inglês", detalhe: "10 questões com correção na hora.", feito: feitoIngles, acao: { banco: "ingles" } },
  ];
}

/** Dias seguidos com alguma atividade (conta a partir de hoje, ou de ontem se hoje ainda não estudou). */
function sequencia(d: DadosJornada) {
  const dias = new Set<string>([
    ...d.tentativas.map((t) => diaSP(t.finalizada_em)),
    ...[...d.concluidas.values()].map(diaSP),
    ...[...d.ingles.values()].map((x) => diaSP(x.updated_at)),
    ...d.opq.map((x) => diaSP(x.created_at)),
  ]);
  const dia = new Date(`${d.hoje}T12:00:00Z`);
  if (!dias.has(d.hoje)) dia.setUTCDate(dia.getUTCDate() - 1);
  let n = 0;
  while (dias.has(dia.toISOString().slice(0, 10))) { n++; dia.setUTCDate(dia.getUTCDate() - 1); }
  const ultimos7 = Array.from({ length: 7 }, (_, i) => { const x = new Date(`${d.hoje}T12:00:00Z`); x.setUTCDate(x.getUTCDate() - (6 - i)); const k = x.toISOString().slice(0, 10); return { dia: k, ativo: dias.has(k) }; });
  return { dias: n, estudouHoje: dias.has(d.hoje), ultimos7 };
}
