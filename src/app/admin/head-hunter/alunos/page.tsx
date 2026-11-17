import { redirect } from "next/navigation";

/** A lista de alunos do Head Hunter virou a aba "Head Hunter" do Acompanhamento (todos os cursos). */
export default async function AlunosHeadHunterPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const p = new URLSearchParams({ curso: "head-hunter" });
  for (const k of ["q", "s", "o", "excluido"]) if (sp[k]) p.set(k, sp[k]!);
  redirect(`/admin/acompanhamento?${p}`);
}
