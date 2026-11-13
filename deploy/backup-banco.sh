#!/usr/bin/env bash
# =====================================================================
# Cabin Crew — backup diário do banco (Supabase) dentro da Hostinger
#
# No console da Hostinger, como root, em uma linha:
#   bash <(curl -fsSL https://raw.githubusercontent.com/eretzmarketing/cabincrew/main/deploy/backup-banco.sh)
#
# O que faz:
#   1. instala o pg_dump (cliente oficial do PostgreSQL 17), se faltar
#   2. pede a connection string do Supabase (Session pooler), testa e guarda só no servidor
#   3. agenda o backup todo dia às 03:17 em /home/cabincrew/backups-banco (guarda 30 dias)
#   4. faz o primeiro backup na hora
# Para trocar a senha depois, é só rodar de novo.
# =====================================================================
set -euo pipefail

USUARIO="cabincrew"
CASA="/home/$USUARIO"
PASTA="$CASA/backups-banco"
CONF="$CASA/.cabincrew-backup.env"
RODAR="$CASA/bin/backup-banco.sh"

[ "$(id -u)" = "0" ] || { echo "Rode como root (no console da Hostinger)."; exit 1; }
id "$USUARIO" >/dev/null 2>&1 || { echo "Não achei o usuário $USUARIO."; exit 1; }

# ---------- 1. pg_dump 17 ----------
versao_pg_dump() { pg_dump --version 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo 0; }
if [ "$(versao_pg_dump)" -lt 17 ] 2>/dev/null || ! command -v pg_dump >/dev/null; then
  echo "Instalando o cliente do PostgreSQL 17…"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq curl ca-certificates gnupg lsb-release >/dev/null
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y -qq postgresql-client-17 >/dev/null
fi
PGBIN="/usr/lib/postgresql/17/bin"
[ -x "$PGBIN/pg_dump" ] || PGBIN="$(dirname "$(command -v pg_dump)")"
echo "pg_dump: $("$PGBIN/pg_dump" --version)"

# ---------- 2. connection string ----------
echo
echo "No Supabase: botão Connect (topo do projeto) › aba 'Connection string' › 'Session pooler' (porta 5432)."
echo "Copie o endereço e troque [YOUR-PASSWORD] pela senha do banco."
echo "(Esqueceu a senha? Project Settings › Database › Reset database password.)"
read -rsp "Cole a connection string (não aparece na tela): " URL
echo
case "$URL" in postgres://*|postgresql://*) ;; *) echo "Isso não parece uma connection string (começa com postgresql://)."; exit 1;; esac
case "$URL" in *YOUR-PASSWORD*) echo "Você esqueceu de trocar [YOUR-PASSWORD] pela senha."; exit 1;; esac

echo "Testando a conexão…"
if ! VER=$("$PGBIN/psql" "$URL" -tAc "show server_version_num" 2>/tmp/cc-backup-erro.txt); then
  echo "Não consegui conectar:"; sed 's/password=[^ ]*/password=***/g' /tmp/cc-backup-erro.txt | head -3; rm -f /tmp/cc-backup-erro.txt
  echo "Confira a senha e se usou o 'Session pooler' (porta 5432)."; exit 1
fi
rm -f /tmp/cc-backup-erro.txt
echo "Conectado (PostgreSQL ${VER:0:2})."

install -d -o "$USUARIO" -g "$USUARIO" -m 700 "$PASTA" "$CASA/bin"
umask 077
printf 'DB_URL=%q\nPGBIN=%q\n' "$URL" "$PGBIN" > "$CONF"
chown "$USUARIO:$USUARIO" "$CONF"; chmod 600 "$CONF"

# ---------- 3. script diário ----------
cat > "$RODAR" <<'SCRIPT'
#!/usr/bin/env bash
# Backup do banco da Cabin Crew (chamado pelo cron todo dia). Guarda 30 dias.
set -euo pipefail
umask 077
. "$HOME/.cabincrew-backup.env"
PASTA="$HOME/backups-banco"
DATA=$(TZ=America/Sao_Paulo date +%Y-%m-%d_%H%M)
TMP="$PASTA/.em-andamento-$DATA"
mkdir -p "$TMP"
LOG="$PASTA/ultimo-backup.log"
{
  echo "Início: $(TZ=America/Sao_Paulo date '+%d/%m/%Y %H:%M:%S')"
  # tudo do site (tabelas, funções, regras de acesso e dados)
  "$PGBIN/pg_dump" "$DB_URL" --schema=public --no-owner --no-privileges -Fc -f "$TMP/site.dump"
  # contas de login (e-mail e senha criptografada)
  "$PGBIN/pg_dump" "$DB_URL" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges -Fc -f "$TMP/contas.dump"
  # cópia também em texto (abre em qualquer editor; útil para conferir dados)
  "$PGBIN/pg_dump" "$DB_URL" --schema=public --data-only --no-owner --no-privileges | gzip -9 > "$TMP/dados.sql.gz"
  tar -C "$TMP" -cf "$PASTA/banco-$DATA.tar" .
  rm -rf "$TMP"
  find "$PASTA" -maxdepth 1 -name 'banco-*.tar' -mtime +30 -delete
  echo "OK: banco-$DATA.tar ($(du -h "$PASTA/banco-$DATA.tar" | cut -f1))"
  echo "Fim: $(TZ=America/Sao_Paulo date '+%d/%m/%Y %H:%M:%S')"
} > "$LOG" 2>&1 || { rm -rf "$TMP"; echo "ERRO no backup de $DATA" >> "$LOG"; exit 1; }
SCRIPT
chown "$USUARIO:$USUARIO" "$RODAR"; chmod 700 "$RODAR"

# ---------- 4. agenda (03:17 todo dia, horário de Brasília) ----------
( crontab -u "$USUARIO" -l 2>/dev/null | grep -v 'backup-banco.sh' || true
  echo "CRON_TZ=America/Sao_Paulo"
  echo "17 3 * * * $RODAR" ) | awk '!(/^CRON_TZ=/ && seen++)' | crontab -u "$USUARIO" -
echo "Agendado: todo dia às 03:17."

# ---------- 5. primeiro backup ----------
echo "Fazendo o primeiro backup (pode levar alguns segundos)…"
if su - "$USUARIO" -c "$RODAR"; then
  tail -n 2 "$PASTA/ultimo-backup.log"
  echo
  echo "Pronto. Os backups ficam em $PASTA (os 30 últimos dias)."
else
  echo "O primeiro backup falhou:"; tail -n 5 "$PASTA/ultimo-backup.log"; exit 1
fi
