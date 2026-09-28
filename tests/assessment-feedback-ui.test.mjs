// 결과 평가의 명시 동의, 익명 전송, 보안 확인과 재시도 상태를 검증한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/diagnostic-experiment.js', import.meta.url), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));

function result(revision = 0) {
  return {
    assessmentVersion: 'word-narrative-v2', core: 4, coreResolved: true,
    phase4: { subtypeCode: 'so_4', wingNum: 5 }, responses: { private: 'raw answers' },
    narrativeReflection: 'legacy private text',
    assessmentMetadata: {
      attemptId: 'f364011f-1da3-4f78-9cd0-5799bd015556', revision, variant: 'word',
      versions: { assessment: 'word-narrative-v2', instructions: '2026-09-28', questions: 'q-v1', scoring: 's-v1', report: 'r-v1' },
      initialCandidates: [1, 2, 3], reviewedCandidates: [4, 5, 6],
      questionOrder: ['narrative1'], optionOrder: { narrative1: [4, 5, 6] }, initialResult: null, reviewHistory: []
    }
  };
}

function loadUi({ experiment = false, gateRequired = false, insert, invoke, providerReady = true, sitekey = 'public-sitekey', storage = new Map() } = {}) {
  const nodes = new Map();
  class Element {
    constructor(id, attributes = '') {
      this.id = id;
      this.value = /\bvalue="([^"]*)"/.exec(attributes)?.[1] || '';
      this.name = /\bname="([^"]*)"/.exec(attributes)?.[1] || '';
      this.checked = /\bchecked\b/.test(attributes);
      this.disabled = /\bdisabled\b/.test(attributes);
      this.dataset = {};
      this.textContent = '';
      this.innerText = '';
      this.listeners = {};
      this.classes = new Set();
      this.classList = { add: (name) => this.classes.add(name), remove: (name) => this.classes.delete(name), contains: (name) => this.classes.has(name) };
    }
    set innerHTML(html) {
      this.html = html;
      for (const match of html.matchAll(/<[a-z][\w-]*\b([^>]*\bid="([^"]+)"[^>]*)>/g)) nodes.set(match[2], new Element(match[2], match[1]));
    }
    get innerHTML() { return this.html || ''; }
    addEventListener(event, listener) { (this.listeners[event] ||= []).push(listener); }
    async emit(event) { for (const listener of this.listeners[event] || []) await listener({ target: this }); }
  }
  const host = new Element('experiment-result-panel');
  nodes.set(host.id, host);
  if (gateRequired) {
    for (const id of ['experiment-gate', 'experiment-gate-start', 'experiment-participant-name', 'experiment-consent', 'experiment-gate-error', 'result-view']) nodes.set(id, new Element(id));
    nodes.get('experiment-participant-name').value = 'Restored Participant';
    nodes.get('experiment-consent').checked = true;
  }
  const invocations = [];
  const inserts = [];
  const widgets = [];
  const removed = [];
  const provider = {
    render(element, options) { assert.equal(element.id, 'feedback-turnstile-widget'); widgets.push(options); return `widget-${widgets.length}`; },
    remove(id) { removed.push(id); }
  };
  const meta = { participantName: 'Test Participant', consentAccepted: true };
  const window = {
    location: { search: experiment ? '?experiment=1' : '' }, addEventListener() {},
    sessionStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    __ER_DIAGNOSTIC_EXPERIMENT__: gateRequired ? undefined : meta, TURNSTILE_SITE_KEY: sitekey,
    turnstile: providerReady ? provider : null,
    supabaseClient: {
      functions: { async invoke(name, options) { invocations.push({ name, body: plain(options.body) }); return invoke ? await invoke(name, options) : { data: { saved: true }, error: null }; } },
      from(table) { assert.equal(table, 'diagnostic_experiment_sessions'); return { async insert(row) { inserts.push(plain(row)); return insert ? await insert(row) : { error: null }; } }; }
    }
  };
  const document = { documentElement: { lang: 'ko' }, readyState: 'complete', getElementById: (id) => nodes.get(id) || null, addEventListener() {} };
  vm.runInContext(source, vm.createContext({ window, document, navigator: { userAgent: 'test-agent' }, URLSearchParams, console, setTimeout() {} }));
  return {
    api: window.ERDiagnosticExperiment, window, nodes, host, meta, provider, widgets, removed, invocations, inserts, storage,
    async check(id, checked = true) {
      const element = nodes.get(id);
      assert.ok(element, `missing control ${id}`);
      if (element.name && checked) for (const other of nodes.values()) if (other.name === element.name) other.checked = false;
      element.checked = checked;
      await element.emit('change');
    },
    async choose(id, value) { const element = nodes.get(id); element.value = value; await element.emit('change'); },
    async submit() { await nodes.get('experiment-submit-btn').emit('click'); },
    token(value = 'verified-token') { widgets.at(-1).callback(value); },
    status() { return nodes.get('experiment-submit-status').textContent; }
  };
}

async function fill(ui, rating = 4) {
  await ui.check(`feedback-rating-${rating}`);
  await ui.check('feedback-consent');
}

test('public card starts unselected and sends only after explicit rating, consent, and security verification', async () => {
  const ui = loadUi();
  const payload = result();
  ui.api.onResultReady(payload);
  assert.equal(ui.invocations.length, 0);
  assert.equal(ui.inserts.length, 0);
  assert.equal([...ui.nodes.values()].filter((element) => element.checked).length, 0);
  assert.match(ui.host.innerHTML, /선택사항|이름·연락처·원래 검사 답변은 보내지 않습니다/);
  assert.doesNotMatch(ui.host.innerHTML, /<textarea|<select|상담에서/);
  assert.equal(ui.widgets[0].action, 'assessment-feedback');
  assert.equal(ui.widgets[0].size, 'compact', 'the widget must fit a 320px viewport inside the result card');
  await ui.submit();
  assert.match(ui.status(), /판단하기 어려움/);
  await ui.check('feedback-rating-4');
  await ui.submit();
  assert.match(ui.status(), /동의/);
  await ui.check('feedback-consent');
  await ui.submit();
  assert.match(ui.status(), /보안 확인/);
  assert.equal(ui.invocations.length, 0);
  payload.core = 8;
  payload.assessmentMetadata.revision = 9;
  payload.assessmentMetadata.reviewedCandidates[0] = 8;
  ui.token();
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
  assert.equal(ui.invocations[0].name, 'submit-assessment-feedback');
  assert.equal(ui.invocations[0].body.revision, 0, 'a later mutation cannot change the result being rated');
  assert.equal(ui.invocations[0].body.result.core, 4);
  assert.deepEqual(ui.invocations[0].body.result.candidate_types, [4, 5, 6]);
  assert.doesNotMatch(JSON.stringify(ui.invocations), /raw answers|private|Participant|narrativeReflection|questionOrder/);
  assert.equal(ui.inserts.length, 0, 'public feedback never uses the named experiment table');
  assert.match(ui.status(), /제출되었습니다/);
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
  assert.equal(ui.nodes.get('feedback-fields').disabled, true);
  for (const id of ['feedback-intro', 'feedback-fields', 'experiment-submit-btn', 'feedback-security']) assert.equal(ui.nodes.get(id).hidden, true, `${id} is hidden after successful submission`);
  ui.api.onResultReady(result());
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, true);
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
});

test('selections survive rerender, opposite parts and no-difficulty are mutually exclusive', async () => {
  const ui = loadUi();
  ui.api.onResultReady(result());
  await fill(ui, 'deferred');
  await ui.check('feedback-matching_parts-core');
  await ui.check('feedback-mismatching_parts-core');
  assert.equal(ui.nodes.get('feedback-matching_parts-core').checked, false);
  await ui.check('feedback-difficulties-words');
  await ui.check('feedback-difficulties-length');
  await ui.check('feedback-difficulties-none');
  assert.equal(ui.nodes.get('feedback-difficulties-words').checked, false);
  assert.equal(ui.nodes.get('feedback-difficulties-length').checked, false);
  await ui.check('feedback-difficulties-context');
  assert.equal(ui.nodes.get('feedback-difficulties-none').checked, false);
  ui.token();
  ui.api.onResultReady(result());
  assert.equal(ui.nodes.get('feedback-rating-deferred').checked, true);
  assert.equal(ui.nodes.get('feedback-consent').checked, true);
  assert.equal(ui.nodes.get('feedback-mismatching_parts-core').checked, true);
  assert.equal(ui.nodes.get('feedback-difficulties-context').checked, true);
  await ui.submit();
  assert.equal(ui.invocations.length, 0, 'a remounted widget requires its own token');
  ui.token();
  await ui.submit();
  assert.equal(ui.invocations[0].body.rating, null);
  assert.equal(ui.invocations[0].body.deferred, true);
  assert.deepEqual(ui.invocations[0].body.matching_parts, []);
  assert.deepEqual(ui.invocations[0].body.mismatching_parts, ['core']);
  assert.deepEqual(ui.invocations[0].body.difficulties, ['context']);
  ui.api.onResultReady(result(1));
  assert.equal(ui.nodes.get('feedback-rating-deferred').checked, false);
  assert.equal(ui.nodes.get('feedback-consent').checked, false);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, false);
});

test('late Turnstile readiness, expiration, errors, and retry never permit an absent or stale token', async () => {
  const ui = loadUi({ providerReady: false });
  ui.api.onResultReady(result());
  await fill(ui);
  await ui.submit();
  assert.equal(ui.invocations.length, 0);
  ui.window.turnstile = ui.provider;
  ui.window.onERAssessmentFeedbackTurnstileReady();
  ui.window.onERAssessmentFeedbackTurnstileReady();
  assert.equal(ui.widgets.length, 1, 'ready callback must not create duplicate widgets');
  ui.token();
  ui.widgets[0]['expired-callback']();
  await ui.submit();
  assert.equal(ui.invocations.length, 0);
  await ui.nodes.get('feedback-security-retry').emit('click');
  ui.widgets[0].callback('stale-token');
  await ui.submit();
  assert.equal(ui.invocations.length, 0, 'a removed widget cannot restore a valid token');
  ui.token();
  ui.widgets[1]['error-callback']();
  await ui.submit();
  assert.equal(ui.invocations.length, 0);
  await ui.nodes.get('feedback-security-retry').emit('click');
  ui.token('current-token');
  await ui.submit();
  assert.equal(ui.invocations[0].body.turnstile_token, 'current-token');
});

test('missing site key and provider render failure remain recoverable without data submission', async () => {
  const ui = loadUi({ sitekey: '' });
  ui.api.onResultReady(result());
  await fill(ui);
  assert.equal(ui.widgets.length, 0);
  await ui.submit();
  assert.equal(ui.invocations.length, 0);
  ui.window.TURNSTILE_SITE_KEY = 'new-public-key';
  ui.window.turnstile = { render() { throw new Error('provider unavailable'); }, remove() {} };
  await ui.nodes.get('feedback-security-retry').emit('click');
  assert.match(ui.nodes.get('feedback-security-status').textContent, /표시하지 못했습니다/);
  ui.window.turnstile = ui.provider;
  await ui.nodes.get('feedback-security-retry').emit('click');
  ui.token();
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
});

test('network rejection preserves selections, resets the token, and requires an explicit retry', async () => {
  let attempts = 0;
  const ui = loadUi({ invoke: async () => { if (++attempts === 1) throw new Error('network offline'); return { data: { saved: true, duplicate: true } }; } });
  ui.api.onResultReady(result());
  await fill(ui, 2);
  ui.token('first-token');
  await ui.submit();
  assert.match(ui.status(), /제출하지 못했습니다/);
  assert.doesNotMatch(ui.status(), /감사/);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, false);
  assert.equal(ui.nodes.get('feedback-fields').disabled, false);
  assert.equal(ui.nodes.get('feedback-rating-2').checked, true);
  assert.equal(ui.widgets.length, 2);
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
  ui.token('retry-token');
  assert.equal(ui.invocations.length, 1, 'verification alone does not submit');
  await ui.submit();
  assert.equal(ui.invocations.length, 2);
  assert.match(ui.status(), /감사/);
});

test('non-success API responses never show thanks and revision conflict cannot overwrite existing feedback', async () => {
  for (const response of [{ data: { saved: false } }, { data: { error: 'storage_unavailable' }, error: {} }]) {
    const ui = loadUi({ invoke: async () => response });
    ui.api.onResultReady(result());
    await fill(ui);
    ui.token();
    await ui.submit();
    assert.match(ui.status(), /제출하지 못했습니다/);
    assert.doesNotMatch(ui.status(), /감사/);
    assert.equal(ui.nodes.get('experiment-submit-btn').disabled, false);
  }
  const ui = loadUi({ invoke: async () => ({ error: { context: { clone: () => ({ json: async () => ({ error: 'revision_conflict' }) }) } } }) });
  ui.api.onResultReady(result());
  await fill(ui);
  ui.token();
  await ui.submit();
  assert.match(ui.status(), /이미 저장되어 변경할 수 없습니다/);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, true);
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
});

test('pending requests cannot double-submit or update a later reviewed result', async () => {
  let resolve;
  const ui = loadUi({ invoke: () => new Promise((done) => { resolve = done; }) });
  ui.api.onResultReady(result());
  await fill(ui);
  ui.token();
  const pending = ui.submit();
  await ui.submit();
  assert.equal(ui.invocations.length, 1);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, true);
  ui.api.onAssessmentReview();
  assert.equal(ui.host.classList.contains('hidden'), true);
  ui.api.onResultReady(result(1));
  await fill(ui, 1);
  resolve({ data: { saved: true } });
  await pending;
  assert.equal(ui.status(), '', 'completion of revision 0 must not mark revision 1 submitted');
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, false);
  assert.equal(ui.nodes.get('feedback-rating-1').checked, true);
  assert.equal(ui.invocations[0].body.revision, 0);
  ui.api.onResultReady(result());
  assert.match(ui.status(), /제출되었습니다/);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, true);
});

test('successful submission marker survives reload for the same attempt and revision only', async () => {
  const storage = new Map();
  const first = loadUi({ storage });
  first.api.onResultReady(result());
  await fill(first);
  first.token();
  await first.submit();
  const restored = loadUi({ storage });
  restored.api.onResultReady(result());
  await restored.submit();
  assert.equal(restored.invocations.length, 0);
  assert.equal(restored.widgets.length, 0);
  assert.equal(restored.nodes.get('experiment-submit-btn').disabled, true);
  for (const id of ['feedback-intro', 'feedback-fields', 'experiment-submit-btn', 'feedback-security']) assert.equal(restored.nodes.get(id).hidden, true, `${id} stays hidden when only the sent marker is restored`);
  assert.match(restored.status(), /제출되었습니다. 감사합니다/);
  assert.deepEqual([...storage.values()], ['1'], 'only the sent marker is stored, never the selected feedback');
  restored.api.onResultReady(result(1));
  assert.equal(restored.nodes.get('experiment-submit-btn').disabled, false);
  for (const id of ['feedback-intro', 'feedback-fields', 'experiment-submit-btn', 'feedback-security']) assert.equal(restored.nodes.get(id).hidden, false, `${id} is available for a new result revision`);
});

test('experiment submission retains its separate named consent and optional participant-recalled types', async () => {
  const ui = loadUi({ experiment: true });
  ui.api.onResultReady(result());
  assert.equal(ui.widgets.length, 0);
  assert.match(ui.host.innerHTML, /이전에 상담에서 안내받은 유형\(본인 기억\)/);
  assert.doesNotMatch(ui.host.innerHTML, /상담에서 확인한|confirmed|<textarea/);
  assert.equal(ui.inserts.length, 0);
  await fill(ui, 5);
  await ui.choose('experiment-known-core', '4');
  await ui.choose('experiment-known-subtype', 'so');
  await ui.choose('experiment-known-wing', '4w5');
  ui.meta.consentAccepted = false;
  await ui.submit();
  assert.equal(ui.inserts.length, 0);
  assert.match(ui.status(), /동의 정보가 없습니다/);
  ui.meta.consentAccepted = true;
  await ui.submit();
  assert.equal(ui.inserts.length, 1);
  assert.equal(ui.invocations.length, 0);
  for (const id of ['feedback-intro', 'feedback-fields', 'experiment-submit-btn']) assert.equal(ui.nodes.get(id).hidden, true, `${id} is hidden after experiment submission`);
  assert.equal(ui.inserts[0].self_assessment, 'correct');
  assert.equal(ui.inserts[0].result_summary.feedback_detail.rating, 5);
  assert.equal(ui.inserts[0].result_summary.feedback_detail.comparison_source, 'participant_report');
  assert.deepEqual(ui.inserts[0].result_summary.feedback_detail.reported_type, { core: '4', subtype: 'so_4', wing: '4w5' });
  assert.doesNotMatch(JSON.stringify(ui.inserts[0]), /legacy private text|confirmed_type|narrativeReflection/);
  await ui.submit();
  assert.equal(ui.inserts.length, 1);
});

test('experiment rejected insert releases the pending guard and permits a manual retry', async () => {
  let attempts = 0;
  const ui = loadUi({ experiment: true, insert: async () => { if (++attempts === 1) throw new Error('offline'); return { error: null }; } });
  ui.api.onResultReady(result());
  await fill(ui, 'deferred');
  await ui.submit();
  assert.match(ui.status(), /제출하지 못했습니다/);
  assert.equal(ui.nodes.get('experiment-submit-btn').disabled, false);
  await ui.submit();
  assert.equal(ui.inserts.length, 2);
  assert.equal(ui.inserts[1].self_assessment, 'ambiguous');
  assert.equal(ui.inserts[1].result_summary.feedback_detail.deferred, true);
});

test('restored experiment results mount feedback after fresh gate consent without automatically submitting', async () => {
  const ui = loadUi({ experiment: true, gateRequired: true });
  const payload = result();
  ui.api.onResultReady(payload);
  assert.equal(ui.host.innerHTML, '', 'a restored result waits for name and consent');
  assert.equal(ui.nodes.get('result-view').classList.contains('hidden'), true);
  payload.core = 8;
  payload.assessmentMetadata.revision = 9;
  ui.window.resumeAssessmentAfterGate = () => ui.nodes.get('result-view').classList.remove('hidden');
  await ui.nodes.get('experiment-gate-start').emit('click');
  assert.match(ui.host.innerHTML, /이 결과는 나와 얼마나 비슷한가요/);
  assert.equal(ui.nodes.get('result-view').classList.contains('hidden'), false);
  assert.equal(ui.inserts.length, 0, 'accepting the gate never submits feedback');
  await fill(ui, 3);
  await ui.submit();
  assert.equal(ui.inserts.length, 1);
  assert.equal(ui.inserts[0].participant_name, 'Restored Participant');
  assert.equal(ui.inserts[0].result_summary.core, 4, 'pending result is captured before later mutation');
  assert.equal(ui.inserts[0].result_summary.experiment_payload.assessmentMetadata.revision, 0);
});
