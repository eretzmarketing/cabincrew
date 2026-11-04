import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Check } from "@/components/icons";
import { exigirCrewSelect } from "@/lib/crew-gate";
import { numeroModulo, type Modulo } from "@/lib/crew";

export const metadata: Metadata = { title: "Crew Select", robots: { index: false } };

export default async function CrewSelectPage() {
  const { supabase, user, profile, liberado } = await exigirCrewSelect("/crew-select");

  if (!liberado) return <EmBreve nome={profile.nome ?? profile.apelido} />;

  const [{ data: modulos }, { data: aulas }, { data: feitas }] = await Promise.all([
    supabase.from("modulos").select("*").eq("publicado", true).order("ordem"),
    supabase.from("aulas").select("id, modulo_id, ordem, titulo").eq("publicado", true).order("ordem"),
    supabase.from("progresso").select("aula_id").eq("user_id", user.id),
  ]);

  const concluidas = new Set((feitas ?? []).map((f) => f.aula_id));
  const porModulo = new Map<number, { total: number; feitas: number; proxima?: string }>();
  for (const a of aulas ?? []) {
    const m = porModulo.get(a.modulo_id) ?? { total: 0, feitas: 0 };
    m.total += 1;
    if (concluidas.has(a.id)) m.feitas += 1;
    else if (!m.proxima) m.proxima = a.id;
    porModulo.set(a.modulo_id, m);
  }
  const total = aulas?.length ?? 0;
  const feitasTotal = (aulas ?? []).filter((a) => concluidas.has(a.id)).length;
  const pct = total ? Math.round((feitasTotal / total) * 100) : 0;

  const lista = (modulos ?? []) as Modulo[];
  const continuar = lista.find((m) => porModulo.get(m.id)?.proxima);
  const continuarAula = continuar ? porModulo.get(continuar.id)?.proxima : undefined;
  const primeiroNome = (profile.nome ?? profile.apelido).split(" ")[0];

  return (
    <main className="bg-soft">
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-8 px-6 py-12">
          <div className="flex max-w-[640px] flex-col gap-3">
            <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] uppercase">Crew Select</span>
            <h1 className="font-display text-[30px] leading-tight font-extrabold md:text-[38px]">Olá, {primeiroNome}! Seu plano de voo até a aprovação.</h1>
            <p className="text-[17px] leading-relaxed text-[#d7dbe6]">
              Os módulos seguem as fases reais da seleção. Avance no seu ritmo e volte direto para a fase em que você está.
            </p>
          </div>
          <div className="flex w-full max-w-[340px] flex-col gap-3 rounded-[20px] bg-white/10 p-6">
            <div className="flex items-end justify-between">
              <span className="text-sm text-[#d7dbe6]">Seu progresso</span>
              <span className="font-display text-3xl font-extrabold">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20" aria-hidden="true">
              <div className="h-2.5 rounded-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-[#d7dbe6]">{feitasTotal} de {total} {total === 1 ? "aula concluída" : "aulas concluídas"}</span>
            {continuarAula && (
              <Link href={`/crew-select/aula/${continuarAula}`} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-5 font-display font-bold text-white hover:bg-brand-deep">
                {feitasTotal ? "Continuar de onde parei" : "Começar agora"} <Arrow />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 pb-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
          <h2 className="font-display text-2xl font-extrabold">Módulos</h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lista.map((m) => {
              const p = porModulo.get(m.id) ?? { total: 0, feitas: 0 };
              const completo = p.total > 0 && p.feitas === p.total;
              const pm = p.total ? Math.round((p.feitas / p.total) * 100) : 0;
              return (
                <li key={m.id}>
                  <Link
                    href={`/crew-select/modulo/${m.id}`}
                    className="flex h-full flex-col gap-3 rounded-[20px] border border-line bg-white p-6 text-navy transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(49,57,80,.35)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-[28px] leading-none font-extrabold text-brand">{numeroModulo(m.ordem)}</span>
                      {completo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e5f6ec] px-2.5 py-1 text-xs font-semibold text-[#0f6b3a]"><Check size={14} />Concluído</span>
                      ) : p.total === 0 && !m.recurso ? (
                        <span className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-xs font-semibold text-ink-2">Em breve</span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-lg leading-snug font-bold">{m.titulo}</h3>
                      {m.fase && <span className="text-[13px] font-semibold text-[#b0002a]">{m.fase}</span>}
                      {m.descricao && <p className="text-[15px] leading-relaxed text-ink-2">{m.descricao}</p>}
                    </div>
                    {p.total > 0 && (
                      <div className="mt-auto flex flex-col gap-1.5 pt-2">
                        <div className="h-1.5 rounded-full bg-[#eceef3]" aria-hidden="true">
                          <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pm}%` }} />
                        </div>
                        <span className="text-[13px] text-muted">{p.feitas} de {p.total} {p.total === 1 ? "aula" : "aulas"}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </main>
  );
}

function EmBreve({ nome }: { nome: string }) {
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-6 py-16">
        <div className="relative hidden h-[420px] flex-[1_1_320px] overflow-hidden rounded-3xl md:block">
          <Image src="/img/crew-select.jpg" alt="Comissária com mala de bordo no aeroporto" fill sizes="40vw" className="object-cover object-[center_20%]" />
        </div>
        <div className="flex flex-[999_1_420px] flex-col gap-4">
          <span className="self-start rounded-full bg-brand px-3 py-1.5 font-display text-xs font-bold tracking-[.08em] text-white uppercase">Em breve</span>
          <h1 className="font-display text-[34px] leading-tight font-extrabold">{nome.split(" ")[0]}, sua vaga no Crew Select está garantida.</h1>
          <p className="text-[17px] leading-relaxed text-ink-2">
            Estamos preparando os módulos e avisaremos você assim que o acesso for liberado.
          </p>
        </div>
      </div>
    </main>
  );
}
