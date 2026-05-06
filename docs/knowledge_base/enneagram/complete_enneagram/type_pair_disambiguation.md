<!-- 36 타입쌍 감별 인덱스 + tie-breaker 템플릿. 두 타입 점수가 근접할 때 motivation 차이를 직접 묻는 A/B 문항으로 활용 -->
---
kb_id: complete_enneagram.type_pair_disambiguation
title: "Type Pair Disambiguation — 36 Pairs with Tie-Breaker Templates"
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
source_title: "The Complete Enneagram: 27 Paths to Greater Self-Knowledge"
source_author: "Beatrice Chestnut"
created_at: "2026-05-05"
last_updated: "2026-05-06"
index_type: "pair_disambiguation"
source_pages: "p472-p517"
retrieval_tags:
  - type_pair
  - tie_breaker
  - disambiguation
  - motivation_split
  - diagnostic_axis
  - countertype
---

# Type Pair Disambiguation Index

Appendix의 타입쌍 감별 섹션을 진단 테스트 tie-breaker 설계용으로 정리한 문서입니다. 모든 36 쌍에 대해 (a) Primary split (b) target_diagnostic_axis (c) A/B 템플릿 을 제공합니다. `pNNN`은 PDF 물리 페이지.

## 사용법

- 상위 후보 2개가 근접 (top2 score diff ≤ 16% 등) 하면 아래 pair 를 검색.
- `target_diagnostic_axis` 는 그 pair 가 어떤 진단 차원에서 갈리는지 알려줌 — `motivation` (동기), `focus_of_attention` (주의 초점), `defense` (방어), `shadow` (회피), `passion` (자동 정서), `countertype` (표면-내부 반전).
- 템플릿의 A/B 를 1문항 forced-choice 로 바꾸면 효율적인 tie-breaker 가 됨.
- 필요 시 해당 PDF page 에서 원문 맥락 확인.

## 36 Pair Index

| Pair | PDF page | Primary split for testing | target_diagnostic_axis |
|---|---:|---|---|
| Ones and Twos | p473 | 1은 내면 기준/옳음/자기비판, 2는 관계 규칙/필요 충족/인정 욕구. | motivation |
| Ones and Threes | p474 | 1은 내부 기준과 완성도, 3은 외부 성과와 효율적 성공. | motivation |
| Ones and Fours | p475 | 1은 구조/기준/개선, 4는 진정성/감정/고유한 표현. | motivation |
| Ones and Fives | p476 | 1은 옳은 방식과 책임, 5는 에너지 보존과 지식/거리두기. | motivation |
| Ones and Sixes | p477 | 1은 실수/잘못됨을 걱정, 6은 위험/불확실성/신뢰를 걱정. | focus_of_attention |
| Ones and Sevens | p478 | 1은 제한과 의무를 수용해 올바름 추구, 7은 제한을 피하고 긍정 가능성 추구. | motivation |
| Ones and Eights | p480 | 1은 분노를 통제해 원칙으로 표현, 8은 분노/힘을 직접 사용. | defense |
| Ones and Nines | p481 | 1은 무엇이 잘못됐는지 선명히 봄, 9는 마찰을 줄이고 자기 입장을 흐림. | focus_of_attention |
| Twos and Threes | p482 | 2는 관계/애정/필요를 통해 가치 확인, 3은 성과/이미지를 통해 가치 확인. | motivation |
| Twos and Fours | p483 | 2는 타인의 필요와 관계 조율, 4는 자기 감정/진정성/결핍에 초점. | focus_of_attention |
| Twos and Fives | p484 | 2는 관계로 다가가고 필요를 억압, 5는 에너지 보호를 위해 물러남. | motivation |
| Twos and Sixes | p485 | 2는 호감/애정 상실을 걱정, 6은 위험/신뢰/숨은 의도를 걱정. | shadow |
| Twos and Sevens | p487 | 2는 타인과의 연결/호감, 7은 자기 욕구/재미/옵션 확장. | motivation |
| Twos and Eights | p488 | 2는 관계 영향력과 필요 충족, 8은 힘/경계/통제와 보호. | motivation |
| Twos and Nines | p490 | 2는 적극적으로 타인에게 맞추고 도움, 9는 수동적으로 융합하고 마찰을 낮춤. | motivation |
| Threes and Fours | p491 | 3은 성공 이미지와 목표, 4는 감정적 진실과 고유함. | motivation |
| Threes and Fives | p492 | 3은 실행/성과/인정, 5는 관찰/분석/자원 보존. | motivation |
| Threes and Sixes | p493 | 3은 빠른 실행과 성공, 6은 위험 검토와 의심/준비. | motivation |
| Threes and Sevens | p494 | 3은 목표 달성/효율, 7은 가능성/흥미/자유로운 옵션. | motivation |
| Threes and Eights | p496 | 3은 인정받는 성공 이미지, 8은 이미지보다 힘과 통제. | motivation |
| Threes and Nines | p497 | 3은 빠른 성취와 가시성, 9는 편안함/조화/갈등 회피. | motivation |
| Fours and Fives | p498 | 4는 감정 접촉과 표현, 5는 감정에서 분리해 사고/거리두기. | defense |
| Fours and Sixes | p499 | 4는 결핍/고유함/감정, 6은 불안/위험/확실성 탐색. | focus_of_attention |
| Fours and Sevens | p500 | 4는 고통과 깊이에 머묾, 7은 고통에서 가능성/긍정으로 이동. | defense |
| Fours and Eights | p502 | 4는 감정적 강도와 진정성, 8은 힘/통제/취약성 부정. | defense |
| Fours and Nines | p504 | 4는 자기감정/욕구를 더 의식, 9는 자기욕구를 흐리고 타인 관점에 융합. | focus_of_attention |
| Fives and Sixes | p505 | 5는 자급자족/경계/관찰, 6은 신뢰/안전/위험을 계속 검증. | motivation |
| Fives and Sevens | p506 | 5는 에너지와 경계를 줄여 보호, 7은 옵션과 자극을 늘려 회피. | motivation |
| Fives and Eights | p507 | 5는 물러나 통제, 8은 앞으로 나아가 통제. | defense |
| Fives and Nines | p508 | 5는 명확한 경계와 사적 공간, 9는 경계 약화와 조화/동조. | motivation |
| Sixes and Sevens | p510 | 6은 위험과 문제를 본다, 7은 가능성과 즐거움을 본다. | focus_of_attention |
| Sixes and Eights | p511 | 6은 두려움을 관리/대항, 8은 취약성을 거의 인정하지 않고 힘으로 대응. | countertype |
| Sixes and Nines | p512 | 6은 의심/검증/불안, 9는 신뢰/융합/갈등 회피. | motivation |
| Sevens and Eights | p513 | 7은 제한 회피와 긍정화, 8은 통제 회복과 직접적 힘. | motivation |
| Sevens and Nines | p515 | 7은 자극/옵션으로 회피, 9는 편안함/마찰 감소로 회피. | defense |
| Eights and Nines | p516 | 8은 자기 의지와 경계를 직접 주장, 9는 자기 의지와 분노를 잊거나 흐림. | motivation |

## High-Value Tie-Breaker Templates

아래는 36 쌍 모두에 대한 A/B 템플릿. 모두 motivation/defense/focus_of_attention 중 하나를 직접 묻는 형태로, 표면 행동이 아닌 내적 동기 차이를 갈라냅니다.

### 1 vs 2

- A: 내 안의 옳음 기준에 어긋난 것을 바로잡고 싶다는 마음이 먼저 작동한다.
- B: 가까운 사람의 마음과 필요를 채워 인정과 호감을 얻고 싶다는 마음이 먼저 작동한다.
- target_diagnostic_axis: motivation

### 1 vs 3

- A: 내가 정한 기준에 끝까지 부합하는 결과여야 마음이 놓인다.
- B: 외부에서 인정하는 성과가 빠르게 나와야 마음이 놓인다.
- target_diagnostic_axis: motivation

### 1 vs 4

- A: 일이 정리된 기준대로 작동해야 한다는 압력이 자주 나를 움직인다.
- B: 평범한 결과보다 내 감정과 고유함이 살아있는 표현이어야 의미를 느낀다.
- target_diagnostic_axis: motivation

### 1 vs 5

- A: 책임을 다하고 옳게 마무리하는 것이 우선, 미루면 죄책감이 따라온다.
- B: 에너지를 아끼고 거리를 두며 충분히 이해한 뒤에 움직이는 것이 우선이다.
- target_diagnostic_axis: motivation

### 1 vs 6

- A: 기준에 어긋나거나 내가 잘못했다는 느낌이 들 때 가장 불편하다.
- B: 위험 요소가 빠졌거나 믿을 만한지 확실하지 않을 때 가장 불편하다.
- target_diagnostic_axis: focus_of_attention

### 1 vs 7

- A: 의무와 제한이 있어도 올바른 방식대로 마치는 데서 안정을 느낀다.
- B: 제한이 보이면 답답해서 다른 가능성이나 흥미로운 방향으로 자동 전환된다.
- target_diagnostic_axis: motivation

### 1 vs 8

- A: 화가 나도 원칙과 기준에 맞게 통제해서 표현하려 한다.
- B: 화가 나면 힘과 경계를 직접 드러내 상황을 바로잡으려 한다.
- target_diagnostic_axis: defense

### 1 vs 9

- A: 무엇이 잘못됐는지가 선명히 보여 그 부분을 짚고 가야 풀린다.
- B: 마찰이 커지지 않도록 내 의견을 흐리거나 미루는 쪽이 자동이다.
- target_diagnostic_axis: focus_of_attention

### 2 vs 3

- A: 내가 필요한 사람, 좋은 사람, 특별히 챙겨주는 사람으로 느껴질 때 안정된다.
- B: 내가 유능하고 성과를 내는 사람으로 보일 때 안정된다.
- target_diagnostic_axis: motivation

### 2 vs 4

- A: 가까운 사람의 마음/필요가 1차적으로 보이고 거기에 맞춰진다.
- B: 내 감정과 결핍, 이 순간의 의미가 먼저 느껴지고 그게 1차다.
- target_diagnostic_axis: focus_of_attention

### 2 vs 5

- A: 관계 불안이 오면 더 다가가서 도움/배려로 끈을 묶으려 한다.
- B: 관계 불안이 오면 일단 물러나 거리를 두고 정리하려 한다.
- target_diagnostic_axis: motivation

### 2 vs 6

- A: 가장 먼저 떠오르는 걱정은 "내가 좋게 보이지 않으면 어쩌지" 다.
- B: 가장 먼저 떠오르는 걱정은 "이게 정말 안전한가, 위험은 빠지지 않았나" 다.
- target_diagnostic_axis: shadow

### 2 vs 7

- A: 즐거움도 가까운 사람과 연결될 때 살아난다, 연결이 우선이다.
- B: 즐거움 그 자체와 새로운 가능성/옵션이 우선이다.
- target_diagnostic_axis: motivation

### 2 vs 8

- A: 영향을 주려는 핵심 동력은 관계와 필요 충족, 호감으로 이어진다.
- B: 영향을 주려는 핵심 동력은 힘/경계/통제, 침범 방어로 이어진다.
- target_diagnostic_axis: motivation

### 2 vs 9

- A: 관계가 흔들리면 더 다가가고 맞추고 도우려 한다.
- B: 관계가 흔들리면 내 입장을 흐리거나 마찰을 줄여 편안하게 만들려 한다.
- target_diagnostic_axis: motivation

### 3 vs 4

- A: 빠르게 결과를 만들고 성공한 모습으로 가치를 확인한다.
- B: 결과보다 내 감정과 고유함이 표현되는 깊이로 가치를 확인한다.
- target_diagnostic_axis: motivation

### 3 vs 5

- A: 계획보다 실행과 결과가 우선, 일단 만들어 보여주는 쪽이 자연스럽다.
- B: 실행 전에 충분히 관찰하고 분석해서 자원을 아끼는 쪽이 자연스럽다.
- target_diagnostic_axis: motivation

### 3 vs 6

- A: 불안할수록 빨리 행동하고 결과를 만들어 안정시키려 한다.
- B: 불안할수록 빠진 위험과 대비책을 확인해야 안정된다.
- target_diagnostic_axis: motivation

### 3 vs 7

- A: 목표 한 가지에 자원을 집중해서 끝까지 밀어붙인다.
- B: 한 가지에 묶이는 것이 답답해서 옵션과 가능성을 열어둔다.
- target_diagnostic_axis: motivation

### 3 vs 8

- A: 핵심은 인정받는 성공의 모습, 이미지 관리에 신경 쓴다.
- B: 핵심은 직접 행사하는 힘과 통제, 이미지보다 영향력이다.
- target_diagnostic_axis: motivation

### 3 vs 9

- A: 압박이 와도 목표와 성과를 향해 속도를 내는 편이다.
- B: 압박이 오면 편안함과 조화를 유지하려고 속도를 늦추거나 미룬다.
- target_diagnostic_axis: motivation

### 4 vs 5

- A: 감정의 깊이로 들어가서 표현해야 살아있다는 감각이 든다.
- B: 감정에서 분리해 사고와 거리두기로 정리해야 안정된다.
- target_diagnostic_axis: defense

### 4 vs 6

- A: 평범하거나 결핍된 느낌이 들면 그것이 곧 내 정체성으로 다가온다.
- B: 알 수 없는 위험이나 신뢰 부족이 느껴지면 검증과 대비를 시작한다.
- target_diagnostic_axis: focus_of_attention

### 4 vs 7

- A: 불편한 감정에도 의미와 깊이가 있으면 오래 머무는 편이다.
- B: 불편한 감정이 길어지면 다른 가능성이나 흥미로운 계획으로 이동한다.
- target_diagnostic_axis: defense

### 4 vs 8

- A: 강도는 내 감정의 깊이/진정성에서 나온다, 약함도 표현한다.
- B: 강도는 힘과 통제에서 나온다, 약함은 부정하거나 빠르게 닫는다.
- target_diagnostic_axis: defense

### 4 vs 9

- A: 내 감정과 욕구가 비교적 선명하게 의식된다, 평범함이 불편하다.
- B: 내 욕구가 잘 안 보이고 주변에 맞추는 게 더 편하다.
- target_diagnostic_axis: focus_of_attention

### 5 vs 6

- A: 안전 확보 방식은 자급자족과 경계 — 내가 충분히 알면 된다.
- B: 안전 확보 방식은 검증과 동맹 — 신뢰할 수 있는 사람/시스템을 찾아 의지한다.
- target_diagnostic_axis: motivation

### 5 vs 7

- A: 지치면 자극을 줄이고 혼자 정리해야 회복된다.
- B: 지치면 새로운 자극, 계획, 가능성을 통해 다시 살아난다.
- target_diagnostic_axis: motivation

### 5 vs 8

- A: 통제 방식은 거리를 두고 관찰/지식으로 — 물러나면서 통제한다.
- B: 통제 방식은 직접 부딪쳐 영향력으로 — 나아가면서 통제한다.
- target_diagnostic_axis: defense

### 5 vs 9

- A: 내 시간과 에너지 경계를 침범받지 않는 것이 중요하다.
- B: 관계의 마찰이 커지지 않고 편안한 분위기가 유지되는 것이 중요하다.
- target_diagnostic_axis: motivation

### 6 vs 7

- A: 같은 상황에서 빠진 위험이나 잘못될 수 있는 부분이 먼저 보인다.
- B: 같은 상황에서 새로운 가능성과 흥미로운 부분이 먼저 보인다.
- target_diagnostic_axis: focus_of_attention

### 6 vs 8

- A: 강하게 나설 때도 밑바닥에는 위험을 이겨내거나 대비하려는 긴장이 있다.
- B: 강하게 나서는 것이 자연스럽고, 두려움보다 침범/통제에 대한 반응이 먼저다.
- target_diagnostic_axis: countertype

### 6 vs 9

- A: 권위/시스템에 대해 의심과 검증의 과정을 거쳐야 안심된다.
- B: 권위/시스템에 대해 흐름에 맞추고 마찰을 줄이는 쪽이 자연스럽다.
- target_diagnostic_axis: motivation

### 7 vs 8

- A: 제한과 무거운 감정을 피하려고 선택지와 가능성을 계속 열어둔다.
- B: 제한이나 침범을 느끼면 힘과 통제권을 직접 되찾으려 한다.
- target_diagnostic_axis: motivation

### 7 vs 9

- A: 무거움을 피하는 방식은 새 자극/옵션 — 다른 가능성으로 점프한다.
- B: 무거움을 피하는 방식은 편안함/마찰 감소 — 흐름에 흡수된다.
- target_diagnostic_axis: defense

### 8 vs 9

- A: 내 뜻이 막히면 바로 힘을 내서 경계를 세우거나 밀고 나간다.
- B: 내 뜻이 막혀도 마찰이 커지는 것이 싫어 흐름에 맞추거나 미룬다.
- target_diagnostic_axis: motivation

## Appendix Source Coverage

| Page range | Covered pairs |
|---:|---|
| p473-p481 | Type 1 with Types 2-9 |
| p482-p490 | Type 2 with Types 3-9 |
| p491-p498 | Type 3 with Types 4-9 |
| p498-p505 | Type 4 with Types 5-9 |
| p505-p509 | Type 5 with Types 6-9 |
| p510-p513 | Type 6 with Types 7-9 |
| p513-p515 | Type 7 with Types 8-9 |
| p516-p517 | Type 8 with Type 9 |
