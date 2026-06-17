#!/usr/bin/env node
// Render a representative premium report PDF bundle for editorial/design review.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'output/pdf/review-bundle');
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

function printHelp() {
  console.log(`Usage: node scripts/render_report_review_bundle.mjs [--keys <comma_list>] [--output-dir <dir>]

Renders representative premium report PDFs for visual/tone review.

Default keys:
- ${DEFAULT_KEYS.join('\n- ')}

Default output:
- output/pdf/review-bundle

Each PDF is rendered through:
  node scripts/qa_premium_report_pdf.mjs --key <key> --output <output-dir>/<key>.pdf`);
}

function readChemistryCard(key) {
  const filePath = path.join(ROOT, 'docs/report-content/chemistry', `${key}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getKeys() {
  const raw = getArgValue('--keys');
  if (!raw) return DEFAULT_KEYS;
  return raw.split(',').map((key) => key.trim()).filter(Boolean);
}

function writeManifest(outputDir, rendered) {
  const lines = [
    '# Premium Report Review Bundle',
    '',
    'Generated representative PDFs for editorial/design review.',
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
    '',
  ];
  fs.writeFileSync(path.join(outputDir, 'README.md'), lines.join('\n'));
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  const keys = getKeys();
  const outputDir = path.resolve(getArgValue('--output-dir') || DEFAULT_OUTPUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });

  const rendered = [];
  for (const key of keys) {
    const card = readChemistryCard(key);
    if (!card) {
      console.error(`Unknown chemistry combination key: ${key}`);
      process.exit(1);
    }

    const pdfPath = path.join(outputDir, `${key}.pdf`);
    console.log(`Render review PDF: ${key}`);
    const result = spawnSync(
      process.execPath,
      ['scripts/qa_premium_report_pdf.mjs', '--key', key, '--output', pdfPath],
      { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' }
    );
    if (result.status !== 0) process.exit(result.status || 1);
    rendered.push({ key, card, pdfPath });
  }

  writeManifest(outputDir, rendered);
  console.log(`OK: review bundle rendered (${path.relative(ROOT, outputDir)})`);
}

main();
