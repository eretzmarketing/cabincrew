import type { Metadata } from "next";
import Link from "next/link";
import { alternarQuestao } from "@/app/crew-actions";
import { Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { BANCOS, type Alternativa } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Banco de questões" };

const POR_PAGINA = 50;

type Sp = { banco?: string; q?: string; cat?: string; status?: string; p?: string };

export default async function AdminQuestoes({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  const banco = sp.banco && sp.banco in BANCOS ? sp.banco : "anac";
  const busca = (sp.q ?? "").trim().slice(0, 100);
  const status = sp.status === "ativas" || sp.status === "fora" ? sp.status : "todas";
  const pagina = Math.max(1, Number(sp.p) || 1);
  const { supabase } = await getUser();

  let consulta = supabase
    .from("questoes")
    .select("id, categoria, contexto, enunciado, imagem_url, alternativas, correta, ativo", { count: "exact" })
    .eq("banco", banco);
  if (sp.cat) consulta = consulta.eq("categoria", sp.cat);
  if (status === "ativas") consulta = consulta.eq("ativo", true);
  if (status === "fora") consulta = consulta.eq("ativo", false);
  if (busca) consulta = consulta.ilike("enunciado", `%${busca.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);

  const [{ data, count }, { data: totais }, { data: cats }] = await Promise.all([
    consulta.order("categoria", { nullsFirst: true }).order("enunciado").order("id").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1),
    supabase.rpc("contagem_bancos"),
    supabase.from("questoes").select("categoria").eq("banco", banco).limit(10000),
  ]);

  const porBanco = new Map<string, number>();
  for (const c of (totais ?? []) as { banco: string; total: number }[]) porBanco.set(c.banco, (porBanco.get(c.banco) ?? 0) + Number(c.total));
  const contaCat = new Map<string, number>();
  for (const c of cats ?? []) if (c.categoria) contaCat.set(c.categoria, (contaCat.get(c.categoria) ?? 0) + 1);
  const categorias = [...contaCat.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));

  const lista = (data ?? []) as {
    id: string; categoria: string | null; contexto: string | null; enunciado: string;
    imagem_url: string | null; alternativas: Alternativa[]; correta: string | null; ativo: boolean;
  }[];
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const url = (mudar: Partial<Sp>) => {
    const p = new URLSearchParams();
    const v = { banco, q: busca, cat: sp.cat, status, p: String(pagina), ...mudar };
    if (v.banco) p.set("banco", v.banco);
    if (v.q) p.set("q", v.q);
    if (v.cat) p.set("cat", v.cat);
    if (v.status && v.status !== "todas") p.set("status", v.status);
    if (v.p && v.p !== "1") p.set("p", v.p);
    return `/admin/questoes?${p.toString()}`;
  };
  const aqui = url({});

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Corrija enunciados, alternativas, gabarito e explicações. As mudanças valem para os próximos simulados.">Banco de questões</Titulo>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/questoes/csv?banco=${banco}`} className={btnSecundario}>Exportar CSV</a>
          <Link href={`/admin/questoes/nova?banco=${banco}`} className={btnPrimario}>+ Nova questão</Link>
        </div>
      </div>

      <nav aria-label="Bancos de questões" className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(BANCOS).map(([k, v]) => (
          <Link
            key={k}
            href={`/admin/questoes?banco=${k}`}
            aria-current={k === banco ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold ${
              k === banco ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"
            }`}
          >
            {v} <span className="opacity-70">{(porBanco.get(k) ?? 0).toLocaleString("pt-BR")}</span>
          </Link>
        ))}
      </nav>

      <form role="search" className="flex flex-wrap gap-2 rounded-[20px] border border-line bg-white p-4">
        <input type="hidden" name="banco" value={banco} />
        <label htmlFor="busca-q" className="sr-only">Buscar no enunciado</label>
        <input id="busca-q" name="q" defaultValue={busca} placeholder="Buscar no enunciado…" className="min-h-12 min-w-0 flex-[2_1_260px] rounded-xl border border-[#c9cedb] px-4 text-[15px]" />
        <label htmlFor="cat-q" className="sr-only">Tema</label>
        <select id="cat-q" name="cat" defaultValue={sp.cat ?? ""} className="min-h-12 min-w-0 flex-[1_1_200px] rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
          <option value="">Todos os temas</option>
          {categorias.map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
        </select>
        <label htmlFor="status-q" className="sr-only">Situação</label>
        <select id="status-q" name="status" defaultValue={status} className="min-h-12 flex-[1_1_170px] rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
          <option value="todas">Todas</option>
          <option value="ativas">Nos simulados</option>
          <option value="fora">Fora dos simulados</option>
        </select>
        <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-6 font-semibold text-white">Filtrar</button>
      </form>

      <p className="text-[15px] text-ink-2">
        {total.toLocaleString("pt-BR")} {total === 1 ? "questão encontrada" : "questões encontradas"}
        {(busca || sp.cat || status !== "todas") && <> · <Link href={`/admin/questoes?banco=${banco}`} className="font-semibold">limpar filtros</Link></>}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[820px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr>
              <th className="p-3 font-semibold">Tema</th>
              <th className="p-3 font-semibold">Questão</th>
              <th className="p-3 text-center font-semibold">Resposta</th>
              <th className="p-3 font-semibold">Situação</th>
              <th className="p-3 font-semibold"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((q) => {
              const certa = q.alternativas?.find((a) => a.letra === q.correta);
              return (
                <tr key={q.id} className={`border-b border-[#eceef3] align-top last:border-0 ${q.ativo ? "" : "bg-[#fbfbfc]"}`}>
                  <td className="w-44 p-3">
                    {q.categoria ? <span className="inline-block rounded-full bg-[#efeaff] px-2.5 py-1 text-xs font-semibold text-[#5b3cc4]">{q.categoria}</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent(aqui)}`} className="line-clamp-2 font-semibold text-navy hover:text-brand-strong">
                      {q.enunciado}
                    </Link>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                      {certa?.texto && <span className="line-clamp-1">✓ {certa.texto}</span>}
                      {q.imagem_url && <span>🖼 com imagem</span>}
                      {q.contexto && <span>📄 com texto de apoio</span>}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {q.correta
                      ? <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-strong font-display font-bold text-white">{q.correta}</span>
                      : <span className="text-sm font-semibold text-brand-deep">sem gabarito</span>}
                  </td>
                  <td className="p-3">
                    <form action={alternarQuestao}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="ativo" value={String(!q.ativo)} />
                      <button
                        title={q.ativo ? "Tirar dos simulados" : "Voltar para os simulados"}
                        className={`min-h-9 cursor-pointer rounded-full px-3 text-xs font-semibold whitespace-nowrap ${q.ativo ? "bg-[#e5f6ec] text-[#0f6b3a] hover:bg-[#d3efdf]" : "bg-[#fff3e0] text-[#8a4b00] hover:bg-[#ffe8c7]"}`}
                      >
                        {q.ativo ? "Nos simulados" : "Fora dos simulados"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/questoes/${q.id}?voltar=${encodeURIComponent(aqui)}`} className="inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold hover:bg-soft">Editar</Link>
                  </td>
                </tr>
              );
            })}
            {!lista.length && <tr><td colSpan={5} className="p-8 text-center text-ink-2">Nenhuma questão encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="flex flex-wrap items-center justify-center gap-2">
          {pagina > 1 && <Link href={url({ p: String(pagina - 1) })} className={btnSecundario}>← Anterior</Link>}
          <span className="px-3 text-[15px] text-ink-2">Página {pagina} de {paginas}</span>
          {pagina < paginas && <Link href={url({ p: String(pagina + 1) })} className={btnSecundario}>Próxima →</Link>}
        </nav>
      )}
    </>
  );
}
