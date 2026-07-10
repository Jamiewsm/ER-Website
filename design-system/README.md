# ER Design System 번들 — claude.ai/design 연동용

이 디렉토리는 ER "Restoration Green" 디자인 시스템을 **claude.ai/design (Claude Design)** 프로젝트로 업로드하기 위한 컴포넌트 카드 번들입니다. 각 카드는 첫 줄의 `<!-- @dsCard name="…" group="…" -->` 마커로 Design System pane에 자동 등록됩니다.

## 구성

```
design-system/
├── tokens.css              # CSS 변수 토큰 (DESIGN.md와 동기화)
├── font-comparison.html    # 서체 비교 (참고용, @dsCard 아님)
└── cards/
    ├── colors.html         # Foundations · 팔레트
    ├── typography.html     # Foundations · 타이포 (SUIT Display + Pretendard)
    ├── buttons.html        # Components · 버튼 위계 (er-green primary)
    ├── badges-inputs.html  # Components · 태그·배지·인포 스트립·입력
    ├── cards.html          # Components · 카드 패턴 + 인용(Pretendard)
    ├── hero.html           # Screens · 홈 히어로 패턴
    └── test-ui.html        # Screens · 검사 UI (1문항+진행률, terra 결과지 전용)
```

값의 단일 기준은 저장소 루트의 [DESIGN.md](../DESIGN.md)입니다. 토큰 값을 바꿀 때는 DESIGN.md → `index.html` tailwind config → `tokens.css` → `cards/*.html` 순서로 함께 갱신하세요.

**2026-07-10 타입 시스템:** MaruBuri 폐기 → **SUIT** Display. Primary CTA **er-green**. greenTint **#F0EDE4**.

## claude.ai/design에 업로드하는 법

Claude Code 대화형 세션(터미널)에서 한 번만 인증하면 됩니다.

1. 대화형 세션에서 `/design-login` 실행 (claude.ai 로그인에 design-system 권한 부여).
2. Claude에게 요청: "design-system/ 번들을 claude design 프로젝트로 업로드해줘".
   Claude가 DesignSync로 `list_projects → create_project("ER Design System") → finalize_plan(writes: design-system/**) → write_files` 순서로 처리합니다.
3. 이후 토큰·카드가 바뀌면 같은 요청으로 변경분만 다시 업로드합니다 (전체 교체 금지, 파일 단위 증분).

claude.ai/code(웹)에서는 Claude Design의 "Send to Claude Code Web" 기능으로 프로젝트를 워크스페이스에 시드할 수도 있습니다.

## 로컬 미리보기

브라우저에서 `design-system/cards/*.html` 또는 `design-system/font-comparison.html`을 바로 열면 됩니다 (Pretendard·SUIT는 CDN 로드).
