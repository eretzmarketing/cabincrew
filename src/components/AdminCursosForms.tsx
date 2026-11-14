"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";
import { criarCurso, salvarAulaIdioma, salvarInfoCurso, salvarModuloIdioma, salvarVendaCurso } from "@/app/cursos-actions";

const input = "min-h-12 w-full rounded-xl border border-[#c9cedb] bg-white px-3.5 text-[15px] font-normal text-navy placeholder:text-muted";
const area = "w-full rounded-xl border border-[#c9cedb] bg-white p-3.5 text-[15px] leading-relaxed font-normal text-navy placeholder:text-muted";
const label = "flex flex-col gap-2 text-sm font-semibold";
const dica = "text-[13px] font-normal text-muted";

function Aviso({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role={state.erro ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${state.erro ? "bg-brand-soft text-brand-deep" : "bg-[#e5f6ec] text-[#0f6b3a]"}`}>
      {state.erro ?? state.msg}
    </p>
  );
}

function Salvar({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 cursor-pointer rounded-full bg-brand-strong px-7 font-display font-bold text-white hover:bg-brand-deep disabled:opacity-60">
      {pending ? "Salvando…" : children}
    </button>
  );
}

/** Imagem: prévia + envio para a galeria de Mídia (pasta "Cursos"). Grava o endereço no campo `name`. */
export function CampoImagem({ name, inicial, rotulo = "Imagem de destaque", proporcao = "aspect-[16/9]" }: { name: string; inicial: string; rotulo?: string; proporcao?: string }) {
  const [url, setUrl] = useState(inicial);
  const [estado, setEstado] = useState<{ pct?: number; erro?: string }>({});
  const arquivo = useRef<HTMLInputElement>(null);

  function enviar(f: File) {
    setEstado({ pct: 0 });
    const x = new XMLHttpRequest();
    x.open("POST", "/admin/midia/enviar");
    x.setRequestHeader("x-nome", encodeURIComponent(f.name));
    x.setRequestHeader("x-pasta", encodeURIComponent("Cursos"));
    x.setRequestHeader("content-type", f.type || "application/octet-stream");
    x.upload.onprogress = (e) => e.lengthComputable && setEstado({ pct: Math.round((e.loaded / e.total) * 100) });
    x.onload = () => {
      let r: { midia?: { arquivo: string; tipo: string }; erro?: string } = {};
      try { r = JSON.parse(x.responseText); } catch { /* resposta não-JSON */ }
      if (r.midia?.tipo === "imagem") { setUrl(`/midia/${r.midia.arquivo}`); setEstado({}); }
      else setEstado({ erro: r.midia ? "Envie uma imagem (JPG, PNG ou WebP)." : r.erro || "Não foi possível enviar." });
    };
    x.onerror = () => setEstado({ erro: "A conexão caiu durante o envio." });
    x.send(f);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{rotulo}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-end gap-4">
        <div className={`relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-line bg-soft ${proporcao}`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : <span className="absolute inset-0 flex items-center justify-center text-[14px] text-muted">Sem imagem</span>}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={arquivo} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); e.target.value = ""; }} />
          <button type="button" onClick={() => arquivo.current?.click()} disabled={estado.pct !== undefined}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-2 border-navy bg-white px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-white disabled:opacity-60">
            {estado.pct !== undefined ? `Enviando… ${estado.pct}%` : url ? "Trocar imagem" : "Enviar imagem"}
          </button>
          <span className={dica}>JPG, PNG ou WebP · ideal 1600 × 900 px</span>
        </div>
      </div>
      {estado.erro && <p role="alert" className="text-[14px] text-brand-deep">{estado.erro}</p>}
    </div>
  );
}

/* ---------- informações do curso ---------- */
export function CursoInfoForm({ slug, titulo, descricao, imagem, publicado }: { slug: string; titulo: string; descricao: string; imagem: string; publicado?: boolean }) {
  const [state, action] = useActionState(salvarInfoCurso, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />
      <label className={label}>Título do curso
        <input name="titulo" required maxLength={120} defaultValue={titulo} className={input} />
      </label>
      <label className={label}>Descrição
        <span className={dica}>Aparece no topo do curso e na página de venda. Deixe uma linha em branco para separar parágrafos.</span>
        <textarea name="descricao" rows={6} maxLength={4000} defaultValue={descricao} className={area} />
      </label>
      <CampoImagem name="imagem" inicial={imagem} />
      {publicado !== undefined && (
        <>
          <input type="hidden" name="publicado_campo" value="1" />
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px]">
            <input type="checkbox" name="publicado" defaultChecked={publicado} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong" />
            <span><strong>Curso publicado</strong><span className="block text-[13px] text-muted">Desmarcado, o curso fica em rascunho: só você vê. Para vender, ligue também “À venda” em Preço e venda.</span></span>
          </label>
        </>
      )}
      <Aviso state={state} />
      <div><Salvar>Salvar informações</Salvar></div>
    </form>
  );
}

/* ---------- módulo de curso de idioma ---------- */
export function ModuloIdiomaForm({ curso, m }: { curso: string; m: { numero: number; titulo: string; tituloEn: string; resumo: string; foto: string } }) {
  const [state, action] = useActionState(salvarModuloIdioma, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="curso" value={curso} />
      <input type="hidden" name="modulo" value={m.numero} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>Título (português)<input name="titulo" required maxLength={120} defaultValue={m.titulo} className={input} /></label>
        <label className={label}>Título no idioma do curso<input name="tituloEn" maxLength={120} defaultValue={m.tituloEn} className={input} /></label>
      </div>
      <label className={label}>Resumo<textarea name="resumo" rows={2} maxLength={600} defaultValue={m.resumo} className={area} /></label>
      <CampoImagem name="foto" inicial={m.foto} rotulo="Foto do módulo" />
      <Aviso state={state} />
      <div><Salvar>Salvar módulo</Salvar></div>
    </form>
  );
}

/* ---------- aula de curso de idioma ---------- */
export type AulaEditavel = {
  curso: string; modulo: number; numero: number;
  titulo: string; tituloEn: string; objetivo: string; foto: string; fotoAlt: string; minutos: number; intro: string; dica: string;
  dialogoTitulo: string; dialogoContexto: string; falas: string; vocabulario: string; expressoes: string; quiz: string; atividades: string;
};

function Bloco({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 md:p-6">
      <legend className="sr-only">{titulo}</legend>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-extrabold" aria-hidden="true">{titulo}</h2>
        {sub && <p className="text-[14px] text-ink-2">{sub}</p>}
      </div>
      {children}
    </fieldset>
  );
}

export function AulaIdiomaForm({ a, idioma }: { a: AulaEditavel; idioma: string }) {
  const [state, action] = useActionState(salvarAulaIdioma, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="curso" value={a.curso} />
      <input type="hidden" name="modulo" value={a.modulo} />
      <input type="hidden" name="aula" value={a.numero} />

      <Bloco titulo="Apresentação">
        <div className="grid gap-4 md:grid-cols-2">
          <label className={label}>Título (português)<input name="titulo" required maxLength={160} defaultValue={a.titulo} className={input} /></label>
          <label className={label}>Título em {idioma}<input name="tituloEn" maxLength={160} defaultValue={a.tituloEn} className={input} /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_160px]">
          <label className={label}>Objetivo<input name="objetivo" maxLength={600} defaultValue={a.objetivo} className={input} /></label>
          <label className={label}>Duração (min)<input name="minutos" type="number" min={1} max={600} required defaultValue={a.minutos} className={input} /></label>
        </div>
        <label className={label}>Introdução<textarea name="intro" rows={4} maxLength={4000} defaultValue={a.intro} className={area} /></label>
        <CampoImagem name="foto" inicial={a.foto} rotulo="Foto da aula" />
        <label className={label}>Descrição da foto <span className={dica}>Para quem usa leitor de tela. Ex.: “Comissária servindo café no corredor”.</span>
          <input name="fotoAlt" maxLength={200} defaultValue={a.fotoAlt} className={input} />
        </label>
      </Bloco>

      <Bloco titulo="Diálogo" sub={`Uma fala por linha: Quem | fala em ${idioma} | tradução. Se mudar o diálogo, gere o áudio da aula de novo.`}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={label}>Título do diálogo<input name="dialogoTitulo" maxLength={160} defaultValue={a.dialogoTitulo} className={input} /></label>
          <label className={label}>Contexto<input name="dialogoContexto" maxLength={600} defaultValue={a.dialogoContexto} className={input} /></label>
        </div>
        <label className={label}>Falas
          <textarea name="falas" rows={10} defaultValue={a.falas} spellCheck={false} placeholder="Ana | Good morning, everyone. | Bom dia a todos." className={`${area} font-mono text-[14px]`} />
        </label>
      </Bloco>

      <Bloco titulo="Vocabulário e expressões">
        <label className={label}>Vocabulário <span className={dica}>Uma palavra por linha: palavra | tradução</span>
          <textarea name="vocabulario" rows={7} defaultValue={a.vocabulario} spellCheck={false} placeholder="galley | cozinha do avião" className={`${area} font-mono text-[14px]`} />
        </label>
        <label className={label}>Expressões <span className={dica}>Uma por linha: expressão | tradução | quando usar (opcional)</span>
          <textarea name="expressoes" rows={6} defaultValue={a.expressoes} spellCheck={false} className={`${area} font-mono text-[14px]`} />
        </label>
        <label className={label}>Dica <span className={dica}>Opcional, aparece em destaque na aula.</span>
          <textarea name="dica" rows={2} maxLength={1500} defaultValue={a.dica} className={area} />
        </label>
      </Bloco>

      <Bloco titulo="Quiz" sub="O aluno precisa de 70% no quiz para liberar a próxima aula.">
        <label className={label}>Perguntas
          <span className={dica}>Pergunta na primeira linha · <strong>*</strong> antes da certa · <strong>-</strong> antes das erradas · <strong>=</strong> antes da explicação · uma linha em branco entre as perguntas.</span>
          <textarea name="quiz" rows={14} defaultValue={a.quiz} spellCheck={false} placeholder={"Como se diz “bom dia”?\n* Good morning\n- Good night\n= Good morning vale até o meio-dia."} className={`${area} font-mono text-[14px]`} />
        </label>
      </Bloco>

      <details className="rounded-[20px] border border-line bg-white p-5 md:p-6">
        <summary className="min-h-11 cursor-pointer py-2 font-display text-lg font-extrabold">Atividades (avançado)</summary>
        <p className="pb-3 text-[14px] text-ink-2">Ditado, ordenar, ligar, lacunas, falar e role-play, no formato técnico. Mude só os textos entre aspas; se algo der errado, o site avisa e não salva.</p>
        <textarea name="atividades" rows={18} defaultValue={a.atividades} spellCheck={false} aria-label="Atividades (formato técnico)" className={`${area} font-mono text-[13px]`} />
      </details>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_-8px_24px_-18px_rgba(35,42,61,.5)] backdrop-blur">
        <Aviso state={state} />
        <div><Salvar>Salvar aula</Salvar></div>
      </div>
    </form>
  );
}

/* ---------- preço e venda ---------- */
type Venda = { preco: number; desconto_pix: number; dias: number; ativo: boolean; topicos: string[] };

function CamposVenda({ p, mostrarAtivo = true }: { p: Venda | null; mostrarAtivo?: boolean }) {
  const [preco, setPreco] = useState(p ? String(p.preco).replace(".", ",") : "");
  const [desc, setDesc] = useState(p ? String(p.desconto_pix).replace(".", ",") : "5");
  const n = Number(preco.replace(/\./g, "").replace(",", ".")) || 0;
  const d = Number(desc.replace(",", ".")) || 0;
  const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>Preço (R$)<input name="preco" inputMode="decimal" required value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="197,00" className={input} /></label>
        <label className={label}>Desconto no Pix (%)<input name="desconto_pix" inputMode="decimal" value={desc} onChange={(e) => setDesc(e.target.value)} className={input} /></label>
        <label className={label}>Dias de acesso depois de concluir<input name="dias" type="number" min={0} max={3650} defaultValue={p?.dias ?? 30} className={input} /></label>
      </div>
      <p className="rounded-xl bg-soft px-4 py-3 text-[15px]">No checkout: <strong>{reais(n)}</strong> no cartão (até 12x) · <strong className="text-[#0f6b3a]">{reais(Math.round(n * (100 - d)) / 100)}</strong> no Pix</p>
      <label className={label}>O que o aluno recebe <span className={dica}>Um item por linha. Aparece na página Planos e na página do curso.</span>
        <textarea name="topicos" rows={4} defaultValue={(p?.topicos ?? []).join("\n")} placeholder={"12 aulas em vídeo\nApostila em PDF\nCertificado de conclusão"} className={area} />
      </label>
      {mostrarAtivo && (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px]">
          <input type="checkbox" name="ativo" defaultChecked={p?.ativo ?? false} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong" />
          <span><strong>À venda</strong><span className="block text-[13px] text-muted">Aparece na página Planos e pode ser comprado pelo Mercado Pago.</span></span>
        </label>
      )}
    </>
  );
}

export function VendaCursoForm({ slug, p }: { slug: string; p: Venda | null }) {
  const [state, action] = useActionState(salvarVendaCurso, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <CamposVenda p={p} />
      <Aviso state={state} />
      <div><Salvar>Salvar preço</Salvar></div>
    </form>
  );
}

/* ---------- criar curso ---------- */
export function CriarCursoForm() {
  const [state, action] = useActionState(criarCurso, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      <label className={label}>Nome do curso
        <input name="titulo" required minLength={3} maxLength={120} placeholder="Ex.: Primeiros Socorros para Comissários" className={input} />
      </label>
      <label className={label}>Descrição
        <span className={dica}>Aparece no topo do curso e na página de venda. Deixe uma linha em branco para separar parágrafos.</span>
        <textarea name="descricao" rows={5} maxLength={4000} className={area} />
      </label>
      <CampoImagem name="imagem" inicial="" />
      <h2 className="pt-2 font-display text-xl font-extrabold">Preço</h2>
      <CamposVenda p={null} mostrarAtivo={false} />
      <p className="rounded-xl bg-[#e7efff] px-4 py-3 text-[14px] text-[#1d3f8f]">O curso começa como <strong>rascunho e fora de venda</strong>. Depois de criar, monte os módulos e as aulas; quando estiver pronto, publique e coloque à venda.</p>
      <Aviso state={state} />
      <div><Salvar>Criar curso</Salvar></div>
    </form>
  );
}
