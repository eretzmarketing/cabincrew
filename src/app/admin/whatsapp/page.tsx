import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo } from "@/components/admin-ui";
import { excluirAvisoPersonalizado } from "@/app/whatsapp-actions";
import { ConexaoWhatsappForm, EnviarWhatsappForm, ModeloWhatsappForm, NovoAvisoForm } from "@/components/WhatsappForms";
import { SmsForm, SmsTeste } from "@/components/SmsForm";
import { configSMS } from "@/lib/sms";
import { getUser } from "@/lib/supabase/server";
import { GATILHOS, conexaoWhatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "WhatsApp e SMS" };
export const dynamic = "force-dynamic";

type Modelo = { evento: string; titulo: string; quando: string; texto: string; ativo: boolean; gatilho?: string | null; personalizado?: boolean; canal?: string; texto_sms?: string | null };
type Sms = { id: number; evento: string; telefone: string; texto: string; status: string; erro: string | null; created_at: string };
const ROTULO_CANAL: Record<string, string> = { whatsapp: "WhatsApp", sms: "SMS", ambos: "WhatsApp + SMS", reserva: "WhatsApp (SMS se falhar)" };
type Envio = { id: number; user_id: string | null; evento: string; ref: string; telefone: string | null; texto: string | null; status: string; erro: string | null; created_at: string; profiles: { nome: string | null; apelido: string | null } | null };


export default async function WhatsappAdminPage() {
  const { supabase } = await getUser();
  const [modsSms, envs, smsQ] = await Promise.all([
    supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo, gatilho, personalizado, created_at, canal, texto_sms").order("created_at"),
    supabase.from("whatsapp_envios").select("id, user_id, evento, ref, telefone, texto, status, erro, created_at, profiles(nome, apelido)").order("created_at", { ascending: false }).limit(200),
    supabase.from("sms_envios").select("id, evento, telefone, texto, status, erro, created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  const temSms = !modsSms.error;
  // antes do SQL 0077 as colunas de SMS não existem
  const mods0 = temSms ? modsSms : await supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo, gatilho, personalizado, created_at").order("created_at");
  const smsLista = (smsQ.data ?? []) as Sms[];
  const smsCfg = configSMS();
  // antes do SQL 0041 as colunas novas não existem: carrega do jeito antigo
  const mods = mods0.error ? await supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo").order("evento") : mods0;
  const temPersonalizados = !mods0.error;
  if (mods.error) {
    return (<><Titulo>WhatsApp</Titulo><p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0036_whatsapp.sql</strong> no Supabase para ativar esta página.</p></>);
  }
  const ordem = ["interessado", "boas_vindas", "compra_aprovada", "checkin", "modulo_concluido", "ingles_modulo", "ingles_concluido", "espanhol_modulo", "espanhol_concluido", "loja_pago", "loja_enviado", "loja_entregue", "ticket_respondido", "jornada_concluida", "conta_excluida"];
  const todos = (mods.data ?? []) as Modelo[];
  const modelos = todos.filter((m) => !m.personalizado).sort((a, b) => ordem.indexOf(a.evento) - ordem.indexOf(b.evento));
  const personalizados = todos.filter((m) => m.personalizado);
  const envios = (envs.data ?? []) as unknown as Envio[];

  const limite = new Date().getTime() - 86400000;
  const hoje = envios.filter((e) => Date.parse(e.created_at) > limite);
  const con = conexaoWhatsapp();
  const ok = !!con;

  return (
    <>
      <Titulo sub="Tudo sobre os avisos automáticos num lugar só: conexões, textos e por onde cada aviso sai (WhatsApp, SMS ou os dois). Cada aviso é enviado uma única vez para cada pessoa.">WhatsApp e SMS</Titulo>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold">Conexão com o Wawp</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`}>
            {ok ? `✓ Conectado · instância ${con!.instancia}` : "Não conectado"}
          </span>
        </div>
        <p className="text-[15px] text-ink-2">Para trocar de número, conecte o novo número no Wawp e cole aqui o <strong>Instance ID</strong> e o <strong>Access Token</strong> (em wawp.net › Instances). O site testa antes de salvar.</p>
        <ConexaoWhatsappForm instancia={con?.instancia ?? ""} tokenFinal={con ? con.token.slice(-4) : ""} conectado={ok} doPainel={con?.origem === "painel"} />
      </Card>

      <Card>
        <div id="sms" className="flex scroll-mt-24 flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold">Conexão com o SMS (smsmais)</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${smsCfg ? (smsCfg.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eceef3] text-ink-2") : "bg-[#fff8e6] text-[#7a5a00]"}`}>
            {smsCfg ? (smsCfg.ativo ? "✓ Conectado e ligado" : "Conectado, mas desligado") : "Não conectado"}
          </span>
        </div>
        <p className="text-[15px] text-ink-2">No smsmais, abra <strong>API &amp; Integrações</strong>, copie o token (📋) e cole aqui. Se gerar um token novo lá, o antigo para de funcionar: cole o novo aqui. Saldo e entregas ficam no painel do smsmais.</p>
        <SmsForm conectado={!!smsCfg} ativo={smsCfg?.ativo ?? true} />
        {smsCfg && (
          <details className="rounded-xl border border-line p-4">
            <summary className="min-h-8 cursor-pointer font-semibold text-navy">Enviar um SMS de teste (gasta 1 SMS)</summary>
            <div className="pt-3"><SmsTeste /></div>
          </details>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="SMS enviados (24h)" valor={smsLista.filter((e) => e.status === "enviada" && Date.parse(e.created_at) > limite).length} />
        <Numero rotulo="Enviadas (24h)" valor={hoje.filter((e) => e.status === "enviada").length} />
        <Numero rotulo="Com erro (24h)" valor={hoje.filter((e) => e.status === "erro").length} />
      </div>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Enviar um teste</h2>
        <p className="text-[15px] text-ink-2">Mande para o seu próprio número antes de liberar os avisos. Para falar com um aluno, use o ícone do WhatsApp em <Link href="/admin/usuarios" className="font-semibold underline underline-offset-4">Usuários</Link>.</p>
        <EnviarWhatsappForm textoInicial="Teste do Cabin Crew ✈️ Se chegou, está tudo certo!" rotulo="Enviar teste" />
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold">Avisos automáticos</h2>
        {temSms
          ? <p className="text-[15px] text-ink-2">Em cada aviso, escolha <strong>Enviar por</strong>: WhatsApp, SMS, os dois, ou “WhatsApp; se falhar, SMS” (bom para quem não tem WhatsApp no número). O SMS tem texto próprio e mais curto: até 160 caracteres sem acento nem emoji.</p>
          : <p className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">Rode o SQL <strong>0077_avisos_sms.sql</strong> no Supabase para poder enviar avisos também por SMS.</p>}
        <p className="text-[15px] text-ink-2">Variáveis: <code>{"{nome}"}</code> primeiro nome · <code>{"{link}"}</code> endereço do site · <code>{"{modulo}"}</code> nome do módulo · <code>{"{numero}"}</code> número do módulo · <code>{"{companhia}"}</code> companhia-alvo · loja: <code>{"{pedido}"}</code>, <code>{"{produto}"}</code>, <code>{"{rastreio}"}</code>, <code>{"{link_rastreio}"}</code>, <code>{"{transportadora}"}</code> · suporte: <code>{"{assunto}"}</code>, <code>{"{chamado}"}</code>.</p>
        <details className="group rounded-[22px] border-2 border-dashed border-[#c9cedb] bg-white open:border-solid open:border-navy">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-display text-lg font-extrabold text-navy">
            <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition-transform group-open:rotate-45">+</span>
            Criar novo aviso automático
          </summary>
          <div className="flex flex-col gap-3 px-5 pb-5">
            {temPersonalizados ? (
              <>
                <p className="text-[15px] text-ink-2">Escolha em que momento ele é enviado. Ele sai logo depois do aviso padrão desse momento, uma única vez para cada pessoa.</p>
                <NovoAvisoForm gatilhos={GATILHOS} />
              </>
            ) : <p className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">Rode o SQL <strong>0041_avisos_personalizados.sql</strong> no Supabase para criar avisos novos.</p>}
          </div>
        </details>
        <div className="grid gap-4 lg:grid-cols-2">
          {modelos.map((m) => (
            <Card key={m.evento}>
              <div className="flex flex-col gap-0.5">
                <h3 className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold">{m.titulo}
                  {temSms && <span className="rounded-full bg-[#eef1ff] px-2.5 py-0.5 text-[12px] font-semibold text-navy">{ROTULO_CANAL[m.canal ?? "whatsapp"]}</span>}
                  {!m.ativo && <span className="rounded-full bg-[#eceef3] px-2.5 py-0.5 text-[12px] font-semibold text-ink-2">Desligado</span>}
                </h3>
                <span className="text-[14px] text-muted">{m.quando}</span>
              </div>
              <ModeloWhatsappForm evento={m.evento} texto={m.texto} ativo={m.ativo} comSms={temSms} canal={m.canal} textoSms={m.texto_sms} />
            </Card>
          ))}
          {personalizados.map((m) => (
            <Card key={m.evento}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold">{m.titulo} <span className="ml-1 rounded-full bg-[#eef1ff] px-2.5 py-0.5 align-middle text-[12px] font-semibold text-navy">Personalizado</span></h3>
                <form action={excluirAvisoPersonalizado}><input type="hidden" name="evento" value={m.evento} /><button className="min-h-10 cursor-pointer text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir</button></form>
              </div>
              <ModeloWhatsappForm evento={m.evento} texto={m.texto} ativo={m.ativo} personalizado titulo={m.titulo} gatilho={m.gatilho} gatilhos={GATILHOS} comSms={temSms} canal={m.canal} textoSms={m.texto_sms} />
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Histórico de envios</h2>
        <p className="text-[15px] text-ink-2">Veja tudo o que foi enviado por WhatsApp e SMS, filtre as falhas e reenvie pelo outro canal com um clique.</p>
        <div><Link href="/admin/whatsapp/historico" className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep">Abrir o histórico →</Link></div>
      </Card>
    </>
  );
}
