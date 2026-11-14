// Atualiza as entregas da loja pelo SuperFrete (agendado pelo deploy/cloudpanel.sh, algumas vezes por dia).
// Lê a chave do site no arquivo de configuração e chama o próprio site, que faz o trabalho.
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const arquivo = process.env.MP_CONFIG_FILE || path.join(os.homedir(), ".cabincrew-mercadopago.json");
const porta = process.env.PORTA || "3000";
const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
let chave = "";
try { chave = JSON.parse(readFileSync(arquivo, "utf8")).chave || ""; } catch { /* sem arquivo */ }
if (!chave) { console.log(`${quando} · Mercado Pago ainda não configurado; nada a fazer.`); process.exit(0); }
try {
  const r = await fetch(`http://127.0.0.1:${porta}/api/loja/rastreio`, {
    method: "POST", headers: { Authorization: `Bearer ${chave}` }, signal: AbortSignal.timeout(280000),
  });
  console.log(`${quando} · ${r.status} · ${await r.text()}`);
} catch (e) {
  console.log(`${quando} · erro: ${e.message}`);
  process.exit(1);
}
