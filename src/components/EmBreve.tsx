import Image from "next/image";
import { sair } from "@/app/actions";
import AvisoForm from "@/components/AvisoForm";

/** Página única exibida ao público enquanto o site está em manutenção. */
export default function EmBreve({ logado }: { logado: boolean }) {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Celular: foto no topo */}
      <div className="relative h-72 md:hidden">
        <Image src="/img/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[22%_30%]" />
      </div>
      {/* Computador: foto de fundo com degradê */}
      <Image src="/img/hero.jpg" alt="" fill priority sizes="100vw" className="-z-20 hidden object-cover object-left md:block" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(255,255,255,0)_30%,rgba(255,255,255,.9)_52%,rgba(255,255,255,.97)_100%)] md:block"
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-end px-6 py-12 md:py-20">
        <div className="flex max-w-[520px] flex-col gap-6">
          <Image src="/img/logo.png" alt="Cabin Crew — Comunidade Oficial" width={240} height={40} priority className="h-10 w-auto self-start" />
          <span className="self-start rounded-full bg-brand px-3.5 py-2 font-display text-[13px] font-bold tracking-[.08em] text-white uppercase">
            Em breve
          </span>
          <h1 className="font-display text-[36px] leading-[1.1] font-extrabold tracking-[-0.02em] text-navy md:text-[48px]">
            Estamos preparando a sua decolagem.
          </h1>
          <p className="text-lg leading-relaxed text-ink-2">
            A nova Cabin Crew está chegando com o Head Hunter, o preparatório que acompanha você em cada fase da seleção para
            comissário de voo.
          </p>
          <AvisoForm />
          {logado && (
            <form action={sair}>
              <button type="submit" className="min-h-11 cursor-pointer rounded-full border-2 border-line bg-white px-5 text-sm font-semibold text-navy hover:border-navy">
                Sair da conta
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="flex justify-center gap-4 px-6 pb-6 text-sm text-muted md:justify-end">
        <span>© {new Date().getFullYear()} Cabin Crew</span>
        {!logado && <a href="/entrar?equipe&next=/admin" className="text-muted underline-offset-2 hover:underline">Acesso da equipe</a>}
      </footer>
    </main>
  );
}
