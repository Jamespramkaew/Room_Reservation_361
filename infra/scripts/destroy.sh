#!/usr/bin/env bash
# Deletes the REST API, every function in functions.json and their roles.
# The S3 bucket and the database are left alone.
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib.sh" "$@"

if [ "$TARGET" = aws ] && [ "${CONFIRM:-}" != yes ]; then
  die "this deletes the API and functions on AWS account $ACCOUNT_ID; re-run with CONFIRM=yes"
fi

api_id="$(find_api_id)"
if [ -n "$api_id" ]; then
  log "delete REST API $API_NAME ($api_id)"
  awsx apigateway delete-rest-api --rest-api-id "$api_id"
fi

for fn in $(select_functions); do
  name="$(function_name "$fn")"
  role="$(role_name "$fn")"
  if awsx lambda get-function --function-name "$name" >/dev/null 2>&1; then
    log "delete function $name"
    awsx lambda delete-function --function-name "$name"
  fi
  if awsx iam get-role --role-name "$role" >/dev/null 2>&1; then
    log "delete role $role"
    for arn in $(awsx iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text); do
      awsx iam detach-role-policy --role-name "$role" --policy-arn "$arn"
    done
    for policy in $(awsx iam list-role-policies --role-name "$role" --query 'PolicyNames[]' --output text); do
      awsx iam delete-role-policy --role-name "$role" --policy-name "$policy"
    done
    awsx iam delete-role --role-name "$role"
  fi
done
