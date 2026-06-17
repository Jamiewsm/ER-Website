// Premium Report V2 source guardrails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function assertOrdered(source, first, second) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert.notEqual(firstIndex, -1, `missing ${first}`);
  assert.notEqual(secondIndex, -1, `missing ${second}`);
  assert.ok(firstIndex < secondIndex, `${first} should appear before ${second}`);
}

test('test page wires premium report v2 assets before the result renderer', () => {
  const html = readRepoFile('test.html');

  assert.match(html, /href="css\/report-v2\.css"/);
  assertOrdered(html, 'src="js/report-v2-data.js"', 'src="js/test.js"');
  assertOrdered(html, 'src="js/report-v2-renderer.js"', 'src="js/test.js"');
});

test('test renderer dispatches to premium report v2 only through the route flag', () => {
  const source = readRepoFile('js/test.js');

  assert.match(source, /function\s+getPremiumReportVersion\s*\(/);
  assert.match(source, /reportVersion/);
  assert.match(source, /window\.ERRenderPremiumReportV2/);
  assert.match(source, /function\s+renderSelectedPremiumReport\s*\(/);
});

test('premium report v2 files expose the expected public data and renderer contracts', () => {
  const data = readRepoFile('js/report-v2-data.js');
  const renderer = readRepoFile('js/report-v2-renderer.js');

  assert.match(data, /window\.ERReportV2Data/);
  assert.match(data, /sx_7_w8/);
  assert.match(data, /mockup1/);
  assert.match(data, /mockup10/);
  assert.match(data, /defaultPageCount:\s*20/);
  assert.match(renderer, /window\.ERRenderPremiumReportV2/);
  assert.match(renderer, /data-report-version="v2"/);
  assert.match(renderer, /er-report-v2/);
});

test('premium report v2 defines 20 page objects with distinct roles', () => {
  const data = readRepoFile('js/report-v2-data.js');
  const pageIds = [...data.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);
  const roles = [...data.matchAll(/contentRole:\s*'([^']+)'/g)].map((match) => match[1]);

  assert.equal(pageIds.length, 20);
  assert.equal(new Set(pageIds).size, 20);
  assert.ok(roles.length >= 20);
  assert.ok(new Set(roles).size >= 6, 'V2 pages should not all share the same content role');
});

test('premium report v2 customer-facing sources avoid banned draft language', () => {
  const files = [
    'js/test.js',
    'js/report-v2-data.js',
    'js/report-v2-renderer.js',
    'css/report-v2.css',
  ];
  const source = files
    .filter((file) => fs.existsSync(path.join(rootDir, file)))
    .map((file) => readRepoFile(file))
    .join('\n');

  assert.doesNotMatch(source, /조합만의 화학/);
  assert.doesNotMatch(source, /Source Draft/i);
  assert.doesNotMatch(source, /source_note/);
  assert.doesNotMatch(source, /ANARA/);
  assert.doesNotMatch(source, /광신자|귀신/);
});

test('premium report v2 CSS uses one font stack and print page breaks', () => {
  const css = readRepoFile('css/report-v2.css');
  const fontFamilyDeclarations = css.match(/font-family\s*:/g) || [];

  assert.equal(fontFamilyDeclarations.length, 1);
  assert.match(css, /\.er-report-v2\s*\{[^}]*font-family:/s);
  assert.match(css, /\.er-v2-page\s*\+\s*\.er-v2-page\s*\{[^}]*break-before:\s*page/s);
  assert.match(css, /@media\s+print/);
});
