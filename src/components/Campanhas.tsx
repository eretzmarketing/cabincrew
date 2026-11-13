"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { criarCampanha, enviarProximo, mudarStatusCampanha, salvarTemplate, type Contagem } from "@/app/campanhas-actions";
import { INTERVALOS, duracaoEstimada, type Destinatario } from "@/lib/campanhas";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 text-[15px] outline-none focus:border-navy";
const btnNavy = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40";
const btnVerde = "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-[#25d366] px-6 font-display font-bold text-[#0b3d20] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40";

function Aviso({ s }: { s: { msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

/** Bolha no estilo WhatsApp para pré-visualizar a mensagem. */
export function Previa({ texto, imagem, nome = "Ana" }: { texto: string; imagem?: string | null; nome?: string }) {
  return (
    <div className="rounded-2xl bg-[#e7ddd3] p-4">
      <div className="ml-auto max-w-[320px] overflow-hidden rounded-xl rounded-tr-sm bg-[#d9fdd3] shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- prévia simples de imagem recém-enviada */}
        {imagem && <img src={`/midia/${imagem}`} alt="Imagem da campanha" className="block max-h-[320px] w-full object-cover" />}
        <p className="px-3 py-2 text-[14px] leading-snug whitespace-pre-wrap text-[#111b21]">{texto.replace(/\{nome\}/g, nome).replace(/\{link\}/g, "https://cabincrew.com.br") || "Sua mensagem aparece aqui."}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- modelo */
export function TemplateForm({ t }: { t?: { id: number; nome: string; texto: string; imagem: string | null } }) {
  const [s, acao, pend] = useActionState(salvarTemplate, {});
  const [texto, setTexto] = useState(t?.texto ?? "");
  const [imagem, setImagem] = useState<string | null>(t?.imagem ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erroImg, setErroImg] = useState("");
  const arquivo = useRef<HTMLInputElement>(null);

  const subir = async (f: File) => {
    setErroImg("");
    if (f.size > 10 * 1024 * 1024) { setErroImg("Imagem grande demais (máximo 10 MB)."); return; }
    setEnviando(true);
    try {
      const r = await fetch("/admin/midia/enviar-whatsapp", { method: "POST", body: f });
      const j = await r.json();
      if (!r.ok) setErroImg(j.erro ?? "Falha no envio."); else setImagem(j.caminho);
    } catch { setErroImg("Falha no envio. Tente de novo."); }
    setEnviando(false);
    if (arquivo.current) arquivo.current.value = "";
  };

  return (
    <form action={acao} className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        {t && <input type="hidden" name="id" value={t.id} />}
        <input type="hidden" name="imagem" value={imagem ?? ""} />
        <div className="flex flex-col gap-1">
          <label htmlFor={`n-${t?.id ?? "novo"}`} className="text-[14px] font-semibold">Nome do modelo</label>
          <input id={`n-${t?.id ?? "novo"}`} name="nome" defaultValue={t?.nome} placeholder="Ex.: Black Friday 2026" className={`${campo} min-h-12`} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`t-${t?.id ?? "novo"}`} className="text-[14px] font-semibold">Mensagem</label>
          <textarea id={`t-${t?.id ?? "novo"}`} name="texto" rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={3000} className={`${campo} py-3 leading-relaxed`}
            placeholder={"Olá, {nome}! ✈️\n\nÉ Black Friday na Cabin Crew: o Head Hunter com 50% de desconto até domingo.\n👉 cabincrew.com.br"} />
          <span className={`text-[13px] ${imagem && texto.length > 1024 ? "font-semibold text-brand-deep" : "text-muted"}`}>
            {texto.length} caracteres{imagem ? " · com imagem, o limite é 1.024" : ""} · use {"{nome}"} para o primeiro nome e {"{link}"} para o endereço do site
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold">Imagem (opcional)</span>
          <div className="flex flex-wrap items-center gap-3">
            <label className={`${btnNavy} ${enviando ? "opacity-50" : ""}`}>
              {enviando ? "Enviando…" : imagem ? "Trocar imagem" : "Anexar imagem"}
              <input ref={arquivo} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={enviando} onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
            </label>
            {imagem && <button type="button" onClick={() => setImagem(null)} className="min-h-11 cursor-pointer px-3 font-semibold text-brand-deep underline underline-offset-4">Remover imagem</button>}
            <span className="text-[13px] text-muted">JPG, PNG ou WebP até 10 MB. Ideal: vertical, 1080 × 1350.</span>
          </div>
          {erroImg && <p role="alert" className="text-[14px] font-semibold text-brand-deep">{erroImg}</p>}
        </div>
        <Aviso s={s} />
        <button className={`${btnNavy} self-start`} disabled={pend || enviando}>{pend ? "Salvando…" : t ? "Salvar alterações" : "Criar modelo"}</button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold">Prévia</span>
        <Previa texto={texto} imagem={imagem} />
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- seleção de público */
export function SelecaoPublico({ fonte, pessoas, templates }: {
  fonte: "alunos" | "interessados";
  pessoas: Destinatario[];
  templates: { id: number; nome: string; texto: string; imagem: string | null }[];
}) {
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [s, acao, pend] = useActionState(criarCampanha, {});
  const [tpl, setTpl] = useState<number | "">(templates[0]?.id ?? "");
  const [intervalo, setIntervalo] = useState("30-60");
  const comWhats = useMemo(() => pessoas.filter((p) => p.telefone), [pessoas]);
  const todos = comWhats.length > 0 && comWhats.every((p) => marcados.has(p.id));
  const sel = pessoas.filter((p) => marcados.has(p.id));
  const t = templates.find((x) => x.id === tpl);
  const iv = INTERVALOS.find((x) => x.id === intervalo)!;

  const alternar = (id: string) => setMarcados((m) => { const n = new Set(m); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const baixarCsv = () => {
    const linhas = [["Nome", "WhatsApp", "E-mail", "Escola", "Cadastro"], ...sel.map((p) => [p.nome, p.telefone ?? "", p.email ?? "", p.escola ?? "", new Date(p.cadastro).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })])];
    const csv = "﻿" + linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `selecao-${fonte}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-[#c8102e]" checked={todos}
            onChange={() => setMarcados(todos ? new Set() : new Set(comWhats.map((p) => p.id)))} />
          Selecionar todos ({comWhats.length} com WhatsApp)
        </label>
        <span className="text-[15px]"><strong>{sel.length}</strong> selecionado(s)</span>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="sticky top-0 z-10 border-b border-line bg-white text-[13px] text-muted">
            <tr><th className="w-12 p-3"><span className="sr-only">Selecionar</span></th><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">WhatsApp</th><th className="p-3 font-semibold">{fonte === "alunos" ? "Escola" : "País"}</th><th className="p-3 font-semibold">Cadastro</th><th className="p-3 font-semibold">Situação</th></tr>
          </thead>
          <tbody>
            {pessoas.map((p) => (
              <tr key={p.id} className={`border-b border-[#eceef3] last:border-0 ${marcados.has(p.id) ? "bg-[#f3fbf6]" : ""}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Selecionar ${p.nome}`} className="h-5 w-5 accent-[#c8102e]" disabled={!p.telefone} checked={marcados.has(p.id)} onChange={() => alternar(p.id)} /></td>
                <td className="p-3 font-semibold">{p.nome}<span className="block text-[13px] font-normal text-muted">{p.email}</span></td>
                <td className="p-3 whitespace-nowrap">{p.telefone ?? <span className="text-muted">sem WhatsApp</span>}</td>
                <td className="p-3">{p.escola ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{new Date(p.cadastro).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
                <td className="p-3 text-[13px] text-muted">{p.detalhe}</td>
              </tr>
            ))}
            {!pessoas.length && <tr><td colSpan={6} className="p-6 text-center text-ink-2">Ninguém encontrado com esses filtros.</td></tr>}
          </tbody>
        </table>
      </div>

      {sel.length > 0 && (
        <section aria-labelledby="enviar-titulo" className="flex flex-col gap-4 rounded-[22px] border-2 border-[#25d366] bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="enviar-titulo" className="font-display text-xl font-extrabold">Enviar para {sel.length} pessoa{sel.length > 1 ? "s" : ""}</h2>
            <button type="button" onClick={baixarCsv} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-navy px-5 font-semibold text-navy hover:bg-soft">⬇ Exportar seleção (CSV)</button>
          </div>
          {!templates.length ? (
            <p className="text-[15px] text-ink-2">Crie um modelo de mensagem primeiro em <Link href="/admin/campanhas/modelos" className="font-semibold underline">Modelos</Link>.</p>
          ) : (
            <form action={acao} className="grid gap-5 lg:grid-cols-[1fr_340px]">
              <div className="flex flex-col gap-4">
                <input type="hidden" name="fonte" value={fonte} />
                <input type="hidden" name="ids" value={JSON.stringify(sel.map((p) => p.id))} />
                <div className="flex flex-col gap-1">
                  <label htmlFor="tpl" className="text-[14px] font-semibold">Modelo da mensagem</label>
                  <select id="tpl" name="template_id" value={tpl} onChange={(e) => setTpl(Number(e.target.value))} className={`${campo} min-h-12`}>
                    {templates.map((x) => <option key={x.id} value={x.id}>{x.nome}{x.imagem ? " (com imagem)" : ""}</option>)}
                  </select>
                </div>
                {sel.length > 1 && (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="pb-1 text-[14px] font-semibold">Intervalo entre as mensagens</legend>
                    {INTERVALOS.map((x) => (
                      <label key={x.id} className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px]">
                        <input type="radio" name="intervalo" value={x.id} checked={intervalo === x.id} onChange={() => setIntervalo(x.id)} className="h-5 w-5 accent-[#c8102e]" />
                        {x.rotulo}
                      </label>
                    ))}
                    <span className="text-[13px] text-muted">O tempo varia ao acaso dentro da faixa, o que parece mais natural. Duração estimada: <strong>{duracaoEstimada(sel.length, iv.min, iv.max)}</strong>.</span>
                  </fieldset>
                )}
                {sel.length <= 1 && <input type="hidden" name="intervalo" value="30-60" />}
                <p className="rounded-xl bg-[#fff8e6] px-4 py-3 text-[14px] text-[#7a5a00]">
                  Para evitar bloqueio: prefira intervalos maiores, mande só para quem conhece a Cabin Crew e evite disparar para milhares de números no mesmo dia. A página da campanha precisa ficar aberta enquanto envia.
                </p>
                <Aviso s={s} />
                <button className={`${btnVerde} self-start`} disabled={pend}>{pend ? "Preparando…" : "Criar campanha e abrir o envio"}</button>
              </div>
              {t && <div className="flex flex-col gap-2"><span className="text-[14px] font-semibold">Prévia</span><Previa texto={t.texto} imagem={t.imagem} nome={sel[0]?.nome.split(" ")[0]} /></div>}
            </form>
          )}
        </section>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- envio */
export function CampanhaEnvio({ id, statusInicial, contagemInicial }: { id: number; statusInicial: string; contagemInicial: Contagem }) {
  const [status, setStatus] = useState(statusInicial);
  const [cont, setCont] = useState(contagemInicial);
  const [espera, setEspera] = useState(0);
  const [ultimos, setUltimos] = useState<string[]>([]);
  const [msgErro, setMsgErro] = useState("");
  const router = useRouter();
  const ativo = useRef(false);

  useEffect(() => {
    if (status !== "enviando") { ativo.current = false; return; }
    ativo.current = true;
    let timer: number | undefined;
    const passo = async () => {
      if (!ativo.current) return;
      const r: Awaited<ReturnType<typeof enviarProximo>> = await enviarProximo(id).catch(() => ({ estado: "erro" as const, aguardar: 30, erro: "Sem conexão com o site." }));
      if (!ativo.current) return;
      if (r.contagem) setCont(r.contagem);
      if (r.ultimo) setUltimos((u) => [r.ultimo!, ...u].slice(0, 8));
      if (r.estado === "fim") { setStatus("concluida"); router.refresh(); return; }
      if (r.estado === "parada") { setStatus("pausada"); return; }
      setMsgErro(r.estado === "erro" ? (r.erro ?? "Erro") : "");
      let s = r.aguardar;
      setEspera(s);
      const tic = () => {
        if (!ativo.current) return;
        s -= 1; setEspera(Math.max(0, s));
        if (s <= 0) passo(); else timer = window.setTimeout(tic, 1000);
      };
      timer = window.setTimeout(tic, 1000);
    };
    passo();
    return () => { ativo.current = false; window.clearTimeout(timer); };
  }, [status, id, router]);

  // avisa antes de fechar a página no meio do envio
  useEffect(() => {
    if (status !== "enviando") return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [status]);

  const mudar = async (s: "enviando" | "pausada" | "cancelada") => {
    if (s === "cancelada" && !confirm("Cancelar a campanha? As mensagens que faltam não serão enviadas.")) return;
    await mudarStatusCampanha(id, s);
    setStatus(s);
    router.refresh();
  };

  const feitos = cont.enviada + cont.erro + cont.sem_whatsapp;
  const pct = cont.total ? Math.round((feitos / cont.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="h-4 overflow-hidden rounded-full bg-[#e3e6ee]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do envio">
        <div className="h-full rounded-full bg-[#25d366] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[15px]" aria-live="polite">
        <span><strong>{feitos}</strong> de {cont.total} ({pct}%)</span>
        <span className="text-[#0f6b3a]">✓ {cont.enviada} enviadas</span>
        {cont.sem_whatsapp > 0 && <span className="text-[#7a5a00]">{cont.sem_whatsapp} sem WhatsApp</span>}
        {cont.erro > 0 && <span className="text-brand-deep">{cont.erro} com erro</span>}
        {status === "enviando" && cont.pendente > 0 && <span className="text-muted">próxima em {espera}s</span>}
      </div>
      {msgErro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{msgErro} Tentando de novo…</p>}
      <div className="flex flex-wrap gap-2">
        {status === "pausada" && <button type="button" onClick={() => mudar("enviando")} className={btnVerde}>{feitos ? "▶ Continuar envio" : "▶ Começar envio"}</button>}
        {status === "enviando" && <button type="button" onClick={() => mudar("pausada")} className={btnNavy}>⏸ Pausar</button>}
        {(status === "enviando" || status === "pausada") && <button type="button" onClick={() => mudar("cancelada")} className="min-h-11 cursor-pointer rounded-full border-2 border-brand-line px-5 font-semibold text-brand-deep">Cancelar campanha</button>}
      </div>
      {status === "enviando" && <p className="text-[14px] text-muted">Mantenha esta página aberta. Se fechar, a campanha pausa e continua de onde parou quando você voltar e clicar em Continuar.</p>}
      {ultimos.length > 0 && (
        <ul className="flex flex-col gap-1 text-[14px] text-ink-2">
          {ultimos.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      )}
    </div>
  );
}
