import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizarCupom, type Cupom } from "@/lib/cupons";

/** Confere o cupom no banco para um plano. */
export async function validarCupom(supabase: SupabaseClient, codigo: string | null | undefined, produto: string): Promise<{ cupom: Cupom | null; erro?: string }> {
  const c = normalizarCupom(codigo ?? "");
  if (!c) return { cupom: null };
  const { data, error } = await supabase.rpc("cupom_validar", { p_codigo: c, p_produto: produto });
  if (error) return { cupom: null, erro: "Cupons indisponíveis no momento." };
  const r = ((data ?? []) as { ok: boolean; motivo: string | null; codigo: string; tipo: Cupom["tipo"]; valor: number }[])[0];
  if (!r?.ok) return { cupom: null, erro: r?.motivo ?? "Cupom inválido." };
  return { cupom: { codigo: r.codigo, tipo: r.tipo, valor: Number(r.valor) } };
}
