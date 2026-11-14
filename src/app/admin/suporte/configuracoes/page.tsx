import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { ConfigSuporteForm } from "@/components/SuporteForms";
import { SMTP_PADRAO, configSuporte } from "@/lib/suporte";
import { whatsappConfigurado } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "E-mail e avisos do suporte" };
export const dynamic = "force-dynamic";

export default function ConfigSuporte() {
  const cfg = configSuporte();
  return (
    <>
      <Link href="/admin/suporte" className="text-sm font-semibold text-navy">← Chamados</Link>
      <Titulo sub="Para onde vão as cópias dos contatos do site e dos chamados dos alunos.">E-mail e avisos do suporte</Titulo>
      <Card>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px] text-ink-2">
          <li><strong>E-mail:</strong> use a caixa hello@cabincrew.com.br. Se o e-mail é da Hostinger, o servidor é <strong>smtp.hostinger.com</strong>, porta <strong>465</strong>, usuário = o e-mail completo e a senha da caixa de e-mail (a mesma do webmail). A senha é conferida na hora e fica só no servidor.</li>
          <li><strong>WhatsApp:</strong> os avisos saem pelo mesmo número do Wawp que manda as mensagens aos alunos{whatsappConfigurado() ? "" : " (ainda não conectado em Configurações › WhatsApp)"}. O número que recebe precisa ter WhatsApp: telefone fixo só funciona se tiver WhatsApp Business.</li>
          <li>Ao responder um chamado, o aluno recebe o aviso “Seu chamado foi respondido”. O texto pode ser editado em <Link href="/admin/whatsapp" className="font-semibold text-navy underline">Configurações › WhatsApp</Link>.</li>
        </ol>
        <ConfigSuporteForm
          host={cfg.smtp?.host ?? SMTP_PADRAO.host} porta={cfg.smtp?.porta ?? SMTP_PADRAO.porta} usuario={cfg.smtp?.usuario ?? ""} temSenha={!!cfg.smtp}
          emailDestino={cfg.emailDestino} whatsapps={cfg.whatsapps}
        />
      </Card>
    </>
  );
}
