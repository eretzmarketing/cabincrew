/** Tela "Carregando…" com o logo pulsando. Aparece só se a página demorar (evita piscar em páginas rápidas). */
export default function Carregando() {
  return (
    <div role="status" aria-live="polite" className="cc-carregando flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16">
      {/* eslint-disable-next-line @next/next/no-img-element -- ícone pequeno e fixo, sem otimização */}
      <img src="/img/carregando.webp" alt="" width={128} height={128} className="cc-pulsar h-28 w-28 md:h-32 md:w-32" />
      <span className="font-display text-[17px] font-bold text-navy">Carregando…</span>
    </div>
  );
}
