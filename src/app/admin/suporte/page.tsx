import type { Metadata } from "next";
import Link from "next/link";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { SeloStatus, nomeDepartamento, type Ticket } from "@/components/SuporteConversa";
import { configSuporte, quando } from "@/lib/suporte";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Suporte · chamados" };
export const dynamic = "force-dynamic";

const FILTROS = { aguardando: "Aguardando resposta", abertos: "Abertos", fechados: "Fechados", todos: "Todos" } as const;
type Filtro = keyof typeof FILTROS;

export default async function SuporteAdmin({ searchParams }: { searchParams: Promise<{ f?: string; dep?: string }> }) {
  const sp = await searchParams;
  const f: Filtro = sp.f && sp.f in FILTROS ? (sp.f as Filtro) : "aguardando";
  const { supabase } = await getUser();
  let q = supabase.from("tickets").select("*").order("atualizado_em", { ascending: f === "aguardando" }).limit(300);
  if (f === "aguardando") q = q.eq("status", "aberto").eq("aguardando", "equipe");
  if (f === "abertos") q = q.eq("status", "aberto");
  if (f === "fechados") q = q.eq("status", "fechado");
  if (sp.dep) q = q.eq("departamento", sp.dep);
  const [{ data }, { count: esperando }, { count: novosContatos }] = await Promise.all([
    q,
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "aberto").eq("aguardando", "equipe"),
    supabase.from("contatos").select("id", { count: "exact", head: true }).eq("status", "novo"),
  ]);
  const lista = (data ?? []) as Ticket[];
  const ids = [...new Set(lista.map((t) => t.user_id))];
  const { data: perfis } = ids.length ? await supabase.from("profiles").select("id, nome, apelido").in("id", ids) : { data: [] };
  const nome = new Map((perfis ?? []).map((p) => [p.id as string, (p.nome as string) || (p.apelido as string)]));
  const cfg = configSuporte();
  const semAviso = !cfg.smtp && !cfg.whatsapps.length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Chamados abertos pelos alunos em Minha conta › Suporte. Ao responder, o aluno recebe o aviso no WhatsApp.">Suporte</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/suporte/contatos" className={btnSecundario}>Mensagens do site {(novosContatos ?? 0) > 0 && <span className="ml-2 rounded-full bg-brand-strong px-2 text-[12px] text-white">{novosContatos}</span>}</Link>
          <Link href="/admin/suporte/configuracoes" className={btnSecundario}>E-mail e avisos</Link>
        </div>
      </div>
      {semAviso && (
        <p className="rounded-2xl border border-[#f0d58c] bg-[#fff8e6] px-5 py-4 text-[15px] text-[#7a5a00]">
          Você ainda não recebe cópia dos chamados. Configure o e-mail e os WhatsApps da equipe em <Link href="/admin/suporte/configuracoes" className="font-semibold underline">E-mail e avisos</Link>.
        </p>
      )}
      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {(Object.keys(FILTROS) as Filtro[]).map((k) => (
          <Link key={k} href={`/admin/suporte?f=${k}${sp.dep ? `&dep=${sp.dep}` : ""}`} aria-current={f === k ? "page" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold ${f === k ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
            {FILTROS[k]}{k === "aguardando" && (esperando ?? 0) > 0 && <span className={`rounded-full px-2 text-[12px] ${f === k ? "bg-white text-navy" : "bg-brand-strong text-white"}`}>{esperando}</span>}
          </Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr><th className="p-3 font-semibold">Nº</th><th className="p-3 font-semibold">Assunto</th><th className="p-3 font-semibold">Aluno</th><th className="p-3 font-semibold">Departamento</th><th className="p-3 font-semibold">Situação</th><th className="p-3 font-semibold">Atualizado</th></tr>
          </thead>
          <tbody>
            {lista.map((t) => (
              <tr key={t.id} className="border-b border-[#eceef3] last:border-0 hover:bg-soft">
                <td className="p-3 text-muted">{t.id}</td>
                <td className="p-3"><Link href={`/admin/suporte/${t.id}`} className="font-semibold text-navy hover:underline">{t.assunto}</Link></td>
                <td className="p-3">{nome.get(t.user_id) ?? "—"}</td>
                <td className="p-3">{nomeDepartamento(t.departamento)}</td>
                <td className="p-3"><SeloStatus t={t} visao="equipe" /></td>
                <td className="p-3 whitespace-nowrap">{quando(t.atualizado_em)}</td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={6} className="p-8 text-center text-ink-2">{f === "aguardando" ? "Nenhum chamado esperando resposta. 🎉" : "Nenhum chamado aqui."}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
