// 신청 폼의 실제 컨테이너 너비에 맞는 보안 위젯 크기를 검증한다.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/api.js', import.meta.url), 'utf8');
for (const [width, expected] of [[180, 'compact'], [299, 'compact'], [300, 'flexible'], [500, 'flexible']]) {
  test(`widget fits a ${width}px container without forcing a 300px minimum`, () => {
    let rendered;
    const container = { innerHTML: '', getBoundingClientRect: () => ({ width }) };
    const nodes = { 'apply-turnstile-widget': container, 'apply-turnstile-token': { value: '' } };
    const app = {
      window: { TURNSTILE_SITE_KEY: 'test-only', turnstile: { render: (_target, config) => { rendered = config; return 'test'; } } },
      document: { getElementById: id => nodes[id] || null },
    };
    vm.createContext(app);
    vm.runInContext(source, app);
    assert.equal(app.mountApplyTurnstileWidget(), true);
    assert.equal(rendered.size, expected);
    assert.equal(rendered.theme, 'light');
  });
}

test('resizing remounts only across the size boundary and invalidates the old token', () => {
  let width = 500, resized;
  const sizes = [];
  const token = { value: '' };
  const container = { isConnected: true, innerHTML: '', getBoundingClientRect: () => ({ width }) };
  const nodes = { 'apply-turnstile-widget': container, 'apply-turnstile-token': token };
  const app = {
    ResizeObserver: class { constructor(callback) { resized = callback; } observe() {} disconnect() {} },
    window: { TURNSTILE_SITE_KEY: 'test-only', turnstile: { render: (_target, config) => { sizes.push(config.size); return 'test'; }, remove() {} } },
    document: { getElementById: id => nodes[id] || null },
  };
  vm.createContext(app);
  vm.runInContext(source, app);
  app.mountApplyTurnstileWidget();
  assert.equal(typeof resized, 'function');
  token.value = 'old-size-token';
  width = 180;
  resized();
  assert.deepEqual(sizes, ['flexible', 'compact']);
  assert.equal(token.value, '');
  width = 190;
  resized();
  assert.equal(sizes.length, 2, 'same size mode should not reset a valid widget');
});
