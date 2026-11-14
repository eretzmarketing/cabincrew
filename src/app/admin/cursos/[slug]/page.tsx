import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excluirAula, excluirModulo } from "@/app/crew-actions";
import {
  alternarAulaHH, alternarIdioma, alternarModuloHH, alternarTreinoHH, excluirIdioma, moverAulaHH, moverIdioma, moverModuloHH,
  novaAulaIdioma, novoModuloIdioma, restaurarIdioma, excluirCurso,
} from "@/app/cursos-actions";
import { Titulo, btnSecundario } from "@/components/admin-ui";
import { ModuloForm } from "@/components/admin-forms";
import { CursoInfoForm, ModuloIdiomaForm, VendaCursoForm } from "@/components/AdminCursosForms";
import NovaAulaBotao from "@/components/NovaAulaBotao";
import { TIPO_AULA, duracao, numeroModulo, type Aula, type Modulo } from "@/lib/crew";
import { CURSOS_IDIOMA } from "@/lib/cursos-idioma";
import { cursoIdioma, infoCurso } from "@/lib/cursos-dados";
import { ehProdutoIdioma } from "@/lib/idioma-conteudo";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Curso" };
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ peças */

const mini = "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-navy hover:border-navy disabled:cursor-default disabled:opacity-35";
const miniLink = `${mini} no-underline`;

function Acao({ action, campos, children, rotulo, desativado }: {
  action: (f: FormData) => Promise<void>; campos: Record<string, string | number>; children: React.ReactNode; rotulo: string; desativado?: boolean;
}) {
  return (
    <form action={action}>
      {Object.entries(campos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={mini} aria-label={rotulo} title={rotulo} disabled={desativado}>{children}</button>
    </form>
  );
}

function Selo({ cor, children }: { cor: "verde" | "cinza" | "laranja" | "azul" | "rosa"; children: React.ReactNode }) {
  const c = { verde: "bg-[#e5f6ec] text-[#0f6b3a]", cinza: "bg-[#eceef3] text-ink-2", laranja: "bg-[#fff3e0] text-[#8a4b00]", azul: "bg-[#e7efff] text-[#1d4ed8]", rosa: "bg-brand-soft text-brand-deep" }[cor];
  return <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${c}`}>{children}</span>;
}

function Excluir({ action, campos, texto }: { action: (f: FormData) => Promise<void>; campos: Record<string, string | number>; texto: string }) {
  return (
    <details className="group relative">
      <summary className={`${mini} list-none text-brand-deep hover:border-brand-deep`} title="Excluir">🗑 <span className="sr-only">Excluir</span></summary>
      <form action={action} className="absolute right-0 z-20 mt-2 flex w-[290px] flex-col gap-2 rounded-2xl border border-line bg-white p-4 text-[14px] shadow-lg">
        {Object.entries(campos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <span>{texto}</span>
        <button className="min-h-10 cursor-pointer rounded-full bg-brand-deep px-4 font-semibold text-white">Sim, excluir</button>
      </form>
    </details>
  );
}

function ModuloCaixa({ id, numero, titulo, sub, selos, aberto, barra, children }: {
  id: string; numero: string; titulo: string; sub: string; selos: React.ReactNode; aberto?: boolean; barra: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <details id={id} open={aberto} className="group scroll-mt-6 rounded-[20px] border border-line bg-white open:border-[#c9cedb]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 md:px-5">
        <span className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-[#eceef3] px-2 font-display text-[14px] font-extrabold text-navy">{numero}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <strong className="font-display text-[17px] leading-snug">{titulo}</strong>
          <span className="text-[13px] text-muted">{sub}</span>
        </span>
        <span className="hidden flex-wrap justify-end gap-1.5 sm:flex">{selos}</span>
        <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="flex flex-col gap-3 border-t border-line px-4 pt-3 pb-4 md:px-5">
        <div className="flex flex-wrap items-center gap-1.5 sm:hidden">{selos}</div>
        <div className="flex flex-wrap items-start gap-1.5">{barra}</div>
        {children}
      </div>
    </details>
  );
}

function LinhaAula({ titulo, sub, selos, acoes, apagada }: { titulo: string; sub: string; selos?: React.ReactNode; acoes: React.ReactNode; apagada?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
      <span className={`flex min-w-[200px] flex-1 flex-col ${apagada ? "opacity-55" : ""}`}>
        <span className="font-semibold leading-snug">{titulo}</span>
        <span className="text-[13px] text-muted">{sub}</span>
      </span>
      <span className="flex flex-wrap gap-1.5">{selos}</span>
      <span className="flex flex-wrap items-start gap-1.5">{acoes}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ página */

export default async function CursoAdmin({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ editar?: string; erro?: string; criado?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const info = await infoCurso(slug);
  if (!info) notFound();
  const { supabase } = await getUser();
  const { data: prod } = await supabase.from("produtos").select("slug, preco, desconto_pix, dias_apos_conclusao, ativo, topicos").eq("slug", slug).maybeSingle();
  const comModulos = info.tipo !== "idioma";

  return (
    <>
      <Link href="/admin/cursos" className="text-sm font-semibold text-muted hover:text-navy">← Todos os cursos</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Titulo sub={info.tipo === "padrao" && !info.publicado ? "Rascunho: os alunos ainda não veem este curso. Monte os módulos e aulas e depois publique em Informações do curso." : "Mudanças valem na hora para os alunos."}>{info.titulo}</Titulo>
        <div className="flex flex-wrap gap-2">
          {ehProdutoIdioma(slug) && <Link href={`/admin/cursos/${slug}/audios`} className={btnSecundario}>🎧 Áudios e andamento</Link>}
          {comModulos && <Link href="/admin/head-hunter/simulados" className={btnSecundario}>Simulados das aulas</Link>}
          {slug === "head-hunter" && <Link href="/admin/head-hunter/dinamicas" className={btnSecundario}>Dinâmicas</Link>}
          <Link href={info.endereco} target="_blank" className={btnSecundario}>Ver como aluno ↗</Link>
        </div>
      </div>
      {sp.erro === "sql" && <p role="alert" className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0058_cursos_admin.sql</strong> no Supabase para editar os cursos.</p>}
      {sp.criado && <p role="status" className="rounded-2xl bg-[#e5f6ec] px-5 py-4 font-semibold text-[#0f6b3a]">Curso criado ✓ Agora adicione os módulos e as aulas. Ele começa como rascunho: quando estiver pronto, marque “Curso publicado” em Informações do curso.</p>}

      <details open className="group rounded-[22px] border border-line bg-white">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 md:px-6">
          <span className="flex flex-col">
            <strong className="font-display text-xl font-extrabold">Informações do curso</strong>
            <span className="text-[14px] text-muted">Título, descrição e imagem de destaque</span>
          </span>
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-90">›</span>
        </summary>
        <div className="border-t border-line px-5 pt-5 pb-6 md:px-6">
          <CursoInfoForm slug={slug} titulo={info.titulo} descricao={info.descricao} imagem={info.imagem} publicado={info.tipo === "padrao" ? info.publicado : undefined} />
        </div>
      </details>

      <details className="group rounded-[22px] border border-line bg-white">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 md:px-6">
          <span className="flex flex-col">
            <strong className="font-display text-xl font-extrabold">Preço e venda</strong>
            <span className="text-[14px] text-muted">{prod ? `${Number(prod.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${prod.ativo ? "à venda" : "fora de venda"}` : "Sem preço cadastrado"}</span>
          </span>
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-90">›</span>
        </summary>
        <div className="border-t border-line px-5 pt-5 pb-6 md:px-6">
          <VendaCursoForm slug={slug} p={prod ? { preco: Number(prod.preco), desconto_pix: Number(prod.desconto_pix), dias: prod.dias_apos_conclusao ?? 30, ativo: !!prod.ativo, topicos: (prod.topicos ?? []) as string[] } : null} />
          <p className="pt-3 text-[13px] text-muted">Combos com este curso ficam em <Link href="/admin/produtos" className="font-semibold underline underline-offset-4">Planos e preços</Link>.</p>
        </div>
      </details>

      {comModulos ? <ConteudoModulos curso={slug} hh={slug === "head-hunter"} editar={sp.editar} /> : <ConteudoIdioma curso={slug as "english" | "spanish"} editar={sp.editar} />}

      {info.tipo === "padrao" && (
        <details className="rounded-[20px] border border-line bg-white px-5 py-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-brand-deep">Excluir este curso</summary>
          <form action={excluirCurso} className="flex flex-col gap-3 pb-3">
            <input type="hidden" name="slug" value={slug} />
            <p className="text-[15px] text-ink-2">Apaga o curso, todos os módulos e aulas dele e o progresso dos alunos. Ele sai da venda; compras e certificados já emitidos continuam registrados. Não dá para desfazer. Para só tirar do ar, desmarque “Curso publicado”.</p>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Digite EXCLUIR para confirmar
              <input name="confirmacao" required autoComplete="off" className="min-h-11 max-w-[240px] rounded-xl border border-[#c9cedb] px-3 text-[15px] font-normal" />
            </label>
            <button className="min-h-11 cursor-pointer self-start rounded-full bg-brand-deep px-5 font-semibold text-white">Excluir curso</button>
          </form>
        </details>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ Head Hunter */

async function ConteudoModulos({ curso, hh, editar }: { curso: string; hh: boolean; editar?: string }) {
  const { supabase } = await getUser();
  const [{ data: mods }, { data: auls }] = await Promise.all([
    supabase.from("modulos").select("*").eq("curso", curso).order("ordem").order("id"),
    supabase.from("aulas").select("*").eq("curso", curso).order("ordem").order("titulo"),
  ]);
  const modulos = (mods ?? []) as Modulo[];
  const aulas = (auls ?? []) as Aula[];
  const temTreino = hh && modulos.some((m) => "treino_pos_curso" in m);
  const proximaOrdem = modulos.length ? Math.max(...modulos.map((m) => m.ordem)) + 1 : hh ? 0 : 1;

  return (
    <section aria-labelledby="conteudo" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="conteudo" className="font-display text-2xl font-extrabold">Módulos e aulas</h2>
        <span className="text-[14px] text-muted">{modulos.length} módulos · {aulas.length} aulas</span>
      </div>
      {modulos.map((m, i) => {
        const daqui = aulas.filter((a) => a.modulo_id === m.id);
        const proxima = daqui.length ? Math.max(...daqui.map((a) => a.ordem)) + 1 : 1;
        return (
          <ModuloCaixa key={m.id} id={`m-${m.id}`} numero={numeroModulo(m.ordem)} titulo={m.titulo} aberto={editar === String(m.id)}
            sub={`${daqui.length} ${daqui.length === 1 ? "aula" : "aulas"}${m.fase ? ` · ${m.fase}` : ""}`}
            selos={<>
              {!m.publicado && <Selo cor="cinza">Oculto</Selo>}
              {m.treino_pos_curso && <Selo cor="azul">Treino pós-curso</Selo>}
              {hh && m.recurso === "anac" && <Selo cor="rosa">Simulados ANAC</Selo>}
            </>}
            barra={<>
              <Acao action={moverModuloHH} campos={{ id: m.id, dir: "cima" }} rotulo="Subir módulo" desativado={i === 0}>↑</Acao>
              <Acao action={moverModuloHH} campos={{ id: m.id, dir: "baixo" }} rotulo="Descer módulo" desativado={i === modulos.length - 1}>↓</Acao>
              <Acao action={alternarModuloHH} campos={{ id: m.id }} rotulo={m.publicado ? "Ocultar módulo dos alunos" : "Mostrar módulo para os alunos"}>{m.publicado ? "🙈 Ocultar" : "👁 Mostrar"}</Acao>
              {temTreino && <Acao action={alternarTreinoHH} campos={{ id: m.id }} rotulo={m.treino_pos_curso ? "Tirar de treino pós-curso" : "Marcar como treino pós-curso"}>{m.treino_pos_curso ? "🏋️ Tirar de treino" : "🏋️ Marcar como treino"}</Acao>}
              <details className="w-full sm:w-auto [&[open]]:w-full">
                <summary className={`${mini} list-none`}>✏️ Editar módulo</summary>
                <div className="mt-3 rounded-2xl bg-soft p-4"><ModuloForm m={m} curso={curso} treino={hh} /></div>
              </details>
              <Excluir action={excluirModulo} campos={{ id: m.id }} texto={`Excluir o módulo “${m.titulo}”, as ${daqui.length} aulas dele e o progresso dos alunos nessas aulas? Não dá para desfazer. Se quiser só tirar do ar, use Ocultar.`} />
            </>}>
            {daqui.length > 0 ? (
              <ol className="flex flex-col divide-y divide-[#eceef3]">
                {daqui.map((a, k) => (
                  <LinhaAula key={a.id} apagada={!a.publicado} titulo={a.titulo}
                    sub={`${TIPO_AULA[a.tipo]}${a.duracao_min ? ` · ${duracao(a.duracao_min)}` : ""}`}
                    selos={!a.publicado ? <Selo cor="laranja">Oculta</Selo> : undefined}
                    acoes={<>
                      <Acao action={moverAulaHH} campos={{ id: a.id, dir: "cima" }} rotulo="Subir aula" desativado={k === 0}>↑</Acao>
                      <Acao action={moverAulaHH} campos={{ id: a.id, dir: "baixo" }} rotulo="Descer aula" desativado={k === daqui.length - 1}>↓</Acao>
                      <Acao action={alternarAulaHH} campos={{ id: a.id }} rotulo={a.publicado ? "Ocultar aula dos alunos" : "Mostrar aula para os alunos"}>{a.publicado ? "🙈 Ocultar" : "👁 Mostrar"}</Acao>
                      <Link href={`/admin/cursos/${curso}/aula/${a.id}`} className={miniLink}>✏️ Editar</Link>
                      <Excluir action={excluirAula} campos={{ id: a.id, modulo_id: m.id }} texto={`Excluir a aula “${a.titulo}” e o progresso dos alunos nela? Não dá para desfazer.`} />
                    </>} />
                ))}
              </ol>
            ) : <p className="text-[15px] text-ink-2">Nenhuma aula ainda. Os alunos veem este módulo como “Em breve”.</p>}
            <NovaAulaBotao href={`/admin/cursos/${curso}/aula/nova?modulo=${m.id}&ordem=${proxima}`} />
          </ModuloCaixa>
        );
      })}
      <details className="group rounded-[20px] border-2 border-dashed border-[#c9cedb] bg-white open:border-solid open:border-navy">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-display text-lg font-extrabold text-navy">
          <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition-transform group-open:rotate-45">+</span>
          Adicionar módulo
        </summary>
        <div className="px-5 pb-5"><ModuloForm proximaOrdem={proximaOrdem} curso={curso} treino={hh} /></div>
      </details>
    </section>
  );
}

/* ------------------------------------------------------------------ English e Spanish */

async function ConteudoIdioma({ curso, editar }: { curso: "english" | "spanish"; editar?: string }) {
  const { supabase } = await getUser();
  const [c, { data: linhas, error }] = await Promise.all([
    cursoIdioma(curso, true),
    supabase.from("idioma_conteudo").select("modulo, aula").eq("curso", curso).eq("excluido", true),
  ]);
  const original = CURSOS_IDIOMA[curso];
  const excluidos = ((linhas ?? []) as { modulo: number; aula: number }[]).map((l) => {
    const m = original.modulos.find((x) => x.numero === l.modulo);
    const a = l.aula ? m?.aulas.find((x) => x.numero === l.aula) : null;
    return { ...l, nome: l.aula ? `Aula ${l.modulo}.${l.aula} · ${a?.titulo ?? ""}` : `Módulo ${l.modulo} · ${m?.titulo ?? ""}` };
  });
  const alvo = (modulo: number, aula?: number) => ({ curso, modulo, ...(aula ? { aula } : {}) });

  return (
    <section aria-labelledby="conteudo" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="conteudo" className="font-display text-2xl font-extrabold">Módulos e aulas</h2>
        <span className="text-[14px] text-muted">{c.modulos.length} módulos · {c.todas.length} aulas visíveis</span>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-brand-soft p-5 text-brand-deep">Rode o SQL <strong>0058_cursos_admin.sql</strong> no Supabase para editar este curso.</p>}
      <p className="text-[14px] text-ink-2">As aulas abrem em sequência para o aluno: cada uma libera a próxima quando ele tira 70% no quiz.</p>
      {c.modulos.map((m, i) => (
        <ModuloCaixa key={m.numero} id={`m-${m.numero}`} numero={String(m.numero)} titulo={m.titulo} aberto={editar === String(m.numero)}
          sub={`${m.aulas.length} ${m.aulas.length === 1 ? "aula" : "aulas"}${m.tituloEn ? ` · ${m.tituloEn}` : ""}`}
          selos={<>
            {m.oculto && <Selo cor="cinza">Oculto</Selo>}
            {m.novo && <Selo cor="azul">Novo</Selo>}
            {m.editado && <Selo cor="laranja">Editado</Selo>}
          </>}
          barra={<>
            <Acao action={moverIdioma} campos={{ ...alvo(m.numero), dir: "cima" }} rotulo="Subir módulo" desativado={i === 0}>↑</Acao>
            <Acao action={moverIdioma} campos={{ ...alvo(m.numero), dir: "baixo" }} rotulo="Descer módulo" desativado={i === c.modulos.length - 1}>↓</Acao>
            <Acao action={alternarIdioma} campos={alvo(m.numero)} rotulo={m.oculto ? "Mostrar módulo para os alunos" : "Ocultar módulo dos alunos"}>{m.oculto ? "👁 Mostrar" : "🙈 Ocultar"}</Acao>
            <details open={editar === String(m.numero)} className="w-full sm:w-auto [&[open]]:w-full">
              <summary className={`${mini} list-none`}>✏️ Editar módulo</summary>
              <div className="mt-3 rounded-2xl bg-soft p-4"><ModuloIdiomaForm curso={curso} m={m} /></div>
            </details>
            <Excluir action={excluirIdioma} campos={alvo(m.numero)} texto={m.novo ? `Excluir o módulo “${m.titulo}” e as aulas criadas nele?` : `Excluir o módulo “${m.titulo}”? Ele sai do curso para os alunos. Dá para restaurar depois, no fim desta página.`} />
          </>}>
          {m.aulas.length > 0 ? (
            <ol className="flex flex-col divide-y divide-[#eceef3]">
              {m.aulas.map((a, k) => (
                <LinhaAula key={a.numero} apagada={a.oculto || m.oculto} titulo={a.titulo}
                  sub={`Aula ${a.modulo}.${a.numero} · ${a.minutos} min${a.tituloEn ? ` · ${a.tituloEn}` : ""}`}
                  selos={<>
                    {a.oculto && <Selo cor="laranja">Oculta</Selo>}
                    {a.novo && <Selo cor="azul">Nova</Selo>}
                    {a.editado && <Selo cor="cinza">Editada</Selo>}
                  </>}
                  acoes={<>
                    <Acao action={moverIdioma} campos={{ ...alvo(m.numero, a.numero), dir: "cima" }} rotulo="Subir aula" desativado={k === 0}>↑</Acao>
                    <Acao action={moverIdioma} campos={{ ...alvo(m.numero, a.numero), dir: "baixo" }} rotulo="Descer aula" desativado={k === m.aulas.length - 1}>↓</Acao>
                    <Acao action={alternarIdioma} campos={alvo(m.numero, a.numero)} rotulo={a.oculto ? "Mostrar aula para os alunos" : "Ocultar aula dos alunos"}>{a.oculto ? "👁 Mostrar" : "🙈 Ocultar"}</Acao>
                    <Link href={`/admin/cursos/${curso}/aula/${a.modulo}.${a.numero}`} className={miniLink}>✏️ Editar</Link>
                    <Excluir action={excluirIdioma} campos={alvo(m.numero, a.numero)} texto={a.novo ? `Excluir a aula “${a.titulo}”? Não dá para desfazer.` : `Excluir a aula “${a.titulo}”? Ela sai do curso para os alunos. Dá para restaurar depois, no fim desta página.`} />
                  </>} />
              ))}
            </ol>
          ) : <p className="text-[15px] text-ink-2">Nenhuma aula ainda. Os alunos veem este módulo como “Em breve”.</p>}
          <form action={novaAulaIdioma} className="self-start">
            <input type="hidden" name="curso" value={curso} />
            <input type="hidden" name="modulo" value={m.numero} />
            <button className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[#c9cedb] px-5 text-[14px] font-semibold text-navy hover:border-navy">+ Adicionar aula</button>
          </form>
        </ModuloCaixa>
      ))}
      <form action={novoModuloIdioma}>
        <input type="hidden" name="curso" value={curso} />
        <button className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[20px] border-2 border-dashed border-[#c9cedb] bg-white px-5 font-display text-lg font-extrabold text-navy hover:border-navy">
          <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">+</span>
          Adicionar módulo
        </button>
      </form>
      {excluidos.length > 0 && (
        <details className="rounded-[20px] border border-line bg-white px-5 py-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink-2">Excluídos ({excluidos.length}) · restaurar</summary>
          <ul className="flex flex-col divide-y divide-[#eceef3]">
            {excluidos.map((x) => (
              <li key={`${x.modulo}.${x.aula}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-[15px]">{x.nome}</span>
                <form action={restaurarIdioma}>
                  <input type="hidden" name="curso" value={curso} />
                  <input type="hidden" name="modulo" value={x.modulo} />
                  {x.aula > 0 && <input type="hidden" name="aula" value={x.aula} />}
                  <button className={mini}>↩ Restaurar</button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
