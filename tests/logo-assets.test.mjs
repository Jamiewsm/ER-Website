import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);

function readPngSize(file) {
  const data = readFileSync(new URL(file, root));
  assert.equal(data.toString('ascii', 1, 4), 'PNG', `${file} should be a PNG`);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

function readPngColorType(file) {
  const data = readFileSync(new URL(file, root));
  return data.readUInt8(25);
}

function sha256(file) {
  return createHash('sha256')
    .update(readFileSync(new URL(file, root)))
    .digest('hex');
}

test('website ER logo assets use the current trimmed brand files', () => {
  assert.deepEqual(readPngSize('ER-logo-header.png'), { width: 347, height: 98 });
  assert.deepEqual(readPngSize('ER-logo-footer.png'), { width: 347, height: 98 });

  assert.equal(
    sha256('ER-logo-footer.png'),
    sha256('ER-logo-header.png'),
    'header and footer should share the same horizontal brand asset'
  );
});

test('favicon assets are transparent, correctly sized, and linked from site pages', () => {
  assert.deepEqual(readPngSize('favicon.png'), { width: 512, height: 512 });
  assert.deepEqual(readPngSize('favicon-32x32.png'), { width: 32, height: 32 });
  assert.equal(readPngColorType('favicon.png'), 6, 'favicon.png should use RGBA color');
  assert.equal(readPngColorType('favicon-32x32.png'), 6, 'favicon-32x32.png should use RGBA color');

  const ico = readFileSync(new URL('favicon.ico', root));
  assert.equal(ico.readUInt16LE(0), 0, 'favicon.ico should begin with the ICO reserved field');
  assert.equal(ico.readUInt16LE(2), 1, 'favicon.ico should identify itself as an icon');
  assert.equal(ico.readUInt16LE(4), 3, 'favicon.ico should contain 16, 32, and 48px variants');

  const pages = [
    'index.html',
    'basic-course.html',
    'parenting-workshop.html',
    'parents-brochure.html',
    'parents-workshop.html',
    'child-type-test/child-type-test.html',
  ];
  for (const page of pages) {
    const html = readFileSync(new URL(page, root), 'utf8');
    assert.match(html, /href="\/favicon\.ico"/, `${page} should link favicon.ico`);
    assert.match(html, /href="\/favicon-32x32\.png"/, `${page} should link the 32px favicon`);
    assert.match(html, /href="\/favicon\.png"/, `${page} should link the 512px favicon`);
  }
});

test('home restoration tool section does not render a logo image', () => {
  const homeSection = readFileSync(new URL('js/sections/home.js', root), 'utf8');

  assert.match(homeSection, /회복의 도구, 에니어그램/);
  assert.doesNotMatch(homeSection, /home-er-logo-stacked\.png/);
});

test('home hero includes a compact mobile basic-course status card', () => {
  const homeSection = readFileSync(new URL('js/sections/home.js', root), 'utf8');

  assert.match(homeSection, /showJulyBasicRecruitment/);
  assert.match(homeSection, /sm:hidden[\s\S]*7월 기본과정/);
  assert.match(homeSection, /기본과정 진행 중|7월 기본과정 개강/);
});
