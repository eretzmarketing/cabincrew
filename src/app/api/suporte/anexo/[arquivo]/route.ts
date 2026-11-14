import { readFile } from "node:fs/promises";
import path from "node:path";
import { PASTA_ANEXOS } from "@/lib/suporte";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", pdf: "application/pdf" };

/** Anexo de chamado: só o dono do chamado e a equipe conseguem abrir (a regra de acesso fica no banco). */
export async function GET(_: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  const m = arquivo.match(/^[0-9a-f-]{36}\.(png|jpg|webp|pdf)$/);
  if (!m) return new Response("Não encontrado", { status: 404 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Faça login", { status: 401 });
  const { data } = await supabase.from("ticket_mensagens").select("id, anexos").contains("anexos", JSON.stringify([{ arquivo }])).limit(1);
  const anexo = (data?.[0]?.anexos as { arquivo: string; nome: string }[] | undefined)?.find((a) => a.arquivo === arquivo);
  if (!anexo) return new Response("Não encontrado", { status: 404 });
  try {
    const buf = await readFile(/*turbopackIgnore: true*/ path.join(PASTA_ANEXOS, arquivo));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[m[1]],
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(anexo.nome)}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        ...(m[1] === "pdf" ? {} : { "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }),
      },
    });
  } catch {
    return new Response("Arquivo não encontrado", { status: 404 });
  }
}
