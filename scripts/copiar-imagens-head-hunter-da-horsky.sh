#!/bin/bash
# Copia as imagens das aulas do Head Hunter da pasta do site da Horsky para a pasta de mídia do Cabin Crew.
# Só LÊ os arquivos da Horsky (não altera nada lá). Rode como root no servidor onde os dois sites estão:
#   bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/scripts/copiar-imagens-head-hunter-da-horsky.sh)
set -u
ORIGEM="${HORSKY_DIR:-/home/horsky/htdocs/horsky.com.br}"
DESTINO="/home/cabincrew/midia/imagens/aulas/head-hunter"
if [ ! -d "$ORIGEM" ]; then echo "Não encontrei a pasta da Horsky em $ORIGEM. Os dois sites estão neste servidor?"; exit 1; fi
mkdir -p "$DESTINO"
ok=0; faltam=""
for n in img-cog-dicas-prep.png img-cog-dimensoes.png img-cog-mitos.png img-cog-perfil-ajuste.png img-cog-radar-ideal.png img-cog-radar-ie.png img-cog-radar-logica.png img-cog-radar-veloz.png img-cog-shl-formato.png img-como-funciona-teste-shl.png img-comunic-formal.png img-comunicacao.png img-dicas-por-bateria.png img-eixos.png img-elimina.png img-en-aircraft.png img-en-boarding.png img-en-bordo.png img-en-dialogos.png img-en-emergencias.png img-en-manual.png img-en-operation.png img-en-pouso.png img-en-safety-demo.png img-en-safety.png img-en-service.png img-en-turbulencia.png img-faixas-desempenho-shl.png img-funil.png img-gramatica.png img-grupo.png img-indutivo-explicacao.png img-leitura-avalia.png img-numerico-explicacao.png img-perfil-trabalho-equipe.png img-perfis.png img-pilares.png img-postura.png img-recrutadores-comparam.png img-rl-analogias.png img-rl-categorias.png img-rl-conectivos.png img-rl-silogismos.png img-sjt-explicacao.png img-texto-base.png img-verbal-explicacao.png img-vocab-pt.png; do
  f=$(find "$ORIGEM" -type f -name "$n" -not -path '*__MACOSX*' 2>/dev/null | head -1)
  if [ -n "$f" ]; then cp "$f" "$DESTINO/$n" && ok=$((ok+1)); else faltam="$faltam $n"; fi
done
chown -R cabincrew:cabincrew /home/cabincrew/midia/imagens 2>/dev/null
echo "Imagens copiadas: $ok de 47 para $DESTINO"
[ -n "$faltam" ] && echo "Não encontradas:$faltam"
exit 0
