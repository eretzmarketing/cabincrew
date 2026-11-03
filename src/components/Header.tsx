import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";

export default async function Header() {
  const { user, profile } = await getUser();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Cabin Crew — início" className="flex items-center">
          <Image src="/img/logo.png" alt="Cabin Crew — Comunidade Oficial" width={215} height={36} priority className="h-9 w-auto" />
        </Link>
        <nav aria-label="Principal" className="order-3 flex w-full flex-wrap items-center gap-x-7 gap-y-2 font-display text-[15px] font-semibold md:order-none md:w-auto">
          <Link href="/forum" className="text-navy hover:text-brand-strong">Fórum de Seleções</Link>
          <Link href="/#crew-select" className="text-navy hover:text-brand-strong">Crew Select</Link>
          {profile?.is_admin && (
            <Link href="/moderacao" className="text-navy hover:text-brand-strong">Moderação</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/conta"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line px-4 text-[15px] font-semibold text-navy hover:border-navy"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase text-white" aria-hidden="true">
                {profile?.apelido?.slice(0, 2) ?? "CC"}
              </span>
              <span className="hidden sm:inline">Minha conta</span>
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="hidden px-2 py-3 text-[15px] font-semibold text-navy hover:text-brand-strong sm:inline">Entrar</Link>
              <Link
                href="/entrar"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-strong px-5 font-display text-[15px] font-bold text-white hover:bg-brand-deep"
              >
                <span className="sm:hidden">Entrar</span>
                <span className="hidden sm:inline">Criar conta grátis</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
