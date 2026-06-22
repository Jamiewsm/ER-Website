import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const questionBank = readFileSync(new URL('../docs/diagnostic_test_question_bank_full.md', import.meta.url), 'utf8');
const testJs = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');

function auditSection() {
  const heading = '## 자동반응 리라이팅 후보';
  const start = questionBank.indexOf(heading);
  assert.notEqual(start, -1, 'question bank should include automatic-reaction rewrite audit section');

  const next = questionBank.indexOf('\n## ', start + heading.length);
  return next === -1 ? questionBank.slice(start) : questionBank.slice(start, next);
}

test('automatic-reaction rewrite audit records current risky copy candidates', () => {
  const section = auditSection();

  for (const id of ['d3_1', 'tb_3_7_1', 'tb_3_sx_1', 'd4_2', 'f_5_7', 'c6', 'd9_1', 'p4_9_subtype']) {
    assert.match(section, new RegExp(`\\|\\s*${id}\\s*\\|`), `${id} should be listed in the audit table`);
  }

  assert.match(section, /무능해 보였을까|결과로 증명/);
  assert.match(section, /결핍|빠진 느낌|온전히 속하지 못함/);
  assert.match(section, /확인해야 안심|빠진 위험/);
  assert.match(section, /불편함을 낮추기|흐리게 넘김|긴장 완충/);
});

test('phase 1 and deep copy still avoids known regression phrases for priority types', () => {
  const q1Start = testJs.indexOf('const q1 = [');
  const deepStart = testJs.indexOf('const deep = {');
  const tieStart = testJs.indexOf('const tb36 = [');
  assert.ok(q1Start > 0, 'q1 should be defined');
  assert.ok(deepStart > q1Start, 'deep items should follow q1 items');
  assert.ok(tieStart > deepStart, 'tie-breakers should follow deep items');

  const phase1AndDeep = testJs.slice(q1Start, tieStart);

  assert.doesNotMatch(phase1AndDeep, /자극이 필요|특별한 사람이라서|착한 사람|평화를 좋아해서/);
  assert.match(phase1AndDeep, /무능해 보였을까/);
  assert.match(phase1AndDeep, /무언가 충분하지 않다|온전히 속하지 못한다/);
  assert.match(phase1AndDeep, /빠진 게 있지 않을까|빠진 부분을 먼저 확인/);
  assert.match(phase1AndDeep, /이 불편함을 빨리 끝내고 싶다|분위기가 더 불편해지기 전에/);
});
