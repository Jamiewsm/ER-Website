#!/usr/bin/env node
// Render a representative premium report PDF bundle for editorial/design review.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'output/pdf/review-bundle');
const DEFAULT_VERSION = 'v1';
const DEFAULT_KEYS = [
  'sx_7_w8',
  'so_8_w7',
  'sx_8_w9',
  'sx_9_w1',
  'sp_9_w1',
  'so_3_w4',
];

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function getReportVersion() {
  const version = getArgValue('--version') || DEFAULT_VERSION;
  if (version === 'v1' || version === 'v2') return version;
  console.error(`Unknown report version: ${version}`);
  process.exit(1);
}

function printHelp() {
  console.log(`Usage: node scripts/render_report_review_bundle.mjs [--keys <comma_list>] [--version <v1|v2>] [--output-dir <dir>]

Renders representative premium report PDFs for visual/tone review.

Default keys:
- ${DEFAULT_KEYS.join('\n- ')}

Default output:
- output/pdf/review-bundle

V2 first-slice output example:
- output/pdf/review-bundle/sx_7_w8-v2.pdf

Each PDF is rendered through:
  node scripts/qa_premium_report_pdf.mjs --key <key> --version <v1|v2> --output <output-dir>/<key>[-v2].pdf`);
}

function readChemistryCard(key) {
  const filePath = path.join(ROOT, 'docs/report-content/chemistry', `${key}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getKeys(version) {
  const raw = getArgValue('--keys');
  if (!raw && version === 'v2') return ['sx_7_w8'];
  if (!raw) return DEFAULT_KEYS;
  return raw.split(',').map((key) => key.trim()).filter(Boolean);
}

function writeManifest(outputDir, rendered, version) {
  const lines = [
    '# Premium Report Review Bundle',
    '',
    `Generated representative PDFs for editorial/design review (${version}).`,
    '',
    '| Key | Status | Identity | PDF |',
    '|---|---|---|---|',
    ...rendered.map(({ key, card, pdfPath }) => (
      `| ${key} | ${card.status} | ${card.identity_sentence} | ${path.basename(pdfPath)} |`
    )),
    '',
    'Review focus:',
    '- Korean tone feels natural and professional.',
    '- The chemistry section fits the paid-report promise.',
    '- PDF spacing, hierarchy, and page breaks feel polished.',
    '- No source notes, awkward translation residue, or harsh labels are visible.',
    '- For V2, pages add distinct interpretive value without repeated filler.',
    '',
  ];
  fs.writeFileSync(path.join(outputDir, 'README.md'), lines.join('\n'));
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  const version = getReportVersion();
  const keys = getKeys(version);
  const outputDir = path.resolve(getArgValue('--output-dir') || DEFAULT_OUTPUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });

  const rendered = [];
  for (const key of keys) {
    const card = readChemistryCard(key);
    if (!card) {
      console.error(`Unknown chemistry combination key: ${key}`);
      process.exit(1);
    }

    const suffix = version === 'v2' ? '-v2' : '';
    const pdfPath = path.join(outputDir, `${key}${suffix}.pdf`);
    console.log(`Render review PDF: ${key} ${version}`);
    const result = spawnSync(
      process.execPath,
      ['scripts/qa_premium_report_pdf.mjs', '--key', key, '--version', version, '--output', pdfPath],
      { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' }
    );
    if (result.status !== 0) process.exit(result.status || 1);
    rendered.push({ key, card, pdfPath });
  }

  writeManifest(outputDir, rendered, version);
  console.log(`OK: review bundle rendered (${path.relative(ROOT, outputDir)})`);
}

main();
