// 정적 페이지 헤더가 partials/site-header.html 과 동기화되고,
// SPA 관계·부부·교회·사역 메뉴가 Parenting과 같은 여정형 구조를 갖는지 검증한다.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const partial = readFileSync(join(root, 'partials/site-header.html'), 'utf8');

const staticPages = [
  'theology/index.html',
  'christian-enneagram/index.html',
  'biblical-enneagram/index.html',
  'enneagram-certification/index.html',
  'parenting-workshop.html',
  'parenting-seminar.html',
  'church-programs.html',
  'basic-course.html',
];

test('shared site-header CSS and partial exist', () => {
  assert.equal(existsSync(join(root, 'css/site-header.css')), true);
  assert.equal(existsSync(join(root, 'partials/site-header.html')), true);
  assert.match(partial, /관계·부부 소개/);
  assert.match(partial, /사역팀 팀워크 소개/);
  assert.match(partial, /parenting-workshop/);
  assert.match(partial, /에니어그램 교육/);
});

test('static pages include synced site header markers and full menus', () => {
  for (const file of staticPages) {
    const html = readFileSync(join(root, file), 'utf8');
    assert.match(html, /<!-- ER_SITE_HEADER_BEGIN -->/, file);
    assert.match(html, /<!-- ER_SITE_HEADER_END -->/, file);
    assert.match(html, /class="site-header"/, file);
    assert.match(html, /관계·부부/, file);
    assert.match(html, /교회·사역/, file);
    assert.match(html, /Parenting/, file);
    assert.match(html, /id="content"/, file);
    assert.doesNotMatch(html, /guide-header/, file);
  }
});

test('sync-site-header --check reports no drift', () => {
  const result = spawnSync(process.execPath, ['scripts/sync-site-header.mjs', '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('SPA couple and church menus follow parenting-style journey structure', () => {
  assert.match(indexHtml, /id="desktop-nav-couple"/);
  assert.match(indexHtml, /관계·부부 소개/);
  assert.match(indexHtml, /focus: 'couple'/);
  assert.match(indexHtml, /focus: 'result_consult'/);
  assert.match(indexHtml, /focus: 'recovery_journey_8'/);
  assert.match(indexHtml, /church-programs#couple/);

  assert.match(indexHtml, /id="desktop-nav-org"/);
  assert.match(indexHtml, /사역팀 팀워크 소개/);
  assert.match(indexHtml, /church-programs#teamwork/);
  assert.match(indexHtml, /focus: 'teamwork_seminar'/);
  assert.match(indexHtml, /교회·기관 세미나 한눈에/);

  assert.match(indexHtml, /id="mobile-nav-couple"/);
  assert.match(indexHtml, /id="mobile-nav-org"/);
  assert.match(indexHtml, /href="\/basic-course"/);
  assert.match(indexHtml, /href="\/enneagram-certification\/"/);
});
