import type { Metadata } from "next";
import Link from "next/link";
import { Titulo } from "@/components/admin-ui";
import ImportarQuestoes from "@/components/ImportarQuestoes";
import { BANCOS } from "@/lib/crew";

export const metadata: Metadata = { title: "Importar questões" };

export default async function ImportarPage({ searchParams }: { searchParams: Promise<{ banco?: string }> }) {
  const { banco } = await searchParams;
  const inicial = banco && banco in BANCOS ? banco : "anac";
  return (
    <>
      <Link href={`/admin/questoes?banco=${inicial}`} className="text-sm font-semibold text-muted hover:text-navy">← Banco de questões</Link>
      <Titulo sub="Adicione muitas questões de uma vez com uma planilha do Excel. Você confere tudo antes de gravar.">Importar questões</Titulo>
      <ImportarQuestoes bancoInicial={inicial} />
    </>
  );
}
