<!-- 에니어그램 테스트 발전 프로젝트의 현재 진행 상태 SSOT. 모든 wakeup/세션의 1차 참조 -->
---
kb_id: enneagram_test_meta.work_status
schema_version: 1
title: "ER Enneagram Test — Work Status"
created_at: "2026-05-06"
last_updated: "2026-06-21"
retrieval_tags:
  - work_status
  - phase_progress
  - lock_state
  - project_complete
current_phase: 7
current_task: "manual evolution batch complete; ready for review/deploy"
checkpoint_plan: []
checkpoint: null
paused: true
schedule_interval_hours: 6
locked_task: null
lock_holder: null
lock_expires_at: null
wakeup_count: 1
last_wakeup_tokens: null
scheduled_task_id: "er-enneagram-auto-resume"
project_status: "manual_updates_after_phase_6"
---

# Work Status — 자동화 완료 후 수동 개선 진행

## 2026-06-20 현재 운영 코드 스냅샷

- 현재 운영 진입점은 `test.html` -> `js/test.js`다.
- `test.html`은 `js/program-catalog.js`, `js/diagnostic-report-content.js`, `js/report-support-materials.js`, `js/test.js`를 로드한다.
- 현재 `test.html`은 `js/test-scoring.js`, `js/test-shared.js`, `js/test-charts.js`, `js/test-result-renderer.js`, `js/subtypes-27-data.js`를 로드하지 않는다.
- 1단계 고정 문항은 39개다: `center_auto_1`~`center_auto_3`, `center_situation_1`~`center_situation_3`, core/type 문항 14개, A/B 6개, state 3개, instinct 문항 10개(리커트 9개 + attention-bias 상황형 1개).
- 센터 문항은 "어떻게 보였는가 / 이해해야 안심된다 / 몸이 먼저 반응한다" 축으로 재작성되어 있고, 문항당 가중치는 `0.6`이다. 센터 문항은 상관성 과대 문제를 줄이기 위해 10개에서 6개로 축소했고, 후반 3개는 `center_situation_*` 상황형 ID로 분리했다.
- 최근 2주 상태 문항이 높고 6번이 1/5/9와 근접하면 `appendStateAnxietyTieBreakersForType6`가 1-6, 5-6, 6-9 타이브레이커를 보강하고, `applyStateStressAdjustment`가 6번 점수에 상태성 불안 보정을 적용한다.
- 4단계는 코어 확정 후 하위유형 행동문항 3개 + 날개 행동문항 3개를 열고, 단일 문항이 아니라 다수결로 판정한다.
- 응답 품질 체크 1차 구현이 들어갔다. `buildResponseQualitySnapshot`이 너무 빠른 응답, 직선 응답, `U` 과다, 센터-코어 불일치, 본능 불명확성을 판정하고, `responseTiming`은 첫 응답 시각/완료 시각/문항당 평균 시간을 보관한다. 현재는 점수에 개입하지 않고 premium model과 experiment payload/row JSON에만 실린다.
- Confidence 설명 카드가 결과지에 들어갔다. `buildConfidenceExplanation`은 1-2위 격차, 본능 선명도, 응답 품질, 센터-코어 일치, 타이브레이커 적용 여부를 설명하고 주요 혼동쌍 상담 확인 질문을 자동 생성한다.
- 결과지는 현재 `js/test.js` 내부 premium renderer와 `js/diagnostic-report-content.js`, `js/report-support-materials.js`, `css/test.css` 중심으로 생성된다.
- 현재 발전 계획은 [ACTIVE_EVOLUTION_PLAN.md](./ACTIVE_EVOLUTION_PLAN.md)를 기준으로 한다.
- 오래된 문서/모듈이 현재 코드에 잘못 적용되지 않도록 [CODE_GAP_AUDIT.md](./CODE_GAP_AUDIT.md)를 guardrail로 사용한다.

## 현재 활성 우선순위

1. Review production test report
2. Collect experiment rows before weight changes

완료된 활성 계획 항목:

- 응답 품질 체크 1차 구현 — `responseQuality`/`responseTiming` 생성, premium model 전달, experiment payload 전달, Supabase row JSON 보존.
- Confidence 설명 카드 + 상담 확인 질문 — `confidenceExplanation` 생성, 결과지 `report-confidence` 섹션 렌더, experiment payload/row JSON 보존.
- c1~c9/deep 자동반응 리라이팅 audit — `diagnostic_test_question_bank_full.md`에 리라이팅 후보 표를 추가하고, `tests/question-copy-regression.test.mjs`로 퇴보 표현을 회귀 검증한다. Production 문항/weight는 아직 변경하지 않았다.
- 상황형 타이브레이커 audit/extension — 1↔6, 4↔7, 5↔9 전용 라우팅 회귀 테스트를 추가하고, 2↔9 전용 상황형 타이브레이커(`tb29`/`t29`)를 운영 코드와 질문 뱅크에 추가했다.
- Experiment 데이터 수집 upgrade — `result_summary.experiment_payload`에 result, rankedTop3, topPair, responseQuality, scoringAxes, tieBreakersUsed, stateStressAdjustment, phase4Result, timings를 구조화해 보존한다. 피드백 UI에는 결과에서 맞았던 부분, 틀렸던 부분, 상담에서 꼭 확인해야 할 것을 추가했다.
- Weight recalibration workflow — `scripts/analyze_diagnostic_experiments.mjs`로 predicted/confirmed core·subtype confusion, low-confidence accuracy, quality-flag accuracy, tie-pair miss rate, countertype miss rate를 산출한다. `WEIGHT_CALIBRATION_WORKFLOW.md`에 100 usable rows / affected pair 20 rows / replay 검증 gate를 명시했다.
- Countertype performance audit — `COUNTERTYPE_PERFORMANCE_AUDIT.md`에 기존 9개 countertype 필터, 후보 유형 기반 trigger, core/instinct 분리 scoring, 확장 금지 조건을 정리했다. `tests/countertype-routing.test.mjs`가 9개 필터와 routing/scoring/log를 회귀 검증한다.
- 결과지 business/application layer 강화 — `report-application` 섹션에 나의 필요, 나의 욕구, 강점, 방어/약점, 내가 힘들 때 필요한 도움, 가족·동료·리더가 나를 도울 방법 6개 축을 추가했다. 상담/스쿨 hook은 하드 세일즈가 아니라 실제 적용 필요에서 자연스럽게 이어지도록 유지했다.

## 자동화 종료 상태

- **Phase 1 + 2 + 3 + 4 + 5 + 6 자동화 산출물은 완료 기록으로 보존.**
- `current_phase = 7`, `paused = true` → 자동 wakeup은 진행하지 않는다.
- `paused = true` → 추가 안전 장치 (혹시 phase 체크 우회해도 정지).
- 스케줄 task `er-enneagram-auto-resume` 은 비활성 상태로 남음 — 사용자가 `mcp__scheduled-tasks__delete_scheduled_task` 로 수동 삭제하거나 보존 가능.
- `PHASE_PLAN.md`, `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, `PHASE_4_PLAN.md`, `PHASE_5_PLAN.md`, `PHASE_6_PLAN.md`는 `archived_do_not_execute` 상태다.

## 과거 Phase 산출물 요약

### Phase 1 (KB Foundation)
- 5 _meta 파일 (CONTEXT, WORK_STATUS, PHASE_PLAN, HANDOFF, HISTORY) + verify.mjs
- 진입점 — AGENTS.md, .cursor/rules, CLAUDE.md 패치
- KB 4 신규 (centers_and_triads, type_wings, instinct_stacks, korean_test_copy_guide) + 3 갱신

### Phase 2 (27 Subtypes Depth)
- subtypes_27.md 829줄, 27 subtype × 7 슬롯 + 9 type stress/growth arrows + wings

### Phase 3 (Scoring Accuracy)
- js/test-scoring.js 147줄 (8 함수)
- tests/test-scoring.test.mjs 213줄 (26 unit test)
- 결과지 형식 `7 w8(50%) sx(80%) so(60%) sp(10%)` 산출 가능
- 주의: 현재 운영 `test.html`은 `js/test-scoring.js`를 로드하지 않는다. 운영 결과는 `js/test.js` 내부 로직 기준이다.

### Phase 4 (Codebase Cleanup)
- js/test-shared.js 44줄 (arrowLines + INSTINCT_LABELS + TYPE_NAMES)
- test.js + app-adaptive-data.js 단일 소스 참조
- 주의: 현재 `js/test.js`는 inline `arrowLines`를 유지하고 있고, `test.html`은 `js/test-shared.js`를 로드하지 않는다.

### Phase 5 (Result Output Format)
- js/subtypes-27-data.js 518줄 (27 subtype × 7 슬롯 데이터)
- js/test-result-renderer.js 174줄 (lookup + 9 카드 HTML)
- test.html `#res-subtype-cards` 컨테이너 + share text 보강
- 주의: 현재 premium 결과지는 `js/test-result-renderer.js`가 아니라 `js/test.js` 내부 renderer 중심으로 동작한다.

## 검증

### 2026-06-21 수동 개선 배치 완료 후

```
node --check js/test.js
OK

node --check js/diagnostic-experiment.js
OK

node --test tests/confidence-card.test.mjs tests/response-quality.test.mjs tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs tests/question-copy-regression.test.mjs tests/tie-breaker-routing.test.mjs tests/experiment-payload.test.mjs tests/weight-calibration-workflow.test.mjs tests/countertype-routing.test.mjs
79/79 tests pass
```

### 2026-06-21 Confidence 설명 카드 구현 후

```
node --check js/test.js
OK

node --check js/diagnostic-experiment.js
OK

node --test tests/confidence-card.test.mjs tests/response-quality.test.mjs tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs
70/70 tests pass
```

### 2026-06-21 응답 품질 체크 1차 구현 후

```
node --check js/test.js
OK

node --check js/diagnostic-experiment.js
OK

node --test tests/response-quality.test.mjs tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs
66/66 tests pass
```

### 2026-06-20 문서/운영 코드 동기화 후

```
node --check js/test.js
OK

node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs
54/54 tests pass
```

### 2026-06-20 정확도 개선 후

```
node --check js/test.js
OK

node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs
57/57 tests pass
```

브라우저 렌더 확인은 in-app Browser 보안 정책이 `file://` 로컬 페이지 접근을 차단해 중단했다. 우회 접근은 사용하지 않았다.

### 2026-06-20 상황형 문항/6번 보정 개선 후

```
node --check js/test.js
OK

node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-support-materials.test.mjs tests/report-support-wiring.test.mjs tests/phase4-options-render.test.mjs
63/63 tests pass
```

in-app Browser에서 현재 열린 `file://.../test.html` 탭은 확인됐으나, Browser Use 보안 정책이 로컬 file URL claim을 차단해 렌더 검증은 중단했다. 정책 우회는 사용하지 않았다.

### 과거 자동화 최종 기록

```
node docs/_meta/enneagram/verify.mjs all
OK: task all verified (29 files)

node --test tests/test-scoring.test.mjs
26/26 tests pass
```

## 결과지 예시 출력

```
res-final          : 7 w8(50%) sp(83%) sx(67%) so(33%)
res-instincts      : 27 subtype: sp_7 (countertype 아님)
res-wing-pct       : 50% (w8)
res-instinct-pct   : sp(83%) sx(67%) so(33%)
res-subtype-27     : sp_7
res-subtype-cards  : (9 카드 — 핵심 집착, 행동 시그니처, 방어/그림자, sister-diff,
                     confused-with, wing 강도, 본능 stack, 한국어 결과 카피)
```

## 재시작 protocol (필요 시)

- 추가 작업이 필요하면 `current_phase` 를 6 → 새 값 (예: 5 또는 7) 으로 되돌리고 `paused: false`.
- 또는 신규 phase plan 을 작성하고 `current_task` 설정.

## 사용자 액션 (선택)

- main 브랜치 머지 — `git checkout main && git merge claude/musing-taussig-e181fd` (또는 PR 생성).
- 스케줄 task 정리 — `mcp__scheduled-tasks__delete_scheduled_task er-enneagram-auto-resume`.
- 결과지 수동 확인 — `test.html` 직접 열기.
