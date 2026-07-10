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
