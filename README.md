# Cabin Crew — cabincrew.com.br

Site da comunidade Cabin Crew: Home e Fórum de Seleções de comissário de voo, com relatos organizados por companhia, processo seletivo e fase.

**Tecnologia:** Next.js 16 · Tailwind CSS 4 · Supabase (banco, login por e-mail) · hospedagem na Vercel.

## O que já funciona

- **Home** com seleções em andamento, fases, lista de espera do Crew Select
- **Fórum**: lista de seleções com filtro por companhia, página de cada seleção com abas por fase, linha do tempo e contadores
- **Relatos** com campos padronizados, opção de anônimo, confirmação ("Passei por isso também") e selo de verificado a partir de 3 confirmações
- **Login sem senha** (link enviado por e-mail); a conta é criada no primeiro acesso
- **Pontos**: +5 por relato, +2 por confirmação recebida
- **Moderação**: denúncias, ocultação automática com 3 denúncias, painel `/moderacao` para criar seleções, mudar status e revisar relatos
- Regras do fórum, privacidade, sitemap, robots, ícones e imagem de compartilhamento
- Redirecionamento 301 de `comissariadevoo.com.br` para `cabincrew.com.br`, página por página

## Colocar no ar (passo a passo)

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo).
2. Em **SQL Editor**, cole e rode todo o arquivo `supabase/migrations/0001_forum.sql`.
3. (Opcional, para testar) rode `supabase/seed_exemplo.sql`, que cria três seleções de exemplo.
4. Em **Authentication › URL Configuration**:
   - *Site URL*: `https://cabincrew.com.br`
   - *Redirect URLs*: `https://cabincrew.com.br/auth/callback` e `http://localhost:3000/auth/callback`
5. Em **Project Settings › API**, copie a **Project URL** e a **publishable key**.
   Nunca coloque a *secret key* / *service_role* no site.

### 2. Vercel
1. Em [vercel.com](https://vercel.com), **Add New › Project** e importe o repositório `eretzmarketing/cabincrew`.
2. Em **Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://cabincrew.com.br`
3. Clique em **Deploy**.
4. Em **Settings › Domains**, adicione `cabincrew.com.br`, `www.cabincrew.com.br`, `comissariadevoo.com.br` e `www.comissariadevoo.com.br`, e ajuste o DNS no Registro.br como a Vercel indicar.
   Só aponte o `comissariadevoo.com.br` quando quiser tirar o redirecionamento atual para a Horsky.

### 2a. Servidor com CloudPanel (recomendado se você usa CloudPanel)
1. No CloudPanel, apague o site PHP antigo de `cabincrew.com.br` (se existir) e crie um **Node.js Site**:
   domínio `cabincrew.com.br`, Node.js **22**, App Port **3000**.
2. Envie o código para `htdocs/cabincrew.com.br` (File Manager, enviando o .zip e extraindo; ou deixe o script
   baixar do GitHub).
3. Conecte por SSH **como o usuário do site** e rode `bash ~/htdocs/cabincrew.com.br/deploy/cloudpanel.sh`.
4. Na aba **SSL/TLS** do site, emita o certificado Let's Encrypt.
5. Para o redirecionamento do domínio antigo, adicione `comissariadevoo.com.br` em *Settings › Domain aliases*
   (ou crie um site de redirecionamento) quando quiser tirá-lo da Horsky.

Não use o `instalar-vps.sh` em servidores com CloudPanel: ele altera o Nginx que o painel gerencia.

### 2b. Alternativa: VPS sem painel (no lugar da Vercel)
1. No Registro.br, aponte `cabincrew.com.br` e `www` (registro **A**) para o IP da VPS.
2. Entre na VPS por SSH e rode:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/deploy/instalar-vps.sh -o instalar.sh
   bash instalar.sh
   ```
   O script pede a Project URL e a publishable key do Supabase, compila, mantém o site no ar com PM2,
   configura o Nginx e ativa o HTTPS.
3. Para atualizar depois de novas mudanças no GitHub, rode `bash /var/www/cabincrew/deploy/instalar-vps.sh` de novo.

### 3. Virar administrador
Depois de entrar no site com o seu e-mail, rode no SQL Editor:

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'SEU@EMAIL.COM');
```

O link **Moderação** aparece no menu.

### 4. E-mail de login (recomendado antes do lançamento)
O Supabase envia poucos e-mails por hora no plano gratuito. Para produção, configure um SMTP próprio em **Authentication › Emails › SMTP Settings** (Resend, Amazon SES, Brevo etc.) e traduza o modelo do e-mail "Magic Link" para português.

## Rodar no computador

```bash
cp .env.example .env.local   # preencha os valores
npm install
npm run dev                  # http://localhost:3000
```

## Estrutura

```
src/app/                 páginas (home, forum, entrar, conta, moderacao, regras, privacidade)
src/app/actions.ts       todas as ações (publicar, confirmar, denunciar, moderar…)
src/components/          cabeçalho, rodapé, cards, formulários
src/lib/forum.ts         fases, rótulos e formatação
src/lib/supabase/        conexão com o Supabase
supabase/migrations/     banco de dados e regras de segurança
```

A segurança está no banco (Row Level Security): mesmo chamando a API diretamente, ninguém publica em nome de outro, confirma o próprio relato, vê o autor de um relato anônimo ou se torna administrador.
