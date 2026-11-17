"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { favoritarQuestao } from "@/app/questoes-actions";

export default function TirarFavorita({ questaoId }: { questaoId: string }) {
  const [pend, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pend}
      onClick={() => start(async () => { await favoritarQuestao(questaoId, false); router.refresh(); })}
      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-full border-2 border-[#e0a100] bg-[#fff8e6] px-4 text-[14px] font-semibold text-[#7a5a00] hover:bg-[#fff0c2] disabled:opacity-50">
      ★ {pend ? "Tirando…" : "Tirar das favoritas"}
    </button>
  );
}
