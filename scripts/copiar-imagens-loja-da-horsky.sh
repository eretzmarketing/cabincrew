#!/bin/bash
# Copia as fotos das apostilas da pasta do site da Horsky para a pasta de mídia da Cabin Crew.
# Só LÊ os arquivos da Horsky (não altera nada lá). Rode como root no servidor onde os dois sites estão:
#   bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/scripts/copiar-imagens-loja-da-horsky.sh)
set -u
ORIGEM="${HORSKY_DIR:-/home/horsky/htdocs/horsky.com.br}"
DESTINO="/home/cabincrew/midia/imagens/loja"
mkdir -p "$DESTINO"
ok=0; faltam=""
for n in 6ad64c8117203_1792429185.png 6ad64c92cc233_1792429202.png 6ad64d125881f_1792429330.png 6ad64d4836121_1792429384.png; do
  f=""
  [ -d "$ORIGEM" ] && f=$(find "$ORIGEM" -type f -name "$n" 2>/dev/null | head -1)
  if [ -n "$f" ]; then
    cp "$f" "$DESTINO/$n" && ok=$((ok+1))
  elif curl -fsSL "https://horsky.com.br/upload/image/gallery/$n" -o "$DESTINO/$n"; then
    ok=$((ok+1))
  else
    faltam="$faltam $n"
  fi
done
chown -R cabincrew:cabincrew /home/cabincrew/midia/imagens 2>/dev/null
echo "Fotos das apostilas copiadas: $ok de 4 para $DESTINO"
[ -n "$faltam" ] && echo "Não encontradas:$faltam"
exit 0
