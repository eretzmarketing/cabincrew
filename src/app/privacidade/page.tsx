import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="bg-soft px-6 py-12">
      <article className="mx-auto flex max-w-[720px] flex-col gap-5 text-[16px] leading-relaxed text-ink-2">
        <h1 className="font-display text-[34px] font-extrabold text-navy">Política de privacidade</h1>
        <p className="rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-sm">
          Texto-base para revisão. Antes do lançamento, peça a um advogado para adequá-lo à LGPD e incluir os dados do
          controlador (razão social, CNPJ e contato do encarregado).
        </p>
        <h2 className="font-display text-xl font-bold text-navy">Dados que coletamos</h2>
        <p>Seu e-mail, para criar a conta e enviar o link de acesso; o apelido que você escolher; os relatos, confirmações e denúncias que você publicar; e o e-mail informado na lista de espera do Head Hunter.</p>
        <h2 className="font-display text-xl font-bold text-navy">Como usamos</h2>
        <p>Para operar o fórum, moderar o conteúdo e avisar sobre o Head Hunter a quem entrou na lista de espera. Não vendemos seus dados.</p>
        <h2 className="font-display text-xl font-bold text-navy">Anonimato</h2>
        <p>Relatos publicados como anônimos não exibem seu apelido para outros usuários. A equipe de moderação pode ver a autoria para aplicar as regras do fórum.</p>
        <h2 className="font-display text-xl font-bold text-navy">Seus direitos</h2>
        <p>Você pode apagar seus relatos a qualquer momento e excluir sua conta, com todos os seus dados, em Minha conta.</p>
      </article>
    </main>
  );
}
