import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegal from "@/components/PaginaLegal";
import { EMPRESA } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de Reembolso", description: "Direito de arrependimento de 7 dias e como pedir o reembolso dos cursos da Cabin Crew." };

export default function ReembolsoPage() {
  return (
    <PaginaLegal titulo="Política de Reembolso">
      <h2>1. Direito de arrependimento (7 dias)</h2>
      <p>Como a compra é feita pela internet, você pode desistir em até <strong>7 (sete) dias corridos</strong> contados da data da compra (aprovação do pagamento), sem precisar justificar, conforme o artigo 49 do Código de Defesa do Consumidor. Nesse prazo, devolvemos <strong>100% do valor pago</strong>.</p>

      <h2>2. Como pedir</h2>
      <ol>
        <li>Envie o pedido dentro do prazo pelo WhatsApp <a href={EMPRESA.whatsappLink}>{EMPRESA.whatsapp}</a> ou pelo e-mail <a href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.</li>
        <li>Informe o nome completo, o e-mail da conta e, se tiver, o ID da transação do Mercado Pago (aparece no comprovante).</li>
        <li>Respondemos com a confirmação do pedido. Vale a data e a hora em que a mensagem chegou até nós.</li>
      </ol>

      <h2>3. Como o dinheiro volta</h2>
      <ul>
        <li>O reembolso é feito pelo próprio Mercado Pago, no mesmo meio usado na compra.</li>
        <li><strong>Pix:</strong> o valor volta para a conta de origem, normalmente em até 2 dias úteis após o pedido ser processado.</li>
        <li><strong>Cartão de crédito:</strong> o estorno é enviado à operadora do cartão e aparece em até 2 faturas, conforme as regras do banco emissor. Juros de parcelamento cobrados pelo Mercado Pago também são estornados.</li>
      </ul>

      <h2>4. O que acontece com o acesso</h2>
      <p>Com o reembolso, o acesso ao curso é encerrado automaticamente e o certificado, se emitido, é revogado. Se a compra foi um combo, o reembolso é do valor total e encerra o acesso aos dois cursos.</p>

      <h2>5. Depois de 7 dias</h2>
      <ul>
        <li>Passado o prazo de arrependimento, não há reembolso por desistência, inclusive se o curso não tiver sido usado ou a conta for excluída.</li>
        <li>Continuam valendo os seus direitos previstos em lei, como em caso de falha na prestação do serviço que não seja resolvida (por exemplo, impossibilidade de acesso por problema nosso). Nesses casos, fale com a gente pelo contato acima.</li>
        <li>Contas suspensas ou banidas por violação dos <Link href="/termos">Termos de Uso</Link> (como compartilhamento de senha ou cópia de conteúdo) não têm direito a reembolso após o prazo de arrependimento.</li>
      </ul>

      <h2>6. Cobranças não reconhecidas</h2>
      <p>Se você não reconhece uma cobrança, fale primeiro com a gente: resolvemos mais rápido do que uma contestação no cartão. Guardamos o registro de cada compra (data, hora, forma de pagamento, ID da transação e aceite destes termos) e o histórico de uso da plataforma.</p>

      <h2>7. Cursos presenciais e outras vendas</h2>
      <p>Compras feitas fora do site (por exemplo, no curso presencial) seguem as condições combinadas no momento da venda. Quando a venda for feita fora do estabelecimento comercial, também vale o direito de arrependimento de 7 dias.</p>
    </PaginaLegal>
  );
}
