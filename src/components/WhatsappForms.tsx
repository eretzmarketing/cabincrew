"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { criarAvisoPersonalizado, enviarWhatsappManual, reenviarWhatsapp, salvarConexaoWhatsapp, salvarModeloWhatsapp } from "@/app/whatsapp-actions";

const campo = "w-full rounded-xl border border-[#c9cedb] bg-white px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-navy";
const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-navy px-5 font-semibold text-white hover:bg-navy-deep disabled:opacity-50";

function Aviso({ s }: { s: { ok?: boolean; msg?: string; erro?: string } }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

type Gatilhos = Record<string, string>;

function CamposPersonalizado({ id, titulo, gatilho, gatilhos }: { id: string; titulo?: string; gatilho?: string; gatilhos: Gatilhos }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor={`ti-${id}`} className="text-[14px] font-semibold">Nome do aviso</label>
        <input id={`ti-${id}`} name="titulo" defaultValue={titulo} maxLength={60} placeholder="Ex.: Dica do comandante" className={`${campo} py-2.5`} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`ga-${id}`} className="text-[14px] font-semibold">Quando enviar</label>
        <select id={`ga-${id}`} name="gatilho" defaultValue={gatilho ?? ""} className={`${campo} py-2.5`}>
          {!gatilho && <option value="" disabled>Escolha o momento…</option>}
          {Object.entries(gatilhos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
    </div>
  );
}

export function NovoAvisoForm({ gatilhos }: { gatilhos: Gatilhos }) {
  const [s, acao, pend] = useActionState(async (a: Parameters<typeof criarAvisoPersonalizado>[0], f: FormData) => {
    const r = await criarAvisoPersonalizado(a, f);
    if (r.ok) form.current?.reset();
    return r;
  }, {});
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={acao} className="flex flex-col gap-3">
      <CamposPersonalizado id="novo" gatilhos={gatilhos} />
      <div className="flex flex-col gap-1">
        <label htmlFor="t-novo" className="text-[14px] font-semibold">Mensagem</label>
        <textarea id="t-novo" name="texto" rows={6} maxLength={3000} className={campo}
          placeholder={"Oi, {nome}! 👨‍✈️ Dica do comandante: …\n👉 {link}/head-hunter"} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="ativo" defaultChecked className="h-5 w-5 accent-[#c8102e]" /> Enviar automaticamente
        </label>
        <button className={btn} disabled={pend}>{pend ? "Criando…" : "Criar aviso"}</button>
      </div>
      <Aviso s={s} />
    </form>
  );
}

export function ModeloWhatsappForm({ evento, texto, ativo, personalizado, titulo, gatilho, gatilhos }: {
  evento: string; texto: string; ativo: boolean; personalizado?: boolean; titulo?: string; gatilho?: string | null; gatilhos?: Gatilhos;
}) {
  const [s, acao, pend] = useActionState(salvarModeloWhatsapp, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="evento" value={evento} />
      {personalizado && gatilhos && <CamposPersonalizado id={evento} titulo={titulo} gatilho={gatilho ?? undefined} gatilhos={gatilhos} />}
      <label className="sr-only" htmlFor={`t-${evento}`}>Texto da mensagem</label>
      <textarea id={`t-${evento}`} name="texto" defaultValue={texto} rows={7} maxLength={3000} className={campo} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
          <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-[#c8102e]" /> Enviar automaticamente
        </label>
        <button className={btn} disabled={pend}>{pend ? "Salvando…" : "Salvar"}</button>
      </div>
      <Aviso s={s} />
    </form>
  );
}

export function EnviarWhatsappForm({ alunoId, textoInicial = "", rotulo = "Enviar pelo WhatsApp" }: { alunoId?: string; textoInicial?: string; rotulo?: string }) {
  const [s, acao, pend] = useActionState(enviarWhatsappManual, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      {alunoId ? <input type="hidden" name="aluno_id" value={alunoId} /> : (
        <div className="flex flex-col gap-1">
          <label htmlFor="telefone" className="text-[14px] font-semibold">Número (com DDI e DDD)</label>
          <input id="telefone" name="telefone" inputMode="tel" placeholder="5511999999999" className={campo} />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor={`msg-${alunoId ?? "teste"}`} className="text-[14px] font-semibold">Mensagem</label>
        <textarea id={`msg-${alunoId ?? "teste"}`} name="texto" defaultValue={textoInicial} rows={5} maxLength={3000} className={campo} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#25d366] px-5 font-semibold text-[#0b3d20] hover:brightness-95 disabled:opacity-50" disabled={pend}>{pend ? "Enviando…" : rotulo}</button>
        <span className="text-[13px] text-muted">Pode usar {"{nome}"} para o primeiro nome.</span>
      </div>
      <Aviso s={s} />
    </form>
  );
}

export function ConexaoWhatsappForm({ instancia, tokenFinal, conectado, doPainel }: { instancia: string; tokenFinal: string; conectado: boolean; doPainel: boolean }) {
  const [s, acao, pend] = useActionState(salvarConexaoWhatsapp, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="instancia" className="text-[14px] font-semibold">Instance ID</label>
          <input id="instancia" name="instancia" defaultValue={instancia} autoComplete="off" spellCheck={false} placeholder="ex.: 882AEB1F4E32" className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="token" className="text-[14px] font-semibold">Access Token</label>
          <input id="token" name="token" type="password" autoComplete="new-password" spellCheck={false}
            placeholder={conectado ? `atual termina em …${tokenFinal} (deixe em branco para manter)` : "cole o token do Wawp"} className={campo} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button name="acao" value="salvar" className={btn} disabled={pend}>{pend ? "Testando…" : conectado ? "Salvar e testar" : "Conectar"}</button>
        {doPainel && <button name="acao" value="desconectar" className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line px-5 font-semibold text-navy hover:border-navy" disabled={pend}>Desconectar</button>}
        <span className="text-[13px] text-muted">Os dados ficam só no servidor do site. O token nunca aparece aqui de novo.</span>
      </div>
      <Aviso s={s} />
    </form>
  );
}

/* ---------- Histórico: ver a mensagem completa e reenviar ---------- */
function Janela({ aberta, fechar, titulo, children }: { aberta: boolean; fechar: () => void; titulo: string; children: React.ReactNode }) {
  if (!aberta) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/50 p-4" onClick={fechar}
      onKeyDown={(e) => e.key === "Escape" && fechar()}>
      <div className="flex max-h-[85vh] w-full max-w-[520px] flex-col gap-4 overflow-auto rounded-[22px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-extrabold">{titulo}</h3>
          <button type="button" autoFocus onClick={fechar} aria-label="Fechar" className="-mt-1 -mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl text-ink-2 hover:bg-[#eceef3]">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const bolha = "rounded-xl rounded-tr-sm bg-[#d9fdd3] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-[#111b21] shadow-sm";
const icone = "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line text-navy hover:border-navy hover:bg-soft disabled:cursor-not-allowed disabled:opacity-30";

export function AcoesEnvio({ id, nome, telefone, texto }: { id: number; nome: string; telefone: string | null; texto: string | null }) {
  const [ver, setVer] = useState(false);
  const [reenviar, setReenviar] = useState(false);
  const [res, setRes] = useState<{ msg?: string; erro?: string }>({});
  const [pend, iniciar] = useTransition();
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" className={icone} onClick={() => setVer(true)} disabled={!texto} aria-label={`Ver a mensagem enviada para ${nome}`} title="Ver mensagem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>
      <button type="button" className={icone} onClick={() => { setRes({}); setReenviar(true); }} disabled={!texto || !telefone} aria-label={`Reenviar para ${nome}`} title="Reenviar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
      </button>
      <Janela aberta={ver} fechar={() => setVer(false)} titulo={`Mensagem para ${nome}`}>
        <span className="text-[14px] text-muted">{telefone}</span>
        <div className="rounded-2xl bg-[#efeae2] p-4"><div className={bolha}>{texto}</div></div>
      </Janela>
      <Janela aberta={reenviar} fechar={() => setReenviar(false)} titulo="Reenviar este aviso?">
        <p className="text-[15px] text-ink-2">A mesma mensagem vai de novo para <strong className="text-navy">{nome}</strong> ({telefone}).</p>
        <div className="rounded-2xl bg-[#efeae2] p-4"><div className={`${bolha} line-clamp-6`}>{texto}</div></div>
        {res.erro && <p role="alert" className="rounded-xl bg-brand-soft px-4 py-2.5 text-[14px] text-brand-deep">{res.erro}</p>}
        {res.msg && <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-2.5 text-[14px] text-[#0f6b3a]">{res.msg}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setReenviar(false)} className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line px-5 font-semibold text-navy">{res.msg ? "Fechar" : "Cancelar"}</button>
          {!res.msg && (
            <button type="button" disabled={pend} onClick={() => iniciar(async () => setRes(await reenviarWhatsapp(id)))}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[#25d366] px-5 font-semibold text-[#0b3d20] hover:brightness-95 disabled:opacity-50">
              {pend ? "Enviando…" : "↻ Reenviar agora"}
            </button>
          )}
        </div>
      </Janela>
    </div>
  );
}
