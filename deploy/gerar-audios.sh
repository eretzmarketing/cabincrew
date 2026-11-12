#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — gera os áudios do Inglês a bordo no ElevenLabs
#
# No console da Hostinger (como root), em uma linha:
#   su - cabincrew -c "bash ~/htdocs/cabincrew.com.br/deploy/gerar-audios.sh"
#
# Opções (depois do .sh):  --custo   --modulo 3   --aula 3.2   --vozes
# A chave da API é pedida sem aparecer na tela e não fica salva em lugar nenhum.
# =====================================================================
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "$HOME/htdocs/cabincrew.com.br"

if [ -z "${ELEVENLABS_API_KEY:-}" ] && [[ " $* " != *" --custo "* ]]; then
  echo "Cole a sua API key do ElevenLabs (ElevenLabs › Developers › API Keys)."
  read -rsp "API key (não aparece na tela): " ELEVENLABS_API_KEY
  echo
  export ELEVENLABS_API_KEY
fi

npx --yes tsx@4 scripts/gerar-audios-ingles.ts "$@"
