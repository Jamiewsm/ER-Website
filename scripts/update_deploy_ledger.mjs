#!/usr/bin/env node
// 배포 완료 후 DEPLOY_LEDGER.md live state 테이블을 갱신하는 CI helper
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LEDGER_PATH = join(dirname(fileURLToPath(import.meta.url)), '../docs/_meta/DEPLOY_LEDGER.md');

function parseArgs(argv) {
  const out = {
    site: false,
    test: false,
    sha: process.env.GITHUB_SHA || 'unknown',
    method: 'CI',
    by: process.env.GITHUB_ACTOR || 'github-actions',
    notes: '',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--track') {
      const track = argv[++i];
      if (track === 'site' || track === 'both') out.site = true;
      if (track === 'test' || track === 'both') out.test = true;
    } else if (arg === '--sha') out.sha = argv[++i];
    else if (arg === '--method') out.method = argv[++i];
    else if (arg === '--by') out.by = argv[++i];
    else if (arg === '--notes') out.notes = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

function shortSha(sha) {
  return String(sha).slice(0, 7);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

function updateLedger({ site, test, sha, method, by, notes }) {
  let content = readFileSync(LEDGER_PATH, 'utf8');
  const today = isoDate();
  const shaShort = shortSha(sha);

  content = content.replace(
    /(\*\*Live state \(마지막 확인: )[^)]+(\))/,
    `$1${today}$2`
  );

  if (site) {
    content = content.replace(
      /\| \*\*Site\*\*[^|]*\| `[^`]*` \| [^|]* \| [^|]* \| [^|]* \| [^|]* \|/,
      `| **Site** (landing, menu, home, child-type-test shell) | \`origin/main\` @ \`${shaShort}\` | CI deploy @ \`${shaShort}\` | ${today} | ${method} | ${notes || `by ${by}`} |`
    );
  }

  if (test) {
    content = content.replace(
      /\| \*\*Test runtime\*\* \(`test\.html`[^|]*\| `[^`]*` \| [^|]* \| [^|]* \| [^|]* \| [^|]* \|/,
      `| **Test runtime** (\`test.html\`, \`js/test.js\`, \`css/test.css\`, experiment, report assets) | \`origin/main\` @ \`${shaShort}\` | CI test-bundle @ \`${shaShort}\` | ${today} | ${method} | ${notes || `by ${by}`} |`
    );
    content = content.replace(
      /\| \*\*Test runtime \(대기 중\)\*\*[^|]*\| `[^`]*` \| [^|]* \| [^|]* \| — \| [^|]* \|/,
      `| **Test runtime (대기 중)** | — | — | — | — | cleared after deploy |`
    );
  }

  const entry = [
    '',
    `### ${today} — deploy ${site && test ? 'site+test' : site ? 'site' : 'test'} (${method})`,
    `| Surface | Git ref | Method | By | Notes |`,
    `|---------|---------|--------|-----|-------|`,
  ];
  if (site) entry.push(`| Site | main @ ${shaShort} | ${method} | ${by} | ${notes || '-'} |`);
  if (test) entry.push(`| Test runtime | main @ ${shaShort} | test-only bundle | ${by} | ${notes || '-'} |`);

  const marker = '## 갱신 템플릿 (배포 후 복사)';
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    content = `${content.slice(0, idx)}${entry.join('\n')}\n\n${content.slice(idx)}`;
  }

  writeFileSync(LEDGER_PATH, content);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node scripts/update_deploy_ledger.mjs --track site|test|both [--sha SHA] [--method CI] [--by actor] [--notes text]');
    process.exit(0);
  }
  if (!args.site && !args.test) {
    console.error('Provide --track site, test, or both');
    process.exit(1);
  }
  updateLedger(args);
  console.log(`Updated ${LEDGER_PATH}`);
}

main();
