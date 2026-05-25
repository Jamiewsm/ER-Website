# 로컬 PC / VS Code에서 ER Website 열기

## ★ Parenting 브로셔 PNG (디자인 정본)

```
ER-Website/parenting-workshop/mb1.png … mb6.png
```

목업 PNG = 최종 디자인. `/parents-brochure.html` 은 6장 스와이프만 합니다. **사이트 메뉴·공지에 브로셔 버튼 없음.**

mb6 QR: Canva에 `assets/parents-brochure/qr-apply.png` 포함 후 보내기.

[`parenting-workshop/읽어주세요.md`](../parenting-workshop/읽어주세요.md)

---

## 1. 저장소 받기 (로컬에 폴더 만들기)

```bash
git clone https://github.com/Jamiewsm/ER-Website.git
cd ER-Website
git pull origin main
```

VS Code: **File → Open Folder** → 방금 만든 `ER-Website` 폴더.

> Agent가 만든 코드는 GitHub `main` 에 있습니다. PC에 예전 clone 만 있으면 `photos-put-here` 가 없을 수 있습니다. **`git pull origin main`** 또는 새로 clone 하세요.

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

브라우저: `http://localhost:3000/#home`

## 4. 배포 사이트

https://er-coaching.com — `main` 머지 후 Cloudflare 등에 반영됩니다.
