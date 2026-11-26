import type { Metadata } from "next";
import Link from "next/link";
import { Numero, Titulo } from "@/components/admin-ui";
import { AcoesHistorico } from "@/components/WhatsappForms";
import { smsConfigurado } from "@/lib/sms";
import { getUser } from "@/lib/supabase/server";
import { conexaoWhatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Histórico de envios" };
export const dynamic = "force-dynamic";

type Busca = { canal?: string; sit?: string; dias?: string; q?: string };
type Linha = {
  chave: string; canal: "whatsapp" | "sms"; id: number; userId: string | null; nome: string; telefone: string | null;
  evento: string; texto: string | null; ok: boolean | null; status: string; erro: string | null; data: string; reenvio: boolean;
};

const PERIODOS: [string, string][] = [["1", "24 horas"], ["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"]];
const SIT: Record<string, string> = { enviada: "Enviada", erro: "Falhou", sem_whatsapp: "Sem WhatsApp", enviando: "Enviando" };
const campo = "min-h-11 w-full rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px] text-navy";
const dig = (t: string | null | undefined) => String(t ?? "").replace(/\D/g, "").slice(-11);

export default async function HistoricoEnviosPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const sp = await searchParams;
  const canal = sp.canal === "whatsapp" || sp.canal === "sms" ? sp.canal : "";
  const sit = sp.sit === "ok" || sp.sit === "falha" ? sp.sit : "";
  const dias = PERIODOS.some(([v]) => v === sp.dias) ? Number(sp.dias) : 7;
  const q = (sp.q ?? "").trim().toLowerCase();
  const desde = new Date(new Date().getTime() - dias * 86400000).toISOString();

  const { supabase } = await getUser();
  const [wa, sms, mods, pessoas, inter] = await Promise.all([
    canal === "sms" ? Promise.resolve({ data: [] }) : supabase.from("whatsapp_envios").select("id, user_id, evento, ref, telefone, texto, status, erro, created_at, profiles(nome, apelido)").gte("created_at", desde).order("created_at", { ascending: false }).limit(1000),
    canal === "whatsapp" ? Promise.resolve({ data: [] }) : supabase.from("sms_envios").select("id, user_id, evento, telefone, texto, status, erro, created_at").gte("created_at", desde).order("created_at", { ascending: false }).limit(1000),
    supabase.from("whatsapp_modelos").select("evento, titulo"),
    supabase.from("profiles").select("id, nome, apelido, whatsapp"),
    supabase.from("interessados").select("nome, telefone"),
  ]);

  const titulo = new Map(((mods.data ?? []) as { evento: string; titulo: string }[]).map((m) => [m.evento, m.titulo]));
  const porTel = new Map<string, { id: string | null; nome: string }>();
  for (const i of (inter.data ?? []) as { nome: string; telefone: string }[]) if (dig(i.telefone)) porTel.set(dig(i.telefone), { id: null, nome: i.nome });
  for (const p of (pessoas.data ?? []) as { id: string; nome: string | null; apelido: string | null; whatsapp: string | null }[]) {
    if (dig(p.whatsapp)) porTel.set(dig(p.whatsapp), { id: p.id, nome: p.nome || p.apelido || "Aluno" });
  }
  const nomeAviso = (ev: string) => ev === "manual" ? "Mensagem avulsa" : ev === "teste-admin" ? "Teste" : titulo.get(ev) ?? "Aviso excluído";

  type Wa = { id: number; user_id: string | null; evento: string; ref: string; telefone: string | null; texto: string | null; status: string; erro: string | null; created_at: string; profiles: { nome: string | null; apelido: string | null } | null };
  type Sm = { id: number; user_id: string | null; evento: string; telefone: string; texto: string; status: string; erro: string | null; created_at: string };
  // nomes vindos dos envios de WhatsApp (o SMS reenviado pelo admin não guarda o aluno)
  for (const e of (wa.data ?? []) as unknown as Wa[]) {
    const nome = e.profiles?.nome || e.profiles?.apelido;
    if (nome && e.user_id && dig(e.telefone) && !porTel.has(dig(e.telefone))) porTel.set(dig(e.telefone), { id: e.user_id, nome });
  }
  const linhas: Linha[] = [
    ...((wa.data ?? []) as unknown as Wa[])
      .filter((e) => !(e.texto ?? "").startsWith("[SMS] ")) // saiu só por SMS: aparece na linha do SMS
      .map((e): Linha => {
        const quem = porTel.get(dig(e.telefone));
        return {
          chave: `w${e.id}`, canal: "whatsapp", id: e.id, userId: e.user_id ?? quem?.id ?? null,
          nome: e.profiles?.nome || e.profiles?.apelido || quem?.nome || (e.evento === "manual" ? "Mensagem avulsa" : "—"),
          telefone: e.telefone, evento: e.evento, texto: e.texto, ok: e.status === "enviada" ? true : e.status === "enviando" ? null : false,
          status: e.status, erro: e.erro, data: e.created_at, reenvio: (e.ref ?? "").startsWith("reenvio-"),
        };
      }),
    ...((sms.data ?? []) as Sm[]).map((e): Linha => {
      const quem = porTel.get(dig(e.telefone));
      return {
        chave: `s${e.id}`, canal: "sms", id: e.id, userId: e.user_id ?? quem?.id ?? null, nome: quem?.nome ?? "—",
        telefone: e.telefone, evento: e.evento, texto: e.texto, ok: e.status === "enviada", status: e.status, erro: e.erro, data: e.created_at, reenvio: false,
      };
    }),
  ].sort((a, b) => b.data.localeCompare(a.data));
  // falha resolvida: depois dela saiu uma mensagem com sucesso do mesmo aviso para o mesmo telefone (por qualquer canal)
  const resolvida = (l: Linha) => l.ok === false && linhas.some((o) => o.ok && o.evento === l.evento && dig(o.telefone) === dig(l.telefone) && o.data > l.data);

  const filtradas = linhas.filter((l) =>
    (!sit || (sit === "ok" ? l.ok === true : l.ok === false && !resolvida(l))) &&
    (!q || `${l.nome} ${l.telefone ?? ""} ${nomeAviso(l.evento)}`.toLowerCase().includes(q) || (q.replace(/\D/g, "").length >= 4 && dig(l.telefone).includes(q.replace(/\D/g, "")))),
  );
  const mostrar = filtradas.slice(0, 300);
  const whatsLigado = !!conexaoWhatsapp();
  const smsLigado = smsConfigurado();
  const erroTabelaSms = "error" in sms && sms.error;

  return (
    <>
      <Titulo sub="Todas as mensagens enviadas pelo WhatsApp e por SMS. Se uma falhou, reenvie pelo mesmo canal ou pelo outro.">Histórico de envios</Titulo>
      {erroTabelaSms && <p className="rounded-2xl bg-brand-soft px-5 py-4 text-brand-deep">Rode o SQL <strong>0077_avisos_sms.sql</strong> no Supabase para ver o histórico de SMS.</p>}

      <div className="flex flex-wrap gap-3">
        <Numero rotulo={`Enviadas (${PERIODOS.find(([v]) => Number(v) === dias)?.[1]})`} valor={linhas.filter((l) => l.ok).length} />
        <Link href={`?canal=${canal}&sit=falha&dias=${dias}`} className="flex flex-[1_1_200px] text-navy hover:opacity-90">
          <Numero rotulo="Falhas sem reenvio" valor={linhas.filter((l) => l.ok === false && !resolvida(l)).length} detalhe="ver só as falhas →" />
        </Link>
      </div>

      <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <label className="flex flex-col gap-1 text-[13px] font-semibold lg:col-span-2">Buscar
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Nome, telefone ou tipo de aviso" className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Canal
          <select name="canal" defaultValue={canal} className={campo}><option value="">WhatsApp e SMS</option><option value="whatsapp">Só WhatsApp</option><option value="sms">Só SMS</option></select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Situação
          <select name="sit" defaultValue={sit} className={campo}><option value="">Todas</option><option value="ok">Enviadas</option><option value="falha">Falhas sem reenvio</option></select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Período
          <select name="dias" defaultValue={String(dias)} className={campo}>{PERIODOS.map(([v, r]) => <option key={v} value={v}>Últimos {r}</option>)}</select>
        </label>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-5">
          <button className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-navy px-6 font-semibold text-white hover:bg-navy-deep">Filtrar</button>
          {(canal || sit || q || dias !== 7) && <Link href="/admin/whatsapp/historico" className="text-[14px] font-semibold text-navy underline underline-offset-4">Limpar filtros</Link>}
          <span className="text-[14px] text-ink-2">{filtradas.length} {filtradas.length === 1 ? "mensagem" : "mensagens"}{filtradas.length > mostrar.length ? ` (mostrando as ${mostrar.length} mais recentes)` : ""}</span>
        </div>
      </form>

      {!smsLigado && <p className="text-[14px] text-muted">O reenvio por SMS aparece desligado porque o SMS não está conectado. Conecte em <Link href="/admin/whatsapp#sms" className="font-semibold underline underline-offset-4">WhatsApp e SMS</Link>.</p>}

      <ul aria-label="Mensagens enviadas" className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {mostrar.map((l) => (
          <li key={l.chave} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${l.ok === false && !resolvida(l) ? "bg-[#fff7f7]" : ""}`}>
            <span className={`w-[86px] shrink-0 rounded-full px-2.5 py-1 text-center text-[12px] font-bold ${l.canal === "sms" ? "bg-[#eef1ff] text-[#2b3fa8]" : "bg-[#e5f6ec] text-[#0b6b34]"}`}>{l.canal === "sms" ? "SMS" : "WhatsApp"}</span>
            <div className="flex min-w-0 flex-[1_1_220px] flex-col">
              {l.userId ? <Link href={`/admin/usuarios/${l.userId}`} className="truncate font-semibold text-navy hover:underline hover:underline-offset-4">{l.nome}</Link> : <span className="truncate font-semibold">{l.nome}</span>}
              <span className="text-[13px] text-muted">{l.telefone ?? "sem telefone"}</span>
            </div>
            <div className="flex min-w-0 flex-[1_1_200px] flex-col">
              <span className="text-[14px]">{nomeAviso(l.evento)}{l.reenvio && <span className="ml-2 rounded-full bg-[#eceef3] px-2 py-0.5 text-[11px] font-semibold text-ink-2">reenvio</span>}</span>
              <span className="text-[12px] text-muted">{new Date(l.data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <div className="flex min-w-0 flex-[1_1_160px] flex-col">
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${l.ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : l.ok === null ? "bg-[#eceef3] text-ink-2" : "bg-brand-soft text-brand-deep"}`}>{SIT[l.status] ?? l.status}</span>
              {l.erro && <span className="pt-1 text-[12px] text-muted">{l.erro}</span>}
              {resolvida(l) && <span className="w-fit pt-1 text-[12px] font-semibold text-[#0f6b3a]">✓ Resolvida com reenvio</span>}
            </div>
            <AcoesHistorico canal={l.canal} nome={l.nome} telefone={l.telefone} texto={l.texto} evento={l.evento} userId={l.userId} origem={l.chave} smsLigado={smsLigado} whatsLigado={whatsLigado} />
          </li>
        ))}
        {!mostrar.length && <li className="p-8 text-center text-ink-2">Nenhuma mensagem nesse filtro.</li>}
      </ul>
    </>
  );
}
