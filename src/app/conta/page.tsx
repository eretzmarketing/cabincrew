import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/app/actions";
import { NovaSenhaForm, PerfilForm } from "@/components/forms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default async function ContaPage() {
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) redirect("/entrar?modo=entrar&next=/conta");

  const { count } = await supabase.from("relatos").select("id", { count: "exact", head: true }).eq("autor_id", user.id);

  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6">
        <h1 className="font-display text-[32px] font-extrabold">Minha conta</h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-[1_1_180px] flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4">
            <span className="text-[13px] text-muted">Pontos</span>
            <span className="font-display text-[28px] font-extrabold">{profile.pontos}</span>
          </div>
          <div className="flex flex-[1_1_180px] flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4">
            <span className="text-[13px] text-muted">Relatos publicados</span>
            <span className="font-display text-[28px] font-extrabold">{count ?? 0}</span>
          </div>
        </div>
        <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold">Meus dados</h2>
            <p className="text-[15px] text-ink-2">E-mail: <strong className="text-navy">{user.email}</strong></p>
          </div>
          <PerfilForm p={profile} />
        </section>
        <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
          <h2 className="font-display text-xl font-bold">Trocar senha</h2>
          <NovaSenhaForm />
        </section>
        <form action={sair}>
          <button type="submit" className="min-h-11 cursor-pointer rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">Sair</button>
        </form>
      </div>
    </main>
  );
}
