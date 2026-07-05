# ER Design System — "Restoration Green"

> 모든 시각적 결정의 단일 기준 문서. 새 페이지·컴포넌트 작업 전 반드시 이 문서를 먼저 읽을 것.
> 2026-07-06 전면 개정 — 기존 카라멜 브라운 시스템을 폐기하고, 홈 화면의 세이지 그린 팔레트를 공식 브랜드 시스템으로 승격함.

---

## Brand Identity

**ER** (Enneagram for Restoration)는 기독교 세계관과 에니어그램을 통합한 유료 코칭 서비스다.
톤: **따뜻하고, 전문적이며, 신뢰할 수 있는** — 병원처럼 차갑지 않게, 교회 주보처럼 종교적이지 않게.

**기억에 남아야 할 한 가지:** "조용히 회복되는 공간" — 크림빛 종이 위의 깊은 세이지 그린.
모든 디자인 결정은 이 인상을 지켜야 한다. 화려함·긴박함·세일즈 압박은 이 브랜드와 어긋난다.

---

## Color Palette

모든 색은 `index.html`의 Tailwind 토큰으로만 사용한다. **hex 하드코딩 금지.**

### Core tokens

| Token | Hex | Usage |
|---|---|---|
| `er-base` | `#FBFAF5` | 페이지 배경 — 웜 페이퍼 크림 |
| `er-surface` | `#FFFDF8` | 카드·모달 배경 — 밝은 크림 |
| `er-sand` | `#E2D8C8` | 보더, 디바이더, 소프트 구분 블록 |
| `er-ink` | `#202219` | 최상위 제목, primary CTA 배경 — 딥 올리브 잉크 |
| `er-inkSoft` | `#30322D` | 섹션 제목, 강조 텍스트 |
| `er-body` | `#44473F` | 본문 텍스트 |
| `er-muted` | `#6F7068` | 보조·캡션 텍스트 |
| `er-green` | `#657453` | 브랜드 액센트 — 세이지 그린 (링크, 아이콘, 강조) |
| `er-greenDark` | `#566647` | 액센트 hover/active |
| `er-greenDeep` | `#30451F` | 드문 최고 강조 (히어로 키워드 등) |
| `er-greenTint` | `#EEF3E6` | 태그·배지·hover 틴트 배경 |
| `er-terra` | `#B06149` | 유일한 웜 액센트 — 검사 결과 하이라이트, 감정 강조 전용 |
| `er-terraDark` | `#8F4634` | 테라코타 hover/진한 용도 |

### Rules

- **Primary CTA 배경은 `er-ink`.** 순수 검정(`#000`) 금지.
- **`er-green`은 흰/크림 배경 텍스트로 사용 가능** (명암비 ≈5:1, AA 통과). 구 브라운 `#B89170`은 AA 미달이었으므로 완전 폐기.
- **`er-terra`는 예산제 색이다.** 한 화면에 한 번, 검사 결과·감정적 하이라이트에만. 일반 UI에 쓰지 않는다. 텍스트로 쓸 때는 bold 이상 굵기 권장(명암비 ≈4.5:1로 AA 경계).
- **태그/배지 배경은 `er-greenTint`.** 솔리드 액센트 배경 금지.
- **Amber(`bg-amber-*`)는 사역지원(ministry) 신호 전용.** 그 외 용도 금지.

### Migration status (2026-07-06 기준)

| 영역 | 현재 상태 | 할 일 |
|---|---|---|
| 홈 (`js/sections/home.js`) | 이 팔레트를 hex 하드코딩으로 사용 중 | 하드코딩 → 토큰 클래스 치환 |
| 내부 페이지 (`programs/parenting/about/apply` 등) | 구 브라운 토큰(`er-accent #B89170`) 사용 중 | 토큰 재정의로 일괄 이전 |
| 검사 (`css/test.css`) | 자체 테라코타 팔레트 | `er-base/ink/green` 기반으로 재도색, 테라코타는 결과 강조로 축소 |
| `index.html` tailwind.config | 구 브라운 토큰 정의 | 위 Core tokens로 교체 |

---

## Typography

| 역할 | 서체 | 로딩 |
|---|---|---|
| Display (감성 헤드라인) | **MaruBuri (마루 부리)** | `https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css` |
| Body / UI | **Pretendard** | 기존 jsdelivr CDN 유지 |
| 숫자·데이터 | Pretendard + `tabular-nums` | — |

**MaruBuri 사용 범위 (엄격):** 히어로 H1, 인용문(후기 pull quote), 검사 결과지의 감성 문장. 그 외 모든 곳은 Pretendard. 세리프가 흔해지면 특별함이 죽는다 — 한 화면에 한 번이 원칙.

### Scale

| Scale | Class | Usage |
|---|---|---|
| Display | `font-display text-4xl md:text-6xl font-bold leading-[1.25]` | 히어로 H1 전용 (MaruBuri) |
| Page H1 | `text-3xl md:text-4xl font-bold` | 섹션 진입 제목 |
| Section H2 | `text-2xl font-bold` | 하위 섹션 제목 |
| Card title | `text-xl font-bold` | 카드 제목 |
| Body | `text-base leading-relaxed text-er-body` | 본문 |
| Caption | `text-sm text-er-muted` | 보조 정보, 라벨 |
| Label/Tag | `text-xs font-bold tracking-widest uppercase` | 메타데이터 — 최소한으로 |

### Copy rules

- 모든 한국어 제목에 `break-keep` (어색한 줄바꿈 방지).
- 제목 line-height `leading-snug`(1.375), 단 MaruBuri Display는 1.25 이상 확보.
- 본문 line-height `leading-relaxed`(1.625).
- 본문 컬럼 최대 폭 `max-w-xl`(~672px).
- 세일즈 카피 금지어: "완벽한 솔루션", "지금 바로", 과도한 느낌표. 브랜드는 조용히 말한다.

---

## Spacing & Layout

**Max widths**

- 풀폭 섹션(히어로, 마케팅) `max-w-7xl`
- 콘텐츠 페이지(코치, 프로그램) `max-w-4xl`
- 읽기 콘텐츠(소개, 사역지원) `max-w-3xl`

**Page padding** `px-4 sm:px-6 lg:px-8`
**Section rhythm** 주요 섹션 `py-12 md:py-20`, 콘텐츠 페이지 `pt-8 pb-20`
**Card gaps** 수직 스택 카드 `gap-8`
**Base unit** 4px — 임의 값(`p-[13px]` 등) 금지

**Border radius** — 계층 스케일: 입력·작은 요소 `rounded-xl`(12px), 카드 `rounded-[2rem]`, 버튼·태그 `rounded-full`. 전부 같은 radius로 통일하는 것 금지(AI 슬롭 신호).

---

## Component Patterns

### Buttons

```
Primary CTA: bg-er-ink text-white rounded-full font-bold px-7 py-3.5
             hover:bg-er-inkSoft hover:-translate-y-0.5 transition-all shadow-soft active:scale-95
Secondary:   bg-er-surface text-er-ink border border-er-sand rounded-full font-bold (동일 패딩)
Text link:   text-er-green font-bold underline underline-offset-2 hover:text-er-greenDark
Destructive: red-600 사용, er-terra 금지 (테라코타는 에러가 아님)
```

**Rule:** 한 뷰포트에 primary CTA는 하나. 같은 화면에 "상담 신청"이 두 번 보이면 하나를 secondary로 강등.

### Cards

```
Primary card: bg-er-surface rounded-[2rem] shadow-card border border-er-sand/50
Tint card:    bg-er-greenTint rounded-[2rem] (강조 블록, 추천 대상 안내 등)
```

**Rule:** 카드는 존재 이유가 있어야 한다. 카드 자체가 선택 단위일 때만(코치 프로필, 프로그램). 장식용 카드 그리드 금지.
**Rule:** 글래스모피즘(`glass`)·블러 오브는 신규 페이지에 추가하지 않는다. 기존 홈에서만 단계적 축소.

### Tags / Badges

```
일반 태그:      inline-block px-3 py-1 rounded-full bg-er-greenTint text-er-inkSoft text-xs font-semibold
사역지원 배지:  bg-amber-50 border border-amber-200 text-amber-700 rounded-full
자격 배지:      border border-er-green/30 text-er-green rounded-full
```

### Compact Info Strip

한 줄짜리 보조 공지는 풀사이즈 info box 대신 아래 패턴을 사용한다.

```
rounded-full bg-er-greenTint border border-er-green/20 px-4 py-2.5 flex items-center gap-3 text-xs
```

### Animations

| Token | Usage |
|---|---|
| `animate-fade-in-up` | 페이지 진입, 카드 등장 |
| `animate-fade-in` | 히어로 이미지 |
| `floating-card` | 카드 hover 시 미세 부양 |

**Rule:** 한 페이지에 의도된 모션 2~3개까지. `animation-fill-mode: both` 필수.

---

## Page Templates

### Marketing/Content Page

```
구조: max-w-4xl mx-auto px-4 sm:px-6
헤더: 좌측 정렬 H1 + 부제 (중앙 정렬 배지+제목 패턴 금지 — AI 슬롭)
콘텐츠: flex-col gap-8 카드
CTA: 콘텐츠 뒤 중앙 하단 CTA 1개
배경: bg-er-base
```

### Hero/Landing (home)

```
구조: max-w-7xl, lg:grid-cols-2
좌: MaruBuri 헤드라인(er-inkSoft, 키워드만 er-greenDeep) + 서브카피 + 듀얼 CTA
우: 실사 사진 (일러스트·스톡 3D 금지 — 실사 무드가 브랜드 차별점)
직하단: 신뢰 지표 스트립 (400+ / 98% / 10년+ / 4.9)
```

### 검사(test) UI — 프리미엄 원칙

검사는 ER의 핵심 전환 상품이므로 마케팅 페이지와 같은 완성도를 가져야 한다.

- 문항 벽 나열 금지 — 한 화면에 문항 1개(또는 소그룹) + 진행률 표시.
- 배경 `er-base`, 문항 카드 `er-surface`, 선택 상태 `er-green`.
- 결과지 하이라이트에만 `er-terra` 허용 (이 색의 유일한 서식지).

---

## AI Slop Avoidance (금지 패턴)

1. ❌ 중앙 정렬 배지 + H1 + 설명 헤더
2. ❌ 3열 아이콘 원형 배경 피처 그리드
3. ❌ 보라/바이올렛/인디고 그라디언트
4. ❌ 장식용 블러 오브 추가 (기존 것도 축소 대상)
5. ❌ 제목 속 이모지
6. ❌ 카드 `border-left: 3px solid` 액센트
7. ❌ 일반 카피: "당신의 여정을 위한 완벽한 솔루션"
8. ❌ 전 요소 동일 border-radius

**대신:** 페이지 헤더는 좌측 정렬, 제품 라벨이 아니라 사람과 결과로 시작.

---

## Ministry Track UX

사역지원(목회자·선교사 무료 트랙)은 보조 서비스다.

- Amber 계열은 ministry 신호 전용.
- ministry 공지는 보조 맥락인 페이지에서 1줄 compact strip으로.
- ministry CTA는 `track: 'support'`로 연결 (`track: 'paid'` 금지).

---

## Responsive Principles

- 모바일 퍼스트 — 기본 클래스는 모바일, `md:`/`lg:`로 확장.
- 코치/프로그램 카드는 `flex-col md:flex-row`.
- 터치 타겟 최소 44px.
- 모바일 H1 최대 `text-3xl` (MaruBuri Display는 모바일 `text-4xl`까지 허용).
- `user-scalable=no` 제거 대상 (접근성 위반 — 마이그레이션 시 수정).

---

## Accessibility (Minimum Bar)

- 모든 `<img>`에 의미 있는 `alt`.
- 장식 아이콘은 `aria-hidden="true"`.
- 본문 텍스트 WCAG AA(4.5:1), 큰 텍스트 3:1.
- `er-muted`(#6F7068)는 크림 배경에서 AA 통과. 구 `#AA9889`는 폐기.
- `er-terra`를 작은 일반 굵기 텍스트로 쓰지 않는다(AA 경계값).
- SPA 섹션 전환 시 `#sr-status`로 스크린리더 공지.
- 포커스 링 전역 억제 금지.

---

## Governance

1. **색은 토큰으로만.** 섹션 JS·CSS에 hex 하드코딩 발견 시 리팩터 대상.
2. **새 페이지는 이 문서 기준.** 기존 브라운 페이지와 어울리게 만들지 말 것 — 새 시스템 기준으로 만들고 마이그레이션을 앞당긴다.
3. **QA 모드에서는 이 문서와 어긋나는 코드를 플래그.**
4. 시스템 변경은 반드시 이 문서 수정 + Decisions Log 기록과 함께.

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-06 | 브라운 시스템 폐기, 홈의 세이지 그린을 공식 시스템으로 승격 | 퍼널 내 3개 팔레트 분열 해소. 홈이 완성도 최고, 그린은 AA 명암비 통과(브라운은 미달), 한국 프리미엄 웰니스 코드 부합 |
| 2026-07-06 | MaruBuri를 Display 서체로 도입 | Pretendard 단일 서체는 카테고리 평균에 머무름. "회복" 정서를 세리프로 운반, 무료 폰트로 비용 없음 |
| 2026-07-06 | 테라코타를 "예산제 웜 액센트"로 편입 | 검사 페이지 자산을 버리지 않고 결과지 하이라이트 전용으로 역할 축소 |
| 2026-07-06 | 검사 UI 프리미엄 원칙 신설 | 핵심 전환 상품이 가장 저품질로 보이는 문제 — 문항 벽 나열 금지, 1문항+진행률 플로우 |

---

## What Does NOT Belong Here

- 비즈니스 로직, 가격, 서비스 설명 → `js/strings.js`
- 라우팅 → `js/app-core.js`
- 섹션 콘텐츠 → `js/sections/*.js`
