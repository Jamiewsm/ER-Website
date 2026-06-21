<!-- Phase 4 (코드베이스 정리) 구현 plan. 안전한 부분 (구조/상수) 만 통합하고 텍스트 발산은 Phase 5 에서 결합 끊기 -->
---
kb_id: enneagram_test_meta.phase_4_plan
title: "Phase 4 Implementation Plan — Codebase Cleanup (pragmatic scope)"
phase: 4
created_at: "2026-05-07"
last_updated: "2026-06-20"
status: archived_do_not_execute
superseded_by: ACTIVE_EVOLUTION_PLAN.md
total_tasks: 6
estimated_total_minutes: "120-180"
related_files:
  - CONTEXT.md
  - WORK_STATUS.md
  - HANDOFF.md
  - PHASE_3_PLAN.md
retrieval_tags:
  - phase_4
  - codebase_cleanup
  - duplication_removal
  - test_shared
  - implementation_plan
---

# ER Enneagram Test — Phase 4 (Codebase Cleanup) Implementation Plan

> **ARCHIVED — DO NOT EXECUTE.** 이 문서는 2026-05 자동화 Phase 4 기록 보존용이다. 현재 운영 경로는 `test.html -> js/test.js`이며 legacy `js/app-adaptive*.js`를 되살리는 방식은 금지한다. 공통 상수 추출은 가능하지만, 현재 테스트 문항/결과지 흐름을 과거 구조로 되돌리면 안 된다.

> **For agentic workers:** [HANDOFF.md](./HANDOFF.md) 의 5단계 protocol 따름. 매 task 종료 시 `node docs/_meta/enneagram/verify.mjs <task_id>` + `node --test tests/test-scoring.test.mjs` 통과 확인 후 commit.

**Goal:** `js/test.js` (1008줄) 와 `js/app-adaptive*.js` (827줄) 의 중복 중 안전한 부분 (arrowLines, 상수, COUNTERTYPES, TEST_CONFIG defaults) 을 단일 모듈 `js/test-shared.js` 로 통합. 텍스트 (질문 wording) 발산은 audit 보고서에 기록만 하고 Phase 5 에서 결과지 lookup 으로 결합 끊기.

**Architecture:** **실용 범위** — 위험한 텍스트 통합 보류, 안정한 구조만 dedup. Phase 5 결과지가 `subtypes_27.md` lookup 하므로 question text 의 자잘한 차이가 결과지 품질에 영향 X. Phase 3 의 `js/test-scoring.js` 가 이미 핵심 스코어링을 통합한 위에서, Phase 4 는 그 위에 작은 한 층 (`js/test-shared.js`) 만 더함.

**Tech Stack:** Vanilla JS (브라우저 + Node.js 호환), 의존 없음.

**Working Directory:** `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/`.

---

## 0. Task Index

| ID | 제목 | 의존 | 추정(분) |
|---|---|---|---:|
| 4.0 | Phase 4 plan + verify.mjs spec | Phase 3 완료 | 25-35 |
| 4.1 | `docs/_meta/enneagram/test_dup_audit.md` 작성 (test.js vs app-adaptive 중복 + 텍스트 발산 매핑) | 4.0 | 30-45 |
| 4.2 | `js/test-shared.js` 신규 — arrowLines + 상수 + 본능 정의 export | 4.1 | 20-30 |
| 4.3 | `js/test.js` 가 `js/test-shared.js` 의 arrowLines 사용 (기존 const 제거 + import) | 4.2 | 15-25 |
| 4.4 | `js/app-adaptive-data.js` 가 `js/test-shared.js` 의 arrowLines 사용 (adaptiveArrowLines = TestShared.arrowLines) | 4.2 | 15-25 |
| 4.5 | Phase 4 종료 검증 + Phase 5 인계 (PHASE_5_PLAN.md placeholder) | 4.1-4.4 | 10-15 |

**범위 결정 근거** — 텍스트 (질문 wording) 발산 통합은 Phase 5 의 결과지 lookup 으로 결합 끊기 후 안전하게 가능. Phase 4 에서 텍스트 통합을 시도하면 진단 결과가 미묘하게 변경될 risk 가 있어 Phase 5 로 미룸.

---

## 1. Conventions

### 1.1 산출물 파일 (`js/test-shared.js`)

`js/test-scoring.js` 와 같은 패턴 — pure functions/constants, 브라우저 + Node.js 호환 export.

```javascript
// (예시 구조)
const arrowLines = { 1: {stress:4,growth:7}, ..., 9: {stress:6,growth:3} };
const INSTINCTS = ['sp', 'sx', 'so'];
const TYPES = [1,2,3,4,5,6,7,8,9];
// ...

const TestShared = { arrowLines, INSTINCTS, TYPES };
if (typeof module !== 'undefined' && module.exports) module.exports = TestShared;
if (typeof window !== 'undefined') window.TestShared = Object.assign(window.TestShared || {}, TestShared);
```

### 1.2 락/HISTORY/commit 규칙 (Phase 1-3 와 동일)

[HANDOFF.md](./HANDOFF.md) 의 5단계 protocol. commit 메시지 — `<type>(enneagram-cleanup): <description>` 본문에 `Phase 4 task <id>` + agent ID + verify 요약.

### 1.3 Regression 안전 기준

매 commit 후.
- `node docs/_meta/enneagram/verify.mjs all` OK
- `node --test tests/test-scoring.test.mjs` 26/26 통과 유지
- (manual) test.html 직접 열어서 진단 진행 → 결과 형식이 Phase 3 와 동일하게 출력되는지 확인

---

## 2. Task 4.0 — Phase 4 plan + verify.mjs spec

**Files:**
- Modify: `docs/_meta/enneagram/PHASE_4_PLAN.md` (placeholder → 본 실제 plan)
- Modify: `docs/_meta/enneagram/verify.mjs` (TASK_FILE_SPECS 에 4.0-4.4 추가)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`

**Inputs:** Phase 1-3 모든 산출물 + 현재 `js/test.js`, `js/app-adaptive.js`, `js/app-adaptive-data.js`.

**Definition of Done:**
- [ ] PHASE_4_PLAN.md 실제 plan 으로 채워짐
- [ ] verify.mjs 의 TASK_FILE_SPECS 에 4.0-4.4 entry 추가
- [ ] WORK_STATUS — `current_task = "4.1"`
- [ ] HISTORY — 4.0 start + complete

### Steps

- [ ] **Step 4.0.1: PHASE_4_PLAN.md 작성** — 본 파일.

- [ ] **Step 4.0.2: verify.mjs 의 TASK_FILE_SPECS 갱신**

```javascript
  '4.0': [
    { path: 'docs/_meta/enneagram/PHASE_4_PLAN.md', minLines: 100, maxLines: 800 },
  ],
  '4.1': [
    { path: 'docs/_meta/enneagram/test_dup_audit.md', minLines: 60, maxLines: 300 },
  ],
  '4.2': [
    { path: 'js/test-shared.js', minLines: 20, maxLines: 150, requireOurFrontmatter: false },
  ],
  '4.3': [
    { path: 'js/test.js', minLines: 950, maxLines: 1100, requireOurFrontmatter: false },
  ],
  '4.4': [
    { path: 'js/app-adaptive-data.js', minLines: 200, maxLines: 250, requireOurFrontmatter: false },
  ],
```

- [ ] **Step 4.0.3: Commit + WORK_STATUS + HISTORY**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-cleanup): write Phase 4 plan + register verify specs"
```

WORK_STATUS — `current_task = "4.1"`, 락 해제. HISTORY 에 complete.

---

## 3. Task 4.1 — `test_dup_audit.md` 작성

**Files:**
- Create: `docs/_meta/enneagram/test_dup_audit.md`

**Inputs:**
- 현재 `js/test.js` (1008줄, 단독 페이지 entry — `test.html`)
- 현재 `js/app-adaptive.js` (616줄, iframe 임베드 logic)
- 현재 `js/app-adaptive-data.js` (211줄, iframe 임베드 data)
- 현재 `js/sections/test-embed.js` (136줄, iframe mount helper)

**Definition of Done:**
- [ ] 60-300 줄 audit 보고서
- [ ] 섹션 — (a) 두 entry point 의 진입 흐름 (b) 중복 데이터 매핑 표 (c) 텍스트 발산 매핑 표 (d) Phase 4 에서 통합할 안전 부분 (e) Phase 5 에서 끊을 결합점
- [ ] frontmatter (kb_id, title, retrieval_tags)
- [ ] verify.mjs 4.1 통과

### Steps

- [ ] **Step 4.1.1: 락 + checkpoint_plan**

`checkpoint_plan = ["4.1.1", "4.1.2", "4.1.3"]`.

- [ ] **Step 4.1.2: audit 작성**

Create `docs/_meta/enneagram/test_dup_audit.md`.

```markdown
<!-- test.js vs app-adaptive*.js 중복 audit + 텍스트 발산 매핑 -->
---
kb_id: enneagram_test_meta.test_dup_audit
title: "Test Code Duplication Audit — test.js vs app-adaptive"
created_at: "2026-05-07"
retrieval_tags:
  - dup_audit
  - test_js
  - app_adaptive
  - text_divergence
  - phase_4
---

# Test Code Duplication Audit

## 1. 두 entry point 의 진입 흐름

### test.html → js/test.js (단독 페이지)
- 사용자가 직접 `test.html` 방문 또는 메인 사이트에서 iframe 로 임베드.
- `js/test.js` 의 `q1`, `deep`, `tb*`, `postTieBreakerMap`, `arrowLines`, `TEST_CONFIG` 모두 self-contained.
- Phase 3 의 `js/test-scoring.js` 가 결과 산출에 사용됨.

### iframe via js/sections/test-embed.js → test.html (iframe)
- 메인 SPA 앱 (`index.html`) 의 진단 섹션이 `test-embed.js` 의 `mountAdaptiveTestIframe()` 으로 `test.html` 을 iframe 로 로드.
- 결과적으로 동일 `js/test.js` 가 실행됨.

### 미사용 또는 legacy — js/app-adaptive.js + js/app-adaptive-data.js
- 메인 SPA 앱 안에서 직접 진단 (iframe 없이) 실행하는 구버전 코드.
- 현재 메인 진입은 iframe 방식이므로 `app-adaptive.js` 는 사실상 미사용 (또는 legacy fallback).
- 데이터 (질문, deep, tb_*) 가 `js/test.js` 와 별도 정의 → 중복.

## 2. 중복 데이터 매핑

| `js/test.js` 상수 | `js/app-adaptive-data.js` 상수 | 일치 여부 |
|---|---|---|
| `arrowLines` (line 68) | `adaptiveArrowLines` (line 13) | 동일 |
| `q1` (line 145) | `adaptivePhase1Questions` (line 25) | 텍스트 미세 차이 (아래 §3) |
| `deep` (line 176) | `adaptiveDeepMotivations` (line 53) | 텍스트 미세 차이 |
| `tb36/tb31/tb3sx/tb71/tb78/tb7wing` | `adaptiveTieBreaker36/31/3SX/71/78/7Wing` | 텍스트 미세 차이 |
| `tb18` (line 196) | (없음) | test.js only |
| `tbCustomMap` (line 205) | (없음) | test.js only |
| `postTieBreakerMap` (line 239) | (없음) | test.js only |
| `TEST_CONFIG` (line 70) | (해당 없음 — adaptive*Meta 변수들) | 다른 구조 |

## 3. 텍스트 발산 매핑

샘플 비교 (Type 1 deep motivation 첫 문항).

- **test.js d1_1** — "일을 끝낸 뒤에도 이것이 최선이었는지, 더 정확하게 할 수 있었는지를 스스로 반복 점검하며 기준에 맞추려는 내면의 압력이 자주 작동하는 편이다."
- **app-adaptive d1_1** — "무언가를 할 때 '이것이 최선인가? 더 제대로 해야 하지 않나?'라며 스스로의 행동을 점검하고 기준을 맞추려는 내면의 목소리가 자주 들리는 편이다."

→ 동일 동기 (1번 self-monitoring) 의 두 다른 wording. 진단 결과는 비슷하나 사용자 응답 표현이 약간 다를 수 있음. **canonical 결정 보류** — Phase 5 에서 결과지가 `subtypes_27.md` 의 콘텐츠를 lookup 하면, 질문 텍스트의 자잘한 차이는 결과지에 영향 X.

## 4. Phase 4 통합 안전 부분

다음은 두 곳에서 동일하므로 단일 소스 (`js/test-shared.js`) 에서 export 후 두 entry point 가 import.

| 항목 | 신규 위치 |
|---|---|
| arrowLines (9 type 의 stress/growth 화살표) | `js/test-shared.js` |
| 본능 정의 (sp, sx, so 키 + 한국어 라벨) | `js/test-shared.js` |
| Type 메타 (1-9 의 한국어 이름) | `js/test-shared.js` |

추가로 — Phase 3 의 [test-scoring.js](../../../js/test-scoring.js) 의 `COUNTERTYPES` 는 이미 단일 소스. 두 entry point 가 사용 가능.

## 5. Phase 5 에서 끊을 결합점

Phase 5 는 결과지에 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) 콘텐츠를 lookup. 그 시점부터 질문 텍스트 (test.js / app-adaptive) 와 결과지 콘텐츠가 분리 — 질문 텍스트의 발산이 결과지 품질에 영향 0. 그 이후 (Phase 6 가 있다면) 질문 텍스트 통합도 안전.

## 6. 작업 권장 (Phase 4)

- 4.2 — `js/test-shared.js` 신규.
- 4.3 — `test.js` 의 `arrowLines` 를 `TestShared.arrowLines` 참조로 교체.
- 4.4 — `app-adaptive-data.js` 의 `adaptiveArrowLines` 를 `TestShared.arrowLines` 참조로 교체.
- (질문 텍스트 통합은 Phase 5 후 별도 작업으로 보류)

## 7. Limitations

- `js/app-adaptive.js` 의 logic (renderAdaptiveQuestions, submitPhase1, submitPhase2) 도 `js/test.js` 와 중복이지만 메인 SPA 가 iframe 방식을 사용 중이라 실질적으로 unused. 적극 정리 시 제거 검토. Phase 4 에서는 손대지 않음.
```

- [ ] **Step 4.1.3: Verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 4.1
git add docs/_meta/enneagram/test_dup_audit.md
git commit -m "docs(enneagram-cleanup): write test code duplication audit"
```

WORK_STATUS — `current_task = "4.2"`, 락 해제.

---

## 4. Task 4.2 — `js/test-shared.js` 신규

**Files:**
- Create: `js/test-shared.js`

**Inputs:** Task 4.1 audit, 현재 `js/test.js` (line 68 arrowLines), 현재 `js/app-adaptive-data.js` (line 13 adaptiveArrowLines).

**Definition of Done:**
- [ ] 20-150 줄 신규 파일
- [ ] export — `arrowLines`, `INSTINCT_LABELS`, `TYPE_NAMES`
- [ ] 브라우저 + Node 호환 export (`window.TestShared`, `module.exports`)
- [ ] verify.mjs 4.2 통과

### Steps

- [ ] **Step 4.2.1: 락 + checkpoint_plan**

`checkpoint_plan = ["4.2.1", "4.2.2", "4.2.3"]`.

- [ ] **Step 4.2.2: 파일 작성**

Create `js/test-shared.js`.

```javascript
// ER 에니어그램 테스트 공유 상수 — arrowLines, instinct labels, type names.
// test.js (단독 페이지) + app-adaptive-data.js (구 임베드) 양쪽이 import.

// 9 type 의 스트레스/통합 화살표 (Chestnut + Riso-Hudson 표준).
const arrowLines = {
  1: { stress: 4, growth: 7 },
  2: { stress: 8, growth: 4 },
  3: { stress: 9, growth: 6 },
  4: { stress: 2, growth: 1 },
  5: { stress: 7, growth: 8 },
  6: { stress: 3, growth: 9 },
  7: { stress: 1, growth: 5 },
  8: { stress: 5, growth: 2 },
  9: { stress: 6, growth: 3 },
};

// 본능 한국어 라벨.
const INSTINCT_LABELS = {
  sp: '자기보호 (sp)',
  sx: '일대일 (sx)',
  so: '사회 (so)',
};

// Type 한국어 이름 (subtypes_27.md 와 정렬).
const TYPE_NAMES = {
  1: '개혁가',
  2: '조력자',
  3: '성취자',
  4: '개인주의자',
  5: '사색가',
  6: '충성가',
  7: '열정가',
  8: '도전자',
  9: '평화주의자',
};

const TestShared = { arrowLines, INSTINCT_LABELS, TYPE_NAMES };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestShared;
}
if (typeof window !== 'undefined') {
  window.TestShared = Object.assign(window.TestShared || {}, TestShared);
}
```

- [ ] **Step 4.2.3: Verify + commit**

```bash
node -e 'const m = require("./js/test-shared.js"); console.log(JSON.stringify(m.arrowLines[7]));'
# expect — {"stress":1,"growth":5}

node docs/_meta/enneagram/verify.mjs 4.2
git add js/test-shared.js
git commit -m "feat(enneagram-cleanup): add test-shared.js with arrowLines + labels"
```

WORK_STATUS — `current_task = "4.3"`, 락 해제.

---

## 5. Task 4.3 — `js/test.js` 가 test-shared 의 arrowLines 사용

**Files:**
- Modify: `js/test.js` (line 68 arrowLines 정의 제거 + window.TestShared 참조)
- Modify: `test.html` (script 로드 순서 — test-shared 가 test.js 보다 먼저)

**Inputs:** `js/test.js`, `js/test-shared.js` (Task 4.2), `test.html`.

**Definition of Done:**
- [ ] `js/test.js` line 68 의 const arrowLines 선언이 제거되거나 `window.TestShared.arrowLines` 로 교체
- [ ] `js/test.js` 의 `arrowLines[core].growth` / `arrowLines[core].stress` 참조가 동일하게 작동
- [ ] test.html 에 `<script src="js/test-shared.js"></script>` 추가 (test-scoring.js 보다 앞 또는 뒤 — 순서 무관)
- [ ] `node --test tests/test-scoring.test.mjs` 26/26 통과 유지
- [ ] verify.mjs 4.3 통과

### Steps

- [ ] **Step 4.3.1: 락 + checkpoint_plan**

`checkpoint_plan = ["4.3.1", "4.3.2", "4.3.3", "4.3.4"]`.

- [ ] **Step 4.3.2: js/test.js 수정**

기존 line 68 (정확한 텍스트).

```javascript
const arrowLines = {1:{stress:4,growth:7},2:{stress:8,growth:4},3:{stress:9,growth:6},4:{stress:2,growth:1},5:{stress:7,growth:8},6:{stress:3,growth:9},7:{stress:1,growth:5},8:{stress:5,growth:2},9:{stress:6,growth:3}};
```

다음으로 교체.

```javascript
// arrowLines — test-shared.js 가 진실 소스. fallback 으로 인라인 (script 로드 실패 시 안전).
const arrowLines = (typeof window !== 'undefined' && window.TestShared && window.TestShared.arrowLines) || {1:{stress:4,growth:7},2:{stress:8,growth:4},3:{stress:9,growth:6},4:{stress:2,growth:1},5:{stress:7,growth:8},6:{stress:3,growth:9},7:{stress:1,growth:5},8:{stress:5,growth:2},9:{stress:6,growth:3}};
```

- [ ] **Step 4.3.3: test.html 수정**

기존 script 로드 부분.

```html
  <script src="js/test-scoring.js"></script>
  <script src="js/test.js"></script>
```

다음으로 교체 (test-shared 추가, 순서는 test.js 보다 앞).

```html
  <script src="js/test-shared.js"></script>
  <script src="js/test-scoring.js"></script>
  <script src="js/test.js"></script>
```

- [ ] **Step 4.3.4: Verify + commit**

```bash
node --test tests/test-scoring.test.mjs    # 26/26 통과 유지
node docs/_meta/enneagram/verify.mjs 4.3
git add js/test.js test.html
git commit -m "refactor(enneagram-cleanup): test.js uses test-shared.arrowLines (Phase 4.3)"
```

WORK_STATUS — `current_task = "4.4"`, 락 해제.

---

## 6. Task 4.4 — `js/app-adaptive-data.js` 가 test-shared 사용

**Files:**
- Modify: `js/app-adaptive-data.js` (line 13 `adaptiveArrowLines` 가 `TestShared.arrowLines` 참조)

**Inputs:** `js/app-adaptive-data.js`, `js/test-shared.js`.

**Definition of Done:**
- [ ] `js/app-adaptive-data.js` line 13 의 `adaptiveArrowLines` 가 `window.TestShared.arrowLines` 참조 (fallback inline 유지)
- [ ] `js/app-adaptive.js` 의 `adaptiveArrowLines[core].growth` 참조가 동일하게 작동
- [ ] (메인 SPA index.html 에 test-shared.js 가 로드되어 있어야 함 — 없으면 fallback inline)
- [ ] verify.mjs 4.4 통과

### Steps

- [ ] **Step 4.4.1: 락 + checkpoint_plan**

`checkpoint_plan = ["4.4.1", "4.4.2", "4.4.3"]`.

- [ ] **Step 4.4.2: js/app-adaptive-data.js 수정**

기존 line 13-23 (정확한 텍스트는 Read 로 확인).

```javascript
const adaptiveArrowLines = {
    1: { stress: 4, growth: 7 },
    2: { stress: 8, growth: 4 },
    3: { stress: 9, growth: 6 },
    4: { stress: 2, growth: 1 },
    5: { stress: 7, growth: 8 },
    6: { stress: 3, growth: 9 },
    7: { stress: 1, growth: 5 },
    8: { stress: 5, growth: 2 },
    9: { stress: 6, growth: 3 }
};
```

다음으로 교체.

```javascript
// adaptiveArrowLines — js/test-shared.js 의 arrowLines 가 진실 소스. fallback 으로 인라인.
const adaptiveArrowLines = (typeof window !== 'undefined' && window.TestShared && window.TestShared.arrowLines) || {
    1: { stress: 4, growth: 7 },
    2: { stress: 8, growth: 4 },
    3: { stress: 9, growth: 6 },
    4: { stress: 2, growth: 1 },
    5: { stress: 7, growth: 8 },
    6: { stress: 3, growth: 9 },
    7: { stress: 1, growth: 5 },
    8: { stress: 5, growth: 2 },
    9: { stress: 6, growth: 3 }
};
```

- [ ] **Step 4.4.3: Verify + commit**

```bash
node --test tests/test-scoring.test.mjs
node docs/_meta/enneagram/verify.mjs 4.4
git add js/app-adaptive-data.js
git commit -m "refactor(enneagram-cleanup): app-adaptive-data.js uses TestShared.arrowLines (Phase 4.4)"
```

WORK_STATUS — `current_task = "4.5"`, 락 해제.

(주 — `index.html` 에 `<script src="js/test-shared.js">` 추가는 사용자 결정 — 메인 SPA 의 script 로딩 패턴 (defer/main.js 통합) 영향. fallback inline 이 있으므로 추가 안 해도 작동.)

---

## 7. Task 4.5 — Phase 4 종료 검증 + Phase 5 인계

**Files:**
- Create: `docs/_meta/enneagram/PHASE_5_PLAN.md` (placeholder)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`

**Inputs:** 모든 Phase 4 산출물.

**Definition of Done:**
- [ ] `node docs/_meta/enneagram/verify.mjs all` 통과
- [ ] `node --test tests/test-scoring.test.mjs` 26/26 통과
- [ ] PHASE_5_PLAN.md placeholder 생성
- [ ] WORK_STATUS — `current_phase = 5`, `current_task = "5.0"`
- [ ] HISTORY — Phase 4 complete

### Steps

- [ ] **Step 4.5.1: 전체 verify + 테스트**

```bash
node docs/_meta/enneagram/verify.mjs all
node --test tests/test-scoring.test.mjs
```

- [ ] **Step 4.5.2: PHASE_5_PLAN.md placeholder**

```markdown
<!-- Phase 5 (결과 출력 포맷) plan placeholder -->
---
kb_id: enneagram_test_meta.phase_5_plan
title: "Phase 5 Implementation Plan — Result Output Format"
phase: 5
created_at: "<ISO>"
status: placeholder
retrieval_tags:
  - phase_5
  - placeholder
  - result_output
  - subtypes_27_lookup
  - pdf_share
---

# Phase 5 Implementation Plan — Result Output Format

이 plan 은 Phase 5 시작 시 작성됩니다. Phase 1-4 의 모든 산출물을 결과지에 통합 — 결과지가 `subtypes_27.md` 의 깊이 콘텐츠를 lookup, wing/instinct % 를 표시, PDF/공유 형식 정리.

## 작성 가이드

### 작업 분해 권장 (7-9 task)

1. **Task 5.0** — 본 plan 작성 (writing-plans skill).
2. **Task 5.1** — `subtypes_27.md` 의 27 subtype 콘텐츠를 JS-가능한 데이터 구조로 변환 (`js/subtypes-27-data.js` 신규).
3. **Task 5.2** — 결과지 카드 추가 — 27 subtype 의 핵심 집착 / 방어 / 한국어 카피 표시.
4. **Task 5.3** — countertype 결과 시 주의 문구 카드 추가 ("표면적으로 다른 type 처럼 보일 수 있음").
5. **Task 5.4** — wing/instinct % 시각화 (progress bar 등).
6. **Task 5.5** — PDF 형식 갱신 (신규 카드 포함).
7. **Task 5.6** — 공유 텍스트 갱신 (신규 형식 `7 w8(50%) sx(80%) so(60%) sp(10%)`).
8. **Task 5.7** — 결과지 디자인 다듬기 (Phase 1 DESIGN.md 와 정렬).
9. **Task 5.8** — Phase 5 종료 검증.

### 입력

- Phase 1-4 의 모든 KB + 코드 산출물.
- Phase 1 [DESIGN.md](../../../DESIGN.md) (브랜드 디자인 가이드).
- Phase 2 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) — 결과지 콘텐츠 소스.
- Phase 3 `js/test-scoring.js` — wing/instinct/27 subtype 산출.

### Phase 5 종료 조건

- 결과지에 `<core>w<wing>(<%>) <inst1>(<%>) ...` 형식 표시.
- 27 subtype 깊이 콘텐츠가 결과지에 노출.
- countertype 안내 문구 표시.
- PDF/공유 모두 신규 형식.
- 프로젝트 종료 — `WORK_STATUS.current_phase = 6` 으로 전환 (스케줄 task self-delete).
```

- [ ] **Step 4.5.3: WORK_STATUS Phase 4 → Phase 5 전환**

`current_phase = 5`, `current_task = "5.0"`, `last_updated = now`.

- [ ] **Step 4.5.4: Final commit**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-cleanup): close Phase 4, advance to Phase 5"
```

다음 wakeup 은 Phase 5 의 task 5.0 (PHASE_5_PLAN 작성) 시작.

---

## 8. Self-Review

- [x] 모든 task self-contained
- [x] No placeholders
- [x] Phase 3 unit test regression 보장
- [x] 텍스트 발산 통합 보류 — risk 회피
- [x] arrowLines 만 통합 — 작은, 안전한 dedup
- [x] CLAUDE.md rule 준수
