import type { Metadata } from "next";
import { InicioIdioma } from "@/components/CursoIdiomaPaginas";
import { INGLES } from "@/lib/cursos-idioma";

export const metadata: Metadata = { title: "Flight Attendant English", robots: { index: false } };

export default function Page() {
  return <InicioIdioma c={INGLES} />;
}
