import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CTX_HEAD_HUNTER, PaginaAula } from "@/components/CursoPaginas";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aula · Head Hunter", robots: { index: false } };

export default async function AulaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { id } = await params;
  const { erro } = await searchParams;
  // links antigos (simulados, avisos) de aulas de outros cursos levam ao curso certo
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const { supabase, user } = await getUser();
    if (user) {
      const { data } = await supabase.from("aulas").select("curso").eq("id", id).maybeSingle();
      const curso = (data as { curso?: string } | null)?.curso;
      if (curso && curso !== "head-hunter") redirect(`/curso/${curso}/aula/${id}${erro ? `?erro=${encodeURIComponent(erro)}` : ""}`);
    }
  }
  return <PaginaAula c={CTX_HEAD_HUNTER} id={id} erro={erro} />;
}
