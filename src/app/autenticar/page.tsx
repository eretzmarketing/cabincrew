import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Autenticar certificado",
  description: "Confira se um certificado da Cabin Crew é autêntico: digite o código impresso no certificado.",
};
export const dynamic = "force-dynamic";

export default async function AutenticarPage({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const bruto = (await searchParams).codigo ?? "";
  const codigo = bruto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let naoEncontrado = false;
  if (bruto) {
    if (codigo.length === 8) {
      const { supabase } = await getUser();
      const { data } = await supabase.rpc("certificado_publico", { p_codigo: codigo });
      if ((data ?? []).length) redirect(`/certificado/${codigo}`);
    }
    naoEncontrado = true;
  }
  return (
    <main className="bg-soft">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-3 px-6 pt-14 pb-24 text-center">
          <span aria-hidden="true" className="text-[44px]">🎓</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Autenticação de certificado</h1>
          <p className="max-w-[560px] text-[17px] text-[#d7dbe6]">Confira se um certificado da Cabin Crew é verdadeiro. Digite o código de 8 caracteres que aparece no certificado.</p>
        </div>
      </section>
      <div className="mx-auto -mt-14 max-w-[560px] px-4 pb-20">
        <form className="flex flex-col gap-3 rounded-[22px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(35,42,61,.6)]" role="search">
          <label htmlFor="codigo" className="text-[15px] font-semibold">Código do certificado</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="codigo" name="codigo" defaultValue={bruto} required autoComplete="off" spellCheck={false} placeholder="EX.: AB12CD34" maxLength={12}
              aria-invalid={naoEncontrado || undefined} aria-describedby={naoEncontrado ? "codigo-erro" : undefined}
              className="min-h-13 flex-1 rounded-xl border border-[#c9cedb] px-4 font-mono text-[20px] tracking-[.2em] uppercase outline-none focus:border-navy" />
            <button className="min-h-13 cursor-pointer rounded-xl bg-brand-strong px-6 font-display text-[16px] font-bold text-white hover:bg-brand-deep">Autenticar</button>
          </div>
          {naoEncontrado && <p id="codigo-erro" role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] text-brand-deep">Nenhum certificado encontrado com o código <strong>{codigo || bruto}</strong>. Confira se digitou certo (letras e números, sem espaços).</p>}
          <p className="text-[13px] text-muted">Empresas e recrutadores podem usar esta página livremente. O resultado mostra a foto, o nome do aluno, o curso, a carga horária e a data de conclusão.</p>
        </form>
      </div>
    </main>
  );
}
