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
const octoberNotice = notices.slice(notices.indexOf('{ id: 8'), notices.indexOf('{ id: 7'));

test('October basic course publishes matching KRW and USD prices across active entry points', () => {
  for (const source of [landing, apply, promo, home, notices, catalog]) {
    assert.match(source, /₩450,000/);
    assert.match(source, /\$330/);
    assert.doesNotMatch(source, /₩470,000/);
  }
  for (const source of [landing, promo, home, octoberNotice]) {
    assert.doesNotMatch(source, /₩420,000|₩380,000|\$300|\$270/);
  }
  assert.doesNotMatch(apply, /에니어그램 기본과정 8주 \(\$300 \/ ₩420,000\)/);
  assert.doesNotMatch(catalog, /basic_course:\s*\{[^}]*total:\s*300/);
});

test('October public copy keeps capacity at eight without exposing internal class operations', () => {
  for (const source of [landing, apply, promo, home, octoberNotice, catalog]) {
    assert.match(source, /정원[^<\n']*8명|정원<\/span>8명/);
    assert.doesNotMatch(source, /A\/B|A반|B반|분반|지원 13명/);
  }
  assert.match(catalog, /정원 수로 폼을 자동 폐쇄하지 않는다/);
});

test('October application route uses October focus and collects region-aware payment preferences', () => {
  assert.match(landing, /focus=enneagram_basic_october/);
  assert.doesNotMatch(landing, /focus=enneagram_basic_july/);
  assert.match(apply, /focus: 'enneagram_basic_october'/);
  assert.match(apply, /name="payment_region" required/);
  assert.match(apply, /name="payment_preference" required/);
  assert.match(apply, /name="installment_preference"/);
  assert.match(apply, /name="kakao_id"/);
  assert.match(apply, /name="is_full_time_ministry"/);
  assert.match(apply, /name="ministry_context"/);
  assert.match(apply, /name="is_proxy_application"/);
  assert.match(apply, /name="proxy_name"/);
  assert.match(apply, /name="proxy_relationship"/);
  assert.match(apply, /name="proxy_contact"/);
  assert.match(apply, /name="payer_name"/);
  assert.match(apply, /value="kr_bank"/);
  assert.match(apply, /value="zelle"/);
  assert.match(apply, /value="venmo"/);
  assert.doesNotMatch(apply, /value="(?:kr_card|kakao_pay|naver_pay|paypal|card_installment)"/);
  assert.match(landing, /카카오뱅크 3333-37-8817302/);
  assert.match(apply, /카카오뱅크 3333-37-8817302/);
});

test('expert course is an umbrella journey and has no standalone application CTA', () => {
  assert.match(training, /에니어그램 기본과정, 팔로우업 스터디, 1년 코칭스쿨/);
  assert.match(training, /href="\/basic-course\.html"/);
  assert.doesNotMatch(training, /renderSection\('apply'/);
  assert.doesNotMatch(training, /신청\/문의|코치양성 문의/);
  assert.doesNotMatch(notices, /전문가 양성반 5기·6기 모집/);
  assert.doesNotMatch(notices, /양성반 안내 보기|양성반 신청/);
});
