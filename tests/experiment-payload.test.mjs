import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/diagnostic-experiment.js', import.meta.url), 'utf8');

function loadExperimentModule() {
  const windowStub = {
    location: { search: '' },
    addEventListener() {},
    sessionStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  };
  const documentStub = {
    documentElement: { lang: 'ko' },
    readyState: 'complete',
    getElementById() { return null; },
    addEventListener() {}
  };
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
});

test('experiment feedback UI collects structured reviewer notes', () => {
  assert.match(source, /experiment-accurate-parts/);
  assert.match(source, /experiment-inaccurate-parts/);
  assert.match(source, /experiment-consultation-check/);
  assert.match(source, /feedback_detail/);
});
