import type { Metadata } from "next";
import { InicioIdioma } from "@/components/CursoIdiomaPaginas";
import { cursoIdioma } from "@/lib/cursos-dados";

export const metadata: Metadata = { title: "Flight Attendant English", robots: { index: false } };

export default async function Page() {
  return <InicioIdioma c={await cursoIdioma("english")} />;
}
