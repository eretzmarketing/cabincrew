import type { Metadata } from "next";
import AdminNav, { AdminAbas } from "@/components/AdminNav";
import { exigirLogin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Administrador", template: "%s · Administrador" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirLogin("/admin", true);
  return (
    <main className="bg-soft">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-8 pb-20 md:flex-row md:items-start">
        <aside className="flex min-w-0 shrink-0 flex-col gap-3 md:sticky md:top-6 md:w-56">
          <span className="px-1 font-display text-xs font-bold tracking-[.1em] text-muted uppercase">Administrador</span>
          <AdminNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <AdminAbas />
          {children}
        </div>
      </div>
    </main>
  );
}
