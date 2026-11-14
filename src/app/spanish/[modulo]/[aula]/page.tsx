import type { Metadata } from "next";
import { AulaIdioma, tituloAula } from "@/components/CursoIdiomaPaginas";
import { cursoIdioma } from "@/lib/cursos-dados";

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; aula: string }> }): Promise<Metadata> {
  const { modulo, aula } = await params;
  return tituloAula(await cursoIdioma("spanish"), modulo, aula);
}

export default async function Page({ params }: { params: Promise<{ modulo: string; aula: string }> }) {
  const { modulo, aula } = await params;
  return <AulaIdioma c={await cursoIdioma("spanish")} modulo={modulo} aula={aula} />;
}
