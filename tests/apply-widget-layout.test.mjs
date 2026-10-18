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
