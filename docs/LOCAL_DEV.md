# 로컬 PC / VS Code에서 ER Website 열기

Cursor Cloud Agent가 수정하는 코드는 **별도 숨겨진 폴더**가 아니라, GitHub의 **ER-Website** 저장소와 동일합니다.

## 1. 저장소 받기

```bash
git clone https://github.com/Jamiewsm/ER-Website.git
cd ER-Website
git pull origin main
```

VS Code: **File → Open Folder** → `ER-Website` 폴더 선택 (클론한 폴더 자체).

## 2. Parenting · 배경 사진 위치

| 용도 | 경로 (리포 루트 기준) |
|------|------------------------|
| 배경 사진 정본 | `assets/er-visual/hero-home.jpg`, `warm-hand.jpg`, `warm-candles.jpg` |
| 브로셔·QR | `assets/parents-brochure/` |
| 홈 배너 | `css/parenting-season-banner.css`, `js/parents-workshop-promo.js` |
| 모바일 브로셔 | `parents-brochure.html` |
| 웹 랜딩 | `parenting-workshop.html` |

사진 교체: [assets/README.md](../assets/README.md)

## 3. 로컬 미리보기

```bash
npx serve .
```

홈 배너: `http://localhost:3000/#home`

배너가 안 보이면 DevTools → Application → Local Storage에서  
`er_parenting_season_banner_dismissed_date` 삭제 후 새로고침.

## 4. 배너 닫기 동작

- **X**: 이번 방문만 숨김 → **새로고침하면 다시 표시**
- **오늘 하루 숨기기**: 당일 자정까지 숨김 (localStorage)

## 5. Cloud vs 내 PC

- Agent 작업: GitHub `main`에 머지 → `git pull` 하면 PC에 동일 경로 표시
- 라이브: https://er-coaching.com
