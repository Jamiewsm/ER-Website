#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is required." >&2
  exit 1
fi

BACKUP_ROOT="${BACKUP_ROOT:-backup-output}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_DIR="${BACKUP_ROOT}/database"
mkdir -p "${DB_DIR}"

OUTPUT_PATH="${DB_DIR}/supabase-${TIMESTAMP}.dump"
CHECKSUM_PATH="${OUTPUT_PATH}.sha256"

pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="${OUTPUT_PATH}" \
  "${SUPABASE_DB_URL}"

sha256sum "${OUTPUT_PATH}" > "${CHECKSUM_PATH}"

echo "Database backup created:"
echo "  ${OUTPUT_PATH}"
