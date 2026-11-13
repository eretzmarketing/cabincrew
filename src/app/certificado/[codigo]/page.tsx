import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AvatarAluno from "@/components/AvatarAluno";
import CertificadoArte from "@/components/CertificadoArte";
import { BotoesCertificado } from "@/components/BotoesCertificado";
import { CAMPOS_PADRAO, CURSOS_CERT, NOMES_CURSO_CERT, dataExtenso, type Modelo } from "@/lib/certificados";
import { SITE } from "@/lib/mercadopago";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Pub = {
  codigo: string; curso: string; nome: string; concluido_em: string; nota: number | null; emitido_em: string; revogado: boolean;
  user_id?: string | null; avatar_em?: string | null; carga_horaria?: string | null; descricao?: string | null;
};

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

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line py-2.5 first:border-0 sm:flex-row sm:gap-4">
      <dt className="w-[150px] shrink-0 text-[14px] text-muted">{rotulo}</dt>
      <dd className="text-[15px] font-semibold text-navy">{children}</dd>
    </div>
  );
}

export default async function CertificadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const r = await carregar((await params).codigo);
  if (!r) notFound();
  const { c, modelo } = r;
  const carga = c.carga_horaria ?? modelo.carga_horaria ?? null;
  const dados = { nome: c.nome, curso: NOMES_CURSO_CERT[c.curso] ?? c.curso, concluido_em: c.concluido_em, nota: c.nota, codigo: c.codigo, carga };
  const d = new Date(c.concluido_em);
  const linkedin = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: "CERTIFICATION_NAME", name: CURSOS_CERT[c.curso], organizationName: "Cabin Crew",
    issueYear: String(d.getFullYear()), issueMonth: String(d.getMonth() + 1), certUrl: `${SITE}/certificado/${c.codigo}`, certId: c.codigo,
  })}`;
  const foto = c.user_id ? avatarUrl(c.user_id, c.avatar_em) : null;

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
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-8 md:py-12">
        <Link href="/autenticar" className="self-start text-sm font-semibold text-navy">← Autenticar outro certificado</Link>

        {/* autenticação */}
        <section className={`flex flex-col gap-5 rounded-[22px] border-2 bg-white p-5 md:flex-row md:p-7 ${c.revogado ? "border-brand" : "border-[#2fa36b]"}`} aria-label="Autenticação do certificado">
          <div className="flex shrink-0 flex-col items-center gap-3 md:w-[180px]">
            <AvatarAluno src={foto} nome={c.nome} tamanho={140} />
            <span className={`rounded-full px-3 py-1 text-center text-[13px] font-bold ${c.revogado ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`} role="status">
              {c.revogado ? "⚠ Certificado revogado" : "✓ Certificado autêntico"}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold tracking-[.1em] text-muted uppercase">Certificado emitido pela Cabin Crew</span>
              <h1 className="font-display text-[26px] leading-tight font-extrabold md:text-[30px]">{c.nome}</h1>
            </div>
            <dl className="flex flex-col">
              <Linha rotulo="Curso">{NOMES_CURSO_CERT[c.curso] ?? CURSOS_CERT[c.curso]}</Linha>
              {carga && <Linha rotulo="Carga horária">{carga}</Linha>}
              <Linha rotulo="Concluído em">{dataExtenso(c.concluido_em)}</Linha>
              {c.nota != null && <Linha rotulo="Aproveitamento">{Number(c.nota).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</Linha>}
              <Linha rotulo="Código">{c.codigo}</Linha>
            </dl>
            {(c.descricao ?? modelo.descricao) && <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{c.descricao ?? modelo.descricao}</p>}
            {c.revogado && <p className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] text-brand-deep">Este certificado foi cancelado pela Cabin Crew e não tem mais validade.</p>}
          </div>
        </section>

        {!c.revogado && (
          <>
            <div className="overflow-hidden rounded-lg shadow-[0_20px_50px_-25px_rgba(35,42,61,.6)]">
              <CertificadoArte modelo={modelo} dados={dados} site={SITE} />
            </div>
            <BotoesCertificado link={`${SITE}/certificado/${c.codigo}`} linkedin={linkedin} />
          </>
        )}
      </div>
    </main>
  );
}
