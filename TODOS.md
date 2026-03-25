# ER Website — TODOs

---

## A11Y-002: `aria-hidden` 일관성 감사

**What:** `js/sections/` 전체에서 장식 아이콘(`<i class="fas ...">`) 에 `aria-hidden="true"` 누락 여부 전수 확인  
**Why:** `coaches.js`에서 일부 아이콘만 고쳤지만 다른 섹션에도 동일 패턴 존재. 스크린 리더가 "fa-cross" 등을 읽어냄  
**Pros:** 일관된 접근성  
**Cons:** 수동 감사 필요 (~30분)  
**Context:** `grep -r 'fas fa-\|far fa-' js/sections/ | grep -v aria-hidden` 으로 대상 목록 추출 가능  
**Depends on:** 없음

---

## A11Y-001: SPA 키보드 포커스 관리

**What:** `renderSection()` 실행 후 `#main-content` 맨 위로 포커스를 이동  
**Why:** 현재 SPA 섹션 전환 시 키보드 포커스가 이전 섹션 요소에 남아 있어 키보드/스크린 리더 사용자가 새 컨텐츠를 탐색하기 위해 Tab을 여러 번 눌러야 함  
**Pros:** WCAG 2.1 Level AA 준수, 키보드 사용자 경험 즉각 개선  
**Cons:** `main-content` tabindex 처리 시 스타일 깜빡임 가능 (outline 제거 필요)  
**Context:** `js/app-core.js`의 `renderSection()` 또는 각 section 렌더 함수 마지막에 추가. 약 20줄.  
**Depends on:** 없음  
**How:** 
```javascript
// renderSection() 내 content 교체 후 추가
const main = document.getElementById('main-content');
if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
```

---

## UX-001: 상담 신청 폼에 코치 선호 필드 추가

**What:** `apply.js` 폼에 "코치 전문 분야 선호 (선택 사항)" 드롭다운 추가  
**Why:** 코치가 여러 명이 될 때 ER이 배정하더라도 사용자의 선호(가정 코칭, 사역자 코칭 등)를 알면 더 적합한 연결 가능  
**Pros:** 매칭 품질 향상, 사용자가 선택권이 있다는 느낌  
**Cons:** 폼 길이 증가 (1개 필드)  
**Context:** 현재 코치 선택 모델은 "ER이 배정". 이 필드는 hint이지 선택이 아님. `js/sections/apply.js` 수정.  
**Depends on:** 코치 목록이 2명 이상이 될 때 의미 있음

---

## DESIGN-001: /design-consultation 실행으로 DESIGN.md 고도화

**What:** `/design-consultation` 스킬 실행으로 전체 디자인 시스템 리부트  
**Why:** 현재 DESIGN.md는 기존 코드에서 추출된 것으로 이미 있는 것을 정리한 것. 진정한 디자인 시스템은 브랜드 방향을 먼저 정하고 역방향으로 정의해야 함  
**Pros:** 폰트, 컬러, 모션, 간격 스케일이 일관된 하나의 언어로 통합됨  
**Cons:** 기존 스타일과 달라질 경우 전체 컴포넌트 업데이트 필요 (리스크)  
**Context:** 현재 DESIGN.md (`/ER-Website/DESIGN.md`)를 기반으로 하되 더 발전시키는 방향  
**Depends on:** 없음 (언제든 실행 가능)
