import Image from "next/image";
import Link from "next/link";
import { getConfig } from "@/lib/config";

export default async function Footer() {
  const { forum_ativo } = await getConfig();
  return (
    <footer className="bg-navy-deep px-6 pt-14 pb-10 text-[#c9cedb]">
      <div className="mx-auto flex max-w-[1152px] flex-col gap-9">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-[360px] flex-col gap-3.5">
            <Image src="/img/logo-branco.png" alt="Cabin Crew — Comunidade Oficial" width={205} height={34} className="h-[34px] w-auto self-start" />
            <p className="text-[15px] leading-relaxed">A comunidade de quem quer ser e de quem já é comissário de voo.</p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-14 text-[15px]">
            <div className="flex flex-col gap-2.5">
              <strong className="font-display text-white">Head Hunter</strong>
              <Link href="/planos" className="hover:text-white">Planos</Link>
              <Link href="/simulados-anac" className="hover:text-white">Simulados ANAC grátis</Link>
              <Link href="/autenticar" className="hover:text-white">Autenticar certificado</Link>
              <Link href="/head-hunter" className="hover:text-white">Área do aluno</Link>
              <Link href="/conta" className="hover:text-white">Minha conta</Link>
            </div>
            {forum_ativo && (
              <div className="flex flex-col gap-2.5">
                <strong className="font-display text-white">Comunidade</strong>
                <Link href="/forum" className="hover:text-white">Fórum de Seleções</Link>
                <Link href="/regras" className="hover:text-white">Regras do fórum</Link>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <strong className="font-display text-white">Cabin Crew</strong>
              <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
              <Link href="/reembolso" className="hover:text-white">Reembolso</Link>
            </div>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-[#3a4258] pt-6 text-sm">
          <span>© {new Date().getFullYear()} Cabin Crew</span>
          <span>comissariadevoo.com.br agora é Cabin Crew</span>
        </div>
      </div>
    </footer>
  );
}
