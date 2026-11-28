import Image from "next/image";
import Link from "next/link";
import { BarraInferior, MenuMobile, type DadosMenu } from "@/components/MenuMobile";
import { getConfig } from "@/lib/config";
import { avatarUrl, getUser } from "@/lib/supabase/server";

export default async function Header() {
  const [{ supabase, user, profile }, { forum_ativo, manutencao }] = await Promise.all([getUser(), getConfig()]);
  const naoLidas = user
    ? ((await supabase.from("notificacoes").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("lida_em", null)).count ?? 0)
    : 0;
  const link = "text-navy hover:text-brand-strong inline-flex min-h-10 items-center md:min-h-0";
  const dados: DadosMenu = {
    logado: !!user, admin: !!profile?.is_admin, nome: profile?.nome || profile?.apelido || "Minha conta",
    iniciais: profile?.apelido?.slice(0, 2) ?? "CC", avatar: user ? avatarUrl(user.id, profile?.avatar_em) ?? null : null,
    forum: !!forum_ativo, publico: !manutencao, naoLidas,
  };

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:flex-wrap md:py-4">
        <Link href="/" aria-label="Cabin Crew — início" className="flex items-center">
          <Image src="/img/logo.png" alt="Cabin Crew — Comunidade Oficial" width={215} height={36} priority className="h-7 w-auto md:h-9" />
        </Link>

        {(user || !manutencao) && (
          <nav aria-label="Principal" className="hidden flex-wrap items-center gap-x-4 gap-y-0 font-display text-[15px] font-semibold xl:flex">
            {user && <Link href="/head-hunter" className={link}>Head Hunter</Link>}
            {user && <Link href="/english" className={link}>English</Link>}
            {user && <Link href="/spanish" className={link}>Spanish</Link>}
            <Link href="/cursos" className={link}>Cursos</Link>
            <Link href="/simulados-anac" className={link}>Simulados ANAC</Link>
            <Link href="/planos" className={link}>Planos</Link>
            <Link href="/loja" className={link}>Loja</Link>
            {forum_ativo && <Link href="/forum" className={link}>Fórum de Seleções</Link>}
            {profile?.is_admin && <Link href="/admin" className={link}>Admin</Link>}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link href="/conta/notificacoes" aria-label={naoLidas ? `Notificações: ${naoLidas} nova${naoLidas > 1 ? "s" : ""}` : "Notificações"}
              className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-line text-navy hover:border-navy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10.3 20a2 2 0 003.4 0" /></svg>
              {naoLidas > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-strong px-1 text-[11px] font-bold text-white" aria-hidden="true">{naoLidas > 9 ? "9+" : naoLidas}</span>}
            </Link>
          )}
          {user ? (
            <Link
              href="/conta"
              aria-label="Minha conta"
              className="hidden min-h-11 items-center gap-2 rounded-full border-2 border-line px-1.5 text-[15px] font-semibold text-navy hover:border-navy sm:inline-flex sm:px-4"
            >
              {user && avatarUrl(user.id, profile?.avatar_em) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl(user.id, profile?.avatar_em)!} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase text-white" aria-hidden="true">
                  {profile?.apelido?.slice(0, 2) ?? "CC"}
                </span>
              )}
              <span className="hidden 2xl:inline">Minha conta</span>
            </Link>
          ) : manutencao ? null : (
            <>
              <Link href="/entrar?modo=entrar" className="hidden px-2 py-3 text-[15px] font-semibold text-navy hover:text-brand-strong sm:inline">Entrar</Link>
              <Link
                href="/entrar?modo=cadastro"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-strong px-4 font-display text-[14px] font-bold whitespace-nowrap text-white hover:bg-brand-deep sm:px-5 sm:text-[15px]"
              >
                <span className="sm:hidden">Criar conta</span>
                <span className="hidden sm:inline">Criar conta grátis</span>
              </Link>
            </>
          )}
          <MenuMobile d={dados} />
        </div>
        <BarraInferior d={dados} />
      </div>
    </header>
  );
}
