import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cabincrew.com.br";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/conta", "/moderacao", "/entrar", "/auth/"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
