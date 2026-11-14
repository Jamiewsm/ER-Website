import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

test('sync applies without a helper, skips unchanged packages, and retries failed reloads', () => {
  const dir = mkdtempSync(join(tmpdir(), 'er-sync-test-'));
  try {
    const source = join(dir, 'source');
    const bin = join(dir, 'bin');
    mkdirSync(bin);
    const calls = join(dir, 'calls');
    writeFileSync(join(bin, 'codex'), '#!/bin/sh\necho call >> "$SYNC_TEST_CALLS"\n[ "$SYNC_TEST_FAIL" != "1" ]\n', { mode: 0o755 });
    for (const name of ['er-education', 'er-coach', 'er-website']) {
      for (const [file, content] of Object.entries({'.codex-plugin/plugin.json': JSON.stringify({name, version: '0.1.0'}), '.mcp.json': '{}', 'skills/operations/SKILL.md': 'instructions'})) {
        const path = join(source, 'plugins', name, file);
        mkdirSync(resolve(path, '..'), { recursive: true });
        writeFileSync(path, content);
      }
    }
    const run = (fail = false) => spawnSync(process.execPath, [resolve('scripts/sync_er_plugins.mjs'), '--apply'], { encoding: 'utf8', env: {...process.env, HOME: dir, ER_PLUGIN_SOURCE_ROOT: source, PATH: `${bin}:${process.env.PATH}`, SYNC_TEST_CALLS: calls, SYNC_TEST_FAIL: fail ? '1' : '0'} });
    assert.equal(run().status, 0);
    assert.equal(readFileSync(calls, 'utf8').trim().split('\n').length, 3);
    const manifest = join(dir, 'plugins/er-education/.codex-plugin/plugin.json');
    assert.match(JSON.parse(readFileSync(manifest)).version, /^0\.1\.0\+codex\./);
    assert.match(run().stdout, /All local packages match/);
    assert.equal(readFileSync(calls, 'utf8').trim().split('\n').length, 3);
    writeFileSync(join(source, 'plugins/er-education/skills/operations/SKILL.md'), 'changed');
    assert.notEqual(run(true).status, 0);
    assert.equal(JSON.parse(readFileSync(manifest)).version, '0.1.0-sync-pending');
    assert.equal(run().status, 0);
    assert.match(run().stdout, /All local packages match/);
    assert.equal(readFileSync(calls, 'utf8').trim().split('\n').length, 5);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
