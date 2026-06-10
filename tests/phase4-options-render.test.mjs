// Phase 4 선택지 렌더링 회귀 테스트 — 하위유형 이름은 숨기고 설명만 표시한다.
// 실행 — `node --test tests/phase4-options-render.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

class FakeEl {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    };
  }
  setAttribute() {}
  removeAttribute() {}
  appendChild() {}
  removeChild() {}
  addEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  focus() {}
  select() {}
}

function loadTestScript(search = '') {
  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeEl(id));
    return elements.get(id);
  };
  const document = {
    documentElement: new FakeEl('html'),
    body: new FakeEl('body'),
    head: new FakeEl('head'),
    getElementById: getEl,
    createElement: (tag) => new FakeEl(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    execCommand: () => true,
  };
  const window = {
    location: { search },
    parent: null,
    TestScoring: {},
    ERDiagnosticReportContent: null,
  };
  window.parent = window;

  const context = vm.createContext({
    window,
    document,
    navigator: {},
    localStorage: { getItem: () => null, setItem: () => {} },
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: () => 0,
  });
  const source = fs.readFileSync(path.join(rootDir, 'js/test.js'), 'utf8');
  vm.runInContext(source, context, { filename: 'js/test.js' });
  return { context, elements };
}

const phase4SubtypeQuestion = {
  id: 'p4_7_subtype',
  format: 'abc',
  q: '일상의 지루함이나 내면의 결핍을 느낄 때, 내 에너지가 무의식적으로 쏠리는 방향은 어느 쪽인가?',
  qEn: 'When I feel daily boredom or inner lack, where does my energy unconsciously go?',
  options: [
    {
      value: 'sp',
      label: '자기보존 7번 - 실용적 네트워크',
      labelEn: 'Self-preservation 7 - Practical network',
      text: '나와 내 사람들에게 이익이 될 만한 실질적인 기회나 정보를 기가 막히게 찾아낸다.',
      textEn: 'I quickly find practical opportunities or information that benefit me and my people.',
    },
    {
      value: 'so',
      label: '사회적 7번 - 희생적 이상주의',
      labelEn: 'Social 7 - Sacrificial idealism',
      text: '내 욕구를 미루더라도 타인이나 대의를 위해 헌신하며 책임감 있고 좋은 사람으로 남기 위해 에너지를 쓴다.',
      textEn: 'Even when I postpone my own desires, I spend energy serving others or a cause.',
    },
    {
      value: 'sx',
      label: '1:1/성적 7번 - 본질 갈망과 허무',
      labelEn: 'One-to-one 7 - Longing for essence and disillusionment',
      text: '단순한 재미보다는 사물의 깊은 본질과 완벽한 이상을 끊임없이 갈망한다.',
      textEn: 'More than simple fun, I constantly long for deep essence and a perfect ideal.',
    },
  ],
};

test('Phase 4 subtype choices show descriptions without Korean subtype labels', () => {
  const { context, elements } = loadTestScript();
  context.phase4SubtypeQuestion = phase4SubtypeQuestion;

  vm.runInContext("renderQuestions('phase4-container', [phase4SubtypeQuestion], 'p4');", context);
  const html = elements.get('phase4-container').innerHTML;

  assert.match(html, /실질적인 기회나 정보/);
  assert.match(html, /타인이나 대의를 위해 헌신/);
  assert.match(html, /깊은 본질과 완벽한 이상/);
  assert.doesNotMatch(html, /자기보존 7번|사회적 7번|1:1\/성적 7번/);
});

test('Phase 4 subtype choices show descriptions without English subtype labels', () => {
  const { context, elements } = loadTestScript('?lang=en');
  context.phase4SubtypeQuestion = phase4SubtypeQuestion;

  vm.runInContext("renderQuestions('phase4-container', [phase4SubtypeQuestion], 'p4');", context);
  const html = elements.get('phase4-container').innerHTML;

  assert.match(html, /practical opportunities/);
  assert.match(html, /serving others or a cause/);
  assert.match(html, /deep essence and a perfect ideal/);
  assert.doesNotMatch(html, /Self-preservation 7|Social 7|One-to-one 7/);
});
