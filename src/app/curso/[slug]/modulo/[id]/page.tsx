import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaModulo } from "@/components/CursoPaginas";
import { infoCurso } from "@/lib/cursos-dados";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Módulo", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const info = await infoCurso(slug);
  if (!info || info.tipo !== "padrao") notFound();
  if (!info.publicado && !(await getUser()).profile?.is_admin) notFound();
  return <PaginaModulo c={{ slug, base: info.endereco, nome: info.titulo, voltar: info.titulo }} id={id} />;
}
