import type { Metadata } from "next";
import { InicioIdioma } from "@/components/CursoIdiomaPaginas";
import { ESPANHOL } from "@/lib/cursos-idioma";

export const metadata: Metadata = { title: "Flight Attendant Spanish", robots: { index: false } };

export default function Page() {
  return <InicioIdioma c={ESPANHOL} />;
}
