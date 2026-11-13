import type { Metadata } from "next";
import Link from "next/link";
import { Card, Chave, Titulo } from "@/components/admin-ui";
import { ConexaoMPForm } from "@/components/PagamentosForms";
import { getConfig } from "@/lib/config";
import { URL_WEBHOOK, configMP } from "@/lib/mercadopago";

export const metadata: Metadata = { title: "Pagamentos" };
export const dynamic = "force-dynamic";

export default async function PagamentosPage() {
  const cfg = configMP();
  const { crew_select_aberto } = await getConfig();
  return (
    <>
      <Titulo sub="Conexão com o Mercado Pago. O aluno paga com Pix ou cartão sem sair do site, e o acesso ao Head Hunter é liberado sozinho quando o pagamento é aprovado.">Pagamentos</Titulo>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold">Mercado Pago</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cfg ? (cfg.producao ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]") : "bg-[#eceef3] text-ink-2"}`}>
            {cfg ? (cfg.producao ? "✓ Conectado · produção" : "Conectado · modo de teste") : "Não conectado"}
          </span>
        </div>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[15px] text-ink-2">
          <li>Entre em <strong>mercadopago.com.br/developers › Suas integrações</strong> e crie (ou abra) uma aplicação do tipo <strong>Pagamentos on-line › Checkout transparente</strong>.</li>
          <li>Em <strong>Credenciais de produção</strong>, copie a <strong>Public Key</strong> e o <strong>Access Token</strong> e cole abaixo.</li>
          <li>Em <strong>Webhooks › Configurar notificações</strong>, no modo produção, cole a URL abaixo, marque o evento <strong>Pagamentos</strong> e salve. Copie a <strong>assinatura secreta</strong> que aparece e cole no campo abaixo.</li>
        </ol>
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold">URL do webhook</span>
          <code className="rounded-xl bg-soft px-4 py-3 text-[14px] break-all select-all">{URL_WEBHOOK}</code>
        </div>
        <ConexaoMPForm publicKey={cfg?.publicKey ?? ""} conectado={!!cfg} temSegredo={!!cfg?.webhookSecret} />
      </Card>

      <Card className={crew_select_aberto ? "border-2 border-brand" : ""}>
        <Chave chave="crew_select_aberto" ligado={crew_select_aberto} titulo="Head Hunter liberado para todos, sem pagamento"
          descricao="Ligado: todo cadastrado acessa o Head Hunter de graça (bom para a fase de testes). Desligado: só quem comprou (ou quem você liberar na página do aluno) acessa, e os demais veem a página de venda." />
      </Card>

      <p className="text-[15px] text-ink-2">Preço e desconto no Pix: <Link href="/admin/produtos" className="font-semibold underline underline-offset-4">Financeiro › Produtos e preços</Link>. As vendas entram sozinhas no <Link href="/admin/compras" className="font-semibold underline underline-offset-4">Livro de compras</Link>.</p>
    </>
  );
}
