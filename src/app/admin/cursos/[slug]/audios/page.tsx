import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminCursoIdioma from "@/components/AdminCursoIdioma";
import { cursoIdioma } from "@/lib/cursos-dados";
import { ehProdutoIdioma } from "@/lib/idioma-conteudo";

export const metadata: Metadata = { title: "Áudios e andamento" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ehProdutoIdioma(slug)) notFound();
  return (
    <>
      <Link href={`/admin/cursos/${slug}`} className="text-sm font-semibold text-muted hover:text-navy">← Voltar ao curso</Link>
      <AdminCursoIdioma c={await cursoIdioma(slug)} adminBase={slug === "english" ? "/admin/ingles" : "/admin/espanhol"} />
    </>
  );
}
