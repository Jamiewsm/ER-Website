import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = fileURLToPath(new URL('../scripts/analyze_diagnostic_experiments.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/diagnostic-experiments.sample.json', import.meta.url));

test('diagnostic experiment analyzer reports calibration metrics', () => {
  const output = execFileSync(process.execPath, [script, '--fixture', fixture], {
    encoding: 'utf8'
  });

  assert.match(output, /predicted_core -> confirmed_core count/);
  assert.match(output, /7 -> 9\s+1/);
  assert.match(output, /8 -> 6\s+1/);
  assert.match(output, /predicted_subtype -> confirmed_subtype count/);
  assert.match(output, /sx_7 -> sp_9\s+1/);
  assert.match(output, /low_confidence accuracy\s+0\/1 \(0\.0%\)/);
  assert.match(output, /quality_flag accuracy\s+0\/2 \(0\.0%\)/);
  assert.match(output, /tie_pair miss rate/);
  assert.match(output, /7-9\s+1\/1 \(100\.0%\)/);
  assert.match(output, /countertype miss rate\s+1\/2 \(50\.0%\)/);
  assert.match(output, /weight change gate/);
  assert.match(output, /usable rows:\s+4/);
});

function analyzeRows(rows, args = []) {
  const directory = mkdtempSync(join(tmpdir(), 'er-diagnostic-analysis-'));
  try {
    const input = join(directory, 'rows.json');
    writeFileSync(input, JSON.stringify(rows));
    return execFileSync(process.execPath, [script, '--input', input, ...args], { encoding: 'utf8' });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('missing reference subtype is excluded from countertype miss rate', () => {
  const output = analyzeRows([{ confirmed_core: 2, result_summary: { experiment_payload: { result: { core: 2, subtype: 'sp_2' } } } }]);
  assert.match(output, /usable rows: 1/);
  assert.match(output, /countertype miss rate 0\/0 \(N\/A\)/);
});

test('reversed top pairs are pooled into one confusion pair', () => {
  const output = analyzeRows([
    { confirmed_core: 7, result_summary: { experiment_payload: { result: { core: 7 }, topPair: { first: 7, second: 9 } } } },
    { confirmed_core: 9, result_summary: { experiment_payload: { result: { core: 7 }, topPair: { first: 9, second: 7 } } } }
  ]);
  assert.match(output, /7-9 1\/2 \(50\.0%\)/);
  assert.doesNotMatch(output, /^9-7 /m);
});

test('empty denominators report unavailable data instead of zero accuracy', () => {
  const output = analyzeRows([]);
  assert.match(output, /usable rows: 0/);
  assert.match(output, /low_confidence accuracy 0\/0 \(N\/A\)/);
  assert.match(output, /quality_flag accuracy 0\/0 \(N\/A\)/);
  assert.match(output, /countertype miss rate 0\/0 \(N\/A\)/);
  assert.doesNotMatch(output, /0\.0%/);
});

test('version and language filters isolate the current English assessment', () => {
  const row = (assessmentVersion, lang, core) => ({
    confirmed_core: 1, lang,
    result_summary: { experiment_payload: { assessmentVersion, result: { core } } }
  });
  const rows = [row('word-narrative-v2', 'en', 1), row('word-narrative-v2', 'ko', 9), row('word-narrative-v1', 'en', 8)];
  const mixed = analyzeRows(rows);
  assert.match(mixed, /Mixed cohorts:/);
  const selected = analyzeRows(rows, ['--assessment-version', 'word-narrative-v2', '--lang', 'en']);
  assert.match(selected, /selected rows: 1\/3/);
  assert.match(selected, /usable rows: 1/);
  assert.match(selected, /^1 -> 1 1$/m);
  assert.doesNotMatch(selected, /9 -> 1|8 -> 1|Mixed cohorts:/);
});
