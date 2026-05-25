# ER Website — 이미지 에셋 (배경 사진)

배경 사진을 바꿀 때는 **아래 폴더에 JPEG를 넣고**, 표에 맞는 **파일명**을 유지하세요. CSS는 이 경로를 참조합니다.

## 1. 정본 (권장) — `assets/er-visual/`

홈 히어로·브로셔·랜딩이 **같은 톤**을 쓰도록 설계된 마스터 세트입니다.

| 파일명 | 용도 | 권장 |
|--------|------|------|
| `hero-home.jpg` | 홈 첫 화면과 동일한 톤 · 브로셔 1·3·6페이지 · 웹 랜딩 히어로 | 가로 1920px+, JPG 80% 전후 |
| `warm-hand.jpg` | 브로셔 2페이지 (공감) | 따뜻한 빛, 연결·성찰 |
| `warm-candles.jpg` | 브로셔 4·5페이지 (특징·커리큘럼) | 차분한 촛불/실내 |

**교체 방법:** 위 파일을 덮어쓰기만 하면 `css/parents-brochure.css`, `css/parenting-workshop-landing.css`, 홈 팝업/배너가 함께 반영됩니다.

절대 경로 (리포 루트 기준):

```
/workspace/assets/er-visual/hero-home.jpg
/workspace/assets/er-visual/warm-hand.jpg
/workspace/assets/er-visual/warm-candles.jpg
```

## 2. 브로셔·인쇄용 복사본 — `assets/parents-brochure/`

| 파일명 | 비고 |
|--------|------|
| `bg-01-cover.jpg` … `bg-06-apply.jpg` | PDF/PNG보내기·구 QR 문서용. `er-visual`에서 복사해 두었으며, **직접 수정 시** `css/parents-brochure.css`가 `er-visual`을 쓰므로 **er-visual만 바꿔도 됨** |
| `qr-apply.png` | QR 코드 (URL 변경 시 `docs/projects/parents-brochure/EXPORT.md` 참고) |

```
/workspace/assets/parents-brochure/
```

## 3. 로고 (배경 아님)

| 파일 | 위치 |
|------|------|
| ER 헤더 로고 | `/ER-logo-header.png` (리포 루트) |
| ER 푸터 로고 | `/ER-logo-footer.png` |

브로셔 상단 로고는 `ER-logo-header.png`를 사용합니다.

## 4. 홈 히어로 (외부 URL)

SPA 홈(`js/sections/home.js`)은 현재 Unsplash URL을 쓰며, 로컬 `hero-home.jpg`와 **같은 사진**을 맞춰 두었습니다. 홈까지 로컬만 쓰려면 `home.js`의 `<img src="...">`를 `/assets/er-visual/hero-home.jpg`로 바꾸면 됩니다.

## 5. 사진 가이드 (톤)

- 크림·웜 베이지 오버레이와 어울리는 **부드러운 빛**, 과한 채도·차가운 톤 지양  
- “육아 스톡” 느낌보다 **회복·성찰·초대** (홈 매거진 톤)  
- 자세한 디자인 토큰: `docs/projects/parents-brochure/DESIGN.md`
