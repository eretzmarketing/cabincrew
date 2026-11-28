"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { marcarNotificacoesLidas } from "@/app/actions";

/** Ao abrir a página de notificações, marca todas como lidas (o sininho zera). */
export function MarcarLidas() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(async () => { await marcarNotificacoesLidas(); router.refresh(); }, 1500);
    return () => clearTimeout(t);
  }, [router]);
  return null;
}
