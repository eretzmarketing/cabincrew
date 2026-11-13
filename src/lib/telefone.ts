/** Número com DDI no formato +5511999999999. Sem "+", considera Brasil (55). Devolve null se não parecer um telefone. */
export function normalizarTelefone(v: string) {
  const d = v.replace(/\D/g, "");
  if (!d) return null;
  if (v.trim().startsWith("+")) return d.length >= 10 && d.length <= 15 ? `+${d}` : null;
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return `+${d}`;
  return null;
}
