import type { Metadata } from "next";
import { Titulo } from "@/components/admin-ui";
import BibliotecaMidia, { type Midia } from "@/components/BibliotecaMidia";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Galeria de mídia" };

export default async function AdminMidia() {
  const { supabase } = await getUser();
  const { data, error } = await supabase.from("midias").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) {
    return (
      <>
        <Titulo>Mídia</Titulo>
        <p className="rounded-2xl border border-line bg-white p-6 text-ink-2">Falta rodar o SQL <strong>0021_midias.sql</strong> no Supabase para usar a biblioteca de mídia.</p>
      </>
    );
  }
  return (
    <>
      <Titulo sub="Fotos, vídeos, áudios e PDFs guardados no servidor do site. Envie, organize em pastas e use nas aulas (botão “Escolher da galeria”) ou copie o link.">Galeria de mídia</Titulo>
      <BibliotecaMidia inicial={(data ?? []) as Midia[]} />
    </>
  );
}
