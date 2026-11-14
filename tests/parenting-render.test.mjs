// Parenting 전용 섹션 렌더러와 라우터 분기를 검증하는 스모크 테스트
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const parentingSource = readFileSync(new URL('../js/sections/parenting.js', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');
const programsSource = readFileSync(new URL('../js/sections/programs.js', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../js/sections/home.js', import.meta.url), 'utf8');
const workshopSource = readFileSync(new URL('../parenting-workshop.html', import.meta.url), 'utf8');
const seminarSource = readFileSync(new URL('../parenting-seminar.html', import.meta.url), 'utf8');
const childTestSource = readFileSync(new URL('../child-type-test/child-type-test.html', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function loadParentingRenderer() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(parentingSource, context, { filename: 'js/sections/parenting.js' });
  return context;
}

// openParentingArticle 는 DOM에 모달을 그린다. 최소 document mock으로 innerHTML만 캡처.
function renderArticleModalHtml(index) {
  let html = '';
  const modalObj = {
    addEventListener() {}, remove() {},
    set innerHTML(v) { html = v; }, get innerHTML() { return html; }
  };
  const context = {
    document: { getElementById: () => null, createElement: () => modalObj, body: { appendChild() {} } }
  };
  vm.createContext(context);
  vm.runInContext(parentingSource, context, { filename: 'js/sections/parenting.js' });
  context.openParentingArticle(index);
  return html;
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

test('renderParenting hero embeds YouTube with muted autoplay on main entry', () => {
  const { renderParenting } = loadParentingRenderer();
  const mainHtml = renderParenting();
  assert.match(mainHtml, /id="parenting-hero-video"/);
  assert.match(mainHtml, /youtube\.com\/embed\/ZQh01Atj1l0/);
  assert.match(mainHtml, /autoplay=1/);
  assert.match(mainHtml, /mute=1/);
  assert.match(mainHtml, /cc_load_policy=0/);

  const focusHtml = renderParenting({ focus: 'child' });
  assert.match(focusHtml, /youtube\.com\/embed\/ZQh01Atj1l0/);
  assert.match(focusHtml, /mute=1/);
  assert.match(focusHtml, /cc_load_policy=0/);
  assert.doesNotMatch(focusHtml, /autoplay=1/);
});

test('renderParenting wires existing flows without rebuilding them', () => {
  const { renderParenting } = loadParentingRenderer();
  const html = renderParenting();

  // 아이 유형검사는 기존 독립 페이지로 연결.
  assert.match(html, /child-type-test\/child-type-test\.html/);
  // 우리자녀 기질상담은 기존 apply parenting focus 재사용 + 랜딩발 출처 attribution.
  assert.match(html, /focus: 'parenting',[^}]*apply_source: 'parenting'/);
  assert.match(html, /우리자녀 기질상담 신청/);
  // 세미나 안내는 상세 페이지로 연결(상세→신청 퍼널, attribution 유지).
  assert.match(html, /parenting-seminar\.html\?apply_source=parenting/);
  assert.doesNotMatch(html, /parenting-workshop\.html/);
  assert.doesNotMatch(html, /4주 Parenting 과정/);
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
  // 모달 하단 CTA 는 아이 유형검사 퍼널로 연결.
  assert.match(parentingSource, /child-type-test\/child-type-test\.html/);
  // 8개 아티클이 기존 2개 웹자료에 주제별로 연결됨(아이중심→관찰 체크리스트, 부모중심→엄마유형 정리).
  const checklistLinks = (parentingSource.match(/child_type_checklist\.html/g) || []).length;
  const momLinks = (parentingSource.match(/mom_type_summary\.html/g) || []).length;
  assert.ok(checklistLinks >= 5, `아이 관찰 체크리스트가 여러 아티클에 연결되어야 함 (got ${checklistLinks})`);
  assert.ok(momLinks >= 4, `엄마유형 정리가 여러 아티클에 연결되어야 함 (got ${momLinks})`);
});

test('all 8 articles have full bodies (300~500자) and a topic-matched funnel CTA', () => {
  for (let i = 0; i < 8; i++) {
    const html = renderArticleModalHtml(i);
    // 본문 문단만 추출해 글자 수(공백 제외) 측정.
    const paras = [...html.matchAll(/<p class="text-sm text-gray-700 leading-relaxed break-keep mb-3">([\s\S]*?)<\/p>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, ''));
    const len = paras.join('').replace(/\s/g, '').length;
    assert.ok(len >= 300 && len <= 540, `아티클 ${i} 본문 길이 ${len}자 — 300~500자 범위를 벗어남`);
    // 주제별 퍼널 CTA: 아이중심 → 아이 유형검사, 부모중심 → 부모 양육성향.
    assert.match(html, /아이 유형검사 시작하기|부모 양육성향 이해하기/);
  }
  // 부모중심 아티클(하지말아야할말·스마트폰·돈언어)은 부모 CTA로.
  [1, 4, 7].forEach(i => assert.match(renderArticleModalHtml(i), /부모 양육성향 이해하기/));
  // 아이중심 아티클은 아이 유형검사 CTA로.
  [0, 2, 3, 5, 6].forEach(i => assert.match(renderArticleModalHtml(i), /아이 유형검사 시작하기/));
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
  assert.match(programsSource, /heroTitle: '관계·부부 코칭'/);
  assert.match(programsSource, /heroTitle: '사역팀 팀워크'/);
  assert.doesNotMatch(programsSource, /tab-individual|tab-church|individual:관계·부부/);
  assert.match(programsSource, /관계·부부 코칭/);
  assert.match(programsSource, /to: 'parenting'/);
  assert.match(programsSource, /Parenting에서 자세히 보기/);
  assert.doesNotMatch(programsSource, /individual:개인\/가정/);
});

test('home featured programs include parenting seminar as the parent-education entry', () => {
  assert.match(homeSource, /title: '부모교육 세미나'/);
  assert.match(homeSource, /parenting-seminar\.html\?apply_source=home_programs/);
  assert.match(homeSource, /title: '에니어그램 기질 검사'/);
  assert.doesNotMatch(homeSource, /관계·부부 코칭 보기/);
  assert.doesNotMatch(homeSource, /button2: '4주 과정 신청'/);
});

test('workshop detail page describes independent participation and pending recruitment', () => {
  assert.match(workshopSource, /4주 부모교육 워크숍/);
  assert.match(workshopSource, /기본과정 수료 여부와 관계없이/);
  assert.match(workshopSource, /모집 일정과 참가비는 확정 후/);
  assert.match(workshopSource, /focus=parenting_workshop/);
  assert.match(workshopSource, /일정 알림 남기기/);
  assert.doesNotMatch(workshopSource, /http-equiv="refresh"|\$120/);
});

test('seminar landing wires org hosting apply and personal counseling fork', () => {
  assert.match(seminarSource, /부모교육 세미나/);
  assert.match(seminarSource, /assets\/parenting\/parenting-seminar-hero\.jpg/);
  assert.match(seminarSource, /track=org&focus=parenting_seminar/);
  assert.match(seminarSource, /track=paid&focus=parenting/);
  assert.match(seminarSource, /교회·선교단체·기독교 기관/);
  assert.match(seminarSource, /개인 참가 등록은 받지 않습니다/);
  assert.doesNotMatch(seminarSource, /focus=parenting_workshop/);
  assert.match(seminarSource, /parenting-workshop/);
  assert.doesNotMatch(seminarSource, /세미나 vs 4주/);
  assert.match(seminarSource, /href="\/#parenting"/);
});

test('site nav renames counseling and adds seminar entry', () => {
  assert.match(indexSource, /우리자녀 기질상담 신청/);
  assert.match(indexSource, /href="\/parenting-seminar"/);
  assert.doesNotMatch(indexSource, /양육 해석상담/);
});

test('child type test result offers a journey CTA beyond the paid consult', () => {
  // 유료 해석상담 외에 부모–자녀 맞춤 가이드(여정)로도 연결.
  assert.match(childTestSource, /#parenting\?focus=guide/);
  assert.match(childTestSource, /부모–자녀 맞춤 가이드 보기/);
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
