import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertPremiumTestSource, LEGACY_TEST_FORBIDDEN_MARKERS, PREMIUM_TEST_REQUIRED_MARKERS } from '../scripts/deploy-tracks.mjs';

const testJs = readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');
const testHtml = readFileSync(new URL('../test.html', import.meta.url), 'utf8');

test('js/test.js is premium runtime (required markers present)', () => {
  const errors = assertPremiumTestSource(testJs, testHtml);
  assert.deepEqual(errors, [], errors.join('; '));
});

test('js/test.js has no legacy phase-1 triad items (t2/t5/t8)', () => {
  for (const marker of LEGACY_TEST_FORBIDDEN_MARKERS) {
    assert.doesNotMatch(testJs, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('premium guard markers are documented in deploy-tracks SSOT', () => {
  assert.ok(PREMIUM_TEST_REQUIRED_MARKERS.includes('buildResponseQualitySnapshot'));
  assert.ok(LEGACY_TEST_FORBIDDEN_MARKERS.length >= 3);
});
