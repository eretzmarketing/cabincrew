import type { Metadata } from "next";
import { excluirInteressado } from "@/app/crew-actions";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { getUser } from "@/lib/supabase/server";
import { paisPorIso } from "@/lib/paises";

export const metadata: Metadata = { title: "Lista de interesse" };

/** Mostra +5511987654321 como +55 (11) 98765-4321 */
function telefoneLegivel(t: string) {
  const m = t.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : t;
}

export default async function InteressadosPage() {
  const { supabase } = await getUser();
  const { data, count } = await supabase
    .from("interessados")
    .select("id, nome, telefone, pais, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(1000);
  const lista = data ?? [];
  const total = count ?? 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`${total} ${total === 1 ? "pessoa pediu para ser avisada" : "pessoas pediram para ser avisadas"} em primeira mão na página Em breve.`}>
          Lista de interesse
        </Titulo>
        {total > 0 && <a href="/admin/interessados/csv" className={btnSecundario}>Baixar em CSV</a>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr>
              <th className="p-3 font-semibold">Nome</th>
              <th className="p-3 font-semibold">WhatsApp</th>
              <th className="p-3 font-semibold">País</th>
              <th className="p-3 font-semibold">Data</th>
              <th className="p-3 font-semibold"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((i) => (
              <tr key={i.id} className="border-b border-[#eceef3] last:border-0">
                <td className="p-3 font-semibold">{i.nome}</td>
                <td className="p-3 whitespace-nowrap">
                  <a href={`https://wa.me/${i.telefone.replace("+", "")}`} target="_blank" rel="noreferrer">{telefoneLegivel(i.telefone)}</a>
                </td>
                <td className="p-3">{paisPorIso(i.pais)?.nome ?? i.pais}</td>
                <td className="p-3 whitespace-nowrap">{new Date(i.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</td>
                <td className="p-3 text-right">
                  <form action={excluirInteressado}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold text-muted hover:bg-soft hover:text-brand-deep">Remover</button>
                  </form>
                </td>
              </tr>
            ))}
            {!lista.length && (
              <tr><td colSpan={5} className="p-8 text-center text-ink-2">Ninguém na lista ainda. Os pedidos feitos na página Em breve aparecem aqui.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
