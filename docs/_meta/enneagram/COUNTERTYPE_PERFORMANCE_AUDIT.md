# Countertype Performance Audit

2026-06-21 기준 운영 코드(`test.html -> js/test.js`)의 countertype 처리 현황이다. 현재 결론은 **새 countertype 문항 9개를 추가하지 않는다**이다. 먼저 기존 9개 필터가 실제 데이터에서 성능을 내는지 확인한다.

## 1. Current Coverage

`counterTypeQuestions`는 9개 countertype을 모두 포함한다.

| Core | Countertype | Question ID | Instinct signal | 표면 오진 위험 |
|---:|---|---|---|---|
| 1 | `sx_1` | `ct_1_sx` | `sx` | 8번처럼 직접적/개혁적으로 보일 수 있음 |
| 2 | `sp_2` | `ct_2_sp` | `sp` | 어린아이/특권 욕구가 2번답지 않게 보일 수 있음 |
| 3 | `sp_3` | `ct_3_sp` | `sp` | 성실/좋은 사람 이미지로 1번처럼 보일 수 있음 |
| 4 | `sp_4` | `ct_4_sp` | `sp` | 고통을 드러내지 않아 1번/3번처럼 보일 수 있음 |
| 5 | `sx_5` | `ct_5_sx` | `sx` | 깊은 몰입 때문에 4번/연인형처럼 보일 수 있음 |
| 6 | `sx_6` | `ct_6_sx` | `sx` | 강하게 맞서 8번처럼 보일 수 있음 |
| 7 | `so_7` | `ct_7_so` | `so` | 희생/명분 언어 때문에 2번처럼 보일 수 있음 |
| 8 | `so_8` | `ct_8_so` | `so` | 보호/연대 언어 때문에 2번/6번처럼 보일 수 있음 |
| 9 | `so_9` | `ct_9_so` | `so` | 과잉 참여 때문에 2번/3번처럼 보일 수 있음 |

## 2. Trigger Condition

Phase 1 이후 후보군(`topTypes`)이 만들어지면:

1. 후보 유형의 deep 문항이 Phase 2에 추가된다.
2. 후보 유형에 해당하는 `counterTypeQuestions[type]`가 있으면 해당 countertype 필터 1문항이 추가된다.
3. 즉, countertype 문항은 전체 고정 노출이 아니라 후보 core에만 노출된다.

현재 이 구조는 fatigue를 낮추는 장점이 있다. 단점은 Phase 1에서 countertype core가 후보군에 들어오지 못하면 해당 필터가 열리지 않는다는 점이다.

## 3. Scoring Behavior

Countertype 응답은 두 축으로 분리 반영된다.

- `coreBoost = val * TEST_CONFIG.weights.tieBreaker.counterType`
- `instinctBoost = val * TEST_CONFIG.weights.tieBreaker.counterInstinct`
- `addScore(q.type, coreBoost, q.id)`로 core 후보를 보강한다.
- `counterSignals[q.type][q.inst] += instinctBoost`로 하위유형 본능 신호를 보강한다.

결과지 로그에는 core counter signal이 있을 때 `역유형 필터 적용` 문구가 표시된다.

## 4. Performance Questions

실험 데이터가 쌓이면 다음을 확인한다.

- Phase 1 후보에 countertype core가 들어오는가?
- countertype 필터가 열린 row에서 confirmed subtype과 predicted subtype이 얼마나 맞는가?
- `sx_6 -> 8`, `so_7 -> 2`, `so_9 -> 2/3`, `sp_3 -> 1`, `sp_4 -> 1/3` 혼동이 반복되는가?
- 오류 원인이 문항 wording인지, 후보 trigger인지, weight인지, 하위유형 Phase 4 다수결인지 분리한다.

## 5. Expansion Rule

새 countertype 문항을 추가하지 않는 기준:

- 실험 row가 아직 부족함
- 기존 9개 필터가 이미 존재함
- 문항 수 증가가 fatigue와 응답 품질 저하를 만들 수 있음

확장 조건:

- confirmed subtype row 기준으로 특정 countertype miss가 반복됨
- affected countertype row가 20개 이상이거나 상담자 review에서 명확한 반복 오해가 확인됨
- `scripts/analyze_diagnostic_experiments.mjs`에서 countertype miss rate가 상승함
- wording/routing/weight 중 원인을 분리한 뒤 최소 변경으로 해결 가능함

## 6. Verification

```bash
node --test tests/countertype-routing.test.mjs
```

이 테스트는 9개 countertype 필터 선언, 후보 유형 기반 routing, core/instinct 분리 scoring, 결과 로그 문구를 회귀 검증한다.
