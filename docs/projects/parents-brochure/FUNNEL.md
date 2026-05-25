# Parenting 워크샵 — 유입 경로

```mermaid
flowchart TD
  popup[홈_배너] --> landing[parenting-workshop.html]
  qr[QR_인쇄물_mb6] --> landing
  kakao[카톡_PNG_6장] --> landing
  site[공지] --> landing
  landing --> apply["/#apply?focus=parenting_workshop"]
```

| 채널 | 역할 |
|------|------|
| **카톡 PNG** | `parenting-workshop/mb1–mb6.png` — 홍보 스토리 (웹 URL 없음) |
| [parenting-workshop.html](../../../parenting-workshop.html) | 웹 랜딩 · 신청 CTA |
| [parents-workshop.html](../../../parents-workshop.html) | 구 URL → 랜딩 리다이렉트 |
| `#apply?focus=parenting_workshop` | 신청 폼 |

QR(mb6)는 **랜딩**만 가리킵니다.
