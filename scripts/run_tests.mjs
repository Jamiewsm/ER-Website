#!/usr/bin/env node
// 로컬 PostgreSQL 실행 도구를 확인하고 격리 DB 검사를 포함한 전체 테스트를 실행한다.
import { accessSync, constants, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const complete = bin => {
  try {
    for (const name of ['postgres', 'initdb', 'pg_ctl', 'psql']) accessSync(join(bin, name), constants.X_OK);
    return true;
  } catch { return false; }
};

export function resolvePostgresBinDir(env = process.env) {
  if (env.PG_BIN_DIR) {
    if (!env.PG_BIN_DIR.includes('://') && complete(env.PG_BIN_DIR)) return env.PG_BIN_DIR;
    throw new Error('PG_BIN_DIR must name a complete local PostgreSQL binary directory, never a database URL');
  }
  const config = spawnSync('pg_config', ['--bindir'], { env, encoding: 'utf8', timeout: 5000 });
  if (config.status === 0 && complete(config.stdout.trim())) return config.stdout.trim();
  for (const app of [join(homedir(), 'Applications/Postgres.app'), '/Applications/Postgres.app']) {
    const versions = join(app, 'Contents/Versions');
    let names;
    try { names = readdirSync(versions).filter(name => /^\d+$/.test(name)).sort((a, b) => Number(b) - Number(a)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    for (const version of names) {
      const bin = join(versions, version, 'bin');
      if (complete(bin)) return bin;
    }
  }
  throw new Error('PostgreSQL tools not found. Install PostgreSQL and set PG_BIN_DIR or expose pg_config on PATH. See docs/projects/ops-reliability-20261019/verification.md');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const bin = resolvePostgresBinDir();
    console.log(`Disposable PostgreSQL tools: ${bin}; no external database URL is used.`);
    const tests = readdirSync(join(root, 'tests')).filter(name => name.endsWith('.test.mjs')).sort().map(name => join(root, 'tests', name));
    if (!tests.length) throw new Error('No test files found');
    const result = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, env: { ...process.env, PG_BIN_DIR: bin }, stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
