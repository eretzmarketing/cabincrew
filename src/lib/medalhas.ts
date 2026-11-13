/** Medalhas do Head Hunter, calculadas a partir do que o aluno já fez (nada é gravado à parte). */
import { META, maiorSequencia, type DadosJornada, type montarJornada } from "@/lib/jornada";

type Jornada = ReturnType<typeof montarJornada>;

export type Medalha = { id: string; emoji: string; nome: string; como: string; ganha: boolean; progresso?: string };

export function calcularMedalhas(d: DadosJornada, j: Jornada): Medalha[] {
  const seq = maiorSequencia(d);
  const treinos = d.tentativas.filter((t) => t.modo === "treino" && t.nota !== null);
  const provas = d.tentativas.filter((t) => t.modo === "prova" && t.nota !== null);
  const etapasFeitas = j.etapas.filter((e) => e.feita).length;
  const comConteudo = j.etapas.filter((e) => !e.vazia).length;
  const treinosIngles = treinos.filter((t) => d.simulados.get(t.simulado_id)?.bancos.includes("ingles")).length;
  const coerente = d.opq.some((o) => o.perfil.incoerentes.length === 0 && o.perfil.extremos < 70);
  const melhorVideo = Math.max(0, ...d.videos.map((v) => v.nota));
  const dez = (n: number, alvo: number) => `${Math.min(n, alvo)} de ${alvo}`;

  return [
    { id: "checkin", emoji: "🧭", nome: "Plano de voo", como: "Fazer o check-in e escolher a companhia-alvo.", ganha: d.companhias.length > 0 },
    { id: "aula", emoji: "🛫", nome: "Decolagem", como: "Concluir a primeira aula.", ganha: d.concluidas.size > 0 },
    { id: "aulas25", emoji: "📚", nome: "Leitura de bordo", como: "Concluir 25 aulas.", ganha: d.concluidas.size >= 25, progresso: dez(d.concluidas.size, 25) },
    { id: "seq3", emoji: "🔥", nome: "Em ritmo", como: "Estudar 3 dias seguidos.", ganha: seq >= 3, progresso: dez(seq, 3) },
    { id: "seq7", emoji: "🗓️", nome: "Semana completa", como: "Estudar 7 dias seguidos.", ganha: seq >= 7, progresso: dez(seq, 7) },
    { id: "seq30", emoji: "🏅", nome: "Tripulante dedicado", como: "Estudar 30 dias seguidos.", ganha: seq >= 30, progresso: dez(seq, 30) },
    { id: "treinos20", emoji: "🎯", nome: "Treino diário", como: "Fazer 20 treinos de 10 questões.", ganha: treinos.length >= 20, progresso: dez(treinos.length, 20) },
    { id: "mira", emoji: "✅", nome: "Mira certeira", como: `Tirar ${META}% ou mais em um treino.`, ganha: treinos.some((t) => (t.nota ?? 0) >= META) },
    { id: "prova", emoji: "📝", nome: "Prova real aprovada", como: `Tirar ${META}% ou mais em um simulado no modo Prova real.`, ganha: provas.some((t) => (t.nota ?? 0) >= META) },
    { id: "gabaritou", emoji: "💯", nome: "Gabarito", como: "Acertar 100% em um treino ou simulado.", ganha: [...treinos, ...provas].some((t) => t.nota === 100) },
    { id: "perfil", emoji: "🧩", nome: "Perfil coerente", como: "Terminar o perfil comportamental sem respostas incoerentes ou forçadas.", ganha: coerente },
    { id: "video", emoji: "🎥", nome: "Câmera ligada", como: `Tirar ${META}% ou mais no treino de vídeo de apresentação.`, ganha: melhorVideo >= META },
    { id: "ingles", emoji: "🇬🇧", nome: "Welcome aboard", como: "Fazer 5 treinos de inglês.", ganha: treinosIngles >= 5, progresso: dez(treinosIngles, 5) },
    { id: "etapa", emoji: "🛬", nome: "Primeira etapa", como: "Concluir uma etapa da jornada.", ganha: etapasFeitas >= 1 },
    { id: "pronto", emoji: "👑", nome: "Pronto para a seleção", como: "Concluir todas as etapas da jornada.", ganha: comConteudo > 0 && etapasFeitas >= comConteudo, progresso: dez(etapasFeitas, comConteudo) },
  ];
}
