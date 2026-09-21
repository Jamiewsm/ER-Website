import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function createApp() {
  const shareStatus = { textContent: '' };
  const context = vm.createContext({
    window: { location: { origin: 'https://site.example.invalid' } },
    document: { getElementById: () => shareStatus }, navigator: {}, URL,
    state: {},
  });
  for (const path of ['js/config.js', 'js/app-helpers.js', 'js/sections/support.js', 'js/sections/apply.js']) {
    vm.runInContext(read(path), context, { filename: path });
  }
  return { context, shareStatus };
}

test('public account details render without payment controls or intake dependencies', () => {
  const { context } = createApp();
  const html = context.renderSupport();
  const { bank, us } = context.window.ER_SCHOLARSHIP_SUPPORT;
  for (const text of [bank.name, bank.number, bank.holder, us.methods, us.address, us.holder]) {
    assert.ok(html.includes(text));
  }
  assert.doesNotMatch(html, /<form\b|<input\b|<select\b|접수 준비|입금 방법 확인|입금 확인 요청|turnstile|정기후원|매월 함께하기|무료 코칭|심사를 통해 선정/);
  assert.match(html, /mailto:hello@er-coaching.com/);
  assert.equal(context.submitScholarshipInquiry, undefined);
  assert.equal(context.showScholarshipTransfer, undefined);
});

test('in-page calls to action retain the support route and move keyboard focus to existing sections', () => {
  const { context } = createApp();
  const html = context.renderSupport();
  const targets = [...html.matchAll(/onclick="scrollToScholarshipSection\('([^']+)'\)"/g)].map(match => match[1]);
  assert.equal(targets.filter(id => id === 'scholarship-giving-panel').length, 3);
  assert.ok(targets.includes('scholarship-how'));
  for (const id of new Set(targets)) {
    assert.ok(html.includes(`id="${id}" tabindex="-1"`));
    const calls = [];
    context.document.getElementById = requested => {
      assert.equal(requested, id);
      return {
        focus: options => calls.push(['focus', options.preventScroll]),
        scrollIntoView: options => calls.push(['scroll', options.block, options.behavior]),
      };
    };
    context.scrollToScholarshipSection(id);
    assert.deepEqual(calls, [['focus', true], ['scroll', 'start', 'instant']]);
  }
  context.document.getElementById = () => null;
  assert.doesNotThrow(() => context.scrollToScholarshipSection('removed-section'));
});

test('previously shared inquiry and acknowledgement routes lead to email contact, not a payment confirmation', () => {
  const { context } = createApp();
  const pages = [
    context.renderApply({ track: 'support' }),
    context.renderApply({ track: 'support', intent: 'transfer', region: 'US', service: 'venmo' }),
    context.renderThankYou({ scholarshipInquiry: 'true', transferRequest: 'true' }),
  ];
  for (const html of pages) {
    assert.match(html, /mailto:hello@er-coaching.com/);
    assert.match(html, /후원 계좌 보기/);
    assert.doesNotMatch(html, /<form\b|onsubmit|입금 확인 요청을 받았습니다|접수 중|접수 준비/);
  }
});

test('account and recipient strings are escaped before rendering', () => {
  const { context } = createApp();
  context.window.ER_SCHOLARSHIP_SUPPORT.bank.holder = '<img src=x onerror=attack()>';
  context.window.ER_SCHOLARSHIP_SUPPORT.us.address = '<script>attack()</script>';
  const html = context.renderScholarshipGivingPanel();
  assert.doesNotMatch(html, /<img|<script/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script&gt;/);
});

test('sharing still supports clipboard fallback and quiet native-share cancellation', async () => {
  const { context, shareStatus } = createApp();
  let copied;
  context.navigator.clipboard = { writeText: async value => { copied = value; } };
  await context.shareScholarshipPage();
  assert.equal(copied, 'https://site.example.invalid/#support');
  assert.match(shareStatus.textContent, /복사했습니다/);
  shareStatus.textContent = '';
  context.navigator.share = async () => { throw { name: 'AbortError' }; };
  await context.shareScholarshipPage();
  assert.equal(shareStatus.textContent, '');
});
