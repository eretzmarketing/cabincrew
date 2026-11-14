import type { Metadata } from "next";
import AdminCursoIdioma from "@/components/AdminCursoIdioma";
import { INGLES } from "@/lib/cursos-idioma";

export const metadata: Metadata = { title: "Flight Attendant English" };

export default function Page() {
  return <AdminCursoIdioma c={INGLES} adminBase="/admin/ingles" />;
}
