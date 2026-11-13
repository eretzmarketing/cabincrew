import type { Metadata } from "next";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import Link from "next/link";
import { alterarAdmin } from "@/app/crew-actions";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Usuários" };

const POR_PAGINA = 50;

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string; p?: string }> }) {
  const { q = "", p = "1" } = await searchParams;
  const pagina = Math.max(1, Number(p) || 1);
  const { supabase, user } = await getUser();

  let consulta = supabase
    .from("profiles")
    .select("id, nome, apelido, whatsapp, escola, pontos, is_admin, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  const busca = q.trim().replace(/[%,()]/g, " ").slice(0, 60);
  if (busca) {
    const digitos = busca.replace(/\D/g, "");
    const filtros = [`nome.ilike.%${busca}%`, `escola.ilike.%${busca}%`, `apelido.ilike.%${busca}%`];
    if (digitos.length >= 4) filtros.push(`whatsapp.ilike.%${digitos}%`);
    consulta = consulta.or(filtros.join(","));
  }
  const { data: usuarios, count } = await consulta;
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const link = (n: number) => `/admin/usuarios?${new URLSearchParams({ ...(q ? { q } : {}), p: String(n) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${total} ${total === 1 ? "cadastro" : "cadastros"}${busca ? ` encontrados para “${busca}”` : ""}.`}>Usuários</Titulo>
        <a href="/admin/usuarios/csv" className={btnSecundario}>⬇ Exportar todos os usuários (CSV)</a>
      </div>

      <form className="flex flex-wrap gap-2" role="search">
        <label htmlFor="busca" className="sr-only">Buscar</label>
        <input id="busca" name="q" defaultValue={q} placeholder="Buscar por nome, escola ou WhatsApp" className="min-h-12 flex-[1_1_280px] rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px]" />
        <button className="min-h-12 cursor-pointer rounded-xl bg-navy px-5 font-semibold text-white">Buscar</button>
        {q && <Link href="/admin/usuarios" className="inline-flex min-h-12 items-center px-3 font-semibold">Limpar</Link>}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr>
              <th className="p-3 font-semibold">Nome</th>
              <th className="p-3 font-semibold">WhatsApp</th>
              <th className="p-3 font-semibold">Escola</th>
              <th className="p-3 font-semibold">Pontos</th>
              <th className="p-3 font-semibold">Cadastro</th>
              <th className="p-3 font-semibold">Acesso</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u) => (
              <tr key={u.id} className="border-b border-[#eceef3] last:border-0">
                <td className="p-3">
                  <span className="font-semibold">{u.nome ?? "—"}</span>
                  {u.is_admin && <span className="ml-2 rounded-full bg-navy px-2 py-0.5 text-xs font-semibold text-white">admin</span>}
                </td>
                <td className="p-3">
                  {u.whatsapp ? <span className="flex items-center gap-2 whitespace-nowrap">{u.whatsapp}<BotaoWhatsapp telefone={u.whatsapp} nome={u.nome ?? "Usuário"} userId={u.id} tamanho="sm" /></span> : "—"}
                </td>
                <td className="p-3">{u.escola ?? "—"}</td>
                <td className="p-3">{u.pontos}</td>
                <td className="p-3 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="p-3">
                  {u.id === user?.id ? (
                    <span className="text-sm text-muted">você</span>
                  ) : (
                    <form action={alterarAdmin}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="valor" value={String(!u.is_admin)} />
                      <button className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold text-navy hover:bg-soft">
                        {u.is_admin ? "Remover admin" : "Tornar admin"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!usuarios?.length && (
              <tr><td colSpan={6} className="p-6 text-center text-ink-2">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-3">
          {pagina > 1 && <Link href={link(pagina - 1)} className={btnSecundario}>← Anterior</Link>}
          <span className="text-sm text-muted">Página {pagina} de {paginas}</span>
          {pagina < paginas && <Link href={link(pagina + 1)} className={btnSecundario}>Próxima →</Link>}
        </nav>
      )}
    </>
  );
}
