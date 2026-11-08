"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { importarQuestoes, type ResultadoImportacao } from "@/app/crew-actions";
import { BANCOS } from "@/lib/crew";
import { ENUNCIADOS_EXEMPLO, chaveEnunciado, decodificar, lerCsv, lerLinha, mapearCabecalho, type LinhaLida } from "@/lib/importar-questoes";

const LOTE = 300;

export default function ImportarQuestoes({ bancoInicial }: { bancoInicial: string }) {
  const [banco, setBanco] = useState(bancoInicial);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaLida[]>([]);
  const [exemplos, setExemplos] = useState(0);
  const [erroArquivo, setErroArquivo] = useState("");
  const [pular, setPular] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const validas = linhas.filter((l) => l.questao);
  const comErro = linhas.filter((l) => l.erro);

  async function ler(f: File) {
    setResultado(null);
    setErroArquivo("");
    setLinhas([]);
    setExemplos(0);
    setArquivo(f.name);
    if (!/\.(csv|txt)$/i.test(f.name)) return setErroArquivo("Envie um arquivo .csv. No Excel: Arquivo › Salvar como › CSV (separado por vírgulas ou ponto e vírgula).");
    if (f.size > 8 * 1024 * 1024) return setErroArquivo("Arquivo muito grande (máximo 8 MB). Divida em partes.");
    const tabela = lerCsv(decodificar(await f.arrayBuffer()));
    if (tabela.length < 2) return setErroArquivo("A planilha está vazia ou só tem o cabeçalho.");
    const { idx, faltam } = mapearCabecalho(tabela[0]);
    if (faltam.length) return setErroArquivo(`Faltam colunas no cabeçalho: ${faltam.join(", ")}. Use a planilha-modelo.`);
    let ex = 0;
    const lidas: LinhaLida[] = [];
    tabela.slice(1).forEach((cells, i) => {
      const l = lerLinha(cells, idx, i + 2);
      if (l.questao && ENUNCIADOS_EXEMPLO.has(chaveEnunciado(l.questao.enunciado))) ex += 1;
      else lidas.push(l);
    });
    if (lidas.length > 5000) return setErroArquivo("Máximo de 5.000 questões por arquivo. Divida em partes.");
    setExemplos(ex);
    setLinhas(lidas);
  }

  async function importar() {
    setEnviando(true);
    setProgresso(0);
    const total: ResultadoImportacao = { inseridas: 0, atualizadas: 0, repetidas: 0, invalidas: 0 };
    const qs = validas.map((l) => l.questao!);
    for (let i = 0; i < qs.length; i += LOTE) {
      const r = await importarQuestoes(banco, qs.slice(i, i + LOTE), pular);
      total.inseridas += r.inseridas;
      total.atualizadas += r.atualizadas;
      total.repetidas += r.repetidas;
      total.invalidas += r.invalidas;
      if (r.erro) { total.erro = r.erro; break; }
      setProgresso(Math.min(qs.length, i + LOTE));
    }
    setResultado(total);
    setEnviando(false);
    if (!total.erro) { setLinhas([]); setArquivo(null); if (input.current) input.current.value = ""; }
  }

  const passo = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white";

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Banco e modelo */}
      <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
        <div className="flex items-center gap-3"><span className={passo}>1</span><h2 className="font-display text-lg font-bold">Escolha o banco e baixe o modelo</h2></div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-[1_1_240px] flex-col gap-2 text-sm font-semibold text-navy">
            Banco das questões
            <select value={banco} onChange={(e) => setBanco(e.target.value)} disabled={enviando} className="min-h-12 rounded-xl border border-[#c9cedb] bg-white px-3 text-[15px]">
              {Object.entries(BANCOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <a href={`/admin/questoes/modelo?banco=${banco}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy px-5 font-semibold text-navy hover:bg-soft">
            ⬇ Baixar planilha-modelo
          </a>
        </div>
        <details className="rounded-xl bg-soft px-4 py-3 text-[14px] leading-relaxed text-ink-2">
          <summary className="cursor-pointer font-semibold text-navy">Como preencher a planilha</summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
            <li><strong>Uma questão por linha.</strong> Apague as linhas de exemplo (se esquecer, elas são ignoradas).</li>
            <li><strong>enunciado</strong>, <strong>A</strong>, <strong>B</strong> e <strong>correta</strong> são obrigatórios. C, D e E são opcionais.</li>
            <li><strong>correta</strong>: só a letra (A, B, C, D ou E) de uma alternativa preenchida.</li>
            <li><strong>tema</strong>: na ANAC use o nome do bloco (ex.: Segurança e Emergência), porque os simulados por bloco sorteiam pelo tema.</li>
            <li><strong>texto de apoio</strong>: texto, cenário ou dados que aparecem antes do enunciado (opcional).</li>
            <li><strong>imagem</strong>: endereço da figura (https://…). Numa alternativa, cole o endereço da imagem no fim do texto.</li>
            <li><strong>nos simulados</strong>: “sim” ou “não”. Vazio = sim.</li>
            <li>Para <strong>corrigir em massa</strong>: use o Exportar CSV do banco, edite no Excel e importe aqui. As questões são atualizadas pela coluna <strong>id</strong>.</li>
            <li>Salve como <strong>CSV</strong> (ponto e vírgula ou vírgula). Acentos funcionam em UTF-8 e no padrão do Excel.</li>
          </ul>
        </details>
      </section>

      {/* 2. Arquivo */}
      <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
        <div className="flex items-center gap-3"><span className={passo}>2</span><h2 className="font-display text-lg font-bold">Envie a planilha preenchida</h2></div>
        <label
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); const f = e.dataTransfer.files[0]; if (f) ler(f); }}
          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${arrastando ? "border-navy bg-soft" : "border-[#c9cedb] hover:border-navy hover:bg-soft"}`}
        >
          <span aria-hidden="true" className="text-3xl">📄</span>
          <span className="font-semibold text-navy">{arquivo ?? "Arraste o arquivo CSV aqui ou clique para escolher"}</span>
          <span className="text-[13px] text-muted">.csv · até 5.000 questões</span>
          <input ref={input} type="file" accept=".csv,text/csv,.txt" className="sr-only" disabled={enviando} onChange={(e) => { const f = e.target.files?.[0]; if (f) ler(f); }} />
        </label>
        {erroArquivo && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{erroArquivo}</p>}
      </section>

      {/* 3. Conferência */}
      {linhas.length > 0 && (
        <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
          <div className="flex items-center gap-3"><span className={passo}>3</span><h2 className="font-display text-lg font-bold">Confira antes de importar</h2></div>
          <div className="flex flex-wrap gap-2 text-[14px] font-semibold">
            <span className="rounded-full bg-[#e5f6ec] px-3 py-1.5 text-[#0f6b3a]">✓ {validas.length} prontas</span>
            {comErro.length > 0 && <span className="rounded-full bg-brand-soft px-3 py-1.5 text-brand-deep">✕ {comErro.length} com problema (não serão importadas)</span>}
            {exemplos > 0 && <span className="rounded-full bg-soft px-3 py-1.5 text-ink-2">{exemplos} {exemplos === 1 ? "linha de exemplo ignorada" : "linhas de exemplo ignoradas"}</span>}
            {validas.some((l) => l.questao!.id) && <span className="rounded-full bg-[#eef3ff] px-3 py-1.5 text-[#2f5bd3]">{validas.filter((l) => l.questao!.id).length} com id (atualizam questões existentes)</span>}
          </div>

          {comErro.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-brand-line">
              <table className="w-full text-left text-[14px]">
                <thead className="sticky top-0 bg-brand-soft text-brand-deep"><tr><th className="px-3 py-2">Linha</th><th className="px-3 py-2">Problema</th></tr></thead>
                <tbody>{comErro.map((l) => <tr key={l.linha} className="border-t border-brand-line"><td className="px-3 py-2 font-semibold">{l.linha}</td><td className="px-3 py-2">{l.erro}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          {validas.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="border-b border-line bg-soft text-muted">
                  <tr><th className="px-3 py-2 font-semibold">Linha</th><th className="px-3 py-2 font-semibold">Tema</th><th className="px-3 py-2 font-semibold">Enunciado</th><th className="px-3 py-2 font-semibold">Alternativas</th><th className="px-3 py-2 text-center font-semibold">Correta</th></tr>
                </thead>
                <tbody>
                  {validas.slice(0, 8).map((l) => {
                    const q = l.questao!;
                    const certa = q.alternativas.find((a) => a.letra === q.correta);
                    return (
                      <tr key={l.linha} className="border-b border-[#eceef3] align-top last:border-0">
                        <td className="px-3 py-2 text-muted">{l.linha}</td>
                        <td className="px-3 py-2">{q.categoria ?? <span className="text-muted">—</span>}</td>
                        <td className="px-3 py-2"><span className="line-clamp-2">{q.enunciado}</span></td>
                        <td className="px-3 py-2 text-muted">{q.alternativas.length} · ✓ <span className="text-navy">{certa?.texto ?? "imagem"}</span></td>
                        <td className="px-3 py-2 text-center"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-strong font-display text-sm font-bold text-white">{q.correta}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {validas.length > 8 && <p className="border-t border-line px-3 py-2 text-[13px] text-muted">… e mais {validas.length - 8} questões.</p>}
            </div>
          )}

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
            <input type="checkbox" checked={pular} onChange={(e) => setPular(e.target.checked)} className="h-5 w-5 accent-brand-strong" />
            Pular questões que já existem no banco (mesmo enunciado)
          </label>

          {enviando && (
            <div className="flex flex-col gap-1.5" role="status">
              <span className="text-[14px] text-ink-2">Importando… {progresso} de {validas.length}</span>
              <span className="h-2.5 rounded-full bg-[#eceef3]"><span className="block h-2.5 rounded-full bg-navy transition-all" style={{ width: `${(progresso / Math.max(1, validas.length)) * 100}%` }} /></span>
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={importar}
              disabled={enviando || !validas.length}
              className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Importando…" : `Importar ${validas.length} ${validas.length === 1 ? "questão" : "questões"} em ${BANCOS[banco]}`}
            </button>
          </div>
        </section>
      )}

      {resultado && (
        <section role="status" className={`flex flex-col gap-3 rounded-[20px] border p-6 ${resultado.erro ? "border-brand-line bg-brand-soft" : "border-[#bfe6cf] bg-[#eefaf2]"}`}>
          <h2 className="font-display text-lg font-bold">{resultado.erro ? "A importação parou no meio" : "Importação concluída"}</h2>
          {resultado.erro && <p className="text-brand-deep">{resultado.erro}</p>}
          <ul className="flex flex-wrap gap-2 text-[14px] font-semibold">
            <li className="rounded-full bg-white px-3 py-1.5">{resultado.inseridas} novas</li>
            {resultado.atualizadas > 0 && <li className="rounded-full bg-white px-3 py-1.5">{resultado.atualizadas} atualizadas</li>}
            {resultado.repetidas > 0 && <li className="rounded-full bg-white px-3 py-1.5">{resultado.repetidas} repetidas puladas</li>}
            {resultado.invalidas > 0 && <li className="rounded-full bg-white px-3 py-1.5 text-brand-deep">{resultado.invalidas} recusadas</li>}
          </ul>
          <Link href={`/admin/questoes?banco=${banco}`} className="self-start font-semibold">Ver as questões de {BANCOS[banco]} →</Link>
        </section>
      )}
    </div>
  );
}
