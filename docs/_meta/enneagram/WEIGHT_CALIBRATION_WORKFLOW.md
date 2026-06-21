# ER Test Weight Calibration Workflow

이 문서는 ER 에니어그램 테스트의 문항 weight를 실험 데이터 기반으로 조정하기 위한 운영 기준이다. 현재 기준에서는 직관만으로 production weight를 바꾸지 않는다.

## 1. Input

Supabase `diagnostic_experiment_sessions` row를 JSON array로 export한다. 분석 스크립트는 다음 구조를 우선 사용한다.

- `result_summary.experiment_payload.result`
- `result_summary.experiment_payload.rankedTop3`
- `result_summary.experiment_payload.topPair`
- `result_summary.experiment_payload.responseQuality`
- `result_summary.experiment_payload.tieBreakersUsed`
- `result_summary.feedback_detail.confirmed_type`
- fallback: `self_reported_core`, `self_reported_subtype`, `self_reported_wing`

## 2. Analysis Command

```bash
node scripts/analyze_diagnostic_experiments.mjs --fixture tests/fixtures/diagnostic-experiments.sample.json
```

실제 export 파일을 분석할 때:

```bash
node scripts/analyze_diagnostic_experiments.mjs --input path/to/diagnostic-experiment-export.json
```

## 3. Required Outputs

분석 리포트는 다음 항목을 출력한다.

- `predicted_core -> confirmed_core count`
- `predicted_subtype -> confirmed_subtype count`
- `low_confidence accuracy`
- `quality_flag accuracy`
- `tie_pair miss rate`
- `countertype miss rate`

이 출력은 어떤 혼동쌍이 반복적으로 틀리는지, 낮은 신뢰도/응답 품질 flag가 실제 정확도와 연결되는지, countertype 문항이 성능을 내는지를 확인하기 위한 최소 지표다.

## 4. Weight Change Gate

Production weight 변경은 아래 조건을 모두 만족할 때만 진행한다.

- usable experiment row 100개 이상
- affected confusion pair row 20개 이상
- 상담자 확정 core/subtype이 있는 row 우선
- before/after replay에서 target miss는 감소하고 adjacent regression은 증가하지 않음
- 문항 copy 문제인지, routing 문제인지, weight 문제인지 먼저 분리

예외: 상담자가 확인한 명백한 문항 오해가 반복될 경우, weight보다 copy/routing 수정으로 먼저 처리한다.

## 5. Decision Order

1. 데이터 품질 확인: `responseQuality.level`, too-fast, straight-lining, unknown overuse
2. 혼동쌍 확인: `topPair`별 miss rate
3. 하위유형 확인: predicted subtype vs confirmed subtype
4. countertype 확인: countertype miss rate
5. 문항 원인 분류: wording, trigger/routing, weight, fatigue
6. replay fixture 작성
7. weight patch 작성
8. 전체 회귀 테스트와 상담자 review 후 배포

## 6. Current Status

2026-06-21 기준:

- `result_summary.experiment_payload` 저장 구조가 운영 코드에 추가됨
- `scripts/analyze_diagnostic_experiments.mjs` 추가됨
- `tests/fixtures/diagnostic-experiments.sample.json` fixture 추가됨
- `tests/weight-calibration-workflow.test.mjs`로 최소 출력 회귀 검증
- 아직 실제 row 100개 기준 calibration은 수행하지 않음
