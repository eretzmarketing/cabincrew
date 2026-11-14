import type { Metadata } from "next";
import { Card, Titulo } from "@/components/admin-ui";
import { SuperfreteForm } from "@/components/LojaAdminForms";
import { configSuperfrete } from "@/lib/superfrete";

export const metadata: Metadata = { title: "Envios" };
export const dynamic = "force-dynamic";

export default function EnviosPage() {
  const cfg = configSuperfrete();
  return (
    <>
      <Titulo sub="Etiquetas dos Correios para os pedidos da loja, geradas pelo SuperFrete com um clique em Loja › Pedidos. O frete é pago com o saldo da sua carteira SuperFrete.">Envios (SuperFrete)</Titulo>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold">Conexão</h2>
          <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${cfg ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eceef3] text-ink-2"}`}>{cfg ? `Conectado${cfg.sandbox ? " · modo de teste" : ""}` : "Não conectado"}</span>
        </div>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px] text-ink-2">
          <li>No SuperFrete, abra <a href="https://web.superfrete.com/#/integrations" target="_blank" rel="noreferrer" className="font-semibold text-navy underline">Integrações</a> › Desenvolvedores › gerar token.</li>
          <li>Cole o token aqui e preencha o endereço de quem envia (o mesmo da sua conta SuperFrete).</li>
          <li>Deixe saldo na carteira do SuperFrete: ao clicar em Gerar etiqueta, o frete é pago com esse saldo.</li>
        </ol>
        <SuperfreteForm conectado={!!cfg} sandbox={!!cfg?.sandbox} servico={cfg?.servico ?? 1} r={cfg?.remetente ?? {}} />
        <p className="text-[13px] text-muted">O token fica só no servidor do site (não vai para o banco de dados) e nunca aparece de novo nesta tela.</p>
      </Card>
    </>
  );
}
