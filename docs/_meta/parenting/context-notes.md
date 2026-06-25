# Parenting 상위 메뉴 — 컨텍스트 노트

작업 결정과 근거 기록. 계속 추가.

## 아키텍처 사실 (탐색 결과)
- 사이트는 해시 라우팅 SPA. `index.html`이 `js/sections/*.js` + `js/app-core.js`(라우터) 로드.
- `renderSection(id, payload, opts)` → `#main-content` innerHTML 교체 + 해시 동기화. 라우터는 `js/app-core.js`.
- **`js/main.js` / `main.js.bak` 는 로드되지 않는 레거시 사본. 건드리지 않음.**
- 섹션 렌더러는 각 파일에서 `function renderXxx()` 로 정의되어 전역에 노출. innerHTML 안의 `<script>` 는 실행 안 됨 → 동작은 app-core post-render 훅이나 onclick으로 처리.
- 푸터/네비는 index.html에 3곳(데스크탑 nav, 모바일 메뉴, 푸터 링크행)에 중복 존재 → 3곳 모두 수정 필요.

## 기존 양육 자료 (재배치 대상, 재제작 금지)
- 아이 유형검사: 독립 페이지 `child-type-test/child-type-test.html` (`<a href>` 링크).
- 4주 자녀양육 심화: `program-catalog.js` `parenting_workshop` + `apply?focus=parenting_workshop` + `parenting-workshop.html`.
- 양육 코칭 상담: `apply?focus=parenting` (apply.js focusConfig에 이미 존재: "자녀 양육 코칭 상담").
- 부모/아이 자료 PDF·HTML: `docs/parent_resources/` (엄마유형 특징, 아이 관찰 체크리스트).
- 양육 인스타: https://www.instagram.com/er_parenting/

## 메뉴 매핑 결정 (전면 재구성)
사용자 승인: 상단 메뉴 전면 재구성. 7개 상위 항목으로 재편하며 기존 모든 기능을 재배치.

| 신규 상위 | 동작 | 흡수한 기존 항목 |
|---|---|---|
| ER 소개 ▾ | about / coaches / support | 코치 소개·사역지원 흡수 |
| 유형검사 ▾ | test / types_guide | 유형 알아보기를 흡수 |
| Parenting ▾ | parenting(+focus) / child-type-test / apply(parenting·parenting_workshop) | 신규 + 아이 유형검사 이전 |
| 관계·부부 | programs?tab=individual | 서비스 안내(개인/가정)에서 분리 |
| 조직·리더십 ▾ | programs?tab=church / programs?tab=business | 서비스 안내(기관·기업)에서 분리 |
| 전문가 과정 | coach_training | 전문가 양성반 |
| 회복 이야기 ▾ | community / notices | 공지사항 흡수 |

근거: 고객은 "서비스"가 아니라 자기 문제영역(아이/부부/조직/자기이해)으로 진입 → 문제영역을 전면 노출.

## 알려진 후속(이번 범위 밖)
- `programs` 섹션 히어로 타이틀은 여전히 "서비스 안내" → 관계·부부/조직·리더십 라벨과 약간 불일치. programs 내부 재라벨은 차기.
- 부모 양육성향 검사(신규 문항·채점)는 차기. 이번엔 안내/예약 CTA만.
- 81개 부모×아이 조합 엔진은 차기. 이번엔 대표 조합 3~6개 예시만 공개.
- 클린 URL `/parenting/...` 은 정적 호스팅(GitHub Pages) 구조 변경 필요 → 차기. 현재는 해시 `#parenting?focus=...`.

## Parenting focus 앵커
`parenting?focus=child|parent|guide` → 해당 섹션 id(`parenting-child` 등)로 post-render 스크롤.

## Phase 2 (branch `feat/parenting-phase-2`, MVP PR #80 위 스택)
MVP를 "보이는 랜딩"에서 "전환되는 여정"으로 다듬음. track: site only.

- **B1 programs 재라벨** (`js/sections/programs.js`): 히어로 "서비스 안내"→"코칭·프로그램 안내", 탭 라벨 개인/가정·기관/교회·기업/팀 → 관계·부부·기관·교회·기업·팀, individual.title→"관계·부부 코칭". individual 문제카드 순서 부부·자기이해 우선, 양육 카드는 `to:'parenting'` 로 Parenting 여정 유도(문제카드 렌더에 `to` 분기 추가).
- **B2 Parenting 랜딩 polish** (`js/sections/parenting.js`):
  - 무료 아티클 8개 클릭 가능 → `openParentingArticle(idx)` 모달(짧은 아티클 + 하단 "아이 유형검사 시작하기" 퍼널 CTA). 데이터는 모듈레벨 `PARENTING_ARTICLES`. 실제 자료 연결: "아이의 스트레스 신호"→`docs/parent_resources/child_type_checklist.html`.
  - 대표 부모–자녀 조합 3 → **6개** (하드코드 예시만, 81엔진은 여전히 차기).
  - `parenting-parent` 미니 체크 6문항(점수·결과 없음, 관찰 유도) + `docs/parent_resources/mom_type_summary.html` 연결. "엄마유형" 표기는 노출 카피에서 회피("부모 양육성향").
- **B3 홈 연결** (`js/sections/home.js`): 하단 restorationCards "부모와 자녀" 카드 action을 `apply?focus=parenting_workshop` → `renderSection('parenting')`. **홈 Hero programCards(4장)는 손대지 않음**(site-restructure 원칙). 따라서 홈 상단 "Enneagram for Parenting" 프로그램 카드는 여전히 `/parenting-workshop.html` 로 감 — 차기에 Cursor main이 site-restructure 맥락에서 판단.
- **B4 푸터**: 이미 잠금 IA와 정합(회복 이야기·사역지원·공지사항 포함) → 변경 없음, 확인만.

테스트: `tests/parenting-render.test.mjs` 에 6조합/아티클 8개/미니체크/ programs 재라벨 assertion 추가. 전체 133 pass. 브라우저로 모달·체크리스트·redirect 확인.
