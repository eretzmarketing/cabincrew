#!/bin/bash
# Copia as imagens das aulas do Head Hunter (site da Horsky) para a pasta de mídia do Cabin Crew na VPS.
# Rode como o usuário do site:  su - cabincrew -c "bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/scripts/baixar-imagens-head-hunter.sh)"
# Depois rode no Supabase o SQL importacao/0028_imagens_head_hunter_locais.sql
set -u
DESTINO="${MIDIA_DIR:-$HOME/midia}/imagens/aulas/head-hunter"
mkdir -p "$DESTINO"
BASE="https://horsky.com.br/upload/image/course-headhunter"
ok=0; falhou=0
for n in img-cog-dicas-prep.png img-cog-dimensoes.png img-cog-mitos.png img-cog-perfil-ajuste.png img-cog-radar-ideal.png img-cog-radar-ie.png img-cog-radar-logica.png img-cog-radar-veloz.png img-cog-shl-formato.png img-como-funciona-teste-shl.png img-comunic-formal.png img-comunicacao.png img-dicas-por-bateria.png img-eixos.png img-elimina.png img-en-aircraft.png img-en-boarding.png img-en-bordo.png img-en-dialogos.png img-en-emergencias.png img-en-manual.png img-en-operation.png img-en-pouso.png img-en-safety-demo.png img-en-safety.png img-en-service.png img-en-turbulencia.png img-faixas-desempenho-shl.png img-funil.png img-gramatica.png img-grupo.png img-indutivo-explicacao.png img-leitura-avalia.png img-numerico-explicacao.png img-perfil-trabalho-equipe.png img-perfis.png img-pilares.png img-postura.png img-recrutadores-comparam.png img-rl-analogias.png img-rl-categorias.png img-rl-conectivos.png img-rl-silogismos.png img-sjt-explicacao.png img-texto-base.png img-verbal-explicacao.png img-vocab-pt.png; do
  if curl -fsSL --max-time 60 -o "$DESTINO/$n" "$BASE/$n"; then ok=$((ok+1)); else falhou=$((falhou+1)); echo "Falhou: $n"; rm -f "$DESTINO/$n"; fi
done
echo "Imagens copiadas: $ok de 47 (falharam: $falhou) em $DESTINO"
