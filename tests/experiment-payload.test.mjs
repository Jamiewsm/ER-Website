import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/diagnostic-experiment.js', import.meta.url), 'utf8');

function loadExperimentModule({ windowOverrides = {}, documentOverrides = {} } = {}) {
  const windowStub = Object.assign({
    location: { search: '' },
    addEventListener() {},
    sessionStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  }, windowOverrides);
  const documentStub = Object.assign({
    documentElement: { lang: 'ko' },
    readyState: 'complete',
    getElementById() { return null; },
    addEventListener() {}
  }, documentOverrides);
  const context = vm.createContext({
    window: windowStub,
    document: documentStub,
    navigator: { userAgent: 'node-test' },
    URLSearchParams,
    console,
    setTimeout() {}
  });
  vm.runInContext(source, context);
  return context.window.ERDiagnosticExperiment;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('experiment row keeps analytics-ready payload for calibration', () => {
  const api = loadExperimentModule();
  assert.ok(api._test, 'test helpers should expose experiment row builders');

  const row = api._test.buildRow(
    {
      participantName: 'Test User',
      consentAccepted: true,
      consentVersion: '2026-test',
      startedAt: '2026-06-21T00:00:00.000Z'
    },
    {
      ranked: [
        { type: 2, score: 90 },
        { type: 9, score: 86 },
        { type: 6, score: 70 }
      ],
      top3Total: 246,
      final: { 2: 90, 9: 86, 6: 70 },
      confidence: '보통',
      confidenceLabel: '신뢰도: 보통',
      core: 2,
      second: { type: 9, score: 86 },
      diff: 0.04,
      coreResolved: true,
      reportKey: 'sx_2_2w3',
      phase4: { subtypeCode: 'sx_2', subtypeLabel: '성적 2번', wingNum: 3 },
      responseQuality: { level: 'good', flags: [], metrics: { instinctGap: 22 } },
      scoringAxes: { centerScore: { heart: 12, head: 3, body: 5 } },
      tieSnapshot: {
        t29: { enabled: true, weight: 1.5, margin: 0.04 },
        t16: { enabled: false, weight: 0, margin: null }
      },
      stateStressAdjustment: { applied: false },
      responseTiming: { totalSeconds: 420, avgSecondsPerAnswered: 8.4 },
      confidenceExplanation: { label: '신뢰도: 보통' },
      responses: { center_auto_1: 'A' }
    },
    'ambiguous',
    'general note',
    '2',
    'sx',
    '2w3',
    {
      accurateParts: '관계 안에서 필요한 사람이 되려는 부분',
      inaccurateParts: '늘 외향적이라는 느낌',
      consultationCheck: '2번과 9번 혼동 확인'
    }
  );

  const payload = plain(row.result_summary.experiment_payload);
  assert.deepEqual(payload.result, {
    core: 2,
    subtype: 'sx_2',
    wing: 3,
    confidence: '보통',
    coreResolved: true,
    reportKey: 'sx_2_2w3'
  });
  assert.deepEqual(payload.rankedTop3, [
    { type: 2, score: 90, share: 36.59 },
    { type: 9, score: 86, share: 34.96 },
    { type: 6, score: 70, share: 28.46 }
  ]);
  assert.deepEqual(payload.topPair, { first: 2, second: 9, diff: 0.04 });
  assert.deepEqual(payload.responseQuality, { level: 'good', flags: [], metrics: { instinctGap: 22 } });
  assert.deepEqual(payload.scoringAxes, { centerScore: { heart: 12, head: 3, body: 5 } });
  assert.deepEqual(payload.tieBreakersUsed, [{ key: 't29', weight: 1.5, margin: 0.04 }]);
  assert.deepEqual(payload.stateStressAdjustment, { applied: false });
  assert.deepEqual(payload.phase4Result, { subtypeCode: 'sx_2', subtypeLabel: '성적 2번', wingNum: 3 });
  assert.deepEqual(payload.timings, { totalSeconds: 420, avgSecondsPerAnswered: 8.4 });
  assert.equal(Object.hasOwn(payload, 'assessmentVersion'), false);
  assert.equal(Object.hasOwn(payload, 'screening'), false);
  assert.equal(Object.hasOwn(payload, 'narrativeReflection'), false);
});

test('word-narrative experiment row preserves screening separately from narrative evidence', () => {
  const api = loadExperimentModule();
  const screening = {
    version: 'word-screening-v1',
    responses: { word_1_1: 'yes', word_2_1: 'no', word_3_1: 'unsure' },
    ranked: [
      { type: 1, yes: 10, no: 1, unsure: 2, score: 9 },
      { type: 6, yes: 9, no: 2, unsure: 2, score: 7 },
      { type: 9, yes: 8, no: 3, unsure: 2, score: 5 },
      { type: 2, yes: 7, no: 4, unsure: 2, score: 3 }
    ],
    candidates: [1, 6, 9, 2],
    unclear: true
  };
  const row = api._test.buildRow(
    { participantName: 'Test User', consentAccepted: true },
    {
      assessmentVersion: 'word-narrative-v2',
      screening,
      narrativeReflection: '  최근에 약속을 지키려다 갈등이 생겼습니다.  ',
      responses: { narrative_1: 'A' },
      evidence: { 1: ['narrative_1'] }
    },
    'ambiguous'
  );

  const payload = plain(row.result_summary.experiment_payload);
  assert.equal(payload.assessmentVersion, 'word-narrative-v2');
  assert.deepEqual(payload.screening, screening);
  assert.equal(Object.hasOwn(payload, 'narrativeReflection'), false);
  assert.deepEqual(plain(row.responses), { narrative_1: 'A' });
  assert.deepEqual(plain(row.evidence), { 1: ['narrative_1'] });
  assert.equal(row.consent_version, '2026-09-21-choice-only');
});

test('new submissions discard all legacy free-text feedback fields', () => {
  const api = loadExperimentModule();
  const row = plain(api._test.buildRow({}, {
    assessmentVersion: 'word-narrative-v2', narrativeReflection: 'old private reflection'
  }, 'correct', 'old private note', '4', 'so', '4w5', {
    accurateParts: 'old private accurate', inaccurateParts: 'old private inaccurate', consultationCheck: 'old private consultation'
  }));
  assert.equal(row.self_note, null);
  assert.equal(row.result_summary.feedback_detail.accurate_parts, null);
  assert.equal(row.result_summary.feedback_detail.inaccurate_parts, null);
  assert.equal(row.result_summary.feedback_detail.consultation_check, null);
  assert.doesNotMatch(JSON.stringify(row), /old private|narrativeReflection/);
  assert.deepEqual(row.result_summary.feedback_detail.confirmed_type, { core: '4', subtype: 'so', wing: '4w5' });
});

test('confirmed type choices reject invalid values and nonadjacent wings', () => {
  const api = loadExperimentModule();
  for (const [core, subtype, wing, expected] of [
    ['1', 'sp', '1w9', ['1', 'sp', '1w9']],
    ['9', 'sx', '9w1', ['9', 'sx', '9w1']],
    ['4', 'so', '4w7', ['4', 'so', null]],
    ['free text', 'other', '4w5', [null, null, null]]
  ]) {
    const row = api._test.buildRow({}, {}, 'correct', null, core, subtype, wing);
    assert.deepEqual([row.self_reported_core, row.self_reported_subtype, row.self_reported_wing], expected);
  }
});

test('choice-only experiment data is saved only by explicit submission with consent', async () => {
  const inserts = [];
  const listeners = {};
  const host = { classList: { remove() {} }, innerHTML: '' };
  const submit = { addEventListener(name, listener) { listeners[name] = listener; } };
  const status = { textContent: '' };
  const meta = { participantName: 'Test User', consentAccepted: false };
  const api = loadExperimentModule({
    windowOverrides: {
      location: { search: '?experiment=1' },
      __ER_DIAGNOSTIC_EXPERIMENT__: meta,
      supabaseClient: {
        from(table) {
          assert.equal(table, 'diagnostic_experiment_sessions');
          return { async insert(row) { inserts.push(plain(row)); return { error: null }; } };
        }
      }
    },
    documentOverrides: {
      getElementById(id) {
        return {
          'experiment-result-panel': host,
          'experiment-submit-btn': submit,
          'experiment-submit-status': status
        }[id] || null;
      },
      querySelector() { return { value: 'correct' }; }
    }
  });

  api.onResultReady({
    assessmentVersion: 'word-narrative-v2',
    narrativeReflection: '작성한 경험 메모'
  });
  assert.equal(inserts.length, 0, 'rendering a result must not submit responses or free text');
  assert.match(host.innerHTML, /이름, 검사 응답과 결과, 선택한 평가가 저장됩니다/);
  assert.doesNotMatch(host.innerHTML, /<textarea|experiment-self-note|experiment-accurate-parts/);
  assert.equal((host.innerHTML.match(/<select /g) || []).length, 3);

  await listeners.click();
  assert.equal(inserts.length, 0, 'explicit submission still requires consent');
  assert.match(status.textContent, /저장 동의 정보가 없습니다/);

  meta.consentAccepted = true;
  await listeners.click();
  assert.equal(inserts.length, 1);
  assert.doesNotMatch(JSON.stringify(inserts[0]), /narrativeReflection|작성한 경험 메모/);
  assert.equal(inserts[0].consent_accepted, true);
});

test('experiment consent gate hides every restored stage then resumes it without repeated gating', () => {
  const ids = ['experiment-gate', 'experiment-closed', 'experiment-gate-start', 'experiment-participant-name', 'experiment-consent', 'experiment-gate-error', 'phase0-form', 'phase1-form', 'phase2-form', 'phase3-form', 'phase4-form', 'result-view', 'progress-container'];
  const handlers = {};
  const windowHandlers = {};
  const elements = Object.fromEntries(ids.map((id) => {
    const classes = new Set();
    return [id, {
      value: id === 'experiment-participant-name' ? 'Test User' : '',
      checked: id === 'experiment-consent',
      dataset: {},
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name)
      },
      addEventListener(event, handler) { handlers[`${id}:${event}`] = handler; }
    }];
  }));
  let resumeCount = 0;
  loadExperimentModule({
    windowOverrides: {
      location: { search: '?experiment=1' },
      addEventListener(event, handler) { windowHandlers[event] = handler; },
      resumeAssessmentAfterGate() {
        resumeCount += 1;
        elements['phase4-form'].classList.remove('hidden');
        elements['progress-container'].classList.remove('hidden');
      }
    },
    documentOverrides: { getElementById: (id) => elements[id] || null }
  });

  for (const id of ['phase0-form', 'phase1-form', 'phase2-form', 'phase3-form', 'phase4-form', 'result-view', 'progress-container']) {
    assert.equal(elements[id].classList.contains('hidden'), true, `${id} must not bypass consent after session restore`);
  }
  assert.equal(elements['experiment-gate'].classList.contains('hidden'), false);

  handlers['experiment-gate-start:click']();
  assert.equal(resumeCount, 1);
  assert.equal(elements['experiment-gate'].classList.contains('hidden'), true);
  assert.equal(elements['phase4-form'].classList.contains('hidden'), false);
  assert.equal(elements['phase0-form'].classList.contains('hidden'), true, 'resuming must not reset the assessment to the word stage');

  windowHandlers.load();
  assert.equal(resumeCount, 1);
  assert.equal(elements['experiment-gate'].classList.contains('hidden'), true, 'late initialization must preserve accepted consent');
  assert.equal(elements['phase4-form'].classList.contains('hidden'), false);
});

test('assessment and feedback markup contain no free-response controls', () => {
  const html = readFileSync(new URL('../test.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<textarea|narrative-reflection/);
  assert.doesNotMatch(source, /<textarea|experiment-self-note|experiment-accurate-parts|experiment-inaccurate-parts|experiment-consultation-check/);
  assert.match(source, /<select id="experiment-known-core"/);
  assert.match(source, /<select id="experiment-known-subtype"/);
  assert.match(source, /<select id="experiment-known-wing"/);
});
