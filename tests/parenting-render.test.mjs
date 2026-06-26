// Parenting 전용 섹션 렌더러와 라우터 분기를 검증하는 스모크 테스트
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const parentingSource = readFileSync(new URL('../js/sections/parenting.js', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');
const programsSource = readFileSync(new URL('../js/sections/programs.js', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../js/sections/home.js', import.meta.url), 'utf8');

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
  assert.match(html, /id="parenting-program"/);   // 홈 Hero 카드가 스크롤하는 상품 계단 앵커
});

test('renderParenting wires existing flows without rebuilding them', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  // 아이 유형검사는 기존 독립 페이지로 연결.
  assert.match(html, /child-type-test\/child-type-test\.html/);
  // 양육 해석상담은 기존 apply parenting focus 재사용 + 랜딩발 출처 attribution.
  assert.match(html, /focus: 'parenting',[^}]*apply_source: 'parenting'/);
  // 4주 과정은 기존 parenting_workshop focus 재사용.
  assert.match(html, /focus: 'parenting_workshop'/);
  // 진단이 아니라 이해의 가설이라는 표현이 포함.
  assert.match(html, /이해의 가설/);
});

test('renderParenting guide shows six representative parent-child combos', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  [
    '원칙을 중시하는 부모', '갈등을 피하는 부모', '인정을 중요하게 여기는 부모',
    '확실히 통제하려는 부모', '성취로 사랑을 표현하는 부모', '불안을 대신 해결하는 부모'
  ].forEach(p => assert.match(html, new RegExp(p)));
});

test('free articles are clickable and wired to the test funnel', () => {
  const ctx = loadParentingRenderer();
  assert.equal(typeof ctx.openParentingArticle, 'function');
  const html = ctx.renderParenting();
  const btnCount = (html.match(/openParentingArticle\(/g) || []).length;
  assert.equal(btnCount, 8, 'all 8 article cards should be clickable');
  // 모달 아티클 중 최소 1개는 실제 관찰 자료와 연결.
  assert.match(parentingSource, /child_type_checklist\.html/);
  // 모달 하단 CTA 는 아이 유형검사 퍼널로 연결.
  assert.match(parentingSource, /child-type-test\/child-type-test\.html/);
});

test('parent section has a no-score mini checklist plus a parent resource', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  assert.match(html, /1분 부모 양육성향 체크/);
  assert.match(html, /id="parent-check-0"/);
  assert.match(html, /점수도 결과도 없습니다/);   // 결과 없는 관찰 유도
  assert.match(html, /mom_type_summary\.html/);   // 기존 자료 연결
});

test('programs section is relabeled to the locked nav IA and redirects parenting', () => {
  assert.match(programsSource, /코칭·프로그램 안내/);
  assert.match(programsSource, /individual:관계·부부/);
  assert.match(programsSource, /관계·부부 코칭/);
  assert.match(programsSource, /to: 'parenting'/);
  assert.match(programsSource, /Parenting에서 자세히 보기/);
  assert.doesNotMatch(programsSource, /individual:개인\/가정/);
});

test('home parenting hero card routes through the Parenting journey, not the static page', () => {
  // 홈 Hero "Enneagram for Parenting" 카드는 새 여정(랜딩 상품 계단)으로 진입해야 함.
  assert.match(homeSource, /renderSection\('parenting', \{ focus: 'program' \}\)/);
  assert.doesNotMatch(homeSource, /\/parenting-workshop\.html/);
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
