import type { Metadata } from "next";
import CentralAjuda from "@/components/CentralAjuda";

export const metadata: Metadata = {
  title: "Central de ajuda",
  description: "Tire suas dúvidas sobre a Cabin Crew: conta, simulados ANAC, Head Hunter, pagamentos, certificados e suporte.",
};

export default function AjudaPage() {
  return (
    <main className="bg-soft">
      <CentralAjuda />
    </main>
  );
}
