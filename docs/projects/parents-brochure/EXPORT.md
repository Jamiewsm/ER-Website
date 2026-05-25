# PDF · PNG · QR보내기

## 웹 브로셔 (1차 채널)

- Production: `https://er-coaching.com/parents-brochure.html`
- Local: `npx serve .` 또는 정적 서버 후 `/parents-brochure.html`

신청 링크·QR은 **웹 URL**을 기준으로 합니다. PDF는 보조 자료입니다.

## PDF (링크 포함)

1. Chrome에서 브로셔 URL 열기
2. 인쇄 → 대상 **PDF로 저장**
3. **배경 그래픽** 켜기
4. 용지: 사용자 지정 또는 세로; 여백 **없음** 또는 최소
5. 저장 후 PDF 뷰어에서 **워크샵 신청하기** 링크·이메일 링크 클릭 테스트

> 일부 뷰어는 해시 라우트(`#apply?...`) 링크를 제한할 수 있습니다. 그 경우 CTA는 절대 URL `https://er-coaching.com/#apply?track=paid&focus=parents_workshop` 로 확인합니다.

## PNG 6장 (1080×1920, 9:16)

**방법 A — 실기기**

1. 폰에서 브로셔 열기
2. 페이지별 스크린샷 (스크롤 스냅으로 한 화면씩)
3. 필요 시 1080×1920으로 리사이즈 (Figma/Canva/Photoshop)

**방법 B — DevTools**

1. Chrome DevTools → 기기 툴바
2. 430×932 (또는 iPhone 14 Pro)
3. 각 섹션까지 스크롤 후 **Capture screenshot** (전체 페이지가 아닌 뷰포트 캡처 권장)

**방법 C — Playwright (선택)**

```bash
# package.json 추가 후
npm install -D playwright
node scripts/export-parents-brochure.mjs
```

출력: `artifacts/parents-brochure/page-01.png` … `page-06.png`

## QR 코드

- 정본 이미지: `assets/parents-brochure/qr-apply.png`
- 인코딩 URL (QR): `https://er-coaching.com/parents-workshop.html` — 짧은 랜딩 → 신청 버튼
- 신청 폼 직접 링크: `https://er-coaching.com/#apply?track=paid&focus=parents_workshop`
- 재생성:

```bash
curl -sL "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fer-coaching.com%2F%23apply%3Ftrack%3Dpaid%26focus%3Dparents_workshop" \
  -o assets/parents-brochure/qr-apply.png
```

## Instagram · Kakao 공유

- Story/Reels: PNG 9:16 그대로 업로드
- 링크 스티커: `parents-brochure.html` 또는 apply URL
- Carousel(1:1): 선택 산출물 — `COPY.md` 기준으로 Canva에서 재레이아웃

## 짧은 홍보 문구 (선택)

```
Enneagram for Parents — 나를 알고, 아이를 이해하는 4주 워크샵.
양육의 변화는 부모의 자기이해에서 시작됩니다.
소규모 선착순 · 6월–7월 · 온라인 Zoom · $120
브로셔: https://er-coaching.com/parents-brochure.html
```
