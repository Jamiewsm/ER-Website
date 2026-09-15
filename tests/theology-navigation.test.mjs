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
  const menu = new Set();
  const replaced = [];
  const context = {
    state: { currentSection: 'about', currentPayload: null },
    URLSearchParams,
    window: {
      location: {
        hash,
        replace(url) { replaced.push(url); }
      },
      scrollTo() {}
    },
    document: {
      body: { classList: { toggle() {}, remove() {} } },
      getElementById(id) {
        if (id === 'main-content') return main;
        if (id === 'sr-status') return status;
        if (id === 'mobile-menu') return { classList: { add: (name) => menu.add(name) } };
        return null;
      }
    },
    setTimeout(fn, delay) { timers.push({ fn, delay }); }
  };
  vm.createContext(context);
  vm.runInContext(theology, context);
  vm.runInContext(core, context);
  return { context, main, status, menu, replaced, timers };
}

test('theology hash routes send readers to the static theology document', () => {
  const app = createApp();
  const route = app.context.parseSectionHash();
  app.context.renderSection(route.sectionId, route.payload, { syncHash: false });
  assert.deepEqual(app.replaced, ['/theology/']);
  assert.equal(app.main.innerHTML, '');
});

test('theology focus values map to static section anchors', () => {
  for (const focus of ['scripture', 'design', 'fixation', 'restoration', 'calling']) {
    const app = createApp(`#theology?focus=${focus}`);
    const route = app.context.parseSectionHash();
    app.context.renderSection(route.sectionId, route.payload, { syncHash: false });
    assert.deepEqual(app.replaced, [`/theology/#theology-${focus}`]);
  }
});

test('unknown theology focus still opens the static document without throwing', () => {
  const app = createApp('#theology?focus=unknown');
  const route = app.context.parseSectionHash();
  assert.doesNotThrow(() => app.context.renderSection(route.sectionId, route.payload, { syncHash: false }));
  assert.deepEqual(app.replaced, ['/theology/']);
});

test('theologyStaticUrl helper keeps only known focus ids', () => {
  const app = createApp();
  assert.equal(app.context.theologyStaticUrl(null), '/theology/');
  assert.equal(app.context.theologyStaticUrl({ focus: 'restoration' }), '/theology/#theology-restoration');
  assert.equal(app.context.theologyStaticUrl({ focus: 'nope' }), '/theology/');
});
