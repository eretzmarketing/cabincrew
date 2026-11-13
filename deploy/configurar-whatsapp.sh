#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — conecta o site ao WhatsApp (Wawp)
#
# No console da Hostinger (como root), em uma linha:
#   su - cabincrew -c "bash ~/htdocs/cabincrew.com.br/deploy/configurar-whatsapp.sh"
#
# Pede o Instance ID e o Access Token do Wawp (o token não aparece na tela),
# grava em .env.local (só o usuário do site lê) e reinicia o site.
# Para trocar o token depois, é só rodar de novo.
# =====================================================================
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "$HOME/htdocs/cabincrew.com.br"
[ -f .env.local ] || { echo "Rode o deploy primeiro (não achei o .env.local)."; exit 1; }

echo "Dados em wawp.net › Instances (Instance ID) e Access Token."
read -rp  "Instance ID: " WAWP_INSTANCE_ID
read -rsp "Access Token (não aparece na tela): " WAWP_ACCESS_TOKEN
echo
[ -n "$WAWP_INSTANCE_ID" ] && [ -n "$WAWP_ACCESS_TOKEN" ] || { echo "Instance ID e Access Token são obrigatórios."; exit 1; }

# Testa antes de salvar
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.wawp.net/v2/contacts/check-exists?instance_id=${WAWP_INSTANCE_ID}&access_token=${WAWP_ACCESS_TOKEN}&phone=5511999999999" || true)
if [ "$STATUS" = "401" ]; then echo "O Wawp recusou o token (401). Confira e rode de novo."; exit 1; fi
if [ "$STATUS" = "404" ]; then echo "Instância não encontrada ou desconectada (404). Confira o Instance ID e se o WhatsApp está conectado no Wawp."; exit 1; fi
echo "Wawp respondeu $STATUS."

grep -v '^WAWP_INSTANCE_ID=\|^WAWP_ACCESS_TOKEN=' .env.local > .env.local.novo || true
printf 'WAWP_INSTANCE_ID=%s\nWAWP_ACCESS_TOKEN=%s\n' "$WAWP_INSTANCE_ID" "$WAWP_ACCESS_TOKEN" >> .env.local.novo
mv .env.local.novo .env.local
chmod 600 .env.local

pm2 reload cabincrew --update-env >/dev/null
echo "Pronto! WhatsApp conectado. Confira em https://cabincrew.com.br/admin/whatsapp e mande um teste."
