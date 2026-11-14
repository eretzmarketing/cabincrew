import type { Metadata } from "next";
import { CTX_HEAD_HUNTER, PaginaModulo } from "@/components/CursoPaginas";

export const metadata: Metadata = { title: "Módulo · Head Hunter", robots: { index: false } };

export default async function ModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaginaModulo c={CTX_HEAD_HUNTER} id={id} />;
}
