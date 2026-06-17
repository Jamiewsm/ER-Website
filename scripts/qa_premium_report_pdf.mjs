#!/usr/bin/env node
// Browser QA for the premium report PDF render flow.
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { hasMostlyBlankTrailingPage } from './lib/pdf-page-guards.mjs';
import { assertReportTextQuality } from './lib/report-text-quality.mjs';

const ROOT = process.cwd();
const DEFAULT_KEY = 'sx_7_w8';
const DEFAULT_VERSION = 'v1';
const CHEMISTRY_DIR = path.join(ROOT, 'docs/report-content/chemistry');
const CHEMISTRY_SELECTOR = '#report-chemistry';
const V2_SELECTOR = '.er-report-v2';
const PDF_BUTTON_SELECTOR = '#download-pdf-btn';
const args = new Set(process.argv.slice(2));

function printHelp() {
  console.log(`Usage: node scripts/qa_premium_report_pdf.mjs [--key <combination_key>] [--version <v1|v2>] [--output <file>]

Validates the premium report PDF render flow:
- opens /test.html?debugReport=<combination_key>
- verifies ${CHEMISTRY_SELECTOR} is rendered
- for V2, verifies ${V2_SELECTOR} is rendered through /test.html?debugReport=${DEFAULT_KEY}&reportVersion=v2
- checks the page includes ${PDF_BUTTON_SELECTOR}
- renders the page to PDF through the Codex Playwright CLI wrapper
- saves and checks the PDF artifact

Defaults:
- key: ${DEFAULT_KEY}
- version: ${DEFAULT_VERSION}
- output: ${path.join(os.tmpdir(), 'er-premium-report-<combination_key>[-v2].pdf')}
- default route: ${getReportRoute(DEFAULT_KEY, DEFAULT_VERSION)}
- V2 route: ${getReportRoute(DEFAULT_KEY, 'v2')}

Requires the Codex Playwright CLI wrapper at:
  $PWCLI or ~/.codex/skills/playwright/scripts/playwright_cli.sh`);
}

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

function getReportRoute(key, version = DEFAULT_VERSION) {
  const route = `/test.html?debugReport=${encodeURIComponent(key)}`;
  return version === 'v2' ? `${route}&reportVersion=v2` : route;
}

function getDefaultOutputPath(key, version = DEFAULT_VERSION) {
  const suffix = version === 'v2' ? '-v2' : '';
  return path.join(os.tmpdir(), `er-premium-report-${key.replaceAll('_', '-')}${suffix}.pdf`);
}

function readChemistryCard(key) {
  if (!/^(sp|sx|so)_[1-9]_w[1-9]$/.test(key)) return null;
  const filePath = path.join(CHEMISTRY_DIR, `${key}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getPwcliPath() {
  if (process.env.PWCLI) return process.env.PWCLI;
  return path.join(os.homedir(), '.codex/skills/playwright/scripts/playwright_cli.sh');
}

function runPwcli(pwcliPath, session, args, cwd) {
  return spawnSync(pwcliPath, ['--session', session, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000,
  });
}

function runRequiredPwcli(pwcliPath, session, label, args, cwd) {
  console.log(`QA step: ${label}`);
  const result = runPwcli(pwcliPath, session, args, cwd);
  if (result.error) {
    console.error(`${label} failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status === 0) return result;
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  process.exit(result.status || 1);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function startStaticServer(root) {
  const port = await getFreePort();
  const child = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('exit', (code) => {
    if (code && code !== 0) console.error(`Static server exited with ${code}: ${stderr}`);
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { child, port };
}

function assertPdfLooksValid(outputPath) {
  if (!fs.existsSync(outputPath)) throw new Error(`Missing PDF output: ${outputPath}`);
  const stat = fs.statSync(outputPath);
  if (stat.size < 50000) throw new Error(`PDF output is unexpectedly small: ${stat.size} bytes`);
  const header = fs.readFileSync(outputPath).subarray(0, 5).toString('utf8');
  if (header !== '%PDF-') throw new Error(`PDF output has invalid header: ${JSON.stringify(header)}`);
}

function assertOutputContains(result, needle, label) {
  if (!result.stdout.includes(needle)) {
    throw new Error(`${label} missing expected text: ${needle}`);
  }
}

function assertNoConsoleErrors(result) {
  if (!result.stdout.includes('Errors: 0')) {
    throw new Error(`Console errors were not clean:\n${result.stdout}\n${result.stderr}`);
  }
}

function getPdfPageTextLengths(outputPath) {
  const result = spawnSync('python3', ['-c', [
    'import json',
    'import sys',
    'try:',
    '    from pypdf import PdfReader',
    'except Exception:',
    '    sys.exit(2)',
    'reader = PdfReader(sys.argv[1])',
    'print(json.dumps([len((page.extract_text() or "").strip()) for page in reader.pages]))',
  ].join('\n'), outputPath], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function getPdfExtractedText(outputPath) {
  const result = spawnSync('python3', ['-c', [
    'import json',
    'import sys',
    'try:',
    '    from pypdf import PdfReader',
    'except Exception:',
    '    sys.exit(2)',
    'reader = PdfReader(sys.argv[1])',
    'print(json.dumps([(page.extract_text() or "").strip() for page in reader.pages], ensure_ascii=False))',
  ].join('\n'), outputPath], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout).join('\n\n');
  } catch {
    return null;
  }
}

function assertNoMostlyBlankTrailingPage(outputPath) {
  const pageTextLengths = getPdfPageTextLengths(outputPath);
  if (!pageTextLengths) return null;
  if (hasMostlyBlankTrailingPage(pageTextLengths)) {
    const pageCount = pageTextLengths.length;
    const lastLength = pageTextLengths.at(-1);
    const previousLength = pageTextLengths.at(-2);
    throw new Error(
      `PDF has a mostly blank trailing page: page ${pageCount} text length ${lastLength}, previous page text length ${previousLength}`
    );
  }
  return pageTextLengths;
}

function assertV2PdfQuality(outputPath, pageCount) {
  if (pageCount == null) {
    throw new Error('V2 PDF page count could not be extracted');
  }
  if (pageCount < 18 || pageCount > 22) {
    throw new Error(`V2 PDF page count must be 18-22 pages, got ${pageCount}`);
  }
  const text = getPdfExtractedText(outputPath);
  if (!text) throw new Error('V2 PDF text could not be extracted');
  assertReportTextQuality(text, {
    ignoredPhrases: [
      'ER Enneagram for Restoration',
      'Enneagram for Restoration',
      'Enneagram Premium Report',
      'Premium Report',
      'Core Motivation And Fear',
      'Wing And Adjacent Types',
      'SX 7w8',
      'Page',
    ],
  });
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    printHelp();
    return;
  }

  const reportVersion = getReportVersion();
  const chemistryKey = getArgValue('--key') || DEFAULT_KEY;
  const chemistryCard = readChemistryCard(chemistryKey);
  if (!chemistryCard) {
    console.error(`Unknown chemistry combination key: ${chemistryKey}`);
    process.exit(1);
  }

  const outputPath = path.resolve(getArgValue('--output') || getDefaultOutputPath(chemistryKey, reportVersion));
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  const pwcliPath = getPwcliPath();
  if (!fs.existsSync(pwcliPath)) {
    console.error(`Missing Playwright CLI wrapper: ${pwcliPath}`);
    process.exit(1);
  }

  const { child: server, port } = await startStaticServer(ROOT);
  const url = `http://127.0.0.1:${port}${getReportRoute(chemistryKey, reportVersion)}`;
  const session = `er-report-pdf-${Date.now()}`;

  try {
    runRequiredPwcli(pwcliPath, session, 'open debug report', ['open', url], outputDir);
    const reportSelector = reportVersion === 'v2' ? V2_SELECTOR : CHEMISTRY_SELECTOR;
    const reportSnapshot = runRequiredPwcli(pwcliPath, session, 'snapshot report section', ['snapshot', reportSelector], outputDir);
    if (reportVersion === 'v2') {
      assertOutputContains(reportSnapshot, 'SX 7w8', 'V2 report snapshot');
      assertOutputContains(reportSnapshot, '적응형 에니어그램 심층 진단', 'V2 report snapshot');
      assertOutputContains(reportSnapshot, '한눈에 보는 결과', 'V2 report snapshot');
      assertOutputContains(reportSnapshot, '강점이 살아나는 자리', 'V2 report snapshot');
    } else {
      assertOutputContains(reportSnapshot, chemistryCard.display.one_page_title, 'Chemistry snapshot');
      assertOutputContains(reportSnapshot, chemistryCard.display.pull_quote, 'Chemistry snapshot');
      assertOutputContains(reportSnapshot, '강점과 적합 환경', 'Chemistry snapshot');
      assertOutputContains(reportSnapshot, '코칭 질문', 'Chemistry snapshot');
    }
    const buttonSnapshot = runRequiredPwcli(pwcliPath, session, 'snapshot PDF button', ['snapshot', PDF_BUTTON_SELECTOR], outputDir);
    assertOutputContains(buttonSnapshot, '결과 PDF 다운로드', 'PDF button snapshot');
    const result = runRequiredPwcli(pwcliPath, session, 'render PDF', ['pdf', '--filename', outputPath], outputDir);
    const consoleErrors = runRequiredPwcli(pwcliPath, session, 'check console errors', ['console', 'error'], outputDir);
    assertNoConsoleErrors(consoleErrors);
    assertPdfLooksValid(outputPath);
    const pageTextLengths = assertNoMostlyBlankTrailingPage(outputPath);
    const pageCount = pageTextLengths ? pageTextLengths.length : null;
    if (reportVersion === 'v2') {
      assertV2PdfQuality(outputPath, pageCount);
    } else if (pageCount != null && pageCount < 2) {
      throw new Error(`PDF page count is unexpectedly low: ${pageCount}`);
    }
    process.stdout.write(result.stdout || '');
    if (result.stderr) process.stderr.write(result.stderr);
    if (pageCount != null) console.log(`PDF pages: ${pageCount}`);
    console.log(`OK: premium report PDF QA passed for ${chemistryKey} ${reportVersion} (${path.relative(ROOT, outputPath)})`);
  } finally {
    runPwcli(pwcliPath, session, ['close'], outputDir);
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
