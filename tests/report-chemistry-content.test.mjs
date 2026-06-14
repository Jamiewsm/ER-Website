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
  assert.match(result.stdout, /Coverage: 6\/54 chemistry combinations/);
  assert.doesNotMatch(result.stdout, /Next type 7 batch:/);
});
