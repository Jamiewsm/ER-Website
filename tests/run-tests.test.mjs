// 전체 검사 실행기의 PostgreSQL 경로 선택과 잘못된 설정 차단을 검증한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolvePostgresBinDir } from '../scripts/run_tests.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'er pg tools-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ['postgres', 'initdb', 'pg_ctl', 'psql']) writeFileSync(join(dir, name), '', { mode: 0o700 });
  return dir;
}

test('명시한 완전한 바이너리 경로를 우선하며 입력 환경은 바꾸지 않는다', t => {
  const dir = fixture(t), env = { PG_BIN_DIR: dir, PATH: '' };
  assert.equal(resolvePostgresBinDir(env), dir);
  assert.deepEqual(env, { PG_BIN_DIR: dir, PATH: '' });
});

test('명시한 URL·없는 경로·불완전한 도구를 자동 fallback 없이 거부한다', t => {
  const dir = fixture(t);
  rmSync(join(dir, 'postgres'));
  for (const value of ['postgres://example.invalid/prod', '/nonexistent-er-tools', dir]) {
    assert.throws(() => resolvePostgresBinDir({ PG_BIN_DIR: value }), /PG_BIN_DIR/);
  }
});

test('pg_config --bindir를 사용하고 공백을 포함한 경로도 보존한다', t => {
  const dir = fixture(t);
  writeFileSync(join(dir, 'pg_config'), `#!/bin/sh\nprintf '%s\\n' '${dir}'\n`, { mode: 0o700 });
  assert.equal(resolvePostgresBinDir({ PATH: dir }), dir);
});
