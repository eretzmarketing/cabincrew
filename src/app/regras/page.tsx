import type { Metadata } from "next";

export const metadata: Metadata = { title: "Regras do fórum" };

const regras = [
  ["Conte a experiência, não a prova", "Descreva formato, duração, número de participantes e como você se sentiu. Nunca reproduza questões, enunciados ou gabaritos de testes: além de violar os termos das plataformas, isso pode desclassificar você e outros candidatos."],
  ["Relate só o que você viveu", "Nada de boatos ou informações de terceiros. Se não tem certeza, não publique."],
  ["Respeito sempre", "Sem ofensas a candidatos, recrutadores ou companhias. Críticas são bem-vindas quando são sobre fatos."],
  ["Proteja a sua privacidade e a dos outros", "Não publique nomes, telefones, e-mails ou fotos de pessoas. Você pode publicar seus relatos como anônimo."],
  ["Sem propaganda", "Divulgação de cursos, serviços ou grupos pagos será removida."],
  ["Moderação", "Relatos com três denúncias ficam ocultos até a revisão da equipe. Contas que repetirem violações podem ser suspensas."],
];

export default function RegrasPage() {
  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <h1 className="font-display text-[34px] font-extrabold">Regras do fórum</h1>
        <p className="text-[17px] leading-relaxed text-ink-2">O fórum só funciona se todo mundo puder confiar no que lê. Por isso, estas regras valem para todos os relatos.</p>
        <ol className="flex flex-col gap-4">
          {regras.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="font-display text-2xl font-extrabold text-brand">{i + 1}</span>
              <div className="flex flex-col gap-1.5"><strong className="font-display text-[17px]">{t}</strong><span className="text-[15px] leading-relaxed text-ink-2">{d}</span></div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
