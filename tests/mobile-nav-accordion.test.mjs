// 모바일 접이식 네비게이션 마크업과 토글 함수를 검증하는 스모크 테스트
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appCoreSource = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');

test('mobile menu uses collapsed accordion groups by default', () => {
  assert.match(indexHtml, /class="mobile-nav-accordion"/);
  assert.match(indexHtml, /id="mobile-nav-parenting"/);
  assert.match(indexHtml, /class="mobile-nav-panel hidden"/);
  assert.match(indexHtml, /id="mobile-menu-backdrop"/);
  assert.match(indexHtml, /background-color: #FFFDF8/);
  assert.doesNotMatch(indexHtml, /bg-white\/9[58].*backdrop-blur/);
  assert.doesNotMatch(indexHtml, /px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-er-accent">Parenting<\/p>/);
});

test('toggleMobileNavGroup opens one panel and closes others', () => {
  const panels = {
    'mobile-nav-er': { classList: new Set(['hidden']), attrs: {} },
    'mobile-nav-test': { classList: new Set(['hidden']), attrs: {} }
  };
  const triggers = [];
  const context = {
    document: {
      querySelectorAll(selector) {
        if (selector === '.mobile-nav-panel') {
          return Object.entries(panels).map(([id, panel]) => ({
            id,
            classList: {
              add(cls) { panel.classList.add(cls); },
              remove(cls) { panel.classList.delete(cls); },
              contains(cls) { return panel.classList.has(cls); }
            },
            setAttribute(name, value) { panel.attrs[name] = value; }
          }));
        }
        if (selector === '.mobile-nav-trigger') return triggers;
        return [];
      },
      getElementById(id) {
        const panel = panels[id];
        if (!panel) return null;
        return {
          classList: {
            add(cls) { panel.classList.add(cls); },
            remove(cls) { panel.classList.delete(cls); },
            contains(cls) { return panel.classList.has(cls); }
          },
          setAttribute(name, value) { panel.attrs[name] = value; }
        };
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(appCoreSource, context, { filename: 'js/app-core.js' });

  const trigger = {
    attrs: { 'aria-expanded': 'false' },
    querySelector() { return { classList: { add() {}, remove() {} } }; },
    setAttribute(name, value) { this.attrs[name] = value; }
  };
  triggers.push(trigger);

  context.toggleMobileNavGroup('mobile-nav-test', trigger);

  assert.equal(panels['mobile-nav-er'].classList.has('hidden'), true);
  assert.equal(panels['mobile-nav-test'].classList.has('hidden'), false);
  assert.equal(trigger.attrs['aria-expanded'], 'true');
});
