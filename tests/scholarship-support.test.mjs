import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const publicConfig = read('js/config.js');

function readyConfig() {
  return {
    inquiriesEnabled: true, acceptingContributions: true,
    recipientName: '가상 수령 주체', receiptNotice: '가상 테스트 영수증 안내',
    bank: { confirmed: true, name: '가상 은행', number: 'TEST-NOT-AN-ACCOUNT', holder: '가상 예금주' },
    zelle: { confirmed: true, address: 'synthetic@example.invalid', holder: 'TEST RECIPIENT' },
    venmo: { confirmed: true, address: '202-555-0100', holder: 'VENMO TEST RECIPIENT' },
  };
}

function createApp(config = readyConfig(), fetchImpl) {
  const nodes = new Map();
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', innerHTML: '', textContent: '', dataset: {},
      classList: { add() {}, remove() {} }, focus() {}, select() {},
    });
    return nodes.get(id);
  };
  const calls = { requests: [], routes: [] };
  const context = vm.createContext({
    window: { ER_SCHOLARSHIP_SUPPORT: config, SUPABASE_CONFIG: { url: 'https://database.example.invalid' }, location: { origin: 'https://site.example.invalid' } },
    document: { getElementById: get }, navigator: {}, URL,
    state: {},
    FormData: class {
      constructor(form) { this.form = form; }
      get(key) { return key === 'message' ? get('scholarship-inquiry-message').value : this.form.fields[key]; }
    },
    renderSection: (section, payload) => calls.routes.push({ section, payload }),
    async fetch(url, init) {
      calls.requests.push({ url, body: JSON.parse(init.body) });
      return fetchImpl ? fetchImpl() : { ok: true };
    },
  });
  for (const path of ['js/app-helpers.js', 'js/api.js', 'js/sections/support.js', 'js/sections/apply.js']) {
    vm.runInContext(read(path), context, { filename: path });
  }
  return { context, get, calls };
}

function formEvent(fields = {}) {
  return { preventDefault() {}, target: {
    reportValidity: () => true, dataset: {},
    fields: { name: '가상 문의자', contact: 'synthetic@example.invalid', category: '장학 후원 문의',
      support_note: '가상 문의 내용', privacy_agree: 'on', turnstile_token: 'synthetic-token', ...fields },
  } };
}

test('committed config keeps unconfirmed transfer instructions and online intake closed', () => {
  const app = createApp();
  vm.runInContext(publicConfig, app.context);
  assert.equal(app.context.getScholarshipPaymentConfig('KR').ready, false);
  assert.equal(app.context.getScholarshipPaymentConfig('US').ready, false);
  assert.match(app.context.renderSupport(), /disabled[^>]*>후원 접수 준비 중/);
  assert.match(app.context.renderApply({ track: 'support' }), /mailto:hello@er-coaching.com/);
  assert.doesNotMatch(app.context.renderApply({ track: 'support' }), /id="apply-form"/);
});

test('each payment method needs its own confirmation, holder, receipt notice, and complete address', () => {
  for (const field of ['acceptingContributions', 'recipientName', 'receiptNotice']) {
    const config = readyConfig(); config[field] = '';
    assert.equal(createApp(config).context.getScholarshipPaymentConfig('KR').ready, false);
  }
  for (const [region, key, fields] of [['KR', 'bank', ['confirmed', 'holder', 'name', 'number']], ['US', 'zelle', ['confirmed', 'holder', 'address']], ['US', 'venmo', ['confirmed', 'holder', 'address']]]) {
    for (const field of fields) {
      const config = readyConfig(); config[key][field] = '';
      const context = createApp(config).context;
      assert.equal(context.getScholarshipPaymentConfig(region, key).ready, false);
      assert.equal(context.getScholarshipPaymentConfig(region === 'KR' ? 'US' : 'KR').ready, true);
    }
  }
});

test('amounts accept positive KRW integers or USD cents and reject ambiguous or unsafe inputs', () => {
  const { context } = createApp();
  for (const bad of ['', '0', '-1', 'NaN', 'Infinity', '1e4', '1,000', '<script>', '1.234', '9999999999999']) {
    for (const region of ['KR', 'US']) assert.equal(context.parseScholarshipAmount(bad, region), null, `${region}: ${bad}`);
  }
  assert.equal(context.parseScholarshipAmount('1.5', 'KR'), null);
  assert.equal(context.parseScholarshipAmount('10000', 'KR'), 10000);
  assert.equal(context.parseScholarshipAmount('10.05', 'US'), 10.05);
  assert.equal(context.parseScholarshipAmount('0.01', 'US'), 0.01);
});

test('region and frequency changes clear stale transfer instructions; country resets the amount', () => {
  const { context, get } = createApp();
  context.selectScholarshipAmount(30000);
  get('scholarship-transfer').innerHTML = 'old';
  context.changeScholarshipRegion('US');
  assert.equal(context.scholarshipSelection.amount, '');
  assert.match(get('scholarship-giving-panel').outerHTML, /\$30 USD/);
  context.changeScholarshipFrequency('monthly');
  assert.equal(get('scholarship-transfer').innerHTML, '');
  assert.match(context.scholarshipFrequencyNote(), /이용 은행/);
  context.changeScholarshipRegion('KR');
  assert.match(context.scholarshipFrequencyNote(), /은행 앱에서 자동이체/);
});

test('transfer details escape config and preserve only the selected currency in the inquiry URL', () => {
  const config = readyConfig(); config.bank.holder = '<img onerror="attack()">';
  const { context, get } = createApp(config);
  get('scholarship-amount').value = '30000';
  context.showScholarshipTransfer({ preventDefault() {} });
  const html = get('scholarship-transfer').innerHTML;
  assert.match(html, /&lt;img onerror=&quot;attack\(\)&quot;&gt;/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /#apply\?track=support&intent=transfer&region=KR/);
  assert.doesNotMatch(html, /amount=|name=/);
  assert.match(html, /요청만으로 입금이 확정되지는 않습니다/);
});

test('unready config prevents direct calls from displaying transfer details or submitting inquiry', async () => {
  const { context, get, calls } = createApp({});
  get('scholarship-amount').value = '30000';
  context.showScholarshipTransfer({ preventDefault() {} });
  assert.equal(get('scholarship-transfer').innerHTML, '');
  await context.submitScholarshipInquiry(formEvent(), false);
  assert.equal(calls.requests.length, 0);
});

test('a fresh US transfer inquiry selects USD even when local selection defaults to KR', () => {
  const config = readyConfig(); config.bank.confirmed = false;
  const { context } = createApp(config);
  const html = context.renderApply({ track: 'support', intent: 'transfer', region: 'US' });
  assert.match(html, /value="zelle" selected/);
  assert.doesNotMatch(html, /option value="bank"/);
  assert.match(html, /name="privacy_agree" required/);
  assert.match(html, /name="turnstile_token"/);
});

test('inquiry submission reuses protected intake without course or payment registration metadata', async () => {
  const { context, calls } = createApp();
  await context.submitScholarshipInquiry(formEvent({
    category: '장학 후원 입금 확인 요청', support_method: 'zelle', support_amount: '30.25', support_date: '2026-09-20',
  }), true);
  assert.equal(calls.requests.length, 1);
  const body = calls.requests[0].body;
  assert.equal(body.source, 'support:scholarship-transfer');
  assert.equal(body.program_key, undefined);
  assert.equal(body.cohort_key, undefined);
  assert.equal(body.payment_amount_usd, undefined);
  assert.equal(body.turnstile_token, 'synthetic-token');
  assert.match(body.message, /미확인·후원자 입력/);
  assert.match(body.message, /\$30.25 USD/);
  assert.match(body.message, /2026-09-20/);
  assert.equal(calls.routes[0].section, 'thankyou');
  assert.equal(calls.routes[0].payload.transferRequest, true);
});

test('security challenge and invalid amount block submission; network failure retains the form for retry', async () => {
  const { context, calls, get } = createApp(readyConfig(), async () => { throw new Error('synthetic offline'); });
  const event = formEvent({ turnstile_token: '' });
  await context.submitScholarshipInquiry(event, false);
  assert.equal(calls.requests.length, 0);
  assert.match(get('apply-submit-status').textContent, /보안 확인/);
  event.target.fields.turnstile_token = 'synthetic-token';
  await context.submitScholarshipInquiry(event, true);
  assert.equal(calls.requests.length, 0);
  await context.submitScholarshipInquiry(event, false);
  assert.equal(calls.routes.length, 0);
  assert.equal(event.target.dataset.submitting, 'false');
  assert.equal(get('apply-submit-btn').disabled, false);
  assert.match(get('apply-submit-status').textContent, /접수하지 못했습니다/);
});

test('repeated submit events cannot create simultaneous inquiry requests', async () => {
  let release;
  const { context, calls } = createApp(readyConfig(), () => new Promise(resolve => { release = resolve; }));
  const event = formEvent();
  const first = context.submitScholarshipInquiry(event, false);
  await context.submitScholarshipInquiry(event, false);
  assert.equal(calls.requests.length, 1);
  release({ ok: true });
  await first;
  assert.equal(event.target.dataset.submitting, 'false');
});

test('thank-you remains an inquiry receipt after hash router turns booleans into strings', () => {
  const { context } = createApp();
  for (const value of [false, 'false']) {
    const html = context.renderThankYou({ scholarshipInquiry: true, transferRequest: value });
    assert.match(html, /장학 후원 문의를 받았습니다/);
    assert.doesNotMatch(html, /입금 확인 요청을 받았습니다/);
  }
  assert.match(context.renderThankYou({ scholarshipInquiry: 'true', transferRequest: 'true' }), /입금 확인서나 기부금영수증이 아닙니다/);
});

test('clipboard failure exposes manual copy; native share cancellation is quiet', async () => {
  const { context, get } = createApp();
  get('scholarship-transfer-address').value = 'synthetic@example.invalid';
  await context.copyScholarshipAddress();
  assert.match(get('scholarship-copy-status').textContent, /직접 복사/);
  context.navigator.share = async () => { throw { name: 'AbortError' }; };
  await context.shareScholarshipPage();
  assert.equal(get('scholarship-share-status').textContent, '');
});


test('Venmo has independent instructions, USD selection, schedule guidance, and a refreshable inquiry route', () => {
  const { context, get } = createApp();
  context.changeScholarshipRegion('US');
  context.selectScholarshipAmount(30);
  context.changeScholarshipService('venmo');
  assert.equal(context.scholarshipSelection.amount, '30');
  assert.match(get('scholarship-giving-panel').outerHTML, /value="venmo" selected/);
  context.changeScholarshipFrequency('monthly');
  assert.match(context.scholarshipFrequencyNote(), /Venmo.*Schedule/);
  context.showScholarshipTransfer({ preventDefault() {} });
  const html = get('scholarship-transfer').innerHTML;
  assert.match(html, /VENMO TEST RECIPIENT/);
  assert.match(html, /202-555-0100/);
  assert.match(html, /Pay\/Request/);
  assert.match(html, /service=venmo/);
  assert.doesNotMatch(html, /Zelle 수취인|synthetic@example.invalid/);
  const fresh = createApp().context.renderApply({ track: 'support', intent: 'transfer', region: 'US', service: 'venmo' });
  assert.match(fresh, /value="venmo" selected/);
});

test('Venmo confirmation requests preserve the actual service in the existing message', async () => {
  const { context, calls } = createApp();
  await context.submitScholarshipInquiry(formEvent({
    category: '장학 후원 입금 확인 요청', support_method: 'venmo', support_amount: '30.25', support_date: '2026-09-21',
  }), true);
  assert.equal(calls.requests.length, 1);
  assert.match(calls.requests[0].body.message, /송금 방법: Venmo/);
  assert.match(calls.requests[0].body.message, /\$30.25 USD/);
  assert.equal(calls.requests[0].body.program_key, undefined);
});

test('unconfirmed Venmo and unknown payment methods cannot fall through to a confirmed Zelle account', async () => {
  const config = readyConfig(); config.venmo.confirmed = false;
  const { context, calls } = createApp(config);
  context.changeScholarshipRegion('US');
  context.changeScholarshipService('venmo');
  assert.match(context.renderScholarshipGivingPanel(), /disabled[^>]*>후원 접수 준비 중/);
  const form = context.renderApply({ track: 'support', intent: 'transfer', region: 'US', service: 'zelle' });
  assert.doesNotMatch(form, /option value="venmo"/);
  for (const method of ['venmo', 'unknown', null]) {
    await context.submitScholarshipInquiry(formEvent({ support_method: method, support_amount: '30', support_date: '2026-09-21' }), true);
  }
  assert.equal(calls.requests.length, 0);
});
