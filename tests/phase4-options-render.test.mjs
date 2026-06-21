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

test('Phase 4 uses three behavior subtype questions and three wing questions', () => {
  const { context } = loadTestScript();

  const result = vm.runInContext(`(() => {
    const subtypeQuestions = buildSubtypeBehaviorQuestions(7);
    const subtypeQuestions8 = buildSubtypeBehaviorQuestions(8);
    const wingQuestions = buildWingQuestionSet(7);
    return {
      subtypeCount: subtypeQuestions.length,
      wingCount: wingQuestions.length,
      subtypeChoiceCount: subtypeQuestions.filter((q) => q.subtypeChoice === true).length,
      wingQuestionCount: wingQuestions.filter((q) => q.wingChoice === true).length,
      subtypeText: subtypeQuestions.map((q) => q.options.map((o) => o.text).join(' ')).join(' '),
      subtype8Text: subtypeQuestions8.map((q) => q.options.map((o) => o.text).join(' ')).join(' '),
      wingText: wingQuestions.map((q) => [q.a, q.b].join(' ')).join(' ')
    };
  })()`, context);

  assert.equal(result.subtypeCount, 3);
  assert.equal(result.wingCount, 3);
  assert.equal(result.subtypeChoiceCount, 3);
  assert.equal(result.wingQuestionCount, 3);
  assert.match(result.subtypeText, /내가 하고 싶은 일을 미루고/);
  assert.match(result.subtype8Text, /요청받지 않아도 개입/);
  assert.doesNotMatch(result.subtypeText, /헌신|약자를 보호|미덕/);
  assert.match(result.wingText, /실제로 했던 행동/);
});

test('state stress adjustment damps type 6 when recent anxiety is high and rivals are close', () => {
  const { context } = loadTestScript();

  const result = vm.runInContext(`(() => {
    const final = {1: 25, 2: 4, 3: 4, 4: 4, 5: 24, 6: 27, 7: 4, 8: 4, 9: 23};
    const evidence = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
    const adjustment = applyStateStressAdjustment(final, evidence, 5.7);
    return {
      adjustment,
      type6: final[6],
      evidence6: evidence[6].map((item) => item.text).join(' ')
    };
  })()`, context);

  assert.equal(result.adjustment.applied, true);
  assert.ok(result.adjustment.type6Damp > 0);
  assert.ok(result.type6 < 27);
  assert.match(result.evidence6, /상태성 불안 보정/);
});

test('instinct attention-bias question contributes to instinct scores and pct denominator', () => {
  const { context } = loadTestScript();

  const result = vm.runInContext(`(() => {
    const scores = { sp: 0, sx: 0, so: 0 };
    addInstinctScoresFromResponses({ instinct_attention_1: 'sx' }, scores);
    return {
      scores,
      pct: buildInstinctPctFromScores({ sp: 0, sx: TEST_CONFIG.weights.instinctAttentionChoice, so: 0 })
    };
  })()`, context);

  assert.equal(result.scores.sx, 3);
  assert.equal(result.scores.sp, 0);
  assert.equal(result.scores.so, 0);
  assert.ok(result.pct.sx > 0 && result.pct.sx < 100);
});

test('scoring axes snapshot separates core, triad, instinct, and state adjustment fields', () => {
  const { context } = loadTestScript();

  const result = vm.runInContext(`(() => buildScoringAxesSnapshot({
    coreTypeScore: {1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 10, 9: 11},
    instinctScore: { sp: 3, sx: 2, so: 1 },
    stateStressAdjustment: { applied: true, type6Damp: 1.2 }
  }))()`, context);

  assert.deepEqual(Object.keys(result), [
    'centerScore',
    'harmonicScore',
    'hornevianScore',
    'coreTypeScore',
    'instinctScore',
    'stateStressAdjustment'
  ]);
  assert.equal(result.centerScore.body, 24);
  assert.equal(result.centerScore.heart, 15);
  assert.equal(result.centerScore.head, 24);
  assert.equal(result.stateStressAdjustment.type6Damp, 1.2);
});
