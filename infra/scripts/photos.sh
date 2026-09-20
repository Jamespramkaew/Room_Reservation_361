#!/usr/bin/env bash
# Copies the room photos into the LocalStack bucket without redeploying (deploy.sh local does this too).
#   ./photos.sh local
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib.sh" "$@"
source "$DIR/s3.sh"

[ "$TARGET" = local ] || die "photos.sh only targets LocalStack; the AWS bucket is managed by hand"
ensure_bucket
sync_photos
log "try: curl -I ${FN_ENV_S3_PUBLIC_URL}/Room1.jpg"
