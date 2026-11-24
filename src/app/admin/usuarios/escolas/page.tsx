import type { Metadata } from "next";
import Link from "next/link";
import { alterarRegraEscola } from "@/app/massa-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { AplicarRegra, EditarRegra, RegraEscolaForm, type Pacote } from "@/components/LiberacaoMassa";
import { infoCursos } from "@/lib/cursos-dados";
import { ESCOLAS } from "@/lib/escolas";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Regras por escola" };
export const dynamic = "force-dynamic";

type Regra = Pacote & { escola: string; ativa: boolean; atualizado_em: string };
const prazo = (d: number | null) => (d == null ? "sem prazo" : d % 365 === 0 ? `${d / 365} ${d === 365 ? "ano" : "anos"}` : d % 30 === 0 ? `${d / 30} ${d === 30 ? "mês" : "meses"}` : `${d} dias`);

export default async function RegrasEscolaPage() {
  const { supabase } = await getUser();
  const [{ data: regras, error }, { data: pessoas }, cursos] = await Promise.all([
    supabase.from("escola_regras").select("*").order("escola"),
    supabase.rpc("admin_publico_campanha"),
    infoCursos(),
  ]);
  const nomes = Object.fromEntries(cursos.map((c) => [c.slug, c.titulo]));
  const lista = cursos.map((c) => ({ slug: c.slug, nome: c.titulo }));
  const porEscola = new Map<string, number>();
  for (const p of (pessoas ?? []) as { escola: string | null }[]) {
    const k = (p.escola ?? "").trim().toLowerCase();
    if (k) porEscola.set(k, (porEscola.get(k) ?? 0) + 1);
  }
  const usadas = ((pessoas ?? []) as { escola: string | null }[]).map((p) => (p.escola ?? "").trim()).filter(Boolean);
  const escolas = [...new Set([...ESCOLAS, ...usadas])].sort((a, b) => a.localeCompare(b));
  const rs = (regras ?? []) as Regra[];

  return (
    <>
      <Titulo sub="Quando o aluno se cadastra informando uma destas escolas, ele recebe o pacote na hora, além do simulado da ANAC.">Regras por escola</Titulo>
      <p className="text-[14px] text-ink-2">Para liberar algo para vários alunos que <strong>já estão cadastrados</strong>, use também o botão <Link href="/admin/usuarios" className="font-semibold underline underline-offset-4">🎁 Liberar em massa</Link> na lista de Usuários.</p>

      {error && <p role="alert" className="rounded-2xl bg-brand-soft px-5 py-4 font-semibold text-brand-deep">Falta rodar o SQL 0075_liberacoes_em_massa.sql no Supabase.</p>}

      <section aria-labelledby="regras" className="flex flex-col gap-3">
        <h2 id="regras" className="font-display text-xl font-bold">Regras ativas</h2>
        {!rs.length && <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">Nenhuma regra ainda. Crie a primeira abaixo.</p>}
        {rs.map((r) => {
          const itens = [
            ...r.cursos.map((c) => `${nomes[c] ?? c} (${prazo(r.curso_dias)})`),
            ...(r.plus ? [`Questões Plus (${prazo(r.plus_dias)})`] : []),
            ...(r.ia_video ? [`+${r.ia_video} análise(s) de vídeo`] : []),
            ...(r.ia_curriculo ? [`+${r.ia_curriculo} análise(s) de currículo`] : []),
          ];
          return (
            <Card key={r.escola} className={`!flex-row flex-wrap items-start gap-x-4 gap-y-3 ${r.ativa ? "" : "opacity-70"}`}>
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="font-display text-[18px]">🏫 {r.escola}</strong>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${r.ativa ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-soft text-muted"}`}>{r.ativa ? "Ligada" : "Desligada"}</span>
                </span>
                <span className="flex flex-wrap gap-1.5">{itens.map((i) => <span key={i} className="rounded-md bg-[#eef1ff] px-2 py-0.5 text-[13px] font-semibold text-navy">{i}</span>)}</span>
                <span className="text-[13px] text-muted">{porEscola.get(r.escola.trim().toLowerCase()) ?? 0} cadastrado(s) nessa escola</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={alterarRegraEscola}>
                  <input type="hidden" name="escola" value={r.escola} />
                  <button name="acao" value={r.ativa ? "desligar" : "ligar"} className="inline-flex min-h-10 cursor-pointer items-center rounded-full border-2 border-line bg-white px-4 text-[14px] font-semibold text-navy hover:border-navy">{r.ativa ? "Desligar" : "Ligar"}</button>
                </form>
                <EditarRegra cursos={lista} escolas={escolas} regra={r} />
                <form action={alterarRegraEscola}>
                  <input type="hidden" name="escola" value={r.escola} />
                  <button name="acao" value="excluir" className="inline-flex min-h-10 cursor-pointer items-center px-2 text-[14px] font-semibold text-brand-deep underline underline-offset-4">Excluir</button>
                </form>
              </div>
              <div className="w-full"><AplicarRegra escola={r.escola} cadastrados={porEscola.get(r.escola.trim().toLowerCase()) ?? 0} /></div>
            </Card>
          );
        })}
      </section>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold">Nova regra</h2>
        <RegraEscolaForm cursos={lista} escolas={escolas} />
      </Card>

      <p className="rounded-2xl bg-[#fff6e0] px-5 py-4 text-[14px] text-[#6b4e00]">
        <strong>Atenção:</strong> a escola é informada pelo próprio aluno no cadastro, sem comprovação. A regra vale só no cadastro (ou quando a escola é preenchida pela primeira vez): trocar de escola depois não libera nada.
        Para parcerias com pacotes de valor alto, prefira a liberação em massa com a lista de alunos que a escola enviar.
      </p>
    </>
  );
}
