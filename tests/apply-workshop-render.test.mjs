import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const applySource = readFileSync(new URL('../js/sections/apply.js', import.meta.url), 'utf8');
const apiSource = readFileSync(new URL('../js/api.js', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');
const applicationsSource = readFileSync(new URL('../js/coach/applications.js', import.meta.url), 'utf8');
const courseCssSource = readFileSync(new URL('../css/course-application.css', import.meta.url), 'utf8');

function loadApplyRenderer(options = {}) {
  const recruitmentOpen = options.recruitmentOpen === true;
  const context = {
    state: { latestTestResult: null },
    window: {
      ERProgramCatalog: {
        isJulyBasicRecruitmentOpen: () => recruitmentOpen
      }
    },
    buildApplySubmitSource(track, focus, attribution) {
      return [track, focus, attribution].filter(Boolean).join(':');
    }
  };
  vm.createContext(context);
  vm.runInContext(applySource, context, { filename: 'js/sections/apply.js' });
  return context;
}

test('parenting workshop link renders a dedicated direct application form', () => {
  const renderer = loadApplyRenderer();
  const html = renderer.renderApply({
    track: 'paid',
    focus: 'parenting_workshop',
    apply_source: 'qr'
  });

  assert.match(html, /Enneagram for Parenting/);
  assert.match(html, /4주 워크샵 신청/);
  assert.match(html, /assets\/er-visual\/hero-home\.jpg/);
  assert.match(html, /type="hidden" name="category" value="Enneagram for Parenting 4주 \(\$120\)"/);
  assert.match(html, /4주 워크샵 신청하기/);
  assert.match(html, /handleApplySubmit\(event, 'paid:parenting_workshop:qr', \{ focus: 'parenting_workshop' \}\)/);
  assert.doesNotMatch(html, /희망하는 세션|<select/);
  assert.doesNotMatch(html, /Enneagram for Parenting 4주 워크샵 신청합니다\./);
});

test('generic paid apply route keeps its selectable application categories', () => {
  const renderer = loadApplyRenderer();
  const html = renderer.renderApply({ track: 'paid' });

  assert.match(html, /희망하는 세션/);
  assert.match(html, /<select name="category"/);
  assert.doesNotMatch(html, /assets\/er-visual\/hero-home\.jpg/);
});

test('child type test result apply shows parenting-context copy, not adult test copy', () => {
  const renderer = loadApplyRenderer();
  const html = renderer.renderApply({
    track: 'paid',
    focus: 'result_consult',
    apply_source: 'child_type_test'
  });

  // 아이 검사에서 넘어온 부모에게는 양육 문맥 배너/타이틀을 노출.
  assert.match(html, /아이 유형검사 결과 해석상담/);
  assert.match(html, /아이 검사 후 추천 — 결과 해석상담/);
  // 성인 테스트용 카피는 노출하지 않음.
  assert.doesNotMatch(html, /프리미엄 테스트 후 추천/);
  // 출처 attribution 은 child_type_test 로 유지(상품·가격 무변경).
  assert.match(html, /handleApplySubmit\(event, 'paid:result_consult:child_type_test'\)/);
});

test('October Enneagram basic course link renders a dedicated direct application form while recruitment is open', () => {
  const renderer = loadApplyRenderer({ recruitmentOpen: true });
  const html = renderer.renderApply({
    track: 'paid',
    focus: 'enneagram_basic_october',
    apply_source: 'instagram'
  });

  assert.match(html, /에니어그램 기본과정 8주/);
  assert.match(html, /관계 속에서 드러나는 나를 이해하는 시간/);
  assert.match(html, /October 2026/);
  assert.doesNotMatch(html, /enneagram-basic-july-2026\.jpg/);
  assert.match(html, /type="hidden" name="category" value="에니어그램 기본과정 8주 \(\$300 \/ ₩420,000\)"/);
  assert.match(html, /에니어그램 기본과정 신청하기/);
  assert.match(html, /handleApplySubmit\(event, 'paid:enneagram_basic_october:instagram', \{ focus: 'enneagram_basic_october' \}\)/);
  assert.match(html, /name="contact"[^>]*type="email"|type="email"[^>]*name="contact"/);
  assert.match(html, /name="payment_region"[^>]*required/);
  assert.match(html, /name="payment_preference"[^>]*required/);
  assert.match(html, /name="installment_preference"/);
  assert.match(html, /₩380,000 \/ \$270/);
  assert.match(html, /name="enneagram_experience"/);
  assert.match(html, /name="referral_source"/);
  assert.match(html, /name="preferred_time"[^>]*required/);
  assert.match(html, /name="covenant_agree"[^>]*required/);
  assert.match(html, /10월 첫주 개강|선착순 8명|9\/17까지 얼리버드/);
  assert.doesNotMatch(html, /희망하는 세션|<select name="category"/);
});

test('October Enneagram basic course apply route shows closed notice after recruitment ends', () => {
  const renderer = loadApplyRenderer({ recruitmentOpen: false });
  const html = renderer.renderApply({
    track: 'paid',
    focus: 'enneagram_basic_october',
    apply_source: 'instagram'
  });

  assert.match(html, /모집 마감/);
  assert.match(html, /10월 기본과정 모집이 마감되었습니다/);
  assert.match(html, /선착순 8명/);
  assert.doesNotMatch(html, /에니어그램 기본과정 신청하기/);
});

test('October Enneagram basic course confirmation uses region-aware response copy', () => {
  const renderer = loadApplyRenderer();
  const html = renderer.renderThankYou({ focus: 'enneagram_basic_october' });

  assert.match(html, /기본과정 신청이 접수되었습니다/);
  assert.match(html, /24시간 이내/);
  assert.match(html, /한국은 원화, 해외는 USD/);
  assert.match(html, /접수 확인 메일이 자동 발송/);
  assert.doesNotMatch(html, /Stripe/);
  assert.doesNotMatch(html, /접수 확인·결제 안내 메일이 곧 발송/);
});

test('focused course application CSS hides global distractions and allows mobile shrink', () => {
  assert.match(courseCssSource, /body\.course-focused-apply footer/);
  assert.match(courseCssSource, /\.course-apply-page section[\s\S]*min-width:\s*0/);
  assert.match(courseCssSource, /\.parenting-apply-page section[\s\S]*min-width:\s*0/);
});

test('parenting workshop confirmation uses course-specific response copy', () => {
  const renderer = loadApplyRenderer();
  const html = renderer.renderThankYou({ focus: 'parenting_workshop' });

  assert.match(html, /신청이 접수되었습니다/);
  assert.match(html, /일정과 참여 안내/);
  assert.match(html, /24시간 이내/);
});

test('router preserves parenting focus while rendering the confirmation view', () => {
  let thankYouPayload = null;
  let hasFocusedClass = false;
  const mainContent = { innerHTML: '' };
  const context = {
    state: { currentSection: 'apply', currentPayload: null },
    document: {
      body: {
        classList: {
          toggle(_className, enabled) { hasFocusedClass = enabled; }
        }
      },
      getElementById(id) {
        if (id === 'main-content') return mainContent;
        if (id === 'mobile-menu') return { classList: { add() {} } };
        return null;
      }
    },
    window: { scrollTo() {} },
    renderThankYou(payload) {
      thankYouPayload = payload;
      return '<p>confirmation</p>';
    },
    setTimeout() {}
  };
  vm.createContext(context);
  vm.runInContext(appCoreSource, context, { filename: 'js/app-core.js' });

  context.renderSection('thankyou', { focus: 'parenting_workshop' }, { syncHash: false });

  assert.equal(hasFocusedClass, true);
  assert.equal(thankYouPayload?.focus, 'parenting_workshop');
});

test('router applies quiet focused shell to October basic course routes', () => {
  const toggles = {};
  const mainContent = { innerHTML: '' };
  const context = {
    state: { currentSection: 'apply', currentPayload: null },
    document: {
      body: {
        classList: {
          toggle(className, enabled) { toggles[className] = enabled; }
        }
      },
      getElementById(id) {
        if (id === 'main-content') return mainContent;
        if (id === 'mobile-menu') return { classList: { add() {} } };
        return null;
      }
    },
    window: { scrollTo() {} },
    renderThankYou() { return '<p>confirmation</p>'; },
    setTimeout() {}
  };
  vm.createContext(context);
  vm.runInContext(appCoreSource, context, { filename: 'js/app-core.js' });

  context.renderSection('thankyou', { focus: 'enneagram_basic_october' }, { syncHash: false });

  assert.equal(toggles['course-focused-apply'], true);
  assert.equal(toggles['parenting-focused-apply'], false);
});

test('successful focused submission carries parenting focus into confirmation', async () => {
  let renderArgs = null;
  const submitButton = {
    dataset: { defaultLabel: '4주 워크샵 신청하기', loadingLabel: '접수 중...' },
    disabled: false,
    textContent: '4주 워크샵 신청하기'
  };
  const context = {
    window: { SUPABASE_CONFIG: { url: 'https://example.supabase.co' }, state: { user: null } },
    document: {
      getElementById(id) {
        if (id === 'apply-submit-btn') return submitButton;
        return null;
      }
    },
    FormData: class FakeFormData {
      constructor(form) { this.values = form.values; }
      get(name) { return this.values[name] || ''; }
    },
    fetch: async () => ({ ok: true }),
    renderSection(...args) { renderArgs = args; },
    alert() {},
    setInterval,
    clearInterval
  };
  vm.createContext(context);
  vm.runInContext(apiSource, context, { filename: 'js/api.js' });

  await context.handleApplySubmit({
    preventDefault() {},
    target: {
      values: {
        name: '테스트',
        contact: 'test@example.com',
        category: 'Enneagram for Parenting 4주 ($120)',
        turnstile_token: 'verified-token'
      }
    }
  }, 'paid:parenting_workshop:qr', { focus: 'parenting_workshop' });

  assert.equal(renderArgs[0], 'thankyou');
  assert.equal(renderArgs[1].focus, 'parenting_workshop');
});

test('October basic course submission preserves the legacy program key and sends cohort/payment metadata', async () => {
  let requestBody = null;
  const submitButton = {
    dataset: { defaultLabel: '에니어그램 기본과정 신청하기', loadingLabel: '접수 중...' },
    disabled: false,
    textContent: '에니어그램 기본과정 신청하기'
  };
  const context = {
    window: { SUPABASE_CONFIG: { url: 'https://example.supabase.co' }, state: { user: null } },
    document: {
      getElementById(id) {
        if (id === 'apply-submit-btn') return submitButton;
        return null;
      }
    },
    FormData: class FakeFormData {
      constructor(form) { this.values = form.values; }
      get(name) { return this.values[name] || ''; }
    },
    fetch: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return { ok: true };
    },
    renderSection() {},
    alert() {},
    setInterval,
    clearInterval
  };
  vm.createContext(context);
  vm.runInContext(apiSource, context, { filename: 'js/api.js' });

  await context.handleApplySubmit({
    preventDefault() {},
    target: {
      values: {
        name: '테스트',
        contact: 'test@example.com',
        phone: '010-1234-5678',
        category: '에니어그램 기본과정 8주 ($300 / ₩420,000)',
        payment_region: 'KR',
        payment_preference: 'kakao_pay',
        installment_preference: 'card_installment',
        turnstile_token: 'verified-token'
      }
    }
  }, 'paid:enneagram_basic_october:landing', { focus: 'enneagram_basic_october' });

  assert.equal(requestBody.program_key, 'enneagram_basic_july');
  assert.equal(requestBody.cohort_key, 'enneagram_basic_2026_10');
  assert.equal(requestBody.phone, '010-1234-5678');
  assert.equal(requestBody.payment_region, 'KR');
  assert.equal(requestBody.payment_preference, 'kakao_pay');
  assert.equal(requestBody.installment_preference, 'card_installment');
  assert.match(requestBody.message, /전화번호: 010-1234-5678/);
});

test('failed focused submission reports an inline retryable error', async () => {
  let alertCount = 0;
  const statusEl = { className: 'hidden', textContent: '' };
  const submitButton = {
    dataset: { defaultLabel: '4주 워크샵 신청하기', loadingLabel: '접수 중...' },
    disabled: false,
    textContent: '4주 워크샵 신청하기'
  };
  const context = {
    window: { SUPABASE_CONFIG: { url: 'https://example.supabase.co' }, state: { user: null } },
    document: {
      getElementById(id) {
        if (id === 'apply-submit-btn') return submitButton;
        if (id === 'apply-submit-status') return statusEl;
        return null;
      }
    },
    FormData: class FakeFormData {
      constructor(form) { this.values = form.values; }
      get(name) { return this.values[name] || ''; }
    },
    fetch: async () => { throw new Error('network offline'); },
    alert() { alertCount += 1; },
    setInterval,
    clearInterval
  };
  vm.createContext(context);
  vm.runInContext(apiSource, context, { filename: 'js/api.js' });

  await context.handleApplySubmit({
    preventDefault() {},
    target: {
      values: {
        name: '테스트',
        contact: 'test@example.com',
        category: 'Enneagram for Parenting 4주 ($120)',
        turnstile_token: 'verified-token'
      }
    }
  }, 'paid:parenting_workshop:qr', { focus: 'parenting_workshop' });

  assert.equal(alertCount, 0);
  assert.match(statusEl.textContent, /접수하지 못했습니다/);
  assert.match(statusEl.className, /text-red/);
  assert.equal(submitButton.textContent, '4주 워크샵 신청하기');
});

test('Turnstile init mounts the explicit widget without calling ready on an async-loaded API', () => {
  let readyCalls = 0;
  let renderCalls = 0;
  const statusEl = {
    className: 'hidden',
    textContent: '',
    classList: { add() {}, remove() {} }
  };
  const retryBtn = {
    classList: { add() {}, toggle() {} }
  };
  const widgetEl = { innerHTML: '' };
  const tokenEl = { value: '' };
  const context = {
    window: {
      TURNSTILE_SITE_KEY: 'test-site-key',
      turnstile: {
        ready() {
          readyCalls += 1;
          throw new Error('ready cannot be used with async script loading');
        },
        render() {
          renderCalls += 1;
          return 'widget-id';
        }
      }
    },
    document: {
      getElementById(id) {
        if (id === 'apply-turnstile-status') return statusEl;
        if (id === 'apply-turnstile-retry') return retryBtn;
        if (id === 'apply-turnstile-widget') return widgetEl;
        if (id === 'apply-turnstile-token') return tokenEl;
        return null;
      }
    },
    setInterval() { return 1; },
    clearInterval() {}
  };
  vm.createContext(context);
  vm.runInContext(apiSource, context, { filename: 'js/api.js' });

  assert.doesNotThrow(() => context.initApplyTurnstile());
  assert.equal(readyCalls, 0);
  assert.equal(renderCalls, 1);
});

test('coach registration email uses notify-program-application with apikey header', () => {
  assert.match(applicationsSource, /notify-program-application/);
  assert.match(applicationsSource, /apikey:\s*config\.anonKey/);
  assert.match(applicationsSource, /sendRegistrationPaymentEmail/);
  assert.match(applicationsSource, /event:\s*'registration'/);
  assert.doesNotMatch(applicationsSource, /create-program-checkout/);
});
