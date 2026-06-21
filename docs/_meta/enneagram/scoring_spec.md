<!-- Phase 3 스코어링 spec — 현재 audit + 신규 wing/instinct/27 subtype 공식 -->
---
kb_id: enneagram_test_meta.scoring_spec
title: "Scoring Specification — Wing %, Instinct %, 27 Subtype"
created_at: "2026-05-07"
last_updated: "2026-06-21"
retrieval_tags:
  - scoring_spec
  - wing_formula
  - instinct_formula
  - 27_subtype_mapping
  - countertype
  - audit
---

# Scoring Specification

본 문서는 Phase 3 의 신규 스코어링 공식 + `js/test.js` audit 입니다. 상세 코드는 [PHASE_3_PLAN.md](./PHASE_3_PLAN.md) §1 의 Conventions 섹션 참조.

2026-06-20 운영 코드 기준 주의: 현재 `test.html`은 `js/test-scoring.js`를 로드하지 않고, 운영 결과는 `js/test.js` 내부 로직으로 생성된다. 따라서 아래 Phase 3 helper 공식은 검증된 참고 공식이지만, 운영 경로와 완전히 연결된 상태는 아니다. 현재 gap은 [CODE_GAP_AUDIT.md](./CODE_GAP_AUDIT.md)를 기준으로 추적한다.

## 1. 현재 스코어링 Audit (`js/test.js`)

### 강점

- **Phase 1/2/3 단계적 후보 좁히기** — Phase 1 (트라이어드 + 코어 + 강제선택 + 본능) 으로 후보 3-5 type. Phase 2 deep + tie-breaker 로 좁힘. Phase 3 post-tie 로 최종.
- **6 페어 tie-breaker** — 36, 31, 71, 78, 18, 3sx + 7wing. `tbCustomMap` 으로 그 외 페어 fallback.
- **보정 (corrections)** — sxDamp/sxBoost (Type 3 sx countertype 시드), soPenalty (so 의존 페널티), stressType1Damp/stressType7Boost (state vs trait 분리 시드).
- **Confidence** — diff/top2Mass 기반 높음/보통/낮음.
- **Center triad 가중치** — `center_auto_1`~`center_auto_3`, `center_situation_1`~`center_situation_3` 강제선택 응답이 선택된 센터의 3 type 에 동일 가산. 센터 문항은 문항 간 상관성을 줄이기 위해 6개로 축소했고, 문항당 가중치는 `0.6`으로 낮게 유지한다.
- **Instinct attention-bias 가중치** — `instinct_attention_1`은 `sp/sx/so` 중 실제로 먼저 주의를 두는 대상을 고르는 상황형 문항이며 선택된 본능에 `3.0`을 가산한다. 기존 리커트 본능 문항 9개는 유지한다.
- **State stress adjustment** — `state_2w`, `state_defensive`, `state_unusual` 평균이 높고 6번이 1/5/9와 근접하면 6번 과대확정을 줄이기 위해 `appendStateAnxietyTieBreakersForType6`와 `applyStateStressAdjustment`를 적용한다.
- **내부 점수 축 분리** — 운영 결과 모델에 `buildScoringAxesSnapshot`이 `centerScore`, `harmonicScore`, `hornevianScore`, `coreTypeScore`, `instinctScore`, `stateStressAdjustment`를 분리해 보관한다.
- **Response quality snapshot** — `buildResponseQualitySnapshot`이 너무 빠른 응답, 직선 응답, `U` 과다, 센터-코어 불일치, 본능 불명확성을 판정한다. 이 값은 점수를 바꾸지 않고 결과 모델과 실험 데이터에 해석 품질 메타데이터로만 저장한다.
- **Confidence explanation** — `buildConfidenceExplanation`이 1-2위 격차, 본능 선명도, 응답 품질, 센터-코어 일치 여부, 타이브레이커 적용 여부를 자연어 근거와 상담 확인 질문으로 변환한다.
- **wingActivationRatio 0.85** — wing 활성화 임계.

### 약점 (Phase 3 가 보완)

1. **Wing 출력이 binary** — `wingActivationRatio: 0.85` 통과 시만 표시. % 없음. 결과지에 `7w8` or `7 (순수유형)` 만.
2. **Instinct 출력이 1순위만** — `제 1본능: 일대일(sx)` 텍스트 only. 3 본능 모두 % X.
3. **27 subtype 명시적 매핑 없음** — 결과지에 `sx_7` 같은 코드 없음. Phase 5 결과지 콘텐츠 (subtypes_27.md) 와 직접 연결 안 됨.
4. **Countertype 부분 보정만** — sxBoost (sx countertype 시드), soPenalty (so countertype 시드) 만 있고 sp countertype (Self-Pres 2/3/4) 보정 없음.
5. **Wing % 공식 없음** — wing 강도가 약/중/강 인지 결과에서 알 수 없음.

## 2. 신규 공식

상세 코드는 [PHASE_3_PLAN.md](./PHASE_3_PLAN.md) §1.1 (Conventions/Core Formulas).

### 2.0 운영 추가: Response Quality Snapshot

`buildResponseQualitySnapshot({ responses, timings, scoringAxes, ranked, instinctPct, confidence })`는 다음 구조를 반환한다.

```js
{
  level: "good" | "caution" | "low",
  flags: [
    { code: "too_fast_total", severity: "caution", label: "...", evidence: "..." }
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

현재 운영 기준:

- `too_fast_total`: 20문항 이상 응답했고 문항당 평균 시간이 4초 미만.
- `straight_lining`: 리커트 응답 중 같은 값 비율이 75% 이상.
- `unknown_overuse`: `U` 응답 비율이 25% 이상.
- `center_core_mismatch`: 최강 센터와 최종 코어 유형의 센터가 다르고 confidence가 높음이 아님.
- `instinct_unclear`: 1위 본능이 35% 미만이거나 1-2위 격차가 10점 미만.

응답 품질은 결과를 차단하거나 점수를 수정하지 않는다. 결과지/상담에서는 "해석 주의"와 확인 질문의 근거로 사용하고, 실험 row에는 `result_summary.response_quality`, `tie_break_log.response_timing`으로 보존한다.

### 2.0.1 운영 추가: Confidence Explanation

`buildConfidenceExplanation({ confidence, diff, core, second, instinctPct, responseQuality, tieState, stateStressAdjustment })`는 다음 구조를 반환한다.

```js
{
  label: "신뢰도: 보통",
  tone: "high" | "medium" | "low",
  summary: "...",
  requiresCare: false,
  pairLabel: "4↔7",
  reasons: ["4번과 7번 점수 차이가 4.0%로 근접합니다."],
  consultationQuestions: ["무거운 감정이 올라올 때 ..."]
}
```

초기 상담 확인 질문 맵은 `1↔6`, `2↔9`, `3↔6`, `3↔9`, `4↔7`, `5↔9`, `6↔8`, `7↔9`를 포함한다. 이 설명은 결과 점수를 수정하지 않고, 결과지의 `report-confidence` 섹션과 실험 row의 `result_summary.confidence_explanation`에 저장된다.

### 2.1 Wing % 공식

`computeWingPct(coreType, scores) → { wing: number|null, pct: 0-100 }`.

두 wing 간 상대 우세를 0-100 으로 표현. 0 = 균등, 100 = 한쪽만.

해석 가이드 ([type_wings.md](../../knowledge_base/enneagram/complete_enneagram/type_wings.md) 와 정렬).

| % | 의미 |
|---:|---|
| 0-20 | 거의 무 wing (균등) |
| 21-40 | 약 wing |
| 41-60 | 중 wing |
| 61-80 | 강 wing |
| 81-100 | 매우 강 (wing type 으로 오진단 위험) |

### 2.2 Instinct % 공식

`computeInstinctPct(responses, q1) → { sp, sx, so }` (각 0-100).

각 본능의 절대 강도. 응답된 문항만으로 정규화 (`U` 제외). 서로 합 100% 아님.

`max possible per question = 6`. `pct = round(sum / (count * 6) * 100)`.

### 2.3 27 Subtype + Countertype

`computeDominantInstinct(instinctPct) → 'sp' | 'sx' | 'so' | null` (tie 시 sx > sp > so).

`compute27Subtype(coreType, dominantInstinct) → 'sx_7' | etc | null`.

`isCountertype(coreType, dominantInstinct) → boolean`.

### 2.4 통합 출력 형식

```
<core> w<wing>(<%>) <inst1>(<%>) <inst2>(<%>) <inst3>(<%>)
```

예시.

- `7 w8(50%) sx(80%) so(60%) sp(10%)` — Sexual 7 with 8 wing
- `4 w5(67%) sp(92%) sx(45%) so(20%)` — Self-Pres 4 (countertype) with 5 wing
- `9 (순수) so(78%) sx(40%) sp(35%)` — Social 9 (countertype) without wing

% 는 응답된 문항 기준 normalize. 본능 strs 는 % desc 정렬.

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

countertype 9 개 — sx_1, sp_2, sp_3, sp_4, sx_5, sx_6, so_7, so_8, so_9.

## 4. 마이그레이션 전략과 현재 상태

- `js/test-scoring.js` 신규 — pure functions, 재사용/테스트 가능.
- 원래 전략은 `js/test.js` 의 `renderResultFromScores` 가 `computeResult` 를 호출하는 구조였다.
- 기존 single-instinct 텍스트 (`제 1본능: ...`) + binary wing 표시는 신규 % 형식과 병기 (Phase 5 에서 디자인 정리).
- 기존 sxBoost/soPenalty 보정은 일단 유지 (Phase 4 에서 정리 검토).
- Phase 4 가 `js/test.js` ↔ `js/app-adaptive.js` 중복 해소 시 test-scoring.js 가 단일 진입점.
- 현재 운영 상태: `test.html`은 `js/test-scoring.js`를 로드하지 않으므로, helper를 운영 단일 진입점으로 쓰려면 재연결 작업이 필요하다.

## 5. 검증 케이스 (Phase 3.7 unit test)

| # | 케이스 | core | wing scores | instincts | 기대 출력 |
|---:|---|---:|---|---|---|
| 1 | Pure 7w8 | 7 | left:0, right:50 | sp_high, sx_high, so_low | `7 w8(100%)` + sp/sx/so % |
| 2 | Balanced wing | 5 | left:30, right:30 | balanced | `5 (순수)` (pct=0, wing=4) |
| 3 | Moderate 7w8 (50%) | 7 | left:10, right:30 | balanced | `7 w8(50%)` |
| 4 | Wing edge type 1 (left=9) | 1 | left:10, right:30 | balanced | `1 w2(...)` |
| 5 | Wing edge type 9 (right=1) | 9 | left:30, right:10 | balanced | `9 w8(...)` |
| 6 | Both wings zero | 7 | left:0, right:0 | any | wing=null, pct=0 |
| 7 | All instincts max | - | - | sp:6,6,6 sx:3,3,3 so:1,1,1 | sp=100, sx=50, so=17 |
| 8 | All instincts U | - | - | all U | all 0 |
| 9 | Partial answered | - | - | sp only (5,5) | sp=83, sx=0, so=0 |
| 10 | Tie sp=sx | - | - | sp=50, sx=50, so=30 | dominant = sx |
| 11 | sx_7 subtype | 7 | - | sx 우세 | `sx_7`, countertype=false |
| 12 | so_7 countertype | 7 | - | so 우세 | `so_7`, countertype=true |
| 13 | Sexual 6 countertype | 6 | - | sx 우세 | `sx_6`, countertype=true |
| 14 | Full integration | 7 | left:10, right:30 | sp 우세 | `7 w8(50%) sp(...) sx(...) so(...)` |
| 15 | Pure type format | 5 | wing=null | mixed | `5 (순수) ...` |

## 6. 향후 Phase 5 통합

Phase 5 결과지에서 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) 의 해당 subtype 섹션을 `phase3Result.subtype` 으로 lookup 하여 깊이 콘텐츠 노출. countertype 플래그는 결과지 톤/주의 문구 (countertype 은 표면적으로 다른 type 처럼 보일 수 있음) 표시 트리거.
