<!-- ER 프리미엄 진단 결과지 업그레이드 PM 실행 계획 -->
# Premium Report Upgrade Plan

## PM 원칙

- 사용자는 방향, 자료, 승인, 계정 권한처럼 사람만 할 수 있는 일만 돕습니다.
- Codex PM은 계획, 파일화, 구현 단위 분리, 검증, 다음 요청 정리를 책임집니다.
- Cursor는 실제 코드 반영과 PR/배포의 중심으로 유지합니다.
- Anara와 ChatGPT 결과물은 최종본이 되면 반드시 이 리포의 파일 또는 Supabase 데이터로 저장합니다.

## 현재 상태

- 기존 Enneagram Phase 1-6 자동화는 완료/paused 상태입니다.
- 스코어링, 27 subtype, 기본 프리미엄 결과지 렌더러는 이미 존재합니다.
- 이번 작업은 신규 Phase 7 성격입니다: 프리미엄 결과지 콘텐츠 시스템 + 골드 샘플 + 에디토리얼 렌더링.
- `sx_7_w8` 골드 샘플은 JSON으로 저장되었고, 결과지 화면의 "조합별 심층 해석" 섹션에 연결되었습니다.
- Type 7 나머지 5개 조합은 `draft` 상태로 추가되었습니다: `sx_7_w6`, `so_7_w8`, `so_7_w6`, `sp_7_w8`, `sp_7_w6`.
- Countertype 16개 조합은 `draft` 상태로 추가되었습니다: `sx_1_w9`, `sx_1_w2`, `sp_2_w1`, `sp_2_w3`, `sp_3_w2`, `sp_3_w4`, `sp_4_w3`, `sp_4_w5`, `sx_5_w4`, `sx_5_w6`, `sx_6_w5`, `sx_6_w7`, `so_8_w7`, `so_8_w9`, `so_9_w8`, `so_9_w1`.
- High-value 6개 조합은 `draft` 상태로 추가되었습니다: `sx_2_w3`, `sx_2_w1`, `so_3_w2`, `so_3_w4`, `sx_4_w3`, `sx_4_w5`.
- Type 1/2 structure-checked 6개 조합은 `draft` 상태로 추가되었습니다: `sp_1_w9`, `sp_1_w2`, `so_1_w9`, `so_1_w2`, `so_2_w1`, `so_2_w3`.
- Type 3/4/5 follow-up 6개 조합은 `draft` 상태로 추가되었습니다: `sx_3_w2`, `sx_3_w4`, `so_4_w3`, `so_4_w5`, `so_5_w4`, `so_5_w6`.
- Type 5/6 follow-up 6개 조합은 `draft` 상태로 추가되었습니다: `sp_5_w4`, `sp_5_w6`, `so_6_w5`, `so_6_w7`, `sp_6_w5`, `sp_6_w7`.
- Final Type 8/9 8개 조합은 `draft` 상태로 추가되었습니다: `sx_8_w7`, `sx_8_w9`, `sp_8_w7`, `sp_8_w9`, `sx_9_w8`, `sx_9_w1`, `sp_9_w8`, `sp_9_w1`.
- 현재 콘텐츠 coverage는 `54/54`입니다. `sx_7_w8` 외 초안은 Anara/source review 후 `reviewed` 또는 `approved`로 승격합니다.
- 고객용 JSON에는 `source_note`, 검색 태그, 페이지 번호를 저장하지 않습니다. 연구 메타데이터는 원문 초안에만 둡니다.
- `js/report-chemistry-data.js`는 `docs/report-content/chemistry/*.json`에서 생성되는 런타임 파일입니다.

## Phase 7 목표

1. 콘텐츠 SSOT 구축: `docs/report-content/`에 스펙, 언어 규칙, 조합별 JSON 저장.
2. 골드 샘플 구축: `sx_7_w8` 조합 해석 카드와 화면용 압축본 확정.
3. 렌더링 연결: `buildPremiumReportModel()`과 `renderPremiumReport()`가 조합 해석 카드 섹션을 표시.
4. PDF/화면 검증: 1개 조합이 웹과 PDF에서 프리미엄 결과지처럼 보이는지 확인.
5. 확장 전략: 54개 조합을 `blocks + chemistry + practical_insights + display` 방식으로 점진 확장.
6. DB 전환: 파일 기반이 안정되면 Supabase `report_*` 테이블로 이전.

## 작업 단위

### Task 7.0 — Content SSOT

- Create `docs/report-content/CONTENT_SPEC.md`
- Create `docs/report-content/LANGUAGE_LAYERS.md`
- Create `docs/report-content/chemistry/sx_7_w8.json`
- Create `scripts/verify_report_content.mjs`
- Create `scripts/build_report_chemistry_data.mjs`
- Verify JSON and language constraints.
- Verify generated runtime data stays in sync with JSON.

### Task 7.1 — Renderer Integration

- Load chemistry content in `js/diagnostic-report-content.js` or a new browser-safe data module.
- Add `chemistry` to the premium report model.
- Add a section in `renderPremiumReport()` titled "조합별 심층 해석".
- Keep fallback behavior when no chemistry card exists.

### Task 7.2 — Browser/PDF QA

- Run the local test page.
- Force or simulate a `sx_7_w8` result.
- Check desktop/mobile layout.
- Download PDF and verify section break, overflow, typography, and button behavior.
- Run `node scripts/qa_premium_report_pdf.mjs` to verify the debug report renders to PDF with the chemistry section present and console errors clean.

### Task 7.3 — Expansion Batch

- Use the `sx_7_w8` card as the golden pattern.
- Build 7-type batch first: `sx_7_w6`, `so_7_w8`, `so_7_w6`, `sp_7_w8`, `sp_7_w6`.
- Build countertype draft batch: `sx_6_w5`, `sx_6_w7`, `sp_3_w2`, `sp_3_w4`, `sp_4_w3`, `sp_4_w5`.
- Build next countertype wing batch from user-provided Anara exports: `sx_1_w9`, `sx_1_w2`, `sp_2_w1`, `sp_2_w3`, `sx_5_w4`, `sx_5_w6`.
- Build final social countertype wing batch from user-provided Anara exports: `so_8_w7`, `so_8_w9`, `so_9_w8`, `so_9_w1`.
- Build high-value coaching batch from user-provided Anara exports: `sx_2_w3`, `sx_2_w1`, `so_3_w2`, `so_3_w4`, `sx_4_w3`, `sx_4_w5`.
- Build Type 1/2 structure-checked batch from user-provided Anara exports after local KB validation: `sp_1_w9`, `sp_1_w2`, `so_1_w9`, `so_1_w2`, `so_2_w1`, `so_2_w3`.
- Build Type 3/4/5 follow-up batch from user-provided Anara exports after local KB validation: `sx_3_w2`, `sx_3_w4`, `so_4_w3`, `so_4_w5`, `so_5_w4`, `so_5_w6`.
- Build Type 5/6 follow-up batch from user-provided Anara exports after local KB validation: `sp_5_w4`, `sp_5_w6`, `so_6_w5`, `so_6_w7`, `sp_6_w5`, `sp_6_w7`.
- Build final Type 8/9 batch from user-provided Anara exports after local KB validation: `sx_8_w7`, `sx_8_w9`, `sp_8_w7`, `sp_8_w9`, `sx_9_w8`, `sx_9_w1`, `sp_9_w8`, `sp_9_w1`.
- All 54 combinations are now represented; continue with source/tone review, status promotion, and production data workflow.
- Track progress with `node scripts/verify_report_content.mjs --coverage`.

Current checkpoint:

- Type 7 batch, all non-Type 7 countertype wing batches, first high-value coaching batch, Type 1/2 structure-checked batch, Type 3/4/5 follow-up batch, Type 5/6 follow-up batch, and final Type 8/9 batch exist as JSON and browser runtime data.
- All 54 chemistry card combinations are present in the content SSOT.
- `sx_7_w8` remains the only `gold_sample`.
- The other cards remain `draft` until source review and user tone approval.
- Next recommended target: sample PDF review across a few representative cards, then source/tone review and promotion from `draft` to `reviewed`.

## User Requests I Will Make

- Approve or edit the `sx_7_w8` gold text after seeing it on the page.
- Provide Anara exports for the next batch when I ask for a specific combination list.
- Provide GitHub/Cursor PR permissions only if PR creation or merge is blocked.
- Decide whether Supabase is required in the first production release or after file-based proof.

## Done Criteria For First Milestone

- `sx_7_w8` gold sample is stored as JSON.
- Report renderer shows a polished chemistry section for that result.
- Existing Node tests pass.
- `node scripts/verify_report_content.mjs` passes.
- `node scripts/verify_report_content.mjs --coverage` reports the expected prepared/total count.
- `node scripts/build_report_chemistry_data.mjs --check` confirms runtime data is generated from JSON.
- `node scripts/qa_premium_report_pdf.mjs` renders the `sx_7_w8` PDF QA artifact successfully.
- User can open the result page and judge the actual product feel, not just the text.
