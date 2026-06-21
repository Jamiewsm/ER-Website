# ER Test Active Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 운영 중인 ER 테스트(`test.html -> js/test.js`)를 퇴보 없이 발전시켜, 단순 유형 결과가 아니라 신뢰도·응답 품질·상담 확인 질문·실험 데이터 기반 개선이 가능한 타이핑 플랫폼으로 만든다.

**Architecture:** 과거 Phase 1~6 plan은 archive이며 실행 금지다. 새 작업은 현재 운영 경로인 `test.html`, `js/test.js`, `js/diagnostic-report-content.js`, `js/report-support-materials.js`, `css/test.css`, `js/diagnostic-experiment.js` 위에서만 진행한다. 오래된 helper/renderer는 그대로 되살리지 않고, 필요한 계산 아이디어만 현재 premium v2 구조에 흡수한다.

**Tech Stack:** Vanilla JS, HTML/CSS, Node.js built-in test runner, existing Supabase experiment table, existing ER premium report renderer.

---

## 0. Authority Rules

이 문서가 현재 ER Enneagram Test 발전 작업의 활성 기준이다.

- `PHASE_PLAN.md`, `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, `PHASE_4_PLAN.md`, `PHASE_5_PLAN.md`, `PHASE_6_PLAN.md`는 historical archive다. 새 작업의 source of truth로 쓰지 않는다.
- `js/test-result-renderer.js`, `js/test-charts.js`, `js/subtypes-27-data.js`는 현재 운영 결과지에 그대로 재연결하지 않는다.
- `js/test-scoring.js`는 참고 helper/test fixture로만 본다. 현재 `js/test.js`의 최신 scoring/Phase 4 흐름을 대체하지 않는다.
- `js/app-adaptive*.js`는 legacy direct-render 경로다. 새 기능은 이 경로에 먼저 넣지 않는다.
- Countertype 확장은 새 문항 추가보다 실험 데이터로 기존 문항 성능을 확인한 뒤 진행한다.

## 1. Current Operating Baseline

- Entry point: `test.html -> js/test.js`
- Phase 1 fixed items: 39
- Center items: `center_auto_1`~`center_auto_3`, `center_situation_1`~`center_situation_3`
- Instinct items: Likert 9 + `instinct_attention_1`
- Current Phase 4: core-specific subtype behavior questions 3 + wing behavior questions 3, resolved by majority
- Current correction already present: state-anxiety adjustment for Type 6 near 1/5/9
- Current situational tie-breakers already present: 1↔6, 4↔7, 5↔9
- Missing high-ROI pieces: response quality check, confidence explanation card, consultation verification questions, experiment analytics workflow

## 2. Priority Order

| Priority | Workstream | Reason |
|---:|---|---|
| 1 | Response Quality Check | Psychometric credibility. Detect too-fast, straight-lining, neutral/unknown overuse, and internal inconsistency. |
| 2 | Confidence Explanation Card + Consultation Questions | Turns "you are Type X" into a professional typing experience. Improves trust and consultation conversion. |
| 3 | c1~c9 / deep item automatic-reaction rewrite audit | Accuracy lift without adding much fatigue. Focus on 3, 4, 6, 9 first. |
| 4 | Situational Tie-breaker audit/extension | Existing 1↔6, 4↔7, 5↔9 should be verified. Add 2↔9 only if gap remains. |
| 5 | Experiment Data Collection upgrade | Build the dataset that enables real calibration. This is the long-term moat. |
| 6 | Weight Recalibration Workflow | Only after enough labeled/feedback data exists. Avoid intuition-only weight changes. |
| 7 | Countertype Performance Audit before expansion | Existing countertype questions may already cover much of the need. Expand only after data identifies misses. |
| 8 | Subtype Refinement | Improve subtype depth after core/quality/confidence workflow is stable. |
| 9 | Result Report Business Layer | Continue strengthening "how to help myself/others" and ER school/consulting hook. |

## 3. Implementation Tasks

### Task 1: Response Quality Engine

**Files:**
- Modify: `js/test.js`
- Create: `tests/response-quality.test.mjs`
- Update: `docs/_meta/enneagram/scoring_spec.md`
- Update: `docs/_meta/enneagram/WORK_STATUS.md`

- [x] **Step 1: Add tests for quality flags**

Test cases:

```js
// tests/response-quality.test.mjs
// Required exported/test-accessible behavior:
// buildResponseQualitySnapshot({ responses, timings, scoringAxes, ranked, instinctPct, tieState })
//
// Expected flags:
// 1. too_fast_total: average answered item time under 4 seconds after 20+ items
// 2. straight_lining: same Likert value >= 75% of scored Likert responses
// 3. unknown_overuse: U responses >= 25% of scored/unknown Likert items
// 4. center_core_mismatch: strongest center differs from final core center with low confidence
// 5. instinct_unclear: top instinct gap < 10 points or max instinct percent < 35
```

Run:

```bash
node --test tests/response-quality.test.mjs
```

Expected before implementation: FAIL because `buildResponseQualitySnapshot` is not exposed.

- [x] **Step 2: Add timing collection without changing scoring**

Implementation boundary:

- Record test start time at first visible Phase 1 render.
- Record per-question first-answer timestamp on radio change.
- Do not block result generation based on timing.
- Store timing in `testState.responseTiming`.

Acceptance:

```js
testState.responseTiming = {
  startedAt: "<ISO>",
  firstAnswerAt: { [questionId]: "<ISO>" },
  completedAt: "<ISO>",
  totalSeconds: 0,
  answeredCount: 0,
  avgSecondsPerAnswered: 0
}
```

- [x] **Step 3: Implement quality snapshot**

Required output shape:

```js
{
  level: "good" | "caution" | "low",
  flags: [
    { code: "too_fast_total", severity: "caution", label: "응답 시간이 매우 짧음", evidence: "39문항 평균 3.1초" }
  ],
  metrics: {
    totalSeconds: 0,
    avgSecondsPerAnswered: 0,
    straightLineRatio: 0,
    unknownRatio: 0,
    centerCoreAligned: true,
    instinctGap: 0
  }
}
```

- [x] **Step 4: Add quality snapshot to premium model and experiment payload**

Required:

- `buildPremiumReportModel()` receives `responseQuality`.
- `window.ERDiagnosticExperiment.onResultReady()` payload includes `responseQuality`.
- Supabase row JSON payload keeps the full response quality object.

- [x] **Step 5: Verify**

Run:

```bash
node --check js/test.js
node --test tests/response-quality.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs
```

Expected: all pass.

### Task 2: Confidence Explanation Card + Consultation Questions

**Files:**
- Modify: `js/test.js`
- Modify: `css/test.css`
- Create: `tests/confidence-card.test.mjs`

- [x] **Step 1: Add tests for confidence explanation model**

Required behavior:

```js
// buildConfidenceExplanation({ confidence, diff, core, second, instinctPct, responseQuality, tieState, stateStressAdjustment })
```

Expected output:

```js
{
  label: "신뢰도: 보통",
  reasons: [
    "7번과 9번 점수 차이가 4.0%로 근접합니다.",
    "본능 점수는 비교적 선명합니다.",
    "센터 응답은 코어 결과와 대체로 일치합니다.",
    "7↔9 감별 문항에서 혼합 패턴이 나타났습니다."
  ],
  consultationQuestions: [
    "갈등이 생길 때 불편함을 낮추기 위해 회피하는 편인가요?",
    "무거운 감정을 다른 가능성으로 빠르게 재해석하는 편인가요?"
  ]
}
```

- [x] **Step 2: Implement top pair consultation question map**

Initial required pairs:

| Pair | Questions |
|---|---|
| 4↔7 | "무거운 감정이 올라올 때 그 감정 안으로 더 들어가나요, 아니면 다른 가능성으로 전환하나요?" / "반복적 일상에서 공허함이 먼저 오나요, 갇힘과 지루함이 먼저 오나요?" |
| 5↔9 | "물러나는 이유가 에너지 보존인가요, 관계 긴장 완충인가요?" / "침묵할 때 내 공간을 지키는 느낌인가요, 분위기를 덮는 느낌인가요?" |
| 2↔9 | "맞춰주는 이유가 필요한 존재가 되고 싶어서인가요, 마찰을 줄이고 싶어서인가요?" / "거절이 올 때 존재 의미가 흔들리나요, 긴장이 커지는 것이 부담스럽나요?" |
| 1↔6 | "계속 확인하는 이유가 기준 미달을 고치려는 것인가요, 빠진 위험을 막으려는 것인가요?" / "불확실할 때 분노가 먼저 오나요, 불안이 먼저 오나요?" |
| 3↔9 | "적응의 목적이 성과/이미지 유지인가요, 마찰 없는 흐름 유지인가요?" / "압박에서 더 밀어붙이나요, 흐름을 낮추고 미루나요?" |
| 6↔8 | "강하게 맞설 때 검증하려는 마음인가요, 주도권을 되찾으려는 마음인가요?" / "갈등 뒤에 재점검이 남나요, 정리됐다는 느낌이 남나요?" |

- [x] **Step 3: Render card in premium report**

Placement:

- After result summary / before next-step CTA.
- Must not look like a warning-only error state.
- If quality is low, show "해석 주의" and consultation questions.
- If confidence is high, still show why it is high.

- [x] **Step 4: Verify**

Run:

```bash
node --check js/test.js
node --test tests/confidence-card.test.mjs tests/report-support-wiring.test.mjs
```

Expected: all pass.

### Task 3: Automatic-Reaction Rewrite Audit

**Files:**
- Modify: `docs/diagnostic_test_question_bank_full.md`
- Modify: `docs/_meta/enneagram/scoring_spec.md`
- Modify after approval: `js/test.js`
- Test: `tests/question-copy-regression.test.mjs`

- [ ] **Step 1: Audit current 1단계 and deep items**

Focus:

- Type 3: avoid generic "value/performance" self-concept language; prefer "무능해 보였을까", "결과로 증명해야 진정됨", "실패 장면 replay".
- Type 4: avoid generic "자극"; prefer "결핍/빠진 느낌/감정 동일시/온전히 속하지 못함".
- Type 6: avoid generic "생각 많음"; prefer "확인해야 안심", "빠진 위험", "다른 사람은 넘어가도 한 번 더".
- Type 9: avoid generic "착함/평화"; prefer "불편함을 낮추기", "미루기/흐리기", "내 입장보다 긴장 완충".

- [ ] **Step 2: Create copy proposal before code changes**

Output section in `diagnostic_test_question_bank_full.md`:

```markdown
## 자동반응 리라이팅 후보

| ID | Current | Proposed | Reason | Risk |
|---|---|---|---|---|
```

- [ ] **Step 3: Apply only approved wording**

Do not alter weights in the same patch. Copy change and weight change must be separate.

- [ ] **Step 4: Verify**

Run:

```bash
node --check js/test.js
node --test tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs tests/question-copy-regression.test.mjs
```

### Task 4: Situational Tie-breaker Audit/Extension

**Files:**
- Modify: `js/test.js`
- Create: `tests/tie-breaker-routing.test.mjs`
- Update: `docs/_meta/enneagram/scoring_spec.md`

- [ ] **Step 1: Confirm existing routing**

Already present and must be tested before adding more:

- `tb16` / `t16`: 1↔6
- `tb47` / `t47`: 4↔7
- `tb59` / `t59`: 5↔9

- [ ] **Step 2: Add missing 2↔9 only if routing test shows gap**

Proposed 2↔9 questions:

```js
const tb29 = [
  {
    id: 'tb_2_9_1',
    format: 'ab',
    leftType: 2,
    rightType: 9,
    q: '상대에게 맞춰주거나 양보할 때, 더 가까운 속마음은?',
    a: '내가 필요한 존재이고 관계 안에서 의미 있는 사람으로 남고 싶다.',
    b: '마찰이 커지지 않고 분위기가 편안하게 유지되면 좋겠다.'
  },
  {
    id: 'tb_2_9_2',
    format: 'ab',
    leftType: 2,
    rightType: 9,
    q: '거절이나 거리감이 생겼을 때, 더 먼저 흔들리는 것은?',
    a: '내가 더 이상 상대에게 특별히 필요하지 않은 사람처럼 느껴지는 것',
    b: '관계 안의 불편한 긴장이 오래 이어지는 것'
  },
  {
    id: 'tb_2_9_3',
    format: 'ab',
    leftType: 2,
    rightType: 9,
    q: '내 필요를 뒤로 미룰 때, 더 자주 일어나는 패턴은?',
    a: '상대가 나의 헌신과 필요를 알아봐 주기를 은근히 기대한다.',
    b: '내 필요를 분명히 말하면 분위기가 불편해질 것 같아 흐리게 넘긴다.'
  }
];
```

- [ ] **Step 3: Verify**

Run:

```bash
node --check js/test.js
node --test tests/tie-breaker-routing.test.mjs tests/report-support-wiring.test.mjs
```

### Task 5: Experiment Data Collection Upgrade

**Files:**
- Modify: `js/diagnostic-experiment.js`
- Modify: `js/test.js`
- Create: `tests/experiment-payload.test.mjs`
- Update if needed: Supabase migration for `diagnostic_experiment_sessions`

- [ ] **Step 1: Expand payload**

Required fields inside stored JSON payload:

```js
{
  result: { core, subtype, wing, confidence },
  rankedTop3: [{ type, score, share }],
  topPair: { first, second, diff },
  responseQuality,
  scoringAxes,
  tieBreakersUsed,
  stateStressAdjustment,
  phase4Result,
  timings
}
```

- [ ] **Step 2: Improve feedback UI**

Keep current fields and add:

- "상담자가 확정한 유형" separated into core/subtype/wing
- "결과에서 맞았던 부분"
- "결과에서 틀렸던 부분"
- "상담에서 꼭 확인해야 할 것"

- [ ] **Step 3: Verify**

Run:

```bash
node --check js/diagnostic-experiment.js js/test.js
node --test tests/experiment-payload.test.mjs
```

### Task 6: Analytics and Weight Recalibration Workflow

**Files:**
- Create: `scripts/analyze_diagnostic_experiments.mjs`
- Create: `docs/_meta/enneagram/WEIGHT_CALIBRATION_WORKFLOW.md`

- [ ] **Step 1: Export confusion matrix**

Required outputs:

```text
predicted_core -> confirmed_core count
predicted_subtype -> confirmed_subtype count
low_confidence accuracy
quality_flag accuracy
tie_pair miss rate
countertype miss rate
```

- [ ] **Step 2: Define rule for weight changes**

No production weight change unless:

- At least 100 usable experiment rows
- At least 20 rows for the affected confusion pair, or a clear qualitative review reason
- A before/after replay test shows improvement without increasing adjacent regressions

- [ ] **Step 3: Verify**

Run:

```bash
node scripts/analyze_diagnostic_experiments.mjs --fixture tests/fixtures/diagnostic-experiments.sample.json
```

### Task 7: Countertype Performance Audit Before Expansion

**Files:**
- Create: `docs/_meta/enneagram/COUNTERTYPE_PERFORMANCE_AUDIT.md`
- Create: `tests/countertype-routing.test.mjs`

- [ ] **Step 1: Document existing countertype coverage**

Current code already has countertype questions for 9 countertypes. Audit should answer:

- Which countertype questions are shown?
- What trigger condition opens them?
- Which countertypes are often misclassified as another core?
- Which misses are caused by wording, trigger, or weight?

- [ ] **Step 2: Do not add 9 new countertype questions yet**

Expansion rule:

- Add new countertype questions only when experiment data shows systematic miss.
- Prefer adjusting trigger/weight or wording before adding more fatigue.

### Task 8: Result Report Business Layer

**Files:**
- Modify: `js/test.js`
- Modify: `js/diagnostic-report-content.js`
- Modify: `css/test.css`
- Update: `docs/report-content/support-materials/WORKFLOW.md`

- [ ] **Step 1: Add "나를 돕는 법 / 타인을 돕는 법" structure**

Required sections:

- 나의 필요
- 나의 욕구
- 강점
- 방어/약점
- 내가 힘들 때 필요한 도움
- 가족/동료/리더가 나를 도울 방법
- 상담/스쿨에서 확인하면 좋은 주제

- [ ] **Step 2: Keep hook smooth**

Do not render a hard sales block. The CTA should follow naturally from uncertainty, growth need, and relational application.

## 4. First Execution Recommendation

Start with Task 1 and Task 2 together only if the developer can keep them cleanly separated:

1. Response Quality Engine
2. Confidence Explanation Card + Consultation Questions

These give the highest ROI because they improve trust, professional feel, consultation conversion, and future data quality without adding user fatigue.
