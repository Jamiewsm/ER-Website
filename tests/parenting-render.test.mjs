// Parenting 전용 섹션 렌더러와 라우터 분기를 검증하는 스모크 테스트
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const parentingSource = readFileSync(new URL('../js/sections/parenting.js', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');

function loadParentingRenderer() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(parentingSource, context, { filename: 'js/sections/parenting.js' });
  return context;
}

test('renderParenting renders hero, three lenses, and focus anchors', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  assert.match(html, /아이를 바꾸기 전에/);
  assert.match(html, /CHILD/);
  assert.match(html, /PARENT/);
  assert.match(html, /RELATIONSHIP/);
  assert.match(html, /id="parenting-child"/);
  assert.match(html, /id="parenting-parent"/);
  assert.match(html, /id="parenting-guide"/);
});

test('renderParenting wires existing flows without rebuilding them', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  // 아이 유형검사는 기존 독립 페이지로 연결.
  assert.match(html, /child-type-test\/child-type-test\.html/);
  // 양육 해석상담은 기존 apply parenting focus 재사용.
  assert.match(html, /focus: 'parenting',[^}]*source: 'parenting'/);
  // 4주 과정은 기존 parenting_workshop focus 재사용.
  assert.match(html, /focus: 'parenting_workshop'/);
  // 진단이 아니라 이해의 가설이라는 표현이 포함.
  assert.match(html, /이해의 가설/);
});

test('renderParenting guide shows representative parent-child combos', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  assert.match(html, /원칙을 중시하는 부모/);
  assert.match(html, /갈등을 피하는 부모/);
  assert.match(html, /필요한 변화|부모.*아이/s);
});

test('router routes parenting and scrolls to the requested focus anchor', () => {
  let scrolledId = null;
  const mainContent = { innerHTML: '' };
  const context = {
    state: { currentSection: 'home', currentPayload: null, programFilter: 'individual' },
    document: {
      body: { classList: { toggle() {} } },
      getElementById(id) {
        if (id === 'main-content') return mainContent;
        if (id === 'mobile-menu') return { classList: { add() {} } };
        if (id === 'sr-status') return null;
        if (id === 'parenting-guide') return { scrollIntoView() { scrolledId = id; } };
        return null;
      }
    },
    window: { scrollTo() {}, location: { hash: '' } },
    renderParenting(payload) { return `<div data-focus="${payload?.focus || ''}">parenting</div>`; },
    setTimeout(fn) { fn(); }
  };
  vm.createContext(context);
  vm.runInContext(appCoreSource, context, { filename: 'js/app-core.js' });

  context.renderSection('parenting', { focus: 'guide' }, { syncHash: false });

  assert.match(mainContent.innerHTML, /data-focus="guide"/);
  assert.equal(scrolledId, 'parenting-guide');
});
