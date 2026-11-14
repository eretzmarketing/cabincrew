import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { EMPRESA } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de Uso", description: "Regras de uso da plataforma Cabin Crew, dos cursos Head Hunter, Flight Attendant English e Flight Attendant Spanish e dos Simulados ANAC." };

export default function TermosPage() {
  return (
    <PaginaLegal titulo="Termos de Uso">
      <h2>1. Quem somos</h2>
      <p>A plataforma <strong>{EMPRESA.marca}</strong> ({EMPRESA.site}) {EMPRESA.razaoSocial ? <>é mantida por <strong>{EMPRESA.razaoSocial}</strong>{EMPRESA.cnpj ? `, CNPJ ${EMPRESA.cnpj}` : ""}, com endereço em </> : "tem endereço em "}{EMPRESA.endereco} (“Cabin Crew”, “nós”). Contato: <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a> · WhatsApp <a href={EMPRESA.whatsappLink}>{EMPRESA.whatsapp}</a>.</p>

      <h2>2. Aceite</h2>
      <p>Ao criar uma conta ou comprar um curso, você declara que leu e concorda com estes Termos, com a <Link href="/privacidade">Política de Privacidade</Link>, com a <Link href="/reembolso">Política de Reembolso</Link> e com as <Link href="/regras">Regras do fórum</Link>. Registramos a data, a hora, o endereço IP e a versão dos textos aceitos. Se não concordar, não use a plataforma.</p>

      <h2>3. Cadastro e conta</h2>
      <ul>
        <li>O cadastro é pessoal e exige dados verdadeiros (nome completo, e-mail, WhatsApp e escola de aviação). Menores de 18 anos só podem se cadastrar e comprar com autorização do responsável legal.</li>
        <li>A conta é <strong>individual e intransferível</strong>. Você é responsável por manter sua senha em sigilo e por tudo o que for feito com o seu acesso.</li>
        <li>A foto de perfil deve mostrar o seu rosto, sem conteúdo ofensivo.</li>
      </ul>

      <h2>4. O que oferecemos</h2>
      <ul>
        <li><strong>Simulados ANAC:</strong> gratuitos para quem tem cadastro.</li>
        <li><strong>Head Hunter:</strong> curso de preparação para os processos seletivos de comissário(a) de voo das companhias aéreas (jornada personalizada, aulas, simulados, dinâmicas, perfil comportamental, entrevista em inglês e vídeo de apresentação).</li>
        <li><strong>Flight Attendant English:</strong> curso de inglês para aviação, vendido separadamente.</li>
        <li><strong>Flight Attendant Spanish:</strong> curso de espanhol para aviação, vendido separadamente.</li>
        <li>Planos combinados (combo) e promoções podem ser oferecidos na página <Link href="/planos">Planos</Link>. Cada curso pode ser comprado sozinho: a compra de um nunca é condição para a compra do outro.</li>
      </ul>

      <h2>5. Natureza dos cursos e limites</h2>
      <ul>
        <li>Os cursos são <strong>cursos livres</strong> de preparação. Não substituem o curso de comissário homologado pela ANAC, não concedem o Certificado de Conhecimentos Teóricos (CCT) nem qualquer licença ou habilitação.</li>
        <li>A Cabin Crew <strong>não tem vínculo</strong> com a ANAC nem com companhias aéreas. Nomes de empresas e marcas são citados apenas para fins informativos e educacionais.</li>
        <li>Os simulados são elaborados no estilo das provas e seleções, mas não reproduzem provas oficiais. <strong>Não garantimos aprovação</strong> em prova, seleção ou contratação: o resultado depende do seu desempenho e de critérios das empresas.</li>
        <li>Os requisitos e etapas das seleções mudam com frequência. Trabalhamos para manter o conteúdo atualizado, mas confira sempre o edital ou anúncio oficial de cada empresa.</li>
      </ul>

      <h2>6. Preço e pagamento</h2>
      <ul>
        <li>Os preços estão na página <Link href="/planos">Planos</Link> e podem mudar a qualquer momento, sem afetar compras já feitas.</li>
        <li>O pagamento é processado pelo <strong>Mercado Pago</strong>, por Pix ou cartão de crédito. No cartão, o parcelamento e os juros são definidos pelo Mercado Pago e aparecem antes da confirmação. Os dados do cartão não passam pelos nossos servidores.</li>
        <li>Cupons de desconto valem nas condições informadas (validade, quantidade e planos) e não podem ser trocados por dinheiro.</li>
      </ul>

      <h2>7. Acesso ao curso</h2>
      <ul>
        <li>O acesso é liberado assim que o pagamento é aprovado.</li>
        <li>O acesso vale <strong>até você concluir o curso</strong> e continua por mais alguns dias para revisão (o número de dias aparece na página de compra; hoje, 30 dias). Depois disso, o acesso ao conteúdo termina. Seus certificados continuam disponíveis.</li>
        <li>Podemos suspender o acesso temporariamente para manutenção ou atualização do conteúdo, procurando avisar com antecedência.</li>
      </ul>

      <h2>8. Uso permitido</h2>
      <p>O conteúdo é para seu uso pessoal de estudo. É proibido:</p>
      <ul>
        <li>compartilhar login e senha ou permitir que outra pessoa use sua conta;</li>
        <li>copiar, gravar, baixar, reproduzir, vender ou distribuir aulas, simulados, questões, áudios, textos ou materiais;</li>
        <li>usar robôs, scripts ou qualquer meio para extrair conteúdo ou burlar limites, simulados ou pagamentos;</li>
        <li>publicar conteúdo ilegal, ofensivo, discriminatório ou que viole direitos de terceiros.</li>
      </ul>
      <p>Em caso de violação, podemos suspender ou banir a conta, sem prejuízo das medidas legais cabíveis. Depois do prazo de arrependimento, o banimento por violação destes Termos não dá direito a reembolso.</p>

      <h2>9. Certificados</h2>
      <p>Ao concluir um curso, você pode emitir um certificado de conclusão de curso livre. Cada certificado tem um código e uma página pública de autenticação (<Link href="/autenticar">{EMPRESA.site}/autenticar</Link>) que mostra seu nome, sua foto de perfil, o curso, a carga horária e a data de conclusão, para que empresas possam conferir. Certificados emitidos por erro ou fraude podem ser revogados.</p>

      <h2>10. Comunicação por WhatsApp</h2>
      <p>O WhatsApp é o nosso canal oficial de avisos: confirmação de cadastro e de compra, lembretes de estudo, conclusões, certificados e, eventualmente, ofertas. Você pode pedir para não receber mensagens promocionais respondendo à mensagem ou pelo nosso contato.</p>

      <h2>11. Fórum e conteúdo dos usuários</h2>
      <p>Relatos e comentários publicados no fórum seguem as <Link href="/regras">Regras do fórum</Link>. Você continua responsável pelo que publica e nos autoriza a exibir esse conteúdo na plataforma. Podemos remover publicações que violem as regras.</p>

      <h2>12. Propriedade intelectual</h2>
      <p>Marcas, textos, aulas, questões, áudios, imagens, layout e software da plataforma pertencem à Cabin Crew ou a seus licenciantes e são protegidos pela Lei de Direitos Autorais (Lei 9.610/98) e pela Lei de Propriedade Industrial (Lei 9.279/96).</p>

      <h2>13. Responsabilidades</h2>
      <p>Fazemos o possível para manter a plataforma disponível e segura, mas podem ocorrer interrupções por manutenção, falhas de terceiros (hospedagem, internet, Mercado Pago, WhatsApp) ou caso fortuito. Nada nestes Termos limita os direitos que você tem como consumidor pelo Código de Defesa do Consumidor.</p>

      <h2>14. Cancelamento e exclusão da conta</h2>
      <ul>
        <li>Você pode pedir o reembolso nos termos da <Link href="/reembolso">Política de Reembolso</Link>.</li>
        <li>Você pode excluir sua conta a qualquer momento em <Link href="/conta">Minha conta</Link>. A exclusão encerra o acesso aos cursos. Se ainda estiver no prazo de 7 dias da compra e quiser o reembolso, peça-o <strong>antes</strong> de excluir a conta.</li>
        <li>Mesmo após a exclusão, mantemos os registros exigidos por lei (compras, aceites e dados de acesso), conforme a Política de Privacidade.</li>
      </ul>

      <h2>15. Alterações</h2>
      <p>Podemos atualizar estes Termos. A versão vigente fica sempre nesta página, com a data no topo. Mudanças relevantes serão avisadas; compras já feitas seguem as condições da época da compra.</p>

      <h2>16. Lei e foro</h2>
      <p>Estes Termos seguem as leis brasileiras. Fica eleito o foro do domicílio do consumidor, conforme o Código de Defesa do Consumidor; nos demais casos, o foro de {EMPRESA.cidadeForo}.</p>
    </PaginaLegal>
  );
}
