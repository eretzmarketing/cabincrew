import type { CursoIdioma } from "@/lib/cursos-idioma";
import { getUser } from "@/lib/supabase/server";

/** Roteiro completo de um curso de idioma em .txt (vozes do elenco e diálogos de todas as aulas). */
export async function roteiroCompleto(c: CursoIdioma, arquivo: string) {
  const { user, profile } = await getUser();
  if (!user || !profile?.is_admin) return new Response("Acesso restrito", { status: 403 });
  const elenco = Object.entries(c.elenco).map(([k, p]) => `- ${k} (${p.nome}): ${p.vozSugerida}`).join("\n");
  const corpo = [
    `${c.nome.toUpperCase()} · ROTEIRO DOS ÁUDIOS`,
    "Um MP3 por aula, com o nome indicado (ex.: 1.1.mp3). Use sempre a mesma voz para cada personagem.",
    "",
    "ELENCO",
    elenco,
    "",
    ...c.modulos.filter((m) => m.aulas.length).flatMap((m) => [
      "=".repeat(60),
      `MÓDULO ${m.numero} · ${m.tituloEn.toUpperCase()}`,
      "=".repeat(60),
      "",
      ...m.aulas.flatMap((a) => [c.roteiro(a), "", "-".repeat(40), ""]),
    ]),
  ].join("\n");
  return new Response(corpo, {
    headers: { "content-type": "text/plain; charset=utf-8", "content-disposition": `attachment; filename="${arquivo}"` },
  });
}
