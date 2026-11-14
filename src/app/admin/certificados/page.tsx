import type { Metadata } from "next";
import Link from "next/link";
import { revogarCertificado } from "@/app/certificados-actions";
import { Titulo } from "@/components/admin-ui";
import EditorCertificado from "@/components/EditorCertificado";
import { cargaDoCurso } from "@/lib/carga-curso";
import { CAMPOS_PADRAO, CURSOS_CERT, dataExtenso, type Modelo } from "@/lib/certificados";
import { SITE } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";
import { ehCurso } from "@/lib/cursos";

export const metadata: Metadata = { title: "Certificados" };
export const dynamic = "force-dynamic";

type Cert = { codigo: string; user_id: string | null; curso: string; nome: string; concluido_em: string; nota: number | null; emitido_em: string; emitido_por: string; revogado: boolean };

export default async function CertificadosPage({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const { curso: c = "head-hunter" } = await searchParams;
  const curso = ehCurso(c) ? c : "head-hunter";
  const { supabase } = await getUser();
  const [{ data: mod, error }, { data: certs }] = await Promise.all([
    supabase.from("certificado_modelos").select("*").eq("curso", curso).maybeSingle(),
    supabase.from("certificados").select("*").order("emitido_em", { ascending: false }).limit(300),
  ]);
  const modelo: Modelo = (mod as Modelo | null) ?? { curso, imagem: null, largura: 3508, altura: 2480, campos: CAMPOS_PADRAO, ativo: true };
  const lista = (certs ?? []) as Cert[];
  const cargaAuto = await cargaDoCurso(supabase, curso);

  return (
    <>
      <Titulo sub="Um modelo para cada curso: envie a imagem de fundo e arraste os textos. O aluno emite o certificado quando conclui o curso, e qualquer pessoa pode conferir pelo código.">Certificados</Titulo>
      {error ? <p className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0049_certificados.sql</strong> no Supabase para ativar esta página.</p> : (
        <>
          <nav aria-label="Curso" className="flex gap-1 self-start rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_var(--color-line)]">
            {Object.entries(CURSOS_CERT).map(([k, r]) => (
              <Link key={k} href={`/admin/certificados?curso=${k}`} aria-current={curso === k ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-5 font-semibold ${curso === k ? "bg-navy text-white" : "text-navy"}`}>{r}</Link>
            ))}
          </nav>
          <EditorCertificado key={curso} inicial={modelo} site={SITE} cargaAuto={cargaAuto} />

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-extrabold">Certificados emitidos</h2>
            {!lista.length ? <p className="text-ink-2">Nenhum certificado emitido ainda.</p> : (
              <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full min-w-[760px] text-left text-[14px]">
                  <thead className="border-b border-line text-[13px] text-muted"><tr><th className="p-3 font-semibold">Aluno</th><th className="p-3 font-semibold">Curso</th><th className="p-3 font-semibold">Concluído em</th><th className="p-3 font-semibold">Nota</th><th className="p-3 font-semibold">Código</th><th className="p-3" /></tr></thead>
                  <tbody>
                    {lista.map((x) => (
                      <tr key={x.codigo} className={`border-b border-[#eceef3] last:border-0 ${x.revogado ? "opacity-50" : ""}`}>
                        <td className="p-3 font-semibold">{x.user_id ? <Link href={`/admin/usuarios/${x.user_id}`} className="text-navy underline-offset-4 hover:underline">{x.nome}</Link> : x.nome}{x.emitido_por === "admin" && <span className="ml-2 text-[12px] font-normal text-muted">(emitido por você)</span>}</td>
                        <td className="p-3">{CURSOS_CERT[x.curso]}</td>
                        <td className="p-3 whitespace-nowrap">{dataExtenso(x.concluido_em)}</td>
                        <td className="p-3">{x.nota ?? "—"}</td>
                        <td className="p-3"><Link href={`/certificado/${x.codigo}`} target="_blank" className="font-mono font-semibold text-navy underline underline-offset-4">{x.codigo}</Link>{x.revogado && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-deep">REVOGADO</span>}</td>
                        <td className="p-3 text-right">
                          <form action={revogarCertificado}><input type="hidden" name="codigo" value={x.codigo} /><input type="hidden" name="revogar" value={x.revogado ? "0" : "1"} />
                            <button className="min-h-10 cursor-pointer text-[13px] font-semibold text-brand-deep underline underline-offset-4">{x.revogado ? "Restaurar" : "Revogar"}</button></form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
