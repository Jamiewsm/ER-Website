// Runs the current browser runtime; synthetic consistency checks are not measured typing accuracy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');

function loadRuntime() {
  const answers = {};
  const storage = new Map();
  const elements = new Map();
  class Element {
    constructor() {
      Object.assign(this, { innerHTML: '', innerText: '', textContent: '', style: {}, dataset: {}, value: '' });
      this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    }
    addEventListener() {}
    setAttribute() {}
    removeAttribute() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    appendChild() {}
    scrollIntoView() {}
    focus() {}
  }
  const sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  };
  const document = {
    documentElement: new Element(), body: new Element(), head: new Element(),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement: () => new Element(),
    querySelector(selector) {
      const name = selector.match(/name="([^"]+)"/);
      return name && Object.hasOwn(answers, name[1]) ? { value: answers[name[1]] } : null;
    },
    querySelectorAll() { return []; }
  };
  const window = { location: { search: '', reload() {} }, sessionStorage, scrollTo() {} };
  window.parent = window;
  const context = vm.createContext({ window, document, navigator: {}, localStorage: sessionStorage, sessionStorage, URLSearchParams, console, setTimeout, clearTimeout, requestAnimationFrame() {} });
  vm.runInContext(source, context);
  return { answers, evaluate: (code) => JSON.parse(JSON.stringify(vm.runInContext(code, context))) };
}

test('current narrative runtime resolves coherent preferences for all 756 candidate profiles', () => {
  const { evaluate } = loadRuntime();
  const result = evaluate(`(() => {
    let checked = 0;
    const failures = [];
    const inspect = (types) => {
      const questions = buildNarrativeQuestions(types);
      for (const target of types) {
        const responses = Object.fromEntries(questions.map((q) => [q.id,
          q.narrativePair ? (q.leftType === target ? 'A' : q.rightType === target ? 'B' : 'A') : 'sp'
        ]));
        const scored = scoreNarrativeResponses(questions, responses);
        const resolution = getCoreResolution(scored.final);
        const reverseQuestions = buildNarrativeQuestions(types.slice().reverse());
        const reversed = scoreNarrativeResponses(reverseQuestions, responses);
        if (resolution.core !== target || !resolution.coreResolved ||
            !maybeShowPhase4({ ...scored, assessmentVersion: 'word-narrative-v2' }) ||
            JSON.stringify(scored.final) !== JSON.stringify(reversed.final)) {
          failures.push({ types, target, resolution });
        }
        checked += 1;
      }
    };
    for (let a = 1; a <= 7; a++) for (let b = a + 1; b <= 8; b++) for (let c = b + 1; c <= 9; c++) {
      inspect([a, b, c]);
      for (let d = c + 1; d <= 9; d++) inspect([a, b, c, d]);
    }
    return { checked, failures };
  })()`);
  assert.equal(result.checked, 756);
  assert.deepEqual(result.failures, []);
});

test('all 210 candidate sets with unknown comparisons keep the core unresolved', () => {
  const { evaluate } = loadRuntime();
  const result = evaluate(`(() => {
    let checked = 0;
    const failures = [];
    const inspect = (types) => {
      const questions = buildNarrativeQuestions(types);
      const responses = Object.fromEntries(questions.map((q) => [q.id, 'U']));
      const scored = scoreNarrativeResponses(questions, responses);
      if (getCoreResolution(scored.final).coreResolved || maybeShowPhase4({ ...scored, assessmentVersion: 'word-narrative-v2' })) failures.push(types);
      checked += 1;
    };
    for (let a = 1; a <= 7; a++) for (let b = a + 1; b <= 8; b++) for (let c = b + 1; c <= 9; c++) {
      inspect([a, b, c]);
      for (let d = c + 1; d <= 9; d++) inspect([a, b, c, d]);
    }
    return { checked, failures };
  })()`);
  assert.equal(result.checked, 210);
  assert.deepEqual(result.failures, []);
});

test('all 576 subtype response triples require at least two votes for a resolved subtype', () => {
  const { evaluate, answers } = loadRuntime();
  const choices = ['sp', 'so', 'sx', 'U'];
  let checked = 0;
  for (let core = 1; core <= 9; core += 1) {
    const questions = evaluate(`buildSubtypeBehaviorQuestions(${core})`);
    for (const a of choices) for (const b of choices) for (const c of choices) {
      const triple = [a, b, c];
      questions.forEach((q, index) => { answers[q.id] = triple[index]; });
      const expected = choices.slice(0, 3).find((choice) => triple.filter((value) => value === choice).length >= 2) || null;
      const actual = evaluate(`resolvePhase4Subtype(buildSubtypeBehaviorQuestions(${core}))`);
      assert.equal(actual.subtypeCode, expected, `core ${core}: ${triple.join('/')}`);
      checked += 1;
    }
  }
  assert.equal(checked, 576);
});

test('all 243 wing response triples preserve ties and insufficient evidence', () => {
  const { evaluate, answers } = loadRuntime();
  const choices = ['A', 'B', 'U'];
  let checked = 0;
  for (let core = 1; core <= 9; core += 1) {
    const questions = evaluate(`buildWingQuestionSet(${core})`);
    for (const a of choices) for (const b of choices) for (const c of choices) {
      const triple = [a, b, c];
      questions.forEach((q, index) => { answers[q.id] = triple[index]; });
      const dominant = ['A', 'B'].find((choice) => triple.filter((value) => value === choice).length >= 2);
      const expected = dominant ? questions[0][dominant === 'A' ? 'leftWing' : 'rightWing'] : null;
      const actual = evaluate(`resolvePhase4Wing(buildWingQuestionSet(${core}))`);
      assert.equal(actual.wingNum, expected, `core ${core}: ${triple.join('/')}`);
      checked += 1;
    }
  }
  assert.equal(checked, 243);
});
