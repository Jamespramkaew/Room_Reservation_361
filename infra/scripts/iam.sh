# ensure_role <function>: creates/updates the execution role and prints its ARN. Sourced by deploy.sh.

ensure_role() {
  local fn="$1" role
  role="$(role_name "$fn")"

  if ! awsx iam get-role --role-name "$role" >/dev/null 2>&1; then
    log "iam: create role $role" >&2
    awsx iam create-role --role-name "$role" --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]
    }' >/dev/null
    awsx iam wait role-exists --role-name "$role"
  fi

  awsx iam attach-role-policy --role-name "$role" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  if [ -n "${VPC_SUBNET_IDS:-}" ]; then
    awsx iam attach-role-policy --role-name "$role" \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
  fi

  if fn_has_policy "$fn" s3; then
    [ -n "${FN_ENV_S3_BUCKET:-}" ] || die "$fn needs s3 but FN_ENV_S3_BUCKET is not set"
    awsx iam put-role-policy --role-name "$role" --policy-name s3-bucket-access --policy-document "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [{
        \"Effect\": \"Allow\",
        \"Action\": [\"s3:GetObject\", \"s3:PutObject\", \"s3:DeleteObject\"],
        \"Resource\": \"arn:aws:s3:::$FN_ENV_S3_BUCKET/*\"
      }]
    }"
  fi

  echo "arn:aws:iam::$ACCOUNT_ID:role/$role"
}
