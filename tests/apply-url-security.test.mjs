// 신청 URL의 비정상 값이 HTML 구조와 제출 경로를 바꾸지 못하는지 검증한다.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function renderer() {
  const context = {
    window: { ERProgramCatalog: { isBasicCourseRecruitmentOpen: () => true } },
    state: { latestTestResult: null },
    sessionStorage: { getItem: () => null },
  };
  vm.createContext(context);
  for (const path of ['js/app-helpers.js', 'js/sections/apply.js']) {
    vm.runInContext(read(path), context, { filename: path });
  }
  return context;
}

const marker = 'paid"><span data-er-audit-inert-probe="true"></span><div x="';
for (const field of ['track', 'focus', 'apply_source']) {
  test(`untrusted ${field} does not create markup or an inline handler argument`, () => {
    const app = renderer();
    const html = app.renderApply({ track: 'paid', [field]: marker });
    assert.doesNotMatch(html, /<span data-er-audit-inert-probe/);
    const form = html.match(/<form\b[^>]*>/)?.[0];
    assert.ok(form, 'unknown values should still show the generic form');
    assert.match(form, /data-submit-source="paid"/);
    assert.match(form, /onsubmit="handleApplyFormSubmit\(event\)"/);
  });
}

test('prototype property names cannot select a focus configuration', () => {
  const app = renderer();
  for (const focus of ['__proto__', 'constructor', 'toString']) {
    const html = app.renderApply({ focus });
    assert.match(html, /상담 및 코칭 신청/);
    assert.match(html, /data-submit-source="paid"/);
    assert.doesNotMatch(html, /undefined/);
  }
});

test('real source builder bounds track and focus, including direct callers', () => {
  const app = renderer();
  assert.equal(app.buildApplySubmitSource(marker, marker, 'qr'), 'paid:qr');
  assert.equal(app.buildApplySubmitSource('org', 'church', 'website'), 'org:church:website');
  assert.equal(app.buildApplySubmitSource('paid', 'result_consult', 'child_type_test'), 'paid:result_consult:child_type_test');
  assert.equal(app.buildApplySubmitSource('paid', 'result_consult', 'test'), 'test');
});

test('dedicated form renderers never interpolate source into executable handlers', () => {
  const app = renderer();
  for (const render of [app.renderParentingWorkshopApply, app.renderBasicCourseApply]) {
    const html = render(marker);
    assert.doesNotMatch(html, /<span data-er-audit-inert-probe/);
    assert.match(html, /onsubmit="handleApplyFormSubmit\(event\)"/);
  }
});

test('static submit adapter preserves source and dedicated program context', () => {
  const app = renderer();
  const calls = [];
  app.handleApplySubmit = (...args) => calls.push(args);
  for (const [source, focus] of [['paid', ''], ['paid:parenting_workshop:qr', 'parenting_workshop'], ['paid:enneagram_basic_october:instagram', 'enneagram_basic_october']]) {
    const form = { dataset: { submitSource: source, applyFocus: focus } };
    const event = { target: form, currentTarget: form };
    app.handleApplyFormSubmit(event);
    const [actualEvent, actualSource, payload] = calls.at(-1);
    assert.equal(actualEvent, event);
    assert.equal(actualSource, source);
    assert.equal(payload?.focus || '', focus);
  }
});
