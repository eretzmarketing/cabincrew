import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { alternarAulaConcluida } from "@/app/crew-actions";
import { Arrow, Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { TIPO_AULA, duracao, numeroModulo, videoEmbed, type Aula, type Modulo } from "@/lib/crew";

export const metadata: Metadata = { title: "Aula · Crew Select", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile, liberado } = await exigirCrewSelect(`/crew-select/aula/${id}`);
  if (!liberado) redirect("/crew-select");
  if (!UUID.test(id)) notFound();

  const { data } = await supabase.from("aulas").select("*").eq("id", id).maybeSingle();
  const aula = data as Aula | null;
  if (!aula || (!aula.publicado && !profile.is_admin)) notFound();

  const [{ data: modulo }, { data: irmas }, { data: feita }] = await Promise.all([
    supabase.from("modulos").select("*").eq("id", aula.modulo_id).single(),
    supabase.from("aulas").select("id, ordem, titulo").eq("modulo_id", aula.modulo_id).eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id).eq("aula_id", aula.id).maybeSingle(),
  ]);
  const m = modulo as Modulo;
  const lista = irmas ?? [];
  const pos = lista.findIndex((a) => a.id === aula.id);
  const anterior = pos > 0 ? lista[pos - 1] : null;
  const proxima = pos >= 0 && pos < lista.length - 1 ? lista[pos + 1] : null;
  const concluida = !!feita;
  const embed = videoEmbed(aula.video_url);

  return (
    <main className="bg-soft px-6 py-10 pb-20">
      <article className="mx-auto flex max-w-[860px] flex-col gap-6">
        <Link href={`/crew-select/modulo/${m.id}`} className="text-sm font-semibold text-muted hover:text-navy">
          ← Módulo {numeroModulo(m.ordem)} · {m.titulo}
        </Link>

        {!aula.publicado && (
          <p className="rounded-xl border border-[#ffe0b2] bg-[#fff3e0] px-4 py-3 text-sm text-[#8a4b00]">Rascunho: só administradores veem esta aula.</p>
        )}

        <header className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#b0002a]">
            {TIPO_AULA[aula.tipo]}{aula.duracao_min ? ` · ${duracao(aula.duracao_min)}` : ""}
          </span>
          <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[36px]">{aula.titulo}</h1>
          {aula.resumo && <p className="text-[17px] leading-relaxed text-ink-2">{aula.resumo}</p>}
        </header>

        {embed ? (
          <div className="relative aspect-video overflow-hidden rounded-[20px] bg-navy">
            <iframe
              src={embed}
              title={aula.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : aula.video_url ? (
          <a href={aula.video_url} target="_blank" rel="noreferrer" className="rounded-2xl border border-line bg-white p-5 font-semibold">Assistir ao vídeo da aula ↗</a>
        ) : null}

        {aula.conteudo && (
          <div className="aula-conteudo rounded-[20px] border border-line bg-white p-6 md:p-9">
            <ReactMarkdown>{aula.conteudo}</ReactMarkdown>
          </div>
        )}

        {aula.arquivo_url && (
          <a href={aula.arquivo_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 font-semibold text-navy hover:border-navy">
            Baixar material de apoio <span aria-hidden="true">↓</span>
          </a>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <form action={alternarAulaConcluida}>
            <input type="hidden" name="aula_id" value={aula.id} />
            <input type="hidden" name="concluida" value={String(concluida)} />
            <input type="hidden" name="proxima" value={proxima?.id ?? ""} />
            <button
              type="submit"
              aria-pressed={concluida}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-6 font-display font-bold ${
                concluida ? "border-2 border-[#0f6b3a] bg-[#e5f6ec] text-[#0f6b3a]" : "bg-brand-strong text-white hover:bg-brand-deep"
              }`}
            >
              <Check size={18} /> {concluida ? "Aula concluída" : proxima ? "Concluir e ir para a próxima" : "Marcar como concluída"}
            </button>
          </form>
          <nav aria-label="Navegação entre aulas" className="flex gap-2">
            {anterior && (
              <Link href={`/crew-select/aula/${anterior.id}`} className="inline-flex min-h-12 items-center rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">← Anterior</Link>
            )}
            {proxima && (
              <Link href={`/crew-select/aula/${proxima.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">Próxima <Arrow size={16} /></Link>
            )}
          </nav>
        </div>
      </article>
    </main>
  );
}
