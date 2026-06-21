<!-- Current test code audit: 운영 경로, legacy 모듈, 중복/발산 상태 -->
---
kb_id: enneagram_test_meta.test_dup_audit
title: "Current Test Code Audit — operational path vs legacy modules"
created_at: "2026-05-07"
last_updated: "2026-06-20"
retrieval_tags:
  - dup_audit
  - test_js
  - app_adaptive
  - operational_path
  - code_gap
---

# Current Test Code Audit

## 1. 현재 운영 진입점

### `test.html` -> `js/test.js`

- 사용자가 직접 `test.html`을 열거나, 메인 사이트 진단 섹션이 iframe으로 `test.html`을 임베드한다.
- 현재 `test.html`이 실제로 로드하는 진단 관련 스크립트는 아래 순서다.

```html
<script src="js/program-catalog.js"></script>
<script src="js/diagnostic-report-content.js"></script>
<script src="js/report-support-materials.js"></script>
<script src="js/test.js"></script>
```

- 현재 운영 결과지의 스코어링, 렌더링, 프리미엄 결과지 섹션 생성은 대부분 `js/test.js` 내부에서 수행된다.
- `js/test.js`는 `window.ERDiagnosticReportContent`, `window.ERReportSupportMaterials`를 사용한다.

### `index.html` -> iframe route

- `index.html`에는 아직 `js/app-adaptive-data.js`, `js/app-adaptive.js`, `js/sections/test-embed.js`가 모두 로드된다.
- 실제 진단 섹션은 `js/sections/test-embed.js`와 `js/main.js`의 iframe mount 흐름을 통해 `test.html`을 표시한다.
- 따라서 `js/app-adaptive*.js`는 현재 기준 legacy direct-render 경로로 본다. 삭제 여부는 별도 확인이 필요하다.

## 2. 현재 파일 크기

```text
3332 js/test.js
 616 js/app-adaptive.js
 212 js/app-adaptive-data.js
 185 js/sections/test-embed.js
 147 js/test-scoring.js
  46 js/test-shared.js
 218 js/test-charts.js
 308 js/test-result-renderer.js
 518 js/subtypes-27-data.js
 415 js/diagnostic-report-content.js
 421 js/report-support-materials.js
```

## 3. 운영 코드에 이미 반영된 내용

- 1단계 고정 문항은 현재 39개다.
- 센터 판별은 `center_auto_1`~`center_auto_3`, `center_situation_1`~`center_situation_3`의 강제선택 문항으로 운영된다.
- 본능 판별은 리커트 9문항 + `instinct_attention_1` attention-bias 상황형 문항으로 운영된다.
- 6번은 최근 2주 상태 문항이 높고 1/5/9와 근접할 때 상태성 불안 보정 및 1-6, 5-6, 6-9 타이브레이커 보강을 적용한다.
- 4단계 하위유형과 날개는 각각 3개 행동 문항으로 생성되며, 단일 문항이 아니라 다수결로 판정된다.
- 센터 가중치는 문항당 `0.6`이다.
- 4번 코어 문항은 "자극 필요"가 아니라 결핍/허전함/특별함 축으로 수정되어 있다.
- 결과지에는 프리미엄 결과지 구조, 적용 가이드, 상담/스쿨 hook, 유형별 콘텐츠, 보조자료 추천 섹션이 들어가 있다.
- 보조자료 추천은 `js/report-support-materials.js`와 `docs/report-content/support-materials/catalog.json`을 사용한다.

## 4. 현재 코드와 다른 과거 문서 기록

아래 항목은 과거 Phase 3~6 문서에는 "완료"로 남아 있으나, 현재 운영 로딩 경로 기준으로는 그대로 연결되어 있지 않다.

| 문서상 논의/기록 | 현재 코드 상태 | 필요한 결정 |
|---|---|---|
| `js/test-scoring.js`를 `js/test.js`가 호출 | `test.html`이 `js/test-scoring.js`를 로드하지 않고, `js/test.js` 내부 스코어링을 사용 | helper를 다시 운영 경로에 연결할지, 아니면 historical helper로 보존할지 결정 |
| `js/test-shared.js`를 양쪽 entry point가 사용 | `js/app-adaptive-data.js`는 fallback으로 참조하지만, `test.html`은 `js/test-shared.js`를 로드하지 않고 `js/test.js`는 inline `arrowLines` 사용 | `test.html`에 로드하고 `js/test.js`를 refactor할지 결정 |
| `js/test-result-renderer.js`가 결과 카드 렌더링 | `test.html`이 로드하지 않음. 현재 premium 결과지는 `js/test.js`에서 직접 생성 | 기존 renderer를 폐기/보존/재통합 중 선택 |
| `js/test-charts.js` 차트 렌더링 | `test.html`이 로드하지 않음. 현재 결과지는 별도 premium HTML/CSS 중심 | 차트를 새 premium 결과지에 맞춰 재통합할지 결정 |
| `js/subtypes-27-data.js` lookup 기반 결과지 | `test.html`이 로드하지 않음. 현재 콘텐츠는 `js/diagnostic-report-content.js` 중심 | 27 subtype 원문 lookup을 다시 연결할지 결정 |
| `js/app-adaptive.js`와 `js/test.js` 중복 해소 | legacy direct-render 코드가 남아 있고, 질문 세트도 최신 센터 문항과 다름 | iframe 경로만 남길지, legacy도 동기화할지 결정 |

## 5. 다음 정리 우선순위

1. 운영 기준을 확정한다: `test.html + js/test.js`를 단일 운영 경로로 유지할지, helper 모듈들을 다시 연결할지 결정.
2. helper를 다시 연결한다면 먼저 `test-scoring.js`부터 연결하고, 동일 결과가 나오는지 regression test를 만든다.
3. `test-shared.js`의 `arrowLines`, type label, instinct label을 `js/test.js`에서도 사용하도록 정리한다.
4. `app-adaptive*.js`가 실제로 필요 없는지 확인한 뒤 legacy 제거 또는 동기화 계획을 세운다.
5. `test-result-renderer.js`, `test-charts.js`, `subtypes-27-data.js`는 현재 premium 결과지와 역할이 겹치므로 재사용할 부분만 남긴다.
