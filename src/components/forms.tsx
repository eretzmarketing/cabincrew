"use client";

import { CampoTelefone } from "@/components/TelefoneInternacional";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  cadastrar,
  criarSelecao,
  definirNovaSenha,
  entrar,
  entrarListaEspera,
  esqueciSenha,
  publicarRelato,
  salvarPerfil,
  type FormState,
} from "@/app/actions";
import { FASES } from "@/lib/forum";
import { ESCOLAS, ESCOLA_OUTRA } from "@/lib/escolas";

const input =
  "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] text-navy placeholder:text-muted";
const label = "flex flex-col gap-2 text-sm font-semibold";

function Aviso({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p
      role={state.erro ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-[15px] ${state.erro ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}
    >
      {state.erro ?? state.msg}
    </p>
  );
}

function Enviar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-[52px] cursor-pointer rounded-full bg-brand-strong px-7 font-display text-base font-bold text-white hover:bg-brand-deep disabled:opacity-60 ${className}`}
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}

/* ---------- Lista de espera ---------- */
export function ListaEsperaForm() {
  const [state, action] = useActionState(entrarListaEspera, undefined);
  if (state?.ok) return <Aviso state={state} />;
  return (
    <form action={action} className="mt-2 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <label htmlFor="wl-email" className="sr-only">Seu e-mail</label>
        <input id="wl-email" name="email" type="email" required placeholder="Seu melhor e-mail" className="min-h-[52px] flex-[1_1_240px] rounded-full bg-white px-5 text-base text-navy placeholder:text-muted" />
        <Enviar>Entrar na lista de espera</Enviar>
      </div>
      <Aviso state={state} />
    </form>
  );
}

/* ---------- Escola: lista + "não está na lista" ---------- */
function CampoEscola({ inicial = "" }: { inicial?: string }) {
  const naLista = !inicial || ESCOLAS.includes(inicial);
  const [sel, setSel] = useState(naLista ? inicial : "__outra");
  return (
    <div className="flex flex-col gap-3">
      <label className={label}>
        Escola de aviação
        <select name="escola" required value={sel} onChange={(e) => setSel(e.target.value)} className={input}>
          <option value="" disabled>Selecione sua escola</option>
          <option value="__outra">{ESCOLA_OUTRA}</option>
          {ESCOLAS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </label>
      {sel === "__outra" && (
        <label className={label}>
          Nome da sua escola
          <input name="escola_outra" required maxLength={120} defaultValue={naLista ? "" : inicial} placeholder="Digite o nome da escola" className={input} />
        </label>
      )}
    </div>
  );
}

/** Formata enquanto digita: (11) 98765-4321 */
/* ---------- Cadastro ---------- */
export function CadastroForm({ next }: { next: string }) {
  const [state, action] = useActionState(cadastrar, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className={label}>
        Nome completo
        <input name="nome" required maxLength={80} autoComplete="name" placeholder="Seu nome" className={input} />
      </label>
      <label className={label}>
        E-mail
        <input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" className={input} />
      </label>
      <CampoTelefone />
      <CampoEscola />
      <label className={label}>
        Crie uma senha
        <input name="senha" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" className={input} />
      </label>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-2">
        <input type="checkbox" name="aceite" required className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong" />
        <span>Li e aceito os <Link href="/termos" target="_blank" className="font-semibold text-brand-strong underline">Termos de Uso</Link>, a <Link href="/privacidade" target="_blank" className="font-semibold text-brand-strong underline">Política de Privacidade</Link> e as <Link href="/regras" target="_blank" className="font-semibold text-brand-strong underline">Regras do fórum</Link>.</span>
      </label>
      <Aviso state={state} />
      <Enviar className="w-full">Criar minha conta</Enviar>
    </form>
  );
}

/* ---------- Login ---------- */
export function EntrarForm({ next, esqueciHref = "/entrar?modo=esqueci" }: { next: string; esqueciHref?: string }) {
  const [state, action] = useActionState(entrar, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className={label}>
        E-mail
        <input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" className={input} />
      </label>
      <label className={label}>
        Senha
        <input name="senha" type="password" required autoComplete="current-password" className={input} />
      </label>
      <Link href={esqueciHref} className="self-end text-sm font-semibold">Esqueci minha senha</Link>
      <Aviso state={state} />
      <Enviar className="w-full">Entrar</Enviar>
    </form>
  );
}

/* ---------- Esqueci a senha ---------- */
export function EsqueciForm() {
  const [state, action] = useActionState(esqueciSenha, undefined);
  if (state?.ok) return <Aviso state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className={label}>
        E-mail da sua conta
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <Aviso state={state} />
      <Enviar className="w-full">Enviar link para nova senha</Enviar>
    </form>
  );
}

export function NovaSenhaForm() {
  const [state, action] = useActionState(definirNovaSenha, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className={label}>
        Nova senha
        <input name="senha" type="password" required minLength={8} autoComplete="new-password" className={input} />
      </label>
      <Aviso state={state} />
      <Enviar className="self-start">Salvar nova senha</Enviar>
    </form>
  );
}

/* ---------- Meus dados ---------- */
export function PerfilForm({ p }: { p: { apelido: string; nome: string | null; whatsapp: string | null; escola: string | null } }) {
  const [state, action] = useActionState(salvarPerfil, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className={label}>
        Nome completo
        <input name="nome" required maxLength={80} defaultValue={p.nome ?? ""} className={input} />
      </label>
      <CampoTelefone inicial={p.whatsapp} />
      <CampoEscola inicial={p.escola ?? ""} />
      <Aviso state={state} />
      <Enviar className="self-start">Salvar</Enviar>
    </form>
  );
}

/* ---------- Novo relato ---------- */
export function RelatoForm({ slug, baseSugerida, faseInicial }: { slug: string; baseSugerida: string; faseInicial: number }) {
  const [state, action] = useActionState(publicarRelato, undefined);
  const [fase, setFase] = useState(faseInicial);
  const [texto, setTexto] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col gap-7">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="fase" value={fase} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Qual fase você está relatando?</legend>
        <div className="flex flex-wrap gap-2.5">
          {FASES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={fase === f.id}
              onClick={() => setFase(f.id)}
              className={`min-h-11 cursor-pointer rounded-full border-2 px-[18px] text-sm font-semibold ${
                fase === f.id ? "border-navy bg-navy text-white" : "border-[#d5d9e3] bg-white text-navy hover:border-navy"
              }`}
            >
              {f.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-5">
        <label className={`${label} flex-[1_1_180px]`}>
          Base
          <input name="base" defaultValue={baseSugerida} maxLength={10} className={input} />
        </label>
        <label className={`${label} flex-[1_1_180px]`}>
          Data da etapa
          <input name="data_etapa" type="date" required max={hoje} className={input} />
        </label>
        <label className={`${label} flex-[1_1_180px]`}>
          Formato
          <select name="formato" className={input}>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className={`${label} flex-[1_1_220px]`}>
          Duração aproximada <span className="font-normal text-muted">(opcional)</span>
          <input name="duracao" maxLength={40} placeholder="Ex.: 1h30" className={input} />
        </label>
        <label className={`${label} flex-[1_1_220px]`}>
          Número de participantes <span className="font-normal text-muted">(opcional)</span>
          <input name="participantes" type="number" min={1} max={500} placeholder="Ex.: 10" className={input} />
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Resultado até agora</legend>
        <div className="flex flex-wrap gap-2.5">
          {[
            ["avancou", "Avancei para a próxima fase"],
            ["aguardando", "Aguardando retorno"],
            ["nao_avancou", "Não avancei"],
          ].map(([v, t]) => (
            <label key={v} className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border-2 border-[#d5d9e3] px-4 text-[15px] has-[:checked]:border-navy">
              <input type="radio" name="resultado" value={v} required className="h-[18px] w-[18px] accent-brand-strong" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={label}>
        Como foi?
        <textarea
          name="texto"
          rows={7}
          required
          minLength={40}
          maxLength={3000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Conte como a etapa aconteceu, o que você observou e uma dica para quem vem depois."
          className="resize-y rounded-xl border border-[#c9cedb] p-3.5 text-[15px] leading-relaxed font-normal"
        />
        <span className={`self-end text-xs font-normal ${texto.length > 0 && texto.length < 40 ? "text-brand-deep" : "text-muted"}`}>
          {texto.length}/3000 {texto.length < 40 && "· mínimo 40"}
        </span>
      </label>

      <div className="flex items-start gap-3 rounded-[14px] border border-brand-line bg-brand-soft px-[18px] py-4 text-sm leading-relaxed text-ink-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0002a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
        <span>
          Fale do formato e da experiência. <strong className="text-navy">Não reproduza questões dos testes</strong>: isso pode
          desclassificar você e outros candidatos, e o relato será removido.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" name="anonimo" defaultChecked className="h-5 w-5 accent-brand-strong" />
          Publicar como anônimo
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input type="checkbox" name="declaracao" required className="h-5 w-5 accent-brand-strong" />
          Confirmo que não reproduzi questões e que vivi o que relatei
        </label>
      </div>

      <Aviso state={state} />
      <div className="flex flex-wrap gap-3 border-t border-[#eceef3] pt-6">
        <Enviar>Publicar relato</Enviar>
        <a href={`/forum/${slug}`} className="inline-flex min-h-[52px] items-center px-4 text-[15px] font-semibold text-navy">Cancelar</a>
      </div>
    </form>
  );
}

/* ---------- Moderação: criar seleção ---------- */
export function CriarSelecaoForm({ companhias }: { companhias: { id: number; nome: string }[] }) {
  const [state, action] = useActionState(criarSelecao, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[1_1_160px]`}>
          Companhia
          <select name="companhia_id" required className={input}>
            {companhias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label className={`${label} flex-[1_1_120px]`}>
          Base (sigla)
          <input name="base" required maxLength={5} placeholder="GRU" className={input} />
        </label>
        <label className={`${label} flex-[1_1_160px]`}>
          Nome da base
          <input name="base_nome" placeholder="Guarulhos" className={input} />
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className={`${label} flex-[1_1_160px]`}>
          Mês do processo
          <input name="mes" type="month" required className={input} />
        </label>
        <label className={`${label} flex-[1_1_160px]`}>
          Aberto em
          <input name="aberta_em" type="date" className={input} />
        </label>
        <label className={`${label} flex-[1_1_160px]`}>
          Status
          <select name="status" className={input}>
            <option value="inscricoes">Inscrições abertas</option>
            <option value="andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
          </select>
        </label>
      </div>
      <label className={label}>
        Cargo
        <input name="cargo" defaultValue="Comissários de voo" className={input} />
      </label>
      <Enviar className="self-start">Criar seleção</Enviar>
      <Aviso state={state} />
    </form>
  );
}
