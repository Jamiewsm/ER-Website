import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferDeployTrackFromPaths, matchesSitePath, matchesTestPath } from '../scripts/infer_deploy_track.mjs';

test('infers test track from premium test paths', () => {
  const r = inferDeployTrackFromPaths(['js/test.js', 'docs/foo.md']);
  assert.equal(r.track, 'test');
  assert.equal(r.deployTest, true);
  assert.equal(r.deploySite, false);
});

test('infers site track from landing paths', () => {
  const r = inferDeployTrackFromPaths(['js/sections/home.js', 'ER-logo-header.png']);
  assert.equal(r.track, 'site');
  assert.equal(r.deploySite, true);
});

test('infers both when site and test paths change', () => {
  const r = inferDeployTrackFromPaths(['index.html', 'js/test.js']);
  assert.equal(r.track, 'both');
});

test('skips docs-only changes', () => {
  const r = inferDeployTrackFromPaths(['docs/_meta/foo.md', 'README.md']);
  assert.equal(r.track, 'skip');
});

test('matches helpers align with allowlists', () => {
  assert.equal(matchesTestPath('css/test.css'), true);
  assert.equal(matchesSitePath('child-type-test/child-type-test.html'), true);
  assert.equal(matchesSitePath('js/app-state.js'), true);
  assert.equal(matchesSitePath('assets/er-social-share-ministry.png'), true);
  assert.equal(matchesTestPath('index.html'), false);
});
