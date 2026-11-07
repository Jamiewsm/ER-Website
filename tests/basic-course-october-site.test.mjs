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
  assert.match(apply, /data-apply-focus="enneagram_basic_october"/);
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
  assert.match(training, /에니어그램 기본과정, 101 하위유형 스터디, 선택 심화, 1년 코칭스쿨/);
  assert.match(training, /href="\/basic-course\.html"/);
  assert.doesNotMatch(training, /renderSection\('apply'/);
  assert.doesNotMatch(training, /신청\/문의|코치양성 문의/);
  assert.doesNotMatch(notices, /전문가 양성반 5기·6기 모집/);
  assert.doesNotMatch(notices, /양성반 안내 보기|양성반 신청/);
});

test('expert course surfaces registered private qualification without claiming national accreditation', () => {
  assert.match(training, /제 2026-008332호/);
  assert.match(training, /등록 민간자격/);
  assert.match(training, /ER에니어그램전문가 2급/);
  assert.match(training, /ER에니어그램전문가 1급/);
  assert.match(training, /href="\/enneagram-certification\/"/);
  assert.match(training, /국가 공인자격이 아니며/);
  assert.doesNotMatch(training, /국가공인 자격|국가자격|국가에서 인정/);
  assert.doesNotMatch(notices, /국가공인|국가자격/);
  assert.match(notices, /제 2026-008332호/);
  assert.match(notices, /심화성장 101|101 하위유형/);
});

test('expert course catalogs advanced study tracks with 101 required and electives planned', () => {
  assert.match(training, /id="advanced-studies"/);
  assert.match(training, /101/);
  assert.match(training, /하위유형 스터디 I/);
  assert.match(training, /하위유형 스터디 II/);
  assert.match(training, /트라이타입 스터디/);
  assert.match(training, /습관의 고리 스터디/);
  assert.match(training, /자녀교육/);
  assert.match(training, /커플·부부 관계/);
  assert.match(training, /직장생활/);
  assert.match(training, /성경인물 스터디/);
  assert.match(training, /드라마 스터디/);
  assert.match(training, /101만 필수/);
  assert.match(training, /진행 중/);
  assert.match(training, /개설 예정/);
  assert.match(notices, /101 하위유형 스터디/);
});

test('July cohort graduation is bundled and October $300 copy is not', () => {
  assert.match(notices, /\{ id: 9, tag: '축하', title: '에니어그램 기본과정 수료 — 7월반 13명'/);
  assert.equal((notices.match(/10월 기수 모집/g) || []).length, 1);
  assert.doesNotMatch(octoberNotice, /\$300/);
});
