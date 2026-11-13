import type { Metadata } from "next";
import Link from "next/link";
import { Titulo } from "@/components/admin-ui";
import { SelecaoPublico } from "@/components/Campanhas";
import { CURSOS, SITUACOES_CAMPANHA, type Destinatario, type PessoaAluno, type PessoaLista } from "@/lib/campanhas";
import { COMPANHIAS } from "@/lib/jornada";
import { diasDesde } from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova campanha" };
export const dynamic = "force-dynamic";

type Busca = { f?: string; q?: string; escola?: string; curso?: string; sit?: string; cia?: string; de?: string; ate?: string };

const campo = "min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]";
const noDia = (iso: string, de?: string, ate?: string) => {
  const d = new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return (!de || d >= de) && (!ate || d <= ate);
};

export default async function NovaCampanhaPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const sp = await searchParams;
  const fonte = sp.f === "interessados" ? "interessados" : "alunos";
  const q = (sp.q ?? "").trim().toLowerCase();
  const { supabase } = await getUser();
  const { data: tpls } = await supabase.from("whatsapp_templates").select("id, nome, texto, imagem").order("updated_at", { ascending: false });

  let pessoas: Destinatario[] = [];
  let escolas: string[] = [];
  if (fonte === "alunos") {
    const { data } = await supabase.rpc("admin_publico_campanha");
    const todos = ((data ?? []) as PessoaAluno[]).filter((p) => !p.bloqueado);
    escolas = [...new Set(todos.map((p) => p.escola).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
    pessoas = todos
      .filter((p) => !q || `${p.nome} ${p.email} ${p.whatsapp}`.toLowerCase().includes(q))
      .filter((p) => !sp.escola || p.escola === sp.escola)
      .filter((p) => !sp.curso || !CURSOS[sp.curso] || CURSOS[sp.curso].testa(p))
      .filter((p) => !sp.sit || !SITUACOES_CAMPANHA[sp.sit] || SITUACOES_CAMPANHA[sp.sit].testa(diasDesde(p.ultima)))
      .filter((p) => !sp.cia || p.companhia === sp.cia)
      .filter((p) => noDia(p.cadastro, sp.de, sp.ate))
      .map((p) => ({
        id: p.id, nome: p.nome ?? "Sem nome", telefone: p.whatsapp, email: p.email, escola: p.escola, cadastro: p.cadastro,
        detalhe: [p.companhia ? COMPANHIAS.find((c) => c.slug === p.companhia)?.nome : "sem check-in", `${p.aulas} aulas`, p.compras ? `${p.compras} compra(s)` : null].filter(Boolean).join(" · "),
      }));
  } else {
    const { data } = await supabase.from("interessados").select("id, nome, telefone, pais, created_at").order("created_at", { ascending: false }).limit(20000);
    pessoas = ((data ?? []) as PessoaLista[])
      .filter((p) => !q || `${p.nome} ${p.telefone}`.toLowerCase().includes(q))
      .filter((p) => noDia(p.created_at, sp.de, sp.ate))
      .map((p) => ({ id: p.id, nome: p.nome, telefone: p.telefone, escola: p.pais, cadastro: p.created_at, detalhe: "lista Em breve" }));
  }
  const templates = (tpls ?? []) as { id: number; nome: string; texto: string; imagem: string | null }[];

  return (
    <>
      <Link href="/admin/campanhas" className="text-sm font-semibold text-navy">← Campanhas</Link>
      <Titulo sub="Filtre o público, marque quem vai receber (ou todos) e escolha o modelo e o intervalo. Também dá para exportar a seleção em CSV.">Nova campanha</Titulo>

      <nav aria-label="Público" className="flex gap-1 self-start rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
        {[["alunos", "Alunos cadastrados"], ["interessados", "Lista Em breve"]].map(([k, r]) => (
          <Link key={k} href={`/admin/campanhas/nova?f=${k}`} aria-current={fonte === k ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-5 font-semibold ${fonte === k ? "bg-navy text-white" : "text-navy"}`}>{r}</Link>
        ))}
      </nav>

      <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-3 lg:grid-cols-4">
        <input type="hidden" name="f" value={fonte} />
        <label className="flex flex-col gap-1 text-[13px] font-semibold md:col-span-2">Buscar<input name="q" defaultValue={sp.q} placeholder="Nome, e-mail ou WhatsApp" className={campo} /></label>
        {fonte === "alunos" && (
          <>
            <label className="flex flex-col gap-1 text-[13px] font-semibold">Escola
              <select name="escola" defaultValue={sp.escola ?? ""} className={campo}><option value="">Todas</option>{escolas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold">Curso na plataforma
              <select name="curso" defaultValue={sp.curso ?? ""} className={campo}><option value="">Todos</option>{Object.entries(CURSOS).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}</select>
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold">Situação
              <select name="sit" defaultValue={sp.sit ?? ""} className={campo}><option value="">Todas</option>{Object.entries(SITUACOES_CAMPANHA).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}</select>
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold">Companhia-alvo
              <select name="cia" defaultValue={sp.cia ?? ""} className={campo}><option value="">Todas</option>{COMPANHIAS.map((c) => <option key={c.slug} value={c.slug}>{c.nome}</option>)}</select>
            </label>
          </>
        )}
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro a partir de<input type="date" name="de" defaultValue={sp.de} className={campo} /></label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro até<input type="date" name="ate" defaultValue={sp.ate} className={campo} /></label>
        <div className="flex items-end gap-2">
          <button className="min-h-11 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Filtrar</button>
          <Link href={`/admin/campanhas/nova?f=${fonte}`} className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold">Limpar</Link>
        </div>
      </form>

      <SelecaoPublico key={JSON.stringify(sp)} fonte={fonte} pessoas={pessoas} templates={templates} />
    </>
  );
}
