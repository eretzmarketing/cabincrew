import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alternarPerguntaEntrevista, excluirParteEntrevista, moverPerguntaEntrevista } from "@/app/crew-actions";
import { Card, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { ParteForm, type ParteEdicao } from "@/components/EntrevistaAdminForms";
import { FOTOS, foto, type NomeFoto } from "@/lib/fotos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Parte da entrevista" };

const BANCO_FOTOS = (Object.keys(FOTOS) as NomeFoto[]).map(foto);

export default async function AdminParteEntrevista({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ criada?: string }> }) {
  const { id } = await params;
  const { criada } = await searchParams;
  const nova = id === "nova";
  if (!nova && !/^\d+$/.test(id)) notFound();
  const { supabase } = await getUser();
  // fotos enviadas na biblioteca de mídia também podem ser usadas
  const { data: midias } = await supabase.from("midias").select("arquivo, descricao, titulo").eq("tipo", "imagem").order("created_at", { ascending: false }).limit(60);
  const fotos = [...(midias ?? []).map((m) => ({ src: `/midia/${m.arquivo}`, alt: m.descricao ?? m.titulo ?? "" })), ...BANCO_FOTOS];

  let p: ParteEdicao;
  let perguntas: { id: string; en: string; pt: string | null; modelo: string | null; ativo: boolean }[] = [];
  if (nova) {
    const { count } = await supabase.from("entrevista_partes").select("id", { count: "exact", head: true });
    p = { numero: (count ?? 0) + 1, titulo: "", titulo_en: null, resumo: null, foto: BANCO_FOTOS[0].src, foto_alt: BANCO_FOTOS[0].alt, publicado: false };
  } else {
    const [pr, qr] = await Promise.all([
      supabase.from("entrevista_partes").select("id, slug, numero, titulo, titulo_en, resumo, foto, foto_alt, publicado").eq("id", Number(id)).maybeSingle(),
      supabase.from("entrevista_perguntas").select("id, en, pt, modelo, ativo").eq("parte_id", Number(id)).order("ordem").order("id"),
    ]);
    if (!pr.data) notFound();
    p = pr.data as ParteEdicao;
    perguntas = qr.data ?? [];
  }

  return (
    <>
      <Link href="/admin/entrevista" className="text-sm font-semibold text-muted hover:text-navy">← Entrevista em inglês</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo>{nova ? "Nova parte" : p.titulo}</Titulo>
        {!nova && p.slug && <Link href={`/head-hunter/entrevista-ingles/${p.slug}`} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>}
      </div>
      {criada && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">Parte criada. Agora adicione as perguntas.</p>}

      <Card><ParteForm p={p} fotos={fotos} /></Card>

      {!nova && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Perguntas ({perguntas.length})</h2>
            <Link href={`/admin/entrevista/pergunta/nova?parte=${p.id}`} className={btnPrimario}>+ Nova pergunta</Link>
          </div>
          <ol className="flex flex-col divide-y divide-[#eceef3] rounded-2xl border border-line bg-white">
            {perguntas.map((q, i) => (
              <li key={q.id} className={`flex items-center gap-2 px-3 py-2.5 ${q.ativo ? "" : "bg-[#fbfbfc]"}`}>
                <span className="flex shrink-0 flex-col">
                  {(["cima", "baixo"] as const).map((dir) => (
                    <form key={dir} action={moverPerguntaEntrevista}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="parte_id" value={p.id} />
                      <input type="hidden" name="dir" value={dir} />
                      <button
                        disabled={dir === "cima" ? i === 0 : i === perguntas.length - 1}
                        aria-label={dir === "cima" ? `Subir a pergunta ${i + 1}` : `Descer a pergunta ${i + 1}`}
                        className="flex h-6 w-8 cursor-pointer items-center justify-center rounded text-muted hover:bg-soft hover:text-navy disabled:cursor-default disabled:opacity-25"
                      >{dir === "cima" ? "▲" : "▼"}</button>
                    </form>
                  ))}
                </span>
                <span className="w-7 shrink-0 text-center font-display text-sm font-bold text-muted">{i + 1}</span>
                <Link href={`/admin/entrevista/pergunta/${q.id}`} className="flex min-w-0 flex-1 flex-col text-navy hover:text-brand-strong">
                  <span lang="en" className={`line-clamp-1 font-semibold ${q.ativo ? "" : "text-muted line-through"}`}>{q.en}</span>
                  <span className="line-clamp-1 text-[13px] text-muted">{q.pt}{!q.modelo && <span className="ml-2 font-semibold text-[#8a4b00]">· sem resposta-modelo</span>}</span>
                </Link>
                <form action={alternarPerguntaEntrevista}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="ativo" value={String(!q.ativo)} />
                  <button className={`min-h-9 cursor-pointer rounded-full px-3 text-xs font-semibold whitespace-nowrap ${q.ativo ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff3e0] text-[#8a4b00]"}`}>
                    {q.ativo ? "Visível" : "Oculta"}
                  </button>
                </form>
              </li>
            ))}
            {!perguntas.length && <li className="p-6 text-center text-ink-2">Nenhuma pergunta nesta parte ainda.</li>}
          </ol>

          <details className="rounded-[20px] border border-line bg-white p-6">
            <summary className="cursor-pointer font-semibold text-brand-deep">Excluir esta parte</summary>
            <form action={excluirParteEntrevista} className="mt-4 flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={p.id} />
              <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="confirmo" required className="h-5 w-5 accent-brand-deep" /> Apagar a parte e as {perguntas.length} perguntas dela</label>
              <button className="min-h-11 cursor-pointer rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir definitivamente</button>
            </form>
            <p className="mt-2 text-[13px] text-muted">Prefere só esconder? Desmarque “Publicada” e salve.</p>
          </details>
        </>
      )}
    </>
  );
}
