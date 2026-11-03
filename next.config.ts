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
    return ["comissariadevoo.com.br", "www.comissariadevoo.com.br", "www.cabincrew.com.br"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://cabincrew.com.br/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
