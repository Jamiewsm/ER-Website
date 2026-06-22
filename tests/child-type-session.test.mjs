// child-type-session.js 단위 테스트
// 실행 — node --test tests/child-type-session.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const data = require('../js/child-type-data.js');
const scoring = require('../js/child-type-scoring.js');
const session = require('../js/child-type-session.js');

function emptyState() {
  const type = {};
  for (let t = 1; t <= 9; t++) type[t] = Array(8).fill(null);
  return {
    type,
    inst: { SP: Array(8).fill(null), SO: Array(8).fill(null), SX: Array(8).fill(null) },
    conf: {},
    wing: null,
    situations: new Set([0, 2]),
  };
}

test('serializePool / deserializePool — 96문항 왕복', () => {
  const pool = scoring.buildQuestionPool(data, false);
  const refs = session.serializePool(pool);
  assert.equal(refs.length, 96);
  const restored = session.deserializePool(refs, data);
  assert.equal(restored.length, 96);
  assert.equal(restored[0].text, pool[0].text);
  assert.equal(restored[95].kind, pool[95].kind);
});

test('saveProgress / loadProgress — localStorage 왕복', () => {
  const storage = {};
  const original = global.localStorage;
  global.localStorage = {
    getItem: (k) => storage[k] ?? null,
    setItem: (k, v) => {
      storage[k] = v;
    },
    removeItem: (k) => {
      delete storage[k];
    },
  };

  try {
    const pool = scoring.buildQuestionPool(data, false);
    const state = emptyState();
    state.type[3][0] = 4;
    session.saveProgress({ stepIdx: 5, state, pool });
    const loaded = session.loadProgress();
    assert.ok(loaded);
    assert.equal(loaded.stepIdx, 5);
    assert.equal(loaded.state.type[3][0], 4);
    assert.ok(loaded.state.situations.has(0));
    const pool2 = session.deserializePool(loaded.poolRefs, data);
    assert.equal(pool2.length, 96);
    session.clearProgress();
    assert.equal(session.loadProgress(), null);
  } finally {
    global.localStorage = original;
  }
});

test('buildResultSummary / formatResultSummaryForApply', () => {
  const state = emptyState();
  for (let i = 0; i < 8; i++) state.type[7][i] = 5;
  state.wing = 6;
  const pool = scoring.buildQuestionPool(data, false);
  const result = scoring.compute(state, data, pool);
  const summary = session.buildResultSummary(state, result, data);
  assert.equal(summary.source, 'child_type_test');
  assert.equal(summary.coreType, result.main);
  const line = session.formatResultSummaryForApply(summary);
  assert.ok(line.includes('부모 관찰형 검사 결과'));
  assert.ok(line.includes('7번'));
});
