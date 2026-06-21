<!-- Phase 3 (스코어링 정확도) 구현 plan. wing %, instinct %, 27 subtype 매핑 + countertype 보정 -->
---
kb_id: enneagram_test_meta.phase_3_plan
title: "Phase 3 Implementation Plan — Scoring Accuracy"
phase: 3
created_at: "2026-05-07"
last_updated: "2026-06-20"
status: archived_do_not_execute
superseded_by: ACTIVE_EVOLUTION_PLAN.md
total_tasks: 9
estimated_total_minutes: "240-360"
related_files:
  - CONTEXT.md
  - WORK_STATUS.md
  - HANDOFF.md
  - HISTORY.md
  - PHASE_2_PLAN.md
retrieval_tags:
  - phase_3
  - scoring_accuracy
  - wing_percentage
  - instinct_percentage
  - 27_subtype_mapping
  - countertype_detection
  - implementation_plan
---

# ER Enneagram Test — Phase 3 (Scoring Accuracy) Implementation Plan

> **ARCHIVED — DO NOT EXECUTE.** 이 문서는 2026-05 자동화 Phase 3 기록 보존용이다. 현재 운영 `test.html`은 `js/test-scoring.js`를 로드하지 않으며, 현재 스코어링은 `js/test.js`의 최신 39문항/상황형 타이브레이커/Phase 4 다문항 판정 흐름을 기준으로 한다. `js/test-scoring.js`를 현재 운영 로직의 대체재로 다시 연결하면 최신 기능이 빠질 수 있다.

> **For agentic workers:** [HANDOFF.md](./HANDOFF.md) 의 5단계 protocol 따름. 각 task 시작 시 `WORK_STATUS.locked_task` 갱신, 완료 시 `node docs/_meta/enneagram/verify.mjs <task_id>` 통과 확인 후 commit.

**Goal:** 결과지 형식 `<core>w<wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)` 산출. 예 — `7 w8(50%) sx(80%) so(60%) sp(10%)`.

**Architecture:** 스코어링 로직을 `js/test-scoring.js` 신규 helper 모듈로 분리 (pure functions, 재사용 가능). 기존 `js/test.js` 의 renderResultFromScores 가 이 helper 를 호출. countertype 9 개 매핑 + Phase 1/2 KB 와 정렬.

**Tech Stack:** Vanilla JS (브라우저 + Node.js 호환), Node.js 내장 test runner (의존 없음, ES module).

**Working Directory:** `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/`.

---

## 0. Task Index

| ID | 제목 | 의존 | 추정(분) |
|---|---|---|---:|
| 3.0 | Phase 3 plan 작성 (이 파일) + verify.mjs 의 Phase 3 task spec | Phase 2 완료 | 30-40 |
| 3.1 | 현재 `js/test.js` 스코어링 audit + 신규 공식 spec 작성 (`docs/_meta/enneagram/scoring_spec.md`) | 3.0 | 30-45 |
| 3.2 | `js/test-scoring.js` 신규 — wing % 함수 + 단위 검증 | 3.1 | 30-40 |
| 3.3 | `js/test-scoring.js` 보강 — instinct % 함수 | 3.2 | 25-35 |
| 3.4 | `js/test-scoring.js` 보강 — 27 subtype + countertype 함수 | 3.3 | 25-35 |
| 3.5 | `js/test-scoring.js` 보강 — `computeResult(state)` 통합 함수 + 기존 `js/test.js` 의 `renderResultFromScores` 가 호출 | 3.4 | 30-40 |
| 3.6 | `test.html` 결과 placeholder 신규 (`res-wing-pct`, `res-instinct-pct`, `res-subtype-27`) + `js/test.js` 가 채움 | 3.5 | 25-35 |
| 3.7 | `tests/test-scoring.test.mjs` — Node test runner 단위 테스트 (8-12 케이스) | 3.6 | 30-40 |
| 3.8 | Phase 3 종료 검증 + Phase 4 인계 (PHASE_4_PLAN.md placeholder) | 3.1-3.7 | 10-15 |

**병렬 가능성** — 3.2/3.3/3.4 는 같은 파일이므로 순차. 3.6 은 3.5 후. 3.7 은 3.5 후 (3.6 과 병렬 가능).

---

## 1. Conventions

### 1.1 핵심 공식 (전체 적용)

#### 1.1.1 Wing % 공식

```js
// 두 wing 간 상대 우세를 0-100 으로 표현. 0 = 두 wing 균등, 100 = 한쪽만.
// 산출: 50% 는 한쪽 wing 이 다른 쪽의 약 3배 강도 (75% : 25%).
function computeWingPct(coreType, scores) {
  const left = coreType === 1 ? 9 : coreType - 1;
  const right = coreType === 9 ? 1 : coreType + 1;
  const leftScore = scores[left] || 0;
  const rightScore = scores[right] || 0;
  if (leftScore === 0 && rightScore === 0) return { wing: null, pct: 0 };
  const dominantWing = leftScore >= rightScore ? left : right;
  const dom = Math.max(leftScore, rightScore);
  const oth = Math.min(leftScore, rightScore);
  const total = dom + oth;
  if (total === 0) return { wing: null, pct: 0 };
  // [0.5, 1.0] -> [0%, 100%]
  const raw = (dom / total - 0.5) * 200;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return { wing: dominantWing, pct };
}
```

해석 가이드 (Phase 1 [type_wings.md](../../knowledge_base/enneagram/complete_enneagram/type_wings.md) 와 정렬).

| % | 의미 |
|---:|---|
| 0-20 | 거의 무 wing (균등) |
| 21-40 | 약 wing |
| 41-60 | 중 wing |
| 61-80 | 강 wing |
| 81-100 | 매우 강 (wing type 으로 오진단 위험) |

#### 1.1.2 Instinct % 공식

각 본능의 절대 강도. 응답된 문항만으로 정규화 (서로 합 100% 아님).

```js
// state.phase1Responses 에서 q1 의 inst 문항만 골라 본능별 평균 산출.
// max possible per question = 6, 따라서 normalized = sum / (count * 6) * 100.
function computeInstinctPct(responses, q1) {
  const buckets = { sp: { sum: 0, count: 0 }, sx: { sum: 0, count: 0 }, so: { sum: 0, count: 0 } };
  q1.forEach((q) => {
    if (!q.inst) return;
    const raw = responses[q.id];
    if (raw === 'U' || raw === undefined || raw === null) return;
    const score = Number(raw);
    if (!Number.isFinite(score)) return;
    buckets[q.inst].sum += score;
    buckets[q.inst].count += 1;
  });
  const norm = (b) => (b.count === 0 ? 0 : Math.round((b.sum / (b.count * 6)) * 100));
  return { sp: norm(buckets.sp), sx: norm(buckets.sx), so: norm(buckets.so) };
}
```

#### 1.1.3 27 Subtype 매핑

```js
// 1차 본능 = max(sp, sx, so). tie 시 sx > sp > so 우선 (Chestnut 의 sx countertype 빈도).
function computeDominantInstinct(instinctPct) {
  const { sp, sx, so } = instinctPct;
  const max = Math.max(sp, sx, so);
  if (max === 0) return null;
  if (sx === max) return 'sx';
  if (sp === max) return 'sp';
  return 'so';
}

function compute27Subtype(coreType, dominantInstinct) {
  if (!coreType || !dominantInstinct) return null;
  return `${dominantInstinct}_${coreType}`;
}
```

#### 1.1.4 Countertype 매핑

```js
// Phase 1 source_page_index.md countertype 빠른 색인 + Phase 2 subtypes_27.md 기준.
const COUNTERTYPES = {
  1: 'sx',  // Sexual 1 - Zeal
  2: 'sp',  // Self-Preservation 2 - Privilege
  3: 'sp',  // Self-Preservation 3 - Security
  4: 'sp',  // Self-Preservation 4 - Tenacity
  5: 'sx',  // Sexual 5 - Confidence
  6: 'sx',  // Sexual 6 - Strength/Beauty
  7: 'so',  // Social 7 - Sacrifice
  8: 'so',  // Social 8 - Solidarity
  9: 'so',  // Social 9 - Participation
};

function isCountertype(coreType, dominantInstinct) {
  return COUNTERTYPES[coreType] === dominantInstinct;
}
```

#### 1.1.5 통합 결과 함수

```js
function computeResult({ coreType, scores, responses, q1 }) {
  const wing = computeWingPct(coreType, scores);
  const instinctPct = computeInstinctPct(responses, q1);
  const dominantInstinct = computeDominantInstinct(instinctPct);
  const subtype = compute27Subtype(coreType, dominantInstinct);
  const countertype = isCountertype(coreType, dominantInstinct);
  return {
    coreType,
    wing,                // { wing: 8|null, pct: 0-100 }
    instinctPct,         // { sp, sx, so } each 0-100
    dominantInstinct,    // 'sp'|'sx'|'so'|null
    subtype,             // 'sx_7' | 'sp_2' | etc | null
    countertype,         // boolean
    formatted: formatResult(coreType, wing, instinctPct),
  };
}

function formatResult(coreType, wing, instinctPct) {
  // ex: "7 w8(50%) sx(80%) so(60%) sp(10%)"
  const wingStr = wing.wing ? `w${wing.wing}(${wing.pct}%)` : '';
  // sort instincts by % desc
  const instArr = ['sp', 'sx', 'so']
    .map((k) => ({ k, v: instinctPct[k] }))
    .sort((a, b) => b.v - a.v);
  const instStr = instArr.map((i) => `${i.k}(${i.v}%)`).join(' ');
  return `${coreType}${wingStr ? ' ' + wingStr : ''} ${instStr}`.trim();
}
```

### 1.2 락/HISTORY/commit 규칙 (Phase 1 와 동일)

[HANDOFF.md](./HANDOFF.md) 의 5단계 protocol. commit 메시지 형식 — `<type>(enneagram-scoring): <description>`. 본문에 `Phase 3 task <id>` + agent ID + verify 요약.

### 1.3 PDF 인용 금지 (Phase 1/2 와 동일)

본 plan 의 어떤 산출물도 Complete_Enneagram.pdf 의 본문을 직접 전사하지 않는다.

---

## 2. Task 3.0 — Phase 3 plan 작성 + verify.mjs spec

**Files:**
- Modify: `docs/_meta/enneagram/PHASE_3_PLAN.md` (placeholder → 실제 plan, 이 파일)
- Modify: `docs/_meta/enneagram/verify.mjs` (TASK_FILE_SPECS 에 3.0-3.8 추가)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`

**Inputs:** Phase 1+2 모든 산출물 + 현재 `js/test.js`.

**Definition of Done:**
- [ ] PHASE_3_PLAN.md 실제 plan 으로 채워짐
- [ ] verify.mjs 의 TASK_FILE_SPECS 에 3.0-3.8 entry 추가
- [ ] WORK_STATUS — `current_task = "3.1"`
- [ ] HISTORY — 3.0 start + complete
- [ ] 단일 commit

### Steps

- [ ] **Step 3.0.1: PHASE_3_PLAN.md 작성** — 본 파일.

- [ ] **Step 3.0.2: verify.mjs 의 TASK_FILE_SPECS 갱신**

`docs/_meta/enneagram/verify.mjs` 의 TASK_FILE_SPECS 객체에 entry 추가.

```javascript
  '3.0': [
    { path: 'docs/_meta/enneagram/PHASE_3_PLAN.md', minLines: 200, maxLines: 1500 },
  ],
  '3.1': [
    { path: 'docs/_meta/enneagram/scoring_spec.md', minLines: 80, maxLines: 300 },
  ],
  '3.2': [
    { path: 'js/test-scoring.js', minLines: 30, maxLines: 200, requireOurFrontmatter: false },
  ],
  '3.3': [
    { path: 'js/test-scoring.js', minLines: 60, maxLines: 250, requireOurFrontmatter: false },
  ],
  '3.4': [
    { path: 'js/test-scoring.js', minLines: 100, maxLines: 300, requireOurFrontmatter: false },
  ],
  '3.5': [
    { path: 'js/test-scoring.js', minLines: 140, maxLines: 350, requireOurFrontmatter: false },
  ],
  '3.6': [
    { path: 'test.html', minLines: 200, maxLines: 400, requireOurFrontmatter: false },
  ],
  '3.7': [
    { path: 'tests/test-scoring.test.mjs', minLines: 100, maxLines: 400, requireOurFrontmatter: false },
  ],
```

js/ 와 tests/ 와 test.html 은 프로젝트의 기존 파일/관례라 frontmatter 와 한국어 헤더 컨벤션 면제 (requireOurFrontmatter: false). verify.mjs 의 Korean header check 는 .md only 이므로 .js / .mjs / .html 은 자동으로 면제됨.

검증 — `node docs/_meta/enneagram/verify.mjs 3.0` 통과 확인.

- [ ] **Step 3.0.3: Commit + WORK_STATUS + HISTORY**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-scoring): write Phase 3 plan + register verify specs"
```

WORK_STATUS — `current_task = "3.1"`, 락 해제. HISTORY 에 complete.

---

## 3. Task 3.1 — Scoring audit + spec

**Files:**
- Create: `docs/_meta/enneagram/scoring_spec.md`

**Inputs:**
- 현재 `js/test.js` (969 줄)
- Phase 1 KB foundation
- Phase 2 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md)

**Definition of Done:**
- [ ] 80-300 줄 신규 파일
- [ ] 섹션 — 현재 스코어링 audit + 신규 공식 정의 + 27 subtype 매핑 표 + countertype 9 매핑
- [ ] frontmatter (kb_id, title, retrieval_tags, created_at)
- [ ] verify.mjs 3.1 통과

### Steps

- [ ] **Step 3.1.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.1.1", "3.1.2", "3.1.3"]`.

- [ ] **Step 3.1.2: scoring_spec.md 작성**

Create `docs/_meta/enneagram/scoring_spec.md`.

```markdown
<!-- Phase 3 스코어링 spec — 현재 audit + 신규 wing/instinct/27 subtype 공식 -->
---
kb_id: enneagram_test_meta.scoring_spec
title: "Scoring Specification — Wing %, Instinct %, 27 Subtype"
created_at: "2026-05-07"
retrieval_tags:
  - scoring_spec
  - wing_formula
  - instinct_formula
  - 27_subtype_mapping
  - countertype
---

# Scoring Specification

본 문서는 Phase 3 의 신규 스코어링 공식 + 현재 `js/test.js` 의 audit 입니다.

## 1. 현재 스코어링 Audit (`js/test.js`)

### 강점
- Phase 1/2/3 단계적 후보 좁히기 + 깊이 질문 + post-tie-break.
- 6 페어 tie-breaker (36, 31, 71, 78, 18, 3sx) + 7wing.
- sxDamp/sxBoost/soPenalty 보정 (countertype 시드).
- Confidence (높음/보통/낮음).

### 약점 (Phase 3 가 보완)
1. **Wing 출력이 binary** — `wingActivationRatio: 0.85` 로 활성/비활성만. % 없음.
2. **Instinct 출력이 1순위만** — `제 1본능: 일대일(sx)` 텍스트 only. 3 본능 모두 % X.
3. **27 subtype 명시적 매핑 없음** — 결과지에 `sx_7` 같은 코드 없음.
4. **Countertype 부분 보정만** — sxBoost (sx countertype 시드), soPenalty (so countertype 시드) 만 있고 sp countertype (Self-Pres 2/3/4) 보정 없음.

## 2. 신규 공식

### 2.1 Wing % 공식

(PHASE_3_PLAN.md §1.1.1 의 `computeWingPct` 참조 — 동일 코드.)

해석.
- 0-20% — 거의 무 wing (균등)
- 21-40% — 약 wing
- 41-60% — 중 wing
- 61-80% — 강 wing
- 81-100% — 매우 강

### 2.2 Instinct % 공식

(PHASE_3_PLAN.md §1.1.2 의 `computeInstinctPct` 참조 — 응답된 문항으로 정규화, 각 본능 0-100, 서로 합 100% 아님.)

### 2.3 27 Subtype + Countertype

(PHASE_3_PLAN.md §1.1.3-1.1.4 의 `compute27Subtype` + `COUNTERTYPES` 참조.)

### 2.4 통합 출력 형식

```
<core><space><wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)
```

예시.
- `7 w8(50%) sx(80%) so(60%) sp(10%)` — Sexual 7 with 8 wing
- `4 w5(67%) sp(92%) sx(45%) so(20%)` — Self-Pres 4 (countertype) with 5 wing
- `9 (순수) so(78%) sx(40%) sp(35%)` — Social 9 (countertype) without wing

(% 는 응답된 문항 기준 normalize, 본능 strs 는 % desc 정렬.)

## 3. 27 Subtype 매핑 표

| Subtype code | 이름 | Countertype |
|---|---|---:|
| sp_1 | Worry | |
| so_1 | Non-Adaptability | |
| sx_1 | Zeal | ✓ |
| sp_2 | Privilege | ✓ |
| so_2 | Ambition | |
| sx_2 | Aggressive/Seductive | |
| sp_3 | Security | ✓ |
| so_3 | Prestige | |
| sx_3 | Charisma | |
| sp_4 | Tenacity | ✓ |
| so_4 | Shame | |
| sx_4 | Competition | |
| sp_5 | Castle | |
| so_5 | Totem | |
| sx_5 | Confidence | ✓ |
| sp_6 | Warmth | |
| so_6 | Duty | |
| sx_6 | Strength/Beauty | ✓ |
| sp_7 | Keeper of the Castle | |
| so_7 | Sacrifice | ✓ |
| sx_7 | Suggestibility | |
| sp_8 | Satisfaction | |
| so_8 | Solidarity | ✓ |
| sx_8 | Possession | |
| sp_9 | Appetite | |
| so_9 | Participation | ✓ |
| sx_9 | Fusion | |

## 4. 마이그레이션 전략

- `js/test-scoring.js` 신규 — pure functions, 재사용/테스트 가능.
- `js/test.js` 의 `renderResultFromScores` 가 `computeResult` 호출.
- 기존 single-instinct 텍스트 (`제 1본능: ...`) + binary wing 표시는 신규 % 형식과 병기 (Phase 5 에서 디자인 정리).
- 기존 sxBoost/soPenalty 보정은 일단 유지 (Phase 4 에서 정리 검토).

## 5. 검증 케이스 (Phase 3.7 unit test)

| 케이스 | core | wing | instincts | 기대 출력 |
|---|---:|---|---|---|
| Pure 7w8 | 7 | left:0, right:8 | sp_high, sx_high, so_low | `7 w8(100%) sx(...) sp(...) so(...)` |
| Balanced wing | 5 | left:8, right:8 | balanced | `5 (순수) ...` (pct=0) |
| Sexual 6 countertype | 6 | left:5, right:1 | sx 우세 | `6 w5(?) sx(...) ... ...` + countertype flag |
| Self-Pres 3 countertype | 3 | left:6, right:6 | sp 우세 | `3 (순수) sp(...) ... ...` + countertype flag |
| All instincts U | 7 | active wing | all 0 | `7 w8(?) sp(0%) sx(0%) so(0%)` |
| Single instinct only | 4 | left:6, right:6 | sp only answered | `4 (순수) sp(...) sx(0%) so(0%)` |
| Tie sp=sx | 1 | active wing | sp == sx > so | `1 w? sx(...) sp(...) so(...)` (sx tie-break wins) |
| Wing edge type 1 | 1 | left=9, right=2 | balanced | `1 w?(?) ...` |
| Wing edge type 9 | 9 | left=8, right=1 | balanced | `9 w?(?) ...` |
```

- [ ] **Step 3.1.3: Verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 3.1
git add docs/_meta/enneagram/scoring_spec.md
git commit -m "docs(enneagram-scoring): write scoring spec with audit + new wing/instinct/27 subtype formulas"
```

WORK_STATUS — `current_task = "3.2"`, 락 해제, HISTORY 에 complete.

---

## 4. Task 3.2 — `js/test-scoring.js` 신규 + wing % 함수

**Files:**
- Create: `js/test-scoring.js`

**Inputs:**
- `docs/_meta/enneagram/scoring_spec.md` (Task 3.1 산출물)
- 현재 `js/test.js` (계산 컨텍스트 참조)

**Definition of Done:**
- [ ] 신규 파일, 30-200 줄
- [ ] `computeWingPct(coreType, scores)` 함수 export
- [ ] 모듈 export — `if (typeof module !== 'undefined') { module.exports = {...} }` + ES module export 둘 다 (브라우저 + Node 호환)
- [ ] verify.mjs 3.2 통과

### Steps

- [ ] **Step 3.2.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.2.1", "3.2.2", "3.2.3"]`.

- [ ] **Step 3.2.2: 파일 작성**

Create `js/test-scoring.js`.

```javascript
// ER 에니어그램 테스트 스코어링 helper — wing %, instinct %, 27 subtype 산출 (Phase 3)
// pure functions, 브라우저 + Node.js 호환.

// === Wing % ===
//
// 두 wing 간 상대 우세를 0-100 으로 표현. 0 = 균등, 100 = 한쪽만.
// 50% 는 한쪽 wing 이 다른 쪽의 약 3배 강도 (75% : 25%).
//
// 입력:
//   coreType: 1-9
//   scores: { 1..9: number }  (각 type 의 누적 점수)
// 출력:
//   { wing: number|null, pct: 0-100 }
function computeWingPct(coreType, scores) {
  const left = coreType === 1 ? 9 : coreType - 1;
  const right = coreType === 9 ? 1 : coreType + 1;
  const leftScore = scores[left] || 0;
  const rightScore = scores[right] || 0;
  if (leftScore === 0 && rightScore === 0) return { wing: null, pct: 0 };
  const dominantWing = leftScore >= rightScore ? left : right;
  const dom = Math.max(leftScore, rightScore);
  const oth = Math.min(leftScore, rightScore);
  const total = dom + oth;
  if (total === 0) return { wing: null, pct: 0 };
  // [0.5, 1.0] -> [0%, 100%]
  const raw = (dom / total - 0.5) * 200;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return { wing: dominantWing, pct };
}

// 모듈 export (브라우저 + Node 호환)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeWingPct };
}
if (typeof window !== 'undefined') {
  window.TestScoring = Object.assign(window.TestScoring || {}, { computeWingPct });
}
```

- [ ] **Step 3.2.3: Verify + commit**

```bash
node -e 'const m = require("./js/test-scoring.js"); console.log(m.computeWingPct(7, {6: 30, 8: 50}));'
```

기대 출력 — `{ wing: 8, pct: 25 }` (50/(30+50) = 0.625 → (0.625-0.5)*200 = 25).

```bash
node docs/_meta/enneagram/verify.mjs 3.2
git add js/test-scoring.js
git commit -m "feat(enneagram-scoring): add test-scoring.js with computeWingPct (Phase 3.2)"
```

WORK_STATUS — `current_task = "3.3"`, 락 해제.

---

## 5. Task 3.3 — Instinct % 함수 추가

**Files:**
- Modify: `js/test-scoring.js`

**Inputs:** `js/test-scoring.js` (Task 3.2 산출물), `docs/_meta/enneagram/scoring_spec.md`.

**Definition of Done:**
- [ ] 60-250 줄 (누적)
- [ ] `computeInstinctPct(responses, q1)` 함수 추가 + export
- [ ] verify.mjs 3.3 통과

### Steps

- [ ] **Step 3.3.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.3.1", "3.3.2", "3.3.3"]`.

- [ ] **Step 3.3.2: 함수 추가**

기존 `js/test-scoring.js` 의 `computeWingPct` 다음에 추가 (export 도 갱신).

```javascript
// === Instinct % ===
//
// 각 본능 (sp/sx/so) 의 절대 강도. 응답된 문항으로 정규화.
// 결과는 서로 독립 (합 100% 아님).
//
// 입력:
//   responses: { [qId]: 'A' | 'B' | '1'..'6' | 'U' | undefined }
//   q1: phase 1 question array (각 항목에 .inst = 'sp'|'sx'|'so'|undefined)
// 출력:
//   { sp: 0-100, sx: 0-100, so: 0-100 }
function computeInstinctPct(responses, q1) {
  const buckets = { sp: { sum: 0, count: 0 }, sx: { sum: 0, count: 0 }, so: { sum: 0, count: 0 } };
  q1.forEach((q) => {
    if (!q.inst) return;
    const raw = responses[q.id];
    if (raw === 'U' || raw === undefined || raw === null) return;
    const score = Number(raw);
    if (!Number.isFinite(score)) return;
    if (!buckets[q.inst]) return;
    buckets[q.inst].sum += score;
    buckets[q.inst].count += 1;
  });
  const norm = (b) => (b.count === 0 ? 0 : Math.round((b.sum / (b.count * 6)) * 100));
  return { sp: norm(buckets.sp), sx: norm(buckets.sx), so: norm(buckets.so) };
}
```

마지막 export 부분 갱신.

```javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeWingPct, computeInstinctPct };
}
if (typeof window !== 'undefined') {
  window.TestScoring = Object.assign(window.TestScoring || {}, { computeWingPct, computeInstinctPct });
}
```

- [ ] **Step 3.3.3: Verify + commit**

```bash
node -e '
const m = require("./js/test-scoring.js");
const q1 = [
  { id: "i_sp_1", inst: "sp" },
  { id: "i_sp_2", inst: "sp" },
  { id: "i_sx_1", inst: "sx" },
];
const r = { i_sp_1: "5", i_sp_2: "6", i_sx_1: "3" };
console.log(m.computeInstinctPct(r, q1));
'
```

기대 출력 — `{ sp: 92, sx: 50, so: 0 }` (sp: (5+6)/(2*6)*100=91.67→92, sx: 3/6*100=50, so: 0/0=0).

```bash
node docs/_meta/enneagram/verify.mjs 3.3
git add js/test-scoring.js
git commit -m "feat(enneagram-scoring): add computeInstinctPct (Phase 3.3)"
```

WORK_STATUS — `current_task = "3.4"`, 락 해제.

---

## 6. Task 3.4 — 27 subtype + countertype 함수

**Files:**
- Modify: `js/test-scoring.js`

**Inputs:** `js/test-scoring.js`, `docs/_meta/enneagram/scoring_spec.md`.

**Definition of Done:**
- [ ] 100-300 줄 (누적)
- [ ] `computeDominantInstinct`, `compute27Subtype`, `isCountertype`, `COUNTERTYPES` 상수 + export
- [ ] verify.mjs 3.4 통과

### Steps

- [ ] **Step 3.4.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.4.1", "3.4.2", "3.4.3"]`.

- [ ] **Step 3.4.2: 함수 + 상수 추가**

기존 `js/test-scoring.js` 의 `computeInstinctPct` 다음에 추가.

```javascript
// === 27 Subtype + Countertype ===
//
// Phase 1 source_page_index.md countertype 빠른 색인 + Phase 2 subtypes_27.md 기준.
const COUNTERTYPES = {
  1: 'sx',  // Sexual 1 - Zeal
  2: 'sp',  // Self-Preservation 2 - Privilege
  3: 'sp',  // Self-Preservation 3 - Security
  4: 'sp',  // Self-Preservation 4 - Tenacity
  5: 'sx',  // Sexual 5 - Confidence
  6: 'sx',  // Sexual 6 - Strength/Beauty
  7: 'so',  // Social 7 - Sacrifice
  8: 'so',  // Social 8 - Solidarity
  9: 'so',  // Social 9 - Participation
};

// 1차 본능 결정 — max(sp, sx, so). tie 시 sx > sp > so 우선.
function computeDominantInstinct(instinctPct) {
  const { sp, sx, so } = instinctPct;
  const max = Math.max(sp, sx, so);
  if (max === 0) return null;
  if (sx === max) return 'sx';
  if (sp === max) return 'sp';
  return 'so';
}

function compute27Subtype(coreType, dominantInstinct) {
  if (!coreType || !dominantInstinct) return null;
  return `${dominantInstinct}_${coreType}`;
}

function isCountertype(coreType, dominantInstinct) {
  if (!coreType || !dominantInstinct) return false;
  return COUNTERTYPES[coreType] === dominantInstinct;
}
```

마지막 export 갱신.

```javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeWingPct, computeInstinctPct,
    computeDominantInstinct, compute27Subtype, isCountertype, COUNTERTYPES
  };
}
if (typeof window !== 'undefined') {
  window.TestScoring = Object.assign(window.TestScoring || {}, {
    computeWingPct, computeInstinctPct,
    computeDominantInstinct, compute27Subtype, isCountertype, COUNTERTYPES
  });
}
```

- [ ] **Step 3.4.3: Verify + commit**

```bash
node -e '
const m = require("./js/test-scoring.js");
console.log(m.computeDominantInstinct({ sp: 50, sx: 80, so: 60 }));  // expect "sx"
console.log(m.compute27Subtype(7, "sx"));                              // expect "sx_7"
console.log(m.isCountertype(7, "so"));                                 // expect true (Social 7 = Sacrifice countertype)
console.log(m.isCountertype(7, "sx"));                                 // expect false
'
```

```bash
node docs/_meta/enneagram/verify.mjs 3.4
git add js/test-scoring.js
git commit -m "feat(enneagram-scoring): add 27 subtype + countertype mapping (Phase 3.4)"
```

WORK_STATUS — `current_task = "3.5"`, 락 해제.

---

## 7. Task 3.5 — `computeResult` 통합 + `js/test.js` 와이어링

**Files:**
- Modify: `js/test-scoring.js` (`computeResult`, `formatResult` 추가)
- Modify: `js/test.js` (`renderResultFromScores` 가 `computeResult` 호출)

**Inputs:** Task 3.4 까지의 `js/test-scoring.js`, 현재 `js/test.js`.

**Definition of Done:**
- [ ] 140-350 줄 (누적, test-scoring.js)
- [ ] `computeResult({ coreType, scores, responses, q1 })` 통합 함수 + `formatResult(coreType, wing, instinctPct)` 추가
- [ ] `js/test.js` 의 `renderResultFromScores` 마지막에 `window.TestScoring.computeResult(...)` 호출하여 `wingCode` 와 instinct 표시 갱신
- [ ] 기존 출력 (`res-final` 등) 호환 유지 (regression 없음)
- [ ] verify.mjs 3.5 통과

### Steps

- [ ] **Step 3.5.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.5.1", "3.5.2", "3.5.3", "3.5.4"]`.

- [ ] **Step 3.5.2: `computeResult` + `formatResult` 추가 to test-scoring.js**

기존 `js/test-scoring.js` 의 `isCountertype` 다음에 추가.

```javascript
// === 통합 결과 함수 ===
//
// 모든 스코어링 함수를 묶어서 단일 결과 객체 반환.
//
// 입력:
//   { coreType: 1-9, scores: {1..9: number}, responses: {...}, q1: phase1 question array }
// 출력:
//   {
//     coreType: 1-9,
//     wing: { wing: number|null, pct: 0-100 },
//     instinctPct: { sp, sx, so },
//     dominantInstinct: 'sp'|'sx'|'so'|null,
//     subtype: 'sx_7' | 'sp_2' | etc | null,
//     countertype: boolean,
//     formatted: '7 w8(50%) sx(80%) so(60%) sp(10%)'
//   }
function computeResult({ coreType, scores, responses, q1 }) {
  const wing = computeWingPct(coreType, scores);
  const instinctPct = computeInstinctPct(responses, q1);
  const dominantInstinct = computeDominantInstinct(instinctPct);
  const subtype = compute27Subtype(coreType, dominantInstinct);
  const countertype = isCountertype(coreType, dominantInstinct);
  return {
    coreType,
    wing,
    instinctPct,
    dominantInstinct,
    subtype,
    countertype,
    formatted: formatResult(coreType, wing, instinctPct),
  };
}

function formatResult(coreType, wing, instinctPct) {
  const wingStr = wing && wing.wing !== null ? `w${wing.wing}(${wing.pct}%)` : '(순수)';
  const instArr = ['sp', 'sx', 'so']
    .map((k) => ({ k, v: instinctPct[k] }))
    .sort((a, b) => b.v - a.v);
  const instStr = instArr.map((i) => `${i.k}(${i.v}%)`).join(' ');
  return `${coreType} ${wingStr} ${instStr}`.trim();
}
```

마지막 export 갱신 — `computeResult, formatResult` 추가.

- [ ] **Step 3.5.3: `js/test.js` 의 `renderResultFromScores` 와이어링**

`js/test.js` 의 `renderResultFromScores` 함수에서 wing 결정 직후 (line ~847 부근, `wingCode = ${core}w${w}` 다음) `window.TestScoring.computeResult` 호출 추가.

기존 코드 (변경 X 영역 — wing decision logic 그대로 유지).

```javascript
if (ws !== rs) {
      const w = ls >= rs ? l : r;
      const ws_score = Math.max(ls, rs);
      if (ws_score > 0 && ws_score >= cs * TEST_CONFIG.thresholds.wingActivationRatio) {
        wing = `${w}번 날개`;
        wingCode = `${core}w${w}`;
      }
    }
  }
```

이 구간 다음에, `document.getElementById('res-final').innerText` 호출 직전에 추가.

```javascript
  // Phase 3 — 통합 결과 (wing %, instinct %, 27 subtype, formatted)
  let phase3Result = null;
  try {
    if (typeof window !== 'undefined' && window.TestScoring && window.TestScoring.computeResult) {
      const scoresForResult = {};
      for (let i = 1; i <= 9; i++) scoresForResult[i] = ps[i] || 0;
      phase3Result = window.TestScoring.computeResult({
        coreType: core,
        scores: scoresForResult,
        responses: testState.phase1Responses,
        q1: q1,
      });
    }
  } catch (e) {
    phase3Result = null;
  }
```

`document.getElementById('res-final').innerText = ...` 라인을 다음으로 교체 (phase3Result 가 있으면 신규 형식 사용).

```javascript
  document.getElementById('res-final').innerText = phase3Result
    ? phase3Result.formatted
    : `${instinctCode} ${wingCode}`;
```

`document.getElementById('res-instincts').innerText = ...` 라인은 유지하되 phase3Result 가 있을 때 추가 정보 노출.

```javascript
  document.getElementById('res-instincts').innerText = phase3Result
    ? `27 subtype: ${phase3Result.subtype || '미정'}${phase3Result.countertype ? ' (countertype)' : ''}`
    : `제 1본능: ${instinctLabel}`;
```

(나머지 res-core / res-wing / res-arrows 는 유지.)

- [ ] **Step 3.5.4: test.html 에 script 태그 추가**

`test.html` 의 기존 `<script src="js/test.js"></script>` 직전에 (또는 동일 위치) 추가.

```html
<script src="js/test-scoring.js"></script>
```

(`window.TestScoring` 이 test.js 보다 먼저 로드되어야 함.)

검증 — 브라우저에서 `test.html` 열기 + 테스트 진행. `res-final` 이 신규 형식 (`7 w8(50%) ...`) 으로 출력되는지 확인. (수동 검증 — 사용자 OK 후 commit.)

```bash
node docs/_meta/enneagram/verify.mjs 3.5
git add js/test-scoring.js js/test.js test.html
git commit -m "feat(enneagram-scoring): integrate computeResult into renderResultFromScores (Phase 3.5)"
```

WORK_STATUS — `current_task = "3.6"`, 락 해제.

---

## 8. Task 3.6 — `test.html` 결과 placeholder 신규

**Files:**
- Modify: `test.html`

**Inputs:** Task 3.5 까지의 통합 결과.

**Definition of Done:**
- [ ] `res-wing-pct`, `res-instinct-pct`, `res-subtype-27` placeholder 추가
- [ ] `js/test.js` 가 phase3Result 로 채움
- [ ] 기존 placeholder (`res-final`, `res-core`, `res-wing`, `res-arrows`, `res-log`, `res-top3`) 유지
- [ ] verify.mjs 3.6 통과 (test.html 라인 수 200-400)

### Steps

- [ ] **Step 3.6.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.6.1", "3.6.2", "3.6.3"]`.

- [ ] **Step 3.6.2: test.html 갱신**

기존 결과 카드 섹션 (test.html line 95-120 부근, `res-core` / `res-wing` / `res-arrows` 들) 이후에 신규 placeholder 카드 3개 추가.

기존 마지막 카드 다음에 (구체 위치 — Read 로 결과 섹션 찾고 동일 grid 안에 추가).

```html
<div class="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
  <p class="text-xs text-gray-400 font-bold uppercase mb-1">Wing Strength</p>
  <p id="res-wing-pct" class="text-2xl font-bold text-gray-800"></p>
</div>
<div class="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 col-span-2">
  <p class="text-xs text-gray-400 font-bold uppercase mb-1">Instinct Stack</p>
  <p id="res-instinct-pct" class="text-lg font-medium text-gray-800"></p>
</div>
<div class="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 col-span-2">
  <p class="text-xs text-gray-400 font-bold uppercase mb-1">27 Subtype</p>
  <p id="res-subtype-27" class="text-2xl font-bold text-gray-800"></p>
</div>
```

`js/test.js` 의 `renderResultFromScores` 에 phase3Result 가 있을 때 채움 추가 (Task 3.5 의 와이어링 직후 또는 같은 블록).

```javascript
  if (phase3Result) {
    const wEl = document.getElementById('res-wing-pct');
    if (wEl) wEl.innerText = phase3Result.wing.wing
      ? `${phase3Result.wing.pct}% (w${phase3Result.wing.wing})`
      : '활성화 안됨';
    const iEl = document.getElementById('res-instinct-pct');
    if (iEl) {
      const i = phase3Result.instinctPct;
      iEl.innerText = `sp(${i.sp}%) sx(${i.sx}%) so(${i.so}%)`;
    }
    const sEl = document.getElementById('res-subtype-27');
    if (sEl) sEl.innerText = phase3Result.subtype
      ? `${phase3Result.subtype}${phase3Result.countertype ? ' (countertype)' : ''}`
      : '미정';
  }
```

- [ ] **Step 3.6.3: Verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 3.6
git add test.html js/test.js
git commit -m "feat(enneagram-scoring): add wing-pct/instinct-pct/subtype-27 placeholders (Phase 3.6)"
```

WORK_STATUS — `current_task = "3.7"`, 락 해제.

---

## 9. Task 3.7 — Unit tests

**Files:**
- Create: `tests/test-scoring.test.mjs`

**Inputs:** `js/test-scoring.js` 완성된 모듈.

**Definition of Done:**
- [ ] Node test runner ESM 단위 테스트, 의존 없음
- [ ] 8-12 케이스 (Pure 7w8, Balanced wing, Sexual 6 countertype, Self-Pres 3 countertype, All instincts U, Single instinct only, Tie sp=sx, Wing edge type 1, Wing edge type 9 등)
- [ ] `node --test tests/test-scoring.test.mjs` 통과
- [ ] verify.mjs 3.7 통과

### Steps

- [ ] **Step 3.7.1: 락 + checkpoint_plan**

`checkpoint_plan = ["3.7.1", "3.7.2", "3.7.3"]`.

- [ ] **Step 3.7.2: 테스트 작성**

Create `tests/test-scoring.test.mjs`.

```javascript
// js/test-scoring.js 단위 테스트 (Node test runner ESM, 의존 없음)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const scoring = require('../js/test-scoring.js');

const Q1_INSTINCT = [
  { id: 'i_sp_1', inst: 'sp' },
  { id: 'i_sp_2', inst: 'sp' },
  { id: 'i_sp_3', inst: 'sp' },
  { id: 'i_sx_1', inst: 'sx' },
  { id: 'i_sx_2', inst: 'sx' },
  { id: 'i_sx_3', inst: 'sx' },
  { id: 'i_so_1', inst: 'so' },
  { id: 'i_so_2', inst: 'so' },
  { id: 'i_so_3', inst: 'so' },
];

test('computeWingPct — pure 7w8', () => {
  const r = scoring.computeWingPct(7, { 6: 0, 8: 50 });
  assert.equal(r.wing, 8);
  assert.equal(r.pct, 100);
});

test('computeWingPct — balanced 5w (4 == 6)', () => {
  const r = scoring.computeWingPct(5, { 4: 30, 6: 30 });
  // tied → leftScore >= rightScore returns left (4)
  assert.equal(r.wing, 4);
  assert.equal(r.pct, 0);
});

test('computeWingPct — moderate 7w8 (50%)', () => {
  // dom/(dom+oth) = 0.75 → (0.75-0.5)*200 = 50
  const r = scoring.computeWingPct(7, { 6: 10, 8: 30 });
  assert.equal(r.wing, 8);
  assert.equal(r.pct, 50);
});

test('computeWingPct — wing edge type 1 (left=9, right=2)', () => {
  const r = scoring.computeWingPct(1, { 9: 10, 2: 30 });
  assert.equal(r.wing, 2);
});

test('computeWingPct — wing edge type 9 (left=8, right=1)', () => {
  const r = scoring.computeWingPct(9, { 8: 30, 1: 10 });
  assert.equal(r.wing, 8);
});

test('computeWingPct — both wings zero', () => {
  const r = scoring.computeWingPct(7, { 6: 0, 8: 0 });
  assert.equal(r.wing, null);
  assert.equal(r.pct, 0);
});

test('computeInstinctPct — all answered max', () => {
  const responses = {
    i_sp_1: '6', i_sp_2: '6', i_sp_3: '6',
    i_sx_1: '3', i_sx_2: '3', i_sx_3: '3',
    i_so_1: '1', i_so_2: '1', i_so_3: '1',
  };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.equal(r.sp, 100);
  assert.equal(r.sx, 50);
  assert.equal(r.so, 17);  // 1/6*100=16.67 → 17
});

test('computeInstinctPct — all U (unscored)', () => {
  const responses = {
    i_sp_1: 'U', i_sp_2: 'U', i_sp_3: 'U',
    i_sx_1: 'U', i_sx_2: 'U', i_sx_3: 'U',
    i_so_1: 'U', i_so_2: 'U', i_so_3: 'U',
  };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.deepEqual(r, { sp: 0, sx: 0, so: 0 });
});

test('computeInstinctPct — partial answered (sp only)', () => {
  const responses = { i_sp_1: '5', i_sp_2: '5' };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.equal(r.sp, 83);  // 10/12*100=83.33 → 83
  assert.equal(r.sx, 0);
  assert.equal(r.so, 0);
});

test('computeDominantInstinct — sx wins on tie', () => {
  assert.equal(scoring.computeDominantInstinct({ sp: 50, sx: 50, so: 30 }), 'sx');
});

test('compute27Subtype — sx_7', () => {
  assert.equal(scoring.compute27Subtype(7, 'sx'), 'sx_7');
});

test('isCountertype — Social 7 (Sacrifice) is countertype', () => {
  assert.equal(scoring.isCountertype(7, 'so'), true);
});

test('isCountertype — Sexual 7 is NOT countertype', () => {
  assert.equal(scoring.isCountertype(7, 'sx'), false);
});

test('isCountertype — Sexual 6 (Strength/Beauty) is countertype', () => {
  assert.equal(scoring.isCountertype(6, 'sx'), true);
});

test('computeResult — full integration', () => {
  const responses = {
    i_sp_1: '5', i_sp_2: '5', i_sp_3: '5',
    i_sx_1: '4', i_sx_2: '4', i_sx_3: '4',
    i_so_1: '2', i_so_2: '2', i_so_3: '2',
  };
  const r = scoring.computeResult({
    coreType: 7,
    scores: { 6: 10, 8: 30 },
    responses,
    q1: Q1_INSTINCT,
  });
  assert.equal(r.coreType, 7);
  assert.equal(r.wing.wing, 8);
  assert.equal(r.wing.pct, 50);
  assert.equal(r.dominantInstinct, 'sp');  // sp=83 > sx=67 > so=33
  assert.equal(r.subtype, 'sp_7');
  assert.equal(r.countertype, false);  // 7's countertype is so
  assert.match(r.formatted, /^7 w8\(50%\) sp\(83%\) sx\(67%\) so\(33%\)$/);
});

test('formatResult — pure type (no wing)', () => {
  const r = scoring.formatResult(5, { wing: null, pct: 0 }, { sp: 50, sx: 30, so: 20 });
  assert.equal(r, '5 (순수) sp(50%) sx(30%) so(20%)');
});
```

- [ ] **Step 3.7.3: 실행 + commit**

```bash
mkdir -p tests
# (Step 3.7.2 의 Write 가 디렉토리 생성하지만 안전을 위해)
node --test tests/test-scoring.test.mjs
```

기대 출력 — 모든 테스트 통과.

```bash
node docs/_meta/enneagram/verify.mjs 3.7
git add tests/test-scoring.test.mjs
git commit -m "test(enneagram-scoring): add unit tests for test-scoring.js (Phase 3.7)"
```

WORK_STATUS — `current_task = "3.8"`, 락 해제.

---

## 10. Task 3.8 — Phase 3 종료 검증 + Phase 4 인계

**Files:**
- Create: `docs/_meta/enneagram/PHASE_4_PLAN.md` (placeholder)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`

**Inputs:** 모든 Phase 3 산출물.

**Definition of Done:**
- [ ] `node docs/_meta/enneagram/verify.mjs all` 통과
- [ ] `node --test tests/test-scoring.test.mjs` 통과
- [ ] PHASE_4_PLAN.md placeholder 생성
- [ ] WORK_STATUS — `current_phase = 4`, `current_task = "4.0"`
- [ ] HISTORY — Phase 3 complete

### Steps

- [ ] **Step 3.8.1: 전체 verify + 테스트 실행**

```bash
node docs/_meta/enneagram/verify.mjs all
node --test tests/test-scoring.test.mjs
```

기대 — 둘 다 통과.

- [ ] **Step 3.8.2: PHASE_4_PLAN.md placeholder**

```markdown
<!-- Phase 4 (코드베이스 정리) plan placeholder -->
---
kb_id: enneagram_test_meta.phase_4_plan
title: "Phase 4 Implementation Plan — Codebase Cleanup"
phase: 4
created_at: "<ISO>"
status: placeholder
retrieval_tags:
  - phase_4
  - placeholder
  - codebase_cleanup
  - test_consolidation
---

# Phase 4 Implementation Plan — Codebase Cleanup

이 plan 은 Phase 4 시작 시 작성됩니다. js/test.js (969 줄, 단독 페이지) 와 js/app-adaptive.js (616 줄, iframe 임베드) 의 중복 로직을 단일 모듈로 통합합니다.

## 작성 가이드

- task 분해 — (1) 두 파일 diff 분석 (2) 공통 로직 추출 → js/test-engine.js 단일 모듈 (3) test.js + app-adaptive.js 가 동일 모듈 사용 (4) test-scoring.js 통합 (5) regression 테스트 (6) 정리/문서.
- 입력 — 현재 js/test.js, js/app-adaptive.js, js/app-adaptive-data.js, Phase 3 의 test-scoring.js.
- 산출물 — js/test-engine.js (또는 동등) 신규, test.js + app-adaptive.js 가 가벼운 wrapper 로 축소.

## Phase 4 종료 조건

- 단일 스코어링 + 렌더링 모듈, test.html 과 임베드 둘 다 동일 결과.
- Unit test + 수동 regression 통과.
- WORK_STATUS.current_phase = 5 로 전환.
```

- [ ] **Step 3.8.3: WORK_STATUS Phase 3 → Phase 4 전환**

`current_phase = 4`, `current_task = "4.0"`, `last_updated = now`.

- [ ] **Step 3.8.4: HISTORY 갱신 + Final commit**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-scoring): close Phase 3 (scoring accuracy), advance to Phase 4"
```

다음 wakeup 은 Phase 4 의 task 4.0 (PHASE_4_PLAN 작성) 시작.

---

## 11. Self-Review 체크리스트

- [x] 모든 task self-contained — 정확한 파일 경로 + 코드/명세 + 검증
- [x] No placeholders — TBD/TODO 0
- [x] 모든 step 에 정확한 commit 메시지 + verify 명령
- [x] 락 protocol Phase 1/2 와 동일
- [x] 토큰 graceful — task 별 30-45 분 추정
- [x] 공식 (wing %, instinct %, countertype) 명시 + 단위 테스트로 검증
- [x] 27 subtype 매핑 + countertype 9 매핑 spec + 코드 일관
- [x] PDF 직접 인용 0회
- [x] CLAUDE.md rule 준수 — 한국어 헤더 (markdown only), 콜론 끝 X, 세만틱 commit
