<!-- ER 프리미엄 진단 결과지 콘텐츠 시스템의 진입점 -->
# ER Premium Report Content

이 폴더는 ER 에니어그램 프리미엄 결과지 업그레이드의 SSOT입니다.

## 목적

- Anara에서 만든 근거 기반 초안과 ChatGPT 편집본을 채팅에 흩어두지 않고 파일로 고정합니다.
- Cursor/Codex/Claude는 이 폴더의 스펙과 JSON을 읽고 웹 결과지, PDF, DB 전환을 구현합니다.
- 54개 조합을 단순 조립하지 않고 `core + instinct + wing`이 만나 생기는 고유 패턴을 별도 데이터로 관리합니다.

## 파일

- `PROJECT_PLAN.md` — PM 진행 계획, 단계, 사용자에게 요청할 일
- `CONTENT_SPEC.md` — 조각 블록, 조합 해석 카드, 화면 표시 필드 스키마
- `LANGUAGE_LAYERS.md` — 일반 사용자용 회복 언어 + 신앙 선택 문장 규칙
- `chemistry/*.json` — 조합별 해석 카드. 현재 골드 샘플: `sx_7_w8.json`; 나머지 53개 조합은 local KB motif/tone review gate를 통과해 `reviewed`
- `../../scripts/review_report_content.mjs` — 조합별 subtype motif, 고객용 금칙어, PDF 압축 필드 일관성을 확인하고 `draft`를 `reviewed`로 승격하는 검수 gate
- `../../js/report-chemistry-data.js` — 브라우저 런타임 데이터. 직접 수정하지 않고 생성합니다.

## 현재 우선순위

1. `sx_7_w8.json` 골드 샘플과 실전 섹션을 사용자가 실제 결과지/PDF에서 검토합니다.
2. 실제 결과지/PDF에서 대표 조합을 확인하고, 사용자 tone approval을 받은 카드를 `approved`로 승격합니다.
3. 같은 스키마를 유지하면서 Supabase 전환 또는 편집 워크플로우를 설계합니다.

## 검증

```bash
node scripts/verify_report_content.mjs
node scripts/review_report_content.mjs
node scripts/build_report_chemistry_data.mjs --check
node scripts/verify_report_content.mjs --coverage
node scripts/qa_premium_report_pdf.mjs
```

## 런타임 데이터 생성

조합 해석 카드의 원본은 항상 `docs/report-content/chemistry/*.json`입니다.
브라우저에서 읽는 `js/report-chemistry-data.js`는 원본 JSON의 화면용 필드만 담은 생성 파일입니다.

```bash
node scripts/build_report_chemistry_data.mjs
```

새 카드나 문구 수정 후에는 위 명령을 실행하고, `--check`가 통과하는지 확인합니다.

## 확장 진행률

54개 조합의 현재 진행률은 아래 명령으로 확인합니다. 현재 전체 조합이 준비되어 `54/54`를 기대합니다.

```bash
node scripts/verify_report_content.mjs --coverage
```

검수 승격 상태는 아래 명령으로 확인합니다. 현재 `gold_sample=1`, `reviewed=53`을 기대합니다.

```bash
node scripts/review_report_content.mjs
```

## PDF QA

`sx_7_w8` 골드 샘플 결과지를 PDF로 렌더링하고, 조합 해석 섹션/다운로드 버튼/콘솔 error/PDF 파일을 확인합니다.

```bash
node scripts/qa_premium_report_pdf.mjs
```

기본 산출물은 `/tmp/er-premium-report-sx-7-w8.pdf`입니다.
필요하면 `--output /path/to/file.pdf`로 위치를 지정합니다.
