import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmBreve from "@/components/EmBreve";
import { headers } from "next/headers";
import { getConfig } from "@/lib/config";
import { getUser } from "@/lib/supabase/server";
import "./globals.css";

// Fontes hospedadas no próprio site (sem depender do Google Fonts)
const inter = localFont({ src: "../fonts/inter.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
const montserrat = localFont({
  src: "../fonts/montserrat.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cabincrew.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cabin Crew — Crew Select, o preparatório para comissário de voo",
    template: "%s · Cabin Crew",
  },
  description:
    "O preparatório que acompanha você em cada fase da seleção para comissário de voo.",
  openGraph: { siteName: "Cabin Crew", locale: "pt_BR", type: "website" },
};

/** Em manutenção, só passam administradores, o login da equipe (/entrar?equipe) e o retorno do login. */
function liberadoNaManutencao(path: string, search: string) {
  if (path.startsWith("/auth/")) return true;
  return path === "/entrar" && new URLSearchParams(search).has("equipe");
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ manutencao }, { user, profile }, h] = await Promise.all([getConfig(), getUser(), headers()]);
  const bloqueado =
    manutencao && !profile?.is_admin && !liberadoNaManutencao(h.get("x-cc-path") ?? "/", h.get("x-cc-search") ?? "");

  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {bloqueado ? (
          <EmBreve logado={!!user} />
        ) : (
          <>
        {manutencao && profile?.is_admin && (
          <div role="status" className="bg-brand-deep px-6 py-2.5 text-center text-sm font-semibold text-white">
            Modo manutenção ligado: o público vê apenas a página “Em breve”.{" "}
            <a href="/admin/configuracoes" className="underline">Desligar</a>
          </div>
        )}
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
          </>
        )}
      </body>
    </html>
  );
}
