// 공개 사이트 메뉴 상태·키보드 닫기·비동기 홈 안정성과 화면 제목을 검증한다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const core = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function app() {
  const elements = new Map(), events = new Map(), timers = [];
  let mainWrites = 0, noticeRequests = 0;
  const document = { activeElement: null, title: 'initial' };
  function element(id, classes = []) {
    const attributes = new Map(), tokens = new Set(classes);
    const el = {
      id, children: [],
      classList: {
        add: (...names) => names.forEach(name => tokens.add(name)),
        remove: (...names) => names.forEach(name => tokens.delete(name)),
        contains: name => tokens.has(name),
        toggle(name, on) { on ? tokens.add(name) : tokens.delete(name); }
      },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name) ?? null,
      focus() { document.activeElement = el; },
      contains(target) { return target === el || el.children.some(child => child.contains(target)); },
      querySelector(selector) { return selector === '.desktop-nav-trigger' ? el.children[0] : null; }
    };
    elements.set(id, el);
    return el;
  }
  const main = element('main-content');
  Object.defineProperty(main, 'innerHTML', {
    get: () => main.html || '',
    set(value) { main.html = value; mainWrites += 1; }
  });
  element('sr-status');
  const mobile = element('mobile-menu', ['hidden']);
  const mobileButton = element('mobile-menu-toggle');
  element('mobile-menu-backdrop', ['hidden']);
  const groups = [0, 1].map(i => {
    const group = element('group-' + i);
    const trigger = element('trigger-' + i);
    const panel = element('desktop-nav-' + i, ['hidden']);
    const link = element('link-' + i);
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-expanded', 'false');
    panel.children = [link];
    group.children = [trigger, panel];
    trigger.parentElement = group;
    return { group, trigger, panel, link };
  });
  document.body = element('body');
  document.getElementById = id => elements.get(id) || null;
  document.addEventListener = (name, fn) => {
    if (!events.has(name)) events.set(name, []);
    events.get(name).push(fn);
  };
  document.querySelectorAll = selector => {
    if (selector === '.desktop-nav-trigger') return groups.map(group => group.trigger);
    return [];
  };
  const state = { currentSection: 'home', currentPayload: null, noticesLoaded: false, programFilter: 'individual' };
  const window = {
    location: { hash: '#home' }, scrollY: 0,
    scrollTo({ top }) { window.scrollY = top; }
  };
  const context = {
    state, document, window, URLSearchParams,
    setTimeout(fn, delay) { timers.push({ fn, delay }); },
    renderHome: () => '<h1>홈</h1>', renderAbout: () => '<h1>소개</h1>',
    renderParenting: () => '<h1>양육</h1>', renderPrograms: () => '<h1>프로그램</h1>',
    renderApply: () => '<h1>신청</h1>', renderPrivacy: () => '<h1>개인정보</h1>',
    renderThankYou: () => '<h1>접수 안내</h1>', renderNoticeDetail: () => '<h1>공지</h1>',
    initCharts() {}, updateProgramView() {}, initApplyTurnstile() {},
    async loadNotices() { noticeRequests += 1; state.noticesLoaded = true; }
  };
  vm.createContext(context);
  vm.runInContext(core, context);
  return {
    context, groups, mobile, mobileButton, document, window, state, main, timers,
    get mainWrites() { return mainWrites; }, get noticeRequests() { return noticeRequests; },
    dispatch(name, event) { for (const fn of events.get(name) || []) fn(event); }
  };
}

test('desktop disclosures are native buttons controlling initially hidden panels', () => {
  const triggers = [...indexHtml.matchAll(/<button\b[^>]*class="[^"]*desktop-nav-trigger[^>]*>/g)];
  assert.equal(triggers.length, 5);
  for (const [tag] of triggers) {
    assert.match(tag, /type="button"/);
    assert.match(tag, /aria-expanded="false"/);
    assert.match(tag, /aria-controls="desktop-nav-[^"]+"/);
    assert.match(tag, /onclick="toggleDesktopNav\(this\)"/);
    assert.doesNotMatch(tag, /renderSection/);
  }
  assert.doesNotMatch(indexHtml, /hidden group-hover:block/);
});

test('desktop click disclosure opens one group and toggles it closed', () => {
  const a = app(), [first, second] = a.groups;
  a.context.toggleDesktopNav(first.trigger);
  assert.equal(first.trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(first.panel.classList.contains('hidden'), false);
  a.context.toggleDesktopNav(second.trigger);
  assert.equal(first.trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(first.panel.classList.contains('hidden'), true);
  assert.equal(second.panel.classList.contains('hidden'), false);
  a.context.toggleDesktopNav(second.trigger);
  assert.equal(second.trigger.getAttribute('aria-expanded'), 'false');
});

test('Escape closes desktop disclosure and returns focus to its trigger', () => {
  const a = app(), [{ trigger, panel, link }] = a.groups;
  a.context.toggleDesktopNav(trigger);
  link.focus();
  let prevented = false;
  a.dispatch('keydown', { key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(panel.classList.contains('hidden'), true);
  assert.equal(a.document.activeElement, trigger);
  assert.equal(prevented, true);
});

test('child links remain open until navigation; outside click and Tab departure close menus', () => {
  const a = app(), [{ trigger, panel, link }] = a.groups;
  a.context.toggleDesktopNav(trigger);
  a.dispatch('click', { target: link });
  assert.equal(panel.classList.contains('hidden'), false);
  a.dispatch('click', { target: a.main });
  assert.equal(panel.classList.contains('hidden'), true);
  a.context.toggleDesktopNav(trigger);
  a.dispatch('focusin', { target: a.main });
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('mobile menu announces state and Escape restores the toggle focus', () => {
  const a = app();
  a.context.toggleMobileMenu();
  assert.equal(a.mobile.classList.contains('hidden'), false);
  assert.equal(a.mobileButton.getAttribute('aria-expanded'), 'true');
  assert.equal(a.mobileButton.getAttribute('aria-label'), '메뉴 닫기');
  a.dispatch('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(a.mobile.classList.contains('hidden'), true);
  assert.equal(a.mobileButton.getAttribute('aria-expanded'), 'false');
  assert.equal(a.mobileButton.getAttribute('aria-label'), '메뉴 열기');
  assert.equal(a.document.activeElement, a.mobileButton);
});

test('section navigation closes both desktop and mobile disclosures', () => {
  const a = app(), [{ trigger }] = a.groups;
  a.context.toggleDesktopNav(trigger);
  a.context.openMobileMenu();
  a.context.renderSection('about', null, { syncHash: false });
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(a.mobileButton.getAttribute('aria-expanded'), 'false');
});

test('home does not fetch invisible notices or replace the DOM after the visitor starts reading', async () => {
  const a = app();
  a.context.renderSection('home', null, { syncHash: false });
  a.window.scrollY = 900;
  a.main.focus();
  for (const { fn } of a.timers.splice(0)) await fn();
  assert.equal(a.noticeRequests, 0);
  assert.equal(a.mainWrites, 1);
  assert.equal(a.window.scrollY, 900);
  assert.equal(a.document.activeElement, a.main);
});

test('route titles use known labels, distinguish screens, and restore the home title', () => {
  const a = app();
  for (const [section, label] of [['parenting', 'Parenting'], ['apply', '신청'], ['privacy', '개인정보처리방침'], ['thankyou', '접수 안내']]) {
    a.context.renderSection(section, { title: '<script>untrusted</script>' }, { syncHash: false });
    assert.equal(a.document.title, label + ' | ER');
  }
  a.context.renderSection('unknown-untrusted', null, { syncHash: false });
  assert.equal(a.document.title, 'ER 에니어그램 | 기독교·성경적 에니어그램 교육과 코칭');
  a.context.renderSection('home', null, { syncHash: false });
  assert.equal(a.document.title, 'ER 에니어그램 | 기독교·성경적 에니어그램 교육과 코칭');
});
