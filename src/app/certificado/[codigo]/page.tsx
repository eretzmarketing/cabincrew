import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CertificadoArte from "@/components/CertificadoArte";
import { BotoesCertificado } from "@/components/BotoesCertificado";
import { CAMPOS_PADRAO, CURSOS_CERT, NOMES_CURSO_CERT, dataExtenso, type Modelo } from "@/lib/certificados";
import { SITE } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Pub = { codigo: string; curso: string; nome: string; concluido_em: string; nota: number | null; emitido_em: string; revogado: boolean };

async function carregar(codigo: string) {
  if (!/^[A-Za-z0-9]{8}$/.test(codigo)) return null;
  const { supabase } = await getUser();
  const { data } = await supabase.rpc("certificado_publico", { p_codigo: codigo });
  const c = ((data ?? []) as Pub[])[0];
  if (!c) return null;
  const { data: mod } = await supabase.from("certificado_modelos").select("*").eq("curso", c.curso).maybeSingle();
  return { c, modelo: ((mod as Modelo | null) ?? { curso: c.curso, imagem: null, largura: 3508, altura: 2480, campos: CAMPOS_PADRAO }) };
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const r = await carregar((await params).codigo);
  return r ? { title: `Certificado · ${r.c.nome}`, description: `${r.c.nome} concluiu ${CURSOS_CERT[r.c.curso]} na Cabin Crew.`, robots: { index: false } } : { title: "Certificado" };
}

export default async function CertificadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const r = await carregar((await params).codigo);
  if (!r) notFound();
  const { c, modelo } = r;
  const dados = { nome: c.nome, curso: NOMES_CURSO_CERT[c.curso] ?? c.curso, concluido_em: c.concluido_em, nota: c.nota, codigo: c.codigo };
  const d = new Date(c.concluido_em);
  const linkedin = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: "CERTIFICATION_NAME", name: CURSOS_CERT[c.curso], organizationName: "Cabin Crew",
    issueYear: String(d.getFullYear()), issueMonth: String(d.getMonth() + 1), certUrl: `${SITE}/certificado/${c.codigo}`, certId: c.codigo,
  })}`;

  return (
    <main className="bg-soft">
      <style>{`@page { size: A4 landscape; margin: 0 }
        @media print {
          html, body { background: #fff !important; margin: 0 !important }
          body * { visibility: hidden !important }
          .certificado, .certificado * { visibility: visible !important }
          .certificado { position: fixed !important; left: 0; top: 0; width: 297mm !important; height: 210mm !important; aspect-ratio: auto !important }
          .certificado img { object-fit: fill !important }
        }`}</style>
      <div className="area-certificado mx-auto flex max-w-[1100px] flex-col gap-5 px-4 py-8 md:py-12">
        <div className={`nao-imprimir flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 ${c.revogado ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`} role="status">
          <p className="text-[15px]">
            {c.revogado ? <strong>⚠ Este certificado foi revogado e não é mais válido.</strong>
              : <><strong>✓ Certificado válido.</strong> Emitido pela Cabin Crew para <strong>{c.nome}</strong>, que concluiu {CURSOS_CERT[c.curso]} em {dataExtenso(c.concluido_em)}. Código {c.codigo}.</>}
          </p>
        </div>
        {!c.revogado && (
          <>
            <div className="overflow-hidden rounded-lg shadow-[0_20px_50px_-25px_rgba(35,42,61,.6)] print:rounded-none print:shadow-none">
              <CertificadoArte modelo={modelo} dados={dados} site={SITE} />
            </div>
            <BotoesCertificado link={`${SITE}/certificado/${c.codigo}`} linkedin={linkedin} />
          </>
        )}
      </div>
    </main>
  );
}
