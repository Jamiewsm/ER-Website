#!/usr/bin/env bash
# Verify mobile brochure PDF is present for Cloudflare Pages deploy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PDF="$ROOT/parenting-workshop/mobile-brochure.pdf"

if [[ ! -f "$PDF" ]]; then
  echo "MISSING: parenting-workshop/mobile-brochure.pdf"
  echo "Copy your PDF into that path, then: git add parenting-workshop/mobile-brochure.pdf && git commit && git push"
  exit 1
fi

BYTES=$(wc -c <"$PDF" | tr -d ' ')
if [[ "$BYTES" -lt 1000 ]]; then
  echo "WARN: PDF is very small ($BYTES bytes) — wrong file?"
  exit 1
fi

echo "OK: mobile-brochure.pdf ($BYTES bytes)"
git -C "$ROOT" ls-files --error-unmatch parenting-workshop/mobile-brochure.pdf >/dev/null 2>&1 && \
  echo "OK: tracked by git" || \
  echo "NOT IN GIT: run git add parenting-workshop/mobile-brochure.pdf"
