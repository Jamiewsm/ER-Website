<!-- Phase 5 (결과 출력 포맷) 구현 plan. 27 subtype 콘텐츠 lookup + 결과지 카드 + countertype 안내 + PDF/공유 -->
---
kb_id: enneagram_test_meta.phase_5_plan
title: "Phase 5 Implementation Plan — Result Output Format (Final)"
phase: 5
created_at: "2026-05-08"
last_updated: "2026-05-08"
status: ready_to_execute
total_tasks: 6
estimated_total_minutes: "180-260"
related_files:
  - CONTEXT.md
  - WORK_STATUS.md
  - HANDOFF.md
  - PHASE_3_PLAN.md
  - PHASE_4_PLAN.md
retrieval_tags:
  - phase_5
  - result_output
  - subtypes_27_lookup
  - result_renderer
  - countertype_warning
  - pdf_share_update
  - implementation_plan
  - final_phase
---

# ER Enneagram Test — Phase 5 (Result Output Format) Implementation Plan

> **For agentic workers:** [HANDOFF.md](./HANDOFF.md) 의 5단계 protocol. 매 task 종료 시 `node docs/_meta/enneagram/verify.mjs <task_id>` + `node --test tests/test-scoring.test.mjs` 통과 확인 후 commit. **마지막 phase** — 종료 시 `current_phase = 6` + 스케줄 task self-delete.

**Goal:** 결과지에 27 subtype 깊이 콘텐츠 (7 슬롯) lookup + countertype 안내 + wing/instinct % 시각화 + PDF/공유 갱신.

**Architecture:** `js/subtypes-27-data.js` 는 [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) 의 27 subtype × 7 슬롯을 JS 데이터 구조로. `js/test-result-renderer.js` 는 `phase3Result.subtype` 으로 lookup → HTML 카드 생성. `js/test.js` 가 phase3Result 산출 후 renderer 호출. `test.html` 에 신규 컨테이너. PDF/공유는 신규 형식 반영.

**Tech Stack:** Vanilla JS (브라우저 + Node.js 호환), 의존 없음, html2canvas+jspdf (이미 로드됨).

**Working Directory:** `/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/.claude/worktrees/musing-taussig-e181fd/`.

---

## 0. Task Index

| ID | 제목 | 의존 | 추정(분) |
|---|---|---|---:|
| 5.0 | Phase 5 plan + verify.mjs spec | Phase 4 완료 | 30-40 |
| 5.1 | `js/subtypes-27-data.js` — 27 subtype × 7 슬롯 데이터 | 5.0 | 60-90 |
| 5.2 | `js/test-result-renderer.js` — lookup + 카드 생성 함수 | 5.1 | 30-40 |
| 5.3 | `js/test.js` 와이어링 + `test.html` 신규 컨테이너 + script 로드 | 5.2 | 25-35 |
| 5.4 | PDF + 공유 텍스트 갱신 (신규 형식 반영) | 5.3 | 20-30 |
| 5.5 | Phase 5 종료 + 프로젝트 종료 (current_phase=6, 스케줄 self-delete) | 5.1-5.4 | 15-20 |

---

## 1. Conventions

### 1.1 산출물 파일

- `js/subtypes-27-data.js` — `SUBTYPES_27` 객체 (key 는 `sp_1`, `so_1`, `sx_1`, ..., `sx_9`). 각 entry 7 슬롯 + 메타.
- `js/test-result-renderer.js` — `renderResultCards(phase3Result, container)` 함수. window.TestResultRenderer 노출.
- `js/test.js` 의 renderResultFromScores 안에서 `window.TestResultRenderer.renderResultCards` 호출.

### 1.2 SUBTYPES_27 데이터 스키마

```js
{
  sp_1: {
    coreType: 1,
    instinct: 'sp',
    name: 'Worry',
    nameKr: '자기보호 1',
    countertype: false,
    preoccupation: '<핵심 집착, 1-2 문장>',
    defense: '<방어 패턴, 1-2 문장>',
    signatures: ['<시그니처 1>', '<시그니처 2>', '<시그니처 3>'],
    shadow: '<그림자/맹점, 1-2 문장>',
    sisterDifferences: { so_1: '...', sx_1: '...' },  // 같은 코어의 다른 두 subtype
    confusedWith: '<자주 헷갈리는 다른 코어 type 설명>',
    seedWords: ['<시드 1>', '<시드 2>', ...],
    description: '<한국어 결과지 카피 한 단락, 4-6 줄>',
  },
  // ... 26 more
}
```

### 1.3 락/HISTORY/commit (Phase 1-4 와 동일)

[HANDOFF.md](./HANDOFF.md) protocol. commit 메시지 — `<type>(enneagram-result): <description>`.

### 1.4 Regression 안전 기준

매 commit 후.
- `node docs/_meta/enneagram/verify.mjs all` OK
- `node --test tests/test-scoring.test.mjs` 26/26 통과 유지

---

## 2. Task 5.0 — Phase 5 plan + verify.mjs spec

**Files:**
- Modify: `docs/_meta/enneagram/PHASE_5_PLAN.md` (placeholder → 실제 plan, 이 파일)
- Modify: `docs/_meta/enneagram/verify.mjs` (TASK_FILE_SPECS 5.0-5.4 추가)
- Modify: `docs/_meta/enneagram/WORK_STATUS.md`
- Modify: `docs/_meta/enneagram/HISTORY.md`

**Definition of Done:**
- [ ] PHASE_5_PLAN.md 실제 plan 으로 채워짐
- [ ] verify.mjs 의 TASK_FILE_SPECS 에 5.0-5.4 entry
- [ ] WORK_STATUS — `current_task = "5.1"`, lock 해제
- [ ] HISTORY — 5.0 start + complete

### Steps

- [ ] **Step 5.0.1: PHASE_5_PLAN.md 작성** — 본 파일.

- [ ] **Step 5.0.2: verify.mjs 의 TASK_FILE_SPECS 갱신**

```javascript
  '5.0': [
    { path: 'docs/_meta/enneagram/PHASE_5_PLAN.md', minLines: 100, maxLines: 800 },
  ],
  '5.1': [
    { path: 'js/subtypes-27-data.js', minLines: 250, maxLines: 1200, requireOurFrontmatter: false },
  ],
  '5.2': [
    { path: 'js/test-result-renderer.js', minLines: 50, maxLines: 300, requireOurFrontmatter: false },
  ],
  '5.3': [
    { path: 'test.html', minLines: 150, maxLines: 500, requireOurFrontmatter: false },
  ],
  '5.4': [
    { path: 'js/test.js', minLines: 950, maxLines: 1200, requireOurFrontmatter: false },
  ],
```

- [ ] **Step 5.0.3: Commit + WORK_STATUS + HISTORY**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-result): write Phase 5 plan + register verify specs"
```

WORK_STATUS — `current_task = "5.1"`, 락 해제. HISTORY 에 complete.

---

## 3. Task 5.1 — `js/subtypes-27-data.js`

**Files:**
- Create: `js/subtypes-27-data.js`

**Inputs:**
- [subtypes_27.md](../../knowledge_base/enneagram/complete_enneagram/subtypes_27.md) — 829 줄 모든 27 subtype + 9 type meta + arrows + wings.

**Definition of Done:**
- [ ] 250-1200 줄
- [ ] `SUBTYPES_27` 객체 — 27 entry (sp_1~sx_9)
- [ ] 각 entry 7 슬롯 (preoccupation, defense, signatures[3], shadow, sisterDifferences, confusedWith, seedWords[5+], description)
- [ ] 9 countertype 의 `countertype: true`
- [ ] window.SubtypesData / module.exports
- [ ] verify.mjs 5.1 통과

### Steps

- [ ] **Step 5.1.1: 락 + checkpoint_plan**

`checkpoint_plan = ["5.1.1", "5.1.2", "5.1.3"]`.

- [ ] **Step 5.1.2: 파일 작성**

`subtypes_27.md` 의 각 subtype 섹션을 JS 객체로 옮긴다. 27 entries 모두. 각 entry 분량 약 25-40 줄. 총 700-1000 줄 예상.

작성 패턴 (sp_1 예시).

```javascript
sp_1: {
  coreType: 1,
  instinct: 'sp',
  name: 'Worry',
  nameKr: '자기보호 1',
  countertype: false,
  preoccupation: '실수와 책임 미달에 대한 내면 압력. 일상의 작은 부정확함도 점검하고 정리해야 마음이 놓임.',
  defense: 'Reaction Formation 이 내면화되어, 분노가 "걱정/긴장/책임감" 으로 변형됨. 책임 영역 내의 모든 것을 통제하려 함.',
  signatures: [
    '일상 루틴, 청결, 정리정돈, 시간 엄수에 강한 집착.',
    '마감 전 반복 점검, 자기 검토 루프가 길어 비효율 위험.',
    '자기 비판이 강하고 죄책감이 자주 작동.',
  ],
  shadow: '분노의 직접 표현을 잘 못 봄. 본인은 "걱정" 으로 느끼지만 외부에는 짜증/긴장으로 전달됨. 자기를 너무 채찍질하다 번아웃.',
  sisterDifferences: {
    so_1: 'sp_1 은 자기 영역의 정확성, so_1 은 외부 모범/가르침.',
    sx_1: 'sp_1 은 내면화된 걱정, sx_1 은 강렬한 외부 개혁 충동.',
  },
  confusedWith: 'Type 6 (sp_6 Warmth). 차이 — sp_1 은 실수/잘못됨에 초점, sp_6 은 외부 위험/신뢰에 초점.',
  seedWords: ['점검', '걱정', '책임', '준비', '실수 두려움', '자기 채찍질', '일상 정확'],
  description: '당신은 일상의 작은 부정확함도 그대로 두기 어렵다고 느끼는 편입니다. 책임 영역 안에서 잘못된 부분이 보이면 빠르게 정리하고 싶다는 압력이 작동하고, 다 정리되었다는 감각이 들 때 비로소 마음이 놓입니다. 이 자질은 약속을 지키고 신뢰받는 사람이 되는 데 큰 힘이 되지만, 자기에게 너무 엄격해 번아웃으로 이어질 때가 있습니다. 분노가 "걱정" 의 형태로 작동한다는 점을 알아차리는 것이 성장의 첫 걸음입니다.',
},
```

27 subtype 모두 작성. 헤더에서 데이터 source — `subtypes_27.md` 의 해당 섹션. 9 countertype (sx_1, sp_2/3/4, sx_5/6, so_7/8/9) 의 `countertype: true`.

파일 마지막 export.

```javascript
const SubtypesData = { SUBTYPES_27 };
if (typeof module !== 'undefined' && module.exports) module.exports = SubtypesData;
if (typeof window !== 'undefined') window.SubtypesData = Object.assign(window.SubtypesData || {}, SubtypesData);
```

- [ ] **Step 5.1.3: Verify + commit**

```bash
node -e 'const m = require("./js/subtypes-27-data.js"); const keys = Object.keys(m.SUBTYPES_27); console.log("count:", keys.length); const ct = keys.filter((k) => m.SUBTYPES_27[k].countertype); console.log("countertypes:", ct);'
```

기대 — `count: 27` + `countertypes: ['sx_1', 'sp_2', 'sp_3', 'sp_4', 'sx_5', 'sx_6', 'so_7', 'so_8', 'so_9']`.

```bash
node docs/_meta/enneagram/verify.mjs 5.1
git add js/subtypes-27-data.js
git commit -m "feat(enneagram-result): add subtypes-27-data.js with 27 subtype profiles (Phase 5.1)"
```

WORK_STATUS — `current_task = "5.2"`, 락 해제.

---

## 4. Task 5.2 — `js/test-result-renderer.js`

**Files:**
- Create: `js/test-result-renderer.js`

**Inputs:**
- `js/subtypes-27-data.js` (Task 5.1)
- `js/test-scoring.js` (Phase 3, phase3Result 형식)

**Definition of Done:**
- [ ] 50-300 줄 신규 파일
- [ ] `renderResultCards(phase3Result, container)` 함수 — phase3Result 의 subtype lookup, HTML 카드 5개 생성 (Profile, Defense+Signatures, Shadow+SisterDiff, Confusion, Description) + countertype 시 추가 안내 카드
- [ ] `escapeHtml(s)` 헬퍼 (XSS 안전)
- [ ] window.TestResultRenderer / module.exports
- [ ] verify.mjs 5.2 통과

### Steps

- [ ] **Step 5.2.1: 락 + checkpoint_plan**

`checkpoint_plan = ["5.2.1", "5.2.2", "5.2.3"]`.

- [ ] **Step 5.2.2: 파일 작성**

```javascript
// ER 에니어그램 테스트 결과 카드 렌더러 (Phase 5)
// phase3Result 의 subtype 으로 SUBTYPES_27 lookup → 결과지 카드 HTML 생성.

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// phase3Result — { coreType, wing, instinctPct, dominantInstinct, subtype, countertype, formatted }
// container — DOM element
function renderResultCards(phase3Result, container) {
  if (!phase3Result || !container) return;
  const data = (typeof window !== 'undefined' && window.SubtypesData && window.SubtypesData.SUBTYPES_27) ||
    (typeof require !== 'undefined' ? require('./subtypes-27-data.js').SUBTYPES_27 : null);
  if (!data) { container.innerHTML = ''; return; }
  const subtype = data[phase3Result.subtype];
  if (!subtype) { container.innerHTML = ''; return; }

  const ctWarning = phase3Result.countertype ? `
    <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-2xl mt-4">
      <h3 class="font-bold text-amber-800 mb-2 text-sm">⚠️ Countertype 안내</h3>
      <p class="text-sm text-amber-900 leading-relaxed">${escapeHtml(subtype.nameKr)} (${escapeHtml(subtype.name)}) 은 일반적인 ${phase3Result.coreType}번 stereotype 과 표면적으로 다르게 보일 수 있는 <strong>countertype</strong> 입니다. 자기 type 을 다른 type 으로 잘못 진단할 가능성이 있으니 결과 검토 시 주의해주세요.</p>
    </div>` : '';

  const sigList = (subtype.signatures || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sisterEntries = subtype.sisterDifferences || {};
  const sisterList = Object.entries(sisterEntries).map(([k, v]) => `<li><strong>vs ${escapeHtml(k)}</strong> — ${escapeHtml(v)}</li>`).join('');
  const seedStr = (subtype.seedWords || []).map(escapeHtml).join(' · ');

  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div>
        <h2 class="text-2xl font-bold text-[#4a4540] mb-1">${escapeHtml(subtype.nameKr)}</h2>
        <p class="text-sm text-gray-500">${escapeHtml(subtype.name)} ${subtype.countertype ? '(countertype)' : ''} · Type ${phase3Result.coreType}</p>
      </div>
      <p class="text-base text-gray-800 leading-relaxed">${escapeHtml(subtype.description)}</p>
      <p class="text-xs text-gray-400 italic">${escapeHtml(seedStr)}</p>
    </div>
    ${ctWarning}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">핵심 집착</h3>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(subtype.preoccupation)}</p>
      </div>
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">방어 패턴</h3>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(subtype.defense)}</p>
      </div>
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">행동 시그니처</h3>
        <ul class="text-sm text-gray-700 leading-relaxed list-disc list-inside space-y-1">${sigList}</ul>
      </div>
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">그림자 / 맹점</h3>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(subtype.shadow)}</p>
      </div>
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">같은 코어의 다른 subtype</h3>
        <ul class="text-sm text-gray-700 leading-relaxed space-y-1">${sisterList}</ul>
      </div>
      <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <h3 class="font-bold text-[#4a4540] mb-2 text-sm uppercase tracking-wide">자주 헷갈리는 type</h3>
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(subtype.confusedWith)}</p>
      </div>
    </div>
  `;
}

const TestResultRenderer = { renderResultCards, escapeHtml };
if (typeof module !== 'undefined' && module.exports) module.exports = TestResultRenderer;
if (typeof window !== 'undefined') window.TestResultRenderer = Object.assign(window.TestResultRenderer || {}, TestResultRenderer);
```

- [ ] **Step 5.2.3: Verify + commit**

```bash
node docs/_meta/enneagram/verify.mjs 5.2
git add js/test-result-renderer.js
git commit -m "feat(enneagram-result): add result renderer with subtype lookup + 6 cards (Phase 5.2)"
```

WORK_STATUS — `current_task = "5.3"`, 락 해제.

---

## 5. Task 5.3 — Wiring (test.html + test.js)

**Files:**
- Modify: `test.html` — 신규 컨테이너 + script 로드
- Modify: `js/test.js` — phase3Result 후 renderer 호출

**Definition of Done:**
- [ ] test.html 에 `<div id="res-subtype-detail"></div>` 컨테이너 추가
- [ ] test.html 에 `<script src="js/subtypes-27-data.js">` + `<script src="js/test-result-renderer.js">` 추가 (test.js 보다 앞)
- [ ] js/test.js 의 renderResultFromScores 가 phase3Result 산출 후 `window.TestResultRenderer.renderResultCards(phase3Result, container)` 호출
- [ ] 26/26 unit test 통과 유지
- [ ] verify.mjs 5.3 통과

### Steps

- [ ] **Step 5.3.1: 락 + checkpoint_plan**

`checkpoint_plan = ["5.3.1", "5.3.2", "5.3.3", "5.3.4"]`.

- [ ] **Step 5.3.2: test.html 갱신**

기존 `<div id="res-top3" ...>` 다음 (또는 같은 grid 다음 빈 줄) 에 컨테이너 추가.

```html
          <div id="res-subtype-detail" class="space-y-4"></div>
```

기존 script 로드.

```html
  <script src="js/test-shared.js"></script>
  <script src="js/test-scoring.js"></script>
  <script src="js/test.js"></script>
```

다음으로 갱신 (subtypes-27-data + test-result-renderer 추가).

```html
  <script src="js/test-shared.js"></script>
  <script src="js/test-scoring.js"></script>
  <script src="js/subtypes-27-data.js"></script>
  <script src="js/test-result-renderer.js"></script>
  <script src="js/test.js"></script>
```

- [ ] **Step 5.3.3: js/test.js 와이어링**

기존 phase3Result 핸들링 블록 (이미 존재) 직후, `subtypeEl.innerText = ...` 다음에 추가.

```javascript
  // Phase 5 — subtype detail 카드 렌더 (있으면)
  const subtypeDetailEl = document.getElementById('res-subtype-detail');
  if (subtypeDetailEl && phase3Result && window.TestResultRenderer && window.TestResultRenderer.renderResultCards) {
    try { window.TestResultRenderer.renderResultCards(phase3Result, subtypeDetailEl); }
    catch (_e) { /* graceful */ }
  }
```

- [ ] **Step 5.3.4: Verify + commit**

```bash
node --test tests/test-scoring.test.mjs
node docs/_meta/enneagram/verify.mjs 5.3
git add test.html js/test.js
git commit -m "feat(enneagram-result): wire renderer into test.html + test.js (Phase 5.3)"
```

WORK_STATUS — `current_task = "5.4"`, 락 해제.

---

## 6. Task 5.4 — PDF + 공유 텍스트 갱신

**Files:**
- Modify: `js/test.js` — `shareTestResult` 함수 의 shareText, PDF title

**Inputs:** `js/test.js` shareTestResult 함수.

**Definition of Done:**
- [ ] shareText 가 phase3Result.formatted (있으면) 사용
- [ ] PDF 파일명에 phase3Result.subtype 반영
- [ ] verify.mjs 5.4 통과

### Steps

- [ ] **Step 5.4.1: 락 + checkpoint_plan**

`checkpoint_plan = ["5.4.1", "5.4.2", "5.4.3"]`.

- [ ] **Step 5.4.2: shareTestResult + PDF 파일명 갱신**

`js/test.js` 의 `shareTestResult` 함수 안에서 `typeResult` 산출 부분 갱신. 기존.

```javascript
  const typeResult = finalEl.innerText.trim();
```

는 이미 phase3Result.formatted 가 들어있는 상태이므로 그대로 OK. 변경 X.

PDF 파일명 (line ~470 부근).

기존.
```javascript
    const title = (document.getElementById('res-final')?.innerText || 'result').replace(/\s+/g, '_');
```

다음으로 변경 (countertype 표기 제거 + 공백 정리).

```javascript
    const titleRaw = (document.getElementById('res-final')?.innerText || 'result');
    const title = titleRaw.replace(/[()%\s]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
```

이렇게 하면 `7 w8(50%) sx(80%) so(60%) sp(10%)` → `7_w8_50_sx_80_so_60_sp_10` (PDF 파일명에 안전).

- [ ] **Step 5.4.3: Verify + commit**

```bash
node --test tests/test-scoring.test.mjs
node docs/_meta/enneagram/verify.mjs 5.4
git add js/test.js
git commit -m "feat(enneagram-result): update PDF filename + share text for new format (Phase 5.4)"
```

WORK_STATUS — `current_task = "5.5"`, 락 해제.

---

## 7. Task 5.5 — Phase 5 종료 + 프로젝트 종료

**Files:**
- Modify: `docs/_meta/enneagram/WORK_STATUS.md` (current_phase = 6)
- Modify: `docs/_meta/enneagram/HISTORY.md` (Phase 5 + Project complete)

**Inputs:** 모든 Phase 1-5 산출물.

**Definition of Done:**
- [ ] `node docs/_meta/enneagram/verify.mjs all` OK
- [ ] `node --test tests/test-scoring.test.mjs` 26/26 pass
- [ ] WORK_STATUS — `current_phase = 6`, `current_task = null` 또는 `"done"`
- [ ] HISTORY — Phase 5 complete + "Project complete" 한 줄
- [ ] (선택) 스케줄 task 수동 삭제 안내

### Steps

- [ ] **Step 5.5.1: 전체 verify + tests**

```bash
node docs/_meta/enneagram/verify.mjs all
node --test tests/test-scoring.test.mjs
```

- [ ] **Step 5.5.2: WORK_STATUS Phase 5 종료**

`current_phase = 6`, `current_task = "done"`, `last_updated = now`. 본문에 "프로젝트 종료" 표기.

- [ ] **Step 5.5.3: HISTORY Project complete 추가**

```markdown
| <ISO> | claude-manual-bootstrap | phase_5 | complete | - | **Phase 5 (Result Output Format) 완료.** subtypes-27-data.js (27 entry × 7 슬롯) + test-result-renderer.js (lookup + 6 카드) + test.html/test.js 와이어링 + PDF/공유 갱신. |
| <ISO> | claude-manual-bootstrap | project | complete | - | **🎉 ER Enneagram Test 발전 프로젝트 종료.** 5 phase 완료, 6000+ 줄 산출. 결과지에 27 subtype × 7 슬롯 깊이 콘텐츠 lookup, wing/instinct % 시각화, countertype 안내, PDF/공유 갱신 모두 통합. |
```

- [ ] **Step 5.5.4: Final commit**

```bash
git add docs/_meta/enneagram/
git commit -m "chore(enneagram-result): close Phase 5, complete ER Enneagram Test development project"
```

- [ ] **Step 5.5.5: 사용자 안내**

스케줄 task `er-enneagram-auto-resume` 는 `current_phase >= 6` 을 감지해 wakeup 시 즉시 종료하므로 비용 0. 사용자가 원하면 수동 삭제 — `mcp__scheduled-tasks__delete_scheduled_task` 또는 Claude UI 에서 삭제.

---

## 8. Self-Review

- [x] 모든 task self-contained
- [x] No placeholders
- [x] Phase 3 unit tests 통과 유지 보장
- [x] 27 subtype 깊이 콘텐츠 lookup → 결과지 노출
- [x] countertype 안내 카드 명시
- [x] PDF/공유 신규 형식 반영
- [x] 프로젝트 종료 protocol (current_phase = 6) 명시
- [x] CLAUDE.md rule 준수 (한국어 헤더, 콜론 끝 X, 세만틱 commit)
