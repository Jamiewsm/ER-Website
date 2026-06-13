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
