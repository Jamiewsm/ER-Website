<!-- Phase 4 (코드베이스 정리) plan placeholder. Phase 3 종료 후 Phase 4 시작 시 채움 -->
---
kb_id: enneagram_test_meta.phase_4_plan
title: "Phase 4 Implementation Plan — Codebase Cleanup"
phase: 4
created_at: "2026-05-07"
status: placeholder
retrieval_tags:
  - phase_4
  - placeholder
  - codebase_cleanup
  - test_consolidation
  - duplication_removal
---

# Phase 4 Implementation Plan — Codebase Cleanup

이 plan 은 Phase 4 시작 시 작성됩니다. `js/test.js` (969 줄, 단독 페이지) 와 `js/app-adaptive.js` (616 줄, iframe 임베드) 의 중복 로직을 단일 모듈로 통합합니다.

## 작성 시점

`WORK_STATUS.current_phase = 4, current_task = "4.0"` 으로 전환 후. cold-start AI 가 본 placeholder 를 보면 `superpowers:writing-plans` skill 호출 후 cleanup task 분해된 plan 으로 본 파일을 덮어씀.

## 작성 가이드

### 작업 분해 권장 (6-8 task)

1. **Task 4.0** — 본 plan 작성 (writing-plans skill).
2. **Task 4.1** — `js/test.js` 와 `js/app-adaptive.js` 의 diff 분석 + 중복/차이 보고서 (`docs/_meta/enneagram/test_dup_audit.md`).
3. **Task 4.2** — 공통 로직 추출 → `js/test-engine.js` 신규 (questions, scoring, rendering 함수).
4. **Task 4.3** — `js/test.js` (test.html 진입점) 가 test-engine.js 사용하도록 축소.
5. **Task 4.4** — `js/app-adaptive.js` + `js/app-adaptive-data.js` (iframe 임베드 진입점) 도 test-engine.js 사용.
6. **Task 4.5** — Phase 3 의 `js/test-scoring.js` 와 `js/test-engine.js` 통합 또는 import 관계 정리.
7. **Task 4.6** — Regression 테스트 (수동 + Phase 3 unit test 가 여전히 통과).
8. **Task 4.7** — Phase 4 종료 검증 + Phase 5 인계 (PHASE_5_PLAN.md placeholder).

### 입력

- 현재 `js/test.js` (969 줄)
- 현재 `js/app-adaptive.js` (616 줄)
- 현재 `js/app-adaptive-data.js` (211 줄)
- Phase 3 의 `js/test-scoring.js` (147 줄)
- `tests/test-scoring.test.mjs` (213 줄)

### 산출물

- `js/test-engine.js` 신규 (questions + state + scoring + rendering 통합).
- `js/test.js` 축소 (단독 페이지 wrapper, 100 줄 이하 목표).
- `js/app-adaptive.js` 축소 (iframe wrapper, 100 줄 이하 목표).
- `tests/test-engine.test.mjs` (있다면 통합 또는 분리).

### Phase 4 종료 조건

- `js/test.js` ↔ `js/app-adaptive.js` 중복 0.
- 두 진입점 (test.html, iframe 임베드) 모두 동일 결과.
- Phase 3 unit test 통과 유지.
- 수동 regression (test.html 직접 + iframe) OK.
- WORK_STATUS.current_phase = 5 로 전환.

## Phase 5 미리보기

결과지 디자인 + 27 subtype 콘텐츠 통합. `subtypes_27.md` 의 슬롯 콘텐츠를 결과지에 lookup 하여 표시. PDF/공유 형식 정리.
