import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CURSOS_CERT } from "@/lib/certificados";
import { exigirLogin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** O aluno pede o certificado: emite (ou reaproveita o já emitido) e abre a página dele. */
export default async function NovoCertificado({ params }: { params: Promise<{ curso: string }> }) {
  const { curso } = await params;
  if (!CURSOS_CERT[curso]) notFound();
  const { supabase } = await exigirLogin(`/certificado/novo/${curso}`);
  const { data: mod } = await supabase.from("certificado_modelos").select("ativo").eq("curso", curso).maybeSingle();
  const { data, error } = mod?.ativo === false ? { data: null, error: { message: "O certificado deste curso ainda não está disponível." } } : await supabase.rpc("certificado_emitir", { p_curso: curso });
  if (data) redirect(`/certificado/${data}`);
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-6 py-20 text-center">
        <span aria-hidden="true" className="text-[48px]">🎓</span>
        <h1 className="font-display text-[28px] font-extrabold">Certificado de {CURSOS_CERT[curso]}</h1>
        <p className="text-[17px] text-ink-2">{error?.message?.includes("Conclua") ? "O certificado fica disponível quando você conclui o curso. Continue firme: falta pouco! ✈️" : error?.message ?? "Não foi possível emitir agora."}</p>
        <Link href={curso === "english" ? "/english" : "/head-hunter"} className="inline-flex min-h-12 items-center rounded-xl bg-navy px-6 font-semibold text-white">Voltar ao curso</Link>
      </div>
    </main>
  );
}
