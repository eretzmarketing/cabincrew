import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo } from "@/components/admin-ui";
import { excluirAvisoPersonalizado } from "@/app/whatsapp-actions";
import { AcoesEnvio, ConexaoWhatsappForm, EnviarWhatsappForm, ModeloWhatsappForm, NovoAvisoForm } from "@/components/WhatsappForms";
import { getUser } from "@/lib/supabase/server";
import { GATILHOS, conexaoWhatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "WhatsApp" };
export const dynamic = "force-dynamic";

type Modelo = { evento: string; titulo: string; quando: string; texto: string; ativo: boolean; gatilho?: string | null; personalizado?: boolean };
type Envio = { id: number; user_id: string | null; evento: string; ref: string; telefone: string | null; texto: string | null; status: string; erro: string | null; created_at: string; profiles: { nome: string | null; apelido: string | null } | null };

const STATUS: Record<string, { rotulo: string; cor: string }> = {
  enviada: { rotulo: "Enviada", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  enviando: { rotulo: "Enviando", cor: "bg-[#eceef3] text-ink-2" },
  erro: { rotulo: "Erro", cor: "bg-brand-soft text-brand-deep" },
  sem_whatsapp: { rotulo: "Sem WhatsApp", cor: "bg-[#fff8e6] text-[#7a5a00]" },
};

export default async function WhatsappAdminPage() {
  const { supabase } = await getUser();
  const [mods0, envs] = await Promise.all([
    supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo, gatilho, personalizado, created_at").order("created_at"),
    supabase.from("whatsapp_envios").select("id, user_id, evento, ref, telefone, texto, status, erro, created_at, profiles(nome, apelido)").order("created_at", { ascending: false }).limit(200),
  ]);
  // antes do SQL 0041 as colunas novas não existem: carrega do jeito antigo
  const mods = mods0.error ? await supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo").order("evento") : mods0;
  const temPersonalizados = !mods0.error;
  if (mods.error) {
    return (<><Titulo>WhatsApp</Titulo><p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0036_whatsapp.sql</strong> no Supabase para ativar esta página.</p></>);
  }
  const ordem = ["interessado", "boas_vindas", "compra_aprovada", "checkin", "modulo_concluido", "ingles_modulo", "ingles_concluido", "espanhol_modulo", "espanhol_concluido", "loja_pago", "loja_enviado", "loja_entregue", "jornada_concluida", "conta_excluida"];
  const todos = (mods.data ?? []) as Modelo[];
  const modelos = todos.filter((m) => !m.personalizado).sort((a, b) => ordem.indexOf(a.evento) - ordem.indexOf(b.evento));
  const personalizados = todos.filter((m) => m.personalizado);
  const envios = (envs.data ?? []) as unknown as Envio[];

  // nome de quem não é aluno (lista Em breve, conta excluída), pelo telefone
  const semAluno = [...new Set(envios.filter((e) => !e.profiles && e.telefone).map((e) => e.telefone!))];
  const nomes = new Map<string, string>();
  if (semAluno.length) {
    const [i, c] = await Promise.all([
      supabase.from("interessados").select("nome, telefone").in("telefone", semAluno),
      supabase.from("contas_excluidas").select("nome, whatsapp").in("whatsapp", semAluno),
    ]);
    for (const x of c.data ?? []) if (x.nome) nomes.set(x.whatsapp as string, x.nome as string);
    for (const x of i.data ?? []) nomes.set(x.telefone as string, x.nome as string);
  }
  const nomeDe = (e: Envio) => e.profiles?.nome || e.profiles?.apelido || (e.telefone && nomes.get(e.telefone)) || (e.evento === "manual" ? "Mensagem avulsa" : "—");
  const titulo = new Map(todos.map((m) => [m.evento, m.titulo]));
  const limite = new Date().getTime() - 86400000;
  const hoje = envios.filter((e) => Date.parse(e.created_at) > limite);
  const con = conexaoWhatsapp();
  const ok = !!con;

  return (
    <>
      <Titulo sub="O WhatsApp é o canal oficial de avisos da Cabin Crew: confirmação da lista Em breve, boas-vindas, parabéns por concluir módulos e cursos e confirmação de conta excluída. Cada aviso é enviado uma única vez para cada pessoa.">WhatsApp</Titulo>

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

      <div className="flex flex-wrap gap-3">
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
        <p className="text-[15px] text-ink-2">Variáveis: <code>{"{nome}"}</code> primeiro nome · <code>{"{link}"}</code> endereço do site · <code>{"{modulo}"}</code> nome do módulo · <code>{"{numero}"}</code> número do módulo · <code>{"{companhia}"}</code> companhia-alvo · loja: <code>{"{pedido}"}</code>, <code>{"{produto}"}</code>, <code>{"{rastreio}"}</code>, <code>{"{link_rastreio}"}</code>, <code>{"{transportadora}"}</code>.</p>
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
                <h3 className="font-display text-lg font-extrabold">{m.titulo}</h3>
                <span className="text-[14px] text-muted">{m.quando}</span>
              </div>
              <ModeloWhatsappForm evento={m.evento} texto={m.texto} ativo={m.ativo} />
            </Card>
          ))}
          {personalizados.map((m) => (
            <Card key={m.evento}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold">{m.titulo} <span className="ml-1 rounded-full bg-[#eef1ff] px-2.5 py-0.5 align-middle text-[12px] font-semibold text-navy">Personalizado</span></h3>
                <form action={excluirAvisoPersonalizado}><input type="hidden" name="evento" value={m.evento} /><button className="min-h-10 cursor-pointer text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir</button></form>
              </div>
              <ModeloWhatsappForm evento={m.evento} texto={m.texto} ativo={m.ativo} personalizado titulo={m.titulo} gatilho={m.gatilho} gatilhos={GATILHOS} />
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Histórico</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="border-b border-line text-[13px] text-muted">
              <tr><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">Telefone</th><th className="p-3 font-semibold">Tipo de aviso</th><th className="p-3 font-semibold">Status</th><th className="p-3"><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {envios.map((e) => {
                const nome = nomeDe(e);
                return (
                  <tr key={e.id} className="border-b border-[#eceef3] last:border-0">
                    <td className="p-3">{e.user_id && e.profiles ? <Link href={`/admin/usuarios/${e.user_id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{nome}</Link> : <span className="font-semibold">{nome}</span>}</td>
                    <td className="p-3 whitespace-nowrap">{e.telefone ?? "—"}</td>
                    <td className="p-3">
                      {e.evento === "manual" ? "Mensagem avulsa" : titulo.get(e.evento) ?? "Aviso excluído"}
                      {e.ref?.startsWith("reenvio-") && <span className="ml-2 rounded-full bg-[#eceef3] px-2 py-0.5 text-[12px] font-semibold text-ink-2">reenvio</span>}
                      <span className="block text-[12px] text-muted">{new Date(e.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
                    </td>
                    <td className="p-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS[e.status]?.cor ?? ""}`}>{STATUS[e.status]?.rotulo ?? e.status}</span>{e.erro && <span className="block pt-1 text-[12px] text-muted">{e.erro}</span>}</td>
                    <td className="p-3"><AcoesEnvio id={e.id} nome={nome} telefone={e.telefone} texto={e.texto} /></td>
                  </tr>
                );
              })}
              {!envios.length && <tr><td colSpan={5} className="p-6 text-center text-ink-2">Nenhuma mensagem enviada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
