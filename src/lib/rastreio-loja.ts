/**
 * Atualização automática das entregas da loja: pergunta ao SuperFrete a situação de cada etiqueta
 * e avança o pedido (postada → Enviado, entregue → Entregue), avisando o aluno no WhatsApp.
 * Roda pelo agendamento do servidor (scripts/rastreio-loja.mjs) e pelo botão do admin.
 */
import { anonimo, configMP, SITE } from "@/lib/mercadopago";
import { configSuperfrete, infoEtiqueta } from "@/lib/superfrete";
import { enviarWhatsapp, preencher } from "@/lib/whatsapp";
import { enderecoEmLinha, linkRastreio, transportadora, type Endereco } from "@/lib/loja";

export type ResumoRastreio = { conferidos: number; enviados: number; entregues: number; erros: string[]; aviso?: string };

type Linha = {
  status: string; evento: string | null; envio_id: number | null; telefone: string | null; nome: string | null; texto: string | null;
  produto_nome: string; quantidade: number; endereco: Endereco; rastreio: string | null; etiqueta_servico: number | null;
};

export async function atualizarEntregas(): Promise<ResumoRastreio> {
  const resumo: ResumoRastreio = { conferidos: 0, enviados: 0, entregues: 0, erros: [] };
  const sf = configSuperfrete();
  const mp = configMP();
  if (!sf) return { ...resumo, aviso: "SuperFrete não conectado." };
  if (!mp) return { ...resumo, aviso: "Mercado Pago não configurado (a chave do site fica junto)." };
  const supabase = anonimo();
  const { data, error } = await supabase.rpc("loja_rastrear_lista", { p_chave: mp.chave });
  if (error) return { ...resumo, aviso: error.message.includes("loja_rastrear_lista") ? "Rode o SQL 0057_superfrete.sql no Supabase." : "Não foi possível ler os pedidos." };

  for (const p of (data ?? []) as { id: number; etiqueta_id: string; status: string }[]) {
    resumo.conferidos++;
    try {
      const info = await infoEtiqueta(sf, p.etiqueta_id);
      const { data: res, error: e } = await supabase.rpc("loja_rastrear_atualizar", {
        p_chave: mp.chave, p_pedido: p.id, p_etiqueta_status: info.status, p_rastreio: info.rastreio,
      });
      if (e) throw new Error(e.message);
      const r = ((res ?? []) as Linha[])[0];
      if (!r) continue;
      if (r.evento === "loja_enviado") resumo.enviados++;
      if (r.evento === "loja_entregue") resumo.entregues++;
      if (r.envio_id && r.telefone && r.texto) {
        const texto = preencher(r.texto, {
          nome: r.nome ?? "", pedido: p.id, produto: `${r.quantidade > 1 ? `${r.quantidade}× ` : ""}${r.produto_nome}`,
          rastreio: r.rastreio ?? "", link_rastreio: r.rastreio ? linkRastreio(r.rastreio, r.etiqueta_servico) : `${SITE}/conta/pedidos`,
          transportadora: transportadora(r.etiqueta_servico), endereco: enderecoEmLinha(r.endereco),
        });
        const w = await enviarWhatsapp(r.telefone, texto);
        await supabase.rpc("loja_whatsapp_resultado", { p_chave: mp.chave, p_id: r.envio_id, p_status: w.ok ? "enviada" : w.status, p_texto: texto, p_erro: w.ok ? null : w.erro });
      }
    } catch (e) {
      resumo.erros.push(`Pedido nº ${p.id}: ${(e as Error).message}`);
    }
  }
  return resumo;
}
