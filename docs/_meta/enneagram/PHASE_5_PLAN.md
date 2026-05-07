<!-- Phase 5 (결과 출력 포맷) plan placeholder -->
---
kb_id: enneagram_test_meta.phase_5_plan
title: "Phase 5 Implementation Plan — Result Output Format"
phase: 5
created_at: "2026-05-07"
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

## 작성 시점

`WORK_STATUS.current_phase = 5, current_task = "5.0"` 으로 전환 후. cold-start AI 가 본 placeholder 를 보면 `superpowers:writing-plans` skill 호출 후 결과지 task 분해된 plan 으로 본 파일을 덮어씀.

## 작성 가이드

### 작업 분해 권장 (8-10 task)

1. **Task 5.0** — 본 plan 작성 (writing-plans skill).
2. **Task 5.1** — `subtypes_27.md` 의 27 subtype 콘텐츠를 JS-가능한 데이터 구조로 변환 (`js/subtypes-27-data.js` 신규). 27 subtype × 7 슬롯 (핵심 집착, 방어 패턴, 행동 시그니처 3, 그림자/맹점, sister-subtype 차이, 헷갈리는 코어, 한국어 카피).
3. **Task 5.2** — `js/test-result-renderer.js` 신규 — `phase3Result.subtype` 으로 subtype 콘텐츠 lookup + 결과지 카드 HTML 생성.
4. **Task 5.3** — 결과지 카드 추가 — Subtype Profile (핵심 집착 + 방어 + 행동 시그니처).
5. **Task 5.4** — countertype 결과 시 주의 문구 카드 추가 ("표면적으로 다른 type 처럼 보일 수 있음" + sister-subtype 와 차이 문구).
6. **Task 5.5** — wing/instinct % 시각화 (progress bar 또는 % 라벨 강화).
7. **Task 5.6** — 결과지에 한국어 카피 (subtype 별 1단락) 표시.
8. **Task 5.7** — PDF 형식 갱신 (신규 카드 포함, html2canvas 캡처 영역 조정).
9. **Task 5.8** — 공유 텍스트 갱신 (신규 형식 `7 w8(50%) sx(80%) so(60%) sp(10%)` + subtype 이름).
10. **Task 5.9** — 결과지 디자인 다듬기 ([DESIGN.md](../../../DESIGN.md) 와 정렬).
11. **Task 5.10** — Phase 5 종료 검증 + 프로젝트 종료 (current_phase = 6).

### 입력

- Phase 1-4 의 모든 KB + 코드 산출물.
- Phase 1 [DESIGN.md](../../../DESIGN.md) (브랜드 디자인 가이드).
- Phase 2 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) — 결과지 콘텐츠 소스.
- Phase 3 `js/test-scoring.js` — wing/instinct/27 subtype 산출.
- Phase 4 `js/test-shared.js` — 공유 상수.

### Phase 5 종료 조건

- 결과지에 `<core>w<wing>(<%>) <inst1>(<%>) ...` 형식 표시 (이미 Phase 3 에서 산출 가능).
- 27 subtype 깊이 콘텐츠 (7 슬롯) 가 결과지에 노출.
- countertype 안내 문구 표시.
- PDF/공유 모두 신규 형식.
- DESIGN.md 톤 (warm, professional, trustworthy) 과 정렬.
- 프로젝트 종료 — `WORK_STATUS.current_phase = 6` 으로 전환.
- 스케줄 task `er-enneagram-auto-resume` self-delete 또는 수동 삭제.

## 프로젝트 종료 후

5 phase 완료 시점에서 ER 에니어그램 테스트는.

- KB foundation (8 파일, 1500+ 줄)
- 27 subtypes depth (829 줄)
- 정확한 스코어링 (147 줄 + 26 unit test)
- 깔끔한 코드베이스 (단일 소스 arrowLines)
- 깊이 있는 결과지 (subtype 별 7 슬롯 콘텐츠 + wing/instinct % 시각화)

학계 최고 수준의 유료 에니어그램 진단 테스트 + 결과지 완성.
