# 로컬 PC / VS Code에서 ER Website 열기

## ★ Parenting 브로셔 PNG (디자인 정본)

```
ER-Website/parenting-workshop/mb1.png … mb6.png
```

Canva **목업 PNG = 최종 디자인**. `/parents-brochure.html` 은 6장 스와이프 뷰어만 제공합니다.  
**ER 웹사이트에는 모바일 브로셔 버튼을 두지 않습니다** — PNG/PDF·카톡·인쇄로 배포.

mb6 QR: Canva에 `assets/parents-brochure/qr-apply.png` 를 넣어 보내기.

[`parenting-workshop/읽어주세요.md`](../parenting-workshop/읽어주세요.md) · [`콘텐츠-검토.md`](../parenting-workshop/콘텐츠-검토.md)

---

## 1. 저장소 받기 (로컬에 폴더 만들기)

```bash
git clone https://github.com/Jamiewsm/ER-Website.git
cd ER-Website
git pull origin main
```

VS Code: **File → Open Folder** → 방금 만든 `ER-Website` 폴더.

## 2. 파일 위치 요약

| 용도 | 경로 |
|------|------|
| **브로셔 PNG** | `parenting-workshop/mb1.png` … `mb6.png` |
| (선택) PNG 뷰어 URL | `parents-brochure.html` |
| 웹 랜딩 | `parenting-workshop.html` |
| 홈 배너 | `js/parents-workshop-promo.js` |

## 3. 로컬 미리보기

```bash
cd ER-Website
npx serve .
```

브라우저: `http://localhost:3000/#home` · 브로셔: `http://localhost:3000/parents-brochure.html`

## 4. 배포 사이트

https://er-coaching.com — `main` 머지 후 Cloudflare 등에 반영됩니다.
