import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContatoForm } from "@/components/SuporteForms";
import { EMPRESA } from "@/lib/legal";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contato", description: "Fale com a equipe da Cabin Crew: dúvidas sobre os cursos, parcerias com escolas e atendimento." };

export default async function ContatoPage() {
  const { user } = await getUser();
  // quem tem conta usa o suporte (chamados), com histórico e aviso no WhatsApp
  if (user) redirect("/conta/suporte");
  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-extrabold">Fale com a gente</h1>
          <p className="text-[17px] text-ink-2">Dúvidas sobre os cursos, parcerias com escolas ou qualquer outro assunto. Respondemos pelo e-mail ou WhatsApp que você informar.</p>
        </div>
        <section className="rounded-[20px] border border-line bg-white p-6 sm:p-8">
          <ContatoForm />
        </section>
        <p className="rounded-2xl border border-line bg-white px-5 py-4 text-[15px] text-ink-2">
          Já é aluno(a)? <Link href="/entrar?modo=entrar&next=/conta/suporte" className="font-semibold text-navy underline">Entre na sua conta</Link> e abra um chamado em <strong>Minha conta › Suporte</strong>: você acompanha a resposta pelo site e recebe o aviso no WhatsApp.
        </p>
        <p className="text-[14px] text-muted">E-mail: <a href={`mailto:${EMPRESA.email}`} className="font-semibold text-navy">{EMPRESA.email}</a></p>
      </div>
    </main>
  );
}
