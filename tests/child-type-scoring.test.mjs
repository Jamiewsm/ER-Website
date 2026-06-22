// child-type-scoring.js 단위 테스트
// 실행 — node --test tests/child-type-scoring.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const data = require('../js/child-type-data.js');
const scoring = require('../js/child-type-scoring.js');

function emptyState() {
  const type = {};
  for (let t = 1; t <= 9; t++) type[t] = Array(8).fill(null);
  return {
    type,
    inst: { SP: Array(8).fill(null), SO: Array(8).fill(null), SX: Array(8).fill(null) },
    conf: {},
    wing: null,
    situations: new Set(),
  };
}

test('typeTotal — 역문항 반전 및 0점 제외', () => {
  const row = [null, 5, 5, 5, 5, 5, 5, 1];
  assert.equal(scoring.typeTotal(row), 5 + 5 + 5 + 5 + 5 + 5 + (6 - 1));
});

test('confidence — 점수 차이 구간', () => {
  const r = [{ total: 30 }, { total: 20 }];
  assert.equal(scoring.confidence(r).level, 'high');
  const r2 = [{ total: 24 }, { total: 20 }];
  assert.equal(scoring.confidence(r2).level, 'mid');
  const r3 = [{ total: 22 }, { total: 20 }];
  assert.equal(scoring.confidence(r3).level, 'low');
});

test('compute — 높은 확신도면 1위 유형 확정', () => {
  const state = emptyState();
  for (let i = 0; i < 8; i++) state.type[7][i] = 5;
  for (let i = 0; i < 8; i++) state.type[1][i] = 1;
  const pool = scoring.buildQuestionPool(data, false);
  const result = scoring.compute(state, data, pool);
  assert.equal(result.main, 7);
  assert.equal(result.conf.level, 'high');
});

test('observationalReliability — 관찰부족 많으면 low', () => {
  const state = emptyState();
  for (let i = 0; i < 8; i++) state.type[5][i] = 0;
  for (let i = 0; i < 8; i++) state.type[8][i] = 0;
  const pool = scoring.buildQuestionPool(data, false);
  const rel = scoring.observationalReliability(state, pool, []);
  assert.equal(rel.level, 'low');
  assert.ok(rel.reasons.some((x) => x.includes('5번')));
});

test('buildQuestionPool — 96문항', () => {
  const pool = scoring.buildQuestionPool(data, false);
  assert.equal(pool.length, 96);
});
