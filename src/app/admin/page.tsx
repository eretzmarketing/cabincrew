import Link from "next/link";
import { Card, Chave, Numero, Titulo, btnSecundario } from "@/components/admin-ui";
import { situacaoBackup } from "@/lib/backup";
import { getConfig } from "@/lib/config";
import { getUser } from "@/lib/supabase/server";

export default async function AdminHome() {
  const { supabase } = await getUser();
  const { hoje, semana } = periodos();

  const contar = (t: string, f?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const q = base(t);
    return (f ? f(q) : q).then((r) => r.count ?? 0);
  };
  function base(t: string) {
    return supabase.from(t).select("*", { count: "exact", head: true });
  }

  const [interessados, usuarios, hojeN, semanaN, aulasPub, conclusoes, relatos, cfg, ultimos] = await Promise.all([
    contar("interessados"),
    contar("profiles"),
    contar("profiles", (q) => q.gte("created_at", hoje)),
    contar("profiles", (q) => q.gte("created_at", semana)),
    contar("aulas", (q) => q.eq("publicado", true)),
    contar("progresso"),
    contar("relatos"),
    getConfig(),
    supabase.from("profiles").select("nome, escola, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const bk = await situacaoBackup();
  const horas = bk.configurado && bk.ultimo ? (new Date().getTime() - bk.ultimo.getTime()) / 3600000 : null;
  const bkOk = bk.configurado && !bk.erro && horas !== null && horas < 30;

  return (
    <>
      <Titulo sub="Resumo da plataforma Cabin Crew.">Visão geral</Titulo>

      <p role="status" className={`rounded-2xl px-5 py-3 text-[15px] ${bkOk ? "bg-[#e5f6ec] text-[#0f6b3a]" : "bg-[#fff8e6] text-[#7a5a00]"}`}>
        {!bk.configurado ? <>💾 <strong>Backup do banco não configurado.</strong> Rode o script de backup no console da Hostinger (deploy/backup-banco.sh).</>
          : !bk.ultimo ? <>💾 <strong>Backup configurado, mas nenhum arquivo ainda.</strong>{bk.erro ? " O último teve erro: veja ~/backups-banco/ultimo-backup.log." : ""}</>
          : <>💾 Último backup do banco: <strong>{bk.ultimo.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</strong> · {(bk.tamanho / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB · {bk.arquivos} cópia(s) guardada(s){!bkOk && <strong> · atenção: {bk.erro ? "o último backup deu erro" : "faz mais de um dia sem backup"}</strong>}</>}
      </p>

      <Card className={cfg.manutencao ? "border-2 border-brand" : ""}>
        <Chave
          chave="manutencao"
          ligado={cfg.manutencao}
          titulo="Modo manutenção"
          descricao="Ligado: o site mostra só a página “Em breve” para o público, sem cadastro. Você continua acessando tudo."
        />
      </Card>

      <div className="flex flex-wrap gap-4">
        <Link href="/admin/interessados" className="flex flex-[1_1_200px] text-navy hover:opacity-90">
          <Numero rotulo="Lista de interesse" valor={interessados} detalhe="pedidos de aviso na página Em breve →" />
        </Link>
        <Numero rotulo="Cadastros" valor={usuarios} detalhe={`${hojeN} hoje · ${semanaN} nos últimos 7 dias`} />
        <Numero rotulo="Aulas publicadas" valor={aulasPub} detalhe="no Head Hunter" />
        <Numero rotulo="Aulas concluídas" valor={conclusoes} detalhe="somando todos os alunos" />
        <Numero rotulo="Relatos no fórum" valor={relatos} detalhe={cfg.forum_ativo ? "fórum ligado" : "fórum desligado"} />
      </div>

      <div className="flex flex-wrap gap-6">
        <Card className="flex-[2_1_420px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Últimos cadastros</h2>
            <Link href="/admin/usuarios" className="text-sm font-semibold">Ver todos →</Link>
          </div>
          <ul className="flex flex-col divide-y divide-[#eceef3]">
            {(ultimos.data ?? []).map((u, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 py-3 text-[15px]">
                <span className="font-semibold">{u.nome ?? "—"}</span>
                <span className="text-muted">{u.escola ?? "—"} · {new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
            {!ultimos.data?.length && <li className="py-3 text-ink-2">Nenhum cadastro ainda.</li>}
          </ul>
        </Card>
        <Card className="flex-[1_1_260px]">
          <h2 className="font-display text-xl font-bold">Atalhos</h2>
          <div className="flex flex-col gap-2">
            <Link href="/admin/head-hunter" className={btnSecundario}>Editar módulos e aulas</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- download do CSV, não é página */}
            <a href="/admin/usuarios/csv" className={btnSecundario}>Exportar todos os usuários (CSV)</a>
            <Link href="/admin/configuracoes" className={btnSecundario}>Ligar ou desligar recursos</Link>
          </div>
        </Card>
      </div>
    </>
  );
}

/** Início de hoje e de 7 dias atrás, no fuso de Brasília. */
function periodos() {
  const agora = new Date();
  const brasil = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const deslocamento = agora.getTime() - brasil.getTime();
  brasil.setHours(0, 0, 0, 0);
  const hoje = new Date(brasil.getTime() + deslocamento);
  return { hoje: hoje.toISOString(), semana: new Date(hoje.getTime() - 6 * 864e5).toISOString() };
}
