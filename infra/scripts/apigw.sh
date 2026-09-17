# REST API (v1) wiring. Sourced by deploy.sh.
#   ensure_api                 -> sets API_ID
#   ensure_routes <function>   -> ANY method + Lambda proxy integration for each manifest route
#   deploy_stage

RESOURCES_FILE="$WORK_DIR/resources.tsv"

ensure_api() {
  API_ID="$(find_api_id)"
  if [ -z "$API_ID" ]; then
    log "apigateway: create REST API $API_NAME"
    if [ "$TARGET" = local ]; then
      # LocalStack-only tag: keeps the local URL stable across restarts
      API_ID="$(awsx apigateway create-rest-api --name "$API_NAME" \
        --tags "_custom_id_=$PREFIX" --query id --output text)"
    else
      API_ID="$(awsx apigateway create-rest-api --name "$API_NAME" \
        --endpoint-configuration types=REGIONAL --query id --output text)"
    fi
  fi
  refresh_resources
}

refresh_resources() {
  awsx apigateway get-resources --rest-api-id "$API_ID" --limit 500 \
    --query 'items[].[path, id]' --output text >"$RESOURCES_FILE"
}

resource_id() {
  awk -F'\t' -v p="$1" '$1 == p { print $2 }' "$RESOURCES_FILE"
}

# Creates every missing segment of a path such as /api/rooms/{roomId}/photos and prints its id
ensure_resource() {
  local path="$1" current="" parent_id id segment
  parent_id="$(resource_id /)"
  for segment in $(echo "${path#/}" | tr / ' '); do
    current="$current/$segment"
    id="$(resource_id "$current")"
    if [ -z "$id" ]; then
      log "apigateway: create resource $current" >&2
      id="$(awsx apigateway create-resource --rest-api-id "$API_ID" --parent-id "$parent_id" \
        --path-part "$segment" --query id --output text)" ||
        die "could not create $current (a sibling path variable like {id} vs {proxy+} may conflict)"
      refresh_resources
    fi
    parent_id="$id"
  done
  echo "$parent_id"
}

ensure_routes() {
  local fn="$1" fn_arn uri route rid routes
  fn_arn="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$(function_name "$fn")"
  uri="arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$fn_arn/invocations"
  routes="$(fn_routes "$fn")"
  [ -n "$routes" ] || return 0

  # Route paths never contain spaces, so plain word splitting is fine
  for route in $routes; do
    rid="$(ensure_resource "$route")"
    if ! awsx apigateway get-method --rest-api-id "$API_ID" --resource-id "$rid" --http-method ANY >/dev/null 2>&1; then
      awsx apigateway put-method --rest-api-id "$API_ID" --resource-id "$rid" \
        --http-method ANY --authorization-type NONE >/dev/null
    fi
    # put-integration overwrites, so re-running always points the route at the current function
    awsx apigateway put-integration --rest-api-id "$API_ID" --resource-id "$rid" \
      --http-method ANY --type AWS_PROXY --integration-http-method POST --uri "$uri" >/dev/null
    log "apigateway: ANY $route -> $(function_name "$fn")"
  done

  awsx lambda remove-permission --function-name "$(function_name "$fn")" \
    --statement-id "apigateway-$API_ID" >/dev/null 2>&1 || true
  awsx lambda add-permission --function-name "$(function_name "$fn")" \
    --statement-id "apigateway-$API_ID" --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*" >/dev/null
}

deploy_stage() {
  log "apigateway: deploy stage $STAGE_NAME"
  awsx apigateway create-deployment --rest-api-id "$API_ID" --stage-name "$STAGE_NAME" >/dev/null
}
