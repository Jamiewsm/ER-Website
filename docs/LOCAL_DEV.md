# 로컬 PC / VS Code에서 ER Website 열기

## ★ Parenting 브로셔 PNG (카톡·인스타용)

```
ER-Website/parenting-workshop/mb1.png … mb6.png
```

Canva 목업 = 최종 디자인. **카톡으로 PNG 6장을내면 됩니다** (웹 브로셔 페이지 없음).

mb6 QR: Canva에 `assets/parents-brochure/qr-apply.png` 포함 후 보내기.

[`parenting-workshop/읽어주세요.md`](../parenting-workshop/읽어주세요.md)

---

## 1. 저장소 받기

```bash
git clone https://github.com/Jamiewsm/ER-Website.git
cd ER-Website
git pull origin main
```

VS Code: **File → Open Folder** → `ER-Website`

## 2. 파일 위치

| 용도 | 경로 |
|------|------|
| **브로셔 PNG** | `parenting-workshop/mb1.png` … `mb6.png` |
| 웹 랜딩 | `parenting-workshop.html` |
| QR (Canva용) | `assets/parents-brochure/qr-apply.png` |

## 3. 로컬 미리보기 (사이트만)

```bash
npx serve .
```

`http://localhost:3000/#home` · `http://localhost:3000/parenting-workshop.html`

## 4. 배포

https://er-coaching.com
