import type { Metadata } from "next";
import { Card, Titulo } from "@/components/admin-ui";
import { SmsForm, SmsTeste } from "@/components/SmsForm";
import { configSMS } from "@/lib/sms";

export const metadata: Metadata = { title: "SMS" };
export const dynamic = "force-dynamic";

export default function SmsPage() {
  const cfg = configSMS();
  return (
    <>
      <Titulo sub="Envio de SMS pelo smsmais. O token fica guardado só no servidor, nunca no código.">SMS (smsmais)</Titulo>
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-bold">Conexão</h2>
          <span className={`rounded-full px-3 py-0.5 text-[13px] font-bold ${cfg ? (cfg.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-muted") : "bg-brand-soft text-brand-deep"}`}>
            {cfg ? (cfg.ativo ? "Conectado e ligado" : "Conectado, mas desligado") : "Não conectado"}
          </span>
        </div>
        <ol className="list-decimal pl-5 text-[15px] text-ink-2">
          <li>No smsmais, abra <strong>API &amp; Integrações</strong> e copie o token (botão 📋).</li>
          <li>Cole aqui embaixo e salve. Se você gerar um token novo lá, o antigo para de funcionar: cole o novo aqui.</li>
        </ol>
        <SmsForm conectado={!!cfg} ativo={cfg?.ativo ?? true} />
      </Card>
      {cfg && (
        <Card className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">Teste</h2>
          <p className="text-[15px] text-ink-2">Manda um SMS para o seu celular para conferir se está tudo certo. Gasta 1 SMS do saldo.</p>
          <SmsTeste />
        </Card>
      )}
      <p className="text-[14px] text-muted">Saldo, entregas e opt-out ficam no painel do smsmais. Quem pediu para não receber SMS (opt-out) é ignorado automaticamente.</p>
    </>
  );
}
