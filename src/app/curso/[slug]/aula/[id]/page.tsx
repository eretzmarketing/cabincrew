import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaAula } from "@/components/CursoPaginas";
import { infoCurso } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aula", robots: { index: false } };

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string; id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { slug, id } = await params;
  const { erro } = await searchParams;
  const info = await infoCurso(slug);
  if (!info || info.tipo !== "padrao") notFound();
  if (!info.publicado && !(await getUser()).profile?.is_admin) notFound();
  return <PaginaAula c={{ slug, base: info.endereco, nome: info.titulo, voltar: info.titulo }} id={id} erro={erro} />;
}
