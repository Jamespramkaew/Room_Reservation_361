#!/usr/bin/env bash
# Runs Drizzle migrations by invoking the deployed migrate function, so it works even when
# the database is only reachable from inside the VPC (RDS). Deploy it first:
#   ./deploy.sh <local|aws> migrate && ./migrate.sh <local|aws>
# Set SEED=1 to load the sample data after the migrations:
#   SEED=1 ./migrate.sh <local|aws>
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib.sh" "$@"

name="$(function_name migrate)"
out="$WORK_DIR/migrate-result.json"

if [ "${SEED:-0}" = 1 ]; then
  payload='{"seed": true}'
  log "invoke $name (with seed)"
else
  payload='{}'
  log "invoke $name"
fi

error="$(awsx lambda invoke --function-name "$name" --cli-binary-format raw-in-base64-out \
  --payload "$payload" --query FunctionError --output text "$out")"

cat "$out"
echo
[ "$error" = None ] || die "migration failed ($error)"
log "migrations done"
