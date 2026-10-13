import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const sources = Object.fromEntries(['test', 'diagnostic-report-content', 'report-support-materials', 'diagnostic-experiment']
  .map((name) => [name, readFileSync(new URL(`../js/${name}.js`, import.meta.url), 'utf8')]));

class Element {
  constructor(id = '') {
    Object.assign(this, { id, innerHTML: '', innerText: '', textContent: '', value: '', style: {}, dataset: {}, attributes: {}, listeners: {} });
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force) { const on = force ?? !classes.has(name); if (on) classes.add(name); else classes.delete(name); return on; }
    };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  appendChild() {}
  removeChild() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  focus() {}
}

function load(search = '?lang=en', savedStorage = new Map()) {
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const storage = {
    getItem: (key) => savedStorage.get(key) ?? null,
    setItem: (key, value) => savedStorage.set(key, value),
    removeItem: (key) => savedStorage.delete(key)
  };
  const document = {
    documentElement: new Element('html'), body: new Element('body'), head: new Element('head'), readyState: 'complete',
    getElementById: getElement, createElement: (tag) => new Element(tag),
    querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}
  };
  const shares = [];
  const results = [];
  const window = {
    location: { search }, sessionStorage: storage, addEventListener() {}, scrollTo() {},
    ERDiagnosticExperiment: { onResultReady: (value) => results.push(value) }
  };
  window.parent = window;
  const context = vm.createContext({ window, document, navigator: { share: (value) => { shares.push(value); return Promise.resolve(); } },
    sessionStorage: storage, localStorage: storage, URLSearchParams, console, setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0 });
  for (const name of ['diagnostic-report-content', 'report-support-materials', 'test']) vm.runInContext(sources[name], context);
  const evaluate = (code) => vm.runInContext(code, context);
  return { context, evaluate, getElement, document, results, shares, savedStorage };
}

function assertEnglish(value, context) {
  const korean = String(value).match(/[^<>\n]*[가-힣][^<>\n]*/g);
  assert.equal(korean, null, `${context}: ${korean?.slice(0, 4).join(' | ')}`);
}

function fixture(core, subtype = 'sp', wing = core === 1 ? 9 : core - 1) {
  const alternatives = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((type) => type !== core).slice(0, 2);
  const candidates = [core, ...alternatives];
  const final = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [index + 1, index + 1 === core ? 4 : candidates.includes(index + 1) ? 1 : 0]));
  const subtypeVotes = { sp: 0, so: 0, sx: 0 };
  if (subtype) subtypeVotes[subtype] = 2;
  return {
    assessmentVersion: 'word-narrative-v2', core, coreResolved: true, coreDisplay: `Type ${core}`, final,
    second: { type: alternatives[0], score: 1 }, diff: .75, confidence: '보통',
    phase4: { subtypeCode: subtype, subtypeLabel: { sp: 'Self-preservation', so: 'Social', sx: 'One-to-one' }[subtype] || '', subtypeVotes, wingNum: wing, wingVotes: { [wing]: 2 } },
    instinctCode: subtype, instinctLabel: { sp: 'Self-preservation', so: 'Social', sx: 'One-to-one' }[subtype] || 'Subtype needs more observation',
    wingNum: wing, wing: wing ? `Wing ${wing}` : 'Wing needs further observation', wingCode: wing ? `${core}w${wing}` : `Type ${core} · Wing pending`,
    top3: candidates.map((type) => ({ type, score: final[type] })), top3Total: 6,
    candidateTypes: candidates,
    screening: { candidates, ranked: candidates.map((type) => ({ type, yes: 6, no: 1, unsure: 2 })) },
    instinctPct: { sp: subtypeVotes.sp / 3 * 100, so: subtypeVotes.so / 3 * 100, sx: subtypeVotes.sx / 3 * 100 },
    instinctMetrics: ['sp', 'so', 'sx'].map((code) => ({ code, label: { sp: 'Self-preservation', so: 'Social', sx: 'One-to-one' }[code], score: subtypeVotes[code], percent: subtypeVotes[code] / 3 * 100 })),
    wingMetrics: [{ wing, label: `${core}w${wing}`, score: 2, percent: 2 / 3 * 100 }],
    evidence: {}, responses: {}, responseQuality: { level: 'good', flags: [], metrics: {} }
  };
}

function render(runtime, data) {
  runtime.context.data = data;
  runtime.evaluate('window.renderPremiumReport(window.buildPremiumReportModel(data))');
  return runtime.getElement('result-view').innerHTML;
}

test('all 27 English subtype reports and 18 wing variations contain English content and accessible UI', () => {
  const runtime = load('?lang=en&audience=parent&childType=4&hasChildren=1&hasMultipleChildren=1&includeChildMaterials=1');
  for (let core = 1; core <= 9; core++) {
    const wings = [core === 1 ? 9 : core - 1, core === 9 ? 1 : core + 1];
    for (const subtype of ['sp', 'so', 'sx']) {
      for (const wing of wings) {
        const html = render(runtime, fixture(core, subtype, wing));
        assertEnglish(html, `${subtype}_${core}w${wing}`);
        assert.match(html, /ER Enneagram Narrative Report/);
        assert.match(html, /not the probability of being a type/);
        assert.match(html, /Core type, wing, and subtype/);
        assert.doesNotMatch(html, /will be added in a later version|lang-notice/);
      }
    }
  }
});

test('English pending subtype and wing reports retain real core content without inventing a subtype', () => {
  const runtime = load();
  for (let core = 1; core <= 9; core++) {
    const data = fixture(core, null, null);
    const html = render(runtime, data);
    assertEnglish(html, `pending_${core}`);
    assert.match(html, /needs (?:more|further) observation/);
    assert.match(html, new RegExp(`>Type ${core}<`));
    runtime.context.data = data;
    assert.equal(runtime.evaluate('window.buildPremiumReportModel(data).subtypeCode'), null);
  }
});

test('English low-confidence gate, clarification summary, quality signals, and consultation questions are localized', () => {
  const runtime = load();
  runtime.context.data = fixture(6, null, null);
  runtime.context.data.responseQuality = {
    level: 'low', flags: [{ code: 'unknown_overuse', label: 'Many uncertain responses' }], metrics: { centerCoreAligned: false }
  };
  runtime.context.data.stateStressAdjustment = { applied: true };
  runtime.context.data.screening.needsClarification = true;
  runtime.evaluate('renderLowConfidenceGate(window.buildPremiumReportModel(data))');
  assertEnglish(runtime.getElement('result-view').innerHTML, 'low confidence gate');
  assert.match(runtime.getElement('result-view').innerHTML, /Book a typing consultation/);
  const quality = runtime.evaluate(`buildResponseQualitySnapshot({ responses: Object.fromEntries(Array.from({length: 20}, (_, i) => ['narrative_' + i, i < 8 ? 'U' : 'A'])), timings: {answeredCount: 20, avgSecondsPerAnswered: 1}, ranked: [{type: 6, score: 4}], instinctPct: {sp: 20, so: 20, sx: 20}, confidence: '보통', assessmentVersion: 'word-narrative-v2' })`);
  assertEnglish(JSON.stringify(quality), 'response quality');
  runtime.context.quality = quality;
  for (const core of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const explanation = runtime.evaluate(`buildConfidenceExplanation({core: ${core}, second: {type: ${core === 9 ? 1 : core + 1}}, confidence: '낮음', diff: .03, responseQuality: quality, instinctPct: {sp: 20, so: 20, sx: 20}, stateStressAdjustment: {applied: true}})`);
    assertEnglish(JSON.stringify(explanation), `confidence ${core}`);
  }
});

test('English subtype and wing behavior questions preserve three distinct observations and the Korean scoring definitions', () => {
  const en = load();
  const ko = load('');
  for (let core = 1; core <= 9; core++) {
    const englishSubtype = en.evaluate(`buildSubtypeBehaviorQuestions(${core})`);
    const koreanSubtype = ko.evaluate(`buildSubtypeBehaviorQuestions(${core})`);
    assert.equal(new Set(englishSubtype.map((q) => q.qEn)).size, 3);
    for (const code of ['sp', 'so', 'sx']) assert.equal(new Set(englishSubtype.map((q) => q.options.find((option) => option.value === code).textEn)).size, 3);
    assert.deepEqual(JSON.parse(JSON.stringify(englishSubtype)), JSON.parse(JSON.stringify(koreanSubtype)));
    const wings = en.evaluate(`buildWingQuestionSet(${core})`);
    for (const field of ['aEn', 'bEn']) assert.equal(new Set(wings.map((q) => q[field])).size, 3);
    assertEnglish(wings.map((q) => [q.qEn, q.aEn, q.bEn].join(' ')).join(' '), `wing questions ${core}`);
    assertEnglish(englishSubtype.map((q) => [q.qEn, ...q.options.map((option) => option.textEn)].join(' ')).join(' '), `subtype questions ${core}`);
  }
});

test('English result integration localizes wing, report evidence, final summary, and persisted context without changing scores', () => {
  for (const lang of ['en', 'ko']) {
    const runtime = load(lang === 'en' ? '?lang=en' : '');
    runtime.evaluate(`testState.candidateTypes = [1, 6, 9]; testState.phase2Questions = buildNarrativeQuestions(testState.candidateTypes);
      testState.narrativeResponses = Object.fromEntries(testState.phase2Questions.map((q) => [q.id, q.narrativePair ? (q.leftType === 6 ? 'A' : q.rightType === 6 ? 'B' : 'A') : 'sp']));
      testState.screening = { candidates: [1, 6, 9], ranked: [1, 6, 9].map((type) => ({type, yes: 6, no: 1, unsure: 2})) };
      const scored = scoreNarrativeResponses(testState.phase2Questions, testState.narrativeResponses);
      renderResultFromScores({...scored, assessmentVersion: 'word-narrative-v2', candidateTypes: [1, 6, 9], screening: testState.screening, phase4: {subtypeCode: 'sp', subtypeVotes: {sp: 2, so: 1, sx: 0}, wingNum: 5, wingVotes: {5: 2, 7: 1}}});`);
    const html = runtime.getElement('result-view').innerHTML;
    if (lang === 'en') {
      assertEnglish(html, 'integrated English result');
      assertEnglish(runtime.savedStorage.get('er_latest_test_result'), 'persisted English summary');
      assert.match(html, /Wing 5/);
    } else {
      assert.match(html, /핵심 요약/);
      assert.match(html, /5번 날개/);
      assert.match(html, /자기보존/);
    }
    assert.equal(runtime.results[0].final[6], 4);
    assert.equal(runtime.results[0].core, 6);
    assert.equal(runtime.results[0].phase4.subtypeCode, 'sp');
  }
});

test('restoring an English session regenerates translated questions and preserves answers', () => {
  const first = load();
  first.evaluate(`testState.wordResponses = Object.fromEntries(wordScreeningQuestions.map((q) => [q.id, [1, 6, 9].includes(q.type) ? 'Y' : 'N']));
    testState.candidateTypes = [1, 6, 9]; testState.stage = 'narrative';
    testState.narrativeResponses = {narrative_1_6_1: 'B'}; saveAssessmentSession();`);
  const restored = load('?lang=en', first.savedStorage);
  assert.equal(restored.evaluate('testState.narrativeResponses.narrative_1_6_1'), 'B');
  assertEnglish(restored.getElement('phase2-container').innerHTML, 'restored English narrative');
});

test('English experiment consent and feedback preserve the consent flow and translated labels', () => {
  const runtime = load('?lang=en&experiment=1');
  vm.runInContext(sources['diagnostic-experiment'], runtime.context);
  for (const id of ['experiment-gate-title', 'experiment-gate-description', 'experiment-name-label', 'experiment-consent-label', 'experiment-gate-start']) {
    assertEnglish(runtime.getElement(id).textContent, id);
    assert.ok(runtime.getElement(id).textContent.length > 0);
  }
  assert.equal(runtime.getElement('experiment-participant-name').placeholder, 'Your full name');
  runtime.evaluate('window.__ER_DIAGNOSTIC_EXPERIMENT__ = {participantName: "Invited participant", consentAccepted: true}; window.ERDiagnosticExperiment.onResultReady({core: 6, ranked: [{type: 6, score: 4}], top3Total: 4})');
  assertEnglish(runtime.getElement('experiment-result-panel').innerHTML, 'English experiment feedback');
  assert.match(runtime.getElement('experiment-result-panel').innerHTML, /Submit experiment data/);
});

test('English sharing preserves the language in the destination URL', () => {
  const runtime = load();
  runtime.getElement('res-final').innerText = '6w5 · Self-preservation';
  runtime.getElement('res-instincts').innerText = 'Self-preservation';
  runtime.getElement('confidence-badge').innerText = 'A tentative result for self-understanding';
  runtime.evaluate('shareTestResult()');
  assert.equal(runtime.shares[0].url, 'https://er-coaching.com/test.html?lang=en');
  assertEnglish(runtime.shares[0].text, 'share text');
});

test('assessment and report CSS preserve complete word chunks', () => {
  const css = readFileSync(new URL('../css/test.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /overflow-wrap:\s*(?:anywhere|break-word)|word-break:\s*break-all|hyphens:\s*auto/);
  assert.match(css, /\.er-test-main, \.er-test-main \*\s*\{[^}]*word-break: keep-all;[^}]*overflow-wrap: normal;[^}]*hyphens: none;/);
});
