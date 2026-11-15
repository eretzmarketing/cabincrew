"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CRITERIOS_CV, NOTA_CV_OK, type FeedbackCV, type ResultadoRequisito } from "@/lib/ia-curriculo-tipos";

const btnPrim = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(texto).then(() => { setOk(true); setTimeout(() => setOk(false), 2000); }); }}
      className="min-h-9 cursor-pointer rounded-full border-2 border-line px-3 text-[13px] font-semibold text-navy hover:border-navy">
      {ok ? "Copiado ✓" : "Copiar"}
    </button>
  );
}

/** Requisitos das companhias (exigidos e diferenciais) e palavras-chave definidas pela equipe. */
function Requisitos({ r }: { r: ResultadoRequisito[] }) {
  const docs = r.filter((x) => x.tipo !== "palavra");
  const palavras = r.filter((x) => x.tipo === "palavra");
  const icone = (x: ResultadoRequisito) =>
    x.status === "ok" ? ["✓", "text-[#1f9d55]"] : x.status !== "ausente" ? ["!", "text-[#b07d00]"] : x.tipo === "exigido" ? ["✗", "text-brand-strong"] : ["＋", "text-[#2f5bd3]"];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-4">
      {docs.length > 0 && (
        <div className="flex flex-col gap-2">
          <strong className="font-display">Requisitos das companhias</strong>
          <ul className="flex flex-col gap-2 text-[15px]">
            {docs.map((x) => {
              const [i, cor] = icone(x);
              return (
                <li key={x.nome} className="flex items-start gap-2">
                  <span aria-hidden="true" className={`w-4 shrink-0 text-center font-bold ${cor}`}>{i}</span>
                  <span className="flex flex-col">
                    <span className="font-semibold">
                      {x.nome}{" "}
                      <span className={`ml-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${x.tipo === "exigido" ? "bg-brand-soft text-brand-deep" : "bg-[#eef3ff] text-[#2f5bd3]"}`}>{x.tipo === "exigido" ? "exigido" : "diferencial"}</span>
                    </span>
                    <span className="text-[14px] text-ink-2">
                      {x.detalhe ?? (x.status === "ok" ? "Encontrado no currículo" : x.tipo === "exigido" ? "Não encontrado: as companhias pedem" : "Não encontrado: se você tiver, inclua")}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {palavras.length > 0 && (
        <div className="flex flex-col gap-2">
          <strong className="font-display">Palavras-chave que o robô procura</strong>
          <ul className="flex flex-wrap gap-2">
            {palavras.map((x) => (
              <li key={x.nome} className={`rounded-full px-3 py-1 text-[14px] font-semibold ${x.status === "ok" ? "bg-[#e5f6ec] text-[#0f6b3a]" : "border border-dashed border-[#c9cedb] text-ink-2"}`}>
                {x.status === "ok" ? "✓ " : ""}{x.nome}<span className="sr-only">{x.status === "ok" ? " (encontrada)" : " (não encontrada)"}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-muted">Em verde: encontradas no seu currículo. Tracejadas: inclua as que forem verdade para você.</p>
        </div>
      )}
    </div>
  );
}

/** Resultado da análise (usado na hora e no histórico). */
export function FeedbackCurriculo({ f }: { f: FeedbackCV }) {
  const grupos = [...new Set(CRITERIOS_CV.map((c) => c.grupo))];
  const ok = f.nota >= NOTA_CV_OK;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-5">
        <span className={`inline-flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full font-display ${ok ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`}>
          <strong className="text-[32px] leading-none font-extrabold">{f.nota}</strong><span className="text-[12px] font-semibold">de 100</span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <strong className="font-display text-lg">{ok ? "Pronto para enviar ✈️" : "Ajuste antes de enviar"}</strong>
          <p className="text-[16px] leading-relaxed">{f.resumo}</p>
        </div>
      </div>

      {f.conferencias?.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
          <strong className="font-display">O que o robô (ATS) encontrou</strong>
          <ul className="grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
            {f.conferencias.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span aria-hidden="true" className={c.nivel === "dica" ? "text-[#2f5bd3]" : c.nivel === "alerta" ? "text-[#b07d00]" : c.ok ? "text-[#1f9d55]" : "text-brand-strong"}>
                  {c.nivel === "dica" ? "＋" : c.nivel === "alerta" ? "!" : c.ok ? "✓" : "✗"}
                </span>
                <span className={c.nivel === "dica" ? "text-[#2f5bd3]" : c.nivel === "alerta" ? "font-semibold text-[#7a5a00]" : c.ok ? "" : "font-semibold text-brand-deep"}>
                  {c.texto}{!c.ok && !c.nivel && <span className="sr-only"> (não encontrado)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!f.requisitos?.length && <Requisitos r={f.requisitos} />}

      <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
        {grupos.map((g) => {
          const ns = CRITERIOS_CV.filter((c) => c.grupo === g).map((c) => f.criterios.find((x) => x.id === c.id)?.nota).filter((x): x is number => x !== undefined);
          if (!ns.length) return null;
          const media = Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10);
          return (
            <div key={g} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-[15px]">
              <span className="font-semibold">{g}</span>
              <span className="h-2.5 rounded-full bg-[#eceef3]" aria-hidden="true"><span className={`block h-2.5 rounded-full ${media >= 80 ? "bg-[#1f9d55]" : media >= 50 ? "bg-[#e0a100]" : "bg-brand-strong"}`} style={{ width: `${media}%` }} /></span>
              <strong className="text-right">{media}</strong>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {grupos.map((g) => (
          <div key={g} className="flex flex-col gap-3 rounded-2xl bg-soft p-4">
            <strong className="font-display">{g}</strong>
            {CRITERIOS_CV.filter((c) => c.grupo === g).map((c) => {
              const x = f.criterios.find((k) => k.id === c.id);
              if (!x) return null;
              return (
                <div key={c.id} className="flex flex-col gap-1 text-[14px]">
                  <span className="flex justify-between gap-2 font-semibold"><span>{c.nome}</span><span>{x.nota}/10</span></span>
                  <span className="h-1.5 rounded-full bg-[#dfe2ea]" aria-hidden="true"><span className={`block h-1.5 rounded-full ${x.nota >= 8 ? "bg-[#1f9d55]" : x.nota >= 5 ? "bg-[#e0a100]" : "bg-brand-strong"}`} style={{ width: `${x.nota * 10}%` }} /></span>
                  <span className="text-ink-2">{x.comentario}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl border border-[#bfe5cd] bg-[#f3fbf6] p-4">
          <strong className="font-display">💪 Pontos fortes</strong>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">{f.pontos_fortes.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-[#f0d58c] bg-[#fff8e6] p-4">
          <strong className="font-display">🔧 O que corrigir</strong>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px]">{f.melhorar.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
      </div>

      {f.palavras_faltando.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
          <strong className="font-display">🔑 Palavras-chave que faltam</strong>
          <p className="text-[14px] text-ink-2">O robô procura estas palavras. Inclua as que forem verdade para você.</p>
          <ul className="flex flex-wrap gap-2">{f.palavras_faltando.map((p) => <li key={p} className="rounded-full bg-[#eef1f7] px-3 py-1 text-[14px] font-semibold text-navy">{p}</li>)}</ul>
        </div>
      )}

      {f.resumo_sugerido && (
        <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between gap-2"><strong className="font-display">✍️ Sugestão de resumo profissional</strong><Copiar texto={f.resumo_sugerido} /></div>
          <p className="whitespace-pre-wrap rounded-xl bg-soft px-4 py-3 text-[15px] leading-relaxed">{f.resumo_sugerido}</p>
        </div>
      )}

      {f.experiencias.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
          <strong className="font-display">📝 Suas experiências, com mais força</strong>
          {f.experiencias.map((e) => (
            <div key={e.antes} className="grid gap-2 text-[15px] md:grid-cols-2">
              <p className="rounded-xl bg-[#f6f6f8] px-4 py-3 text-ink-2"><span className="block text-[12px] font-bold text-muted uppercase">Antes</span>{e.antes}</p>
              <div className="flex flex-col gap-2 rounded-xl bg-[#f3fbf6] px-4 py-3">
                <span className="flex items-center justify-between text-[12px] font-bold text-[#0f6b3a] uppercase">Depois <Copiar texto={e.depois} /></span>
                {e.depois}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Envio do currículo para a análise. */
export default function CurriculoIA({ restantes, disponivel }: { restantes: number | null; disponivel: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [aceite, setAceite] = useState(false);
  const [estado, setEstado] = useState<"" | "enviando">("");
  const [erro, setErro] = useState("");
  const [res, setRes] = useState<{ feedback: FeedbackCV; restantes: number | null } | null>(null);

  function escolher() {
    const f = input.current?.files?.[0] ?? null;
    setErro("");
    if (f && f.size > 5 * 1024 * 1024) { setErro("O arquivo passa de 5 MB."); setArquivo(null); return; }
    if (f && !/\.(pdf|docx)$/i.test(f.name)) { setErro("Envie em PDF ou Word (.docx)."); setArquivo(null); return; }
    setArquivo(f);
  }

  async function enviar() {
    if (!arquivo) return;
    setEstado("enviando"); setErro("");
    const fd = new FormData();
    fd.set("curriculo", arquivo);
    try {
      const r = await fetch("/api/curriculo-ia", { method: "POST", body: fd });
      const j = (await r.json().catch(() => ({}))) as { erro?: string; feedback?: FeedbackCV; restantes?: number | null };
      if (!r.ok || !j.feedback) { setErro(j.erro ?? "Não foi possível analisar agora. Tente de novo."); return; }
      setRes({ feedback: j.feedback, restantes: j.restantes ?? null });
      setArquivo(null); if (input.current) input.current.value = "";
      router.refresh();
    } catch {
      setErro("Sem conexão. Confira a internet e tente de novo.");
    } finally {
      setEstado("");
    }
  }

  if (!disponivel) {
    return <p className="rounded-[24px] border-2 border-line bg-white p-6 text-[16px] text-ink-2">A análise de currículo com IA ainda não está disponível. Enquanto isso, revise o seu currículo com as aulas do Módulo 04.</p>;
  }

  if (res) {
    return (
      <section aria-live="polite" className="flex flex-col gap-5 rounded-[24px] border-2 border-brand-line bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">🤖 Análise do seu currículo</h2>
        <FeedbackCurriculo f={res.feedback} />
        <p className="text-[15px] text-ink-2">
          {res.restantes === null ? "" : res.restantes > 0 ? `Você ainda tem ${res.restantes === 1 ? "1 análise" : `${res.restantes} análises`}: corrija o currículo com as dicas e envie de novo para comparar.` : "Essa foi a sua última análise. Use as dicas para deixar o currículo pronto."}
        </p>
        {res.restantes !== 0 && <div><button type="button" onClick={() => setRes(null)} className={btnPrim}>Enviar outra versão</button></div>}
      </section>
    );
  }

  if (restantes === 0) {
    return (
      <section className="flex flex-col gap-3 rounded-[24px] border-2 border-line bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">🤖 Análise de currículo</h2>
        <p className="text-[16px] leading-relaxed text-ink-2">Você já usou as suas análises. Os resultados estão no histórico, logo abaixo.</p>
        <p className="text-[15px] text-ink-2">Precisa de uma nova análise? <Link href="/conta/suporte?aba=novo" className="font-semibold text-navy underline">Fale com a gente pelo suporte</Link>.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-[24px] border-2 border-brand-line bg-white p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-extrabold">🤖 Envie o seu currículo</h2>
        <p className="text-[16px] leading-relaxed text-ink-2">Primeiro o site lê o arquivo como o robô de triagem (ATS) das companhias. Depois a IA avalia como um recrutador e diz o que corrigir. Leva cerca de 1 minuto.</p>
      </div>
      {restantes !== null && (
        <p className="rounded-xl bg-[#fff6dd] px-4 py-3 text-[15px] text-[#7a5a00]">
          Você tem <strong>{restantes === 1 ? "1 análise" : `${restantes} análises`}</strong>. Envie a versão que você mandaria para a companhia.
        </p>
      )}
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#c9cedb] px-4 py-6 text-center hover:border-navy">
        <span aria-hidden="true" className="text-3xl">📄</span>
        {arquivo ? <strong className="text-navy">{arquivo.name}</strong> : <span className="text-[16px] font-semibold text-navy">Clique para escolher o currículo</span>}
        <span className="text-[14px] text-muted">PDF ou Word (.docx), até 5 MB</span>
        <input ref={input} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={escolher} className="sr-only" />
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink-2">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong" />
        <span>Autorizo enviar o texto do meu currículo para a análise por inteligência artificial (OpenAI). O arquivo é lido e descartado na hora; o site guarda só o resultado. <Link href="/privacidade" className="font-semibold text-navy underline">Privacidade</Link></span>
      </label>
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{erro}</p>}
      <div>
        <button type="button" onClick={enviar} disabled={!arquivo || !aceite || estado === "enviando"} className={btnPrim}>
          {estado === "enviando" ? "Analisando o currículo… (cerca de 1 minuto)" : "Analisar meu currículo"}
        </button>
      </div>
    </section>
  );
}
