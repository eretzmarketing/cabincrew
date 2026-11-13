import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS v4 processado pelo Turbopack
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Quando comissariadevoo.com.br apontar para este projeto, cada página
  // antiga redireciona (301) para a mesma página em cabincrew.com.br.
  async redirects() {
    const internos = [
      { source: "/moderacao", destination: "/admin/forum", permanent: true },
      // o preparatório passou a se chamar Head Hunter: links antigos continuam funcionando
      { source: "/crew-select", destination: "/head-hunter", permanent: true },
      { source: "/crew-select/:path*", destination: "/head-hunter/:path*", permanent: true },
      { source: "/admin/crew-select", destination: "/admin/head-hunter", permanent: true },
      { source: "/admin/crew-select/:path*", destination: "/admin/head-hunter/:path*", permanent: true },
      // Flight Attendant English, Simulados ANAC e checkout ganharam endereços próprios
      { source: "/head-hunter/ingles-a-bordo", destination: "/english", permanent: true },
      { source: "/head-hunter/ingles-a-bordo/:path*", destination: "/english/:path*", permanent: true },
      { source: "/head-hunter/anac", destination: "/simulados-anac", permanent: true },
      { source: "/head-hunter/comprar", destination: "/comprar/head-hunter", permanent: true },
    ];
    return [...internos, ...["comissariadevoo.com.br", "www.comissariadevoo.com.br", "www.cabincrew.com.br"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://cabincrew.com.br/:path*",
      permanent: true,
    }))];
  },
};

export default nextConfig;
