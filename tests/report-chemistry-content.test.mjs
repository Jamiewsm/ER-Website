// 프리미엄 결과지 화학 카드 데이터 회귀 테스트
import { test } from 'node:test';
import assert from 'node:assert/strict';
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
