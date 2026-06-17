# Premium Report V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a feature-flagged Premium V2 PDF sample for `sx_7_w8` that matches the user's `mockup1.png` through `mockup10.png` direction, produces an 18-22 page paid-report experience, and prevents repeated filler content through automated text-quality checks.

**Architecture:** Keep the existing premium report as V1 fallback. Add a separate V2 data layer, renderer, CSS file, route switch, and QA path. V2 is first accessed through `/test.html?debugReport=sx_7_w8&reportVersion=v2`; it becomes the default only after visual review.

**Tech Stack:** Vanilla JS, existing static `test.html` flow, existing chemistry JSON/runtime data, CSS print layout, Node test runner, Playwright CLI PDF QA, `pypdf` extraction already used by QA.

---

## Current State

- Branch/worktree: `codex/premium-report-upgrade`.
- Existing V1 renderer lives mostly in `js/test.js`.
- Existing model builder: `buildPremiumReportModel(resultData)` in `js/test.js`.
- Existing debug entry point: `renderDebugPremiumReportFromQuery()` in `js/test.js`.
- Existing runtime content:
  - `js/report-chemistry-data.js`
  - `js/diagnostic-report-content.js`
  - `docs/report-content/chemistry/*.json`
- Existing PDF QA:
  - `scripts/qa_premium_report_pdf.mjs`
  - `scripts/render_report_review_bundle.mjs`
  - `tests/report-pdf-qa.test.mjs`
- User visual references are in the original project folder, not in this worktree:
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup1.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup2.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup3.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup4.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup5.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup6.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup7.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup8.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/ mockup9.png`
  - `/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/test-results/mockup10.png`

The mockup files are reference inputs only. V2 must not depend on reading them at runtime.

## Product Constraints

- The phrase `조합만의 화학` must not appear.
- One font family only. Use Pretendard if already available through the page; otherwise use one system Korean sans stack from a single `font-family` declaration.
- No Anara/source notes, internal draft labels, JSON keys, or raw review instructions may appear in the user-facing report.
- Every page needs a unique job. A concept can reappear only when it changes the user's task, such as moving from self-understanding to work behavior or repair practice.
- Avoid repeated sentence stems, especially:
  - `가능성을 열다`
  - `현재에 머무르다`
  - `작은 회복`
  - `자유와 가능성`
- Work, relationship, parenting, faith, and next-step content must not be the same paragraph with nouns swapped.
- Type/instinct/wing claims must stay inside the large Enneagram frame already established by the chemistry cards. Do not invent formal career-placement claims.

## Files To Add

- `js/report-v2-data.js`
  - V2 page definitions and structured content for the first `sx_7_w8` slice.
  - Shared labels for page purpose, sections, icons, and callout styles.
  - Lightweight theory mappings for type, instinct, and wing sections used by `sx_7_w8`.
- `js/report-v2-renderer.js`
  - `window.ERRenderPremiumReportV2(model)` public entry point.
  - Page render helpers for the 20-page report.
  - Escaping helpers or calls into existing safe escaping if exposed.
- `css/report-v2.css`
  - Print-first V2 layout.
  - Letter page sizing, page breaks, headers, footers, botanical accents, dashboard/grid/chart styles.
- `scripts/lib/report-text-quality.mjs`
  - Repetition detector for long Korean phrases/sentences.
  - Forbidden phrase checker.
  - Exported helpers for tests and PDF QA.
- `tests/report-v2-renderer.test.mjs`
  - Source-level guardrails for asset wiring, V2 route switch, prohibited phrase, single-font rule, and page labels.
- `tests/report-text-quality.test.mjs`
  - Unit tests for duplicate sentence/phrase detection and allowed contextual reuse.

## Files To Modify

- `test.html`
  - Load `css/report-v2.css`.
  - Load `js/report-v2-data.js` and `js/report-v2-renderer.js` before `js/test.js`.
- `js/test.js`
  - Add a small route/version helper.
  - Keep `buildPremiumReportModel()` unchanged. If V2 needs an additional display field, add it in the V2 adapter instead of changing the scoring model.
  - In both debug and normal result paths, dispatch to V2 only when `reportVersion=v2` and `window.ERRenderPremiumReportV2` exists.
  - Preserve V1 fallback behavior.
- `scripts/qa_premium_report_pdf.mjs`
  - Add `--version <v1|v2>`.
  - Add V2 route: `/test.html?debugReport=<key>&reportVersion=v2`.
  - Use V2 selector `.er-report-v2`.
  - For V2, require 18-22 PDF pages.
  - For V2, run text-quality checks on extracted PDF text.
- `scripts/render_report_review_bundle.mjs`
  - Add `--version <v1|v2>`.
  - Write V2 files as `<key>-v2.pdf`.
  - Include V2 review notes in the manifest.
- `tests/report-pdf-qa.test.mjs`
  - Extend help/source tests for `--version v2`, V2 route, V2 page-count checks, and text-quality checks.
- `docs/superpowers/specs/2026-06-17-premium-report-v2-design.md`
  - Already updated with the non-repetition standard; keep it as the product spec.

## Page Plan For First V2 Slice

Use exactly 20 pages for the first sample:

- Page 1: Cover, based on `mockup1.png`.
- Page 2: One-glance result dashboard, based on `mockup2.png`.
- Page 3: Combination deep interpretation, based on `mockup3.png`.
- Page 4: Strengths and fit, based on `mockup4.png`.
- Page 5: Score-flow dashboard, based on `mockup5.png`.
- Page 6: Repeated cycle, based on `mockup6.png`.
- Page 7: Life application patterns, based on `mockup7.png`.
- Page 8: Core motivation and fear, based on `mockup8.png`.
- Page 9: Keys that open possibility, based on ` mockup9.png`.
- Page 10: Sustainable growth and change, based on `mockup10.png`.
- Page 11: Core type 7 profile.
- Page 12: SX dominant instinct and stack interpretation.
- Page 13: 8 wing and adjacent-type comparison.
- Page 14: Work/vocation fit.
- Page 15: Team communication and leadership.
- Page 16: Relationships and closeness.
- Page 17: Family, parenting, and conflict repair.
- Page 18: Stress and restoration plan.
- Page 19: Faith and restoration invitation.
- Page 20: Summary and ER next steps.

Each page object in `js/report-v2-data.js` should include:

```js
{
  id: 'life-application',
  pageNumber: 7,
  visualReference: 'mockup7',
  purpose: 'Translate the result into daily behavior.',
  contentRole: 'application',
  sections: []
}
```

`purpose` and `contentRole` are not rendered by default; they exist so tests and reviewers can verify that pages are not filling space with repeated copy.

## TDD Implementation Steps

- [ ] Step 1: Add RED tests for V2 asset wiring and route switching.

  Create `tests/report-v2-renderer.test.mjs` with tests that fail until V2 assets and dispatch exist:

  - `test.html` contains `css/report-v2.css`.
  - `test.html` loads `js/report-v2-data.js`.
  - `test.html` loads `js/report-v2-renderer.js`.
  - Both V2 scripts appear before `js/test.js`.
  - `js/test.js` contains `getPremiumReportVersion`.
  - `js/test.js` calls `window.ERRenderPremiumReportV2`.
  - User-facing source does not contain `조합만의 화학`.

  Command:

  ```bash
  node --test tests/report-v2-renderer.test.mjs
  ```

  Expected output before implementation: failure on missing CSS/JS files or route switch.

- [ ] Step 2: Add RED tests for non-repetitive content quality.

  Create `tests/report-text-quality.test.mjs` against `scripts/lib/report-text-quality.mjs`.

  Required cases:

  - Repeated long Korean sentence is flagged.
  - Repeated long Korean phrase across separate paragraphs is flagged.
  - Short ordinary words such as `회복`, `관계`, and `일` are not flagged by themselves.
  - Contextual reuse passes when the second section changes the user's task.
  - Forbidden phrases include `조합만의 화학`.

  Command:

  ```bash
  node --test tests/report-text-quality.test.mjs
  ```

  Expected output before implementation: module-not-found failure.

- [ ] Step 3: Implement `scripts/lib/report-text-quality.mjs`.

  Export:

  - `normalizeKoreanText(text)`
  - `findForbiddenPhrases(text, forbiddenPhrases)`
  - `findRepeatedLongSentences(text, options)`
  - `findRepeatedLongPhrases(text, options)`
  - `assertReportTextQuality(text, options)`

  Recommended thresholds:

  - sentence duplicate minimum: 24 normalized characters.
  - phrase duplicate minimum: 18 normalized Korean/Latin characters.
  - ignore repeated report labels such as `Page`, `ER`, `Enneagram`, `sx_7_w8`, `SX 7w8`.

  Verification:

  ```bash
  node --test tests/report-text-quality.test.mjs
  ```

  Expected output: all tests pass.

- [ ] Step 4: Add V2 data for `sx_7_w8`.

  Create `js/report-v2-data.js` with a single global namespace:

  ```js
  window.ERReportV2Data = {
    defaultPageCount: 20,
    forbiddenPhrases: ['조합만의 화학'],
    samples: {
      sx_7_w8: {
        titleCode: 'SX 7w8',
        pages: []
      }
    }
  };
  ```

  Use structured page data. Do not store one giant HTML string.

  Content requirements:

  - Each page has a distinct purpose.
  - Pages 1-10 map to the user's mockups.
  - Pages 11-20 add type, instinct, wing, work, relationship, stress, faith, and next-step depth.
  - Copy is polished Korean, not draft/source-note language.
  - `source_note`, `Source Draft`, `ANARA`, raw JSON labels, and review comments are absent.
  - Avoid harsh labels such as `광신자`, `귀신`, or overly absolute claims in user-facing copy.

  Verification:

  ```bash
  node --test tests/report-v2-renderer.test.mjs tests/report-text-quality.test.mjs
  ```

- [ ] Step 5: Add the V2 renderer shell.

  Create `js/report-v2-renderer.js`.

  Public API:

  ```js
  window.ERRenderPremiumReportV2 = function renderPremiumReportV2(model) {
    // Render into the existing result area and return the root element.
  };
  ```

  Rendering requirements:

  - Root element: `.er-report-v2`.
  - Stable selector for QA: `[data-report-version="v2"]`.
  - Each page: `.er-v2-page` with `data-page-id`.
  - Cover: no web-card feel.
  - Internal pages: consistent header/footer/page number.
  - Use existing `model` fields for scores, type, wing, instinct, top-three shares, and chemistry content.
  - Use charts built from CSS/HTML or inline SVG, not canvas.
  - Escape user-derived/model-derived text.

  Verification:

  ```bash
  node --test tests/report-v2-renderer.test.mjs
  ```

- [ ] Step 6: Wire V2 into `test.html` and `js/test.js`.

  In `test.html`, load order should be:

  ```html
  <link rel="stylesheet" href="css/report-v2.css">
  <script src="js/report-v2-data.js"></script>
  <script src="js/report-v2-renderer.js"></script>
  <script src="js/test.js"></script>
  ```

  In `js/test.js`, add a compact dispatcher:

  ```js
  function getPremiumReportVersion() {
    return params.get('reportVersion') === 'v2' ? 'v2' : 'v1';
  }

  function renderSelectedPremiumReport(model) {
    if (getPremiumReportVersion() === 'v2' && window.ERRenderPremiumReportV2) {
      return window.ERRenderPremiumReportV2(model);
    }
    return renderPremiumReport(model);
  }
  ```

  Replace direct calls in:

  - `renderDebugPremiumReportFromQuery()`
  - final scoring path near the existing `renderPremiumReport(premiumModel)` call

  Verification:

  ```bash
  node --test tests/report-v2-renderer.test.mjs tests/render-smoke.test.mjs
  ```

- [ ] Step 7: Add V2 print CSS.

  Create `css/report-v2.css`.

  CSS requirements:

  - One font stack at `.er-report-v2`.
  - Letter portrait page blocks.
  - `break-after: page` on `.er-v2-page`.
  - Warm ivory background, forest green, muted bronze, olive/sand/clay accents.
  - Print rules hide web-only controls.
  - No large purple/blue gradient theme.
  - No nested card-heavy dashboard look.
  - Mobile/web preview remains readable even though print is primary.

  Verification:

  ```bash
  node --test tests/report-v2-renderer.test.mjs tests/report-pdf-qa.test.mjs
  ```

- [ ] Step 8: Extend PDF QA for V2.

  Modify `scripts/qa_premium_report_pdf.mjs`:

  - Add help text for `--version <v1|v2>`.
  - Build route with `reportVersion=v2` when requested.
  - Use `.er-report-v2` snapshot for V2.
  - Assert the snapshot includes `SX 7w8`, `적응형 에니어그램 심층 진단`, and at least one page-specific heading from pages 2-10.
  - Extract PDF text and call `assertReportTextQuality`.
  - Require V2 page count between 18 and 22.
  - Keep existing V1 checks unchanged.

  Modify `tests/report-pdf-qa.test.mjs`:

  - Help advertises V2 route.
  - Source imports `report-text-quality.mjs`.
  - Source checks V2 page count range.
  - Unknown key behavior still fails before browser QA.

  Verification:

  ```bash
  node --test tests/report-pdf-qa.test.mjs
  ```

- [ ] Step 9: Extend review-bundle rendering.

  Modify `scripts/render_report_review_bundle.mjs`:

  - Add `--version <v1|v2>`.
  - Pass `--version` through to `qa_premium_report_pdf.mjs`.
  - For V2, output `<key>-v2.pdf`.
  - For the first slice, default review key can stay `sx_7_w8` when `--version v2` is provided, because only the gold sample is guaranteed to be fully designed.

  Verification:

  ```bash
  node --test tests/report-pdf-qa.test.mjs
  node scripts/render_report_review_bundle.mjs --keys sx_7_w8 --version v2 --output-dir output/pdf/review-bundle
  ```

- [ ] Step 10: Browser/PDF visual QA and correction pass.

  Render the sample:

  ```bash
  node scripts/qa_premium_report_pdf.mjs --key sx_7_w8 --version v2 --output output/pdf/review-bundle/sx_7_w8-v2.pdf
  ```

  Inspect the PDF and compare the first ten pages against the user's mockup sequence.

  Required corrections before finishing:

  - Page count is 18-22.
  - No blank trailing page.
  - First page feels like a paid report cover, not a web card.
  - Page 2 has enough density to feel like a professional dashboard.
  - Pages 3-10 each have a different visual rhythm.
  - Pages 11-20 add depth without repeating pages 1-10.
  - Text-quality checker passes.
  - The PDF contains no draft/source-note language.

- [ ] Step 11: Run full local verification.

  Commands:

  ```bash
  node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/report-chemistry-content.test.mjs tests/report-pdf-qa.test.mjs tests/report-v2-renderer.test.mjs tests/report-text-quality.test.mjs
  node scripts/verify_report_content.mjs --coverage
  node scripts/review_report_content.mjs
  node scripts/build_report_chemistry_data.mjs --check
  node scripts/qa_premium_report_pdf.mjs --key sx_7_w8 --version v2 --output output/pdf/review-bundle/sx_7_w8-v2.pdf
  ```

  Expected output:

  - Node tests pass.
  - Content verification passes.
  - Chemistry runtime data is current.
  - V2 PDF QA passes and prints `PDF pages: 18` through `PDF pages: 22`.

- [ ] Step 12: Commit and push implementation.

  Suggested commit grouping:

  ```bash
  git add tests/report-v2-renderer.test.mjs tests/report-text-quality.test.mjs scripts/lib/report-text-quality.mjs
  git commit -m "test(enneagram-report): add premium v2 quality guards"

  git add js/report-v2-data.js js/report-v2-renderer.js css/report-v2.css test.html js/test.js
  git commit -m "feat(enneagram-report): add premium v2 sample renderer"

  git add scripts/qa_premium_report_pdf.mjs scripts/render_report_review_bundle.mjs tests/report-pdf-qa.test.mjs output/pdf/review-bundle/sx_7_w8-v2.pdf output/pdf/review-bundle/README.md
  git commit -m "test(enneagram-report): support premium v2 pdf review"

  git push origin codex/premium-report-upgrade
  ```

  If generated PDFs are ignored by `.gitignore`, do not force-add them. Report their absolute local paths to the user instead.

## Rollback Plan

- V2 is route-gated by `reportVersion=v2`, so V1 remains the default.
- If V2 rendering fails, remove or bypass only the V2 dispatcher path and keep existing `renderPremiumReport(model)`.
- If PDF page count is unstable, adjust V2 CSS/page content while leaving V1 untouched.

## Acceptance Checklist

- [ ] `sx_7_w8` V2 sample opens in browser through `/test.html?debugReport=sx_7_w8&reportVersion=v2`.
- [ ] PDF renders to `output/pdf/review-bundle/sx_7_w8-v2.pdf`.
- [ ] PDF has 18-22 pages.
- [ ] No mostly blank trailing page.
- [ ] No `조합만의 화학`.
- [ ] No source notes, Anara labels, raw JSON keys, or internal review copy.
- [ ] One font family is used across V2.
- [ ] Pages 1-10 visibly follow `mockup1` through `mockup10`.
- [ ] Pages 11-20 add new interpretive depth.
- [ ] Text repetition guard passes.
- [ ] Existing V1 tests still pass.
