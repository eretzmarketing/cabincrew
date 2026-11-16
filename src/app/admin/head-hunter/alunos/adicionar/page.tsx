import { redirect } from "next/navigation";

/** Endereço antigo: a página de adicionar aluno agora fica em Usuários. */
export default async function Antigo({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = new URLSearchParams(await searchParams).toString();
  redirect(`/admin/usuarios/adicionar${q ? `?${q}` : ""}`);
}
