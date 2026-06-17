// Premium report PDF QA guardrails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
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

test('premium report PDF QA script advertises premium report v2 flow', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/qa_premium_report_pdf.mjs', '--help'],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--version <v1\|v2>/);
  assert.match(result.stdout, /test\.html\?debugReport=sx_7_w8&reportVersion=v2/);
  assert.match(result.stdout, /\.er-report-v2/);
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

test('premium report PDF guard detects mostly blank trailing pages', async () => {
  const { hasMostlyBlankTrailingPage } = await import('../scripts/lib/pdf-page-guards.mjs');

  assert.equal(hasMostlyBlankTrailingPage([1800, 1520, 54]), true);
  assert.equal(hasMostlyBlankTrailingPage([1800, 1520, 167]), true);
  assert.equal(hasMostlyBlankTrailingPage([1800, 1520, 380]), false);
  assert.equal(hasMostlyBlankTrailingPage([1800]), false);
});

test('premium report PDF QA script checks for mostly blank trailing pages', () => {
  const source = fs.readFileSync(path.join(rootDir, 'scripts/qa_premium_report_pdf.mjs'), 'utf8');

  assert.match(source, /assertNoMostlyBlankTrailingPage/);
});

test('premium report PDF QA script enforces v2 page count and text quality', () => {
  const source = fs.readFileSync(path.join(rootDir, 'scripts/qa_premium_report_pdf.mjs'), 'utf8');

  assert.match(source, /report-text-quality\.mjs/);
  assert.match(source, /assertReportTextQuality/);
  assert.match(source, /pageCount\s*<\s*18/);
  assert.match(source, /pageCount\s*>\s*22/);
});

test('premium report print CSS keeps web-only ending out of the PDF flow', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css/test.css'), 'utf8');
  const printCss = css.slice(css.indexOf('@media print'));

  assert.notEqual(printCss, css, 'missing @media print block');
  assert.match(printCss, /\.er-report-final-cta\s*\{[^}]*background:\s*#fff/);
  assert.match(printCss, /\.er-report-next-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(printCss, /\.er-report-final-cta\s*>\s*a[^{]*\{[^}]*display:\s*none/);
  assert.match(printCss, /\.er-report-final-cta\s*>\s*a\.er-report-final-primary[^{]*\{[^}]*display:\s*none/);
  assert.match(printCss, /\.er-report-final-cta\s*>\s*a\.er-report-final-secondary[^{]*\{[^}]*display:\s*none/);
  assert.match(printCss, /#result-disclaimer[^{]*\{[^}]*display:\s*none/);
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
  assert.match(result.stdout, /--version <v1\|v2>/);
  assert.match(result.stdout, /sx_7_w8-v2\.pdf/);
  assert.match(result.stdout, /output\/pdf\/review-bundle/);
});

test('debug report review copy stays customer-facing', () => {
  const source = fs.readFileSync(path.join(rootDir, 'js/test.js'), 'utf8');

  assert.doesNotMatch(source, /디버그 리뷰 샘플/);
  assert.doesNotMatch(source, /표시 품질을 확인/);
  assert.doesNotMatch(source, /보조 패턴으로 설정/);
  assert.doesNotMatch(source, /비교 기준으로 낮게 설정/);
});
