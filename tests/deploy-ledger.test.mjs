// 현재 원장 형식과 성공한 배포만 기록하는 동작을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderDeployLedger } from '../scripts/update_deploy_ledger.mjs';

const ledger = readFileSync(new URL('../docs/_meta/DEPLOY_LEDGER.md', import.meta.url), 'utf8');
const options = {
  siteResult: 'success', testResult: 'skipped', sha: 'a'.repeat(40),
  verifiedAt: '2099-10-19T00:00:00Z',
  runUrl: 'https://github.com/Jamiewsm/ER-Website/actions/runs/123/attempts/1',
  by: 'automation', notes: 'site-only recovery',
};
const row = (text, surface) => text.split('\n').find(line => line.startsWith(`| **${surface}**`));

test('실제 현재 표·heading·drift를 갱신하고 미배포 Test/Edge 행을 보존한다', () => {
  const out = renderDeployLedger(ledger, options);
  assert.match(row(out, 'Site'), new RegExp(options.sha));
  assert.ok(row(out, 'Site').includes('`source` @'));
  assert.ok(!row(out, 'Site').includes('origin/main'));
  assert.match(out, /마지막 배포 검증: 2099-10-19T00:00:00Z/);
  assert.equal(row(out, 'Test runtime'), row(ledger, 'Test runtime'));
  assert.equal(row(out, 'Supabase Edge — 신청 관련 2함수'), row(ledger, 'Supabase Edge — 신청 관련 2함수'));
  assert.ok(out.includes(options.runUrl));
  assert.match(out, /\*\*Site:\*\*.*aaaaaaaa/);
});

test('both 의도라도 Site 실패면 성공한 Test만 기록한다', () => {
  const out = renderDeployLedger(ledger, { ...options, siteResult: 'failure', testResult: 'success' });
  assert.equal(row(out, 'Site'), row(ledger, 'Site'));
  assert.match(row(out, 'Test runtime'), new RegExp(options.sha));
  assert.match(out, /deploy test/);
  assert.doesNotMatch(out, /deploy site\+test/);
});

test('두 트랙 성공과 동일 실행의 재기록을 처리한다', () => {
  const both = { ...options, testResult: 'success' };
  const out = renderDeployLedger(ledger, both);
  assert.match(row(out, 'Site'), new RegExp(options.sha));
  assert.match(row(out, 'Test runtime'), new RegExp(options.sha));
  assert.equal(renderDeployLedger(out, both), out);
});

test('실패만 있는 실행·잘못된 메타데이터·누락된 표는 쓰기 전에 거부한다', () => {
  for (const invalid of [
    { siteResult: 'failure' }, { sha: 'main' }, { verifiedAt: 'yesterday' },
    { runUrl: 'javascript:bad' }, { testResult: 'unknown' },
  ]) assert.throws(() => renderDeployLedger(ledger, { ...options, ...invalid }));
  assert.throws(() => renderDeployLedger(ledger.replace(/^\| \*\*Site\*\*.*\n/m, ''), options));
  assert.throws(() => renderDeployLedger(ledger.replace('## 갱신 템플릿 (배포 후 복사)', 'no history marker'), options));
});

test('오래된 실행은 새 운영 상태를 덮어쓰지 않고 표 문자를 이스케이프한다', () => {
  const out = renderDeployLedger(ledger, { ...options, notes: 'a|b\n<script>bad</script>' });
  assert.ok(row(out, 'Site').includes('a&#124;b &lt;script&gt;bad&lt;/script&gt;'));
  assert.throws(() => renderDeployLedger(out, { ...options, verifiedAt: '2098-01-01T00:00:00Z', runUrl: options.runUrl.replace('/123/', '/124/') }));
});

test('workflow는 main 직접 push를 없애고 원장 PR 저장 실패를 전파한다', () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy-production.yml', import.meta.url), 'utf8');
  const job = workflow.split('\n  update-ledger:')[1].split('\n  notify:')[0];
  assert.doesNotMatch(job, /continue-on-error/);
  assert.match(job, /git push origin HEAD:/);
  assert.match(job, /github\.rest\.pulls\.create/);
  assert.match(job, /--site-result/);
  assert.match(job, /--test-result/);
  assert.match(workflow, /sha: \$\{\{ steps\.source\.outputs\.sha \}\}/);
  assert.equal((workflow.match(/ref: \$\{\{ needs\.resolve\.outputs\.sha \}\}/g) || []).length, 2);
});
