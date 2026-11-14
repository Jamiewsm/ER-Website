// 원장 CLI를 임시 복제본에서 실행해 실제 표 갱신과 오류 시 원문 보존을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

test('CLI가 현재 원장 행을 바꾸고 잘못된 실행은 파일을 바꾸지 않는다', t => {
  const dir = mkdtempSync(join(tmpdir(), 'er-ledger-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'scripts'));
  mkdirSync(join(dir, 'docs/_meta'), { recursive: true });
  const source = new URL('../scripts/update_deploy_ledger.mjs', import.meta.url);
  const path = join(dir, 'docs/_meta/DEPLOY_LEDGER.md');
  copyFileSync(source, join(dir, 'scripts/update_deploy_ledger.mjs'));
  copyFileSync(new URL('../docs/_meta/DEPLOY_LEDGER.md', import.meta.url), path);
  const args = ['scripts/update_deploy_ledger.mjs', '--track', 'site', '--site-result', 'success', '--test-result', 'skipped', '--sha', 'b'.repeat(40), '--verified-at', '2099-10-20T00:00:00Z', '--run-url', 'https://github.com/Jamiewsm/ER-Website/actions/runs/456/attempts/1'];
  const result = spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const updated = readFileSync(path, 'utf8');
  const siteRow = updated.split('\n').find(line => line.startsWith('| **Site**'));
  assert.ok(siteRow.includes('b'.repeat(40)), siteRow);
  const invalid = spawnSync(process.execPath, [...args, '--sha', 'main'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(invalid.status, 0);
  assert.equal(readFileSync(path, 'utf8'), updated);
});
