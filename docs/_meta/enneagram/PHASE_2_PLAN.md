<!-- Phase 2 (27 subtypes 깊이 콘텐츠) plan placeholder. Phase 1 종료 후 Phase 2 시작 시 채움 -->
---
kb_id: enneagram_test_meta.phase_2_plan
title: "Phase 2 Implementation Plan — 27 Subtypes Depth"
phase: 2
created_at: "2026-05-06"
status: placeholder
retrieval_tags:
  - phase_2
  - placeholder
  - 27_subtypes_depth
---

# Phase 2 Implementation Plan — 27 Subtypes Depth

이 plan 은 Phase 2 시작 시 작성됩니다. Phase 1 의 KB foundation 위에서 27 subtype 별 결과지용 깊이 콘텐츠를 만듭니다.

## 작성 시점

Phase 1 의 모든 task (1.0-1.8) 이 완료되고 `WORK_STATUS.current_phase = 2` 로 전환된 후. cold-start AI 가 본 placeholder 를 보면 `superpowers:writing-plans` skill 로 새 Phase 2 plan 작성 후 본 파일을 덮어쓴다.

## 작성 가이드

- **Task 분해 옵션** — 27 subtype 각각이 1 task = 27 task. 또는 9 type 단위 묶음으로 9 task. 또는 3 instinct 단위로 3 task. 권장 — 9 task (type 단위 묶음, 한 task 에 같은 코어의 3 subtype).
- **각 subtype 의 7 슬롯** — (a) 핵심 집착 (b) 방어 패턴 (c) 행동 시그니처 3개 (d) 그림자/맹점 (e) 같은 코어의 다른 두 subtype 과의 차이 (f) 자주 헷갈리는 다른 코어 type (g) 한국어 결과지 카피 (시드 + 1단락).
- **참조 파일** — KB foundation (Phase 1) 의 모든 신규 파일.
  - [type_wings.md](../../knowledge_base/enneagram/complete_enneagram/type_wings.md) — wing 변형
  - [instinct_stacks.md](../../knowledge_base/enneagram/complete_enneagram/instinct_stacks.md) — stack + blind 패턴
  - [centers_and_triads.md](../../knowledge_base/enneagram/complete_enneagram/centers_and_triads.md) — 1차 필터
  - [korean_test_copy_guide.md](../../knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md) — 27 subtype 한국어 시드
  - [type_pair_disambiguation.md](../../knowledge_base/enneagram/complete_enneagram/type_pair_disambiguation.md) — 36 쌍 감별
  - [complete_enneagram_kb.md](../../knowledge_base/enneagram/complete_enneagram/complete_enneagram_kb.md) — passion/defense/virtue + 27 subtype index + countertype 플래그
- **산출물 형식** — 단일 파일 `subtypes_27.md` (모든 27 subtype) 또는 폴더 `subtypes_27/` (subtype 당 1 파일). 권장 — 단일 파일 (검색/링크 용이, 토큰 효율).
- **분량** — 각 subtype 50-80 줄 × 27 = 1350-2160 줄. 단일 파일이면 큰 파일 → 다음 phase 가 직접 사용하므로 OK.
- **countertype 9 개 (Sexual 1, Self-Pres 2, Self-Pres 3, Self-Pres 4, Sexual 5, Sexual 6, Social 7, Social 8, Social 9)** 는 자주 헷갈림 슬롯에 다른 코어 type 도 명시.
- **저작권 + 토큰 정책** — Phase 1 과 동일 — PDF 직접 인용 0회, 페이지 참조만.

## Phase 2 종료 조건

- 27 subtype 모두 7 슬롯 채워짐
- verify.mjs 가 신규 task 들 통과
- WORK_STATUS.current_phase = 3 으로 전환

## 다음 — Phase 3 미리보기

스코어링 정확도. wing % 산출식, instinct % 산출식, 가중치 재교정. `js/test.js` 의 현재 로직을 KB 와 정렬.
