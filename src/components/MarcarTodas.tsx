"use client";

/** Caixa "marcar todas" para as caixas de seleção ligadas a um formulário (atributo form). */
export default function MarcarTodas({ form, rotulo = "Marcar todas desta página" }: { form: string; rotulo?: string }) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-[14px] font-semibold">
      <input type="checkbox" className="h-5 w-5 accent-[#1f2a44]"
        onChange={(e) => document.querySelectorAll<HTMLInputElement>(`input[type=checkbox][form="${form}"]`).forEach((c) => { c.checked = e.currentTarget.checked; })} />
      {rotulo}
    </label>
  );
}
