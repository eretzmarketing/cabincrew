import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirAula } from "@/app/crew-actions";
import { restaurarIdioma } from "@/app/cursos-actions";
import { Card, Titulo, btnSecundario } from "@/components/admin-ui";
import { AulaForm } from "@/components/admin-forms";
import { AulaIdiomaForm } from "@/components/AdminCursosForms";
import type { Aula, Modulo } from "@/lib/crew";
import { cursoIdioma } from "@/lib/cursos-dados";
import { ehProdutoIdioma } from "@/lib/idioma-conteudo";
import { atividadesParaTexto, expressoesParaTexto, falasParaTexto, quizParaTexto, vocabParaTexto } from "@/lib/idioma-editor";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aula" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

type Props = { params: Promise<{ slug: string; id: string }>; searchParams: Promise<{ modulo?: string; ordem?: string; criada?: string; restaurada?: string; tipo?: string }> };

export default async function AdminAula({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const sp = await searchParams;
  if (slug === "head-hunter") return <AulaHH id={id} sp={sp} />;
  if (ehProdutoIdioma(slug)) return <AulaDeIdioma curso={slug} id={id} sp={sp} />;
  notFound();
}

/* ------------------------------------------------------------------ Head Hunter */

async function AulaHH({ id, sp }: { id: string; sp: Awaited<Props["searchParams"]> }) {
  const nova = id === "nova";
  if (!nova && !UUID.test(id)) notFound();
  const { supabase } = await getUser();
  const [{ data: modulos }, aulaRes, { data: sims }] = await Promise.all([
    supabase.from("modulos").select("*").order("ordem"),
    nova ? Promise.resolve({ data: null }) : supabase.from("aulas").select("*").eq("id", id).maybeSingle(),
    supabase.from("simulados").select("id, titulo").order("titulo"),
  ]);
  const a = aulaRes.data as Aula | null;
  if (!nova && !a) notFound();
  const lista = (modulos ?? []) as Modulo[];
  const moduloId = a?.modulo_id ?? (Number(sp.modulo) || lista[0]?.id);

  return (
    <>
      <Link href={`/admin/cursos/head-hunter${moduloId ? `?editar=${moduloId}#m-${moduloId}` : ""}`} className="text-sm font-semibold text-muted hover:text-navy">← Voltar ao Head Hunter</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo>{nova ? "Nova aula" : a!.titulo}</Titulo>
        {a && <Link href={`/head-hunter/aula/${a.id}`} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>}
      </div>
      {sp.criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Aula criada.</p>}
      <Card>
        <AulaForm a={a ?? undefined} modulos={lista} simulados={sims ?? []} moduloId={moduloId} proximaOrdem={Number(sp.ordem) || 1} tipoInicial={sp.tipo} />
      </Card>
      {a && (
        <details className="rounded-[20px] border border-line bg-white p-6">
          <summary className="cursor-pointer font-semibold text-brand-deep">Excluir aula</summary>
          <form action={excluirAula} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="modulo_id" value={a.modulo_id} />
            <span className="text-[15px] text-ink-2">Isso apaga a aula e o progresso dos alunos nela.</span>
            <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
          </form>
        </details>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ English e Spanish */

async function AulaDeIdioma({ curso, id, sp }: { curso: "english" | "spanish"; id: string; sp: Awaited<Props["searchParams"]> }) {
  const m = /^(\d{1,2})\.(\d{1,2})$/.exec(id);
  if (!m) notFound();
  const c = await cursoIdioma(curso, true);
  const mod = c.modulos.find((x) => x.numero === Number(m[1]));
  const a = mod?.aulas.find((x) => x.numero === Number(m[2]));
  if (!mod || !a) notFound();

  return (
    <>
      <Link href={`/admin/cursos/${curso}?editar=${mod.numero}#m-${mod.numero}`} className="text-sm font-semibold text-muted hover:text-navy">← Voltar a {c.nome}</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={`Módulo ${mod.numero} · ${mod.titulo} · Aula ${a.modulo}.${a.numero}`}>{a.titulo}</Titulo>
        <div className="flex flex-wrap gap-2">
          {!a.oculto && !mod.oculto && <Link href={`${c.base}/${a.modulo}/${a.numero}`} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>}
          {a.editado && (
            <details className="relative">
              <summary className={`${btnSecundario} list-none`}>↩ Restaurar o original</summary>
              <form action={restaurarIdioma} className="absolute right-0 z-20 mt-2 flex w-[300px] flex-col gap-2 rounded-2xl border border-line bg-white p-4 text-[14px] shadow-lg">
                <input type="hidden" name="curso" value={curso} />
                <input type="hidden" name="modulo" value={a.modulo} />
                <input type="hidden" name="aula" value={a.numero} />
                <input type="hidden" name="o" value="texto" />
                <span>Desfazer todas as suas edições desta aula e voltar ao texto original?</span>
                <button className="min-h-10 cursor-pointer rounded-full bg-navy px-4 font-semibold text-white">Sim, restaurar</button>
              </form>
            </details>
          )}
        </div>
      </div>
      {sp.criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Aula criada. Ela começa oculta: preencha o conteúdo, salve e depois clique em “👁 Mostrar” na lista de aulas do curso.</p>}
      {sp.restaurada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Aula restaurada ao texto original.</p>}
      {(a.oculto || mod.oculto) && <p className="rounded-xl bg-[#fff3e0] px-4 py-3 text-[15px] text-[#8a4b00]">Esta aula está oculta: os alunos não veem.</p>}
      <AulaIdiomaForm
        key={`${a.modulo}.${a.numero}-${sp.restaurada ?? ""}`}
        idioma={c.idioma}
        a={{
          curso, modulo: a.modulo, numero: a.numero, titulo: a.titulo, tituloEn: a.tituloEn, objetivo: a.objetivo, foto: a.foto, fotoAlt: a.fotoAlt,
          minutos: a.minutos, intro: a.intro, dica: a.dica ?? "", dialogoTitulo: a.dialogo.titulo, dialogoContexto: a.dialogo.contexto,
          falas: falasParaTexto(a), vocabulario: vocabParaTexto(a), expressoes: expressoesParaTexto(a), quiz: quizParaTexto(a.quiz), atividades: atividadesParaTexto(a),
        }} />
    </>
  );
}
