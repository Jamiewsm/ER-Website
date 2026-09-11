import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const core = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');
const theology = readFileSync(new URL('../js/sections/theology.js', import.meta.url), 'utf8');

function createApp(hash = '#theology') {
  const main = { innerHTML: '' };
  const status = { textContent: '' };
  const timers = [];
  const focused = [];
  const scrolled = [];
  const menu = new Set();
  const context = {
    state: { currentSection: 'about', currentPayload: null },
    URLSearchParams,
    window: { location: { hash }, scrollTo() {} },
    document: {
      body: { classList: { toggle() {}, remove() {} } },
      getElementById(id) {
        if (id === 'main-content') return main;
        if (id === 'sr-status') return status;
        if (id === 'mobile-menu') return { classList: { add: (name) => menu.add(name) } };
        // Only focus headings that the real renderer has actually placed on the page.
        if (id.startsWith('theology-') && main.innerHTML.includes(`id="${id}"`)) {
          return {
            focus() { focused.push(id); },
            scrollIntoView() { scrolled.push(id); }
          };
        }
        return null;
      }
    },
    setTimeout(fn, delay) { timers.push({ fn, delay }); }
  };
  vm.createContext(context);
  vm.runInContext(theology, context);
  vm.runInContext(core, context);
  return {
    context, main, status, focused, scrolled, menu,
    flushFocus() { timers.filter(({ delay }) => delay === 60).forEach(({ fn }) => fn()); }
  };
}

test('direct theology links render the public page and announce navigation', () => {
  const app = createApp();
  const route = app.context.parseSectionHash();
  app.context.renderSection(route.sectionId, route.payload, { syncHash: false });

  assert.match(app.main.innerHTML, /<h1[^>]*>ER의 신학적 기초<\/h1>/);
  assert.equal(app.status.textContent, '신학적 기초 페이지로 이동했습니다');
  assert.equal(app.menu.has('hidden'), true);
  assert.equal(app.context.window.location.hash, '#theology');
});

test('each contents destination is shareable and receives keyboard focus', () => {
  for (const focus of ['scripture', 'design', 'fixation', 'restoration', 'calling']) {
    const app = createApp(`#theology?focus=${focus}`);
    const route = app.context.parseSectionHash();
    app.context.renderSection(route.sectionId, route.payload, { syncHash: false });
    app.flushFocus();

    assert.deepEqual(app.focused, [`theology-${focus}`]);
    assert.deepEqual(app.scrolled, [`theology-${focus}`]);
  }
});

test('reselecting the current section closes the menu and updates the shareable URL', () => {
  const app = createApp();
  app.context.renderSection('theology');
  app.menu.delete('hidden');
  app.context.renderSection('theology', { focus: 'restoration' });
  app.flushFocus();

  assert.equal(app.menu.has('hidden'), true);
  assert.equal(app.context.window.location.hash, '#theology?focus=restoration');
  assert.deepEqual(app.focused, ['theology-restoration']);
});

test('unknown focus values keep the theology page available without throwing', () => {
  const app = createApp('#theology?focus=unknown');
  const route = app.context.parseSectionHash();
  app.context.renderSection(route.sectionId, route.payload, { syncHash: false });
  assert.doesNotThrow(() => app.flushFocus());
  assert.deepEqual(app.focused, []);
  assert.match(app.main.innerHTML, /<h1/);
});

test('a delayed contents action does not steal focus after leaving theology', () => {
  const app = createApp();
  app.context.renderSection('theology', { focus: 'calling' }, { syncHash: false });
  app.context.state.currentSection = 'about';
  app.flushFocus();
  assert.deepEqual(app.focused, []);
  assert.deepEqual(app.scrolled, []);
});
