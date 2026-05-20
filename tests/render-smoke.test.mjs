// Phase 6 결과지 렌더러 스모크 테스트 — DOM 없이 HTML 문자열만 검증.
// 실행 — `node --test tests/render-smoke.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// DOM mock — jsdom 없이 최소 window 환경 흉내.
class FakeEl {
  constructor() { this.innerHTML = ''; this.classList = { add: () => {}, remove: () => {} }; }
}
globalThis.window = { TestShared: null, SubtypesData: null, TestScoring: null, TestResultRenderer: null, TestCharts: null };
globalThis.document = { getElementById: () => new FakeEl() };

const scoring = require('../js/test-scoring.js');
const subdata = require('../js/subtypes-27-data.js');
// renderer + charts 가 IIFE 로 window 에 등록되도록 require.
require('../js/test-result-renderer.js');
require('../js/test-charts.js');

const Q1 = [
  { id: 'i_sp_1', inst: 'sp' }, { id: 'i_sp_2', inst: 'sp' }, { id: 'i_sp_3', inst: 'sp' },
  { id: 'i_sx_1', inst: 'sx' }, { id: 'i_sx_2', inst: 'sx' }, { id: 'i_sx_3', inst: 'sx' },
  { id: 'i_so_1', inst: 'so' }, { id: 'i_so_2', inst: 'so' }, { id: 'i_so_3', inst: 'so' },
];

function buildPhase3Result(coreType, instinctScores, wingScores) {
  const scores = {};
  for (let i = 1; i <= 9; i++) scores[i] = i === coreType ? 30 : 5;
  if (wingScores) {
    const l = coreType === 1 ? 9 : coreType - 1;
    const r = coreType === 9 ? 1 : coreType + 1;
    scores[l] = wingScores[0]; scores[r] = wingScores[1];
  }
  const responses = {
    i_sp_1: String(instinctScores.sp), i_sp_2: String(instinctScores.sp), i_sp_3: String(instinctScores.sp),
    i_sx_1: String(instinctScores.sx), i_sx_2: String(instinctScores.sx), i_sx_3: String(instinctScores.sx),
    i_so_1: String(instinctScores.so), i_so_2: String(instinctScores.so), i_so_3: String(instinctScores.so),
  };
  const r = scoring.computeResult({ coreType, scores, responses, q1: Q1 });
  return { r, scores };
}

test('renderSubtypeHeader — sx_6 countertype produces center-head color', () => {
  const { r } = buildPhase3Result(6, { sp: 2, sx: 6, so: 2 }, [10, 20]);
  const el = new FakeEl();
  window.TestResultRenderer.renderSubtypeHeader(r, el);
  assert.match(el.innerHTML, /3D5A80/);  // head color
  assert.match(el.innerHTML, /countertype/);
  assert.match(el.innerHTML, /Strength\/Beauty/);
});

test('renderSubtypeHeader — sp_1 Worry produces center-body color', () => {
  const { r } = buildPhase3Result(1, { sp: 6, sx: 2, so: 2 }, [10, 20]);
  const el = new FakeEl();
  window.TestResultRenderer.renderSubtypeHeader(r, el);
  assert.match(el.innerHTML, /C44536/);  // body color
  assert.match(el.innerHTML, /Worry/);
});

test('renderCountertypeFull — sets section visible only when countertype=true', () => {
  const { r: rCt } = buildPhase3Result(7, { sp: 2, sx: 2, so: 6 }, [10, 20]);  // so_7 countertype
  const { r: rNormal } = buildPhase3Result(7, { sp: 6, sx: 2, so: 2 }, [10, 20]);  // sp_7 normal

  let hiddenCalls = 0, visibleCalls = 0;
  const sectionEl = { classList: { add: (c) => c === 'hidden' && hiddenCalls++, remove: (c) => c === 'hidden' && visibleCalls++ } };
  const cardEl = new FakeEl();

  window.TestResultRenderer.renderCountertypeFull(rNormal, sectionEl, cardEl);
  assert.equal(hiddenCalls, 1, 'normal subtype should hide section');

  window.TestResultRenderer.renderCountertypeFull(rCt, sectionEl, cardEl);
  assert.equal(visibleCalls, 1, 'countertype should show section');
  assert.match(cardEl.innerHTML, /Sacrifice/);
  assert.match(cardEl.innerHTML, /vs sp_7|vs sx_7/);
});

test('renderSignatureSummary — all sections rendered', () => {
  const { r, scores } = buildPhase3Result(3, { sp: 6, sx: 2, so: 3 }, [10, 20]);  // sp_3 countertype Security
  const el = new FakeEl();
  window.TestResultRenderer.renderSignatureSummary(3, scores, r, el);
  assert.match(el.innerHTML, /9 Type Scores/);
  assert.match(el.innerHTML, /Instinct Stack/);
  assert.match(el.innerHTML, /Wing/);
  assert.match(el.innerHTML, /Countertype/);
  assert.match(el.innerHTML, /Security/);
  assert.match(el.innerHTML, /5A8F69/);  // heart center color (Type 3)
});

test('renderInstinctBars — produces 3 bars sorted desc', () => {
  const el = new FakeEl();
  window.TestCharts.renderInstinctBars({ sp: 30, sx: 80, so: 50 }, el);
  // sx (80) should appear first.
  const sxIdx = el.innerHTML.indexOf('일대일 sx');
  const soIdx = el.innerHTML.indexOf('사회 so');
  const spIdx = el.innerHTML.indexOf('자기보호 sp');
  assert.ok(sxIdx >= 0 && soIdx > sxIdx && spIdx > soIdx, 'order should be sx > so > sp');
  assert.match(el.innerHTML, /Dominant/);
  assert.match(el.innerHTML, /Blind/);
});

test('renderTriads — coreType 7 produces head+assertive+positive_outlook', () => {
  const el = new FakeEl();
  window.TestCharts.renderTriads(7, el);
  assert.match(el.innerHTML, /HEAD/);
  assert.match(el.innerHTML, /ASSERTIVE/);
  assert.match(el.innerHTML, /POSITIVE OUTLOOK/);
  assert.match(el.innerHTML, /Types 5 · 6 · 7/);
});

test('renderEnneagramMap — produces SVG with 9 circles + connecting lines', () => {
  const el = new FakeEl();
  window.TestCharts.renderEnneagramMap(7, { 1:5, 2:5, 3:5, 4:5, 5:5, 6:5, 7:30, 8:15, 9:5 }, el);
  const circleCount = (el.innerHTML.match(/<circle/g) || []).length;
  assert.equal(circleCount, 9, 'should render 9 type circles');
  // 9-pointed star (9 lines) + 9-polygon outline.
  assert.match(el.innerHTML, /<polygon/);
});

test('renderWingMeter — null wing shows balanced message', () => {
  const el = new FakeEl();
  window.TestCharts.renderWingMeter(5, { wing: null, pct: 0 }, el);
  assert.match(el.innerHTML, /균등|순수/);
});

test('renderWingMeter — populated wing renders bars', () => {
  const el = new FakeEl();
  window.TestCharts.renderWingMeter(7, { wing: 8, pct: 67 }, el);
  assert.match(el.innerHTML, /Wing 8/);
  assert.match(el.innerHTML, /67%/);
});
