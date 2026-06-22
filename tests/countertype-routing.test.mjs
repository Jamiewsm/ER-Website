import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const testJs = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');

function sliceBetween(startNeedle, endNeedle) {
  const start = testJs.indexOf(startNeedle);
  assert.ok(start > 0, `${startNeedle} should exist`);
  const end = testJs.indexOf(endNeedle, start);
  assert.ok(end > start, `${endNeedle} should follow ${startNeedle}`);
  return testJs.slice(start, end);
}

test('all 9 countertype filters are declared with expected core and instinct', () => {
  const block = sliceBetween('const counterTypeQuestions = {', 'const phase4TypeSets = {');
  const expected = [
    [1, 'ct_1_sx', 'sx'],
    [2, 'ct_2_sp', 'sp'],
    [3, 'ct_3_sp', 'sp'],
    [4, 'ct_4_sp', 'sp'],
    [5, 'ct_5_sx', 'sx'],
    [6, 'ct_6_sx', 'sx'],
    [7, 'ct_7_so', 'so'],
    [8, 'ct_8_so', 'so'],
    [9, 'ct_9_so', 'so']
  ];

  const idMatches = [...block.matchAll(/id:\s*'ct_[1-9]_(?:sp|sx|so)'/g)];
  assert.equal(idMatches.length, 9, 'there should be exactly 9 countertype filters');

  for (const [type, id, inst] of expected) {
    assert.match(block, new RegExp(`${type}:\\s*\\{[\\s\\S]*?id:\\s*'${id}'[\\s\\S]*?type:\\s*${type}[\\s\\S]*?inst:\\s*'${inst}'[\\s\\S]*?counterType:\\s*true`));
  }
});

test('countertype filters are routed for candidate types and scored separately', () => {
  const routing = sliceBetween('testState.phase2Questions = [];', '// 상위 2개 유형 점수 차이가');
  const scoring = sliceBetween('if (q.counterType) {', 'let w = q.weight || TEST_CONFIG.weights.phase2Base;');
  const reportModelInput = sliceBetween('if (counterSignals && counterSignals[core]) {', 'const instinctPct = buildInstinctPctFromScores(inst);');

  assert.match(routing, /topTypes\.forEach\(\(t\)=>\{ if \(deep\[t\]\)/);
  assert.match(routing, /topTypes\.forEach\(\(t\) => \{\s*if \(counterTypeQuestions\[t\]\) testState\.phase2Questions\.push\(counterTypeQuestions\[t\]\);/);
  assert.match(scoring, /TEST_CONFIG\.weights\.tieBreaker\.counterType/);
  assert.match(scoring, /TEST_CONFIG\.weights\.tieBreaker\.counterInstinct/);
  assert.match(scoring, /addScore\(q\.type,\s*coreBoost,\s*q\.id\)/);
  assert.match(scoring, /counterSignals\[q\.type\]\[q\.inst\] \+= instinctBoost/);
  assert.match(reportModelInput, /inst\.sp \+= counterSignals\[core\]\.sp \|\| 0/);
  assert.match(reportModelInput, /inst\.sx \+= counterSignals\[core\]\.sx \|\| 0/);
  assert.match(reportModelInput, /inst\.so \+= counterSignals\[core\]\.so \|\| 0/);
});
