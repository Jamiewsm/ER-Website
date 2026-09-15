// 공개 검색 페이지의 본문, 연결, 대표 주소와 배포 경로를 검증한다.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { inferDeployTrackFromPaths } from '../scripts/infer_deploy_track.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const pages = ['christian-enneagram/index.html', 'theology/index.html'];
const site = 'https://er-coaching.com';
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => attrs(m[0]));
const canonical = (html) => tags(html, 'link').filter((t) => t.rel === 'canonical').map((t) => t.href);
const meta = (html, name) => tags(html, 'meta').find((t) => t.name === name || t.property === name)?.content;
function fileFor(path) {
  if (path === '/') return 'index.html';
  const rel = decodeURIComponent(path.slice(1));
  if (path.endsWith('/')) return `${rel}index.html`;
  return rel.includes('.') ? rel : `${rel}.html`;
}

test('reading pages deliver unique metadata and article content without executable JavaScript', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const file of pages) {
    const html = read(file);
    const url = `${site}/${file.replace('index.html', '')}`;
    assert.deepEqual(canonical(html), [url]);
    assert.equal(meta(html, 'og:url'), url);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = meta(html, 'description');
    assert.ok(title && description);
    titles.add(title); descriptions.add(description);
    assert.equal(meta(html, 'og:title'), title);
    assert.equal(meta(html, 'twitter:description'), description);
    assert.equal(tags(html, 'h1').length, 1);
    assert.ok(tags(html, 'h2').length >= 5);
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(article?.replace(/<[^>]+>/g, '').trim().length > 1800);
    assert.doesNotMatch(html, /\bonclick=|<noscript|noindex|http-equiv="refresh"/);
    for (const script of tags(html, 'script')) assert.equal(script.type, 'application/ld+json');
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(data.url, url);
    assert.equal(data.name, html.match(/<h1>([^<]+)<\/h1>/)[1]);
    assert.equal(data.description, description);
    assert.doesNotMatch(html, /SKILL\.md|AGENTS\.md|Theological & Editorial Standard/);
  }
  assert.equal(titles.size, pages.length);
  assert.equal(descriptions.size, pages.length);
});

test('reading page headers mirror main-site IA with CSS-only mobile nav', () => {
  const css = read('css/reading.css');
  assert.match(css, /\.desktop-nav\s*\{/);
  assert.match(css, /:has\(\.nav-toggle:checked\)/);
  assert.match(css, /min-width:\s*1280px/);
  for (const file of [...pages, 'biblical-enneagram/index.html']) {
    const html = read(file);
    assert.match(html, /class="desktop-nav"/);
    assert.match(html, /ER 소개/);
    assert.match(html, /Parenting/);
    assert.match(html, /href="\/theology\/"/);
    assert.match(html, /href="\/christian-enneagram\/"/);
    assert.match(html, /href="\/#coaches"/);
    assert.match(html, /id="nav-toggle"/);
    assert.match(html, /id="mobile-panel"/);
    assert.doesNotMatch(html, /\bonclick=/);
  }
  assert.match(read('theology/index.html'), /aria-current="page"[^>]*>신학적 기초|신학적 기초[^<]*aria-current="page"/);
  assert.match(read('christian-enneagram/index.html'), /aria-current="page"[^>]*>기독교 에니어그램 안내|기독교 에니어그램 안내[^<]*aria-current="page"/);
});

test('reading pages have real local targets and valid in-page anchors', () => {
  for (const file of pages) {
    const html = read(file);
    for (const tag of [...tags(html, 'a'), ...tags(html, 'link'), ...tags(html, 'img')]) {
      const href = tag.href || tag.src;
      if (!href || /^(?:https:|mailto:)/.test(href)) continue;
      const url = new URL(href, `${site}/${file.replace('index.html', '')}`);
      const target = fileFor(url.pathname);
      assert.ok(existsSync(new URL(target, root)), `${file}: missing ${href}`);
      // Root hashes are existing SPA routes; article hashes must name actual elements.
      if (url.hash && url.pathname !== '/') {
        assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), `missing anchor ${href}`);
      }
    }
  }
});

test('home and course expose crawlable guide links and a return path to enrollment', () => {
  for (const file of ['index.html', 'js/sections/home.js', 'basic-course.html']) {
    assert.match(read(file), /href="\/christian-enneagram\/"/);
  }
  assert.match(read('basic-course.html'), /href="\/theology\/"/);
  assert.match(read('basic-course.html'), /href="\/#apply\?track=paid&focus=enneagram_basic_october/);
  for (const file of pages) assert.match(read(file), /href="\/basic-course"/);
});

test('sitemap uses canonical site documents and excludes retired biblical URL', () => {
  const xml = read('sitemap.xml');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(urls.length, new Set(urls).size);
  assert.ok(!urls.some((u) => u.includes('#') || u.includes('parents-workshop') || u.includes('biblical-enneagram')));
  for (const url of urls) {
    const { pathname } = new URL(url);
    assert.ok(existsSync(new URL(fileFor(pathname), root)), url);
    // Test runtime belongs to its own deployment track and is not changed here.
    if (pathname === '/test.html') continue;
    assert.deepEqual(canonical(read(fileFor(pathname))), [url]);
  }
  for (const file of pages) assert.ok(urls.includes(`${site}/${file.replace('index.html', '')}`));
});

test('biblical-enneagram points readers to theology and stays out of the primary sitemap', () => {
  const html = read('biblical-enneagram/index.html');
  assert.deepEqual(canonical(html), [`${site}/theology/`]);
  assert.match(html, /href="\/theology\/"/);
  assert.match(html, /noindex/);
  assert.match(read('_redirects'), /\/biblical-enneagram\/\s+\/theology\/\s+301/);
});

test('reading assets can be crawled and independently trigger site-only deployment', () => {
  const robots = read('robots.txt');
  assert.match(robots, /Sitemap: https:\/\/er-coaching.com\/sitemap.xml/);
  assert.match(robots, /Allow: \/design-system\/tokens\.css/);
  const css = read('css/reading.css');
  assert.match(css, /@import url\('\/design-system\/tokens\.css'\)/);
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b/i);
  const paths = [...pages, 'biblical-enneagram/index.html', 'css/reading.css', 'design-system/tokens.css', '_redirects'];
  for (const path of paths) assert.equal(inferDeployTrackFromPaths([path]).track, 'site');
  const workflow = read('.github/workflows/deploy-production.yml');
  for (const path of ['christian-enneagram/**', 'theology/**', 'biblical-enneagram/**', 'css/reading.css', 'design-system/tokens.css', '_redirects']) {
    assert.ok(workflow.includes(`- '${path}'`), path);
  }
});

test('theology copy keeps Original Design as unfolding purpose rather than self-discovery', () => {
  const html = read('theology/index.html');
  assert.doesNotMatch(html, /하나님께 알려지고/);
  assert.doesNotMatch(html, /고유성을 지우시는 것이 아니라 정화하고/);
  assert.match(html, /한 사람 한 사람을 아시고 뜻 가운데 지으셨습니다/);
  assert.match(html, /하나님께로부터 주어집니다/);
  assert.match(html, /기질과 능력이 성령 안에서 새로워지고/);
  assert.match(html, /ER의 비전/);
  assert.match(html, /더욱 온전히 펼쳐지고/);
  assert.match(html, /이것이 ER이 꿈꾸는 Restoration입니다/);
  assert.match(html, /선하신 뜻과 계획/);
  assert.doesNotMatch(html, /창조적 의도/);
  assert.match(html, /유형은 정체성을 결정하지 않습니다/);
  assert.match(html, /성경적 에니어그램/);
});

test('theology keeps legacy biblical-enneagram fragment aliases after redirect', () => {
  const html = read('theology/index.html');
  for (const id of ['bible', 'identity', 'fixation', 'restoration', 'fruit', 'next']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="theology-fixation"/);
});

test('christian page stays introductory and defers theology definitions', () => {
  const html = read('christian-enneagram/index.html');
  assert.match(html, /href="\/theology\/"/);
  assert.doesNotMatch(html, /biblical-enneagram/);
  assert.doesNotMatch(html, /id="design"/);
  assert.match(html, /자기 관찰에서 관계의 변화로/);
});
