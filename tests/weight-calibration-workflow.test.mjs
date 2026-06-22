import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
