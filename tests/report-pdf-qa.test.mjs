// Premium report PDF QA guardrails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('premium report PDF QA script advertises the sx_7_w8 debug flow', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/qa_premium_report_pdf.mjs', '--help'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /test\.html\?debugReport=sx_7_w8/);
  assert.match(result.stdout, /#report-chemistry/);
  assert.match(result.stdout, /download-pdf-btn/);
});

test('premium report PDF QA script advertises configurable chemistry keys', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/qa_premium_report_pdf.mjs', '--help'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--key <combination_key>/);
  assert.match(result.stdout, /test\.html\?debugReport=<combination_key>/);
});

test('premium report PDF QA script rejects unknown chemistry keys before browser QA', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/qa_premium_report_pdf.mjs', '--key', 'sx_99_w1', '--output', '/tmp/invalid-report-key.pdf'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.notEqual(result.status, 0, 'unknown chemistry key should fail');
  assert.match(result.stderr, /Unknown chemistry combination key: sx_99_w1/);
});

test('premium report review bundle script advertises representative cards', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/render_report_review_bundle.mjs', '--help'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /sx_7_w8/);
  assert.match(result.stdout, /so_8_w7/);
  assert.match(result.stdout, /sp_9_w1/);
  assert.match(result.stdout, /output\/pdf\/review-bundle/);
});
