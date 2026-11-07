import type { Metadata } from "next";
import Link from "next/link";
import { Card, Chave, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { ModuloForm } from "@/components/admin-forms";
import { getConfig } from "@/lib/config";
import { numeroModulo, type Modulo } from "@/lib/crew";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Crew Select" };

export default async function AdminCrewSelect() {
  const { supabase } = await getUser();
  const [{ data: modulos }, { data: aulas }, cfg] = await Promise.all([
    supabase.from("modulos").select("*").order("ordem"),
    supabase.from("aulas").select("modulo_id, publicado"),
    getConfig(),
  ]);
  const lista = (modulos ?? []) as Modulo[];
  const conta = new Map<number, { total: number; pub: number }>();
  for (const a of aulas ?? []) {
    const c = conta.get(a.modulo_id) ?? { total: 0, pub: 0 };
    c.total += 1;
    if (a.publicado) c.pub += 1;
    conta.set(a.modulo_id, c);
  }
  const proximaOrdem = lista.length ? Math.max(...lista.map((m) => m.ordem)) + 1 : 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Módulos e aulas que os alunos veem na área do Crew Select.">Crew Select</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/crew-select/simulados" className={btnSecundario}>Simulados</Link>
          <Link href="/admin/questoes" className={btnSecundario}>Banco de questões</Link>
          <Link href="/admin/crew-select/dinamicas" className={btnSecundario}>Dinâmicas</Link>
          <Link href="/admin/crew-select/aula/nova" className={btnPrimario}>+ Nova aula</Link>
        </div>
      </div>

      <Card>
        <Chave
          chave="crew_select_aberto"
          ligado={cfg.crew_select_aberto}
          titulo="Acesso dos alunos"
          descricao="Ligado: todo cadastrado acessa os módulos publicados. Desligado: os alunos veem a tela “Em breve” (administradores continuam vendo tudo)."
        />
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-muted">
            <tr><th className="p-3 font-semibold">Módulo</th><th className="p-3 font-semibold">Aulas</th><th className="p-3 font-semibold">Situação</th></tr>
          </thead>
          <tbody>
            {lista.map((m) => {
              const c = conta.get(m.id) ?? { total: 0, pub: 0 };
              return (
                <tr key={m.id} className="border-b border-[#eceef3] last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/crew-select/modulo/${m.id}`} className="font-semibold text-navy hover:text-brand-strong">
                      <span className="mr-2 font-display font-extrabold text-brand">{numeroModulo(m.ordem)}</span>{m.titulo}
                    </Link>
                    {m.fase && <span className="block text-[13px] text-muted">{m.fase}</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">{c.pub} {c.pub === 1 ? "publicada" : "publicadas"}{c.total > c.pub ? ` · ${c.total - c.pub} rascunho${c.total - c.pub > 1 ? "s" : ""}` : ""}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.publicado ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#eef0f4] text-ink-2"}`}>
                      {m.publicado ? "Visível" : "Oculto"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Card>
        <h2 className="font-display text-xl font-bold">Novo módulo</h2>
        <ModuloForm proximaOrdem={proximaOrdem} />
      </Card>
    </>
  );
}
