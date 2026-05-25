import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const applySource = readFileSync(new URL('../js/sections/apply.js', import.meta.url), 'utf8');
const apiSource = readFileSync(new URL('../js/api.js', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');

function loadApplyRenderer() {
  const context = {
    state: { latestTestResult: null },
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
