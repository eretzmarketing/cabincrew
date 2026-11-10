import type { Metadata } from "next";
import Link from "next/link";
import { Card, Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import CopiarTexto from "@/components/CopiarTexto";
import { ELENCO, MODULOS_INGLES, TODAS_AULAS, chaveAula, chaveDoArquivo, roteiroAula } from "@/lib/ingles-a-bordo";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Inglês a bordo" };

export default async function AdminIngles() {
  const { supabase } = await getUser();
  const [au, pr] = await Promise.all([
    supabase.rpc("audios_ingles"),
    supabase.from("ingles_progresso").select("user_id, aula, nota, concluida").limit(50000),
  ]);
  const semSql = !!au.error || !!pr.error;
  const audios = new Map<string, string>();
  for (const a of (au.data ?? []) as { nome: string }[]) {
    const k = chaveDoArquivo(a.nome);
    if (k && !audios.has(k)) audios.set(k, a.nome);
  }
  const linhas = (pr.data ?? []) as { user_id: string; aula: string; nota: number; concluida: boolean }[];
  const alunos = new Set(linhas.map((l) => l.user_id)).size;
  const porAula = new Map<string, { feitas: number; soma: number; n: number }>();
  for (const l of linhas) {
    const c = porAula.get(l.aula) ?? { feitas: 0, soma: 0, n: 0 };
    c.n += 1; c.soma += l.nota; if (l.concluida) c.feitas += 1;
    porAula.set(l.aula, c);
  }
  const comAudio = TODAS_AULAS.filter((a) => audios.has(chaveAula(a))).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub="Curso de inglês operacional do Crew Select. Veja o andamento dos alunos e gere os áudios das aulas.">Inglês a bordo</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href="/crew-select/ingles-a-bordo" target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
          <a href="/admin/ingles/roteiro" className={btnPrimario}>⬇ Baixar roteiro dos áudios</a>
        </div>
      </div>

      {semSql && (
        <p className="rounded-2xl border border-[#f3c3cf] bg-brand-soft p-5 text-brand-deep">
          Falta rodar o SQL <strong>0022_ingles_a_bordo.sql</strong> no Supabase. Sem ele o curso funciona, mas não guarda as notas, não bloqueia as aulas em sequência e não usa os MP3.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="Aulas prontas" valor={TODAS_AULAS.length} detalhe={`${MODULOS_INGLES.filter((m) => m.aulas.length).length} de ${MODULOS_INGLES.length} módulos`} />
        <Numero rotulo="Aulas com MP3" valor={`${comAudio}/${TODAS_AULAS.length}`} detalhe="as outras usam a voz do navegador" />
        <Numero rotulo="Alunos no curso" valor={alunos} detalhe="fizeram pelo menos um quiz" />
      </div>

      <Card>
        <h2 className="font-display text-xl font-bold">Como colocar os áudios</h2>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[15px] text-ink-2">
          <li>Baixe o roteiro (botão acima) ou copie o diálogo de cada aula aqui embaixo.</li>
          <li>No ElevenLabs, crie uma voz para cada personagem do elenco e use sempre a mesma em todas as aulas.</li>
          <li>Gere o áudio de cada aula e salve com o nome indicado, por exemplo <code className="rounded bg-soft px-1.5">1.1.mp3</code>.</li>
          <li>Arraste todos de uma vez na <Link href="/admin/midia" className="font-semibold text-brand-strong underline">galeria de Mídia</Link>. Cada arquivo entra na aula certa sozinho. Para trocar um áudio, é só subir outro com o mesmo nome.</li>
        </ol>
        <h3 className="pt-2 font-display font-bold">Elenco</h3>
        <ul className="grid gap-2 md:grid-cols-2">
          {Object.entries(ELENCO).map(([k, p]) => (
            <li key={k} className="rounded-xl bg-soft px-4 py-3 text-[14px]">
              <strong className="text-[15px]">{k}</strong> · {p.nome} · {p.papel}
              <span className="block text-muted">Voz: {p.vozSugerida}</span>
            </li>
          ))}
        </ul>
      </Card>

      {MODULOS_INGLES.map((m) => (
        <Card key={m.numero}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">Módulo {m.numero} · {m.titulo}</h2>
            <span className="text-[14px] text-muted">{m.aulas.length ? `${m.aulas.length} aulas` : "Em preparação"}</span>
          </div>
          {m.aulas.length > 0 && (
            <ul className="flex flex-col divide-y divide-line">
              {m.aulas.map((a) => {
                const k = chaveAula(a);
                const st = porAula.get(k);
                return (
                  <li key={k} className="flex flex-col gap-2 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <strong className="min-w-0 flex-1">Aula {k} · {a.titulo} <span className="font-normal text-muted">({a.tituloEn})</span></strong>
                      <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${audios.has(k) ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-ink-2"}`}>
                        {audios.has(k) ? `🎧 ${audios.get(k)}` : `Sem MP3 · subir ${k}.mp3`}
                      </span>
                      <span className="text-[13px] text-muted">{st ? `${st.feitas} ${st.feitas === 1 ? "concluiu" : "concluíram"} · média ${Math.round(st.soma / st.n)}%` : "ninguém fez ainda"}</span>
                      <Link href={`/crew-select/ingles-a-bordo/${m.numero}/${a.numero}`} target="_blank" className="text-[14px] font-semibold text-brand-strong">Abrir ↗</Link>
                    </div>
                    <details className="rounded-xl bg-soft px-4 py-2">
                      <summary className="min-h-9 cursor-pointer py-1.5 text-[14px] font-semibold">Roteiro do áudio ({a.dialogo.falas.length} falas)</summary>
                      <pre className="overflow-x-auto py-2 text-[13px] leading-relaxed whitespace-pre-wrap">{roteiroAula(a)}</pre>
                      <div className="pb-2"><CopiarTexto texto={roteiroAula(a)} /></div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ))}
    </>
  );
}
