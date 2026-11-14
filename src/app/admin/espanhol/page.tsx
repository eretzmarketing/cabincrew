import type { Metadata } from "next";
import AdminCursoIdioma from "@/components/AdminCursoIdioma";
import { ESPANHOL } from "@/lib/cursos-idioma";

export const metadata: Metadata = { title: "Flight Attendant Spanish" };

export default function Page() {
  return <AdminCursoIdioma c={ESPANHOL} adminBase="/admin/espanhol" />;
}
