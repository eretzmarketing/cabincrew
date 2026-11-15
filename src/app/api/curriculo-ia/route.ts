import { NextResponse, type NextRequest } from "next/server";
import { ErroIA, configIA, saldoVideoIA } from "@/lib/ia-video";
import { MAX_CV, avaliarCurriculo, conferir, lerCurriculo } from "@/lib/ia-curriculo";
import { getConfig } from "@/lib/config";
import { COMPANHIAS } from "@/lib/jornada";
import { lerCheckin } from "@/lib/jornada-dados";
import { anonimo, configMP } from "@/lib/mercadopago";
import { getUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 180;

const erro = (msg: string, status = 400, extra: Record<string, unknown> = {}) => NextResponse.json({ erro: msg, ...extra }, { status });

/**
 * O aluno envia o currículo (PDF ou Word) para a análise da IA.
 * O arquivo fica só na memória enquanto é lido: não é gravado no servidor nem no banco.
 */
export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user) return erro("Faça login para usar a análise de currículo.", 401);
  const cfg = configIA();
  const mp = configMP();
  if (!cfg || !cfg.ativo || !mp?.chave) return erro("A análise de currículo ainda não está disponível.", 503);
  if (!profile?.is_admin) {
    const { data: tem } = await supabase.rpc("tem_acesso", { p_produto: "head-hunter", p_user: user.id });
    const { crew_select_aberto } = await getConfig();
    if (tem !== true && !crew_select_aberto) return erro("A análise de currículo é para alunos do Head Hunter.", 403);
  }
  const saldo = await saldoVideoIA(supabase, user.id, cfg.porAlunoCv, "curriculo");
  if ("erro" in saldo) return erro(saldo.erro, 500);
  if (!profile?.is_admin && saldo.restantes <= 0) {
    return erro(`Você já usou ${saldo.limite === 1 ? "a sua análise" : `as suas ${saldo.limite} análises`} de currículo. Se precisar de uma nova, fale com a gente em Minha conta › Suporte.`, 429);
  }

  let form: FormData;
  try { form = await req.formData(); } catch { return erro("Não foi possível receber o arquivo. Tente de novo."); }
  const arquivo = form.get("curriculo");
  if (!(arquivo instanceof File) || !arquivo.size) return erro("Escolha o arquivo do currículo.");
  if (arquivo.size > MAX_CV) return erro("O arquivo passa de 5 MB. Exporte o PDF sem imagens pesadas e envie de novo.", 413);

  try {
    const leitura = await lerCurriculo(arquivo);
    const conferencias = conferir(leitura);
    // sem texto legível não adianta chamar a IA: o ATS também não leria (e não gasta a análise do aluno)
    if (leitura.texto.split(/\s+/).filter(Boolean).length < 40) {
      return erro("O robô de triagem (ATS) não conseguiu ler o texto do seu currículo: ele parece estar em imagem (foto, print ou PDF escaneado) ou feito todo em caixas de design. Monte o currículo num editor de texto (Word ou Google Docs), exporte em PDF e envie de novo. Esta tentativa não contou como análise.", 422, { ats: false });
    }
    const checkin = await lerCheckin(supabase, user.id);
    const companhia = COMPANHIAS.find((c) => c.slug === checkin.companhias[0])?.nome;
    const feedback = await avaliarCurriculo(cfg, { leitura, conferencias, companhia });
    const { data: id, error } = await anonimo().rpc("curriculo_ia_registrar", {
      p_chave: mp.chave, p_user: user.id, p_nota: feedback.nota, p_ia: feedback, p_arquivo: arquivo.name, p_companhia: companhia ?? null,
    });
    if (error) return erro("A análise ficou pronta, mas não foi possível salvar. Tente de novo.", 500);
    return NextResponse.json({ id, feedback, restantes: profile?.is_admin ? null : Math.max(0, saldo.restantes - 1) });
  } catch (e) {
    if (!(e instanceof ErroIA)) console.error("[curriculo-ia]", e);
    return erro(e instanceof ErroIA ? e.message : "Não foi possível analisar o currículo agora. Tente de novo em instantes.", 502);
  }
}
