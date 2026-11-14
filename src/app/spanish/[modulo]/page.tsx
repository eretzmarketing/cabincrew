import type { Metadata } from "next";
import { ModuloIdioma } from "@/components/CursoIdiomaPaginas";
import { ESPANHOL } from "@/lib/cursos-idioma";

export const metadata: Metadata = { title: "Flight Attendant Spanish", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ modulo: string }> }) {
  const { modulo } = await params;
  return <ModuloIdioma c={ESPANHOL} modulo={modulo} />;
}
