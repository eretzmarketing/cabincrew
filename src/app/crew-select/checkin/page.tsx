import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CheckinForm from "@/components/CheckinForm";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { lerCheckin } from "@/lib/jornada-dados";

export const metadata: Metadata = { title: "Check-in · Crew Select", robots: { index: false } };

export default async function CheckinPage() {
  const { supabase, user, liberado } = await exigirCrewSelect("/crew-select/checkin");
  if (!liberado) redirect("/crew-select");
  const c = await lerCheckin(supabase, user.id);

  return (
    <main className="bg-soft pb-20">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-3 px-6 pt-8 pb-10">
          <Link href="/crew-select" className="text-sm font-semibold text-[#d7dbe6] hover:text-white">← Crew Select</Link>
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] uppercase">Check-in</span>
          <h1 className="font-display text-[32px] leading-tight font-extrabold md:text-[42px]">Para onde você vai voar?</h1>
          <p className="max-w-[680px] text-[17px] leading-relaxed text-[#e3e6ee]">
            Cada companhia tem um processo seletivo diferente. Conte qual é o seu objetivo e montamos a ordem certa de estudo para você.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[1000px] px-4 pt-8 md:px-6">
        <CheckinForm atuais={c.companhias} dataMeta={c.dataMeta} />
      </div>
    </main>
  );
}
