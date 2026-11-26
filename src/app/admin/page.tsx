import Link from "next/link";
import { Card, Chave, Titulo, btnSecundario } from "@/components/admin-ui";
import { BarraPartes, BarrasLista, BarrasTempo, COR, Indicador, fmtReal, type Ponto } from "@/components/PainelGraficos";
import { situacaoBackup } from "@/lib/backup";
import { getConfig } from "@/lib/config";
import { cursoIdioma, infoCursos } from "@/lib/cursos-dados";
import { ehProdutoIdioma } from "@/lib/idioma-conteudo";
import { diaSP } from "@/lib/jornada";
import { situacao } from "@/lib/painel-alunos";
import { getUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Perfil = { id: string; nome: string | null; apelido: string | null; escola: string | null; created_at: string; is_admin: boolean | null };
type Compra = { produto: string; valor: number; status: string; forma_pagamento: string | null; created_at: string; comprada_em: string | null; user_id: string | null; email: string | null };
type LinhaCurso = { id: string; feitas: number; media: number | null; ultima: string | null; total_aulas: number; acesso_status: string | null };

const DIA = 86400000;
const FORMAS: Record<string, string> = { pix: "Pix", cartao_credito: "Cartão de crédito", boleto: "Boleto", outro: "Cupom 100% / cortesia" };
const cx = "flex min-w-0 flex-col gap-4";

export default async function AdminHome() {
  const { supabase } = await getUser();
  const agora = new Date().getTime();
  const hojeSP = diaSP(new Date(agora));
  const desde60 = new Date(agora - 60 * DIA).toISOString();
  const dias30 = Array.from({ length: 30 }, (_, i) => diaSP(new Date(agora - (29 - i) * DIA)));
  const rotuloDia = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  const idadeDias = (iso: string) => Math.round((Date.parse(`${hojeSP}T12:00:00Z`) - Date.parse(`${diaSP(iso)}T12:00:00Z`)) / DIA);

  const contar = (t: string) => supabase.from(t).select("*", { count: "exact", head: true }).then((r) => r.count ?? 0);
  const [perfisR, comprasR, acessosR, progR, ingR, espR, tentR, interessados, relatos, cfg, cursos, bk] = await Promise.all([
    supabase.from("profiles").select("id, nome, apelido, escola, created_at, is_admin").limit(20000),
    supabase.from("compras").select("produto, valor, status, forma_pagamento, created_at, comprada_em, user_id, email").limit(20000),
    supabase.from("acessos").select("user_id, produto, status, compra_id").limit(50000),
    supabase.from("progresso").select("user_id, concluida_em").gte("concluida_em", desde60).limit(50000),
    supabase.from("ingles_progresso").select("user_id, updated_at, concluida").gte("updated_at", desde60).limit(50000),
    supabase.from("espanhol_progresso").select("user_id, updated_at, concluida").gte("updated_at", desde60).limit(50000),
    supabase.from("tentativas").select("user_id, nota, finalizada_em").not("finalizada_em", "is", null).gte("finalizada_em", desde60).limit(50000),
    contar("interessados"),
    contar("relatos"),
    getConfig(),
    infoCursos(),
    situacaoBackup(),
  ]);

  const perfis = ((perfisR.data ?? []) as Perfil[]).filter((p) => !p.is_admin);
  const ehAluno = new Set(perfis.map((p) => p.id));
  const nomeDe = new Map(perfis.map((p) => [p.id, p.nome || p.apelido || "Aluno"]));
  const escolaDe = new Map(perfis.map((p) => [p.id, (p.escola ?? "").trim()]));
  const nomeCurso = new Map(cursos.map((c) => [c.slug, c.titulo]));

  // ---------- cadastros ----------
  const porDia = (datas: string[]) => {
    const m = new Map<string, number>();
    for (const d of datas) m.set(diaSP(d), (m.get(diaSP(d)) ?? 0) + 1);
    return m;
  };
  const cadDia = porDia(perfis.map((p) => p.created_at));
  const novos30 = perfis.filter((p) => idadeDias(p.created_at) < 30).length;
  const novos30ant = perfis.filter((p) => { const d = idadeDias(p.created_at); return d >= 30 && d < 60; }).length;
  const novosHoje = cadDia.get(hojeSP) ?? 0;

  // ---------- atividade ----------
  const ultimaAtiv = new Map<string, string>();
  const marcar = (uid: string, quando: string | null) => {
    if (!quando || !ehAluno.has(uid)) return;
    if ((ultimaAtiv.get(uid) ?? "") < quando) ultimaAtiv.set(uid, quando);
  };
  type Prog = { user_id: string; concluida_em?: string; updated_at?: string; concluida?: boolean };
  const aulasFeitas: { uid: string; quando: string }[] = [];
  for (const r of (progR.data ?? []) as Prog[]) { marcar(r.user_id, r.concluida_em!); aulasFeitas.push({ uid: r.user_id, quando: r.concluida_em! }); }
  for (const r of [...(ingR.data ?? []), ...(espR.data ?? [])] as Prog[]) { marcar(r.user_id, r.updated_at!); if (r.concluida) aulasFeitas.push({ uid: r.user_id, quando: r.updated_at! }); }
  const tent = ((tentR.data ?? []) as { user_id: string; nota: number | null; finalizada_em: string }[]).filter((t) => ehAluno.has(t.user_id));
  for (const t of tent) marcar(t.user_id, t.finalizada_em);
  const ativos = (dias: number) => [...ultimaAtiv.values()].filter((q) => idadeDias(q) < dias).length;
  const ativos7 = ativos(7), ativos30 = ativos(30);
  const ativosDia = dias30.map((d) => new Set([...aulasFeitas.filter((a) => diaSP(a.quando) === d).map((a) => a.uid), ...tent.filter((t) => diaSP(t.finalizada_em) === d).map((t) => t.user_id)]).size);
  const aulasDia = porDia(aulasFeitas.filter((a) => ehAluno.has(a.uid)).map((a) => a.quando));

  // ---------- vendas ----------
  const compras = (comprasR.data ?? []) as Compra[];
  const quando = (c: Compra) => c.comprada_em ?? c.created_at;
  const pagas = compras.filter((c) => c.status === "aprovada" && Number(c.valor) > 0);
  const pagas30 = pagas.filter((c) => idadeDias(quando(c)) < 30);
  const pagas30ant = pagas.filter((c) => { const d = idadeDias(quando(c)); return d >= 30 && d < 60; });
  const soma = (l: Compra[]) => l.reduce((s, c) => s + Number(c.valor), 0);
  const receita30 = soma(pagas30), receita30ant = soma(pagas30ant), receitaTotal = soma(pagas);
  const vendaDia = new Map<string, number>();
  for (const c of pagas30) vendaDia.set(diaSP(quando(c)), (vendaDia.get(diaSP(quando(c))) ?? 0) + Number(c.valor));
  const agrupar = (l: Compra[], chave: (c: Compra) => string) => {
    const m = new Map<string, { valor: number; n: number }>();
    for (const c of l) { const k = chave(c); const a = m.get(k) ?? { valor: 0, n: 0 }; m.set(k, { valor: a.valor + Number(c.valor), n: a.n + 1 }); }
    return [...m.entries()].sort((a, b) => b[1].valor - a[1].valor);
  };
  const porProduto = agrupar(pagas, (c) => nomeCurso.get(c.produto) ?? c.produto);
  const porForma = agrupar(compras.filter((c) => c.status === "aprovada"), (c) => FORMAS[c.forma_pagamento ?? ""] ?? "Outro");
  const reembolsos = compras.filter((c) => c.status === "reembolsada").length;
  const escolaCompra = agrupar(pagas.filter((c) => c.user_id && escolaDe.get(c.user_id)), (c) => escolaDe.get(c.user_id!)!).slice(0, 8);

  // ---------- acessos ----------
  const acessos = ((acessosR.data ?? []) as { user_id: string; produto: string; status: string; compra_id: number | null }[]).filter((a) => ehAluno.has(a.user_id) && a.status !== "encerrado");
  const pagantes = new Set(pagas.map((c) => c.user_id).filter(Boolean) as string[]);
  const comCurso = new Set(acessos.map((a) => a.user_id));
  const cortesia = [...comCurso].filter((u) => !pagantes.has(u)).length;

  // ---------- cursos (situação de cada aluno com acesso) ----------
  const cursosVendidos = cursos.filter((c) => acessos.some((a) => a.produto === c.slug));
  const estatCursos = await Promise.all(cursosVendidos.map(async (c) => {
    const [{ data }, idioma] = await Promise.all([
      supabase.rpc("admin_acompanhamento", { p_curso: c.slug, p_busca: "" }),
      ehProdutoIdioma(c.slug) ? cursoIdioma(c.slug) : Promise.resolve(null),
    ]);
    const linhas = (data ?? []) as LinhaCurso[];
    const total = idioma ? idioma.todas.length : (linhas[0]?.total_aulas ?? 0);
    const pct = linhas.map((l) => (total ? Math.min(100, Math.round((l.feitas / total) * 100)) : 0));
    const st = { ativo: 0, esfriando: 0, parado: 0, nunca: 0 };
    for (const l of linhas) st[situacao(l)]++;
    const faixas = [0, 0, 0, 0];
    for (const p of pct) faixas[p >= 100 ? 3 : p >= 50 ? 2 : p > 0 ? 1 : 0]++;
    return { slug: c.slug, nome: c.titulo, alunos: linhas.length, total, media: pct.length ? Math.round(pct.reduce((s, v) => s + v, 0) / pct.length) : 0, st, faixas };
  }));

  // ---------- simulados ANAC ----------
  const tent30 = tent.filter((t) => idadeDias(t.finalizada_em) < 30);
  const tent30ant = tent.filter((t) => { const d = idadeDias(t.finalizada_em); return d >= 30 && d < 60; });
  const notas = tent30.map((t) => t.nota ?? 0);
  const mediaNota = notas.length ? Math.round(notas.reduce((s, v) => s + v, 0) / notas.length) : 0;
  const simDia = porDia(tent30.map((t) => t.finalizada_em));
  const faixaNota = [0, 0, 0, 0];
  for (const n of notas) faixaNota[n >= 85 ? 3 : n >= 70 ? 2 : n >= 50 ? 1 : 0]++;

  // ---------- rankings ----------
  const pontos = new Map<string, { aulas: number; sims: number; soma: number }>();
  for (const a of aulasFeitas) if (ehAluno.has(a.uid) && idadeDias(a.quando) < 30) { const p = pontos.get(a.uid) ?? { aulas: 0, sims: 0, soma: 0 }; p.aulas++; pontos.set(a.uid, p); }
  for (const t of tent30) { const p = pontos.get(t.user_id) ?? { aulas: 0, sims: 0, soma: 0 }; p.sims++; p.soma += t.nota ?? 0; pontos.set(t.user_id, p); }
  const rankAlunos = [...pontos.entries()].map(([id, p]) => ({ id, ...p, score: p.aulas + p.sims * 2 })).sort((a, b) => b.score - a.score).slice(0, 10);
  const escolasCad = new Map<string, number>();
  for (const p of perfis) { const e = (p.escola ?? "").trim(); if (e) escolasCad.set(e, (escolasCad.get(e) ?? 0) + 1); }
  const rankEscolas = [...escolasCad.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // ---------- backup ----------
  const horas = bk.configurado && bk.ultimo ? (agora - bk.ultimo.getTime()) / 3600000 : null;
  const bkOk = bk.configurado && !bk.erro && horas !== null && horas < 30;
  const serie = (m: Map<string, number>): Ponto[] => dias30.map((d) => ({ rotulo: rotuloDia(d), valor: m.get(d) ?? 0 }));
  const ultimos = [...perfis].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Titulo sub="Como estão os alunos, os cursos e as vendas. Números dos últimos 30 dias, salvo indicação.">Visão geral</Titulo>
        <span className={`rounded-full px-3 py-1.5 text-[13px] ${bkOk ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`} role="status">
          💾 {!bk.configurado ? "Backup não configurado" : !bk.ultimo ? "Backup sem arquivos ainda" : <>Backup: {bk.ultimo.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}{!bkOk && " · atenção"}</>}
        </span>
      </div>
      {cfg.manutencao && (
        <Card className="border-2 border-brand">
          <Chave chave="manutencao" ligado={cfg.manutencao} titulo="Modo manutenção ligado" descricao="O público vê só a página “Em breve”. Desligue para o site voltar ao normal." />
        </Card>
      )}

      {/* ---------- números principais ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador rotulo="Alunos cadastrados" valor={perfis.length.toLocaleString("pt-BR")} atual={novos30} anterior={novos30ant} detalhe={`+${novos30} em 30 dias · ${novosHoje} hoje`} serie={dias30.map((d) => cadDia.get(d) ?? 0)} />
        <Indicador rotulo="Alunos ativos (7 dias)" valor={ativos7} detalhe={`${ativos30} ativos em 30 dias · ${perfis.length ? Math.round((ativos7 / perfis.length) * 100) : 0}% da base`} serie={ativosDia} cor={COR.aqua} />
        <Indicador rotulo="Alunos com curso" valor={comCurso.size} detalhe={`${pagantes.size} pagantes · ${cortesia} cortesia`} />
        <Indicador rotulo="Vendas (30 dias)" valor={fmtReal(receita30)} atual={receita30} anterior={receita30ant} detalhe={`${pagas30.length} ${pagas30.length === 1 ? "venda" : "vendas"} · ${fmtReal(receitaTotal)} no total`} serie={dias30.map((d) => vendaDia.get(d) ?? 0)} cor={COR.laranja} />
        <Indicador rotulo="Ticket médio" valor={fmtReal(pagas30.length ? receita30 / pagas30.length : 0)} detalhe={reembolsos ? `${reembolsos} reembolso(s) no total` : "nenhum reembolso"} />
        <Indicador rotulo="Simulados ANAC (30 dias)" valor={tent30.length} atual={tent30.length} anterior={tent30ant.length} detalhe={`nota média ${mediaNota}%`} serie={dias30.map((d) => simDia.get(d) ?? 0)} cor={COR.amarelo} />
      </div>

      {/* ---------- cadastros e vendas por dia ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cx}>
          <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">Cadastros por dia</h2><span className="text-[13px] text-muted">30 dias · {novos30} no total</span></div>
          <BarrasTempo titulo="Cadastros por dia nos últimos 30 dias" dados={serie(cadDia)} />
        </Card>
        <Card className={cx}>
          <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">Vendas por dia</h2><span className="text-[13px] text-muted">30 dias · {fmtReal(receita30)}</span></div>
          <BarrasTempo titulo="Vendas por dia nos últimos 30 dias" dados={serie(vendaDia)} cor={COR.laranja} formato={fmtReal} />
        </Card>
      </div>

      {/* ---------- cursos ---------- */}
      <section className="flex flex-col gap-3" aria-labelledby="cursos-h">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cursos-h" className="font-display text-2xl font-extrabold">Como andam os cursos</h2>
          <Link href="/admin/acompanhamento" className="text-sm font-semibold">Acompanhamento detalhado →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {estatCursos.map((c) => (
            <Card key={c.slug} className={cx}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <h3 className="font-display text-lg font-bold">{c.nome}</h3>
                  <span className="text-[13px] text-muted">{c.alunos} {c.alunos === 1 ? "aluno" : "alunos"} com acesso{c.total ? ` · ${c.total} aulas` : ""}</span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="font-display text-[26px] leading-none font-extrabold">{c.media}%</span>
                  <span className="text-[12px] text-muted">progresso médio</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">Último estudo</span>
                <BarraPartes rotulo={`Situação dos alunos de ${c.nome}`} partes={[
                  { rotulo: "Estudando (até 2 dias)", valor: c.st.ativo, cor: COR.aqua },
                  { rotulo: "Esfriando (3 a 6 dias)", valor: c.st.esfriando, cor: COR.amarelo },
                  { rotulo: "Parados (7+ dias)", valor: c.st.parado, cor: COR.laranja },
                  { rotulo: "Nunca começaram", valor: c.st.nunca, cor: COR.cinza },
                ]} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-ink-2">Progresso no curso</span>
                <BarrasLista cor={COR.azul} itens={[
                  { rotulo: "Ainda não começou (0%)", valor: c.faixas[0] },
                  { rotulo: "Começou (1 a 49%)", valor: c.faixas[1] },
                  { rotulo: "Mais da metade (50 a 99%)", valor: c.faixas[2] },
                  { rotulo: "Concluiu (100%)", valor: c.faixas[3] },
                ]} />
              </div>
              <Link href={`/admin/acompanhamento?curso=${c.slug}`} className="text-[14px] font-semibold">Ver alunos de {c.nome} →</Link>
            </Card>
          ))}
          {!estatCursos.length && <p className="text-ink-2">Nenhum aluno com curso ainda.</p>}
        </div>
      </section>

      {/* ---------- vendas ---------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cx}>
          <h2 className="font-display text-xl font-bold">Vendas por produto</h2>
          <span className="-mt-2 text-[13px] text-muted">desde o início</span>
          <BarrasLista cor={COR.laranja} formato={fmtReal} itens={porProduto.map(([k, v]) => ({ rotulo: k, valor: v.valor, extra: `${v.n}×` }))} vazio="Nenhuma venda ainda." />
        </Card>
        <Card className={cx}>
          <h2 className="font-display text-xl font-bold">Formas de pagamento</h2>
          <span className="-mt-2 text-[13px] text-muted">compras aprovadas</span>
          <BarrasLista cor={COR.azul} itens={porForma.map(([k, v]) => ({ rotulo: k, valor: v.n, extra: fmtReal(v.valor) }))} vazio="Nenhuma compra ainda." />
        </Card>
        <Card className={cx}>
          <h2 className="font-display text-xl font-bold">Escolas que mais compram</h2>
          <span className="-mt-2 text-[13px] text-muted">pela escola do aluno</span>
          <BarrasLista cor={COR.laranja} formato={fmtReal} itens={escolaCompra.map(([k, v]) => ({ rotulo: k, valor: v.valor, extra: `${v.n}×` }))} vazio="Sem vendas com escola informada." />
        </Card>
      </div>

      {/* ---------- alunos e simulados ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cx}>
          <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">🏆 Alunos mais dedicados</h2><span className="text-[13px] text-muted">30 dias</span></div>
          {rankAlunos.length ? (
            <ol className="flex flex-col divide-y divide-[#eceef3]">
              {rankAlunos.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[14px] font-extrabold ${i < 3 ? "bg-[#fff3c4] text-[#7a5600]" : "bg-soft text-ink-2"}`}>{i + 1}</span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/admin/usuarios/${a.id}`} className="truncate font-semibold text-navy hover:underline hover:underline-offset-4">{nomeDe.get(a.id)}</Link>
                    <span className="truncate text-[13px] text-muted">{escolaDe.get(a.id) || "—"}</span>
                  </div>
                  <span className="shrink-0 text-right text-[13px] text-ink-2"><strong className="text-navy">{a.aulas}</strong> aulas · <strong className="text-navy">{a.sims}</strong> simulados{a.sims ? <span className="block text-muted">média {Math.round(a.soma / a.sims)}%</span> : null}</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-[14px] text-muted">Ninguém estudou nos últimos 30 dias.</p>}
          <p className="text-[12px] text-muted">Pontuação: 1 por aula concluída e 2 por simulado feito.</p>
        </Card>
        <div className="flex flex-col gap-6">
          <Card className={cx}>
            <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">Simulados ANAC por dia</h2><span className="text-[13px] text-muted">30 dias · média {mediaNota}%</span></div>
            <BarrasTempo titulo="Simulados ANAC feitos por dia" dados={serie(simDia)} cor={COR.amarelo} altura={130} />
            <BarraPartes rotulo="Notas dos simulados" partes={[
              { rotulo: "Abaixo de 50%", valor: faixaNota[0], cor: COR.laranja },
              { rotulo: "50 a 69%", valor: faixaNota[1], cor: COR.amarelo },
              { rotulo: "70 a 84%", valor: faixaNota[2], cor: COR.azul },
              { rotulo: "85% ou mais", valor: faixaNota[3], cor: COR.aqua },
            ]} />
          </Card>
          <Card className={cx}>
            <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">Aulas concluídas por dia</h2><span className="text-[13px] text-muted">todos os cursos</span></div>
            <BarrasTempo titulo="Aulas concluídas por dia" dados={serie(aulasDia)} cor={COR.aqua} altura={130} />
          </Card>
        </div>
      </div>

      {/* ---------- escolas e últimos cadastros ---------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cx}>
          <h2 className="font-display text-xl font-bold">Escolas com mais alunos</h2>
          <BarrasLista itens={rankEscolas.map(([k, v]) => ({ rotulo: k, valor: v }))} vazio="Nenhuma escola informada." />
          <Link href="/admin/usuarios/escolas" className="text-[14px] font-semibold">Regras por escola →</Link>
        </Card>
        <Card className={cx}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Últimos cadastros</h2>
            <Link href="/admin/usuarios" className="text-sm font-semibold">Ver todos →</Link>
          </div>
          <ul className="flex flex-col divide-y divide-[#eceef3]">
            {ultimos.map((u) => (
              <li key={u.id} className="flex flex-col py-2.5 text-[15px]">
                <Link href={`/admin/usuarios/${u.id}`} className="truncate font-semibold text-navy hover:underline hover:underline-offset-4">{u.nome ?? "—"}</Link>
                <span className="truncate text-[13px] text-muted">{u.escola ?? "—"} · {new Date(u.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
              </li>
            ))}
            {!ultimos.length && <li className="py-3 text-ink-2">Nenhum cadastro ainda.</li>}
          </ul>
        </Card>
        <Card className={cx}>
          <h2 className="font-display text-xl font-bold">Atalhos</h2>
          <div className="flex flex-col gap-2">
            <Link href="/admin/interessados" className={btnSecundario}>Lista de interesse ({interessados})</Link>
            <Link href="/admin/cursos" className={btnSecundario}>Editar cursos, módulos e aulas</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download do CSV, não é página */}
            <a href="/admin/usuarios/csv" className={btnSecundario}>Exportar usuários (CSV)</a>
            <Link href="/admin/configuracoes" className={btnSecundario}>Ligar ou desligar recursos</Link>
          </div>
          <p className="text-[13px] text-muted">Fórum: {relatos} {relatos === 1 ? "relato" : "relatos"} · {cfg.forum_ativo ? "ligado" : "desligado"}</p>
          {!cfg.manutencao && (
            <details className="rounded-xl border border-line p-3">
              <summary className="cursor-pointer text-[14px] font-semibold text-navy">Modo manutenção</summary>
              <div className="pt-3"><Chave chave="manutencao" ligado={cfg.manutencao} titulo="Modo manutenção" descricao="Ligado: o site mostra só a página “Em breve” para o público. Você continua acessando tudo." /></div>
            </details>
          )}
        </Card>
      </div>
    </>
  );
}
