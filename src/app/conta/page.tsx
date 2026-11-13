import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sair } from "@/app/actions";
import ExcluirContaForm from "@/components/ExcluirContaForm";
import { NovaSenhaForm, PerfilForm } from "@/components/forms";
import Link from "next/link";
import AvatarForm from "@/components/AvatarForm";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

export default async function ContaPage({ searchParams }: { searchParams: Promise<{ foto?: string; next?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getUser();
  if (!user || !profile) redirect("/entrar?modo=entrar&next=/conta");

  const voltar = sp.next?.startsWith("/head-hunter") ? sp.next : sp.foto ? "/head-hunter" : null;
  const { count } = await supabase.from("relatos").select("id", { count: "exact", head: true }).eq("autor_id", user.id);

  return (
    <main className="bg-soft px-6 py-12">
      <div className="mx-auto flex max-w-[640px] flex-col gap-6">
        <h1 className="font-display text-[32px] font-extrabold">Minha conta</h1>
        <section id="foto" className="flex scroll-mt-6 flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold">Foto de perfil</h2>
            <p className="text-[15px] text-ink-2">Obrigatória para usar o Head Hunter e os simulados.</p>
          </div>
          <AvatarForm
            atual={avatarUrl(user.id, profile.avatar_em)}
            iniciais={(profile.nome ?? profile.apelido).split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("")}
            obrigatoria={!!sp.foto && !profile.avatar_em}
          />
          {profile.avatar_em && voltar && (
            <Link href={voltar} className="inline-flex min-h-12 items-center self-start rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep">
              Continuar para o Head Hunter →
            </Link>
          )}
        </section>
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
        {!profile.is_admin && (
          <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6">
            <h2 className="font-display text-xl font-bold">Excluir conta</h2>
            <p className="text-[15px] text-ink-2">Apaga sua conta e todos os seus dados da Cabin Crew.</p>
            <ExcluirContaForm />
          </section>
        )}
        <form action={sair}>
          <button type="submit" className="min-h-11 cursor-pointer rounded-full border-2 border-line bg-white px-5 font-semibold text-navy hover:border-navy">Sair</button>
        </form>
      </div>
    </main>
  );
}
