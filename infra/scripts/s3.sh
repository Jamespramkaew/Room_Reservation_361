# ensure_bucket: creates FN_ENV_S3_BUCKET if it does not exist. Sourced by deploy.sh.

ensure_bucket() {
  local bucket="${FN_ENV_S3_BUCKET:-}"
  [ -n "$bucket" ] || return 0
  if awsx s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
    return 0
  fi

  log "s3: create bucket $bucket"
  if [ "$REGION" = us-east-1 ]; then
    awsx s3api create-bucket --bucket "$bucket" >/dev/null
  else
    awsx s3api create-bucket --bucket "$bucket" \
      --create-bucket-configuration "LocationConstraint=$REGION" >/dev/null
  fi
}
