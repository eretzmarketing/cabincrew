import type { Metadata } from "next";
import { Card, Titulo } from "@/components/admin-ui";
import { IAForm } from "@/components/IAForm";
import { MODELO_PADRAO, configIA } from "@/lib/ia-video";

export const metadata: Metadata = { title: "Inteligência artificial" };
export const dynamic = "force-dynamic";

export default function IAPage() {
  const cfg = configIA();
  return (
    <>
      <Titulo sub="A IA assiste aos vídeos de apresentação dos alunos e dá nota e feedback, para você não precisar assistir um por um.">Inteligência artificial</Titulo>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold">OpenAI (ChatGPT)</h2>
          <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${cfg?.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eceef3] text-ink-2"}`}>{cfg ? (cfg.ativo ? "Ligado" : "Desligado") : "Sem chave"}</span>
        </div>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px] text-ink-2">
          <li>Em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="font-semibold text-navy underline">platform.openai.com › API keys</a>, crie uma chave (pode usar a mesma da Horsky ou criar uma só para a Cabin Crew).</li>
          <li>Cole a chave aqui. Ela é conferida na hora e fica só no servidor do site: não vai para o banco de dados e não aparece de novo nesta tela.</li>
          <li>Mantenha crédito na conta da OpenAI. Cada análise (transcrição da fala + avaliação com fotos do vídeo) custa poucos centavos de dólar com o {MODELO_PADRAO}.</li>
        </ol>
        <IAForm conectada={!!cfg} modelo={cfg?.modelo ?? MODELO_PADRAO} porDia={cfg?.porDia ?? 3} ativo={cfg?.ativo ?? true} />
      </Card>
      <Card>
        <h2 className="font-display text-xl font-extrabold">Como funciona para o aluno</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px] text-ink-2">
          <li>Depois de gravar em Head Hunter › Vídeo de apresentação, ele clica em <strong>“Analisar com IA”</strong> e autoriza o envio.</li>
          <li>O vídeo vai para a análise e é descartado em seguida: o site guarda só a nota, o feedback e o texto da fala.</li>
          <li>Ele recebe nota de 0 a 100, nota por critério (conteúdo, fala, olhar, sorriso, postura, luz e fundo), pontos fortes e o que melhorar.</li>
          <li>Você vê a nota e o feedback de cada aluno em <strong>Usuários › ficha do aluno</strong>.</li>
        </ul>
      </Card>
    </>
  );
}
