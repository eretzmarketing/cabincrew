# Cabin Crew · guia para quem continuar o trabalho

Plataforma preparatória para seleções de comissário(a) de voo: **cabincrew.com.br**.
Dono: Daniel. Fale com ele em **português do Brasil**, passo a passo e simples. Ele não é programador.

## Stack
- Next.js 16 (App Router, server actions) + Tailwind 4 · leia `AGENTS.md` antes de mexer no Next.
- Supabase (Postgres + RLS + RPCs `security definer`). Projeto: `elqhaivhpxrhmogjkkay`.
- Servidor: VPS Hostinger com CloudPanel, usuário `cabincrew`.

## Como entregar mudanças
1. Banco: crie `supabase/migrations/00NN_nome.sql` (próximo número depois do último), que possa rodar mais de uma vez
   (`if not exists`, `create or replace`, `on conflict`). Mande o arquivo para o Daniel rodar no **SQL Editor do Supabase**.
   Cargas de conteúdo ficam em `supabase/importacao/`.
2. Código: commit e push na `main` (GitHub `eretzmarketing/cabincrew`).
3. Deploy: o Daniel cola no console da Hostinger:
   ```
   su - cabincrew -c "SB_URL=https://elqhaivhpxrhmogjkkay.supabase.co SB_KEY=sb_publishable_RZu6lWbQA7K1R1HKQHxZnQ_f6zlXaRG bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/deploy/cloudpanel.sh)"
   ```
   (A chave `sb_publishable_…` é pública; pode aparecer.) Não rode `instalar-vps.sh` no CloudPanel.
4. Antes de entregar: `npx tsc --noEmit -p .`, `npx eslint src`, `next build`, e teste a tela (Playwright) no computador e no celular.

## Segredos: nunca no chat nem no código
Ficam em arquivos do servidor (modo 600), gravados pelas telas do admin:
- Mercado Pago `~/.cabincrew-mercadopago.json` (Admin › Configurações › Pagamentos; tem a chave do site usada por `_confere_chave`)
- SuperFrete `~/.cabincrew-superfrete.json` (Configurações › Envios)
- OpenAI `~/.cabincrew-openai.json` (Configurações › Inteligência artificial)
- E-mail SMTP e WhatsApps da equipe `~/.cabincrew-suporte.json` (Suporte › E-mail e avisos)
- WhatsApp (Wawp) e ElevenLabs: pelo admin / console da Hostinger.
Nunca peça senha do banco, tokens ou chaves no chat. Se o Daniel colar um, avise para trocar.

## Regras de produto combinadas
- **Não mostrar quantidade de questões/perguntas** do banco em nenhuma tela de aluno ou material
  (o formato da prova, como “20 questões em 30 min”, pode).
- **Não anunciar “garantia de 7 dias”** (a Política de Reembolso legal continua nas páginas de Termos/Reembolso).
- Conteúdo importado entra como rascunho, salvo pedido contrário. Da Horsky, só ler conteúdo; nunca dados de alunos.
- Prints e materiais de divulgação usam a conta de exemplo, nunca dados de aluno real.

## Mapa rápido
- Cursos: Head Hunter (`modulos`/`aulas`, curso `head-hunter`), English/Spanish (conteúdo em código + ajustes em `idioma_conteudo`),
  cursos novos criados no admin (`/curso/[slug]`). Acesso: tabela `acessos` + RPC `tem_acesso`.
- IA: vídeo (`src/lib/ia-video.ts`) e currículo (`src/lib/ia-curriculo.ts`), limite por compra + liberação na ficha do aluno.
- Admin: `src/app/admin/*`, menu em `src/components/AdminNav.tsx`. Gestão de alunos em Usuários.
  Toda liberação de acesso do aluno fica em `/admin/usuarios/[id]/acessos` (cursos, Questões Plus, IA, reset de módulos).
  Acompanhamento por curso (quem estuda/parou/em risco): `/admin/acompanhamento?curso=…` + RPC `admin_acompanhamento` (SQL 0072);
  `/admin/head-hunter/alunos` redireciona para a aba Head Hunter.
- Questões que mais erram (SQL 0073): `/admin/questoes/erros` + RPC `admin_questoes_erros` (por bloco, período, alternativa mais marcada).
- Painel do aluno: `src/app/conta/page.tsx` + `src/lib/painel-aluno.ts`.
- Central de ajuda pública: `/ajuda` (perguntas em `src/lib/ajuda.ts`, busca em `src/components/CentralAjuda.tsx`). Atualize ao mudar regras.
- Questões (SQL 0070): Reportar erro (grátis, `questao_reportes`), Comentários e Favoritas = "Questões Plus"
  (`src/components/AcoesQuestao.tsx`, `src/app/questoes-actions.ts`, `src/lib/plus.ts`). Cobrança: chave `plus_cobrar`
  (desligada = grátis para todos); liberação manual em `plus_assinantes` (Admin › Simulados ANAC › Questões Plus ou ficha do aluno).
  Cobrança automática mensal pelo Mercado Pago ainda não existe (origem 'compra' já prevista na tabela).
  Simulado de favoritas (SQL 0071): por bloco, 20 sorteadas das favoritas do bloco, 30 min; libera com 20 favoritas no bloco.
- Liberação em massa e regras por escola (SQL 0075): botão "🎁 Liberar em massa" em `/admin/usuarios` (marcados ou todos do filtro)
  e `/admin/usuarios/escolas` (pacote automático no cadastro: trigger `profiles_regra_escola`, só quando a escola é preenchida pela 1ª vez).
  Lógica em `_liberar_pacote` (nunca diminui acesso existente), `src/app/massa-actions.ts`, `src/components/LiberacaoMassa.tsx`.
- Escolas de aviação (SQL 0076): tabela `escolas` editável em Configurações › Escolas de aviação (`/admin/configuracoes/escolas`,
  colar várias, renomear com correção nos alunos via RPC `admin_renomear_escola`, excluir várias). O cadastro e Minha conta
  usam `listaEscolas()` (`src/lib/escolas-dados.ts`); `src/lib/escolas.ts` é só o reserva se a tabela não existir.
- SMS (smsmais): token em `~/.cabincrew-sms.json` (Admin › Configurações › SMS, `/admin/sms`), envio em `src/lib/sms.ts`
  (`enviarSMS`, POST https://smsmais.com/api/enviar_sms.php; 403 = opt-out, `held_no_balance` = sem saldo). Evite emoji no texto (vira UCS-2, 70 caracteres).
