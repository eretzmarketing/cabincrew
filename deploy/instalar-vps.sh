#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — instalação em VPS Ubuntu/Debian (rodar como root)
#
#   bash instalar-vps.sh
#
# Faz: instala Node 22, Nginx, PM2 e Certbot; baixa o site do GitHub;
# configura as variáveis; compila; mantém o site rodando; e ativa HTTPS.
# Rodar de novo atualiza o site para a versão mais recente do GitHub.
# =====================================================================
set -euo pipefail

REPO="https://github.com/eretzmarketing/cabincrew.git"
PASTA="/var/www/cabincrew"
DOMINIO="cabincrew.com.br"
DOMINIOS_EXTRAS="www.cabincrew.com.br comissariadevoo.com.br www.comissariadevoo.com.br"
PORTA=3000

echo "==> Instalando pacotes do sistema"
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  echo "==> Instalando Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Baixando o site"
if [ -d "$PASTA/.git" ]; then
  git -C "$PASTA" pull --ff-only
else
  git clone "$REPO" "$PASTA"
fi
cd "$PASTA"

if [ ! -f .env.local ]; then
  echo "==> Configurando variáveis (Supabase › Project Settings › API)"
  read -rp "Project URL do Supabase (https://xxxx.supabase.co): " SB_URL
  read -rp "Publishable key do Supabase (sb_publishable_...): " SB_KEY
  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SB_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SB_KEY
NEXT_PUBLIC_SITE_URL=https://$DOMINIO
EOF
  chmod 600 .env.local
fi

echo "==> Compilando"
npm ci
npm run build

echo "==> Iniciando com PM2"
if pm2 describe cabincrew >/dev/null 2>&1; then
  pm2 reload cabincrew
else
  pm2 start npm --name cabincrew -- start -- -p "$PORTA"
  pm2 startup systemd -u root --hp /root >/dev/null
fi
pm2 save

echo "==> Configurando Nginx"
cat > /etc/nginx/sites-available/cabincrew <<EOF
server {
    listen 80;
    server_name $DOMINIO $DOMINIOS_EXTRAS;
    client_max_body_size 5m;

    location / {
        proxy_pass http://127.0.0.1:$PORTA;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
ln -sf /etc/nginx/sites-available/cabincrew /etc/nginx/sites-enabled/cabincrew
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall (SSH, HTTP e HTTPS)"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

echo "==> HTTPS (Let's Encrypt)"
echo "Os domínios precisam já apontar para este servidor (registro A no Registro.br)."
read -rp "Ativar HTTPS agora? [s/N] " RESP
if [[ "${RESP,,}" == "s" ]]; then
  DOMS="-d $DOMINIO"
  for d in $DOMINIOS_EXTRAS; do DOMS="$DOMS -d $d"; done
  read -rp "E-mail para avisos do certificado: " EMAIL
  certbot --nginx $DOMS --redirect --agree-tos -m "$EMAIL" -n
fi

echo
echo "Pronto! Site rodando. Comandos úteis:"
echo "  pm2 logs cabincrew        # ver erros"
echo "  bash $PASTA/deploy/instalar-vps.sh   # atualizar depois de mudanças no GitHub"
