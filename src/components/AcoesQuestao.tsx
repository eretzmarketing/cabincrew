"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import AvatarAluno from "@/components/AvatarAluno";
import {
  apagarComentario, carregarComentarios, comentarQuestao, curtirComentario, editarComentario, favoritarQuestao, reportarQuestao,
  type Comentario,
} from "@/app/questoes-actions";

export type QuestaoAcoes = {
  id: string;
  enunciado: string;
  alternativas: { letra: string; texto: string | null }[];
  correta: string | null;
};
export type PlusTela = { cobrar: boolean; preco: number; tem: boolean };

const preco = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const botao = "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-[14px] font-semibold transition";

/**
 * Ações de uma questão já corrigida: Reportar erro (grátis), Comentários e Favoritar (Questões Plus).
 * Favoritar só aparece no gabarito final da prova.
 */
export default function AcoesQuestao({ questao, tentativaId, comentarios, plus, favorita, aoFavoritar }: {
  questao: QuestaoAcoes;
  tentativaId: string;
  comentarios: number;
  plus: PlusTela;
  /** undefined = sem o botão Favoritar (durante a prova) */
  favorita?: boolean;
  aoFavoritar?: (marcada: boolean, total: number) => void;
}) {
  const [forum, setForum] = useState(false);
  const [total, setTotal] = useState(comentarios);
  const [fav, setFav] = useState(!!favorita);
  const [aviso, setAviso] = useState<"" | "plus" | string>("");
  const [pendFav, startFav] = useTransition();
  const dialogo = useRef<HTMLDialogElement>(null);

  function alternarFavorita() {
    if (!plus.tem) return setAviso("plus");
    const marcar = !fav;
    setFav(marcar); setAviso("");
    startFav(async () => {
      const r = await favoritarQuestao(questao.id, marcar);
      if ("erro" in r) { setFav(!marcar); setAviso(r.plus ? "plus" : r.erro); return; }
      aoFavoritar?.(marcar, r.total);
      window.dispatchEvent(new CustomEvent("cc-favoritas", { detail: r.total }));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {favorita !== undefined && (
          <button type="button" onClick={alternarFavorita} disabled={pendFav} aria-pressed={fav}
            className={`${botao} ${fav ? "border-[#e0a100] bg-[#fff8e6] text-[#7a5a00]" : "border-line bg-white text-navy hover:border-[#e0a100]"}`}>
            <span aria-hidden="true">{fav ? "★" : "☆"}</span>{fav ? "Favorita" : "Favoritar"}
          </button>
        )}
        <button type="button" onClick={() => (plus.tem ? setForum((v) => !v) : setAviso(aviso === "plus" ? "" : "plus"))} aria-expanded={forum}
          className={`${botao} ${forum ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}>
          <span aria-hidden="true">💬</span>Comentar questão{total ? ` (${total})` : ""}
        </button>
        <button type="button" onClick={() => dialogo.current?.showModal()}
          className={`${botao} border-line bg-white text-ink-2 hover:border-brand hover:text-brand-deep`}>
          <span aria-hidden="true">🚩</span>Reportar questão
        </button>
      </div>

      {aviso === "plus" && <AvisoPlus plus={plus} />}
      {aviso && aviso !== "plus" && <p role="alert" className="text-[14px] font-semibold text-brand-deep">{aviso}</p>}
      {forum && plus.tem && <Forum questaoId={questao.id} aoMudarTotal={setTotal} />}

      <ReportarDialog ref={dialogo} questao={questao} tentativaId={tentativaId} />
    </div>
  );
}

/* ------------------------------------------------------------------ contador de favoritas (gabarito) */

export function BarraFavoritas({ inicial, minimo, plus }: { inicial: number; minimo: number; plus: PlusTela }) {
  const [total, setTotal] = useState(inicial);
  useEffect(() => {
    const ouvir = (e: Event) => setTotal(Number((e as CustomEvent<number>).detail) || 0);
    window.addEventListener("cc-favoritas", ouvir);
    return () => window.removeEventListener("cc-favoritas", ouvir);
  }, []);
  const pronto = total >= minimo;
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border-2 border-[#f2d27a] bg-[#fffaf0] p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <strong className="font-display text-[17px] text-navy">⭐ Monte o seu simulado de favoritas</strong>
        <span className="text-[14px] leading-relaxed text-ink-2">
          {!plus.tem ? "Recurso do Questões Plus. "
            : pronto ? "Pronto! Você já pode fazer um simulado só com as suas favoritas. "
            : `Favorite as questões que quer revisar. Com ${minimo}, você libera um simulado exclusivo. `}
          <strong className="text-navy">{total} de {minimo}</strong>
        </span>
        <div className="h-2 max-w-[360px] rounded-full bg-[#f2e3bd]" aria-hidden="true">
          <div className="h-2 rounded-full bg-[#e0a100]" style={{ width: `${Math.min(100, (total / minimo) * 100)}%` }} />
        </div>
      </div>
      <Link href="/simulados-anac/favoritas" className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-[14px] font-semibold ${pronto && plus.tem ? "bg-brand-strong text-white hover:bg-brand-deep" : "border-2 border-navy text-navy hover:bg-navy hover:text-white"}`}>
        {pronto && plus.tem ? "Fazer simulado de favoritas" : "Ver minhas favoritas"}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ aviso do plano */

export function AvisoPlus({ plus }: { plus: PlusTela }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#e0a100] bg-[#fffaf0] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <strong className="font-display text-[17px] text-navy">⭐ Recurso do Questões Plus</strong>
        <span className="text-[14px] leading-relaxed text-ink-2">
          Comente as questões, tire dúvidas com outros alunos e monte o seu simulado de favoritas por {preco(plus.preco)}/mês.
        </span>
      </div>
      <Link href="/conta/suporte" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-navy px-5 text-[14px] font-semibold text-white hover:bg-navy-deep">
        Quero o Questões Plus
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ Reportar erro */

const TIPOS: [string, string][] = [
  ["gabarito", "A resposta certa está errada"],
  ["enunciado", "Erro no enunciado"],
  ["alternativas", "Erro nas alternativas"],
  ["outro", "Outro problema"],
];

function ReportarDialog({ ref, questao, tentativaId }: { ref: React.Ref<HTMLDialogElement>; questao: QuestaoAcoes; tentativaId: string }) {
  const [tipo, setTipo] = useState("gabarito");
  const [msg, setMsg] = useState("");
  const [estado, setEstado] = useState<"" | "ok" | string>("");
  const [pend, start] = useTransition();
  const certa = questao.alternativas.find((a) => a.letra === questao.correta);

  function enviar() {
    setEstado("");
    start(async () => {
      const r = await reportarQuestao(questao.id, tentativaId, tipo, msg);
      setEstado("ok" in r ? "ok" : r.erro);
    });
  }
  function fechar(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.closest("dialog")?.close();
    if (estado === "ok") { setMsg(""); setEstado(""); }
  }

  return (
    <dialog ref={ref} aria-labelledby={`rep-${questao.id}`}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      className="m-auto w-[min(560px,calc(100vw-24px))] rounded-[24px] p-0 backdrop:bg-navy-deep/60">
      {estado === "ok" ? (
        <div className="flex flex-col items-center gap-4 p-7 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f6ec] text-3xl" aria-hidden="true">✅</span>
          <h2 id={`rep-${questao.id}`} className="font-display text-[22px] font-extrabold text-navy">Reporte enviado</h2>
          <p className="text-[16px] leading-relaxed text-ink-2">
            Já comunicamos nossa equipe. Caso a resposta esteja incorreta, faremos a correção em nosso sistema.
            <br /><br />Obrigada!<br /><strong className="text-navy">Equipe Cabin Crew</strong>
          </p>
          <button type="button" onClick={fechar} className="min-h-12 w-full cursor-pointer rounded-full bg-navy px-6 font-display font-bold text-white">Fechar</button>
        </div>
      ) : (
        <div className="flex max-h-[90dvh] flex-col gap-4 overflow-y-auto p-6 md:p-7">
          <div className="flex items-start justify-between gap-3">
            <h2 id={`rep-${questao.id}`} className="font-display text-[22px] font-extrabold text-navy">🚩 Reportar questão</h2>
            <button type="button" onClick={fechar} aria-label="Fechar" className="-mt-1 -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-muted hover:bg-soft">×</button>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-soft p-4">
            <span className="text-[13px] font-semibold text-muted">Enunciado</span>
            <p className="text-[15px] leading-relaxed font-semibold whitespace-pre-line">{questao.enunciado}</p>
            {certa && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-[#2e9e62] bg-[#e5f6ec] px-3 py-2.5 text-[15px]">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2e9e62] font-display font-bold text-white">{certa.letra}</span>
                <span><span className="block text-[12px] font-semibold text-[#0f6b3a]">Resposta certa no sistema</span>{certa.texto}</span>
              </div>
            )}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[15px] font-semibold">O que está errado?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIPOS.map(([v, t]) => (
                <label key={v} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 text-[14px] ${tipo === v ? "border-navy bg-navy/5 font-semibold" : "border-line"}`}>
                  <input type="radio" name={`tipo-${questao.id}`} value={v} checked={tipo === v} onChange={() => setTipo(v)} className="h-4 w-4 accent-navy" />{t}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
            Conte para a equipe (opcional)
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1500} rows={3}
              placeholder="Ex.: pelo RBAC 121, a resposta certa seria a C."
              className="rounded-xl border border-[#c9cedb] px-4 py-3 text-[15px] font-normal outline-none focus:border-navy" />
          </label>
          {estado && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] font-semibold text-brand-deep">{estado}</p>}
          <button type="button" onClick={enviar} disabled={pend}
            className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-6 py-3 font-display text-[16px] font-bold text-white hover:bg-brand-deep disabled:opacity-60">
            {pend ? "Enviando…" : "Reportar erro"}
          </button>
        </div>
      )}
    </dialog>
  );
}

/* ------------------------------------------------------------------ Fórum da questão */

const EMOJIS = ["😀", "😂", "😅", "😍", "🥰", "😎", "🤔", "😮", "😢", "😡", "🙏", "👏", "👍", "👎", "💪", "🙌", "❤️", "🔥", "✨", "✅", "❌", "⚠️", "💡", "📚", "✈️", "🛫", "🛬", "🧳", "👩‍✈️", "👨‍✈️", "🎉", "🍀"];

function haQuanto(iso: string) {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "agora";
  const m = s / 60, h = m / 60, d = h / 24;
  if (m < 60) return `há ${Math.floor(m)} min`;
  if (h < 24) return `há ${Math.floor(h)} h`;
  if (d < 30) return `há ${Math.floor(d)} ${Math.floor(d) === 1 ? "dia" : "dias"}`;
  if (d < 365) return `há ${Math.floor(d / 30)} ${Math.floor(d / 30) === 1 ? "mês" : "meses"}`;
  return `há ${Math.floor(d / 365)} ${Math.floor(d / 365) === 1 ? "ano" : "anos"}`;
}

function Editor({ valor, setValor, placeholder, rotulo, aoEnviar, aoCancelar, pend, autoFocus }: {
  valor: string; setValor: (v: string) => void; placeholder: string; rotulo: string;
  aoEnviar: () => void; aoCancelar?: () => void; pend: boolean; autoFocus?: boolean;
}) {
  const [emojis, setEmojis] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (autoFocus) area.current?.focus(); }, [autoFocus]);

  function inserir(e: string) {
    const t = area.current;
    const ini = t?.selectionStart ?? valor.length, fim = t?.selectionEnd ?? valor.length;
    setValor(valor.slice(0, ini) + e + valor.slice(fim));
    requestAnimationFrame(() => { t?.focus(); t?.setSelectionRange(ini + e.length, ini + e.length); });
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-line bg-white p-2 focus-within:border-navy">
      <textarea ref={area} value={valor} onChange={(e) => setValor(e.target.value)} maxLength={2000} rows={3} placeholder={placeholder} aria-label={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) aoEnviar(); }}
        className="resize-y rounded-xl px-3 py-2 text-[15px] leading-relaxed outline-none" />
      {emojis && (
        <div role="group" aria-label="Emojis" className="grid grid-cols-8 gap-1 rounded-xl bg-soft p-2 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => inserir(e)} aria-label={`Inserir ${e}`}
              className="flex h-10 cursor-pointer items-center justify-center rounded-lg text-[22px] hover:bg-white">{e}</button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setEmojis((v) => !v)} aria-expanded={emojis} aria-label="Emojis"
          className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[22px] ${emojis ? "bg-navy/10" : "hover:bg-soft"}`}>😊</button>
        <div className="flex gap-2">
          {aoCancelar && <button type="button" onClick={aoCancelar} className="min-h-11 cursor-pointer rounded-full px-4 text-[14px] font-semibold text-muted hover:bg-soft">Cancelar</button>}
          <button type="button" onClick={aoEnviar} disabled={pend || !valor.trim()}
            className="min-h-11 cursor-pointer rounded-full bg-brand-strong px-5 text-[14px] font-bold text-white hover:bg-brand-deep disabled:opacity-50">
            {pend ? "Enviando…" : rotulo}
          </button>
        </div>
      </div>
    </div>
  );
}

function Forum({ questaoId, aoMudarTotal }: { questaoId: string; aoMudarTotal: (n: number) => void }) {
  const [itens, setItens] = useState<Comentario[] | null>(null);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState("");
  const [pend, start] = useTransition();

  async function recarregar() {
    const r = await carregarComentarios(questaoId);
    if ("erro" in r) return setErro(r.erro === "plus" ? "Os comentários fazem parte do Questões Plus." : r.erro);
    setItens(r.itens);
    aoMudarTotal(r.itens.filter((c) => !c.apagado).length);
  }
  // carrega uma vez ao abrir (o componente é montado de novo para outra questão)
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { void recarregar(); }, [questaoId]);

  function publicar() {
    setErro("");
    start(async () => {
      const r = await comentarQuestao(questaoId, null, novo);
      if ("erro" in r) return setErro(r.erro);
      setNovo("");
      await recarregar();
    });
  }

  const principais = (itens ?? []).filter((c) => !c.pai_id).reverse();
  const respostas = (id: number) => (itens ?? []).filter((c) => c.pai_id === id);

  return (
    <section aria-label="Comentários da questão" className="flex flex-col gap-4 rounded-[20px] border border-line bg-soft p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[18px] font-extrabold text-navy">Comentários</h3>
        <span className="hidden text-[13px] text-muted sm:inline">Seja gentil e ajude quem está estudando ✈️</span>
      </div>
      <Editor valor={novo} setValor={setNovo} placeholder="Escreva um comentário ou tire sua dúvida…" rotulo="Publicar" aoEnviar={publicar} pend={pend} />
      {erro && <p role="alert" className="text-[14px] font-semibold text-brand-deep">{erro}</p>}
      {itens === null ? (
        <p className="text-[14px] text-muted">Carregando comentários…</p>
      ) : !principais.length ? (
        <p className="rounded-xl bg-white px-4 py-5 text-center text-[15px] text-ink-2">Ainda não há comentários. Comece a conversa! 💬</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {principais.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
              <ItemComentario c={c} questaoId={questaoId} recarregar={recarregar} podeResponder />
              {respostas(c.id).length > 0 && (
                <ul className="ml-4 flex flex-col gap-3 border-l-2 border-[#e3e6ee] pl-4 md:ml-12">
                  {respostas(c.id).map((r) => <li key={r.id}><ItemComentario c={r} questaoId={questaoId} recarregar={recarregar} /></li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemComentario({ c, questaoId, recarregar, podeResponder }: { c: Comentario; questaoId: string; recarregar: () => Promise<void>; podeResponder?: boolean }) {
  const [resp, setResp] = useState(false);
  const [txtResp, setTxtResp] = useState("");
  const [editando, setEditando] = useState(false);
  const [txtEdit, setTxtEdit] = useState(c.texto);
  const [curti, setCurti] = useState(c.curti);
  const [curtidas, setCurtidas] = useState(c.curtidas);
  const [apagar, setApagar] = useState(false);
  const [erro, setErro] = useState("");
  const [pend, start] = useTransition();

  const rodar = (f: () => Promise<{ erro?: string } | object>, depois?: () => void) => {
    setErro("");
    start(async () => {
      const r = await f();
      if ("erro" in r && r.erro) return setErro(r.erro === "plus" ? "Recurso do Questões Plus." : r.erro);
      depois?.();
      await recarregar();
    });
  };

  function curtir() {
    const novo = !curti;
    setCurti(novo); setCurtidas((n) => n + (novo ? 1 : -1));
    start(async () => {
      const r = await curtirComentario(c.id);
      if ("erro" in r) { setCurti(!novo); setCurtidas((n) => n - (novo ? 1 : -1)); }
    });
  }

  return (
    <article className="flex gap-3">
      {c.equipe
        ? <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-strong text-[18px] text-white">✈</span>
        : <AvatarAluno src={c.foto} nome={c.autor} tamanho={40} />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <strong className="font-display text-[15px] text-navy">{c.autor}</strong>
          {c.equipe && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-deep">EQUIPE</span>}
          <span className="text-[13px] text-muted">{haQuanto(c.criado)}{c.editado ? " · editado" : ""}</span>
        </div>
        {c.apagado ? (
          <p className="text-[15px] text-muted italic">Comentário apagado pelo autor.</p>
        ) : editando ? (
          <Editor valor={txtEdit} setValor={setTxtEdit} placeholder="Editar comentário" rotulo="Salvar" pend={pend} autoFocus
            aoCancelar={() => { setEditando(false); setTxtEdit(c.texto); }}
            aoEnviar={() => rodar(() => editarComentario(c.id, txtEdit), () => setEditando(false))} />
        ) : (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-navy">{c.texto}</p>
        )}
        {!c.apagado && !editando && (
          <div className="-ml-2 flex flex-wrap items-center gap-1 text-[13px] font-semibold">
            <button type="button" onClick={curtir} aria-pressed={curti} className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full px-2 ${curti ? "text-brand-strong" : "text-muted hover:text-navy"}`}>
              <span aria-hidden="true">{curti ? "❤️" : "🤍"}</span>Curtir{curtidas ? ` · ${curtidas}` : ""}
            </button>
            {podeResponder && <button type="button" onClick={() => setResp((v) => !v)} className="min-h-9 cursor-pointer rounded-full px-2 text-muted hover:text-navy">Responder</button>}
            {c.meu && <button type="button" onClick={() => setEditando(true)} className="min-h-9 cursor-pointer rounded-full px-2 text-muted hover:text-navy">Editar</button>}
            {c.meu && (apagar ? (
              <span className="inline-flex items-center gap-1">
                <button type="button" onClick={() => rodar(() => apagarComentario(c.id))} className="min-h-9 cursor-pointer rounded-full px-2 text-brand-deep">Confirmar exclusão</button>
                <button type="button" onClick={() => setApagar(false)} className="min-h-9 cursor-pointer rounded-full px-2 text-muted">Cancelar</button>
              </span>
            ) : <button type="button" onClick={() => setApagar(true)} className="min-h-9 cursor-pointer rounded-full px-2 text-muted hover:text-brand-deep">Apagar</button>)}
          </div>
        )}
        {erro && <p role="alert" className="text-[13px] font-semibold text-brand-deep">{erro}</p>}
        {resp && (
          <div className="mt-1">
            <Editor valor={txtResp} setValor={setTxtResp} placeholder={`Responder ${c.autor}…`} rotulo="Responder" pend={pend} autoFocus
              aoCancelar={() => setResp(false)}
              aoEnviar={() => rodar(() => comentarQuestao(questaoId, c.id, txtResp), () => { setTxtResp(""); setResp(false); })} />
          </div>
        )}
      </div>
    </article>
  );
}
