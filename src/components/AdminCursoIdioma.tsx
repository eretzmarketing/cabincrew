import Link from "next/link";
import { Card, Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import CopiarTexto from "@/components/CopiarTexto";
import { chaveAula, chaveDoArquivo } from "@/lib/ingles-a-bordo";
import type { CursoIdioma } from "@/lib/cursos-idioma";
import { audiosGerados } from "@/lib/ingles-audios";
import { getUser } from "@/lib/supabase/server";

/** Admin de um curso de idioma: andamento dos alunos e roteiro dos áudios. */
export default async function AdminCursoIdioma({ c, adminBase }: { c: CursoIdioma; adminBase: string }) {
  const { elenco: ELENCO, modulos: MODULOS_INGLES, todas: TODAS_AULAS, roteiro: roteiroAula } = c;
  const { supabase } = await getUser();
  const [au, pr, gerados] = await Promise.all([
    c.galeria ? supabase.rpc(c.galeria) : Promise.resolve({ data: [], error: null }),
    supabase.from(c.tabela).select("user_id, aula, nota, concluida").limit(50000),
    audiosGerados(c.pastaAudios),
  ]);
  const semSql = !!au.error || !!pr.error;
  const audios = new Map<string, string>(Object.keys(gerados).map((k) => [k, "gerado pelo ElevenLabs"]));
  for (const a of (au.data ?? []) as { nome: string }[]) {
    const k = chaveDoArquivo(a.nome);
    if (k && (!audios.has(k) || audios.get(k) === "gerado pelo ElevenLabs")) audios.set(k, a.nome);
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
        <Titulo sub={`Curso de ${c.idioma} para comissários. Veja o andamento dos alunos e gere os áudios das aulas.`}>{c.nome}</Titulo>
        <div className="flex flex-wrap gap-2">
          <Link href={c.base} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
          <a href={`${adminBase}/roteiro`} className={btnPrimario}>⬇ Baixar roteiro dos áudios</a>
        </div>
      </div>

      {semSql && (
        <p className="rounded-2xl border border-[#f3c3cf] bg-brand-soft p-5 text-brand-deep">
          Falta rodar o SQL <strong>{c.produto === "english" ? "0022_ingles_a_bordo.sql" : "0052_espanhol.sql"}</strong> no Supabase. Sem ele o curso funciona, mas não guarda as notas, não bloqueia as aulas em sequência e não usa os MP3.
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
          <li>No console da Hostinger (como root), rode:
            <code className="mt-1 block overflow-x-auto rounded-lg bg-soft px-3 py-2 text-[13px] whitespace-nowrap">{`su - cabincrew -c "bash ~/htdocs/cabincrew.com.br/deploy/gerar-audios.sh${c.produto === "english" ? "" : " --curso " + c.produto}"`}</code>
          </li>
          <li>Cole a API key do ElevenLabs quando pedir (ela não aparece na tela e não fica salva).</li>
          <li>Na primeira vez, escolha uma voz da sua conta para cada personagem do elenco abaixo. As mesmas vozes valem para todas as aulas.</li>
          <li>Os áudios entram nas aulas sozinhos. Se mudar um diálogo, rode de novo: só o que mudou é gerado outra vez.</li>
          {c.galeria && <li>Também dá para subir um MP3 pronto na <Link href="/admin/midia" className="font-semibold text-brand-strong underline">galeria de Mídia</Link> com o nome da aula (ex.: <code className="rounded bg-soft px-1.5">1.1.mp3</code>).</li>}
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
                      <Link href={`${c.base}/${m.numero}/${a.numero}`} target="_blank" className="text-[14px] font-semibold text-brand-strong">Abrir ↗</Link>
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
