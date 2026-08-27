import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const landing = read('basic-course.html');
const apply = read('js/sections/apply.js');
const promo = read('js/basic-course-promo.js');
const home = read('js/sections/home.js');
const training = read('js/sections/coach-training.js');
const notices = read('js/strings.js');
const catalog = read('js/program-catalog.js');

test('October basic course publishes matching KRW and USD prices across active entry points', () => {
  for (const source of [landing, apply, promo, home, notices, catalog]) {
    assert.match(source, /₩420,000/);
    assert.match(source, /₩380,000/);
    assert.match(source, /\$300/);
    assert.match(source, /\$270/);
  }
});

test('October application route uses October focus and collects region-aware payment preferences', () => {
  assert.match(landing, /focus=enneagram_basic_october/);
  assert.doesNotMatch(landing, /focus=enneagram_basic_july/);
  assert.match(apply, /focus: 'enneagram_basic_october'/);
  assert.match(apply, /name="payment_region" required/);
  assert.match(apply, /name="payment_preference" required/);
  assert.match(apply, /name="installment_preference"/);
});

test('expert course is an umbrella journey and has no standalone application CTA', () => {
  assert.match(training, /에니어그램 기본과정, 팔로우업 스터디, 1년 코칭스쿨/);
  assert.match(training, /href="\/basic-course\.html"/);
  assert.doesNotMatch(training, /renderSection\('apply'/);
  assert.doesNotMatch(training, /신청\/문의|코치양성 문의/);
  assert.doesNotMatch(notices, /전문가 양성반 5기·6기 모집/);
  assert.doesNotMatch(notices, /양성반 안내 보기|양성반 신청/);
});
