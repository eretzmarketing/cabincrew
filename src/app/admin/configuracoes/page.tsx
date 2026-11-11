import type { Metadata } from "next";
import { Card, Chave, Titulo } from "@/components/admin-ui";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const cfg = await getConfig();
  return (
    <>
      <Titulo sub="Ligue ou desligue recursos do site. As mudanças valem na hora.">Configurações</Titulo>
      <Card className={cfg.manutencao ? "border-2 border-brand" : ""}>
        <Chave
          chave="manutencao"
          ligado={cfg.manutencao}
          titulo="Modo manutenção"
          descricao="Ligado: o público e os alunos veem apenas a página “Em breve”, sem cadastro. Administradores continuam usando o site normalmente. Para entrar com o site em manutenção, use cabincrew.com.br/entrar?equipe"
        />
      </Card>
      <Card>
        <Chave
          chave="crew_select_aberto"
          ligado={cfg.crew_select_aberto}
          titulo="Head Hunter liberado"
          descricao="Ligado: todo cadastrado acessa os módulos publicados. Desligado: os alunos veem a tela “Em breve”."
        />
      </Card>
      <Card>
        <Chave
          chave="forum_ativo"
          ligado={cfg.forum_ativo}
          titulo="Fórum de Seleções"
          descricao="Ligado: o fórum aparece no menu e as páginas de relatos ficam abertas. Desligado: tudo some do site, mas os dados continuam guardados."
        />
      </Card>
    </>
  );
}
