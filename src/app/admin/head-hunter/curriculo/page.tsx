import type { Metadata } from "next";
import Link from "next/link";
import { acaoRequisito } from "@/app/cv-actions";
import { Card, Titulo } from "@/components/admin-ui";
import { RequisitoForm } from "@/components/RequisitosCVForm";
import { TIPOS_REQUISITO, type RequisitoCV, type TipoRequisito } from "@/lib/ia-curriculo-tipos";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Currículo: requisitos e palavras-chave" };
export const dynamic = "force-dynamic";

export default async function RequisitosCV() {
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("cv_requisitos").select("*").order("ordem").order("nome");
  const lista = (data ?? []) as RequisitoCV[];
  const botao = "min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-semibold";

  return (
    <>
      <Titulo sub={<>O que a <Link href="/head-hunter/curriculo" className="underline">análise de currículo</Link> procura no arquivo do aluno. A busca é automática e a IA usa esta lista como referência para dar a nota e as dicas. Mudou um critério das companhias? É só editar aqui: vale na hora para as próximas análises.</>}>
        Currículo: requisitos e palavras-chave
      </Titulo>
      {error && <p className="rounded-2xl bg-[#fff8e6] px-5 py-4 text-[#7a5a00]">Falta rodar o SQL <strong>0065_curriculo_requisitos.sql</strong> no Supabase.</p>}

      <Card>
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg font-extrabold">＋ Adicionar requisito ou palavra-chave</summary>
          <div className="pt-4"><RequisitoForm /></div>
        </details>
      </Card>

      {(Object.keys(TIPOS_REQUISITO) as TipoRequisito[]).map((tipo) => {
        const itens = lista.filter((r) => r.tipo === tipo);
        return (
          <section key={tipo} className="flex flex-col gap-3">
            <div className="flex flex-col">
              <h2 className="font-display text-xl font-extrabold">{TIPOS_REQUISITO[tipo].plural} <span className="text-base font-semibold text-muted">({itens.length})</span></h2>
              <p className="text-[14px] text-muted">{TIPOS_REQUISITO[tipo].desc}</p>
            </div>
            {!itens.length && <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-[15px] text-muted">Nenhum item.</p>}
            {itens.map((r) => (
              <details key={r.id} className={`rounded-2xl border bg-white px-5 ${r.ativo ? "border-line" : "border-dashed border-line opacity-70"}`}>
                <summary className="flex min-h-16 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <strong className="font-display text-[17px]">{r.nome}</strong>
                  {!r.ativo && <span className="rounded-full bg-[#eceef3] px-2.5 py-0.5 text-[12px] font-semibold text-ink-2">Pausado</span>}
                  {r.validade_meses && <span className="rounded-full bg-[#fff6dd] px-2.5 py-0.5 text-[12px] font-semibold text-[#7a5a00]">validade mín. {r.validade_meses} meses</span>}
                  <span className="min-w-0 flex-1 truncate text-[14px] text-muted">{r.termos.join(", ")}</span>
                  <form action={acaoRequisito} className="flex gap-1">
                    <input type="hidden" name="id" value={r.id} />
                    <button name="acao" value={r.ativo ? "pausar" : "ativar"} className={`${botao} border-2 border-line text-navy hover:border-navy`}>{r.ativo ? "Pausar" : "Ativar"}</button>
                    <button name="acao" value="excluir" className={`${botao} text-muted hover:bg-soft hover:text-brand-deep`}>Excluir</button>
                  </form>
                </summary>
                <div className="border-t border-line py-4"><RequisitoForm r={r} /></div>
              </details>
            ))}
          </section>
        );
      })}
    </>
  );
}
