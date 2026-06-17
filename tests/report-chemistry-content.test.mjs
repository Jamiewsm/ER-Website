// 프리미엄 결과지 조합 해석 카드 데이터 회귀 테스트
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const NEXT_COUNTERTYPE_BATCH = [
  'sx_1_w9',
  'sx_1_w2',
  'sp_2_w1',
  'sp_2_w3',
  'sx_5_w4',
  'sx_5_w6',
];
const FINAL_COUNTERTYPE_BATCH = [
  'so_8_w7',
  'so_8_w9',
  'so_9_w8',
  'so_9_w1',
];
const HIGH_VALUE_BATCH = [
  'sx_2_w3',
  'sx_2_w1',
  'so_3_w2',
  'so_3_w4',
  'sx_4_w3',
  'sx_4_w5',
];
const STRUCTURE_CHECKED_BATCH = [
  'sp_1_w9',
  'sp_1_w2',
  'so_1_w9',
  'so_1_w2',
  'so_2_w1',
  'so_2_w3',
];
const HIGH_VALUE_FOLLOWUP_BATCH = [
  'sx_3_w2',
  'sx_3_w4',
  'so_4_w3',
  'so_4_w5',
  'so_5_w4',
  'so_5_w6',
];
const TYPE_5_6_FOLLOWUP_BATCH = [
  'sp_5_w4',
  'sp_5_w6',
  'so_6_w5',
  'so_6_w7',
  'sp_6_w5',
  'sp_6_w7',
];
const FINAL_COMPLETION_BATCH = [
  'sx_8_w7',
  'sx_8_w9',
  'sp_8_w7',
  'sp_8_w9',
  'sx_9_w8',
  'sx_9_w1',
  'sp_9_w8',
  'sp_9_w1',
];

test('sx_7_w8 chemistry JSON has matching browser runtime card', () => {
  const jsonPath = path.join(rootDir, 'docs/report-content/chemistry/sx_7_w8.json');
  const sourceCard = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const runtime = require('../js/report-chemistry-data.js');
  const runtimeCard = runtime.get('sx_7_w8');

  assert.equal(sourceCard.combination_key, 'sx_7_w8');
  assert.equal(runtimeCard.combination_key, sourceCard.combination_key);
  assert.equal(runtimeCard.identity_sentence, sourceCard.identity_sentence);
  assert.equal(runtimeCard.display.pull_quote, sourceCard.display.pull_quote);
  assert.deepEqual(runtimeCard.display.bullets, sourceCard.display.bullets);
  assert.deepEqual(runtimeCard.practical_insights, sourceCard.practical_insights);
  assert.equal(runtimeCard.source_note, undefined);
});

test('practical insights use paid-report customer-facing fields', () => {
  const runtime = require('../js/report-chemistry-data.js');
  const card = runtime.get('sx_7_w8');
  const insights = card.practical_insights;

  assert.ok(insights, 'runtime card should include practical_insights');
  assert.deepEqual(Object.keys(insights).sort(), [
    'coaching_questions',
    'draining_contexts',
    'overuse_risks',
    'strengths',
    'work_fit',
  ]);

  for (const [key, value] of Object.entries(insights)) {
    assert.ok(Array.isArray(value), `${key} should be an array`);
    assert.ok(value.length >= 2, `${key} should contain paid-report detail`);
    assert.ok(value.every((item) => typeof item === 'string' && item.length >= 12), `${key} should contain customer copy`);
  }
});

test('expansion batches are customer-ready in JSON and runtime data', () => {
  const runtime = require('../js/report-chemistry-data.js');

  for (const key of [
    ...NEXT_COUNTERTYPE_BATCH,
    ...FINAL_COUNTERTYPE_BATCH,
    ...HIGH_VALUE_BATCH,
    ...STRUCTURE_CHECKED_BATCH,
    ...HIGH_VALUE_FOLLOWUP_BATCH,
    ...TYPE_5_6_FOLLOWUP_BATCH,
    ...FINAL_COMPLETION_BATCH,
  ]) {
    const jsonPath = path.join(rootDir, `docs/report-content/chemistry/${key}.json`);
    assert.ok(fs.existsSync(jsonPath), `${key} JSON should exist`);

    const sourceCard = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const runtimeCard = runtime.get(key);
    assert.equal(runtimeCard.combination_key, key);
    assert.equal(runtimeCard.identity_sentence, sourceCard.identity_sentence);
    assert.deepEqual(runtimeCard.practical_insights, sourceCard.practical_insights);
    assert.equal(runtimeCard.source_note, undefined);
    assert.doesNotMatch(JSON.stringify(sourceCard), /source_note|<sources|<\/source>|Complete Enneagram|Chestnut|pp\./);
  }
});

test('test page loads chemistry data before the result renderer', () => {
  const html = fs.readFileSync(path.join(rootDir, 'test.html'), 'utf8');
  const chemistryIdx = html.indexOf('js/report-chemistry-data.js');
  const testIdx = html.indexOf('js/test.js');

  assert.ok(chemistryIdx > 0, 'chemistry data script should be present');
  assert.ok(testIdx > chemistryIdx, 'test.js should load after chemistry data');
});

test('browser runtime chemistry data is generated from content JSON', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/build_report_chemistry_data.mjs', '--check'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(
    result.status,
    0,
    `runtime chemistry data should match JSON\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
});

test('content verifier reports 54-combination coverage', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/verify_report_content.mjs', '--coverage'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Coverage: 54\/54 chemistry combinations/);
  assert.doesNotMatch(result.stdout, /Next type 7 batch:/);
});

test('content review gate passes all chemistry cards before reviewed promotion', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/review_report_content.mjs'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(
    result.status,
    0,
    `review gate should pass before reviewed promotion\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.match(result.stdout, /Review gate: 54\/54 chemistry cards pass/);
  assert.match(result.stdout, /Status counts: gold_sample=1, reviewed=53/);
});
