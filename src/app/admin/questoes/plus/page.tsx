import type { Metadata } from "next";
import Link from "next/link";
import { Card, Chave, Numero, Titulo, btnPrimario, btnSecundario } from "@/components/admin-ui";
import { liberarPlus, removerPlus, salvarPrecoPlus } from "@/app/questoes-admin-actions";
import { getConfig } from "@/lib/config";
import { precoBR } from "@/lib/plus";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questões Plus" };
export const dynamic = "force-dynamic";

type Assinante = { user_id: string; nome: string | null; email: string | null; ate: string | null; origem: string; observacao: string | null; created_at: string; ativo: boolean };
const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const campo = "min-h-11 rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px] outline-none focus:border-navy";

export default async function PlusAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getUser();
  const [cfg, { data: lista, error }, { data: precoCfg }] = await Promise.all([
    getConfig(),
    supabase.rpc("admin_plus_lista"),
    supabase.from("configuracoes").select("valor").eq("chave", "plus_preco").maybeSingle(),
  ]);
  const assinantes = (lista ?? []) as Assinante[];
  const ativos = assinantes.filter((a) => a.ativo);
  const preco = Number(precoCfg?.valor ?? 29.9);

  return (
    <>
      <Titulo sub="Comentários nas questões (fórum) e Favoritas com simulado exclusivo. Reportar erro é sempre grátis.">Questões Plus</Titulo>
      {sp.ok && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 font-semibold text-[#0f6b3a]">{sp.ok}</p>}
      {sp.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">{sp.erro}</p>}
      {error && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-deep">Rode o SQL 0070_questoes_comunidade.sql no Supabase para usar esta página.</p>}

      <Card className={cfg.plus_cobrar ? "border-2 border-[#e0a100]" : ""}>
        <Chave chave="plus_cobrar" ligado={cfg.plus_cobrar} titulo="Cobrar pelo Questões Plus"
          descricao={cfg.plus_cobrar
            ? "Ligado: só quem está na lista abaixo comenta e favorita. Os demais veem o aviso do Questões Plus com o preço."
            : "Desligado: todo aluno cadastrado comenta e favorita de graça. Ligue quando quiser começar a cobrar."} />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Numero rotulo="Com acesso liberado agora" valor={ativos.length} detalhe={cfg.plus_cobrar ? "liberados à mão ou por compra" : "a cobrança está desligada: todos usam"} />
        <Numero rotulo="Preço mostrado ao aluno" valor={`${precoBR(preco)}/mês`} />
      </div>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Liberar para um aluno</h2>
        <form action={liberarPlus} className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
          <label className="flex flex-col gap-1 text-[14px] font-semibold">E-mail do aluno
            <input name="email" type="email" required placeholder="aluno@email.com" className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-[14px] font-semibold">Por quanto tempo
            <select name="prazo" defaultValue="30" className={campo}>
              <option value="30">1 mês</option>
              <option value="90">3 meses</option>
              <option value="180">6 meses</option>
              <option value="365">1 ano</option>
              <option value="sem">Sem prazo</option>
              <option value="data">Até uma data…</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[14px] font-semibold">Data final (se escolher “até uma data”)
            <input name="ate" type="date" className={campo} />
          </label>
          <button className={btnPrimario}>Liberar</button>
          <label className="flex flex-col gap-1 text-[14px] font-semibold md:col-span-4">Observação interna (opcional)
            <input name="observacao" maxLength={200} placeholder="Ex.: cortesia parceria escola, pagou por Pix" className={campo} />
          </label>
        </form>
        <p className="text-[13px] text-muted">Se o aluno já tem o Plus, o novo prazo é somado ao que falta. Também dá para liberar na ficha do aluno (Usuários).</p>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Alunos com Questões Plus</h2>
        {!assinantes.length ? <p className="text-ink-2">Ninguém liberado ainda.</p> : (
          <ul className="flex flex-col divide-y divide-line">
            {assinantes.map((a) => (
              <li key={a.user_id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col">
                  <Link href={`/admin/usuarios/${a.user_id}`} className="font-semibold text-navy underline">{a.nome ?? "Aluno"}</Link>
                  <span className="text-[14px] text-muted">{a.email}</span>
                  <span className="text-[14px]">
                    {a.ativo ? <strong className="text-[#0f6b3a]">Ativo</strong> : <strong className="text-brand-deep">Vencido</strong>}
                    {" · "}{a.ate ? `até ${data(a.ate)}` : "sem prazo"}{" · "}{a.origem === "compra" ? "compra" : "liberado à mão"} em {data(a.created_at)}
                    {a.observacao ? ` · ${a.observacao}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={liberarPlus}>
                    <input type="hidden" name="user_id" value={a.user_id} /><input type="hidden" name="prazo" value="30" />
                    <button className={btnSecundario}>+1 mês</button>
                  </form>
                  <form action={removerPlus}>
                    <input type="hidden" name="user_id" value={a.user_id} />
                    <button className={`${btnSecundario} text-brand-deep`}>Remover</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Preço</h2>
        <form action={salvarPrecoPlus} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[14px] font-semibold">Preço por mês (R$)
            <input name="preco" inputMode="decimal" defaultValue={preco.toFixed(2).replace(".", ",")} className={`${campo} w-[160px]`} />
          </label>
          <button className={btnSecundario}>Salvar preço</button>
        </form>
        <p className="text-[13px] text-muted">
          Por enquanto o aluno que quiser assinar fala com a equipe (o botão do aviso abre o Suporte) e você libera aqui.
          A cobrança automática mensal pelo Mercado Pago é o próximo passo, quando você decidir começar a vender.
        </p>
      </Card>
    </>
  );
}
