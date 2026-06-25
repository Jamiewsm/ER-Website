# Parenting 상위 메뉴 — 체크리스트

목표: Parenting을 독립된 상위 메뉴 + 고객 여정으로 구축. 상단 메뉴 전면 재구성. 1차 범위 = MVP 3종(랜딩 / 기존 자료 재배치·연결 / 부모–자녀 맞춤 가이드).

## 1. Parenting 전용 섹션 (`js/sections/parenting.js`)
- [x] `renderParenting(payload)` 신규 작성 (Korean 헤더 코멘트 포함)
- [x] 히어로: "아이를 바꾸기 전에…" + 버튼 2개(우리 아이 이해하기 / 부모–자녀 맞춤 가이드)
- [x] 섹션: 부모가 겪는 문제 ("이런 순간이 반복되고 있나요?")
- [x] 섹션: 분석 구조 CHILD / PARENT / RELATIONSHIP 3카드
- [x] 섹션(#parenting-child): 우리 아이 이해하기 + 아이 유형검사 CTA
- [x] 섹션(#parenting-parent): 부모인 나 이해하기 (부모 양육성향은 안내/예약, 검사 신규개발은 차기)
- [x] 섹션(#parenting-guide): 부모–자녀 맞춤 가이드 — 대표 조합 3개 예시 + 상담 연결
- [x] 섹션: 무료 정보·예시(아티클 카테고리) + 아이 유형검사 CTA
- [x] 상품 계단(무료/입문/핵심/프리미엄/심화) 안내 + 각 CTA를 기존 flow로 연결

## 2. 라우팅 (`js/app-core.js`)
- [x] `case 'parenting': html = renderParenting(payload); break;`
- [x] focus 앵커 스크롤 post-render 훅 추가
- [x] sectionLabels 에 parenting 추가

## 3. 스크립트 로드 (`index.html`)
- [x] `<script src="js/sections/parenting.js?v=20260625a">` 추가

## 4. 상단 메뉴 전면 재구성 (`index.html` — 데스크탑/모바일/푸터)
- [x] 데스크탑 nav: ER 소개▾ · 유형검사▾ · Parenting▾ · 관계·부부 · 조직·리더십▾ · 전문가 과정 · 회복 이야기▾
- [x] 모바일 메뉴 동일 구조로 재구성
- [x] 푸터 링크행 재구성
- [x] 아이 유형검사 링크를 유형검사→Parenting 으로 이전

## 5. 검증
- [x] bun test 통과 (130 pass, 신규 parenting-render 4 포함)
- [x] 브라우저: 데스크탑/모바일 메뉴, Parenting 섹션, 앵커 스크롤(96px=scroll-mt-24), 콘솔 에러 없음 확인
- [x] git status / diff 로 변경 범위 확인 (index.html, app-core.js, parenting.js, parenting-render.test.mjs)

## Phase 2 (branch `feat/parenting-phase-2`) — 완료
- [x] B1 programs 재라벨(관계·부부 / 조직·리더십) + 양육 카드 → Parenting 유도
- [x] B2 무료 아티클 8개 클릭 가능(모달 + 퍼널 CTA), 실제 자료 1개 연결
- [x] B2 대표 부모–자녀 조합 3 → 6개
- [x] B2 부모 미니 양육성향 체크(점수·결과 없음) + 기존 자료 연결
- [x] B3 홈 하단 부모-자녀 카드 → Parenting 랜딩 (Hero 4카드는 미터치)
- [x] B4 푸터 IA 정합 확인(변경 없음)
- [x] tests 133 pass + 브라우저 검증

## Phase 3A (branch `feat/parenting-phase-3-funnel`) — 전환 퍼널 연결
- [x] F1 홈 Hero 양육 카드 → `renderSection('parenting', {focus:'program'})` (랜딩 경유)
- [x] F2 상품 계단 섹션에 `id="parenting-program"` 앵커
- [x] F3 랜딩→apply 출처 `source` → `apply_source: 'parenting'`
- [x] F4 child-test→apply 배너 부모 문맥 override (상품·가격 무변경)
- [x] tests 갱신·추가 + 전체 통과 (135 pass)
- [x] 브라우저 QA(홈 카드→랜딩→상품계단 top=96px 스크롤, child-test 배너, 콘솔 에러 없음)

## 차기 (여전히 범위 밖)
- [ ] 부모 양육성향 검사 신규 개발(문항·채점) — 현재 미니 체크/안내 CTA만
- [ ] 81개 부모×아이 조합 엔진 — 현재 대표 6개 예시만
- [ ] 무료 아티클 stub → 정식 아티클 라이브러리 확장
- [ ] 홈 Hero "Enneagram for Parenting" 프로그램 카드 라우팅(현재 `/parenting-workshop.html`) — site-restructure 맥락에서 Cursor main 판단
- [ ] 클린 URL `/parenting/...` (현재 해시 라우팅)
