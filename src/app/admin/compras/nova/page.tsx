import type { Metadata } from "next";
import Link from "next/link";
import { Card, Titulo } from "@/components/admin-ui";
import { NovaCompraForm } from "@/components/ComprasForms";

export const metadata: Metadata = { title: "Registrar compra" };

export default function NovaCompraPage() {
  // valor inicial do campo de data: agora, no horário de Brasília (AAAA-MM-DDTHH:MM)
  const agora = new Date(new Date().getTime() - 3 * 3600000).toISOString().slice(0, 16);
  return (
    <>
      <Link href="/admin/compras" className="text-sm font-semibold text-navy">← Compras</Link>
      <Titulo sub="Copie os dados do comprovante da plataforma de pagamento. Se o e-mail tiver cadastro no site, a compra fica vinculada ao aluno.">Registrar compra</Titulo>
      <Card><NovaCompraForm agora={agora} /></Card>
    </>
  );
}
