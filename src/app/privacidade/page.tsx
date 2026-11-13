import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { EMPRESA } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de Privacidade", description: "Como a Cabin Crew coleta, usa, compartilha e protege os seus dados pessoais, conforme a LGPD." };

export default function PrivacidadePage() {
  return (
    <PaginaLegal titulo="Política de Privacidade">
      <p>Esta política explica como tratamos os seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).</p>

      <h2>1. Quem é o controlador</h2>
      <p><strong>{EMPRESA.razaoSocial || EMPRESA.marca}</strong>{EMPRESA.cnpj ? `, CNPJ ${EMPRESA.cnpj}` : ""}, {EMPRESA.endereco}. Contato para assuntos de privacidade e proteção de dados{EMPRESA.encarregado ? ` (encarregado: ${EMPRESA.encarregado})` : ""}: <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.</p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome completo, e-mail, WhatsApp, escola de aviação, senha (guardada de forma criptografada) e foto de perfil.</li>
        <li><strong>Uso dos cursos:</strong> aulas concluídas, respostas e notas de simulados e treinos, check-in (companhias de interesse e datas), perfil comportamental, progresso no inglês, treinos de vídeo, ranking e medalhas.</li>
        <li><strong>Compras:</strong> plano, valor, forma de pagamento, parcelas, ID da transação, data e hora, cupom usado e CPF informado no pagamento. <strong>Não recebemos nem guardamos os dados do cartão</strong>: eles vão direto para o Mercado Pago.</li>
        <li><strong>Registros de aceite e acesso:</strong> data, hora, endereço IP e navegador ao aceitar estes documentos, ao comprar e ao excluir a conta.</li>
        <li><strong>Lista “Em breve”:</strong> nome e WhatsApp de quem pediu para ser avisado do lançamento.</li>
        <li><strong>Fórum:</strong> relatos, comentários e denúncias que você publicar.</li>
        <li><strong>Mensagens:</strong> histórico das mensagens de WhatsApp que enviamos a você.</li>
      </ul>

      <h2>3. Para que usamos e com qual base legal</h2>
      <ul>
        <li><strong>Prestar o serviço</strong> (conta, cursos, simulados, certificados, suporte) — execução de contrato.</li>
        <li><strong>Processar pagamentos, emitir documentos fiscais e guardar provas da compra</strong> — execução de contrato, obrigação legal e exercício regular de direitos.</li>
        <li><strong>Avisos pelo WhatsApp</strong> (confirmações, lembretes de estudo, conclusões) — execução de contrato e legítimo interesse.</li>
        <li><strong>Ofertas e cupons</strong> — legítimo interesse ou consentimento; você pode recusar a qualquer momento.</li>
        <li><strong>Segurança e prevenção de fraudes</strong> (banimento por compartilhamento de conta, registros de acesso) — legítimo interesse e Marco Civil da Internet.</li>
        <li><strong>Melhorar os cursos</strong> com estatísticas de uso — legítimo interesse.</li>
      </ul>
      <p>Não vendemos seus dados.</p>

      <h2>4. Com quem compartilhamos</h2>
      <ul>
        <li><strong>Mercado Pago</strong> — processamento de pagamentos.</li>
        <li><strong>Wawp / WhatsApp</strong> — envio das mensagens (seu número e o texto da mensagem).</li>
        <li><strong>Supabase</strong> — banco de dados e autenticação; <strong>Hostinger</strong> — hospedagem do site.</li>
        <li><strong>ElevenLabs</strong> — geração dos áudios das aulas (não recebe dados de alunos).</li>
        <li>Autoridades, quando exigido por lei ou ordem judicial.</li>
      </ul>
      <p>Alguns desses fornecedores podem armazenar dados fora do Brasil, com as garantias exigidas pela LGPD.</p>

      <h2>5. O que fica público</h2>
      <ul>
        <li><strong>Ranking:</strong> primeiro nome, foto e pontos — você pode se esconder do ranking.</li>
        <li><strong>Fórum:</strong> seu apelido nas publicações (relatos anônimos não mostram o apelido a outros usuários; a moderação pode ver a autoria).</li>
        <li><strong>Certificados:</strong> quem tiver o código do seu certificado pode abrir a página de autenticação, que mostra seu nome, foto, curso, carga horária, data de conclusão e aproveitamento. O código só é conhecido por quem você compartilhar.</li>
      </ul>

      <h2>6. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados da conta e de uso: enquanto a conta existir.</li>
        <li>Compras e documentos fiscais: pelo prazo da legislação fiscal e consumerista (em regra, 5 anos), mesmo após a exclusão da conta.</li>
        <li>Registros de acesso: no mínimo 6 meses (Marco Civil da Internet).</li>
        <li>Registro de exclusão de conta e aceites: pelo prazo necessário para defesa em eventuais processos.</li>
      </ul>

      <h2>7. Seus direitos</h2>
      <p>Você pode pedir confirmação e acesso aos seus dados, correção, anonimização, portabilidade, informação sobre compartilhamento, revogação de consentimento e exclusão. Muita coisa você mesmo faz em <Link href="/conta">Minha conta</Link> (dados, foto, senha e exclusão da conta). Para os demais pedidos, escreva para <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>

      <h2>8. Segurança</h2>
      <p>Usamos conexão criptografada (HTTPS), senhas com criptografia, controle de acesso por usuário e registros de alteração em dados sensíveis, como compras. Nenhum sistema é 100% seguro: se houver um incidente relevante, avisaremos os afetados e a ANPD.</p>

      <h2>9. Cookies</h2>
      <p>Usamos apenas cookies necessários para manter você conectado e o site funcionando. Se passarmos a usar cookies de medição ou anúncios, esta política será atualizada e pediremos seu consentimento quando necessário.</p>

      <h2>10. Alterações</h2>
      <p>Esta política pode mudar. A versão vigente fica nesta página, com a data no topo.</p>
    </PaginaLegal>
  );
}
