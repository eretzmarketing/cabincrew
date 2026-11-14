import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { CriarCursoForm } from "@/components/AdminCursosForms";

export const metadata: Metadata = { title: "Criar curso" };

export default function NovoCurso() {
  return (
    <>
      <Link href="/admin/cursos" className="text-sm font-semibold text-muted hover:text-navy">← Todos os cursos</Link>
      <Titulo sub="Preencha o básico. Depois você monta os módulos e as aulas (texto, vídeo, áudio, ao vivo, PDF e simulado).">Criar curso</Titulo>
      <Card><CriarCursoForm /></Card>
    </>
  );
}
