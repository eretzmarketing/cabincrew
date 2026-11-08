import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Treino } from "@/components/EntrevistaIngles";
import { carregarEntrevista } from "@/lib/entrevista-dados";
import { exigirCrewSelect } from "@/lib/crew-gate";

export const metadata: Metadata = { title: "Simulação de entrevista em inglês · Crew Select", robots: { index: false } };

export default async function TreinoEntrevista({ searchParams }: { searchParams: Promise<{ parte?: string }> }) {
  const { parte: slug } = await searchParams;
  const { supabase, liberado } = await exigirCrewSelect("/crew-select/entrevista-ingles/treino");
  if (!liberado) redirect("/crew-select");
  const { partes: PARTES } = await carregarEntrevista(supabase);
  const parte = slug ? PARTES.find((p) => p.slug === slug) : undefined;
  const partes = parte ? [parte] : PARTES;

  return (
    <main className="bg-soft px-4 py-8 pb-20 md:px-6">
      <div className="mx-auto flex max-w-[820px] flex-col gap-5">
        <Link href={parte ? `/crew-select/entrevista-ingles/${parte.slug}` : "/crew-select/entrevista-ingles"} className="text-sm font-semibold text-muted hover:text-navy">
          ← {parte ? `Parte ${parte.numero}: ${parte.titulo}` : "Entrevista em inglês"}
        </Link>
        <h1 className="font-display text-[30px] font-extrabold">{parte ? `Treino: ${parte.titulo}` : "Simulação de entrevista"}</h1>
        <Treino partes={partes} rotulo={parte ? `parte ${parte.numero}: ${parte.titulo}` : "todas as partes"} />
      </div>
    </main>
  );
}
