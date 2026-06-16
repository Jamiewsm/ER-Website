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
- `chemistry/*.json` — 조합별 해석 카드. 현재 골드 샘플: `sx_7_w8.json`; Type 7 나머지 5개, countertype wing batch 16개, high-value batch 6개, Type 1/2 structure-checked batch 6개는 `draft`
- `../../js/report-chemistry-data.js` — 브라우저 런타임 데이터. 직접 수정하지 않고 생성합니다.

## 현재 우선순위

1. `sx_7_w8.json` 골드 샘플과 실전 섹션을 사용자가 실제 결과지/PDF에서 검토합니다.
2. Type 7 draft batch 5개, countertype wing draft batch 16개, high-value draft batch 6개, Type 1/2 structure-checked draft batch 6개를 source/tone review 후 승격합니다.
3. 다음 확장 배치를 코칭 수요가 높은 조합 또는 사용자 제공 Anara exports로 정합니다.
4. 같은 스키마로 나머지 조합을 배치 작업으로 확장합니다.

## 검증

```bash
node scripts/verify_report_content.mjs
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

54개 조합의 현재 진행률은 아래 명령으로 확인합니다. 현재 Type 7 전체 6개, countertype wing batch 16개, high-value batch 6개, Type 1/2 structure-checked batch 6개가 준비되어 `34/54`를 기대합니다.

```bash
node scripts/verify_report_content.mjs --coverage
```

## PDF QA

`sx_7_w8` 골드 샘플 결과지를 PDF로 렌더링하고, 조합 해석 섹션/다운로드 버튼/콘솔 error/PDF 파일을 확인합니다.

```bash
node scripts/qa_premium_report_pdf.mjs
```

기본 산출물은 `/tmp/er-premium-report-sx-7-w8.pdf`입니다.
필요하면 `--output /path/to/file.pdf`로 위치를 지정합니다.
