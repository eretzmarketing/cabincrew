import Link from "next/link";
import { EMPRESA, VERSAO_LEGAL_EXTENSO, faltaPreencher } from "@/lib/legal";

/** Moldura das páginas legais (Termos, Privacidade, Reembolso). */
export default function PaginaLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="bg-soft px-5 py-12">
      <article className="legal mx-auto flex max-w-[760px] flex-col gap-4 text-[16px] leading-relaxed text-ink-2 [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:font-semibold [&_a]:text-navy [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-navy [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        <h1 className="font-display text-[32px] leading-tight font-extrabold text-navy md:text-[38px]">{titulo}</h1>
        <p className="text-[14px] text-muted">Versão de {VERSAO_LEGAL_EXTENSO} · {EMPRESA.marca}</p>
        {faltaPreencher && (
          <p className="rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-[14px]">
            Rascunho para revisão jurídica. Os campos entre colchetes (razão social, CNPJ, endereço, contatos) ainda precisam ser preenchidos.
          </p>
        )}
        {children}
        <nav aria-label="Documentos" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-[15px] font-semibold">
          <Link href="/termos" className="text-navy underline underline-offset-4">Termos de Uso</Link>
          <Link href="/privacidade" className="text-navy underline underline-offset-4">Política de Privacidade</Link>
          <Link href="/reembolso" className="text-navy underline underline-offset-4">Política de Reembolso</Link>
          <Link href="/regras" className="text-navy underline underline-offset-4">Regras do fórum</Link>
        </nav>
      </article>
    </main>
  );
}
