import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NovaSenhaForm } from "@/components/forms";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

export default async function NovaSenhaPage() {
  const { user } = await getUser();
  if (!user) redirect("/entrar?modo=esqueci");
  return (
    <main className="bg-soft px-6 py-16">
      <div className="mx-auto flex max-w-[440px] flex-col gap-6 rounded-[20px] border border-line bg-white p-8">
        <h1 className="font-display text-[28px] font-extrabold">Crie sua nova senha</h1>
        <NovaSenhaForm />
      </div>
    </main>
  );
}
