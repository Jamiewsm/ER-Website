<!-- test.js vs app-adaptive*.js 중복 audit + 텍스트 발산 매핑 -->
---
kb_id: enneagram_test_meta.test_dup_audit
title: "Test Code Duplication Audit — test.js vs app-adaptive"
created_at: "2026-05-07"
last_updated: "2026-05-07"
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

- 사용자가 직접 `test.html` 방문 또는 메인 사이트의 진단 섹션이 iframe 로 임베드.
- `js/test.js` (1008줄) 의 `q1`, `deep`, `tb*`, `postTieBreakerMap`, `arrowLines`, `TEST_CONFIG` 모두 self-contained.
- Phase 3 의 `js/test-scoring.js` (147줄) 가 결과 산출에 사용됨.
- iframe 로딩 helper — `js/sections/test-embed.js` (136줄, `mountAdaptiveTestIframe`).

### 메인 SPA (legacy) → js/app-adaptive.js + js/app-adaptive-data.js

- 메인 SPA 앱 (`index.html`) 안에서 직접 진단 (iframe 없이) 실행하는 구버전 코드.
- 현재 메인 진입은 iframe 방식이므로 `app-adaptive.js` 는 사실상 미사용 (또는 legacy fallback).
- 데이터 (질문, deep, tb_*) 가 `js/test.js` 와 별도 정의 → 중복.

### Sizes summary

```
1008 js/test.js
 616 js/app-adaptive.js
 211 js/app-adaptive-data.js
 136 js/sections/test-embed.js
 147 js/test-scoring.js (Phase 3)
```

## 2. 중복 데이터 매핑

| `js/test.js` 상수 | `js/app-adaptive-data.js` 상수 | 일치 여부 |
|---|---|---|
| `arrowLines` (line 68) | `adaptiveArrowLines` (line 13) | **동일** (안전 통합 대상) |
| `q1` (line 145) | `adaptivePhase1Questions` (line 25) | 텍스트 미세 차이 (§3) |
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
| 본능 한국어 라벨 (sp/sx/so) | `js/test-shared.js` |
| Type 한국어 이름 (1-9) | `js/test-shared.js` |

추가로 — Phase 3 의 `js/test-scoring.js` 의 `COUNTERTYPES` 는 이미 단일 소스. 두 entry point 가 사용 가능 (window.TestScoring.COUNTERTYPES).

## 5. Phase 5 에서 끊을 결합점

Phase 5 는 결과지에 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) 콘텐츠를 lookup. 그 시점부터 질문 텍스트 (test.js / app-adaptive) 와 결과지 콘텐츠가 분리 — 질문 텍스트의 발산이 결과지 품질에 영향 0. 그 이후 (Phase 6 가 있다면) 질문 텍스트 통합도 안전.

## 6. 작업 권장 (Phase 4)

- 4.2 — `js/test-shared.js` 신규 (arrowLines + INSTINCT_LABELS + TYPE_NAMES).
- 4.3 — `test.js` 의 `arrowLines` 를 `TestShared.arrowLines` 참조 + fallback inline 으로 교체.
- 4.4 — `app-adaptive-data.js` 의 `adaptiveArrowLines` 를 `TestShared.arrowLines` 참조 + fallback inline 으로 교체.
- (질문 텍스트 통합은 Phase 5 후 별도 작업으로 보류.)

## 7. Limitations

- `js/app-adaptive.js` 의 logic (`renderAdaptiveQuestions`, `validateAdaptiveForm`, `initAdaptiveTest`, `submitPhase1`, `submitPhase2`) 도 `js/test.js` 와 중복이지만 메인 SPA 가 iframe 방식을 사용 중이라 실질적으로 unused. 적극 정리 시 제거 검토. **Phase 4 에서는 손대지 않음** — risk 회피.
- 질문 텍스트 통합은 진단 결과의 미묘한 변화 risk 가 있어 Phase 5 에서 결과지 lookup 으로 결합 끊은 후 안전한 시점에 별도 진행.

## 8. Phase 4 산출 후 기대 상태

- `arrowLines` 두 곳 정의 → 단일 소스 (`js/test-shared.js`).
- 두 entry point 가 동일 화살표 매핑 보장.
- regression — Phase 3 unit test 26/26 통과 유지.
- Phase 5 가 자유롭게 결과지 lookup 추가 가능 (질문 텍스트 발산 영향 0).
