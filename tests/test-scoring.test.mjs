// js/test-scoring.js 단위 테스트 (Node test runner ESM, 의존 없음).
// 실행 — `node --test tests/test-scoring.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const scoring = require('../js/test-scoring.js');

const Q1_INSTINCT = [
  { id: 'i_sp_1', inst: 'sp' },
  { id: 'i_sp_2', inst: 'sp' },
  { id: 'i_sp_3', inst: 'sp' },
  { id: 'i_sx_1', inst: 'sx' },
  { id: 'i_sx_2', inst: 'sx' },
  { id: 'i_sx_3', inst: 'sx' },
  { id: 'i_so_1', inst: 'so' },
  { id: 'i_so_2', inst: 'so' },
  { id: 'i_so_3', inst: 'so' },
];

// === computeWingPct ===

test('computeWingPct — pure 7w8 (one wing only)', () => {
  const r = scoring.computeWingPct(7, { 6: 0, 8: 50 });
  assert.equal(r.wing, 8);
  assert.equal(r.pct, 100);
});

test('computeWingPct — balanced 5 (4 == 6)', () => {
  const r = scoring.computeWingPct(5, { 4: 30, 6: 30 });
  // tied — leftScore >= rightScore returns left (4).
  assert.equal(r.wing, 4);
  assert.equal(r.pct, 0);
});

test('computeWingPct — moderate 7w8 (50%)', () => {
  // dom/(dom+oth) = 30/40 = 0.75 → (0.75-0.5)*200 = 50.
  const r = scoring.computeWingPct(7, { 6: 10, 8: 30 });
  assert.equal(r.wing, 8);
  assert.equal(r.pct, 50);
});

test('computeWingPct — wing edge type 1 (left=9, right=2)', () => {
  const r = scoring.computeWingPct(1, { 9: 10, 2: 30 });
  assert.equal(r.wing, 2);
});

test('computeWingPct — wing edge type 9 (left=8, right=1)', () => {
  const r = scoring.computeWingPct(9, { 8: 30, 1: 10 });
  assert.equal(r.wing, 8);
});

test('computeWingPct — both wings zero', () => {
  const r = scoring.computeWingPct(7, { 6: 0, 8: 0 });
  assert.equal(r.wing, null);
  assert.equal(r.pct, 0);
});

// === computeInstinctPct ===

test('computeInstinctPct — all answered with mixed scores', () => {
  const responses = {
    i_sp_1: '6', i_sp_2: '6', i_sp_3: '6',
    i_sx_1: '3', i_sx_2: '3', i_sx_3: '3',
    i_so_1: '1', i_so_2: '1', i_so_3: '1',
  };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.equal(r.sp, 100);
  assert.equal(r.sx, 50);
  assert.equal(r.so, 17);  // 1/6*100=16.67 → 17.
});

test('computeInstinctPct — all U (unscored)', () => {
  const responses = {
    i_sp_1: 'U', i_sp_2: 'U', i_sp_3: 'U',
    i_sx_1: 'U', i_sx_2: 'U', i_sx_3: 'U',
    i_so_1: 'U', i_so_2: 'U', i_so_3: 'U',
  };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.deepEqual(r, { sp: 0, sx: 0, so: 0 });
});

test('computeInstinctPct — partial answered (sp only)', () => {
  const responses = { i_sp_1: '5', i_sp_2: '5' };
  const r = scoring.computeInstinctPct(responses, Q1_INSTINCT);
  assert.equal(r.sp, 83);  // 10/12*100=83.33 → 83.
  assert.equal(r.sx, 0);
  assert.equal(r.so, 0);
});

// === computeDominantInstinct ===

test('computeDominantInstinct — sx wins on tie sp/sx', () => {
  assert.equal(scoring.computeDominantInstinct({ sp: 50, sx: 50, so: 30 }), 'sx');
});

test('computeDominantInstinct — sp wins on tie sp/so', () => {
  assert.equal(scoring.computeDominantInstinct({ sp: 50, sx: 30, so: 50 }), 'sp');
});

test('computeDominantInstinct — clear sx winner', () => {
  assert.equal(scoring.computeDominantInstinct({ sp: 30, sx: 80, so: 50 }), 'sx');
});

test('computeDominantInstinct — all zero returns null', () => {
  assert.equal(scoring.computeDominantInstinct({ sp: 0, sx: 0, so: 0 }), null);
});

// === compute27Subtype + isCountertype ===

test('compute27Subtype — sx_7', () => {
  assert.equal(scoring.compute27Subtype(7, 'sx'), 'sx_7');
});

test('compute27Subtype — null inputs', () => {
  assert.equal(scoring.compute27Subtype(null, 'sx'), null);
  assert.equal(scoring.compute27Subtype(7, null), null);
});

test('isCountertype — Social 7 (Sacrifice) IS countertype', () => {
  assert.equal(scoring.isCountertype(7, 'so'), true);
});

test('isCountertype — Sexual 7 is NOT countertype', () => {
  assert.equal(scoring.isCountertype(7, 'sx'), false);
});

test('isCountertype — Sexual 6 (Strength/Beauty) IS countertype', () => {
  assert.equal(scoring.isCountertype(6, 'sx'), true);
});

test('isCountertype — Self-Pres 3 (Security) IS countertype', () => {
  assert.equal(scoring.isCountertype(3, 'sp'), true);
});

test('isCountertype — Self-Pres 4 (Tenacity) IS countertype', () => {
  assert.equal(scoring.isCountertype(4, 'sp'), true);
});

test('isCountertype — null inputs return false', () => {
  assert.equal(scoring.isCountertype(null, 'sx'), false);
  assert.equal(scoring.isCountertype(7, null), false);
});

test('COUNTERTYPES exposes 9 mappings', () => {
  assert.equal(Object.keys(scoring.COUNTERTYPES).length, 9);
  assert.equal(scoring.COUNTERTYPES[1], 'sx');
  assert.equal(scoring.COUNTERTYPES[2], 'sp');
  assert.equal(scoring.COUNTERTYPES[3], 'sp');
  assert.equal(scoring.COUNTERTYPES[4], 'sp');
  assert.equal(scoring.COUNTERTYPES[5], 'sx');
  assert.equal(scoring.COUNTERTYPES[6], 'sx');
  assert.equal(scoring.COUNTERTYPES[7], 'so');
  assert.equal(scoring.COUNTERTYPES[8], 'so');
  assert.equal(scoring.COUNTERTYPES[9], 'so');
});

// === computeResult + formatResult ===

test('computeResult — full integration (7w8 with sp dominant)', () => {
  const responses = {
    i_sp_1: '5', i_sp_2: '5', i_sp_3: '5',
    i_sx_1: '4', i_sx_2: '4', i_sx_3: '4',
    i_so_1: '2', i_so_2: '2', i_so_3: '2',
  };
  const r = scoring.computeResult({
    coreType: 7,
    scores: { 6: 10, 8: 30 },
    responses,
    q1: Q1_INSTINCT,
  });
  assert.equal(r.coreType, 7);
  assert.equal(r.wing.wing, 8);
  assert.equal(r.wing.pct, 50);
  // sp=15/18*100=83.33→83, sx=12/18*100=66.67→67, so=6/18*100=33.33→33.
  assert.equal(r.instinctPct.sp, 83);
  assert.equal(r.instinctPct.sx, 67);
  assert.equal(r.instinctPct.so, 33);
  assert.equal(r.dominantInstinct, 'sp');
  assert.equal(r.subtype, 'sp_7');
  assert.equal(r.countertype, false);  // 7's countertype is so.
  assert.equal(r.formatted, '7 w8(50%) sp(83%) sx(67%) so(33%)');
});

test('computeResult — Social 7 countertype', () => {
  const responses = {
    i_sp_1: '2', i_sp_2: '2', i_sp_3: '2',
    i_sx_1: '3', i_sx_2: '3', i_sx_3: '3',
    i_so_1: '6', i_so_2: '6', i_so_3: '6',
  };
  const r = scoring.computeResult({
    coreType: 7,
    scores: { 6: 0, 8: 0 },
    responses,
    q1: Q1_INSTINCT,
  });
  assert.equal(r.dominantInstinct, 'so');
  assert.equal(r.subtype, 'so_7');
  assert.equal(r.countertype, true);
  assert.equal(r.wing.wing, null);
  assert.match(r.formatted, /^7 \(순수\) so\(100%\) sx\(50%\) sp\(33%\)$/);
});

test('formatResult — pure type (no wing)', () => {
  const r = scoring.formatResult(5, { wing: null, pct: 0 }, { sp: 50, sx: 30, so: 20 });
  assert.equal(r, '5 (순수) sp(50%) sx(30%) so(20%)');
});

test('formatResult — instincts sorted by % desc', () => {
  const r = scoring.formatResult(7, { wing: 8, pct: 50 }, { sp: 10, sx: 80, so: 60 });
  assert.equal(r, '7 w8(50%) sx(80%) so(60%) sp(10%)');
});
