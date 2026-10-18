#!/usr/bin/env node
// 성공한 배포의 검증 메타데이터로 원장 표와 이력을 갱신하는 CI helper
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LEDGER_PATH = join(dirname(fileURLToPath(import.meta.url)), '../docs/_meta/DEPLOY_LEDGER.md');
const cell = value => String(value ?? '').replace(/[\r\n]+/g, ' ').replaceAll('&', '&amp;').replaceAll('|', '&#124;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('`', '&#96;');
const historyMarker = '## 갱신 템플릿 (배포 후 복사)';

export function renderDeployLedger(content, { siteResult, testResult, sha, verifiedAt, runUrl, by = 'github-actions', notes = '', method = 'GitHub Actions Deploy Production' }) {
  const results = ['success', 'failure', 'skipped', 'cancelled'];
  if (!results.includes(siteResult) || !results.includes(testResult)) throw new Error('Invalid deploy job results');
  const site = siteResult === 'success', test = testResult === 'success';
  if (!site && !test) throw new Error('No successful deploy to record');
  if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('A resolved full source SHA is required');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(verifiedAt || '') || !Number.isFinite(Date.parse(verifiedAt))) throw new Error('A verified UTC timestamp is required');
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/actions\/runs\/\d+(?:\/attempts\/\d+)?$/.test(runUrl || '')) throw new Error('A GitHub Actions run URL is required');
  if (!content.includes(historyMarker)) throw new Error('Ledger history marker is missing');
  const heading = /^## Live state \([^:]+: ([^)]+)\)/m;
  const previous = content.match(heading);
  if (!previous) throw new Error('Ledger live state heading is missing');
  if (Date.parse(previous[1]) > Date.parse(verifiedAt)) throw new Error('Refusing to replace newer verification with an older deploy');
  const marker = `<!-- deploy-run:${runUrl} -->`;
  if (content.includes(marker)) return content;
  const short = sha.slice(0, 7), track = site && test ? 'site+test' : site ? 'site' : 'test';
  const audit = `guard success; [run](${runUrl}); ${cell(notes || 'by ' + by)}`;
  const updateRow = (surface, label) => {
    const expression = new RegExp('^\\| \\*\\*' + surface + '\\*\\*[^|]*\\|.*$', 'm');
    if (!expression.test(content)) throw new Error(`Ledger row missing: ${surface}`);
    content = content.replace(expression, () => `| **${surface}**${label} | \`source\` @ \`${sha}\` | source \`${sha}\`; live guard passed | ${verifiedAt} | ${cell(method)} | ${audit} |`);
  };
  if (site) updateRow('Site', ' (landing, menu, home, child-type-test shell)');
  if (test) updateRow('Test runtime', '');
  content = content.replace(heading, `## Live state (마지막 배포 검증: ${verifiedAt})`);
  if (site) content = content.replace(/^- \*\*Site:\*\*.*$/m, () => `- **Site:** source \`${sha}\`; ${verifiedAt} live guard success. [배포 실행](${runUrl})과 원장 PR 병합 커밋을 구분한다.`);
  if (test) content = content.replace(/^- \*\*Test runtime:\*\*.*$/m, () => `- **Test runtime:** source \`${sha}\`; ${verifiedAt} test-only guard success. [배포 실행](${runUrl}).`);
  content = content.replace(/^- \*\*CI ledger 저장 실패:\*\*.*$/m, '- **CI ledger 저장:** 보호된 main에 직접 push하지 않고 CI 원장 PR로 저장한다. 이전 GH006 실패 기록은 아래 배포 이력에 보존한다.');
  const entry = [
    marker, `### ${verifiedAt} — deploy ${track}`,
    `- Source: \`${sha}\`. 검증 시각이며 별도 실제 upload 완료 시각을 추정하지 않는다.`,
    `- Site job: ${siteResult}; Test job: ${testResult}. 성공한 트랙만 위 표를 갱신한다.`,
    `- [배포 및 guard 로그](${runUrl}), by ${cell(by)}. ${cell(notes)}`, '',
  ].join('\n');
  return content.replace(historyMarker, () => entry + '\n' + historyMarker);
}

function main() {
  const flags = { '--site-result': 'siteResult', '--test-result': 'testResult', '--sha': 'sha', '--verified-at': 'verifiedAt', '--run-url': 'runUrl', '--by': 'by', '--notes': 'notes', '--method': 'method', '--track': 'track' };
  const options = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (key === '--help' || key === '-h') {
      console.log('Usage: update_deploy_ledger.mjs --site-result success|skipped|failure|cancelled --test-result RESULT --sha FULL_SHA --verified-at UTC --run-url URL [--by actor] [--notes text]');
      return;
    }
    if (!flags[key] || process.argv[i + 1] === undefined) throw new Error(`Invalid argument: ${key}`);
    options[flags[key]] = process.argv[++i];
  }
  if (options.track && !['site', 'test', 'both'].includes(options.track)) throw new Error('Invalid track');
  const content = readFileSync(LEDGER_PATH, 'utf8');
  const updated = renderDeployLedger(content, options);
  if (updated !== content) writeFileSync(LEDGER_PATH, updated);
  console.log(updated === content ? 'Ledger already records this run' : `Updated ${LEDGER_PATH}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
