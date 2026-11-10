import { ELENCO, MODULOS_INGLES, roteiroAula } from "@/lib/ingles-a-bordo";
import { getUser } from "@/lib/supabase/server";

/** Roteiro completo do curso em .txt, para gerar os áudios no ElevenLabs. */
export async function GET() {
  const { user, profile } = await getUser();
  if (!user || !profile?.is_admin) return new Response("Acesso restrito", { status: 403 });
  const elenco = Object.entries(ELENCO).map(([k, p]) => `- ${k} (${p.nome}): ${p.vozSugerida}`).join("\n");
  const corpo = [
    "INGLÊS A BORDO · ROTEIRO DOS ÁUDIOS",
    "Gere um MP3 por aula com o nome indicado (ex.: 1.1.mp3) e suba todos na galeria de Mídia.",
    "Use sempre a mesma voz para cada personagem em todas as aulas.",
    "",
    "ELENCO",
    elenco,
    "",
    ...MODULOS_INGLES.filter((m) => m.aulas.length).flatMap((m) => [
      "=".repeat(60),
      `MÓDULO ${m.numero} · ${m.tituloEn.toUpperCase()}`,
      "=".repeat(60),
      "",
      ...m.aulas.flatMap((a) => [roteiroAula(a), "", "-".repeat(40), ""]),
    ]),
  ].join("\n");
  return new Response(corpo, {
    headers: { "content-type": "text/plain; charset=utf-8", "content-disposition": 'attachment; filename="ingles-a-bordo-roteiro.txt"' },
  });
}
