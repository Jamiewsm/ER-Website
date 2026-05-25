# PNG · QR · 카톡 보내기

## 정본

`parenting-workshop/mb1.png` … `mb6.png` (Canva에서 보내기)

웹 브로셔 페이지는 사용하지 않습니다. **카톡·인스타·인쇄에 PNG/PDF로 배포**합니다.

## 카카오톡

1. Canva에서 mb1–mb6 PNG보내기
2. 카톡 채팅에 **사진 6장** 순서대로 전송 (표지 → 신청)
3. 또는 PDF로 묶어 **파일**로 전송

마지막 장(mb6)에 ER QR이 포함되어 있어야 합니다.

## QR

- 파일: `assets/parents-brochure/qr-apply.png`
- URL: `https://er-coaching.com/parenting-workshop.html?apply_source=qr`
- 재생성:

```bash
curl -sL "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fer-coaching.com%2Fparenting-workshop.html%3Fapply_source%3Dqr" \
  -o assets/parents-brochure/qr-apply.png
```

## Instagram

- Story/Reels: PNG 9:16 업로드
- 링크 스티커: `https://er-coaching.com/parenting-workshop.html?apply_source=instagram`

## 짧은 홍보 문구 (카톡 텍스트 + 링크)

```
Enneagram for Parenting — 4주 자녀양육 워크샵
양육의 변화는 부모의 자기이해에서 시작됩니다.
6월–7월 · Zoom · $120 · 소규모 선착순
안내·신청: https://er-coaching.com/parenting-workshop.html
```

(이미지는 위 PNG 6장을 따로 보냅니다.)
