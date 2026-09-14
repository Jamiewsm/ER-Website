// 기존 신청 관리자에서 등록 준비와 메일 발송 여부를 정확히 표시하는지 검증한다.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../js/coach/applications.js', import.meta.url), 'utf8');
const row = { id: 'application-a', program_key: 'enneagram_basic_july', cohort_key: 'enneagram_basic_2026_10', name: '가상 신청자', contact: 'student@example.test', status: 'received' };
function setup({ response = { email: { id: 'mail-a' }, registration: { prepared: true, status: 'payment_pending' } }, status = 200, rows = [row], confirmations = [true], allowed = true, updateError } = {}) {
  const alerts = [], prompts = [], calls = [];
  const list = { innerHTML: '' };
  const context = {
    window: { SUPABASE_CONFIG: { url: 'https://local.example.test', anonKey: 'test' } },
    state: { user: { id: 'head' }, isCoach: true, programApplications: structuredClone(rows) },
    ensureCoachAccess: () => allowed,
    canManageCoachAdmin: () => allowed,
    escapeHtml: (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    formatDateTime: () => '2026-09-15',
    renderListSkeleton: () => 'loading',
    document: { getElementById: () => list },
    alert(message) { alerts.push(message); },
    confirm(message) { prompts.push(message); return confirmations.shift() ?? false; },
    supabaseClient: {
      auth: { getSession: async () => ({ data: { session: { access_token: 'synthetic-token' } } }) },
      async rpc(name, args) {
        calls.push({ type: 'rpc', name, args });
        if (name === 'admin_update_program_application_status') {
          if (updateError) return { error: { message: updateError } };
          context.state.programApplications.find((app) => app.id === args.p_id).status = args.p_status;
          return { error: null };
        }
        return { data: context.state.programApplications, error: null };
      },
    },
    async fetch(url, init) {
      assert.equal(url, 'https://local.example.test/functions/v1/notify-program-application');
      assert.equal(init.headers.Authorization, 'Bearer synthetic-token');
      calls.push({ type: 'email', body: JSON.parse(init.body) });
      return new Response(JSON.stringify(response), { status });
    },
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { context, alerts, prompts, calls, list };
}

test('이미 안내한 신청은 등록 준비 성공을 표시하고 발송했다고 말하지 않는다', async () => {
  const h = setup({ response: { registration: { prepared: true, status: 'payment_pending' }, email: { skipped: true, reason: 'already_sent' } } });
  await h.context.sendRegistrationPaymentEmail(row.id);
  assert.deepEqual(h.calls.find((call) => call.type === 'email').body, { application_id: row.id, event: 'registration' });
  assert.match(h.alerts[0], /등록 준비가 완료되었습니다/);
  assert.match(h.alerts[0], /이미 발송되어 다시 보내지 않았습니다/);
  assert.doesNotMatch(h.alerts[0], /메일이 발송되었습니다/);
  assert.match(h.prompts[0], /정원을 확인/);
  assert.ok(h.calls.some((call) => call.name === 'admin_list_program_applications_by_cohort'));
});

test('실제 메일 ID가 있을 때만 발송 완료를 표시한다', async () => {
  const sent = setup(); await sent.context.sendRegistrationPaymentEmail(row.id);
  assert.match(sent.alerts[0], /등록 준비가 완료되었습니다.*메일이 발송되었습니다/);
  for (const response of [{ registration: { prepared: true }, email: { skipped: true } }, { registration: { prepared: true }, email: {} }]) {
    const h = setup({ response }); await h.context.sendRegistrationPaymentEmail(row.id);
    assert.match(h.alerts[0], /등록 준비가 완료되었습니다/);
    assert.doesNotMatch(h.alerts[0], /메일이 발송되었습니다/);
  }
});

test('불확실 발송 오류는 서버의 확인 안내를 그대로 보여준다', async () => {
  const h = setup({ status: 409, response: { error: 'email_delivery_uncertain', message: '이전 발송 결과를 먼저 확인해 주세요. 자동 재발송은 차단되었습니다.' } });
  await h.context.sendRegistrationPaymentEmail(row.id);
  assert.match(h.alerts[0], /이전 발송 결과를 먼저 확인/);
  assert.doesNotMatch(h.alerts[0], /메일이 발송되었습니다/);
});

test('기수 정원 초과 안내에 낡은 고정 정원 숫자를 사용하지 않는다', async () => {
  const h = setup({ status: 409, response: { error: 'seats_full' } });
  await h.context.sendRegistrationPaymentEmail(row.id);
  assert.match(h.alerts[0], /이 기수의 정원이 가득/);
  assert.doesNotMatch(h.alerts[0], /8명|14명/);
});

test('등록 확정 시 후속 발송을 선택하면 먼저 상태를 저장한 뒤 기존 이벤트를 보낸다', async () => {
  const h = setup();
  await h.context.updateProgramApplicationStatus(row.id, 'confirmed');
  assert.equal(h.calls[0].name, 'admin_update_program_application_status');
  assert.equal(h.calls[0].args.p_status, 'confirmed');
  assert.equal(h.calls[1].type, 'email');
  assert.equal(h.calls[1].body.event, 'pre_survey');
  assert.match(h.prompts[0], /강의계획안·자기관찰보고서/);
  assert.equal(h.context.state.programApplications[0].status, 'confirmed');
});

test('후속 발송을 선택하지 않으면 등록 확정만 저장한다', async () => {
  const h = setup({ confirmations: [false] });
  await h.context.updateProgramApplicationStatus(row.id, 'confirmed');
  assert.equal(h.context.state.programApplications[0].status, 'confirmed');
  assert.equal(h.calls.some((call) => call.type === 'email'), false);
});

test('상태 저장 실패는 후속 메일을 보내지 않는다', async () => {
  const h = setup({ updateError: '예약 정원을 확인해 주세요.' });
  await h.context.updateProgramApplicationStatus(row.id, 'confirmed');
  assert.equal(h.calls.some((call) => call.type === 'email'), false);
  assert.equal(h.context.state.programApplications[0].status, 'received');
});

test('과거 기수에는 10월 강의계획안 동작을 제공하지 않고 등록 확정만 유지한다', async () => {
  const h = setup({ rows: [{ ...row, cohort_key: null }] });
  await h.context.loadProgramApplications();
  assert.doesNotMatch(h.list.innerHTML, /강의계획안·자기관찰보고서|sendRegistrationPaymentEmail/);
  await h.context.updateProgramApplicationStatus(row.id, 'confirmed');
  assert.equal(h.prompts.length, 0);
  assert.equal(h.calls.some((call) => call.type === 'email'), false);
  assert.equal(h.context.state.programApplications[0].status, 'confirmed');
});

test('결제 대기 상태만으로 메일 발송 완료를 단정하지 않는다', async () => {
  const h = setup({ rows: [{ ...row, status: 'payment_pending' }] });
  await h.context.loadProgramApplications();
  assert.match(h.list.innerHTML, /등록 준비 완료 · 결제 확인 대기/);
  assert.match(h.list.innerHTML, /강의계획안·자기관찰보고서/);
  assert.doesNotMatch(h.list.innerHTML, /결제 안내 메일 발송됨|사전 성찰 메일/);
});

test('권한 없는 사용자는 등록 준비나 상태 변경을 요청하지 않는다', async () => {
  const h = setup({ allowed: false });
  await h.context.sendRegistrationPaymentEmail(row.id);
  await h.context.updateProgramApplicationStatus(row.id, 'confirmed');
  assert.equal(h.calls.length, 0);
  assert.equal(h.prompts.length, 0);
});
