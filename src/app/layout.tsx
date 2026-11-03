import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    default: "Cabin Crew — Seleções de comissário de voo, fase a fase",
    template: "%s · Cabin Crew",
  },
  description:
    "Relatos das seleções de comissário de voo da LATAM, GOL e Azul, organizados por fase e contados por quem está participando.",
  openGraph: { siteName: "Cabin Crew", locale: "pt_BR", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
