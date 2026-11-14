"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

type Item = { href: string; label: string; exato?: boolean };
type Grupo = { id: string; label: string; itens: Item[]; secao?: string };

/** Menu do admin em grupos, separados por seção. Cada grupo com mais de uma página ganha abas no topo do conteúdo. */
export const GRUPOS: Grupo[] = [
  { id: "geral", label: "Visão geral", itens: [{ href: "/admin", label: "Visão geral", exato: true }] },

  // ---------- Treinamentos ----------
  {
    id: "head-hunter", label: "Head Hunter", secao: "Treinamentos",
    itens: [
      { href: "/admin/head-hunter/alunos", label: "Alunos" },
      { href: "/admin/head-hunter", label: "Módulos e aulas" },
      { href: "/admin/head-hunter/ranking", label: "Ranking" },
      { href: "/admin/opq", label: "Perfil comportamental" },
      { href: "/admin/entrevista", label: "Entrevista em inglês" },
    ],
  },
  {
    id: "anac", label: "Simulados ANAC",
    itens: [
      { href: "/admin/anac", label: "Simulados" },
      { href: "/admin/questoes", label: "Banco de questões" },
    ],
  },
  { id: "english", label: "Flight Attendant English", itens: [{ href: "/admin/ingles", label: "Flight Attendant English" }] },
  { id: "spanish", label: "Flight Attendant Spanish", itens: [{ href: "/admin/espanhol", label: "Flight Attendant Spanish" }] },
  { id: "certificados", label: "Certificados", itens: [{ href: "/admin/certificados", label: "Certificados" }] },

  // ---------- Alunos e vendas ----------
  {
    id: "pessoas", label: "Usuários", secao: "Alunos e vendas",
    itens: [
      { href: "/admin/usuarios", label: "Usuários" },
      { href: "/admin/interessados", label: "Lista de interesse" },
      { href: "/admin/contas-excluidas", label: "Contas excluídas" },
    ],
  },
  {
    id: "financeiro", label: "Financeiro",
    itens: [{ href: "/admin/compras", label: "Compras" }, { href: "/admin/produtos", label: "Planos e preços" }, { href: "/admin/cupons", label: "Cupons" }],
  },
  {
    id: "loja", label: "Loja",
    itens: [{ href: "/admin/loja", label: "Pedidos" }, { href: "/admin/loja/produtos", label: "Produtos" }],
  },
  { id: "campanhas", label: "Campanhas", itens: [{ href: "/admin/campanhas", label: "Campanhas" }] },

  // ---------- Site ----------
  {
    id: "site", label: "Site e comunidade", secao: "Site",
    itens: [
      { href: "/admin/midia", label: "Mídia" },
      { href: "/admin/forum", label: "Fórum de Seleções" },
    ],
  },
  {
    id: "config", label: "Configurações",
    itens: [
      { href: "/admin/configuracoes", label: "Geral" },
      { href: "/admin/whatsapp", label: "WhatsApp" },
      { href: "/admin/pagamentos", label: "Pagamentos" },
      { href: "/admin/envios", label: "Envios (SuperFrete)" },
    ],
  },
];

const TODOS = GRUPOS.flatMap((g) => g.itens);
const casa = (path: string, x: Item) => (x.exato ? path === x.href : path === x.href || path.startsWith(x.href + "/"));

/** O item mais específico que corresponde ao endereço (ex.: "Alunos" e não "Módulos e aulas"). */
export function itemAtivo(path: string) {
  return TODOS.filter((x) => casa(path, x)).sort((a, b) => b.href.length - a.href.length)[0];
}
export function grupoAtivo(path: string) {
  const i = itemAtivo(path);
  return GRUPOS.find((g) => g.itens.includes(i as Item));
}

const cls = (ativo: boolean, sub = false) =>
  `inline-flex shrink-0 items-center rounded-xl px-4 font-semibold ${sub ? "min-h-10 text-[14px]" : "min-h-11 text-[15px]"} ${
    ativo ? "bg-navy text-white" : "text-navy hover:bg-[#eceef3]"
  }`;

export default function AdminNav() {
  const path = usePathname();
  const atual = itemAtivo(path);
  const grupo = grupoAtivo(path);

  return (
    <nav aria-label="Painel administrador" className="flex gap-1 overflow-x-auto md:flex-col">
      {GRUPOS.map((g) => {
        const aberto = g === grupo;
        const titulo = g.secao && <span className="hidden px-4 pt-5 pb-1 font-display text-[11px] font-bold tracking-[.12em] text-muted uppercase md:block">{g.secao}</span>;
        if (g.itens.length === 1) {
          const i = g.itens[0];
          return <Fragment key={g.id}>{titulo}<Link href={i.href} aria-current={i === atual ? "page" : undefined} className={cls(i === atual)}>{g.label}</Link></Fragment>;
        }
        return (
          <Fragment key={g.id}>{titulo}
          <div className="flex shrink-0 flex-col gap-1">
            <Link href={g.itens[0].href} aria-expanded={aberto}
              className={`${cls(false)} justify-between gap-2 ${aberto ? "bg-[#e3e6ee]" : ""}`}>
              {g.label}
              <span aria-hidden="true" className={`hidden text-xs transition-transform md:inline ${aberto ? "rotate-90" : ""}`}>▸</span>
            </Link>
            {aberto && (
              <ul className="hidden flex-col gap-0.5 border-l-2 border-[#dfe2ea] pl-2 md:ml-4 md:flex">
                {g.itens.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} aria-current={i === atual ? "page" : undefined} className={`${cls(i === atual, true)} w-full`}>{i.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Abas no topo do conteúdo para o grupo atual (Head Hunter, Usuários…). Só no celular: no computador, o submenu lateral faz esse papel. */
export function AdminAbas() {
  const path = usePathname();
  const grupo = grupoAtivo(path);
  const atual = itemAtivo(path);
  if (!grupo || grupo.itens.length < 2) return null;
  return (
    <nav aria-label={`Seções de ${grupo.label}`} className="-mb-2 flex flex-col gap-2 md:hidden">
      <span className="font-display text-xs font-bold tracking-[.1em] text-muted uppercase">{grupo.label}</span>
      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {grupo.itens.map((i) => {
          const ativo = i === atual;
          return (
            <Link key={i.href} href={i.href} aria-current={ativo ? "page" : undefined}
              className={`-mb-px inline-flex min-h-11 shrink-0 items-center border-b-[3px] px-3 text-[14px] font-semibold whitespace-nowrap ${
                ativo ? "border-brand-strong text-navy" : "border-transparent text-ink-2 hover:text-navy"
              }`}>
              {i.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
