import { NextResponse, type NextRequest } from "next/server";
import { ErroIA, avaliarVideo, configIA, saldoVideoIA, transcrever } from "@/lib/ia-video";
import { anonimo, configMP } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";
import { getConfig } from "@/lib/config";
import { METAS_VIDEO } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

const erro = (msg: string, status = 400) => NextResponse.json({ erro: msg }, { status });
const MAX_VIDEO = 24 * 1024 * 1024; // limite da OpenAI para transcrição: 25 MB

/**
 * O aluno envia a gravação do vídeo de apresentação para o feedback da IA.
 * O vídeo fica só na memória enquanto é analisado: não é gravado no servidor nem no banco.
 */
export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user) return erro("Faça login para usar o feedback da IA.", 401);
  const cfg = configIA();
  if (!cfg || !cfg.ativo) return erro("O feedback da IA ainda não está disponível.", 503);
  const mp = configMP();
  if (!mp?.chave) return erro("O feedback da IA ainda não está disponível.", 503);
  if (!profile?.is_admin) {
    const { data: tem } = await supabase.rpc("tem_acesso", { p_produto: "head-hunter", p_user: user.id });
    const { crew_select_aberto } = await getConfig();
    if (tem !== true && !crew_select_aberto) return erro("O feedback da IA é para alunos do Head Hunter.", 403);
  }

  const servidor = anonimo();
  const saldo = await saldoVideoIA(supabase, user.id, cfg.porAluno);
  if ("erro" in saldo) return erro(saldo.erro, 500);
  if (!profile?.is_admin && saldo.restantes <= 0) {
    return erro(`Você já usou ${saldo.limite === 1 ? "a sua análise" : `as suas ${saldo.limite} análises`} da IA. Continue treinando com a autoavaliação; se precisar de uma nova análise, fale com a gente em Minha conta › Suporte.`, 429);
  }

  let form: FormData;
  try { form = await req.formData(); } catch { return erro("Não foi possível receber o vídeo. Tente de novo."); }
  const video = form.get("video");
  if (!(video instanceof Blob) || !video.size) return erro("Vídeo não recebido.");
  if (video.size > MAX_VIDEO) return erro("O vídeo ficou grande demais para a análise (máximo 24 MB). Grave de novo dentro do tempo pedido.", 413);
  const duracao = Math.min(600, Math.max(1, Math.round(Number(form.get("duracao")) || 0)));
  const meta = METAS_VIDEO.some((m) => m.seg === Number(form.get("meta"))) ? Number(form.get("meta")) : 90;
  let roteiro: Record<string, string> = {};
  try { roteiro = JSON.parse(String(form.get("roteiro") ?? "{}")) as Record<string, string>; } catch { /* sem roteiro */ }
  roteiro = Object.fromEntries(Object.entries(roteiro).slice(0, 10).map(([k, v]) => [k.slice(0, 20), String(v).slice(0, 400)]));
  const companhia = String(form.get("companhia") ?? "").slice(0, 40) || undefined;
  const fotos = form.getAll("foto").map(String).filter((f) => /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(f) && f.length < 600_000).slice(0, 6);

  try {
    const ext = (video.type || "").includes("mp4") ? "mp4" : "webm";
    const transcricao = await transcrever(cfg, video, `video.${ext}`);
    const feedback = await avaliarVideo(cfg, { transcricao, duracao, meta, roteiro, companhia, fotos });
    const { data: id, error } = await servidor.rpc("video_ia_registrar", {
      p_chave: mp.chave, p_user: user.id, p_duracao: duracao, p_meta: meta, p_nota: feedback.nota, p_ia: feedback, p_transcricao: transcricao,
    });
    if (error) return erro("A análise ficou pronta, mas não foi possível salvar. Tente de novo.", 500);
    return NextResponse.json({ id, feedback, transcricao, restantes: profile?.is_admin ? null : Math.max(0, saldo.restantes - 1) });
  } catch (e) {
    return erro(e instanceof ErroIA ? e.message : "Não foi possível analisar o vídeo agora. Tente de novo em instantes.", 502);
  }
}
