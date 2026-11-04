#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — certificado SSL gratuito (Let's Encrypt) sem depender do
# teste "staging" do CloudPanel. Rodar como ROOT no console da Hostinger:
#
#   bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/deploy/ssl.sh)
#
# Emite pelo certbot, instala no CloudPanel e deixa a renovação automática.
# =====================================================================
set -euo pipefail

DOMINIO="cabincrew.com.br"
USUARIO="cabincrew"
WEBROOT="/home/$USUARIO/htdocs/$DOMINIO"
LIVE="/etc/letsencrypt/live/$DOMINIO"

[ "$(id -u)" = "0" ] || { echo "Rode como root."; exit 1; }
[ -d "$WEBROOT" ] || { echo "Pasta $WEBROOT não encontrada. O site Node.js existe no CloudPanel?"; exit 1; }

command -v certbot >/dev/null || { echo "==> Instalando certbot"; apt-get update -qq && apt-get install -y -qq certbot >/dev/null; }

# Inclui o www só se ele apontar para este servidor
DOMS=(-d "$DOMINIO")
IP_SERVIDOR="$(curl -4 -s -m 5 https://api.ipify.org || true)"
if [ -n "$IP_SERVIDOR" ] && getent ahostsv4 "www.$DOMINIO" | grep -q "$IP_SERVIDOR"; then
  DOMS+=(-d "www.$DOMINIO")
fi

INSTALAR="clpctl site:install:certificate --domainName=$DOMINIO --privateKey=$LIVE/privkey.pem --certificate=$LIVE/cert.pem --certificateChain=$LIVE/chain.pem"

echo "==> Emitindo certificado para: ${DOMS[*]//-d /}"
certbot certonly --webroot -w "$WEBROOT" "${DOMS[@]}" \
  --agree-tos --register-unsafely-without-email -n --keep-until-expiring \
  --deploy-hook "$INSTALAR"

echo "==> Instalando no CloudPanel"
eval "$INSTALAR"

echo
echo "Pronto! Abra https://$DOMINIO"
echo "A renovação é automática (certbot renova e reinstala no CloudPanel)."
