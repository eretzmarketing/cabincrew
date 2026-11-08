"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/admin", label: "Visão geral", exato: true },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/interessados", label: "Lista de interesse" },
  { href: "/admin/crew-select", label: "Crew Select" },
  { href: "/admin/anac", label: "Simulado ANAC" },
  { href: "/admin/questoes", label: "Banco de questões" },
  { href: "/admin/entrevista", label: "Entrevista em inglês" },
  { href: "/admin/forum", label: "Fórum de Seleções" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Painel administrador" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITENS.map((i) => {
        const ativo = i.exato ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={ativo ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-[15px] font-semibold ${
              ativo ? "bg-navy text-white" : "text-navy hover:bg-[#eceef3]"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
