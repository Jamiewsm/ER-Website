import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const experimentSource = fs.readFileSync(path.join(rootDir, 'js/diagnostic-experiment.js'), 'utf8');

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
  removeChild() {}
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
  const source = fs.readFileSync(path.join(rootDir, 'js/test.js'), 'utf8');
  vm.runInContext(source, context, { filename: 'js/test.js' });
  return context;
}

test('buildResponseQualitySnapshot flags very fast straight-lined responses', () => {
  const context = loadTestScript();
  const result = vm.runInContext(`(() => {
    const responses = {};
    q1.filter((q) => !q.format && !q.state).forEach((q) => { responses[q.id] = '4'; });
    return buildResponseQualitySnapshot({
      responses,
      timings: { totalSeconds: 95, answeredCount: 39, avgSecondsPerAnswered: 2.4 },
      scoringAxes: { centerScore: { heart: 10, head: 12, body: 44 } },
      ranked: [{ type: 8, score: 60 }, { type: 9, score: 57 }],
      instinctPct: { sp: 72, sx: 34, so: 28 },
      confidence: '보통'
    });
  })()`, context);

  const codes = result.flags.map((flag) => flag.code);
  assert.equal(result.level, 'low');
  assert.ok(result.metrics.straightLineRatio >= 0.75);
  assert.ok(result.metrics.avgSecondsPerAnswered < 4);
  assert.ok(codes.includes('too_fast_total'));
  assert.ok(codes.includes('straight_lining'));
});

test('buildResponseQualitySnapshot flags unknown overuse, center mismatch, and unclear instinct', () => {
  const context = loadTestScript();
  const result = vm.runInContext(`(() => {
    const responses = {};
    q1.filter((q) => !q.format && !q.state).forEach((q, index) => {
      responses[q.id] = index % 3 === 0 ? 'U' : String((index % 6) + 1);
    });
    return buildResponseQualitySnapshot({
      responses,
      timings: { totalSeconds: 820, answeredCount: 39, avgSecondsPerAnswered: 21 },
      scoringAxes: { centerScore: { heart: 10, head: 88, body: 18 } },
      ranked: [{ type: 8, score: 60 }, { type: 6, score: 58 }],
      instinctPct: { sp: 31, sx: 29, so: 24 },
      confidence: '낮음'
    });
  })()`, context);

  const codes = result.flags.map((flag) => flag.code);
  assert.equal(result.level, 'caution');
  assert.ok(result.metrics.unknownRatio >= 0.25);
  assert.equal(result.metrics.centerCoreAligned, false);
  assert.ok(result.metrics.instinctGap < 10);
  assert.ok(codes.includes('unknown_overuse'));
  assert.ok(codes.includes('center_core_mismatch'));
  assert.ok(codes.includes('instinct_unclear'));
});

test('experiment row preserves response quality and timing metadata', () => {
  assert.match(experimentSource, /response_quality:\s*payload\.responseQuality \|\| null/);
  assert.match(experimentSource, /response_timing:\s*payload\.responseTiming \|\| null/);
});
