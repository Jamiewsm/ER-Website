import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const testJs = fs.readFileSync(path.join(rootDir, 'js/test.js'), 'utf8');
const testCss = fs.readFileSync(path.join(rootDir, 'css/test.css'), 'utf8');
const experimentJs = fs.readFileSync(path.join(rootDir, 'js/diagnostic-experiment.js'), 'utf8');

class FakeEl {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    };
  }
  setAttribute() {}
  removeAttribute() {}
  appendChild() {}
  addEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  focus() {}
  select() {}
}

function loadTestScript() {
  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeEl(id));
    return elements.get(id);
  };
  const document = {
    documentElement: new FakeEl('html'),
    body: new FakeEl('body'),
    head: new FakeEl('head'),
    getElementById: getEl,
    createElement: (tag) => new FakeEl(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    execCommand: () => true,
  };
  const window = {
    location: { search: '' },
    parent: null,
    ERDiagnosticReportContent: null,
    ERReportSupportMaterials: null,
  };
  window.parent = window;

  const context = vm.createContext({
    window,
    document,
    navigator: {},
    localStorage: { getItem: () => null, setItem: () => {} },
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: () => 0,
    Date,
    Math,
  });
  vm.runInContext(testJs, context, { filename: 'js/test.js' });
  return context;
}

test('buildConfidenceExplanation explains medium confidence and pair questions', () => {
  const context = loadTestScript();
  const result = vm.runInContext(`buildConfidenceExplanation({
    confidence: '보통',
    diff: 0.04,
    core: 4,
    second: { type: 7, score: 58 },
    instinctPct: { sp: 40, sx: 67, so: 22 },
    responseQuality: { level: 'good', flags: [], metrics: { centerCoreAligned: true, instinctGap: 27, instinctTop: 67 } },
    tieState: { t47: { enabled: true } }
  })`, context);

  assert.equal(result.label, '해석 신뢰도: 중간 이상');
  assert.equal(result.tone, 'medium');
  assert.ok(result.reasons.some((reason) => reason.includes('4번과 7번 점수 차이가 4.0%')));
  assert.ok(result.reasons.some((reason) => reason.includes('본능 점수는 비교적 선명합니다')));
  assert.ok(result.reasons.some((reason) => reason.includes('센터 응답은 코어 결과와 대체로 일치합니다')));
  assert.ok(result.reasons.some((reason) => reason.includes('4↔7 감별 문항이 적용되었습니다')));
  assert.ok(result.consultationQuestions.some((question) => question.includes('무거운 감정')));
});

test('buildConfidenceExplanation marks low quality and returns pair verification questions', () => {
  const context = loadTestScript();
  const result = vm.runInContext(`buildConfidenceExplanation({
    confidence: '낮음',
    diff: 0.015,
    core: 6,
    second: { type: 8, score: 56 },
    instinctPct: { sp: 31, sx: 29, so: 24 },
    responseQuality: {
      level: 'low',
      flags: [
        { code: 'straight_lining', label: '같은 점수 반복이 많음' },
        { code: 'center_core_mismatch', label: '센터 응답과 코어 결과가 충돌함' }
      ],
      metrics: { centerCoreAligned: false, instinctGap: 2, instinctTop: 31 }
    },
    tieState: { t68: { enabled: true } }
  })`, context);

  assert.equal(result.label, '해석 신뢰도: 확인 필요');
  assert.equal(result.tone, 'low');
  assert.equal(result.requiresCare, true);
  assert.ok(result.summary.includes('상담에서 함께 확인'));
  assert.ok(result.reasons.some((reason) => reason.includes('응답 품질 체크')));
  assert.ok(result.reasons.some((reason) => reason.includes('센터 응답과 코어 결과가 충돌')));
  assert.ok(result.consultationQuestions.some((question) => question.includes('강하게 맞설 때')));
});

test('premium report renderer includes confidence section and styles', () => {
  assert.match(testJs, /function buildConfidenceExplanation/);
  assert.match(testJs, /function renderConfidenceExplanationSection/);
  assert.match(testJs, /id="report-confidence"/);
  assert.match(testJs, /상담에서 확인할 질문/);
  assert.match(testJs, /href="#report-confidence"/);
  assert.match(testCss, /\.er-report-confidence-section/);
  assert.match(testCss, /\.er-report-confidence-grid/);
  assert.match(testCss, /\.er-report-confidence-section\.is-low/);
});

test('experiment row preserves confidence explanation metadata', () => {
  assert.match(testJs, /confidenceExplanation:\s*premiumModel\.confidenceExplanation/);
  assert.match(experimentJs, /confidence_explanation:\s*payload\.confidenceExplanation \|\| null/);
});
