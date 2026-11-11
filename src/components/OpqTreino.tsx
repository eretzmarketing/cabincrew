"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { registrarOpq } from "@/app/crew-actions";
import { ESCALA, TRACOS_OPQ, faixa, type PerfilOpq } from "@/lib/opq";

type Item = { id: string; texto: string };

const btnPrim = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-display font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50";
const btnSec = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-navy px-6 font-semibold text-navy hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40";

export function ResultadoOpq({ perfil, anterior }: { perfil: PerfilOpq; anterior?: PerfilOpq }) {
  const porNome = new Map(perfil.tracos.map((t) => [t.traco, t]));
  const antes = new Map((anterior?.tracos ?? []).map((t) => [t.traco, t.pontos]));
  const ordem = TRACOS_OPQ.filter((t) => porNome.has(t.nome));
  const forcado = perfil.extremos >= 70;

  return (
    <div className="flex flex-col gap-6">
      {(forcado || perfil.incoerentes.length > 0) && (
        <div className="flex flex-col gap-3">
          {forcado && (
            <div role="alert" className="rounded-2xl border border-[#f3c3cf] bg-brand-soft p-5 text-brand-deep">
              <strong className="font-display text-lg">⚠️ Suas respostas parecem “perfeitas demais”</strong>
              <p className="pt-1 text-[15px] leading-relaxed">
                {perfil.extremos}% das respostas foram no extremo mais favorável. Nos testes reais isso costuma indicar resposta forçada,
                e o perfil pode ser descartado por pouca confiabilidade. Responda como você realmente é: ninguém concorda totalmente com tudo.
              </p>
            </div>
          )}
          {perfil.incoerentes.length > 0 && (
            <div role="status" className="rounded-2xl border border-[#f5dca0] bg-[#fff8e6] p-5 text-[#7a5a00]">
              <strong className="font-display text-lg">🔎 Respostas que se contradizem</strong>
              <p className="pt-1 text-[15px] leading-relaxed">
                Em <strong>{perfil.incoerentes.join(", ")}</strong> você concordou (ou discordou) ao mesmo tempo de afirmações opostas.
                Os testes de verdade cruzam afirmações assim para medir coerência. Releia com calma e responda pensando em situações reais.
              </p>
            </div>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {ordem.map((t) => {
          const r = porNome.get(t.nome)!;
          const a = antes.get(t.nome);
          const f = faixa(r.pontos);
          return (
            <li key={t.nome} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="font-display text-[17px]"><span aria-hidden="true">{t.emoji}</span> {t.nome}</strong>
                <span className="flex items-center gap-2 text-[14px]">
                  {a !== undefined && a !== r.pontos && <span className={a < r.pontos ? "text-[#0f6b3a]" : "text-muted"}>{a < r.pontos ? "▲" : "▼"} {Math.abs(r.pontos - a)} desde o último</span>}
                  <span className={`rounded-full px-3 py-0.5 font-semibold ${f === "Alto" ? "bg-[#e5f6ec] text-[#0f6b3a]" : f === "Médio" ? "bg-[#eef0f5] text-navy" : "bg-brand-soft text-brand-deep"}`}>{f}</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#eceef3]" role="img" aria-label={`${t.nome}: ${r.pontos} de 100`}>
                <div className={`h-2.5 rounded-full ${f === "Alto" ? "bg-[#2e9e62]" : f === "Médio" ? "bg-navy" : "bg-brand"}`} style={{ width: `${Math.max(4, r.pontos)}%` }} />
              </div>
              <p className="text-[14px] text-ink-2">{t.mede}</p>
              <details className="text-[14px]">
                <summary className="min-h-9 cursor-pointer py-1 font-semibold text-brand-strong">O que as companhias observam</summary>
                <p className="pt-1 leading-relaxed text-ink-2">{t.companhias}</p>
                {f === "Baixo" && <p className="pt-2 leading-relaxed text-ink-2"><strong>Para refletir:</strong> {t.baixo}</p>}
              </details>
            </li>
          );
        })}
      </ul>
      <p className="rounded-xl bg-soft px-4 py-3 text-[14px] text-ink-2">
        Este é um treino com {perfil.respondidas} afirmações e serve para você se conhecer. O resultado muda um pouco a cada sessão, porque as
        afirmações são sorteadas. O que importa é a coerência ao longo das tentativas.
      </p>
    </div>
  );
}

export default function OpqTreino({ itens, ultimo }: { itens: Item[]; ultimo?: PerfilOpq }) {
  const [fase, setFase] = useState<"intro" | "teste" | "fim">("intro");
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<Record<string, number>>({});
  const [perfil, setPerfil] = useState<PerfilOpq | null>(null);
  const [erro, setErro] = useState("");
  const [pend, start] = useTransition();
  const router = useRouter();
  const total = itens.length;
  const feitas = Object.keys(resp).length;
  const item = itens[i];

  const responder = useCallback((v: number) => {
    if (!item) return;
    setResp((r) => ({ ...r, [item.id]: v }));
    setTimeout(() => setI((x) => Math.min(x + 1, total - 1)), 180);
  }, [item, total]);

  useEffect(() => {
    if (fase !== "teste") return;
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/^[1-5]$/.test(e.key)) responder(Number(e.key));
      else if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      else if (e.key === "ArrowRight") setI((x) => Math.min(total - 1, x + 1));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, responder, total]);

  const enviar = () => {
    setErro("");
    start(async () => {
      const r = await registrarOpq(itens.filter((x) => resp[x.id]).map((x) => ({ id: x.id, v: resp[x.id] })));
      if (r.erro || !r.perfil) { setErro(r.erro ?? "Erro ao calcular."); return; }
      setPerfil(r.perfil);
      setFase("fim");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  if (!total) {
    return <p className="rounded-2xl bg-white p-6 text-[16px]">As afirmações ainda não foram cadastradas. Volte em breve.</p>;
  }

  if (fase === "intro") {
    return (
      <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">Como funciona</h2>
        <ul className="flex flex-col gap-3 text-[16px] leading-relaxed text-ink-2">
          <li>📝 São <strong>{total} afirmações</strong> sobre o seu jeito de trabalhar. Leva uns 10 minutos.</li>
          <li>⚖️ Para cada uma, diga o quanto você concorda, de <em>Discordo totalmente</em> a <em>Concordo totalmente</em>.</li>
          <li>🎯 <strong>Não existe resposta certa.</strong> Os testes reais (SHL, perfil e fit cultural) medem coerência e sinceridade: respostas forçadas pioram o resultado.</li>
          <li>📊 No fim você vê seu perfil em {TRACOS_OPQ.length} traços e o que as companhias observam em cada um.</li>
          <li>⌨️ No computador, use as teclas <kbd className="rounded border border-line bg-soft px-1.5">1</kbd> a <kbd className="rounded border border-line bg-soft px-1.5">5</kbd> para responder.</li>
        </ul>
        <div><button type="button" className={btnPrim} onClick={() => setFase("teste")}>Começar o treino</button></div>
      </div>
    );
  }

  if (fase === "fim" && perfil) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">Seu perfil nesta sessão</h2>
          <button type="button" className={btnSec} onClick={() => { setResp({}); setI(0); setPerfil(null); setFase("intro"); router.refresh(); }}>Treinar de novo</button>
        </div>
        <ResultadoOpq perfil={perfil} anterior={ultimo} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 rounded-[20px] bg-navy p-5 text-white">
        <div className="flex items-center justify-between text-sm">
          <span>Afirmação {i + 1} de {total}</span>
          <span>{feitas} respondidas</span>
        </div>
        <div className="h-2 rounded-full bg-white/20" aria-hidden="true"><div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${(feitas / total) * 100}%` }} /></div>
      </div>

      <section aria-live="polite" className="flex flex-col gap-6 rounded-[24px] border border-line bg-white p-6 md:p-8">
        <p className="font-display text-[22px] leading-snug font-bold md:text-[24px]">{item.texto}</p>
        <div role="radiogroup" aria-label="O quanto você concorda" className="grid gap-2 sm:grid-cols-5">
          {ESCALA.map((rotulo, k) => {
            const v = k + 1;
            const marcado = resp[item.id] === v;
            return (
              <button key={v} type="button" role="radio" aria-checked={marcado} onClick={() => responder(v)}
                className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center text-[15px] font-semibold sm:min-h-20 sm:flex-col ${marcado ? "border-brand-strong bg-brand-soft text-brand-deep" : "border-line bg-white text-navy hover:border-navy"}`}>
                <span aria-hidden="true" className="hidden text-xs text-muted sm:block">{v}</span>
                {rotulo}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={btnSec} disabled={i === 0} onClick={() => setI(i - 1)}>← Anterior</button>
        {i < total - 1 ? (
          <button type="button" className={btnSec} onClick={() => setI(i + 1)}>Próxima →</button>
        ) : (
          <button type="button" className={btnPrim} disabled={feitas < total || pend} onClick={enviar}>{pend ? "Calculando…" : "Ver meu perfil"}</button>
        )}
      </div>
      {feitas === total && i < total - 1 && (
        <div className="flex justify-end"><button type="button" className={btnPrim} disabled={pend} onClick={enviar}>{pend ? "Calculando…" : "Ver meu perfil"}</button></div>
      )}
      {erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-brand-deep">{erro}</p>}

      <nav aria-label="Navegação rápida" className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-4">
        <span className="text-sm font-semibold">Navegação rápida</span>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
          {itens.map((x, k) => (
            <button key={x.id} type="button" onClick={() => setI(k)} aria-label={`Afirmação ${k + 1}${resp[x.id] ? " (respondida)" : ""}`} aria-current={k === i}
              className={`h-10 cursor-pointer rounded-lg text-sm font-semibold ${k === i ? "bg-brand-strong text-white" : resp[x.id] ? "bg-navy text-white" : "bg-soft text-navy hover:bg-[#e6e9f0]"}`}>{k + 1}</button>
          ))}
        </div>
      </nav>
    </div>
  );
}

