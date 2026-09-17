#!/usr/bin/env bash
# Runs Drizzle migrations by invoking the deployed migrate function, so it works even when
# the database is only reachable from inside the VPC (RDS). Deploy it first:
#   ./deploy.sh <local|aws> migrate && ./migrate.sh <local|aws>
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib.sh" "$@"

name="$(function_name migrate)"
out="$WORK_DIR/migrate-result.json"

log "invoke $name"
error="$(awsx lambda invoke --function-name "$name" --cli-binary-format raw-in-base64-out \
  --payload '{}' --query FunctionError --output text "$out")"

cat "$out"
echo
[ "$error" = None ] || die "migration failed ($error)"
log "migrations done"
