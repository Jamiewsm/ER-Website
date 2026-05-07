<!-- Phase 3 (스코어링 정확도) plan placeholder. Phase 2 종료 후 Phase 3 시작 시 채움 -->
---
kb_id: enneagram_test_meta.phase_3_plan
title: "Phase 3 Implementation Plan — Scoring Accuracy"
phase: 3
created_at: "2026-05-07"
status: placeholder
retrieval_tags:
  - phase_3
  - placeholder
  - scoring_accuracy
  - wing_percentage
  - instinct_percentage
---

# Phase 3 Implementation Plan — Scoring Accuracy

이 plan 은 Phase 3 시작 시 작성됩니다. Phase 1 (KB foundation) + Phase 2 (27 subtypes 깊이) 위에서 `js/test.js` 의 스코어링 로직을 KB 와 정렬합니다.

## 작성 시점

`WORK_STATUS.current_phase = 3, current_task = "3.0"` 으로 전환 후. cold-start AI 가 본 placeholder 를 보면 `superpowers:writing-plans` skill 호출 후 스코어링 task 분해된 plan 으로 본 파일을 덮어씀.

## 작성 가이드

### 핵심 산출물 (결과지 형식)

```
7 w8(50%) sx(80%) so(60%) sp(10%)
```

- `7` = core type (1-9)
- `w8(50%)` = wing 8 활성도 50%
- `sx(80%) so(60%) sp(10%)` = 본능 stack, 각 본능 절대 강도 (서로 합 100% 아님)

### 작업 분해 권장 (7-9 task)

1. **Task 3.0** — 본 plan 작성 (writing-plans skill).
2. **Task 3.1** — 현재 `js/test.js` 의 스코어링 로직 점검 보고서 작성. 현재 가중치/타이브레이커/wing 활성화 조건의 강점 + 약점 정리.
3. **Task 3.2** — Wing % 산출식 정의 + 구현. `<core>w<wing>(<%>)` 형식 산출.
4. **Task 3.3** — Instinct % 산출식 정의 + 구현. `sp/sx/so` 각각 절대 강도 0-100 산출. blind instinct 식별.
5. **Task 3.4** — 가중치 재교정. Phase 1 KB 의 motivation 우선 원칙 + state vs trait 분리 강화.
6. **Task 3.5** — 27 subtype 결정 로직. core × dominant instinct → 27 subtype 매핑 + countertype 보정.
7. **Task 3.6** — Tie-breaker 활성화 조건 점검. 36 쌍 중 어느 pair 가 어떤 score 차이에서 활성화되는지.
8. **Task 3.7** — Unit test 작성. 알려진 케이스 5-10 개 (예 — Sexual 6 cases, Self-Pres 3 case, etc.).
9. **Task 3.8** — Phase 3 종료 검증 + Phase 4 인계.

### 입력 소스

- 현재 `js/test.js` (969 줄) — 기존 스코어링 로직.
- Phase 1 KB foundation — 모든 신규 파일.
- Phase 2 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) — 27 subtype 매핑 기준.
- [type_pair_disambiguation.md](../../knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md) — 36 쌍 + axis 컬럼.

### 산출물

- `js/test.js` 갱신 (스코어링 로직 재교정)
- 신규 helper 모듈 — `js/test-scoring.js` (wing %, instinct % 계산식 분리)
- Unit test 파일 — `tests/test-scoring.test.js` 또는 동등.
- 결과 산출 함수 — `computeResult(responses) → { core, wing: {type, pct}, instincts: {sp, sx, so}, subtype }`

### Phase 3 종료 조건

- 결과지 형식 `<core>w<wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)` 산출 가능.
- 27 subtype 매핑 정확.
- countertype 9 개에 대해 적절 보정 적용.
- Unit test 통과.
- WORK_STATUS.current_phase = 4 로 전환.

## Phase 4 미리보기

`js/test.js` ↔ `js/app-adaptive.js` 중복 해소. 단일 모듈로 통합.

## Phase 5 미리보기

결과지 디자인 + 27 subtype 콘텐츠 통합. PDF/공유 형식 정리.
