#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — instalação/atualização em servidor com CloudPanel
#
# Pré-requisito: no CloudPanel, o site cabincrew.com.br criado como
# "Node.js Site" (Node 22, App Port 3000).
#
# Rodar logado como o USUÁRIO DO SITE (não como root):
#   ssh cabincrew@IP-DO-SERVIDOR
#   bash ~/htdocs/cabincrew.com.br/deploy/cloudpanel.sh
#
# Rodar de novo atualiza o site.
# =====================================================================
set -euo pipefail

PASTA="$HOME/htdocs/cabincrew.com.br"
REPO="https://github.com/eretzmarketing/cabincrew.git"
PORTA="${PORTA:-3000}"
DOMINIO="cabincrew.com.br"

if [ "$(id -u)" = "0" ]; then
  echo "Rode como o usuário do site (ex.: cabincrew), não como root."; exit 1
fi

# Node instalado pelo CloudPanel (nvm do usuário do site)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
NODE_MAJOR="$(node -v 2>/dev/null | cut -d. -f1 | tr -d v || echo 0)"
if [ "${NODE_MAJOR:-0}" -lt 20 ]; then
  echo "Node.js 20+ não encontrado. Crie o site como 'Node.js Site' (Node 22) no CloudPanel."; exit 1
fi

cd "$PASTA"

# Código: pelo GitHub (se for um repositório) ou já enviado pelo File Manager
if [ -d .git ]; then
  echo "==> Atualizando pelo GitHub"; git pull --ff-only
elif [ ! -f package.json ]; then
  echo "==> Baixando do GitHub"; git clone "$REPO" .
fi

if [ ! -f .env.local ]; then
  echo "==> Configurando variáveis (Supabase › Project Settings › API)"
  read -rp "Project URL do Supabase (https://xxxx.supabase.co): " SB_URL
  read -rp "Publishable key do Supabase (sb_publishable_...): " SB_KEY
  printf 'NEXT_PUBLIC_SUPABASE_URL=%s\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%s\nNEXT_PUBLIC_SITE_URL=https://%s\n' \
    "$SB_URL" "$SB_KEY" "$DOMINIO" > .env.local
  chmod 600 .env.local
fi

echo "==> Instalando dependências e compilando"
npm ci
npm run build

echo "==> Iniciando com PM2 na porta $PORTA"
command -v pm2 >/dev/null || npm install -g pm2
if pm2 describe cabincrew >/dev/null 2>&1; then
  pm2 reload cabincrew --update-env
else
  pm2 start npm --name cabincrew -- start -- -p "$PORTA"
fi
pm2 save

# Volta sozinho depois de reiniciar o servidor
LINHA="@reboot . $NVM_DIR/nvm.sh && pm2 resurrect"
( crontab -l 2>/dev/null | grep -v "pm2 resurrect" ; echo "$LINHA" ) | crontab -

echo
echo "Pronto! Teste em https://$DOMINIO"
echo "Ver erros: pm2 logs cabincrew"
