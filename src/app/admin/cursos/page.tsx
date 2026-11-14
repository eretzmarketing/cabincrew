import type { Metadata } from "next";
import Link from "next/link";
import { Titulo, btnPrimario } from "@/components/admin-ui";
import { cursoIdioma, infoCursos } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cursos" };
export const dynamic = "force-dynamic";

export default async function CursosPage({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getUser();
  const [cursos, en, es, mods, auls] = await Promise.all([
    infoCursos(),
    cursoIdioma("english", true),
    cursoIdioma("spanish", true),
    supabase.from("modulos").select("id, publicado, curso"),
    supabase.from("aulas").select("id, publicado, curso"),
  ]);
  const { data: prods } = await supabase.from("produtos").select("slug, ativo, preco");
  const venda = new Map(((prods ?? []) as { slug: string; ativo: boolean; preco: number }[]).map((p) => [p.slug, p]));
  const conta: Record<string, { modulos: number; aulas: number; ocultos: number }> = {};
  for (const c of cursos.filter((x) => x.tipo !== "idioma")) {
    const ms = ((mods.data ?? []) as { publicado: boolean; curso?: string }[]).filter((m) => (m.curso ?? "head-hunter") === c.slug);
    const as = ((auls.data ?? []) as { publicado: boolean; curso?: string }[]).filter((a) => (a.curso ?? "head-hunter") === c.slug);
    conta[c.slug] = { modulos: ms.length, aulas: as.length, ocultos: ms.filter((m) => !m.publicado).length + as.filter((a) => !a.publicado).length };
  }
  for (const c of [en, es]) {
    conta[c.produto] = {
      modulos: c.modulos.length,
      aulas: c.modulos.reduce((s, m) => s + m.aulas.length, 0),
      ocultos: c.modulos.filter((m) => m.oculto).length + c.modulos.reduce((s, m) => s + m.aulas.filter((a) => a.oculto).length, 0),
    };
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Clique num curso para mudar o título, a descrição, a imagem e o preço, e para adicionar, editar, ocultar, excluir ou reordenar módulos e aulas.">Cursos</Titulo>
        <Link href="/admin/cursos/novo" className={btnPrimario}>+ Criar curso</Link>
      </div>
      {sp.excluido && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Curso excluído.</p>}
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cursos.map((c) => {
          const n = conta[c.slug] ?? { modulos: 0, aulas: 0, ocultos: 0 };
          const v = venda.get(c.slug);
          return (
            <li key={c.slug}>
              <Link href={`/admin/cursos/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">
                <span className="relative block aspect-[16/9] overflow-hidden bg-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imagem} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {c.tipo === "padrao" && !c.publicado ? <span className="rounded-full bg-[#fff3e0] px-3 py-1 text-xs font-bold text-[#8a4b00]">Rascunho</span> : <span className="rounded-full bg-[#e5f6ec] px-3 py-1 text-xs font-bold text-[#0f6b3a]">Publicado</span>}
                    {v && <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-navy">{v.ativo ? Number(v.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Fora de venda"}</span>}
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-2 p-5">
                  <strong className="font-display text-xl leading-tight font-extrabold group-hover:text-brand-strong">{c.titulo}</strong>
                  <span className="line-clamp-2 text-[14px] leading-relaxed text-ink-2">{c.descricao}</span>
                  <span className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[14px] text-muted">
                    <span>{n.modulos} módulos · {n.aulas} aulas{n.ocultos ? ` · ${n.ocultos} oculto${n.ocultos > 1 ? "s" : ""}` : ""}</span>
                    <span className="font-semibold text-navy">Editar →</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="rounded-2xl border border-line bg-white px-5 py-4 text-[15px] text-ink-2">
        Os <strong>Simulados ANAC</strong> não são um curso: ficam em <Link href="/admin/anac" className="font-semibold text-navy underline underline-offset-4">Simulados ANAC</Link>, com o banco de questões.
      </p>
    </>
  );
}
