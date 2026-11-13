import type { Metadata } from "next";
import Link from "next/link";
import AcoesAluno from "@/components/AcoesAluno";
import AvatarAluno from "@/components/AvatarAluno";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
type Pessoa = { id: string; nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; cadastro: string; bloqueado: boolean; compras: number };
type Busca = { q?: string; escola?: string; curso?: string; sit?: string; de?: string; ate?: string; p?: string; excluido?: string };

const CURSOS: Record<string, string> = { "head-hunter": "Com Head Hunter", english: "Com Flight Attendant English", ambos: "Com os dois cursos", nenhum: "Sem curso", comprou: "Já comprou algo" };
const campo = "min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]";
const diaSP = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const sp = await searchParams;
  const pagina = Math.max(1, Number(sp.p) || 1);
  const { supabase } = await getUser();
  const [{ data: pessoas }, { data: admins }, { data: acs }] = await Promise.all([
    supabase.rpc("admin_publico_campanha"),
    supabase.from("profiles").select("id, nome, apelido, whatsapp, escola, created_at, avatar_em").eq("is_admin", true),
    supabase.from("acessos").select("user_id, produto, status, expira_em"),
  ]);
  const agora = new Date().toISOString();
  const cursos = new Map<string, string[]>();
  for (const a of (acs ?? []) as { user_id: string; produto: string; status: string; expira_em: string | null }[]) {
    if (a.status === "ativo" && (!a.expira_em || a.expira_em > agora)) cursos.set(a.user_id, [...(cursos.get(a.user_id) ?? []), a.produto]);
  }
  const todos = (pessoas ?? []) as Pessoa[];
  const escolas = [...new Set(todos.map((p) => p.escola).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
  const q = (sp.q ?? "").trim().toLowerCase();
  const qDig = q.replace(/\D/g, "");

  const lista = todos
    .filter((p) => !q || `${p.nome ?? ""} ${p.email ?? ""} ${p.escola ?? ""}`.toLowerCase().includes(q) || (qDig.length >= 4 && (p.whatsapp ?? "").replace(/\D/g, "").includes(qDig)))
    .filter((p) => !sp.escola || p.escola === sp.escola)
    .filter((p) => {
      const c = cursos.get(p.id) ?? [];
      switch (sp.curso) {
        case "head-hunter": case "english": return c.includes(sp.curso);
        case "ambos": return c.includes("head-hunter") && c.includes("english");
        case "nenhum": return c.length === 0;
        case "comprou": return p.compras > 0;
        default: return true;
      }
    })
    .filter((p) => (sp.sit === "banido" ? p.bloqueado : sp.sit === "ativo" ? !p.bloqueado : true))
    .filter((p) => (!sp.de || diaSP(p.cadastro) >= sp.de) && (!sp.ate || diaSP(p.cadastro) <= sp.ate));
  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pg = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const { data: fotos } = pg.length ? await supabase.from("profiles").select("id, avatar_em").in("id", pg.map((p) => p.id)) : { data: [] };
  const fotoDe = new Map(((fotos ?? []) as { id: string; avatar_em: string | null }[]).map((f) => [f.id, f.avatar_em]));
  const filtrando = Object.entries(sp).some(([k, v]) => k !== "p" && k !== "excluido" && v);
  const link = (n: number) => `/admin/usuarios?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([k, v]) => k !== "p" && k !== "excluido" && v)) as Record<string, string>, p: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${total} ${total === 1 ? "cadastro" : "cadastros"}${filtrando ? " com estes filtros" : ""}.`}>Usuários</Titulo>
        <a href="/admin/usuarios/csv" className={btnSecundario}>⬇ Exportar (CSV)</a>
      </div>

      {sp.excluido && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Conta de {sp.excluido} excluída. O registro ficou em <Link href="/admin/contas-excluidas" className="underline">Contas excluídas</Link>.</p>}

      <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" role="search">
        <label className="flex flex-col gap-1 text-[13px] font-semibold sm:col-span-2">Buscar
          <input name="q" defaultValue={sp.q} placeholder="Nome, e-mail, telefone ou escola" className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Escola
          <select name="escola" defaultValue={sp.escola ?? ""} className={campo}><option value="">Todas</option>{escolas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Curso
          <select name="curso" defaultValue={sp.curso ?? ""} className={campo}><option value="">Todos</option>{Object.entries(CURSOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Situação
          <select name="sit" defaultValue={sp.sit ?? ""} className={campo}><option value="">Todas</option><option value="ativo">Ativos</option><option value="banido">Banidos</option></select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro a partir de<input type="date" name="de" defaultValue={sp.de} className={campo} /></label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro até<input type="date" name="ate" defaultValue={sp.ate} className={campo} /></label>
        <div className="flex items-end gap-2">
          <button className="min-h-11 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Filtrar</button>
          {filtrando && <Link href="/admin/usuarios" className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold">Limpar</Link>}
        </div>
      </form>

      <ul className="flex flex-col divide-y divide-[#eceef3] rounded-2xl border border-line bg-white">
        {!filtrando && pagina === 1 && ((admins ?? []) as { id: string; nome: string | null; apelido: string | null; whatsapp: string | null; escola: string | null; created_at: string; avatar_em: string | null }[]).map((a) => {
          const nome = a.nome || a.apelido || "Administrador";
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#fafbfd] px-4 py-3">
              <span className="flex min-w-0 flex-[1_1_260px] items-center gap-3">
                <AvatarAluno src={avatarUrl(a.id, a.avatar_em)} nome={nome} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-navy">{nome} <span className="ml-1 rounded-full bg-navy px-2 py-0.5 align-middle text-[11px] font-bold text-white">ADMIN</span></span>
                  <span className="truncate text-[13px] text-muted">{a.escola ?? ""}</span>
                </span>
              </span>
              <span className="w-[150px] text-[13px] text-muted">desde {new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
              <BotaoWhatsapp telefone={a.whatsapp} nome={nome} userId={a.id} tamanho="sm" />
            </li>
          );
        })}
        {pg.map((p) => {
          const nome = p.nome ?? "Sem nome";
          const cs = cursos.get(p.id) ?? [];
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Link href={`/admin/head-hunter/alunos/${p.id}`} className="flex min-w-0 flex-[1_1_260px] items-center gap-3" aria-label={`Ver ficha de ${nome}`}>
                <AvatarAluno src={avatarUrl(p.id, fotoDe.get(p.id) ?? null)} nome={nome} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-navy">{nome}{p.bloqueado && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-[11px] font-bold text-brand-deep">BANIDO</span>}</span>
                  <span className="truncate text-[13px] text-muted">{p.email ?? ""}{p.escola ? ` · ${p.escola}` : ""}</span>
                </span>
              </Link>
              <span className="flex w-[150px] flex-col text-[13px] text-muted">
                <span>desde {new Date(p.cadastro).toLocaleDateString("pt-BR")}</span>
                {p.whatsapp && <span>{p.whatsapp}</span>}
              </span>
              <span className="flex w-[70px] gap-1" aria-label="Cursos">
                {cs.map((c) => <span key={c} title={c === "english" ? "Flight Attendant English" : "Head Hunter"} className="rounded-md bg-[#eef1ff] px-1.5 py-0.5 text-[11px] font-bold text-navy">{c === "english" ? "EN" : "HH"}</span>)}
              </span>
              <AcoesAluno aluno={{ id: p.id, nome, email: p.email, whatsapp: p.whatsapp, bloqueado: p.bloqueado }} voltarPara="/admin/usuarios" />
            </li>
          );
        })}
        {!pg.length && <li className="p-6 text-center text-ink-2">Nenhum usuário encontrado.</li>}
      </ul>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-3">
          {pagina > 1 && <Link href={link(pagina - 1)} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-semibold">← Anterior</Link>}
          <span className="text-sm text-muted">Página {pagina} de {paginas}</span>
          {pagina < paginas && <Link href={link(pagina + 1)} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-semibold">Próxima →</Link>}
        </nav>
      )}
    </>
  );
}
