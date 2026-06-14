<!-- ER 프리미엄 결과지 콘텐츠 스키마와 작성 규칙 -->
# Premium Report Content Spec

## Product Shape

프리미엄 결과지는 단순 유형 설명이 아니라 개인화된 해석 출판물입니다.

최종 결과지는 세 층을 조합합니다.

| Layer | Role | Source |
|---|---|---|
| Core blocks | 9유형의 기본 동기, 두려움, 방어, 회복 방향 | Existing KB + `diagnostic-report-content.js` |
| Domain blocks | 관계, 일, 양육, 스트레스, 실천 같은 삶의 영역 | Existing report content + Anara |
| Chemistry cards | 특정 `instinct + core + wing` 조합에서만 생기는 고유 패턴과 오해 | Anara + ChatGPT final edit |

## Chemistry Card Key

Format:

```text
<dominant_instinct>_<core>_w<wing>
```

Examples:

- `sx_7_w8`
- `so_7_w6`
- `sp_3_w4`

## Chemistry JSON Fields

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | number | 현재는 `1` |
| `combination_key` | string | 예: `sx_7_w8` |
| `core` | number | 1-9 |
| `dominant_instinct` | string | `sp`, `sx`, `so` |
| `secondary_instinct` | string or null | 스택 보조 본능 |
| `blind_instinct` | string or null | 가장 낮거나 약한 본능 |
| `wing` | number | 인접 wing |
| `status` | string | `draft`, `reviewed`, `gold_sample`, `approved` |
| `identity_sentence` | string | 한 문장 정체성 |
| `core_tension` | string[] | 이 조합의 핵심 긴장 |
| `chemistry_story` | string[] | core + instinct + wing의 조합 고유 패턴 설명 |
| `distinctive_signs` | string[] | 관찰 가능한 특징 3-5개 |
| `contrast_pair` | string[] | 비슷한 조합과의 차이 |
| `misread_pattern` | string[] | 타인이 오해하기 쉬운 점 |
| `stress_chemistry` | string[] | 스트레스 때 과장되는 반응 |
| `recovery_hook` | string[] | 회복의 첫걸음 |
| `faith_optional` | string[] | 신앙 있는 사용자가 선택적으로 읽는 문장 |
| `display` | object | 웹/PDF 1페이지 압축 표시용 |

## Display Object

`display`은 긴 카드를 바로 화면에 다 넣지 않기 위한 압축본입니다.

| Field | Type | Purpose |
|---|---|---|
| `one_page_title` | string | 섹션 제목 |
| `one_page_body` | string[] | 2-3문단 압축 본문 |
| `pull_quote` | string | 큰 인용문 |
| `bullets` | string[] | 화면용 핵심 특징 3개 |

## Writing Rules

- 조각 설명만 나열하지 않습니다. `7 + sx + w8`을 각각 설명하는 문장이 아니라 함께 있을 때만 생기는 긴장을 씁니다.
- `core_tension`은 다른 조합에 붙여도 말이 되면 실패입니다.
- `chemistry_story`에는 겉모습과 속마음의 차이가 최소 1개 들어가야 합니다.
- `contrast_pair`는 반드시 대비 대상을 명시합니다.
- 기본 본문에는 교회 내부 용어를 강하게 쓰지 않습니다. 신앙 문장은 `faith_optional`로 분리합니다.
- 웹/PDF에는 `display` 압축본을 먼저 쓰고, 긴 전문은 심화 섹션이나 PDF 확장 페이지에 사용할 수 있습니다.

## Expansion Strategy

첫 번째 골드 샘플은 `sx_7_w8`입니다.

그 다음 순서는 다음을 권장합니다.

1. Type 7 전체: `sx_7_w6`, `so_7_w8`, `so_7_w6`, `sp_7_w8`, `sp_7_w6`
2. Countertype 9개
3. 코칭 수요가 높은 조합 12개
4. 나머지 54 조합 채우기
