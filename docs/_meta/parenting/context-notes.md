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

## Phase 3A (branch `feat/parenting-phase-3-funnel`, PR #81 위 스택)
"전환 퍼널 연결"만. 랜딩·아티클 신규 작성 없음(Phase 3B). track: site only. 사용자 승인(AskUserQuestion): 홈 Hero 카드 랜딩 경유 + in-lane 배선 2건 모두 수정.

- **F1 홈 Hero 양육 카드 → 랜딩 경유** (`js/sections/home.js`): "Enneagram for Parenting" programCard action `'/parenting-workshop.html'` → `renderSection('parenting', { focus: 'program' })`. 홈에서 새 여정으로 진입하고, 4주 워크샵 신청은 랜딩 상품 계단(심화)에서 이어짐. 기존 차기 항목(Cursor main 이관분)을 사용자 명시 승인으로 해소.
- **F2 랜딩 상품 계단 앵커** (`js/sections/parenting.js`): 상품 계단 `<section>`에 `id="parenting-program" scroll-mt-24` 추가 → app-core focus 훅(`#parenting-<focus>`)을 그대로 재사용.
- **F3 출처 attribution 정합** (`js/sections/parenting.js`): apply로 넘기던 `source: 'parenting'` → `apply_source: 'parenting'`. apply.js는 `apply_source`만 읽어 기존엔 랜딩발 출처가 유실됨. child-test의 `apply_source:'child_type_test'` 패턴과 통일.
- **F4 child-test→apply 배너 문맥** (`js/sections/apply.js`): `fromChildTypeTest`일 때 trackTitle/trackDesc/bannerTitle/bannerBody를 부모 문맥으로 override. 성인 "프리미엄 테스트 후 추천" 대신 "아이 검사 후 추천 — 결과 해석상담". 상품·가격($50)·category는 무변경.

테스트: `parenting-render.test.mjs`(line 38 `apply_source`로, `id="parenting-program"`·홈 카드 라우팅 assertion 추가), `apply-workshop-render.test.mjs`(child-test 배너 override test 추가). 전체 통과 + 브라우저 QA.

## Phase 3A 잔여 (branch `feat/parenting-phase-3a-remainder`)
F1~F4 머지(#82, main 206f5b5) 후 남은 퍼널 마감 4건. track: site only. 사용자 승인: dual-CTA="여정 보기+4주 신청", workshop nav="양방향 연결".

- **R1 child-test 결과 퍼널 CTA** (`child-type-test/child-type-test.html`): 결과지 c5(결과 해석상담 $50) 아래에 보조 링크 "부모–자녀 맞춤 가이드 보기" → `../index.html#parenting?focus=guide`. child-test가 유료 해석상담뿐 아니라 Parenting 여정으로도 이어지도록.
- **R2 parenting-workshop nav 양방향** (`parenting-workshop.html` + `js/sections/parenting.js`): F1 이후 고립된 워크샵 상세 페이지를 퍼널에 재연결. (a) 워크샵 헤더에 `Parenting 여정`(→`/#parenting`) 링크. (b) 랜딩 심화 ladder CTA·최종 CTA "알아보기"를 apply 직행 대신 `parenting-workshop.html?apply_source=parenting` 상세로 라우팅 → 상세 페이지 자체 신청 버튼이 `#apply?focus=parenting_workshop&apply_source=parenting`로 퍼널 완결(attribution 유지).
- **R3 홈 Hero dual-CTA** (`js/sections/home.js`): 양육 카드 단일 버튼 → 2버튼. 1차 "양육 여정 보기"(`renderSection('parenting')`, 여정 top) + 2차 "4주 과정 신청"(apply parenting_workshop, `apply_source:'home_hero'`). programCards 렌더에 optional `button2`/`action2` 분기 추가(다른 카드는 무변경). F2의 `#parenting-program` 앵커는 유지(직접 URL용).
- **R4 PARENTING_ARTICLES 자료 연결** (`js/sections/parenting.js`): 웹자료가 2개뿐(`child_type_checklist.html`=아이 관찰, `mom_type_summary.html`=엄마유형)이므로 8개 아티클을 주제별 매핑. 아이중심(스트레스신호·칭찬훈육·사춘기대화·스킨십경계·공부동기)→관찰 체크리스트, 부모중심(하지말아야할말·스마트폰·돈언어)→엄마유형 정리.

테스트: parenting-render(심화 CTA가 `parenting-workshop.html`로, 아티클 자료 링크 다수, 홈 dual-CTA), apply-workshop(영향 없음). node --test 전체 통과 + 브라우저 QA.
