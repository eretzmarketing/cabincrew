import type { Metadata } from "next";
import Link from "next/link";
import AcoesAluno from "@/components/AcoesAluno";
import AvatarAluno from "@/components/AvatarAluno";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import { Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { LiberarEmMassa } from "@/components/LiberacaoMassa";
import { infoCursos } from "@/lib/cursos-dados";
import { avatarUrl, getUser } from "@/lib/supabase/server";
import { SLUGS_CURSOS, nomeCurso, siglaCurso } from "@/lib/cursos";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

const TAMANHOS = [20, 50, 100, 500];
type Pessoa = { id: string; nome: string | null; email: string | null; whatsapp: string | null; escola: string | null; cadastro: string; bloqueado: boolean; compras: number };
type Busca = { q?: string; escola?: string; curso?: string; pag?: string; sit?: string; de?: string; ate?: string; p?: string; n?: string; excluido?: string };

const CURSOS: Record<string, string> = { "head-hunter": "Com Head Hunter", english: "Com Flight Attendant English", spanish: "Com Flight Attendant Spanish", ambos: "Com HH e English", todos: "Com os três cursos", nenhum: "Sem curso", comprou: "Já comprou algo", plus: "Com Questões Plus" };
const PAGAMENTO: Record<string, string> = { pago: "Pagos", cortesia: "Cortesia (sem pagamento)", reembolsado: "Reembolsados", sem: "Sem curso" };
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const campo = "min-h-11 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]";
const diaSP = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const sp = await searchParams;
  const POR_PAGINA = TAMANHOS.includes(Number(sp.n)) ? Number(sp.n) : 50;
  const paginaPedida = Math.max(1, Number(sp.p) || 1);
  const { supabase } = await getUser();
  const [{ data: pessoas }, { data: admins }, { data: acs }, listaCursos, { data: plusRows }, { data: comprasRows }] = await Promise.all([
    supabase.rpc("admin_publico_campanha"),
    supabase.from("profiles").select("id, nome, apelido, whatsapp, escola, created_at, avatar_em").eq("is_admin", true),
    supabase.from("acessos").select("user_id, produto, status, expira_em"),
    infoCursos(),
    supabase.from("plus_assinantes").select("user_id, ate"),
    supabase.from("compras").select("user_id, email, valor, status"),
  ]);
  const agora = new Date().toISOString();
  const cursos = new Map<string, string[]>();
  for (const a of (acs ?? []) as { user_id: string; produto: string; status: string; expira_em: string | null }[]) {
    if (a.status === "ativo" && (!a.expira_em || a.expira_em > agora)) cursos.set(a.user_id, [...(cursos.get(a.user_id) ?? []), a.produto]);
  }
  const comPlus = new Map(((plusRows ?? []) as { user_id: string; ate: string | null }[])
    .filter((x) => !x.ate || x.ate > agora).map((x) => [x.user_id, x.ate]));
  const todos = (pessoas ?? []) as Pessoa[];
  // pagamento: soma do que cada aluno pagou (compra ligada à conta ou ao mesmo e-mail)
  const idPorEmail = new Map(todos.filter((p) => p.email).map((p) => [p.email!.trim().toLowerCase(), p.id]));
  const pago = new Map<string, { total: number; n: number }>();
  const reembolsou = new Set<string>();
  for (const c of (comprasRows ?? []) as { user_id: string | null; email: string | null; valor: number; status: string }[]) {
    const id = c.user_id ?? idPorEmail.get((c.email ?? "").trim().toLowerCase());
    if (!id) continue;
    if (c.status === "reembolsada") reembolsou.add(id);
    else if (c.status === "aprovada" && Number(c.valor) > 0) {
      const a = pago.get(id) ?? { total: 0, n: 0 };
      pago.set(id, { total: a.total + Number(c.valor), n: a.n + 1 });
    }
  }
  const tipoPagamento = (id: string) =>
    pago.has(id) ? "pago" : (cursos.get(id)?.length ?? 0) > 0 ? "cortesia" : reembolsou.has(id) ? "reembolsado" : "sem";
  const escolas = [...new Set(todos.map((p) => p.escola).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
  const q = (sp.q ?? "").trim().toLowerCase();
  const qDig = q.replace(/\D/g, "");

  const lista = todos
    .filter((p) => !q || `${p.nome ?? ""} ${p.email ?? ""} ${p.escola ?? ""}`.toLowerCase().includes(q) || (qDig.length >= 4 && (p.whatsapp ?? "").replace(/\D/g, "").includes(qDig)))
    .filter((p) => !sp.escola || p.escola === sp.escola)
    .filter((p) => {
      const c = cursos.get(p.id) ?? [];
      switch (sp.curso) {
        case "head-hunter": case "english": case "spanish": return c.includes(sp.curso);
        case "ambos": return c.includes("head-hunter") && c.includes("english");
        case "todos": return SLUGS_CURSOS.every((x) => c.includes(x));
        case "nenhum": return c.length === 0;
        case "comprou": return p.compras > 0;
        case "plus": return comPlus.has(p.id);
        default: return true;
      }
    })
    .filter((p) => !sp.pag || !PAGAMENTO[sp.pag] || tipoPagamento(p.id) === sp.pag)
    .filter((p) => (sp.sit === "banido" ? p.bloqueado : sp.sit === "ativo" ? !p.bloqueado : true))
    .filter((p) => (!sp.de || diaSP(p.cadastro) >= sp.de) && (!sp.ate || diaSP(p.cadastro) <= sp.ate));
  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(paginaPedida, paginas);
  const pg = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const { data: fotos } = pg.length ? await supabase.from("profiles").select("id, avatar_em").in("id", pg.map((p) => p.id)) : { data: [] };
  const fotoDe = new Map(((fotos ?? []) as { id: string; avatar_em: string | null }[]).map((f) => [f.id, f.avatar_em]));
  const filtrando = Object.entries(sp).some(([k, v]) => !["p", "n", "excluido"].includes(k) && v);
  const base = Object.fromEntries(Object.entries(sp).filter(([k, v]) => !["p", "n", "excluido"].includes(k) && v)) as Record<string, string>;
  const link = (pg: number, n = POR_PAGINA) => `/admin/usuarios?${new URLSearchParams({ ...base, ...(n !== 50 ? { n: String(n) } : {}), ...(pg > 1 ? { p: String(pg) } : {}) })}`;
  // números das páginas: 1 … 4 5 [6] 7 8 … 20
  const numeros = [...new Set([1, pagina - 2, pagina - 1, pagina, pagina + 1, pagina + 2, paginas])].filter((x) => x >= 1 && x <= paginas).sort((a, b) => a - b);
  const de = total ? (pagina - 1) * POR_PAGINA + 1 : 0;
  const ate = Math.min(total, pagina * POR_PAGINA);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${total} ${total === 1 ? "cadastro" : "cadastros"}${filtrando ? " com estes filtros" : ""}.`}>Usuários</Titulo>
        <div className="flex flex-wrap gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download do CSV, não é página */}
          <a href="/admin/usuarios/csv" className={btnSecundario}>⬇ Exportar (CSV)</a>
          <Link href="/admin/usuarios/escolas" className={btnSecundario}>🏫 Regras por escola</Link>
          <Link href="/admin/usuarios/adicionar" className={btnPrimario}>+ Adicionar aluno</Link>
        </div>
      </div>

      {sp.excluido && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Conta de {sp.excluido} excluída. O registro ficou em <Link href="/admin/contas-excluidas" className="underline">Contas excluídas</Link>.</p>}

      <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <label className="flex flex-col gap-1 text-[13px] font-semibold sm:col-span-2">Buscar
          <input name="q" defaultValue={sp.q} placeholder="Nome, e-mail, telefone ou escola" className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Escola
          <select name="escola" defaultValue={sp.escola ?? ""} className={campo}><option value="">Todas</option>{escolas.map((e) => <option key={e} value={e}>{e}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Curso
          <select name="curso" defaultValue={sp.curso ?? ""} className={campo}><option value="">Todos</option>{Object.entries(CURSOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Pagamento
          <select name="pag" defaultValue={sp.pag ?? ""} className={campo}><option value="">Todos</option>{Object.entries(PAGAMENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Situação
          <select name="sit" defaultValue={sp.sit ?? ""} className={campo}><option value="">Todas</option><option value="ativo">Ativos</option><option value="banido">Banidos</option></select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro a partir de<input type="date" name="de" defaultValue={sp.de} className={campo} /></label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold">Cadastro até<input type="date" name="ate" defaultValue={sp.ate} className={campo} /></label>
        <div className="flex items-end gap-2">
          {POR_PAGINA !== 50 && <input type="hidden" name="n" value={POR_PAGINA} />}
          <button className="min-h-11 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Filtrar</button>
          {filtrando && <Link href="/admin/usuarios" className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold">Limpar</Link>}
        </div>
      </form>

      <LiberarEmMassa cursos={listaCursos.map((c) => ({ slug: c.slug, nome: c.titulo }))} idsFiltro={lista.map((p) => p.id)} filtrando={filtrando} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14px] text-ink-2">{total ? <>Mostrando <strong className="text-navy">{de}–{ate}</strong> de {total}</> : "Nenhum resultado"}</span>
        <nav aria-label="Quantos por página" className="flex items-center gap-1.5 text-[14px]">
          <span className="mr-1 font-semibold">Por página:</span>
          {TAMANHOS.map((n) => (
            <Link key={n} href={link(1, n)} aria-current={n === POR_PAGINA ? "true" : undefined}
              className={`inline-flex min-h-10 min-w-11 items-center justify-center rounded-full px-3 font-semibold ${n === POR_PAGINA ? "bg-navy text-white" : "border border-line bg-white text-navy hover:border-navy"}`}>{n}</Link>
          ))}
        </nav>
      </div>

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
              <input type="checkbox" data-massa value={p.id} aria-label={`Marcar ${nome}`} className="h-5 w-5 shrink-0 cursor-pointer accent-brand-strong" />
              <Link href={`/admin/usuarios/${p.id}`} className="flex min-w-0 flex-[1_1_230px] items-center gap-3" aria-label={`Ver ficha de ${nome}`}>
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
              <span className="flex w-[150px] flex-wrap items-center gap-1" aria-label="Cursos e recursos">
                {cs.map((c) => <span key={c} title={nomeCurso(c)} className="rounded-md bg-[#eef1ff] px-1.5 py-0.5 text-[11px] font-bold text-navy">{siglaCurso(c)}</span>)}
                {(() => {
                  const t = tipoPagamento(p.id);
                  if (t === "pago") {
                    const v = pago.get(p.id)!;
                    const dica = `Pagou ${brl(v.total)} (${v.n} ${v.n === 1 ? "compra" : "compras"})`;
                    return <span title={dica} aria-label={dica} className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#e5f6ec] text-[13px] font-extrabold text-[#0f6b3a]">$</span>;
                  }
                  if (t === "cortesia") return <span title="Cortesia: acesso liberado sem pagamento" aria-label="Cortesia: acesso liberado sem pagamento" className="grid h-[22px] w-[22px] place-items-center rounded-full bg-soft text-[12px]">🎁</span>;
                  if (t === "reembolsado") return <span title="Reembolsado" aria-label="Reembolsado" className="grid h-[22px] w-[22px] place-items-center rounded-full bg-brand-soft text-[12px] font-bold text-brand-deep">↩</span>;
                  return null;
                })()}
                {comPlus.has(p.id) && (() => {
                  const ate = comPlus.get(p.id);
                  const dica = `Questões Plus liberado ${ate ? `até ${new Date(ate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "sem prazo"}`;
                  return <span title={dica} aria-label={dica} className="rounded-md bg-[#fff3c4] px-1.5 py-0.5 text-[11px] font-bold text-[#7a5600]">⭐ Plus</span>;
                })()}
              </span>
              <AcoesAluno aluno={{ id: p.id, nome, email: p.email, whatsapp: p.whatsapp, bloqueado: p.bloqueado }} voltarPara="/admin/usuarios" />
            </li>
          );
        })}
        {!pg.length && <li className="p-6 text-center text-ink-2">Nenhum usuário encontrado.</li>}
      </ul>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="flex flex-wrap items-center justify-center gap-1.5">
          {pagina > 1 && <Link href={link(pagina - 1)} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-semibold">← Anterior</Link>}
          {numeros.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5">
              {i > 0 && n - numeros[i - 1] > 1 && <span className="px-1 text-muted" aria-hidden="true">…</span>}
              <Link href={link(n)} aria-current={n === pagina ? "page" : undefined} aria-label={`Página ${n}`}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 font-semibold ${n === pagina ? "bg-navy text-white" : "border border-line bg-white text-navy hover:border-navy"}`}>{n}</Link>
            </span>
          ))}
          {pagina < paginas && <Link href={link(pagina + 1)} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-semibold">Próxima →</Link>}
        </nav>
      )}
    </>
  );
}
