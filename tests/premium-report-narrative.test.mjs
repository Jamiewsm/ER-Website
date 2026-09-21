// 단어·서사형 검사 결과지의 후보 비교, 미확정 해석, 주관식 제거와 제출 연결을 검증한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const testSource = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');
const contentSource = readFileSync(new URL('../js/diagnostic-report-content.js', import.meta.url), 'utf8');
const experimentSource = readFileSync(new URL('../js/diagnostic-experiment.js', import.meta.url), 'utf8');

class FakeElement {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this.value = '';
    this.dataset = {};
    this.style = {};
    this.attributes = new Map();
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force) {
        const enabled = force === undefined ? !classes.has(name) : force;
        if (enabled) classes.add(name); else classes.delete(name);
        return enabled;
      }
    };
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) || null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener() {}
  appendChild() {}
  removeChild() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  focus() {}
}

function loadReport() {
  const elements = new Map();
  const storage = new Map();
  const experimentResults = [];
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };
  const sessionStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  };
  const document = {
    documentElement: new FakeElement('html'),
    body: new FakeElement('body'),
    head: new FakeElement('head'),
    readyState: 'complete',
    getElementById: getElement,
    createElement: (tag) => new FakeElement(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const window = {
    location: { search: '' },
    sessionStorage,
    addEventListener() {},
    scrollTo() {},
    ERReportSupportMaterials: null,
    ERDiagnosticExperiment: { onResultReady: (result) => experimentResults.push(result) }
  };
  window.parent = window;
  const context = vm.createContext({
    document, window, sessionStorage,
    localStorage: sessionStorage,
    navigator: {},
    URLSearchParams,
    console,
    setTimeout: () => 0,
    clearTimeout() {},
    requestAnimationFrame: () => 0
  });
  vm.runInContext(contentSource, context, { filename: 'js/diagnostic-report-content.js' });
  vm.runInContext(testSource, context, { filename: 'js/test.js' });
  return { context, getElement, experimentResults };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function screeningFixture(candidates = [4, 6, 7, 9]) {
  return {
    version: 'word-narrative-v2',
    candidates,
    unclear: false,
    ranked: candidates.map((type) => ({ type, yes: 6, unsure: 2, no: 1, score: 6 }))
  };
}

function reportFixture(overrides = {}) {
  return {
    assessmentVersion: 'word-narrative-v2',
    core: 4,
    coreResolved: true,
    coreDisplay: '4번',
    final: { 1: 0, 2: 0, 3: 0, 4: 24, 5: 0, 6: 8, 7: 4, 8: 0, 9: 0 },
    second: { type: 6, score: 8 },
    diff: 2 / 3,
    confidence: '보통',
    candidateTypes: [4, 6, 7],
    screening: screeningFixture([4, 6, 7]),
    narrativeMeta: { totalPairs: 3, answeredPairs: 3, totalQuestions: 6, decisiveAnswers: 3 },
    evidence: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, []])),
    phase4: null,
    instinctCode: null,
    instinctLabel: '하위유형 추가 확인 필요',
    instinctMetrics: [],
    instinctPct: { sp: 0, so: 0, sx: 0 },
    wingNum: null,
    wing: '날개 추가 확인 필요',
    wingCode: '4번 · 날개 확인 중',
    wingMetrics: [],
    recentStress: 0,
    tb7w6: 0,
    tb7w8: 0,
    sxBoost: 0,
    ...overrides
  };
}

test('complete reports discard stale narrative reflection from old payloads', () => {
  const { context, getElement } = loadReport();
  context.model = reportFixture({ narrativeReflection: '<script>privateReflection</script>' });
  vm.runInContext('renderPremiumReport(buildPremiumReportModel(model))', context);
  const html = getElement('result-view').innerHTML;
  assert.match(html, /id="report-screening"/);
  assert.doesNotMatch(html, /report-reflection|privateReflection|<textarea/);
});

test('four candidate comparison uses all four narrative scores and excludes noncandidates', () => {
  const { context } = loadReport();
  context.model = {
    candidateTypes: [4, 6, 7, 9],
    screening: screeningFixture(),
    final: { 4: 40, 6: 30, 7: 20, 9: 10, 2: 999 }
  };
  const html = vm.runInContext('renderScreeningSummary(model)', context);
  const rows = [...html.matchAll(/<h3>(\d)번<\/h3>[\s\S]*?<strong>(\d+)%<\/strong>/g)];
  assert.deepEqual(rows.map((match) => [Number(match[1]), Number(match[2])]), [[4, 40], [6, 30], [7, 20], [9, 10]]);
  assert.equal(rows.reduce((sum, match) => sum + Number(match[2]), 0), 100);
  assert.doesNotMatch(html, /<h3>2번<\/h3>/);
  assert.match(html, /예 6 \/ 모르겠다 2 \/ 아니요 1/);
  assert.match(html, /유형일 확률이 아닙니다/);
});

test('empty narrative evidence is shown as insufficient evidence without fabricated percentages', () => {
  const { context } = loadReport();
  context.model = { screening: screeningFixture(), final: {}, candidateTypes: [4, 6, 7, 9] };
  const html = vm.runInContext('renderScreeningSummary(model)', context);
  assert.equal((html.match(/<strong>비교 근거 부족<\/strong>/g) || []).length, 4);
  assert.doesNotMatch(html, /NaN|Infinity|<strong>0%<\/strong>/);
});

test('pending subtype and wing stay explicit while the headline remains concise', () => {
  const { context } = loadReport();
  context.model = reportFixture();
  const model = vm.runInContext('buildPremiumReportModel(model)', context);
  assert.equal(model.subtypeCode, null);
  assert.equal(model.subtypePending, true);
  assert.equal(model.selectedWing, null);
  assert.equal(model.content.subtype, null);
  assert.match(model.reportKey, /^pending_4$/);
  assert.equal(model.display.headline, '4번');
  assert.match(model.display.subtype, /하위유형 추가 확인 필요/);
  assert.match(model.display.wing, /추가 확인 필요/);
  assert.doesNotMatch(JSON.stringify(model.display), /자기보존|순수유형|pure core/);
  assert.match(model.confidenceExplanation.summary, /검증된 정확도를 뜻하지 않습니다/);
  assert.equal(vm.runInContext("formatReportHeadline({ assessmentVersion: 'word-narrative-v2', core: 4, wingNum: 5, instinctLabel: '사회적', phase4: { subtypeCode: 'so' } })", context), '4w5 · 사회적');
});

test('core-only content contains the actual core material without a fallback subtype identity', () => {
  const { context } = loadReport();
  const api = context.window.ERDiagnosticReportContent;
  for (let core = 1; core <= 9; core += 1) {
    const content = api.getCoreContent(core, null);
    const original = api.cores[core];
    assert.equal(content.core, core);
    assert.equal(content.key, `core_${core}`);
    assert.equal(content.subtype, null);
    assert.equal(content.definition, original.definition);
    assert.equal(content.formation, original.formation);
    assert.deepEqual(plain(content.actionPlan), plain(original.recovery.slice(0, 2)));
    assert.equal(content.synthesis.paragraph, original.definition);
    assert.match(content.subtypeLabel, /추가 확인 필요/);
    assert.doesNotMatch(content.fallbackKey || '', /^(sp|so|sx)_/, `type ${core} must not retain a subtype fallback key`);
    assert.doesNotMatch(JSON.stringify(content.synthesis), /자기보존|사회적 본능|성적\/일대일/);
  }
  assert.equal(api.getCoreContent(99, null), null);
});

test('phase 4 charts reflect three direct votes including unsure answers in the denominator', () => {
  const { context, experimentResults } = loadReport();
  context.input = reportFixture({
    phase4: {
      subtypeCode: 'sx', subtypeLabel: '성적(일대일)', wingNum: 5,
      subtypeVotes: { sp: 0, so: 0, sx: 2 },
      wingVotes: { 3: 0, 5: 2 }
    }
  });
  vm.runInContext('renderResultFromScores(input)', context);
  assert.equal(experimentResults.length, 1);
  const result = experimentResults[0];
  const sx = result.instinctMetrics.find((row) => row.code === 'sx');
  const wing5 = result.wingMetrics.find((row) => row.wing === 5);
  assert.equal(sx.score, 2);
  assert.ok(Math.abs(sx.percent - 200 / 3) < 1e-9);
  assert.ok(Math.abs(wing5.percent - 200 / 3) < 1e-9);
  assert.ok(result.instinctMetrics.reduce((sum, row) => sum + row.percent, 0) < 100, 'unsure must not turn two votes into 100%');
  context.metrics = result;
  const model = vm.runInContext('buildPremiumReportModel({ ...input, instinctCode: "sx", instinctMetrics: metrics.instinctMetrics, wingMetrics: metrics.wingMetrics })', context);
  assert.ok(Math.abs(model.instinctRows.find((row) => row.code === 'sx').percent - 200 / 3) < 1e-9, 'the model must not renormalize direct vote percentages');
  assert.equal(model.instinctRows.find((row) => row.code === 'sp').active, false);
});

test('complete report with unresolved subtype and wing never presents sp or pure core by default', () => {
  const { context, getElement, experimentResults } = loadReport();
  context.input = reportFixture({ phase4: { subtypeCode: null, wingNum: null, subtypeVotes: { sp: 1, so: 1, sx: 1 }, wingVotes: { 3: 1, 5: 1 } } });
  vm.runInContext('renderResultFromScores(input)', context);
  const html = getElement('result-view').innerHTML;
  assert.match(html, /하위유형 추가 확인 필요/);
  assert.match(html, /날개 추가 확인 필요/);
  assert.doesNotMatch(html, /순수유형|pure core|자기보존 4번/);
  assert.equal(experimentResults[0].reportKey, 'pending_4');
});

test('low evidence result keeps candidate comparison and submission without stale free text', () => {
  const { context, getElement, experimentResults } = loadReport();
  const reflection = '<script>alert(1)</script> 나의 기록' + '가'.repeat(700);
  getElement('narrative-reflection').value = reflection;
  context.input = reportFixture({
    final: { 1: 0, 2: 0, 3: 0, 4: 10, 5: 0, 6: 10, 7: 10, 8: 0, 9: 10 },
    candidateTypes: [4, 6, 7, 9],
    screening: screeningFixture(),
    narrativeMeta: { totalPairs: 6, totalQuestions: 12, decisiveAnswers: 0 }
  });
  vm.runInContext('renderResultFromScores(input)', context);
  const html = getElement('result-view').innerHTML;
  assert.match(html, /er-report-gate/);
  assert.match(html, /id="report-screening"/);
  assert.doesNotMatch(html, /id="report-reflection"/);
  assert.match(html, /id="experiment-result-panel"/);
  assert.doesNotMatch(html, /나의 기록|alert\(1\)/);
  assert.doesNotMatch(html, /<script>/);
  assert.equal((html.match(/class="er-report-screening-row"/g) || []).length, 4);
  assert.equal(experimentResults.length, 1, 'an inconclusive result must still expose the optional experiment submission');
  assert.equal(experimentResults[0].coreResolved, false);
  assert.equal(Object.hasOwn(experimentResults[0], 'narrativeReflection'), false);
  assert.deepEqual(plain(experimentResults[0].screening.candidates), [4, 6, 7, 9]);
});

test('all unsure narratives keep ranked experiment candidates within the shortlist and leave core unresolved', () => {
  const { context, experimentResults } = loadReport();
  context.input = reportFixture({
    final: Object.fromEntries(Array.from({ length: 9 }, (_, index) => [index + 1, 0])),
    candidateTypes: [4, 6, 7, 9],
    screening: screeningFixture(),
    narrativeMeta: { totalPairs: 6, totalQuestions: 12, decisiveAnswers: 0 }
  });
  vm.runInContext('renderResultFromScores(input)', context);
  assert.equal(experimentResults.length, 1);
  const result = experimentResults[0];
  assert.equal(result.coreResolved, false);
  assert.equal(result.core, null, 'an unresolved zero-score tie must not be saved as a core type');
  assert.deepEqual(plain(result.ranked.map((row) => row.type)), [4, 6, 7, 9]);

  vm.runInContext(experimentSource, context, { filename: 'js/diagnostic-experiment.js' });
  const row = context.window.ERDiagnosticExperiment._test.buildRow(
    { participantName: 'Test User', consentAccepted: true }, result, 'ambiguous'
  );
  const payload = plain(row.result_summary.experiment_payload);
  assert.equal(row.result_summary.core, null);
  assert.equal(payload.result.core, null);
  assert.deepEqual(payload.rankedTop3.map((entry) => entry.type), [4, 6, 7]);
  assert.ok(payload.rankedTop3.every((entry) => entry.score === 0 && entry.share === 0));
});

test('resuming after experiment consent restores assessment progress but keeps result progress hidden', () => {
  const { context, getElement } = loadReport();
  getElement('progress-container').classList.add('hidden');
  getElement('phase0-form').classList.add('hidden');
  getElement('result-view').classList.add('hidden');

  vm.runInContext("testState.stage = 'words'; resumeAssessmentAfterGate();", context);
  assert.equal(getElement('phase0-form').classList.contains('hidden'), false);
  assert.equal(getElement('progress-container').classList.contains('hidden'), false);
  assert.equal(getElement('result-view').classList.contains('hidden'), true);

  getElement('phase0-form').classList.add('hidden');
  vm.runInContext("testState.stage = 'result'; resumeAssessmentAfterGate();", context);
  assert.equal(getElement('result-view').classList.contains('hidden'), false);
  assert.equal(getElement('progress-container').classList.contains('hidden'), true);
  assert.equal(getElement('phase0-form').classList.contains('hidden'), true);
});
