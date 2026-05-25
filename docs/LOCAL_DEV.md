# 로컬 PC / VS Code에서 ER Website 열기

## ★ 배경 사진 넣는 곳 (가장 중요)

저장소를 clone 하면 **루트에 이 폴더가 생깁니다:**

```
ER-Website/photos-put-here/
```

VS Code 왼쪽 파일 트리 **맨 위**에서 `photos-put-here` → `읽어주세요.md` 를 읽고, 같은 폴더의 JPG 세 장을 교체하세요.

루트에 [`사진-넣는-곳.md`](../사진-넣는-곳.md) 파일도 안내용으로 있습니다.

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
| **배경 사진 (여기만 수정)** | `photos-put-here/*.jpg` |
| 모바일 브로셔 HTML | `parents-brochure.html` |
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
