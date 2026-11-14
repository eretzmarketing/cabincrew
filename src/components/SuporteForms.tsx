"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { abrirChamado, enviarContato, responderChamado, salvarConfigSuporte } from "@/app/suporte-actions";
import { CampoTelefone } from "@/components/TelefoneInternacional";

type Estado = { ok?: boolean; msg?: string; erro?: string };
const campo = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[16px] font-normal text-navy placeholder:text-[#8a90a2]";
const rot = "flex flex-col gap-2 text-sm font-semibold text-navy";
const botao = "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60";

type Acao = (antes: Estado, form: FormData) => Promise<Estado>;

/** Envia o formulário sem apagar o que a pessoa digitou quando volta um erro (o React limpa os campos por padrão). */
function useEnvio(acao: Acao) {
  const [s, despachar, pend] = useActionState(acao, {});
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => despachar(fd));
  };
  return [s, enviar, pend] as const;
}

function Aviso({ s }: { s: Estado }) {
  if (s.erro) return <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-[15px] text-brand-deep">{s.erro}</p>;
  if (s.msg) return <p role="status" className="rounded-xl bg-[#e5f6ec] px-4 py-3 text-[15px] text-[#0f6b3a]">{s.msg}</p>;
  return null;
}

function Contador({ name, max, linhas = 7, placeholder, obrigatorio = true, valor, setValor }: { name: string; max: number; linhas?: number; placeholder?: string; obrigatorio?: boolean; valor: string; setValor: (v: string) => void }) {
  return (
    <>
      <textarea name={name} required={obrigatorio} maxLength={max} rows={linhas} value={valor} onChange={(e) => setValor(e.target.value)} placeholder={placeholder}
        className={`${campo} py-3 leading-relaxed`} />
      <span className="self-end text-[13px] font-normal text-muted">{valor.length}/{max}</span>
    </>
  );
}

/** Escolha de anexos (até 3 arquivos: imagem ou PDF, 5 MB cada). */
function Anexos() {
  const ref = useRef<HTMLInputElement>(null);
  const [nomes, setNomes] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  function mudou() {
    const fs = Array.from(ref.current?.files ?? []);
    let e = "";
    if (fs.length > 3) e = "Escolha no máximo 3 arquivos.";
    else if (fs.some((f) => f.size > 5 * 1024 * 1024)) e = "Cada arquivo pode ter até 5 MB.";
    else if (fs.reduce((t, f) => t + f.size, 0) > 8 * 1024 * 1024) e = "Os arquivos juntos podem ter até 8 MB.";
    if (e && ref.current) ref.current.value = "";
    setErro(e);
    setNomes(e ? [] : fs.map((f) => f.name));
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-navy">Anexos <span className="font-normal text-muted">(opcional: prints ou PDF, até 3 arquivos de 5 MB)</span></span>
      <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#c9cedb] bg-white px-4 py-4 text-center text-[15px] text-ink-2 hover:border-navy">
        <span aria-hidden="true" className="text-xl">📎</span>
        {nomes.length ? <span className="font-semibold text-navy">{nomes.join(", ")}</span> : <span>Clique para escolher os arquivos</span>}
        <span className="text-[13px] text-muted">PNG, JPG ou PDF</span>
        <input ref={ref} type="file" name="anexos" multiple accept="image/png,image/jpeg,image/webp,application/pdf" onChange={mudou} className="sr-only" />
      </label>
      {erro && <p role="alert" className="text-[14px] text-brand-deep">{erro}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ contato (sem login) */

export function ContatoForm() {
  const [s, enviar, pend] = useEnvio(enviarContato);
  const [msg, setMsg] = useState("");
  if (s.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-[#e5f6ec] px-6 py-10 text-center text-[#0f6b3a]">
        <span className="text-4xl" aria-hidden="true">✈️</span>
        <strong className="font-display text-xl">Mensagem enviada!</strong>
        <p className="max-w-[420px] text-[15px]">{s.msg}</p>
      </div>
    );
  }
  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={rot}>Nome<input name="nome" required maxLength={120} autoComplete="name" className={campo} /></label>
        <label className={rot}>E-mail<input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="voce@email.com" className={campo} /></label>
      </div>
      <CampoTelefone />
      <label className={rot}>Assunto<input name="assunto" required maxLength={150} className={campo} placeholder="Sobre o que você quer falar?" /></label>
      <label className={rot}>Mensagem
        <Contador name="mensagem" max={5000} valor={msg} setValor={setMsg} placeholder="Escreva sua mensagem…" />
      </label>
      {/* campo escondido contra robôs */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Site<input name="site" tabIndex={-1} autoComplete="off" /></label></div>
      <Aviso s={s} />
      <div><button disabled={pend} className={botao}>{pend ? "Enviando…" : "Enviar mensagem"}</button></div>
    </form>
  );
}

/* ------------------------------------------------------------------ chamados */

export function NovoChamadoForm({ departamentos }: { departamentos: Record<string, string> }) {
  const [s, enviar, pend] = useEnvio(abrirChamado);
  const [msg, setMsg] = useState("");
  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <label className={rot}>Assunto<input name="assunto" required minLength={3} maxLength={150} placeholder="Resumo do problema" className={campo} /></label>
      <label className={rot}>Departamento
        <select name="departamento" required defaultValue="" className={`${campo} cursor-pointer`}>
          <option value="" disabled>Selecione o departamento</option>
          {Object.entries(departamentos).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
        </select>
      </label>
      <label className={rot}>Descrição
        <Contador name="mensagem" max={5000} valor={msg} setValor={setMsg} placeholder="Descreva o problema ou a dúvida com detalhes: em que página, o que você fez e o que apareceu." />
      </label>
      <Anexos />
      <Aviso s={s} />
      <div><button disabled={pend} className={botao}>{pend ? "Enviando…" : "Enviar chamado"}</button></div>
    </form>
  );
}

export function ResponderForm({ ticket, equipe = false, fechado = false }: { ticket: number; equipe?: boolean; fechado?: boolean }) {
  const [msg, setMsg] = useState("");
  const [chave, setChave] = useState(0);
  const [s, enviar, pend] = useEnvio(async (antes, fd) => {
    const r = await responderChamado(antes, fd);
    if (r.ok) { setMsg(""); setChave((k) => k + 1); }
    return r;
  });
  return (
    <form key={chave} onSubmit={enviar} className="flex flex-col gap-4">
      <input type="hidden" name="ticket" value={ticket} />
      <label className={rot}>{equipe ? "Sua resposta" : fechado ? "Escrever de novo (o chamado será reaberto)" : "Responder"}
        <Contador name="mensagem" max={5000} linhas={5} valor={msg} setValor={setMsg} placeholder={equipe ? "Escreva a resposta para o aluno…" : "Escreva sua mensagem…"} />
      </label>
      <Anexos />
      {equipe && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" name="fechar" className="h-5 w-5 accent-brand-strong" />
          Fechar o chamado depois de responder
        </label>
      )}
      <Aviso s={s} />
      <div><button disabled={pend} className={botao}>{pend ? "Enviando…" : equipe ? "Enviar resposta" : "Enviar"}</button></div>
    </form>
  );
}

/* ------------------------------------------------------------------ configuração (admin) */

export function ConfigSuporteForm({ host, porta, usuario, temSenha, emailDestino, whatsapps }: {
  host: string; porta: number; usuario: string; temSenha: boolean; emailDestino: string; whatsapps: string[];
}) {
  const [s, enviar, pend] = useEnvio(salvarConfigSuporte);
  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-display text-lg font-bold">Quem recebe as cópias</legend>
        <label className={rot}>E-mail que recebe os contatos e chamados
          <input name="emailDestino" type="email" defaultValue={emailDestino} className={campo} />
        </label>
        <label className={rot}>WhatsApps da equipe <span className="font-normal text-muted">(um por linha, com DDD; até 5)</span>
          <textarea name="whatsapps" rows={3} defaultValue={whatsapps.join("\n")} placeholder={"11 91234-5678\n11 5229-0303"} className={`${campo} py-3`} />
        </label>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-display text-lg font-bold">Servidor de e-mail (SMTP)</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <label className={rot}>Servidor de saída<input name="host" defaultValue={host} placeholder="smtp.hostinger.com" className={campo} /></label>
          <label className={rot}>Porta<input name="porta" type="number" defaultValue={porta} className={campo} /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rot}>Usuário (e-mail completo)<input name="usuario" type="email" defaultValue={usuario} placeholder="hello@cabincrew.com.br" autoComplete="off" className={campo} /></label>
          <label className={rot}>Senha do e-mail {temSenha && <span className="font-normal text-muted">(já salva: deixe em branco para manter)</span>}
            <input name="senha" type="password" autoComplete="new-password" placeholder={temSenha ? "••••••••" : ""} className={campo} />
          </label>
        </div>
      </fieldset>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="testar" defaultChecked className="h-5 w-5 accent-brand-strong" />
        Enviar um teste para o e-mail e os WhatsApps depois de salvar
      </label>
      <Aviso s={s} />
      <div><button disabled={pend} className={botao}>{pend ? "Conferindo…" : "Salvar"}</button></div>
    </form>
  );
}
