import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo } from "@/components/admin-ui";
import { ConexaoWhatsappForm, EnviarWhatsappForm, ModeloWhatsappForm } from "@/components/WhatsappForms";
import { getUser } from "@/lib/supabase/server";
import { conexaoWhatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "WhatsApp" };
export const dynamic = "force-dynamic";

type Modelo = { evento: string; titulo: string; quando: string; texto: string; ativo: boolean };
type Envio = { id: number; user_id: string | null; evento: string; telefone: string | null; texto: string | null; status: string; erro: string | null; created_at: string; profiles: { nome: string | null; apelido: string | null } | null };

const STATUS: Record<string, { rotulo: string; cor: string }> = {
  enviada: { rotulo: "Enviada", cor: "bg-[#e5f6ec] text-[#0f6b3a]" },
  enviando: { rotulo: "Enviando", cor: "bg-[#eceef3] text-ink-2" },
  erro: { rotulo: "Erro", cor: "bg-brand-soft text-brand-deep" },
  sem_whatsapp: { rotulo: "Sem WhatsApp", cor: "bg-[#fff8e6] text-[#7a5a00]" },
};

export default async function WhatsappAdminPage() {
  const { supabase } = await getUser();
  const [mods, envs, semAviso] = await Promise.all([
    supabase.from("whatsapp_modelos").select("evento, titulo, quando, texto, ativo").order("evento"),
    supabase.from("whatsapp_envios").select("id, user_id, evento, telefone, texto, status, erro, created_at, profiles(nome, apelido)").order("created_at", { ascending: false }).limit(100),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("whatsapp_avisos", false),
  ]);
  if (mods.error) {
    return (<><Titulo>WhatsApp</Titulo><p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0036_whatsapp.sql</strong> no Supabase para ativar esta página.</p></>);
  }
  const ordem = ["boas_vindas", "checkin", "modulo_concluido", "ingles_modulo", "ingles_concluido", "jornada_concluida"];
  const modelos = ((mods.data ?? []) as Modelo[]).sort((a, b) => ordem.indexOf(a.evento) - ordem.indexOf(b.evento));
  const envios = (envs.data ?? []) as unknown as Envio[];
  const titulo = new Map(modelos.map((m) => [m.evento, m.titulo]));
  const limite = new Date().getTime() - 86400000;
  const hoje = envios.filter((e) => Date.parse(e.created_at) > limite);
  const con = conexaoWhatsapp();
  const ok = !!con;

  return (
    <>
      <Titulo sub="Avisos automáticos para os alunos pelo seu número no Wawp: boas-vindas, parabéns por concluir módulos e cursos. Cada aviso é enviado uma única vez para cada aluno.">WhatsApp</Titulo>

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
        <Numero rotulo="Alunos sem avisos" valor={semAviso.count ?? 0} detalhe="desligaram em Minha conta" />
      </div>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Enviar um teste</h2>
        <p className="text-[15px] text-ink-2">Mande para o seu próprio número antes de liberar os avisos. Para falar com um aluno, use o botão na página dele em <Link href="/admin/head-hunter/alunos" className="font-semibold underline underline-offset-4">Alunos</Link>.</p>
        <EnviarWhatsappForm textoInicial="Teste do Cabin Crew ✈️ Se chegou, está tudo certo!" rotulo="Enviar teste" />
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold">Avisos automáticos</h2>
        <p className="text-[15px] text-ink-2">Variáveis: <code>{"{nome}"}</code> primeiro nome · <code>{"{link}"}</code> endereço do site · <code>{"{modulo}"}</code> nome do módulo · <code>{"{numero}"}</code> número do módulo · <code>{"{companhia}"}</code> companhia-alvo.</p>
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
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold">Histórico</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="border-b border-line text-[13px] text-muted">
              <tr><th className="p-3 font-semibold">Quando</th><th className="p-3 font-semibold">Aluno</th><th className="p-3 font-semibold">Aviso</th><th className="p-3 font-semibold">Situação</th><th className="p-3 font-semibold">Mensagem</th></tr>
            </thead>
            <tbody>
              {envios.map((e) => (
                <tr key={e.id} className="border-b border-[#eceef3] align-top last:border-0">
                  <td className="p-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="p-3">{e.user_id ? <Link href={`/admin/head-hunter/alunos/${e.user_id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{e.profiles?.nome || e.profiles?.apelido || "Aluno"}</Link> : "—"}<span className="block text-[13px] text-muted">{e.telefone}</span></td>
                  <td className="p-3">{e.evento === "manual" ? "Mensagem avulsa" : titulo.get(e.evento) ?? e.evento}</td>
                  <td className="p-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS[e.status]?.cor ?? ""}`}>{STATUS[e.status]?.rotulo ?? e.status}</span>{e.erro && <span className="block pt-1 text-[12px] text-muted">{e.erro}</span>}</td>
                  <td className="max-w-[360px] p-3 text-[13px] text-ink-2"><span className="line-clamp-3 whitespace-pre-line">{e.texto}</span></td>
                </tr>
              ))}
              {!envios.length && <tr><td colSpan={5} className="p-6 text-center text-ink-2">Nenhuma mensagem enviada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
