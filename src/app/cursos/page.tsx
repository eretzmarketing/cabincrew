import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { infoCursos } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cursos", description: "Cursos da Cabin Crew para quem quer ser comissário(a) de voo." };
export const dynamic = "force-dynamic";

/** Catálogo: todos os cursos publicados. */
export default async function Cursos() {
  const [cursos, { supabase }] = await Promise.all([infoCursos(), getUser()]);
  const { data: prods } = await supabase.from("produtos").select("slug, preco, ativo");
  const preco = new Map(((prods ?? []) as { slug: string; preco: number; ativo: boolean }[]).filter((p) => p.ativo).map((p) => [p.slug, Number(p.preco)]));
  const lista = cursos.filter((c) => c.publicado);
  return (
    <main className="bg-soft">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-3 px-6 pt-14 pb-24 text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">Cursos Cabin Crew</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold md:text-[46px]">Cursos para <span className="text-[#ff5a7a]">decolar</span></h1>
          <p className="max-w-[900px] text-[17px] leading-relaxed text-balance text-[#d7dbe6]">Escolha o curso e estude no seu ritmo, com certificado ao concluir.</p>
        </div>
      </section>
      <ul className="mx-auto -mt-14 grid max-w-[1100px] gap-5 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3 md:px-6">
        {lista.map((c) => (
          <li key={c.slug}>
            <Link href={c.endereco} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white text-navy hover:border-navy hover:shadow-[0_18px_40px_-28px_rgba(35,42,61,.6)]">
              <span className="relative block aspect-[16/10] overflow-hidden bg-soft">
                <Image src={c.imagem} alt="" fill sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
              </span>
              <span className="flex flex-1 flex-col gap-2 p-5">
                <strong className="font-display text-xl leading-tight font-extrabold group-hover:text-brand-strong">{c.titulo}</strong>
                <span className="line-clamp-3 text-[15px] leading-relaxed text-ink-2">{c.descricao}</span>
                <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-[15px]">
                  {preco.has(c.slug) ? <strong>{preco.get(c.slug)!.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong> : <span className="text-muted">Em breve</span>}
                  <span className="font-semibold">Conhecer →</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
