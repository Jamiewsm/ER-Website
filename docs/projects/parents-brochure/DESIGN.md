# Enneagram for Parenting — Design Spec

브로셔 전용 시각 가이드. 사이트 SSOT [DESIGN.md](../../../DESIGN.md) 와 함께 사용합니다.

## Mood

따뜻함 · 신뢰 · 영적 깊이 · 소규모 프리미엄 · 회복적 초대

피할 것: 가벼운 성격검사 홍보, 상업적 육아 강의, “아이를 고치는 법” 메시지.

## CSS variables (`css/parents-brochure.css`)

| Token | Hex | Maps to ER |
|-------|-----|-----------|
| `--pb-bg` | `#F7EEE4` | `er-base` |
| `--pb-surface` | `#FFFBF6` | `er-surface` |
| `--pb-text` | `#3E362E` | `er-dark` |
| `--pb-body` | `#5C4F44` | body |
| `--pb-muted` | `#8A7A6B` | captions |
| `--pb-gold` | `#B89170` | `er-accent` |
| `--pb-terracotta` | `#C47A5A` | accent alt |
| `--pb-olive` | `#6B7B5C` | accent alt |
| `--pb-cta` | `#3E362E` | primary CTA (`er-dark`) |

## Layout

- Viewport: `100dvh` per slide, `scroll-snap-type: y mandatory`
- Frame: `max-width: 430px`, centered on desktop
- Export aspect: **9:16** (1080×1920px target for PNG)

## Typography

- Family: Pretendard (CDN, same as site)
- Cover title: ~1.75–2rem, bold
- Body: min **16px** (1rem), comfortable **18px** where space allows
- Line height: 1.55–1.65 for Korean body
- `word-break: keep-all` on headings

## Components

- **Badge:** pill, terracotta/olive tint, small caps optional
- **Quote cards:** left border gold, cream surface
- **Feature cards:** 2×2 grid on page 4, line icon top
- **Timeline:** vertical line + week nodes (page 5)
- **Info cards:** page 6 grid, label + value
- **CTA:** full-width, min-height 48px, rounded-full
- **QR:** min 120×120px display

## Icons (Page 4–5)

Font Awesome 6 (CDN): `users`, `chalkboard-user`, `bullseye`, `cross`, `calendar`, `video`

## Imagery (PNG 브로셔 — 현재 정본)

디자인 PNG 6장: [`parenting-workshop/`](../../../parenting-workshop/) (`mb1.png` … `mb6.png`, 1080×1920 권장).

웹: `parents-brochure.html` · `pb-mode-png` · 페이지 6 QR만 `assets/parents-brochure/qr-apply.png` 오버레이.

QR 위치 튜닝: `css/parents-brochure.css` → `--pb-qr-bottom`, `--pb-qr-width`.

카피 검토: [`parenting-workshop/콘텐츠-검토.md`](../../../parenting-workshop/콘텐츠-검토.md)

### (레거시) HTML + JPG 브로셔

`photos-put-here/` + glass 카드 — PNG 전환 이전 방식. [`photos-put-here/읽어주세요.md`](../../../photos-put-here/읽어주세요.md)
