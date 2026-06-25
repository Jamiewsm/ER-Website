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

## 차기 (이번 범위 밖, context-notes 참조)
- [ ] 부모 양육성향 검사 신규 개발 (현재 안내/예약 CTA만)
- [ ] 81개 부모×아이 조합 엔진 (현재 대표 3개 예시만)
- [ ] programs 섹션 재라벨(관계·부부 / 조직·리더십) 및 양육 아티클 라이브러리
- [ ] 클린 URL `/parenting/...` (현재 해시 라우팅)
