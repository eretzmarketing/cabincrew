"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sair } from "@/app/actions";
import { GRUPOS, grupoAtivo, itemAtivo } from "@/components/AdminNav";
import { EVENTO_MENU as EVENTO, abrirMenu } from "@/lib/menu-evento";

export type DadosMenu = {
  logado: boolean; admin: boolean; nome: string; iniciais: string; avatar: string | null;
  forum: boolean; publico: boolean; // publico = site aberto (sem modo manutenção)
  naoLidas?: number;
};


/* ---------- ícones (traço 2px, 24x24) ---------- */
const I = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  jornada: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  simulado: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  cursos: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M7 9.5V15c0 1.5 2.5 3 5 3s5-1.5 5-3V9.5" /></>,
  conta: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  inicio: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  planos: <><path d="M20 12l-8 8-9-9V3h8l9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  painel: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  alunos: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5" /><path d="M16 4.5a3.5 3.5 0 010 7M18 15c2 .7 3 2.4 3.5 5" /></>,
  suporte: <><path d="M4 5h16v11H9l-5 4V5z" /></>,
  vendas: <><path d="M12 3v18M16.5 7.5c0-1.9-2-3-4.5-3s-4.5 1.1-4.5 3 2 2.7 4.5 3.3 4.5 1.4 4.5 3.4-2 3.3-4.5 3.3-4.5-1.2-4.5-3" /></>,
  seta: <path d="M9 6l6 6-6 6" />,
  sino: <><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10.3 20a2 2 0 003.4 0" /></>,
};
function Icone({ d, className = "h-6 w-6" }: { d: React.ReactNode; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{d}</svg>;
}

/* ---------- menu completo (gaveta) ---------- */
export function MenuMobile({ d }: { d: DadosMenu }) {
  const [aberto, setAberto] = useState(false);
  const path = usePathname();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const noAdmin = path.startsWith("/admin");
  const grupoAtual = grupoAtivo(path);
  const [grupoAberto, setGrupoAberto] = useState<string | null>(grupoAtual?.id ?? null);
  const atual = itemAtivo(path);

  useEffect(() => {
    const abrir = () => { setGrupoAberto(grupoAtivo(window.location.pathname)?.id ?? null); setAberto(true); };
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);
  // fecha ao trocar de página
  const [ultimoPath, setUltimoPath] = useState(path);
  if (path !== ultimoPath) { setUltimoPath(path); setAberto(false); }
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    document.addEventListener("keydown", tecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    return () => { document.removeEventListener("keydown", tecla); document.body.style.overflow = antes; };
  }, [aberto]);

  const lk = (href: string, rotulo: string, ic?: React.ReactNode, exato = false) => {
    const ativo = path === href || (!exato && href !== "/" && path.startsWith(href + "/"));
    return (
      <Link key={href} href={href} aria-current={ativo ? "page" : undefined}
        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-[16px] font-semibold ${ativo ? "bg-[#eef1ff] text-navy" : "text-navy hover:bg-soft"}`}>
        {ic && <span className="text-ink-2"><Icone d={ic} className="h-5 w-5" /></span>}{rotulo}
      </Link>
    );
  };
  const titulo = (t: string) => <p className="px-3 pt-5 pb-1 font-display text-[11px] font-bold tracking-[.12em] text-muted uppercase">{t}</p>;

  const blocoAdmin = d.admin && (
    <div>
      {titulo("Administrador")}
      {GRUPOS.map((g) => {
        if (g.itens.length === 1) return lk(g.itens[0].href, g.label, undefined, !!g.itens[0].exato);
        const abertoG = grupoAberto === g.id;
        return (
          <div key={g.id}>
            <button type="button" onClick={() => setGrupoAberto(abertoG ? null : g.id)} aria-expanded={abertoG}
              className={`flex min-h-12 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-[16px] font-semibold text-navy hover:bg-soft ${g === grupoAtual ? "bg-soft" : ""}`}>
              {g.label}
              <Icone d={I.seta} className={`h-4 w-4 text-muted transition-transform ${abertoG ? "rotate-90" : ""}`} />
            </button>
            {abertoG && (
              <ul className="mb-1 ml-4 flex flex-col border-l-2 border-line pl-2">
                {g.itens.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} aria-current={i === atual ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-lg px-3 text-[15px] ${i === atual ? "bg-navy font-semibold text-white" : "text-ink-2 hover:bg-soft hover:text-navy"}`}>{i.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto}
        className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-line text-navy hover:border-navy xl:hidden">
        <Icone d={I.menu} />
      </button>
      {aberto && (
        <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" tabIndex={-1} onClick={() => setAberto(false)} className="absolute inset-0 cursor-default bg-navy/50 backdrop-blur-[2px]" />
          <nav className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              {d.logado ? (
                <Link href="/conta" className="flex min-w-0 items-center gap-3">
                  {d.avatar
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={d.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    : <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-sm font-bold text-white uppercase" aria-hidden="true">{d.iniciais}</span>}
                  <span className="flex min-w-0 flex-col">
                    <strong className="truncate text-[16px] text-navy">{d.nome}</strong>
                    <span className="text-[13px] text-muted">Minha conta</span>
                  </span>
                </Link>
              ) : <span className="font-display text-lg font-extrabold text-navy">Menu</span>}
              <button ref={fecharRef} type="button" onClick={() => setAberto(false)} aria-label="Fechar menu"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-line text-navy">
                <Icone d={I.fechar} className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-8">
              {noAdmin && blocoAdmin}
              {(d.logado || d.publico) && (
                <>
                  {titulo("Estudar")}
                  {d.logado && lk("/head-hunter", "Head Hunter", I.jornada)}
                  {d.logado && lk("/english", "Flight Attendant English", I.cursos)}
                  {d.logado && lk("/spanish", "Flight Attendant Spanish", I.cursos)}
                  {lk("/cursos", "Todos os cursos", I.cursos)}
                  {lk("/simulados-anac", "Simulados ANAC", I.simulado)}
                  {titulo("Comprar")}
                  {lk("/planos", "Planos", I.planos)}
                  {lk("/loja", "Loja de apostilas", I.planos)}
                </>
              )}
              {titulo("Minha conta e ajuda")}
              {d.logado ? (
                <>
                  {lk("/conta", "Minha conta", I.conta, true)}
                  {lk("/conta/notificacoes", d.naoLidas ? `Notificações (${d.naoLidas} nova${d.naoLidas > 1 ? "s" : ""})` : "Notificações", I.sino)}
                  {lk("/conta/pedidos", "Meus pedidos", I.planos)}
                  {lk("/conta/suporte", "Suporte", I.suporte)}
                </>
              ) : (
                <>
                  {lk("/entrar?modo=entrar", "Entrar", I.conta)}
                  {d.publico && lk("/entrar?modo=cadastro", "Criar conta grátis", I.conta)}
                </>
              )}
              {lk("/ajuda", "Central de ajuda", I.suporte)}
              {d.forum && lk("/forum", "Fórum de Seleções", I.suporte)}
              {!noAdmin && blocoAdmin}
              {d.logado && (
                <form action={sair} className="mt-4 border-t border-line pt-4">
                  <button type="submit" className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border-2 border-line font-semibold text-navy hover:border-navy">Sair da conta</button>
                </form>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

/* ---------- barra fixa no rodapé (só celular) ---------- */
export function BarraInferior({ d }: { d: DadosMenu }) {
  const path = usePathname();
  if (/^\/head-hunter\/simulado\/[^/]+$/.test(path)) return null; // durante a prova não distrai
  if (!d.logado && !d.publico) return null;
  const noAdmin = d.admin && path.startsWith("/admin");
  const itens: { href: string; rotulo: string; ic: React.ReactNode; exato?: boolean }[] = noAdmin
    ? [
        { href: "/admin", rotulo: "Painel", ic: I.painel, exato: true },
        { href: "/admin/usuarios", rotulo: "Alunos", ic: I.alunos },
        { href: "/admin/compras", rotulo: "Vendas", ic: I.vendas },
        { href: "/admin/suporte", rotulo: "Suporte", ic: I.suporte },
      ]
    : d.logado
      ? [
          { href: "/head-hunter", rotulo: "Jornada", ic: I.jornada },
          { href: "/simulados-anac", rotulo: "Simulados", ic: I.simulado },
          { href: "/cursos", rotulo: "Cursos", ic: I.cursos },
          { href: "/conta", rotulo: "Conta", ic: I.conta, exato: true },
        ]
      : [
          { href: "/", rotulo: "Início", ic: I.inicio, exato: true },
          { href: "/simulados-anac", rotulo: "Simulados", ic: I.simulado },
          { href: "/planos", rotulo: "Planos", ic: I.planos },
          { href: "/entrar?modo=entrar", rotulo: "Entrar", ic: I.conta },
        ];
  const ativo = (h: string, exato?: boolean) => { const base = h.split("?")[0]; return exato ? path === base : path === base || path.startsWith(base + "/"); };
  return (
    <nav aria-label="Atalhos" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-[560px] grid-cols-5">
        {itens.map((i) => {
          const at = ativo(i.href, i.exato);
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={at ? "page" : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${at ? "text-brand-strong" : "text-ink-2"}`}>
                <Icone d={i.ic} className="h-6 w-6" />{i.rotulo}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={abrirMenu} className="flex min-h-[60px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-ink-2">
            <Icone d={I.menu} className="h-6 w-6" />Menu
          </button>
        </li>
      </ul>
    </nav>
  );
}
