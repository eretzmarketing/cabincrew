import Image from "next/image";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export default async function Header() {
  const [{ user, profile }, { forum_ativo, manutencao }] = await Promise.all([getUser(), getConfig()]);
  const link = "text-navy hover:text-brand-strong";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Cabin Crew — início" className="flex items-center">
          <Image src="/img/logo.png" alt="Cabin Crew — Comunidade Oficial" width={215} height={36} priority className="h-9 w-auto" />
        </Link>

        {(user || !manutencao) && (
          <nav aria-label="Principal" className="order-3 flex w-full flex-wrap items-center gap-x-7 gap-y-2 font-display text-[15px] font-semibold md:order-none md:w-auto">
            {user && <Link href="/head-hunter" className={link}>Head Hunter</Link>}
            {user && <Link href="/english" className={link}>English</Link>}
            {user && <Link href="/spanish" className={link}>Spanish</Link>}
            <Link href="/simulados-anac" className={link}>Simulados ANAC</Link>
            <Link href="/planos" className={link}>Planos</Link>
            {forum_ativo && <Link href="/forum" className={link}>Fórum de Seleções</Link>}
            {profile?.is_admin && <Link href="/admin" className={link}>Administrador</Link>}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/conta"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line px-4 text-[15px] font-semibold text-navy hover:border-navy"
            >
              {user && avatarUrl(user.id, profile?.avatar_em) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl(user.id, profile?.avatar_em)!} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase text-white" aria-hidden="true">
                  {profile?.apelido?.slice(0, 2) ?? "CC"}
                </span>
              )}
              <span className="hidden sm:inline">Minha conta</span>
            </Link>
          ) : manutencao ? null : (
            <>
              <Link href="/entrar?modo=entrar" className="hidden px-2 py-3 text-[15px] font-semibold text-navy hover:text-brand-strong sm:inline">Entrar</Link>
              <Link
                href="/entrar?modo=cadastro"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-strong px-5 font-display text-[15px] font-bold text-white hover:bg-brand-deep"
              >
                <span className="sm:hidden">Criar conta</span>
                <span className="hidden sm:inline">Criar conta grátis</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
