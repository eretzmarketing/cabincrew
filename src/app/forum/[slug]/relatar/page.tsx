import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RelatoForm } from "@/components/forms";
import { Check } from "@/components/icons";
import { mesAno, type Selecao } from "@/lib/forum";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Relatar uma etapa", robots: { index: false } };

export default async function RelatarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fase?: string }>;
}) {
  const { slug } = await params;
  const { fase } = await searchParams;
  const { supabase, user } = await getUser();
  if (!user) redirect(`/entrar?modo=cadastro&next=/forum/${slug}/relatar`);

  const { data } = await supabase.from("selecoes_resumo").select("*").eq("slug", slug).maybeSingle();
  const s = data as Selecao | null;
  if (!s) notFound();
  if (s.status === "encerrada") redirect(`/forum/${slug}`);

  const f = Number(fase);
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-7 px-6 pt-10 pb-20">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-7 rounded-3xl border border-line bg-white p-6 md:p-9">
          <div className="flex flex-col gap-2">
            <Link href={`/forum/${slug}`} className="text-sm font-semibold text-muted hover:text-navy">← {s.companhia} · {s.base} · {mesAno(s.mes_ref)}</Link>
            <h1 className="font-display text-[30px] font-extrabold tracking-[-0.01em] md:text-[32px]">Relatar uma etapa</h1>
            <p className="text-base text-ink-2">Conte como foi para quem vem depois de você. Leva cerca de dois minutos.</p>
          </div>
          <RelatoForm slug={slug} baseSugerida={s.base} faseInicial={f >= 1 && f <= 7 ? f : s.fase_max ?? 1} />
        </div>

        <aside className="flex flex-[1_1_300px] flex-col gap-5">
          <div className="relative h-[260px] overflow-hidden rounded-[20px]">
            <Image src="/img/relato.jpg" alt="Comissária sorrindo com um avião de papel no aeroporto" fill sizes="(min-width: 900px) 360px, 100vw" className="object-cover object-[35%_center]" />
          </div>
          <div className="flex flex-col gap-4 rounded-[20px] bg-navy p-[26px] text-white">
            <strong className="font-display text-[19px]">Por que relatar?</strong>
            <ul className="flex flex-col gap-3 text-[15px] leading-normal text-[#d7dbe6]">
              {[
                "Você ajuda quem está na mesma seleção agora.",
                "Relatos confirmados ganham selo de verificado e pontos para você.",
                "Você pode publicar como anônimo.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5"><Check size={20} color="#ff5c7f" className="shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
