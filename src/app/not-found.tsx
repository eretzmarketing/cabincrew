import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center gap-4 bg-soft px-6 py-24 text-center">
      <span className="font-display text-6xl font-extrabold text-brand">404</span>
      <h1 className="font-display text-[28px] font-extrabold">Página não encontrada</h1>
      <p className="max-w-[420px] text-ink-2">Esta página não existe ou a seleção foi removida.</p>
      <Link href="/forum" className="rounded-full bg-brand-strong px-6 py-3.5 font-display font-bold text-white hover:bg-brand-deep">Ir para o fórum</Link>
    </main>
  );
}
