# Premium Report Fit Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Anara source drafts into clean customer-facing premium report cards and add practical paid-report value through strengths, risks, and fit guidance.

**Architecture:** Keep `docs/report-content/chemistry/*.json` as the content SSOT. Extend the chemistry card schema with practical insight arrays, generate only customer-facing fields into `js/report-chemistry-data.js`, and render those fields in `js/test.js` as a compact professional section under the combination profile.

**Tech Stack:** Static HTML/CSS/JS, Node test runner, JSON content files, generated browser runtime data, Playwright/PDF QA.

---

### Task 1: Add Schema Coverage Tests

**Files:**
- Modify: `tests/report-chemistry-content.test.mjs`
- Modify: `scripts/verify_report_content.mjs`

- [ ] **Step 1: Write the failing test**

Add assertions that the runtime card contains `practical_insights`, that source-only notes are not shipped, and that coverage increases to `12/54`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test tests/report-chemistry-content.test.mjs
```

Expected: FAIL because `practical_insights` does not exist yet and coverage is still `6/54`.

- [ ] **Step 3: Implement verifier requirements**

Require `practical_insights` with:

```text
strengths
overuse_risks
work_fit
draining_contexts
coaching_questions
```

Each array must contain at least 2 customer-facing strings. Reject `<sources`, `</source>`, and `source_note`.

- [ ] **Step 4: Run test to verify it passes after content and generator changes**

Run:

```bash
node --test tests/report-chemistry-content.test.mjs
```

Expected: PASS.

### Task 2: Clean and Add Countertype Batch

**Files:**
- Create: `docs/report-content/chemistry/sx_6_w5.json`
- Create: `docs/report-content/chemistry/sx_6_w7.json`
- Create: `docs/report-content/chemistry/sp_3_w2.json`
- Create: `docs/report-content/chemistry/sp_3_w4.json`
- Create: `docs/report-content/chemistry/sp_4_w3.json`
- Create: `docs/report-content/chemistry/sp_4_w5.json`
- Modify: existing Type 7 JSON files to add `practical_insights`

- [ ] **Step 1: Remove source-only material**

Do not include Anara `<sources ...>` tags, page numbers, or `source_note` in customer JSON files.

- [ ] **Step 2: Add customer-facing practical insight fields**

For every prepared card, add practical insight arrays for strengths, overuse risks, fit environments, draining contexts, and coaching questions.

- [ ] **Step 3: Verify content**

Run:

```bash
node scripts/verify_report_content.mjs --coverage
```

Expected: `OK` and `Coverage: 12/54 chemistry combinations`.

### Task 3: Render Paid-Report Fit Section

**Files:**
- Modify: `scripts/build_report_chemistry_data.mjs`
- Modify: `js/test.js`
- Modify: `css/test.css`
- Modify: `scripts/qa_premium_report_pdf.mjs`

- [ ] **Step 1: Generate practical insights into runtime data**

Include `practical_insights` in each runtime card. Keep source-only fields out.

- [ ] **Step 2: Render a new section inside the combination profile card**

Add a professional section titled `강점과 적합 환경` with four columns/groups:

```text
핵심 강점
과사용 리스크
잘 맞는 환경
에너지를 소모하는 환경
```

Then add `코칭 질문` as a short numbered list.

- [ ] **Step 3: Style the section**

Use the existing professional report palette, one font, compact bordered panels, and no nested decorative cards.

### Task 4: Verification and PR Update

**Files:**
- Generated: `js/report-chemistry-data.js`
- Existing PR: `#54`

- [ ] **Step 1: Run full validation**

Run:

```bash
node scripts/build_report_chemistry_data.mjs --check
node scripts/verify_report_content.mjs
node scripts/verify_report_content.mjs --coverage
node docs/_meta/enneagram/verify.mjs all
node --test tests/test-scoring.test.mjs tests/render-smoke.test.mjs tests/phase4-options-render.test.mjs tests/apply-workshop-render.test.mjs tests/report-chemistry-content.test.mjs tests/report-pdf-qa.test.mjs
node scripts/qa_premium_report_pdf.mjs --output /tmp/er-premium-report-sx-7-w8-fit.pdf
```

- [ ] **Step 2: Run visual QA**

Verify `test.html?debugReport=sx_7_w8` renders the new paid-report section on desktop/mobile and that console errors remain clean.

- [ ] **Step 3: Commit and push**

Commit with:

```bash
git commit -m "feat(enneagram-report): add practical fit insights"
git push
```
