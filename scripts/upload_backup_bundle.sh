#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${1:-}"
if [[ -z "${ARCHIVE_PATH}" ]]; then
  echo "Usage: scripts/upload_backup_bundle.sh <archive-path>" >&2
  exit 1
fi

if [[ -z "${S3_BACKUP_BUCKET:-}" ]]; then
  echo "S3_BACKUP_BUCKET is required." >&2
  exit 1
fi

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "AWS credentials are required." >&2
  exit 1
fi

S3_BACKUP_REGION="${S3_BACKUP_REGION:-us-east-1}"
S3_BACKUP_PREFIX="${S3_BACKUP_PREFIX:-}"
OBJECT_KEY="$(basename "${ARCHIVE_PATH}")"
if [[ -n "${S3_BACKUP_PREFIX}" ]]; then
  OBJECT_KEY="${S3_BACKUP_PREFIX%/}/${OBJECT_KEY}"
fi

AWS_ARGS=(--region "${S3_BACKUP_REGION}")
if [[ -n "${S3_ENDPOINT_URL:-}" ]]; then
  AWS_ARGS+=(--endpoint-url "${S3_ENDPOINT_URL}")
fi

aws s3 cp "${ARCHIVE_PATH}" "s3://${S3_BACKUP_BUCKET}/${OBJECT_KEY}" "${AWS_ARGS[@]}"

echo "Uploaded backup archive to s3://${S3_BACKUP_BUCKET}/${OBJECT_KEY}"
