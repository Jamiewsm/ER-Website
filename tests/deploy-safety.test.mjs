import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const buildScript = fileURLToPath(new URL('../scripts/build_test_only_deploy_bundle.mjs', import.meta.url));
const siteBuildScript = fileURLToPath(new URL('../scripts/build_site_only_deploy_bundle.mjs', import.meta.url));
const verifyScript = fileURLToPath(new URL('../scripts/verify_live_test_deploy.mjs', import.meta.url));
const assetsIgnorePath = fileURLToPath(new URL('../.assetsignore', import.meta.url));
const execFileAsync = promisify(execFile);

function makeDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeFile(root, rel, content) {
  const full = join(root, rel);
  mkdirSync(full.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(full, content);
}

function makeBuildFixture() {
  const root = makeDir('er-deploy-build-');
  const base = join(root, 'base');
  const source = join(root, 'source');
  const live = join(root, 'live');
  const out = join(root, 'out');

  writeFile(base, 'index.html', 'OLD LANDING');
  writeFile(base, 'js/sections/home.js', 'OLD HOME');
  writeFile(base, 'wrangler.toml', 'name = "er-coaching-site"');
  writeFile(base, 'child-type-test/child-type-test.html', 'CHILD TYPE PAGE');
  writeFile(base, 'about.html', 'base-only page should remain');
  writeFile(base, 'business/package.json', '{"private":true}');

  writeFile(source, 'index.html', 'SOURCE LANDING MUST NOT DEPLOY');
  writeFile(source, 'js/sections/home.js', 'SOURCE HOME MUST NOT DEPLOY');
  writeFile(source, 'test.html', '<script src="js/test.js"></script>');
  writeFile(source, 'css/test.css', '.er-report-application-map{}');
  writeFile(source, 'js/test.js', 'buildResponseQualitySnapshot center_auto_1 instinct_attention_1 SUBTYPE_BEHAVIOR_ITEMS tb_2_9_1 er-report-application-map');
  writeFile(source, 'js/diagnostic-experiment.js', 'const marker = "experiment_payload";');
  writeFile(source, 'js/diagnostic-report-content.js', 'window.content = true;');
  writeFile(source, 'js/report-support-materials.js', 'window.support = true;');
  writeFile(source, 'test-results/background.png', 'png');
  writeFile(source, 'test-results/background_card.png', 'png');
  writeFile(source, 'test-results/background_vase.png', 'png');
  writeFile(source, 'test-results/backgrdound_road.png', 'png');

  writeFile(live, 'index.html', 'LIVE LANDING 유형검사 프리미엄 검사 child-type-test/child-type-test.html <script defer src="https://static.cloudflareinsights.com/beacon.min.js"></script>');
  writeFile(live, 'js/sections/home.js', 'LIVE HOME home-parent-child-photo.jpg home-couple-photo.jpg home-team-photo.jpg hands and green.png green and seat.png');

  return { base, source, live, out };
}

function makeVerifyFixture({ omitTestMarker = false } = {}) {
  const root = makeDir('er-deploy-verify-');
  writeFile(root, 'index.html', '유형검사 프리미엄 검사 child-type-test/child-type-test.html js/sections/home.js?v=20260613g');
  writeFile(root, 'js/sections/home.js', 'home-parent-child-photo.jpg home-couple-photo.jpg home-team-photo.jpg hands and green.png green and seat.png');
  writeFile(root, 'child-type-test/child-type-test.html', 'child type page is present');
  writeFile(root, 'test.html', 'css/test.css js/diagnostic-experiment.js js/report-support-materials.js js/test.js');
  writeFile(root, 'js/test.js', omitTestMarker ? 'missing test marker' : 'buildResponseQualitySnapshot buildConfidenceExplanation center_auto_1 instinct_attention_1 SUBTYPE_BEHAVIOR_ITEMS tb_2_9_1 er-report-application-map');
  writeFile(root, 'js/diagnostic-experiment.js', 'buildExperimentAnalyticsPayload experiment_payload feedback_detail');
  writeFile(root, 'css/test.css', 'background_vase.png er-report-application-map er-report-application-map-card');
  writeFile(root, 'test-results/background.png', 'png');
  return root;
}

test('test-only deploy bundle preserves live landing and overlays only allowed test files', () => {
  const { base, source, live, out } = makeBuildFixture();

  const output = execFileSync(process.execPath, [
    buildScript,
    '--base', base,
    '--source', source,
    '--out', out,
    '--site', `file://${live}`
  ], { encoding: 'utf8', timeout: 5000 });

  assert.match(output, /OK: built test-only deploy bundle/);
  const liveIndexWithoutBeacon = readFileSync(join(live, 'index.html'), 'utf8')
    .replace(/<script\b[^>]*static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*><\/script>\s*/gi, '');
  assert.equal(readFileSync(join(out, 'index.html'), 'utf8'), liveIndexWithoutBeacon);
  assert.equal(readFileSync(join(out, 'js/sections/home.js'), 'utf8'), readFileSync(join(live, 'js/sections/home.js'), 'utf8'));
  assert.equal(readFileSync(join(out, 'test.html'), 'utf8'), readFileSync(join(source, 'test.html'), 'utf8'));
  assert.equal(readFileSync(join(out, 'js/test.js'), 'utf8'), readFileSync(join(source, 'js/test.js'), 'utf8'));
  assert.equal(readFileSync(join(out, 'about.html'), 'utf8'), 'base-only page should remain');
  assert.equal(existsSync(join(out, 'business')), false);
  assert.notEqual(readFileSync(join(out, 'index.html'), 'utf8'), 'SOURCE LANDING MUST NOT DEPLOY');
  assert.doesNotMatch(readFileSync(join(out, 'index.html'), 'utf8'), /static\.cloudflareinsights\.com/);
});

test('root Worker assets exclude the independently deployed business app', () => {
  const assetsIgnore = readFileSync(assetsIgnorePath, 'utf8');
  assert.match(assetsIgnore, /^business\/\*\*$/m);
});

test('live deployment verifier passes required production markers and fails missing test markers', () => {
  const goodRoot = makeVerifyFixture();
  const good = execFileSync(process.execPath, [
    verifyScript,
    '--site', `file://${goodRoot}`,
    '--min-child-bytes', '10'
  ], { encoding: 'utf8', timeout: 5000 });
  assert.match(good, /OK: production deployment guard passed/);

  const badRoot = makeVerifyFixture({ omitTestMarker: true });
  assert.throws(
    () => execFileSync(process.execPath, [
      verifyScript,
      '--site', `file://${badRoot}`,
      '--min-child-bytes', '10'
    ], { encoding: 'utf8', stdio: 'pipe', timeout: 5000 }),
    /Missing marker/
  );
});

test('live deployment verifier follows production redirects', async () => {
  const bodies = {
    '/landing.html': '유형검사 프리미엄 검사 child-type-test/child-type-test.html',
    '/js/sections/home.js': 'home-parent-child-photo.jpg home-couple-photo.jpg home-team-photo.jpg hands and green.png green and seat.png',
    '/child-type-test/child-type-test.html': 'child type page is present',
    '/test.html': 'css/test.css js/diagnostic-experiment.js js/report-support-materials.js js/test.js',
    '/js/test.js': 'buildResponseQualitySnapshot buildConfidenceExplanation center_auto_1 instinct_attention_1 SUBTYPE_BEHAVIOR_ITEMS tb_2_9_1 er-report-application-map',
    '/js/diagnostic-experiment.js': 'buildExperimentAnalyticsPayload experiment_payload feedback_detail',
    '/css/test.css': 'background_vase.png er-report-application-map er-report-application-map-card',
    '/test-results/background.png': 'png'
  };
  const server = createServer((req, res) => {
    if (req.url === '/index.html') {
      res.writeHead(307, { Location: '/landing.html' });
      res.end();
      return;
    }
    const body = bodies[req.url || ''];
    if (!body) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      verifyScript,
      '--site', `http://127.0.0.1:${port}`,
      '--min-child-bytes', '10'
    ], { encoding: 'utf8', timeout: 5000 });
    assert.match(stdout, /OK: production deployment guard passed/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('site-only deploy bundle preserves live test runtime and deploys site from source', () => {
  const root = makeDir('er-site-deploy-');
  const source = join(root, 'source');
  const live = join(root, 'live');
  const out = join(root, 'out');

  writeFile(source, 'index.html', 'NEW SITE LANDING');
  writeFile(source, 'js/sections/home.js', 'NEW HOME');
  writeFile(source, 'test.html', 'LEGACY TEST FROM SOURCE MUST NOT WIN');
  writeFile(source, 'js/test.js', "id:'t2', triad:[2,3,4] LEGACY");
  writeFile(source, 'css/test.css', 'legacy css');
  writeFile(source, 'js/diagnostic-experiment.js', 'legacy exp');
  writeFile(source, 'js/diagnostic-report-content.js', 'legacy content');
  writeFile(source, 'js/report-support-materials.js', 'legacy support');
  writeFile(source, 'test-results/background.png', 'live-png');
  writeFile(source, 'business/public/index.html', 'BUSINESS MUST DEPLOY SEPARATELY');

  writeFile(live, 'test.html', 'LIVE TEST');
  writeFile(live, 'js/test.js', 'buildResponseQualitySnapshot center_auto_1 instinct_attention_1 SUBTYPE_BEHAVIOR_ITEMS tb_2_9_1 er-report-application-map');
  writeFile(live, 'css/test.css', 'live css');
  writeFile(live, 'js/diagnostic-experiment.js', 'buildExperimentAnalyticsPayload experiment_payload feedback_detail');
  writeFile(live, 'js/diagnostic-report-content.js', 'live content');
  writeFile(live, 'js/report-support-materials.js', 'live support');
  writeFile(live, 'test-results/background.png', 'live-png');
  writeFile(live, 'test-results/background_card.png', 'live-png');
  writeFile(live, 'test-results/background_vase.png', 'live-png');
  writeFile(live, 'test-results/backgrdound_road.png', 'live-png');

  const output = execFileSync(process.execPath, [
    siteBuildScript,
    '--source', source,
    '--out', out,
    '--site', `file://${live}`
  ], { encoding: 'utf8', timeout: 5000 });

  assert.match(output, /OK: built site-only deploy bundle/);
  assert.equal(readFileSync(join(out, 'index.html'), 'utf8'), 'NEW SITE LANDING');
  assert.equal(readFileSync(join(out, 'js/sections/home.js'), 'utf8'), 'NEW HOME');
  assert.equal(readFileSync(join(out, 'js/test.js'), 'utf8'), readFileSync(join(live, 'js/test.js'), 'utf8'));
  assert.doesNotMatch(readFileSync(join(out, 'js/test.js'), 'utf8'), /id:'t2'/);
  assert.equal(existsSync(join(out, 'business')), false);
});
