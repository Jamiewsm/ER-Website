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

test('dedicated high-risk tie-breakers remain routed before generic fallback', () => {
  const phase2Routing = sliceBetween('const top2Score1 = ranked[0].score;', 'appendStateAnxietyTieBreakersForType6');

  for (const spec of [
    ['t16', 'tb16'],
    ['t47', 'tb47'],
    ['t59', 'tb59']
  ]) {
    const [tieKey, questionSet] = spec;
    assert.match(phase2Routing, new RegExp(`testState\\.tie\\.${tieKey}\\s*=\\s*\\{\\s*enabled:\\s*true`));
    assert.match(phase2Routing, new RegExp(`concat\\(${questionSet}\\)`));
  }

  const t16Idx = phase2Routing.indexOf('testState.tie.t16');
  const t47Idx = phase2Routing.indexOf('testState.tie.t47');
  const t59Idx = phase2Routing.indexOf('testState.tie.t59');
  const genericIdx = phase2Routing.indexOf('tbCustomMap');

  assert.ok(t16Idx > 0 && t16Idx < genericIdx, '1-6 should use dedicated routing before generic fallback');
  assert.ok(t47Idx > 0 && t47Idx < genericIdx, '4-7 should use dedicated routing before generic fallback');
  assert.ok(t59Idx > 0 && t59Idx < genericIdx, '5-9 should use dedicated routing before generic fallback');
});

test('2-9 has a dedicated situation tie-breaker instead of generic fallback only', () => {
  const phase2Routing = sliceBetween('const top2Score1 = ranked[0].score;', 'appendStateAnxietyTieBreakersForType6');
  const abScoring = sliceBetween("if (q.format === 'ab')", "if (q.counterType)");
  const logBlock = sliceBetween("if (testState.tie.t71.enabled)", "if (testState.tie.tGeneric.enabled)");

  assert.match(testJs, /t29:\s*\{enabled:false,weight:0,margin:null\}/);
  assert.match(testJs, /const tb29 = \[/);
  assert.match(testJs, /id:'tb_2_9_1'/);
  assert.match(testJs, /id:'tb_2_9_2'/);
  assert.match(testJs, /id:'tb_2_9_3'/);
  assert.match(phase2Routing, /testState\.tie\.t29\s*=\s*\{\s*enabled:\s*true/);
  assert.match(phase2Routing, /concat\(tb29\)/);
  assert.match(abScoring, /q\.id\.startsWith\('tb_2_9_'\).*testState\.tie\.t29\.enabled/);
  assert.match(logBlock, /testState\.tie\.t29\.enabled/);
});
