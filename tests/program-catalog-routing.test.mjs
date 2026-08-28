import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const catalogSource = readFileSync(new URL('../js/program-catalog.js', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../js/sections/home.js', import.meta.url), 'utf8');
const programsSource = readFileSync(new URL('../js/sections/programs.js', import.meta.url), 'utf8');

function loadCatalog(nowIso) {
  const RealDate = Date;
  class FakeDate extends RealDate {
    static now() {
      return RealDate.parse(nowIso);
    }
    static parse(value) {
      return RealDate.parse(value);
    }
  }
  const context = { window: {}, Date: FakeDate };
  vm.createContext(context);
  vm.runInContext(catalogSource, context, { filename: 'js/program-catalog.js' });
  return context.window.ERProgramCatalog;
}

test('result consultation remains the first recommended next step after October basic boost ends', () => {
  const catalog = loadCatalog('2026-09-29T12:00:00-07:00');
  const steps = catalog.buildNextSteps(['유형(Typing) 상담', '회복 코칭 8회', 'ER 전문가 과정']);

  assert.equal(steps[0].programKey, 'result_consult');
  assert.equal(steps[0].program, '테스트 결과지 해석상담');
  assert.equal(steps[0].applyAction.payload.focus, 'result_consult');
  assert.equal(steps[1].programKey, 'identity_session');
});

test('October basic boost keeps result consultation first and basic course second', () => {
  const catalog = loadCatalog('2026-08-27T12:00:00-07:00');
  const steps = catalog.buildNextSteps(['유형(Typing) 상담', '회복 코칭 8회', 'ER 전문가 과정']);

  assert.equal(steps[0].programKey, 'result_consult');
  assert.equal(steps[1].programKey, 'basic_course');
  assert.equal(steps[2].programKey, 'identity_session');
});

test('live SPA home and programs sections route the primary consultation CTA to result_consult', () => {
  assert.match(homeSource, /title:\s*'결과지 해석상담'/);
  assert.match(homeSource, /price:\s*'\$50'/);
  assert.match(homeSource, /focus:\s*'result_consult'/);
  assert.doesNotMatch(homeSource, /1:1 유형\(Typing\) 상담/);

  assert.match(programsSource, /t:\s*'결과지 해석상담'/);
  assert.match(programsSource, /p:\s*'\$50'/);
  assert.match(programsSource, /applyFocus:\s*'result_consult'/);
});
