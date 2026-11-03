import type { MetadataRoute } from "next";
import { createClient as createSupabase } from "@supabase/supabase-js";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cabincrew.com.br";
  const fixas: MetadataRoute.Sitemap = ["", "/forum", "/regras", "/privacidade"].map((p) => ({ url: `${site}${p}` }));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fixas;

  const { data } = await createSupabase(url, key).from("selecoes_resumo").select("slug, ultimo_relato, created_at");
  return [
    ...fixas,
    ...(data ?? []).map((s) => ({
      url: `${site}/forum/${s.slug}`,
      lastModified: s.ultimo_relato ?? s.created_at,
      changeFrequency: "daily" as const,
    })),
  ];
}
