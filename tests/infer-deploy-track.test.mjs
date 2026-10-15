import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { inferDeployTrackFromPaths, matchesSitePath, matchesTestPath } from '../scripts/infer_deploy_track.mjs';

for (const [track, deploySite, deployTest] of [['site', 'true', 'false'], ['test', 'false', 'true'], ['both', 'true', 'true']]) {
  test(`workflow dispatch preserves the requested ${track} track and audit inputs`, () => {
    const workflow = readFileSync(new URL('../.github/workflows/deploy-production.yml', import.meta.url), 'utf8');
    const script = workflow.split('          script: |\n')[1].split('\n  deploy-test:')[0]
      .split('\n').map(line => line.replace(/^ {12}/, '')).join('\n');
    const inputs = { track, ref: 'approved-release-sha', requested_by: 'auto-merge', reason: 'merged site PR' };
    const outputs = {};
    runInNewContext(script, {
      context: { eventName: 'workflow_dispatch', sha: 'workflow-sha', payload: { inputs } },
      core: { getInput: () => '', setOutput: (key, value) => { outputs[key] = value; } }
    });
    assert.deepEqual(outputs, {
      ...inputs, sha: 'workflow-sha', deploy_site: deploySite, deploy_test: deployTest
    });
  });
}

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
