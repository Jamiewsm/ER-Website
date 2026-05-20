<!-- Phase 6 — 진단테스트 시뮬레이션 보고서 (Phase 5 종료 후 사용자 요청) -->
---
kb_id: enneagram_test_meta.simulation_report
title: "Test Simulation Report — Bug Audit + Accuracy Check"
created_at: "2026-05-19"
last_updated: "2026-05-19"
retrieval_tags:
  - simulation
  - bug_audit
  - 27_subtype_accuracy
  - countertype_detection
  - edge_case
  - phase_6
---

# Test Simulation Report

[`tests/simulate.mjs`](../../../tests/simulate.mjs) 의 35 케이스 실행 결과.

## 요약

| 항목 | 결과 |
|---|---|
| 총 케이스 | 35 |
| Pass | 35 |
| Fail | 0 |
| SUBTYPES_27 entry count | 27 (expected) |
| Countertype count | 9 (expected: sx_1, sp_2/3/4, sx_5/6, so_7/8/9) |
| 슬롯 이슈 | 0 |
| signatures 길이 이슈 | 0 (모두 3개) |
| confusedWith 길이 이슈 | 0 (모두 20자 이상) |

## 검증된 케이스

### 9 countertype 모두 정확 감지

| Case | Result | Status |
|---|---|---|
| sx_1 Zeal | `1 w2(33%) sx(100%) so(33%) sp(17%)` | ✅ countertype=true |
| sp_2 Privilege | `2 w1(33%) sp(100%) sx(33%) so(33%)` | ✅ countertype=true |
| sp_3 Security | `3 w4(33%) sp(100%) so(50%) sx(33%)` | ✅ countertype=true |
| sp_4 Tenacity | `4 w3(33%) sp(100%) sx(50%) so(33%)` | ✅ countertype=true |
| sx_5 Confidence | `5 w4(0%) sx(100%) sp(33%) so(33%)` | ✅ countertype=true |
| sx_6 Strength/Beauty | `6 w7(33%) sx(100%) so(50%) sp(33%)` | ✅ countertype=true |
| so_7 Sacrifice | `7 w8(33%) so(100%) sp(50%) sx(33%)` | ✅ countertype=true |
| so_8 Solidarity | `8 w7(33%) so(100%) sx(50%) sp(33%)` | ✅ countertype=true |
| so_9 Participation | `9 w8(0%) so(100%) sp(33%) sx(33%)` | ✅ countertype=true |

### 18 일반 subtype 모두 정확

(sp_1, so_1, so_2, sx_2, so_3, sx_3, so_4, sx_4, sp_5, so_5, sp_6, so_6, sp_7, sx_7, sp_8, sx_8, sp_9, sx_9) — 모두 PASS.

### 8 엣지케이스 모두 정확

- All instincts U (응답 누락) → subtype=null, 0% 본능 표시.
- Balanced wings (동일 score) → wing pct=0 (균형).
- Single-direction wing (other=0) → wing pct=100.
- Tie sp/sx → sx 우선 (Chestnut sx countertype 빈도 가이드 반영).
- Tie sp/so → sp 우선.
- All instincts equal high → sx 우선.
- Wing edge type 1 (left=9, right=2) → 9 선택 정확.
- Wing edge type 9 (left=8, right=1) → 1 선택 정확.

## 결론 — 스코어링 정확도

**Phase 3-5 의 산출 함수 (computeWingPct / computeInstinctPct / compute27Subtype / isCountertype) 은 모든 알려진 27 subtype + 9 countertype + 주요 엣지케이스에 대해 정확.**

특히 진단에서 가장 어려운.

- **Sexual 6 (Strength/Beauty)** — 8번처럼 보임 → 정확히 sx_6 countertype 으로 식별
- **Self-Pres 3 (Security)** — 1번처럼 보임 → 정확히 sp_3 countertype 으로 식별
- **Self-Pres 4 (Tenacity)** — 1번/3번처럼 보임 → 정확히 sp_4 countertype 으로 식별
- **Social 7 (Sacrifice)** — 2번처럼 보임 → 정확히 so_7 countertype 으로 식별

## 발견된 개선 기회 (코드 버그 아님, 향후 보완)

### 1. 27 subtype 깊이 판별 보강 가능

현재 27 subtype 결정은 **9 본능 문항 (i_sp_1-3, i_sx_1-3, i_so_1-3) 의 합산** 만으로 함. 응답이 본능 간 비슷하면 결과 정확도가 떨어질 수 있음.

**보강 아이디어** — 같은 코어 안에서 sp/sx/so subtype 끼리의 감별 질문을 추가. 예시 — `tb_sp1_so1`, `tb_so1_sx1`, etc. 9 코어 × 3 본능 쌍 = 27 잠재 질문. 최소 9개 (countertype 9개 식별용) 만 추가해도 진단 강화 가능.

이는 Phase 1 [korean_test_copy_guide.md](../knowledge_base/enneagram/complete_enneagram/korean_test_copy_guide.md) 의 27 subtype 시드 단어 + Phase 2 [subtypes_27.md](../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) 의 sisterDifferences 기반으로 작성 가능.

### 2. Wing 강도 시각화 클리어

`wing(0%)` 출력 시 사용자는 "wing 없음" 인지 "균등" 인지 혼동 가능. 결과지에 명시적 문구 "두 wing 균등 — 순수 type 표현 우세" 추가가 좋음. 현재 `js/test-result-renderer.js` 에 이미 처리되어 있으나 강화 가능.

### 3. Confidence 시각화 미흡

현재 결과지에 `confidence-badge` (높음/보통/낮음) 만 표시. 사용자가 "왜 신뢰도 낮음" 인지 알 수 없음. 점수 차이, 일관성 지표 등 부가 정보 노출이 좋음.

### 4. 27 subtype lookup 의 빈 데이터 처리

`computeResult` 가 dominant instinct null 이면 subtype null. 결과지에서 "본능 응답 부족 — 진단 보류" 안내 카드가 명확하게 노출되어야 함. 현재 `js/test-result-renderer.js` 가 처리하지만 메시지 강화 가능.

## 결론

- **버그 없음** — 35/35 시뮬레이션 PASS, 데이터 무결성 perfect.
- **27 subtype + 9 countertype 정확 식별** — 가장 어려운 진단 (Sexual 6, Self-Pres 3/4, Social 7 등) 도 통과.
- **개선 기회 4개** — 코드 버그 아님, Phase 6 또는 추가 phase 에서 점진 개선 가능.

다음 단계 — 결과지 비주얼 업그레이드 ($100 가치, Birkman Signature Report 디자인 참조).
