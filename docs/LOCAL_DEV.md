# 로컬 PC / VS Code에서 ER Website 열기

## ★ 모바일 브로셔 PNG (가장 중요 — Canva/디자인보내기)

```
ER-Website/parenting-workshop/
  mb1.png … mb6.png
```

VS Code에서 **`parenting-workshop`** 폴더에 PNG 6장을 넣으면 `/parents-brochure.html` 이 그대로 표시합니다.  
안내: [`parenting-workshop/읽어주세요.md`](../parenting-workshop/읽어주세요.md) · 카피 검토: [`콘텐츠-검토.md`](../parenting-workshop/콘텐츠-검토.md)

마지막 페이지(mb6)의 QR은 디자인 PNG 위에 **ER `qr-apply.png`** 가 덮입니다. 위치 조정: `css/parents-brochure.css` 의 `--pb-qr-bottom` 등.

## (구) 배경 JPG — HTML 텍스트 브로셔용

PNG 브로셔를 쓰면 `photos-put-here/` 는 필요 없습니다. 레거시 참고:

```
ER-Website/photos-put-here/
```

루트 [`사진-넣는-곳.md`](../사진-넣는-곳.md) 참고.

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
| **브로셔 PNG (여기만 수정)** | `parenting-workshop/mb1.png` … `mb6.png` |
| 모바일 브로셔 HTML | `parents-brochure.html` |
| ER QR (mb6 교체용) | `assets/parents-brochure/qr-apply.png` |
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
