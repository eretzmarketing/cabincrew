import type { Metadata } from "next";
import { AulaIdioma, tituloAula } from "@/components/CursoIdiomaPaginas";
import { ESPANHOL } from "@/lib/cursos-idioma";

export async function generateMetadata({ params }: { params: Promise<{ modulo: string; aula: string }> }): Promise<Metadata> {
  const { modulo, aula } = await params;
  return tituloAula(ESPANHOL, modulo, aula);
}

export default async function Page({ params }: { params: Promise<{ modulo: string; aula: string }> }) {
  const { modulo, aula } = await params;
  return <AulaIdioma c={ESPANHOL} modulo={modulo} aula={aula} />;
}
