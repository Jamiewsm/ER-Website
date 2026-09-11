// 실제 등록 안내 핸들러를 실행하되 DB와 메일 전송 경계는 가상 구현으로 격리한다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const october = 'enneagram_basic_2026_10';
const application = {
  id: '10000000-0000-4000-8000-000000000001',
  name: '가상 신청자',
  contact: 'synthetic@example.invalid',
  program_key: 'enneagram_basic_july',
  cohort_key: october,
  created_at: '2026-09-01T00:00:00Z',
  status: 'received',
  country: '한국',
  payment_preference: 'kr_bank',
  payment_region: 'KR',
};

function loadHandler(overrides = {}, options = {}) {
  const row = structuredClone({ ...application, ...overrides });
  const calls = { reservations: [], emails: [], updates: [] };
  const environment = {
    SUPABASE_URL: 'https://database.example.invalid',
    SUPABASE_ANON_KEY: 'synthetic-anon',
    SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service',
    RESEND_API_KEY: 'synthetic-resend',
    BASIC_COURSE_PRE_SURVEY_URL: 'https://survey.example.invalid',
  };
  let handler;
  const context = vm.createContext({
    Request, Response, Headers,
    console: { error() {}, warn() {} },
    Deno: {
      env: { get: (name) => environment[name] },
      serve: (callback) => { handler = callback; },
    },
    createClient(url, key, config) {
      assert.equal(url, environment.SUPABASE_URL);
      assert.ok([environment.SUPABASE_ANON_KEY, environment.SUPABASE_SERVICE_ROLE_KEY].includes(key));
      return {
        auth: {
          getUser: async () => ({ data: { user: { id: 'synthetic-head' } }, error: null }),
        },
        from(table) {
          assert.ok(['coach_profiles', 'program_applications'].includes(table));
          let update;
          return {
            select() { return this; },
            update(value) { update = JSON.parse(JSON.stringify(value)); return this; },
            eq(field, value) {
              assert.equal(field, table === 'coach_profiles' ? 'user_id' : 'id');
              assert.equal(value, table === 'coach_profiles' ? 'synthetic-head' : row.id);
              if (update) {
                calls.updates.push(update);
                Object.assign(row, update);
                return Promise.resolve({ error: null });
              }
              return this;
            },
            maybeSingle: async () => ({
              data: table === 'coach_profiles'
                ? { role: options.role || 'head_coach', is_active: true }
                : structuredClone(row),
              error: null,
            }),
          };
        },
        async rpc(name, payload) {
          assert.equal(name, 'admin_prepare_program_application_registration');
          assert.equal(key, environment.SUPABASE_ANON_KEY);
          assert.equal(config.global.headers.Authorization, 'Bearer synthetic-jwt');
          const args = JSON.parse(JSON.stringify(payload));
          calls.reservations.push(args);
          if (options.prepareError) return { data: null, error: { message: 'synthetic preparation failure' } };
          row.cohort_key = args.p_cohort_key;
          row.status = options.waitlisted ? 'waitlisted' : 'payment_pending';
          return { data: structuredClone(row), error: null };
        },
      };
    },
    async fetch(url, init) {
      // 의도하지 않은 네트워크 요청도 여기서 실패하며 실제 네트워크는 사용하지 않는다.
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(init.method, 'POST');
      calls.emails.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ id: 'synthetic-email-id' }), { status: 200 });
    },
  });

  for (const path of [
    '_shared/cors.ts',
    '_shared/program-pricing.ts',
    '_shared/email-templates.ts',
    '_shared/head-coach.ts',
    '_shared/resend.ts',
    'notify-program-application/index.ts',
  ]) {
    const source = readFileSync(new URL(`../supabase/functions/${path}`, import.meta.url), 'utf8');
    // TypeScript는 Node의 실제 변환기로 제거하고 import 경계만 위 가상 의존성으로 연결한다.
    const script = stripTypeScriptTypes(source)
      .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^export\s+/gm, '');
    vm.runInContext(script, context, { filename: path });
  }
  assert.equal(typeof handler, 'function');
  return {
    row, calls,
    invoke(event = 'registration', payload = {}) {
      return handler(new Request('https://function.example.invalid', {
        method: 'POST',
        headers: { Authorization: 'Bearer synthetic-jwt', 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: row.id, event, ...payload }),
      }));
    },
  };
}

for (const [label, overrides] of [
  ['과거 7월의 기수 없는 신청', { cohort_key: null, created_at: '2026-07-01T00:00:00Z' }],
  ['8월 27일 이후의 기수 없는 후보', { cohort_key: null }],
  ['빈 기수', { cohort_key: '' }],
  ['공백 기수', { cohort_key: ' ' }],
  ['명시적인 7월 기수', { cohort_key: 'enneagram_basic_2026_07' }],
  ['레거시 기수 키', { cohort_key: 'enneagram_basic_july' }],
  ['미지원 미래 기수', { cohort_key: 'enneagram_basic_2027_01' }],
]) {
  test(`${label}: 기록을 바꾸거나 10월 안내를 보내지 않는다`, async () => {
    const harness = loadHandler(overrides);
    const before = structuredClone(harness.row);
    const response = await harness.invoke('registration', { cohort_key: october });
    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.error, 'cohort_confirmation_required');
    assert.match(body.message, /신청 기수를 확인/);
    assert.deepEqual(harness.row, before);
    assert.deepEqual(harness.calls, { reservations: [], emails: [], updates: [] });
  });
}

for (const [region, overrides, currency, amount] of [
  ['KR', {}, 'KRW', '450,000'],
  ['OVERSEAS', { country: '미국', payment_region: 'OVERSEAS', payment_preference: 'zelle' }, 'USD', '330'],
]) {
  test(`명시적인 10월 신청: ${currency} 예약 후 올바른 등록 메일을 보낸다`, async () => {
    const harness = loadHandler(overrides);
    const response = await harness.invoke();
    assert.equal(response.status, 200);
    assert.deepEqual(harness.calls.reservations, [{
      p_id: application.id,
      p_cohort_key: october,
      p_max_seats: 14,
      p_payment_region: region,
      p_payment_currency: currency,
      p_payment_amount_usd: region === 'OVERSEAS' ? 330 : null,
      p_payment_amount_krw: region === 'KR' ? 450000 : null,
    }]);
    assert.equal(harness.calls.emails.length, 1);
    const email = harness.calls.emails[0];
    assert.equal(email.subject, '[ER] 10월 기본과정 등록·결제 안내');
    assert.deepEqual(email.to, ['synthetic@example.invalid']);
    assert.match(email.html, /2026년 10월 기수/);
    assert.ok(email.html.includes(amount));
    assert.match(email.html, /ER Basic October/);
    assert.equal(harness.row.cohort_key, october);
    assert.equal(harness.calls.updates.length, 1);
    assert.ok(harness.calls.updates[0].registration_email_sent_at);
  });
}

for (const [label, options, status, error] of [
  ['예약 실패', { prepareError: true }, 500, 'registration_prepare_failed'],
  ['정원 초과', { waitlisted: true }, 409, 'seats_full'],
]) {
  test(`10월 ${label}: 등록 메일을 보내지 않는다`, async () => {
    const harness = loadHandler({}, options);
    const response = await harness.invoke();
    assert.equal(response.status, status);
    assert.equal((await response.json()).error, error);
    assert.equal(harness.calls.reservations.length, 1);
    assert.deepEqual(harness.calls.emails, []);
    assert.deepEqual(harness.calls.updates, []);
  });
}

test('다른 프로그램의 등록 안내는 기존대로 거절한다', async () => {
  const harness = loadHandler({ program_key: 'parenting_workshop' });
  const response = await harness.invoke();
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'unsupported_program');
  assert.deepEqual(harness.calls, { reservations: [], emails: [], updates: [] });
});

test('헤드 코치가 아니면 명시적 10월 신청도 예약하거나 발송할 수 없다', async () => {
  const harness = loadHandler({}, { role: 'coach' });
  const response = await harness.invoke();
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, 'forbidden');
  assert.deepEqual(harness.calls, { reservations: [], emails: [], updates: [] });
});

for (const [event, timestamp] of [
  ['pre_survey', 'pre_survey_sent_at'],
  ['graduation', 'graduation_email_sent_at'],
]) {
  test(`과거 기수의 ${event} 안내는 기수·등록 정보를 바꾸지 않고 계속 동작한다`, async () => {
    const harness = loadHandler({ cohort_key: null, created_at: '2026-07-01T00:00:00Z', status: 'confirmed' });
    const response = await harness.invoke(event);
    assert.equal(response.status, 200);
    assert.deepEqual(harness.calls.reservations, []);
    assert.equal(harness.calls.emails.length, 1);
    assert.doesNotMatch(harness.calls.emails[0].subject, /10월|결제/);
    assert.equal(harness.row.cohort_key, null);
    assert.equal(harness.row.status, 'confirmed');
    assert.equal(harness.calls.updates.length, 1);
    assert.ok(harness.calls.updates[0][timestamp]);
  });
}
