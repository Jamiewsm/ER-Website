// 단어 선별과 서사형 변별의 균형, 보류 판정, 진행 복원을 검증한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/test.js', import.meta.url), 'utf8');
const expectedWords = [
  '일관성 있는|양심적인|완벽을 추구하는|비판적인|합리적인|정확한|간섭하는|공정한|원칙적인',
  '희생하는|배려심이 깊은|다정한|겸손한|스킨십을 좋아하는|베풀기 좋아하는|소유욕이 강한|보호하려는|사교적인',
  '목표 지향적인|부지런한|책임감 있는|융통성 있는|효율을 중시하는|최고가 되고 싶은|인정받고 싶은|유능한|야심 있는',
  '상상력이 풍부한|직관적인|낭만적인|자신을 가엾게 여기는|개성이 강한|생각이 깊은|속마음을 잘 드러내지 않는|아름다움에 민감한|독립적인',
  '철저한|차분한|사려 깊은|예리한|학구적인|재치 있는|분석적인|인색한|호기심이 많은',
  '준비성 있는|예의 바른|협조적인|순종적인|전통을 따르는|충성심이 강한|의존적인|걱정이 많은|의심이 많은',
  '외향적인|낙관적인|충동적인|현실을 피하려는|거리낌 없는|산만한|개방적인|쾌활한|다재다능한',
  '자신감 있는|주도적인|용감한|도전적인|지배하려는|끈질긴|단호한|현실적인|방어적인',
  '나서지 않는|양보하는|감정 기복이 적은|평화를 추구하는|중립적인|수용적인|참을성 있는|느긋한|편견 없는'
];

function loadRuntime(search = '') {
  const answers = {};
  const storage = new Map();
  const elements = new Map();
  class Element {
    constructor(id = '') {
      Object.assign(this, { id, innerHTML: '', innerText: '', textContent: '', style: {}, dataset: {}, value: '', listeners: {} });
      this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute() {}
    removeAttribute() {}
    appendChild() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    scrollIntoView() {}
    closest() { return null; }
    focus() {}
  }
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const sessionStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  const document = {
    documentElement: new Element('html'), body: new Element('body'), head: new Element('head'),
    getElementById: getElement, createElement: (tag) => new Element(tag),
    querySelector(selector) { const name = selector.match(/name="([^"]+)"/); return name && Object.hasOwn(answers, name[1]) ? { value: answers[name[1]] } : null; },
    querySelectorAll() { return []; }
  };
  const window = { location: { search, reload() {} }, sessionStorage, parent: null, scrollTo() {} };
  window.parent = window;
  const context = vm.createContext({ window, document, navigator: {}, localStorage: sessionStorage, sessionStorage, URLSearchParams, console, setTimeout, clearTimeout, requestAnimationFrame() {} });
  vm.runInContext(source, context);
  const evaluate = (code) => JSON.parse(JSON.stringify(vm.runInContext(code, context)));
  return { context, evaluate, answers, storage, elements };
}

test('81 distinct words have equal type counts and English aliases', () => {
  const { evaluate, elements } = loadRuntime();
  const questions = evaluate('wordScreeningQuestions');
  assert.equal(questions.length, 81);
  assert.equal(new Set(questions.map((question) => question.id)).size, 81);
  assert.equal(new Set(questions.map((question) => question.q)).size, 81);
  expectedWords.forEach((words, index) => {
    const typeWords = questions.filter((question) => question.type === index + 1);
    assert.equal(typeWords.length, 9);
    assert.deepEqual(typeWords.map((question) => question.q), words.split('|'));
    assert.ok(typeWords.every((question) => question.qEn && !/[가-힣]/.test(question.qEn)));
  });
  const rendered = elements.get('elim-container').innerHTML;
  assert.doesNotMatch(rendered, /[1-9]번|data-elim-type|유형/);
  assert.match(rendered, /value="Y"/);
  assert.match(rendered, /value="U"/);
  assert.match(rendered, /value="N"/);
});

test('not sure is recorded separately from no and an unanswered item', () => {
  const { evaluate } = loadRuntime();
  const result = evaluate("scoreWordScreening({ word_1_01: 'Y', word_1_02: 'U', word_1_03: 'N' })");
  const first = result.ranked.find((row) => row.type === 1);
  assert.deepEqual(first, { type: 1, yes: 1, no: 1, unsure: 1, missing: 6, score: 1 });
  assert.equal(result.reason, 'incomplete');
  assert.deepEqual(result.candidates, []);
});

function screenWithCounts(evaluate, counts) {
  return evaluate(`scoreWordScreening(Object.fromEntries(wordScreeningQuestions.map((question) => [question.id, Number(question.id.split('_')[2]) <= ${JSON.stringify(counts)}[question.type - 1] ? 'Y' : 'N'])))`);
}

test('clear boundaries keep three candidates and a close fourth expands to four', () => {
  const { evaluate } = loadRuntime();
  assert.deepEqual(screenWithCounts(evaluate, [9, 8, 6, 3, 2, 1, 0, 0, 0]).candidates, [1, 2, 3]);
  assert.deepEqual(screenWithCounts(evaluate, [9, 8, 6, 5, 3, 2, 1, 0, 0]).candidates, [1, 2, 3, 4]);
});

test('all unsure, all equal, and cutoff ties never select candidates by type number', () => {
  const { evaluate } = loadRuntime();
  for (const answer of ['U', 'Y', 'N']) {
    const result = evaluate(`scoreWordScreening(Object.fromEntries(wordScreeningQuestions.map((question) => [question.id, '${answer}'])))`);
    assert.equal(result.unclear, true);
    assert.deepEqual(result.candidates, []);
  }
  const cutoff = screenWithCounts(evaluate, [9, 8, 6, 6, 6, 2, 1, 0, 0]);
  assert.equal(cutoff.reason, 'cutoff_tie');
  assert.deepEqual(cutoff.candidates, []);
});

test('every three- and four-candidate combination receives equal pair exposure', () => {
  const { evaluate } = loadRuntime();
  const result = evaluate(`(() => {
    let checked = 0;
    const verify = (types) => {
      const questions = buildNarrativeQuestions(types);
      const pairs = questions.filter((question) => question.narrativePair);
      const exposures = Object.fromEntries(types.map((type) => [type, pairs.filter((question) => question.leftType === type || question.rightType === type).length]));
      if (pairs.length !== types.length * (types.length - 1) || !Object.values(exposures).every((value) => value === 2 * (types.length - 1))) throw new Error('Unequal exposure');
      if (!pairs.every((question) => question.a && question.b && question.q)) throw new Error('Missing narrative copy');
      if (new Set(questions.map((question) => question.id)).size !== questions.length) throw new Error('Duplicate IDs');
      checked += 1;
    };
    for (let a=1;a<=7;a++) for (let b=a+1;b<=8;b++) for (let c=b+1;c<=9;c++) { verify([a,b,c]); for(let d=c+1;d<=9;d++) verify([a,b,c,d]); }
    return checked;
  })()`);
  assert.equal(result, 210);
});

test('narratives can overturn the word leader and unknown choices add no core score', () => {
  const { evaluate } = loadRuntime();
  const screened = screenWithCounts(evaluate, [6, 0, 0, 7, 0, 0, 0, 0, 9]);
  assert.equal(screened.candidates[0], 9);
  const result = evaluate(`(() => {
    const questions = buildNarrativeQuestions([9, 4, 1]);
    const responses = Object.fromEntries(questions.map((question) => [question.id, question.leftType === 1 ? 'A' : question.rightType === 1 ? 'B' : 'U']));
    return scoreNarrativeResponses(questions, responses);
  })()`);
  assert.equal(result.final[1], 4);
  assert.equal(result.final[4], 0);
  assert.equal(result.final[9], 0);
  assert.equal(result.narrativeMeta.decisiveAnswers, 4);
  assert.equal(result.narrativeMeta.totalPairs, 3);
  assert.equal(result.narrativeMeta.totalQuestions, 6);
  const unsure = evaluate("scoreNarrativeResponses(buildNarrativeQuestions([1, 4, 9]), {})");
  assert.ok(Object.values(unsure.final).every((score) => score === 0));
});

test('subtype and wing ties or only one decisive answer remain unresolved', () => {
  const { evaluate, answers } = loadRuntime();
  answers.p4_7_subtype_behavior_1 = 'sp';
  answers.p4_7_subtype_behavior_2 = 'so';
  answers.p4_7_subtype_behavior_3 = 'sx';
  answers.p4_7_wing_behavior_1 = 'A';
  answers.p4_7_wing_behavior_2 = 'B';
  answers.p4_7_wing_behavior_3 = 'U';
  assert.equal(evaluate('resolvePhase4Subtype(buildSubtypeBehaviorQuestions(7))').subtypeCode, null);
  assert.equal(evaluate('resolvePhase4Wing(buildWingQuestionSet(7))').wingNum, null);
  answers.p4_7_subtype_behavior_2 = 'sp';
  answers.p4_7_wing_behavior_3 = 'B';
  assert.equal(evaluate('resolvePhase4Subtype(buildSubtypeBehaviorQuestions(7))').subtypeCode, 'sp');
  assert.equal(evaluate('resolvePhase4Wing(buildWingQuestionSet(7))').wingNum, 8);
  answers.p4_7_subtype_behavior_2 = 'U';
  answers.p4_7_subtype_behavior_3 = 'U';
  assert.equal(evaluate('resolvePhase4Subtype(buildSubtypeBehaviorQuestions(7))').subtypeCode, null);
});

test('session round trip preserves choices and page while dropping old free text', () => {
  const { evaluate, context, storage } = loadRuntime();
  vm.runInContext("testState.wordResponses = { word_1_01: 'Y', word_5_02: 'U' }; testState.pagerPositions.word = 8; testState.reflection = '내 경험'; saveAssessmentSession();", context);
  assert.equal(storage.size, 1);
  assert.doesNotMatch(storage.get('er_word_narrative_v2'), /reflection|내 경험/);
  vm.runInContext("testState.wordResponses = {}; testState.pagerPositions = {}; delete testState.reflection;", context);
  assert.equal(evaluate('restoreAssessmentSession()'), true);
  assert.deepEqual(evaluate('testState.wordResponses'), { word_1_01: 'Y', word_5_02: 'U' });
  assert.equal(evaluate('testState.pagerPositions.word'), 8);
  assert.equal(evaluate("Object.hasOwn(testState, 'reflection')"), false);
  assert.deepEqual(evaluate('testState.responseTiming.firstAnswerAt'), {});
  assert.equal(evaluate("getValidSavedAssessment({version: 'old-version'})"), null);
  vm.runInContext('clearAssessmentSession()', context);
  assert.equal(storage.size, 0);
});

test('English narratives have translated text for every candidate pair', () => {
  const { evaluate } = loadRuntime('?lang=en');
  const questions = evaluate('buildNarrativeQuestions([1,2,3,4,5,6,7,8,9])');
  assert.deepEqual(questions.filter((question) => question.narrativePair && /[가-힣]|undefined/.test([question.qEn, question.aEn, question.bEn].join(' '))).map((question) => question.id), []);
});

test('narrative unknown ratio includes every answered choice and excludes word screening', () => {
  const { evaluate } = loadRuntime();
  const stats = evaluate(`getLikertResponseStats({
    ...Object.fromEntries(Array.from({length: 21}, (_, index) => ['narrative_' + index, index < 8 ? 'U' : index < 19 ? 'A' : 'sp'])),
    word_1_01: 'U', word_1_02: 'U'
  }, 'word-narrative-v2')`);
  assert.equal(stats.unknownCount, 8);
  assert.equal(stats.totalCount, 21);
  assert.equal(stats.unknownRatio, 8 / 21);
  assert.equal(stats.straightLineRatio, 0);
});

test('uncompared candidates cannot be silently discarded before subtype and wing', () => {
  const { evaluate } = loadRuntime();
  const partial = evaluate(`(() => {
    const questions = buildNarrativeQuestions([1, 2, 3, 9]);
    const responses = Object.fromEntries(questions.map((question) => [question.id, question.rightType === 9 ? 'U' : 'A']));
    const result = scoreNarrativeResponses(questions, responses);
    return { ...result.narrativeMeta, mayContinue: maybeShowPhase4({ ...result, assessmentVersion: 'word-narrative-v2' }) };
  })()`);
  assert.equal(partial.decisiveAnswers, 6);
  assert.equal(partial.totalQuestions, 12);
  assert.equal(partial.answeredPairs, 3);
  assert.equal(partial.totalPairs, 6);
  assert.equal(partial.mayContinue, false);
  const complete = evaluate(`(() => {
    const questions = buildNarrativeQuestions([1, 2, 3, 9]);
    const responses = Object.fromEntries(questions.map((question) => [question.id, 'A']));
    return maybeShowPhase4({ ...scoreNarrativeResponses(questions, responses), assessmentVersion: 'word-narrative-v2' });
  })()`);
  assert.equal(complete, true);
});

test('restoring the detail stage reconstructs candidates, narrative scores and prior choices', () => {
  const { evaluate, context, answers, storage } = loadRuntime();
  const wordResponses = evaluate("Object.fromEntries(wordScreeningQuestions.map((question) => [question.id, Number(question.id.split('_')[2]) <= ({1:9,2:8,3:6}[question.type] || 0) ? 'Y' : 'N']))");
  const questions = evaluate('buildNarrativeQuestions([1, 2, 3])');
  const narrativeResponses = Object.fromEntries(questions.map((question) => [question.id, question.narrativePair ? 'A' : 'sp']));
  narrativeResponses.p4_1_subtype_behavior_1 = 'sp';
  Object.assign(answers, narrativeResponses);
  storage.set('er_word_narrative_v2', JSON.stringify({ version: 'word-narrative-v2', stage: 'detail', candidateTypes: [1, 2, 3], wordResponses, narrativeResponses, reflection: '지난주 경험', pagerPositions: { p4: 1 } }));
  assert.equal(evaluate('restoreAssessmentSession()'), true);
  assert.equal(evaluate('testState.stage'), 'detail');
  assert.deepEqual(evaluate('testState.candidateTypes'), [1, 2, 3]);
  assert.equal(evaluate('testState.pendingResult.final[1]'), 4);
  assert.equal(evaluate('testState.narrativeResponses.p4_1_subtype_behavior_1'), 'sp');
  assert.equal(evaluate('testState.pagerPositions.p4'), 1);
  assert.equal(evaluate("Object.hasOwn(testState, 'reflection')"), false);
  vm.runInContext('restartAssessment()', context);
  assert.equal(storage.size, 0);
});


test('old questionnaire sessions cannot reinterpret revised word IDs', () => {
  const { evaluate, storage } = loadRuntime();
  const old = { version: 'word-narrative-v1', stage: 'words', wordResponses: { word_1_01: 'Y' }, reflection: 'old private text' };
  storage.set('er_word_narrative_v1', JSON.stringify(old));
  assert.equal(evaluate('restoreAssessmentSession()'), false);
  storage.set('er_word_narrative_v2', JSON.stringify(old));
  assert.equal(evaluate('restoreAssessmentSession()'), false);
  assert.deepEqual(evaluate('testState.wordResponses'), {});
});


test('all subtype result labels use plain Korean names without unexplained nicknames', () => {
  const { evaluate } = loadRuntime();
  for (let core = 1; core <= 9; core += 1) {
    const labels = evaluate(`buildSubtypeBehaviorQuestions(${core})[0].options.map(option => option.label)`);
    assert.deepEqual(labels, ['자기보존', '사회적', '성적(일대일)']);
  }
});
