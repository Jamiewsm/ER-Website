#!/bin/bash
set -euo pipefail

URL="${1:-https://4232e867.coach-portal-webapp.pages.dev}"
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
OUT_DIR="${HOME}/Library/Logs/coachportal-webapp-check"
mkdir -p "${OUT_DIR}"

HTTP_CODE="$(curl -L -s -o /dev/null -w '%{http_code}' "${URL}")"

if [[ "${HTTP_CODE}" == "200" ]]; then
  printf '[%s] OK %s %s\n' "${STAMP}" "${HTTP_CODE}" "${URL}" >> "${OUT_DIR}/health.log"
else
  printf '[%s] FAIL %s %s\n' "${STAMP}" "${HTTP_CODE}" "${URL}" >> "${OUT_DIR}/health.log"
fi
