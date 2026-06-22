<!-- 현재 운영 코드를 기준으로 오래된 문서/모듈의 적용 가능성을 분류하는 guardrail -->
---
kb_id: enneagram_test_meta.code_gap_audit
title: "Code Gap Guardrail — archive vs active evolution"
created_at: "2026-06-20"
last_updated: "2026-06-20"
active_plan: ACTIVE_EVOLUTION_PLAN.md
retrieval_tags:
  - code_gap
  - docs_vs_code
  - guardrail
  - active_evolution
  - operational_path
---

# Code Gap Guardrail

기준 운영 경로: `test.html` -> `js/test.js`.

이 문서는 "문서에 있었으니 코드에 넣자"를 막기 위한 필터다. 현재 코드를 발전시키는 항목은 [ACTIVE_EVOLUTION_PLAN.md](./ACTIVE_EVOLUTION_PLAN.md)로 이동했고, 현재 품질을 퇴보시킬 수 있는 과거 항목은 아래처럼 격리한다.

## 1. 현재 운영 baseline

- 1단계 고정 문항: 39개
- 센터 문항: `center_auto_1`~`center_auto_3`, `center_situation_1`~`center_situation_3`
- 본능 문항: 리커트 9개 + `instinct_attention_1`
- 6번 상태성 불안 보정: `appendStateAnxietyTieBreakersForType6`, `applyStateStressAdjustment`
- 4단계: 하위유형 행동문항 3개 + 날개 행동문항 3개, 다수결 판정
- 결과지: `js/test.js` premium renderer + `js/diagnostic-report-content.js` + `js/report-support-materials.js` + `css/test.css`
- 실험 모드: `js/diagnostic-experiment.js`, Supabase `diagnostic_experiment_sessions`

## 2. 적용 금지 — 그대로 넣으면 퇴보 위험

| 항목 | 이유 | 허용되는 사용 방식 |
|---|---|---|
| `PHASE_PLAN.md`, `PHASE_2_PLAN.md`, `PHASE_3_PLAN.md`, `PHASE_4_PLAN.md`, `PHASE_5_PLAN.md`, `PHASE_6_PLAN.md` 실행 | 과거 자동화 기록이며 현재 운영 코드보다 오래됨 | 역사/맥락 확인만. 새 작업은 `ACTIVE_EVOLUTION_PLAN.md` 기준 |
| `js/test-result-renderer.js`를 운영 결과지에 그대로 재연결 | 현재 premium v2 결과지보다 오래된 카드형 renderer라 결과지 품질 후퇴 가능 | 필요한 카피/함수 아이디어만 현재 `renderPremiumReport()`에 선별 흡수 |
| `js/test-charts.js`를 그대로 붙이기 | old 15-section/Chart.js 구조가 현재 mockup/premium v2 방향과 충돌 가능 | 현재 CSS/page template에 맞춰 새로 디자인한 차트만 선별 사용 |
| `js/subtypes-27-data.js`를 결과 본문 primary source로 사용 | 현재 ANARA/ER premium copy보다 오래된 KB 스타일이며 톤 저하 가능 | subtype 원자료/reference로만 사용 |
| `js/test-scoring.js`로 현재 `js/test.js` scoring 대체 | 최신 39문항, 6번 보정, Phase 4 다문항 판정, premium model 흐름이 빠질 수 있음 | 순수 함수 참고/테스트 fixture로만 사용 |
| `js/app-adaptive*.js` legacy direct route 재활성화 | 최신 문항/결과지와 발산된 구형 경로 | 제거 또는 완전 동기화 전까지 새 기능 투입 금지 |
| Countertype 9개를 즉시 추가 | 기존 countertype 문항이 이미 존재하며, 문항 피로만 늘릴 수 있음 | 실험 데이터로 miss pattern 확인 후 trigger/wording/weight부터 조정 |

## 3. 선별 적용 가능 — 낮은 위험

| 항목 | 조건 |
|---|---|
| `test-shared.js`의 `arrowLines` 단일화 | 결과/점수 변화 없이 상수 중복만 제거할 때 |
| `subtypes_27.md` 내용 일부 인용 없는 요약 | 현재 premium copy 톤으로 재작성할 때 |
| 기존 chart 아이디어 | mockup 기반 result page section에 맞춰 새 CSS/HTML로 재구성할 때 |
| `test-scoring.js` 계산식 비교 | 현재 `js/test.js` 결과와 회귀 비교용으로만 쓸 때 |

## 4. 현재 발전 backlog

활성 우선순위는 `ACTIVE_EVOLUTION_PLAN.md`가 관리한다.

1. 응답 품질 체크
2. Confidence 설명 카드
3. 상담 시 확인 질문 자동 생성
4. c1~c9/deep 자동반응 리라이팅 audit
5. 상황형 타이브레이커 audit/extension
6. Experiment 데이터 수집 upgrade
7. Weight recalibration workflow
8. Countertype performance audit
9. 결과지 business/application layer 강화

## 5. 이미 반영된 개선

- 센터 문항은 10개에서 6개로 축소됐다. 문항 간 상관성이 높은 상황 문항을 줄이고, 후반 3개를 `center_situation_1`~`center_situation_3` 상황형으로 분리했다.
- 2번/3번/4번/8번 일부 core 문항은 행동 회상형 또는 자동반응형으로 강화됐다.
- 본능 판별에는 attention-bias 상황형 문항 `instinct_attention_1`이 추가됐다.
- 6번은 최근 2주 상태 문항이 높고 1/5/9와 근접할 때 상태성 불안 과대판정을 보정한다.
- 운영 결과 모델은 `centerScore`, `harmonicScore`, `hornevianScore`, `coreTypeScore`, `instinctScore`, `stateStressAdjustment`를 분리해 보관한다.
- 4단계 하위유형/날개는 단일 문항이 아니라 각 3문항 다수결로 판정한다.
- SO7/SO8/SO9 계열 문항은 미덕 언어보다 관찰 가능한 행동 언어로 이동했다.
- 결과지에는 유형별 적용 가이드, 상담/스쿨 hook, 보조자료 추천 workflow가 들어갔다.
