#!/usr/bin/env bash
# Copy photos-put-here → assets/parents-brochure/bg-*.jpg (인쇄·QR 문서용 복사본)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/photos-put-here"
DST="$ROOT/assets/parents-brochure"

for f in hero-home.jpg warm-hand.jpg warm-candles.jpg; do
  if [[ ! -f "$SRC/$f" ]]; then
    echo "Missing: $SRC/$f" >&2
    exit 1
  fi
done

cp "$SRC/hero-home.jpg" "$DST/bg-01-cover.jpg"
cp "$SRC/hero-home.jpg" "$DST/bg-03-vision.jpg"
cp "$SRC/hero-home.jpg" "$DST/bg-06-apply.jpg"
cp "$SRC/warm-hand.jpg" "$DST/bg-02-empathy.jpg"
cp "$SRC/warm-candles.jpg" "$DST/bg-04-features.jpg"
cp "$SRC/warm-candles.jpg" "$DST/bg-05-curriculum.jpg"
echo "Synced brochure bg-*.jpg from photos-put-here/"
