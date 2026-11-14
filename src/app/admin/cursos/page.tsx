import type { Metadata } from "next";
import Link from "next/link";
import { Titulo } from "@/components/admin-ui";
import { cursoIdioma, infoCursos } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cursos" };
export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const { supabase } = await getUser();
  const [cursos, en, es, mods, auls] = await Promise.all([
    infoCursos(),
    cursoIdioma("english", true),
    cursoIdioma("spanish", true),
    supabase.from("modulos").select("id, publicado"),
    supabase.from("aulas").select("id, publicado"),
  ]);
  const conta: Record<string, { modulos: number; aulas: number; ocultos: number }> = {
    "head-hunter": {
      modulos: (mods.data ?? []).length,
      aulas: (auls.data ?? []).length,
      ocultos: (mods.data ?? []).filter((m) => !m.publicado).length + (auls.data ?? []).filter((a) => !a.publicado).length,
    },
  };
  for (const c of [en, es]) {
    conta[c.produto] = {
      modulos: c.modulos.length,
      aulas: c.modulos.reduce((s, m) => s + m.aulas.length, 0),
      ocultos: c.modulos.filter((m) => m.oculto).length + c.modulos.reduce((s, m) => s + m.aulas.filter((a) => a.oculto).length, 0),
    };
  }

  return (
    <>
      <Titulo sub="Clique num curso para mudar o título, a descrição e a imagem, e para adicionar, editar, ocultar, excluir ou reordenar módulos e aulas.">Cursos</Titulo>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cursos.map((c) => {
          const n = conta[c.slug];
          return (
            <li key={c.slug}>
              <Link href={`/admin/cursos/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">
                <span className="relative block aspect-[16/9] overflow-hidden bg-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imagem} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute top-3 left-3 rounded-full bg-[#e5f6ec] px-3 py-1 text-xs font-bold text-[#0f6b3a]">Curso</span>
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
