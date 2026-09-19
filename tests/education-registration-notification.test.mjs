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

// 조건부 UPDATE를 공유 객체에 원자적으로 적용해 서버의 영속 발송 선점을 검증한다.
function applicationQuery(row, calls, options) {
  let update; const nullFields = [];
  const execute = () => {
    if (!update) return { data: structuredClone(row), error: null };
    const claim = Boolean(update.confirmation_email_attempted_at);
    if (claim && options.claimError) return { data: null, error: { message: 'synthetic claim failure' } };
    if (nullFields.some((field) => row[field] != null)) return { data: null, error: null };
    if (!claim) calls.updates.push(update);
    if (!claim && options.recordError) return { data: null, error: { message: 'synthetic record failure' } };
    Object.assign(row, update);
    return { data: { id: row.id }, error: null };
  };
  return {
    select() { return this; },
    update(value) { update = JSON.parse(JSON.stringify(value)); return this; },
    eq(field, value) { assert.equal(field, 'id'); assert.equal(value, row.id); return this; },
    is(field, value) { assert.equal(value, null); nullFields.push(field); return this; },
    maybeSingle: async () => execute(),
    then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
  };
}

function loadHandler(overrides = {}, options = {}) {
  const row = options.sharedRow || structuredClone({ ...application, ...overrides });
  const calls = { reservations: [], emails: [], updates: [] };
  const environment = {
    SUPABASE_URL: 'https://database.example.invalid',
    SUPABASE_ANON_KEY: 'synthetic-anon',
    SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service',
    RESEND_API_KEY: 'synthetic-resend',
    ...options.environment,
  };
  let handler;
  const context = vm.createContext({
    Request, Response, Headers, URL,
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
          assert.ok(['coach_profiles', 'program_applications', 'edu_courses', 'edu_cohorts'].includes(table));
          if (table === 'edu_courses' || table === 'edu_cohorts') {
            return {
              select() { return this; }, eq() { return this; },
              maybeSingle: async () => ({ data: table === 'edu_courses' ? options.growthCourse || null : options.growthCohort || null, error: null }),
            };
          }
          if (table === 'coach_profiles') return {
            select() { return this; }, eq() { return this; },
            maybeSingle: async () => ({ data: { role: options.role || 'head_coach', is_active: true }, error: null }),
          };
          return applicationQuery(row, calls, options);
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
      const key = init.headers['Idempotency-Key'];
      options.emailRequests?.push({ key, body: JSON.parse(init.body) });
      if (key && options.mailStore?.has(key)) {
        assert.equal(options.mailStore.get(key), init.body, 'a retry uses exactly the same mail payload');
        return new Response(JSON.stringify({ id: 'synthetic-email-id' }), { status: 200 });
      }
      if (key) options.mailStore?.set(key, init.body);
      calls.emails.push(JSON.parse(init.body));
      if (options.providerError) throw new Error('synthetic network interruption after send');
      return new Response(JSON.stringify({ id: 'synthetic-email-id' }), { status: 200 });
    },
  });

  for (const path of [
    '_shared/cors.ts',
    '_shared/program-pricing.ts',
    '_shared/email-templates.ts',
    '_shared/basic-course-welcome.ts',
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
    assert.equal(email.subject, '[ER] ER 성경적 에니어그램 기본과정 8주 (2026년 10월) 신청 접수 및 등록 안내');
    assert.deepEqual(email.to, ['synthetic@example.invalid']);
    assert.match(email.html, /2026년 10월/);
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

const ministryMessage = '전화번호: 010-0000-0000\n전임 사역자 및 사모: 해당\n사역 정보: 테스트 교회';
for (const [region, amount, formatted] of [['KR', 225000, '₩225,000'], ['OVERSEAS', 165, '$165']]) {
  test(`사역자 ${region} 등록 준비와 통합 메일은 같은 50% 금액을 사용한다`, async () => {
    const h = loadHandler({ message: ministryMessage, payment_region: region });
    assert.equal((await h.invoke()).status, 200);
    assert.equal(h.calls.reservations[0][region === 'KR' ? 'p_payment_amount_krw' : 'p_payment_amount_usd'], amount);
    const html = h.calls.emails[0].html;
    assert.ok(html.includes(`<strong style="font-size:24px;color:#17634b">${formatted}</strong>`));
    assert.match(html, /사역자 50% 할인 적용/);
    if (region === 'KR') {
      assert.match(html, /원화 계좌이체 ₩225,000/);
      assert.doesNotMatch(html, /원화 계좌이체 ₩450,000/);
    }
  });
}
for (const message of ['', '전임 사역자 및 사모: 해당 없음', '전임 사역자 및 사모: false', '질문: 전임 사역자 및 사모: 해당', '목회자 할인 요청']) {
  test(`정확한 체크 표시가 없는 신청은 정가를 유지한다 (${message || '비어 있음'})`, async () => {
    const h = loadHandler({ message });
    assert.equal((await h.invoke()).status, 200);
    assert.equal(h.calls.reservations[0].p_payment_amount_krw, 450000);
    assert.doesNotMatch(h.calls.emails[0].html, /사역자 50% 할인 적용/);
  });
}
for (const field of ['receipt_email_sent_at', 'registration_email_sent_at']) {
  test(`${field}가 있으면 정원 예약만 하고 안내를 중복 발송하지 않는다`, async () => {
    const h = loadHandler({ [field]: '2026-09-14T00:00:00Z', message: ministryMessage });
    const res = await h.invoke();
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, registration: { prepared: true, status: 'payment_pending' }, email: { skipped: true, reason: 'already_sent' } });
    assert.equal(h.calls.reservations.length, 1);
    assert.equal(h.calls.reservations[0].p_payment_amount_krw, 225000);
    assert.equal(h.calls.emails.length, 0);
  });
}
test('등록 준비를 반복하거나 동시에 요청해도 통합 안내는 한 번만 발송한다', async () => {
  const mailStore = new Map(), emailRequests = [];
  const sharedRow = structuredClone(application);
  const a = loadHandler({}, { mailStore, emailRequests, sharedRow });
  const b = loadHandler({}, { mailStore, emailRequests, sharedRow });
  const results = await Promise.all([a.invoke(), b.invoke()]);
  assert.ok(results.every((result) => [200, 409].includes(result.status)));
  assert.equal(a.calls.emails.length + b.calls.emails.length, 1);
  assert.equal(new Set(emailRequests.map((r) => r.key)).size, 1);
  assert.equal(emailRequests[0].key, `application-confirmation/${application.id}`);
  const repeat = await a.invoke();
  assert.equal((await repeat.json()).email.reason, 'already_sent');
  assert.equal(a.calls.emails.length + b.calls.emails.length, 1);
});
test('발송 후 완료 기록 저장에 실패하면 24시간이 지나도 자동 재발송하지 않는다', async () => {
  const h = loadHandler({}, { recordError: true });
  const first = await h.invoke();
  assert.equal(first.status, 500);
  assert.equal((await first.json()).error, 'email_sent_record_failed');
  h.row.confirmation_email_attempted_at = '2020-01-01T00:00:00Z';
  const retry = await h.invoke();
  assert.equal(retry.status, 409);
  assert.equal((await retry.json()).error, 'email_delivery_uncertain');
  assert.equal(h.calls.emails.length, 1);
});
test('발송 선점 기록 저장에 실패하면 메일 API를 호출하지 않는다', async () => {
  const h = loadHandler({}, { claimError: true });
  const response = await h.invoke();
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error, 'email_delivery_claim_failed');
  assert.equal(h.calls.emails.length, 0);
});
for (const [code, discounted] of [['growth_101', false], ['growth_201', true], ['growth_202', true]]) {
  test(`실제로 개설된 ${code}는 원화 3개월 금액과 월 분납액을 안내한다`, async () => {
    const h = loadHandler({ program_key: code, cohort_key: 'growth-test', payment_region: 'OVERSEAS', message: discounted ? ministryMessage : '' }, {
      growthCourse: { id: 'course-id', code, kind: 'growth', title: '심화성장 테스트' },
      growthCohort: { id: 'cohort-id', course_id: 'course-id' },
    });
    assert.equal((await h.invoke()).status, 200);
    assert.equal(h.calls.reservations[0].p_payment_currency, 'KRW');
    assert.equal(h.calls.reservations[0].p_payment_amount_krw, discounted ? 75000 : 150000);
    assert.equal(h.calls.reservations[0].p_payment_amount_usd, null);
    assert.match(h.calls.emails[0].html, discounted ? /월 ₩25,000씩 3회/ : /월 ₩50,000씩 3회/);
    assert.doesNotMatch(h.calls.emails[0].html, /USD|Zelle|10월|첫 주 안심|50% 환불/);
  });
}
test('레지스트리에 없는 성장 과정이나 다른 과정의 기수를 예약하거나 청구하지 않는다', async () => {
  const absent = loadHandler({ program_key: 'growth_999' });
  assert.equal((await absent.invoke()).status, 400);
  assert.equal(absent.calls.reservations.length, 0);
  const mismatch = loadHandler({ program_key: 'growth_101' }, {
    growthCourse: { id: 'course-1', kind: 'growth', title: '심화' }, growthCohort: { course_id: 'course-2' },
  });
  assert.equal((await mismatch.invoke()).status, 409);
  assert.equal(mismatch.calls.reservations.length, 0);
  assert.equal(mismatch.calls.emails.length, 0);
});

function loadIntake(overrides = {}, options = {}) {
  const row = { id: application.id };
  const calls = { inserts: [], updates: [], emails: [], emailRequests: [] };
  const payload = {
    name: application.name, contact: application.contact, phone: '010-0000-0000',
    category: '성경적 에니어그램 기본과정', program_key: application.program_key,
    payment_region: 'KR', payment_preference: 'kr_bank', turnstile_token: 'synthetic-token',
    ...overrides,
  };
  const environment = {
    SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service',
    RESEND_API_KEY: 'synthetic-resend', TURNSTILE_SECRET_KEY: 'synthetic-turnstile',
  };
  let handler;
  const context = vm.createContext({
    Request, Response, Headers, URLSearchParams,
    console: { error() {}, warn() {} },
    Deno: { env: { get: (name) => environment[name] }, serve: (callback) => { handler = callback; } },
    createClient() {
      return {
        from(table) {
          assert.ok(['program_applications', 'edu_courses', 'edu_cohorts'].includes(table));
          if (table === 'edu_courses' || table === 'edu_cohorts') return {
            select() { return this; }, eq() { return this; },
            maybeSingle: async () => ({ data: table === 'edu_courses' ? options.growthCourse || null : options.growthCohort || null, error: null }),
          };
          return {
            ...applicationQuery(row, calls, options),
            insert(value) { calls.inserts.push(JSON.parse(JSON.stringify(value))); Object.assign(row, value); return this; },
            single: async () => ({ data: { id: application.id }, error: null }),
          };
        },
      };
    },
    async fetch(url, init) {
      if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      assert.equal(url, 'https://api.resend.com/emails');
      const body = JSON.parse(init.body);
      calls.emailRequests.push({ key: init.headers['Idempotency-Key'], body });
      calls.emails.push(body);
      if (options.providerError && init.headers['Idempotency-Key']) throw new Error('synthetic network interruption after send');
      return new Response(JSON.stringify({ id: 'synthetic-email-id' }), { status: 200 });
    },
  });
  for (const path of ['_shared/cors.ts', '_shared/program-pricing.ts', '_shared/email-templates.ts', '_shared/resend.ts', '_shared/turnstile.ts', 'submit-application/index.ts']) {
    const source = readFileSync(new URL(`../supabase/functions/${path}`, import.meta.url), 'utf8');
    const script = stripTypeScriptTypes(source)
      .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^export\s+/gm, '');
    vm.runInContext(script, context, { filename: path });
  }
  return {
    calls, row,
    invoke: () => handler(new Request('https://function.example.invalid', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })),
  };
}

for (const [region, discount] of [['KR', false], ['KR', true], ['OVERSEAS', false], ['OVERSEAS', true]]) {
  test(`접수와 복구 안내 본문·금액·중복방지 키가 일치한다 (${region}, 사역자 ${discount})`, async () => {
    const message = discount ? ministryMessage.replaceAll('\n', '\r\n') : '';
    const h = loadIntake({ message, payment_region: region, payment_preference: region === 'KR' ? 'kr_bank' : 'zelle', is_full_time_ministry: discount });
    assert.equal((await h.invoke()).status, 200);
    const amount = region === 'KR' ? (discount ? 225000 : 450000) : (discount ? 165 : 330);
    const field = region === 'KR' ? 'payment_amount_krw' : 'payment_amount_usd';
    assert.equal(h.calls.inserts[0][field], amount);
    assert.equal(h.calls.emails.length, 2, '운영자 알림 한 통과 신청자 안내 한 통');
    const receipt = h.calls.emails[1], admin = h.calls.emails[0];
    const formatted = region === 'KR' ? `₩${amount.toLocaleString('ko-KR')}` : `$${amount}`;
    assert.ok(receipt.html.includes(formatted)); assert.ok(admin.html.includes(formatted));
    assert.equal(receipt.html.includes('사역자 50% 할인 적용'), discount);
    assert.ok(h.calls.updates[0].receipt_email_sent_at);
    const emailRequests = [];
    const fallback = loadHandler(h.calls.inserts[0], { emailRequests });
    assert.equal((await fallback.invoke()).status, 200);
    assert.deepEqual(fallback.calls.emails[0], receipt, '초기 안내와 복구 발송의 전체 Resend payload가 동일하다');
    assert.equal(emailRequests[0].key, h.calls.emailRequests[1].key);
  });
}

test('사역자 심화 접수는 원화 총 75000원·3개월 월 25000원을 저장하고 안내한다', async () => {
  const h = loadIntake({ program_key: 'growth_101', cohort_key: 'growth-2026', message: ministryMessage, payment_region: 'OVERSEAS' }, {
    growthCourse: { id: 'growth-id', code: 'growth_101', title: '심화성장101', kind: 'growth' },
    growthCohort: { id: 'growth-cohort', course_id: 'growth-id' },
  });
  assert.equal((await h.invoke()).status, 200);
  assert.equal(h.calls.inserts[0].cohort_key, 'growth-2026');
  assert.equal(h.calls.inserts[0].payment_currency, 'KRW');
  assert.equal(h.calls.inserts[0].payment_amount_krw, 75000);
  assert.equal(h.calls.inserts[0].payment_amount_usd, null);
  assert.match(h.calls.emails[1].html, /월 ₩25,000씩 3회/);
  assert.doesNotMatch(h.calls.emails[1].html, /USD|10월|Zelle/);
});

for (const [label, options, cohort_key] of [
  ['없는 과정', {}, 'growth-test'],
  ['미지정 기수', { growthCourse: { id: 'growth-id', kind: 'growth', title: '심화' } }, undefined],
  ['존재하지 않는 기수', { growthCourse: { id: 'growth-id', kind: 'growth', title: '심화' } }, 'missing'],
  ['다른 과정 기수', { growthCourse: { id: 'growth-id', kind: 'growth', title: '심화' }, growthCohort: { course_id: 'other-course' } }, 'wrong'],
]) {
  test(`유효하지 않은 심화 접수는 저장하거나 메일을 보내지 않는다 (${label})`, async () => {
    const h = loadIntake({ program_key: 'growth_101', cohort_key, message: ministryMessage }, options);
    assert.equal((await h.invoke()).status, 400);
    assert.equal(h.calls.inserts.length, 0);
    assert.equal(h.calls.emails.length, 0);
  });
}
test('기존 양육 워크숍 신청을 심화 3개월 가격으로 바꾸지 않는다', async () => {
  const h = loadIntake({ program_key: 'parenting_workshop' });
  assert.equal((await h.invoke()).status, 200);
  assert.equal(h.calls.inserts[0].payment_amount_krw, null);
  assert.doesNotMatch(h.calls.emails[1].html, /150,000|75,000|3개월|총 납부 금액/);
});

test('접수 후 메일 기록 저장 실패는 접수 성공과 구분되는 경고로 반환한다', async () => {
  const h = loadIntake({}, { recordError: true });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.warning, 'email_sent_record_failed');
  assert.equal(h.calls.inserts.length, 1);
});

for (const row of [{}, { program_key: 'growth_101' }, { cohort_key: null }, { cohort_key: 'enneagram_basic_2026_07' }]) {
  test(`이전 자기관찰 안내 버튼은 새 등록 확정 흐름으로 안내하고 발송하지 않는다 ${JSON.stringify(row)}`, async () => {
    const h = loadHandler(row);
    const response = await h.invoke('pre_survey');
    assert.equal(response.status, 410);
    assert.equal((await response.json()).error, 'new_onboarding_flow_required');
    assert.equal(h.calls.emails.length, 0);
    assert.equal(h.calls.updates.length, 0);
  });
}

test('접수 메일 성공 후 기록 저장이 실패해도 관리자 재시도가 두 번째 메일을 만들지 않는다', async () => {
  const intake = loadIntake({}, { recordError: true });
  assert.equal((await intake.invoke()).status, 200);
  assert.ok(intake.row.confirmation_email_attempted_at);
  intake.row.confirmation_email_attempted_at = '2020-01-01T00:00:00Z';
  const retry = loadHandler({}, { sharedRow: intake.row });
  const response = await retry.invoke();
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'email_delivery_uncertain');
  assert.equal(retry.calls.emails.length, 0);
});

test('등록 안내의 첫 네트워크 실패도 운영자 확인을 안내하고 후속 재발송을 차단한다', async () => {
  const h = loadHandler({}, { providerError: true });
  const first = await h.invoke();
  assert.equal(first.status, 502);
  const body = await first.json();
  assert.equal(body.error, 'email_delivery_uncertain');
  assert.match(body.message, /운영자가 실제 발송 기록을 확인/);
  assert.ok(h.row.confirmation_email_attempted_at);
  assert.equal((await h.invoke()).status, 409);
  assert.equal(h.calls.emails.length, 1);
});
test('최초 접수 메일의 응답이 불확실해도 접수를 반복하도록 유도하지 않는다', async () => {
  const h = loadIntake({}, { providerError: true });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.warning, 'email_delivery_uncertain');
  assert.match(body.warning_message, /재신청하지 말고 담당자/);
  assert.ok(h.row.confirmation_email_attempted_at);
  const retry = loadHandler({}, { sharedRow: h.row });
  assert.equal((await retry.invoke()).status, 409);
  assert.equal(retry.calls.emails.length, 0);
});

for (const transferRequest of [false, true]) {
  test(`장학 후원 ${transferRequest ? '입금 확인 요청' : '문의'}는 일반 접수로 저장하고 후원 전용 메일을 보낸다`, async () => {
    const source = transferRequest ? 'support:scholarship-transfer' : 'support:scholarship';
    const message = transferRequest ? '처리 구분: 입금 확인 요청 (미확인·후원자 입력)\n송금액: $30 USD' : '가상 후원 문의';
    const h = loadIntake({
      name: '<b>가상 문의자</b>', program_key: undefined, category: transferRequest ? '장학 후원 입금 확인 요청' : '장학 후원 문의',
      source, message, payment_region: undefined, payment_preference: undefined,
    });
    assert.equal((await h.invoke()).status, 200);
    const row = h.calls.inserts[0];
    assert.equal(row.program_key, 'general');
    assert.equal(row.status, 'received');
    assert.equal(row.cohort_key, null);
    assert.equal(row.payment_currency, null);
    assert.equal(row.payment_amount_krw, null);
    assert.equal(row.payment_amount_usd, null);
    assert.equal(row.source, source);
    assert.equal(row.message, message);
    assert.equal(h.calls.emails.length, 2);
    const [admin, receipt] = h.calls.emails;
    assert.match(admin.subject, /장학 후원/);
    assert.ok(admin.html.includes(message));
    assert.match(receipt.html, /&lt;b&gt;가상 문의자&lt;\/b&gt;/);
    assert.match(receipt.html, /입금 확인서나 기부금영수증이 아닙니다/);
    assert.doesNotMatch(receipt.html, /24시간|등록·결제|입금이 확인되었습니다|수강료/);
    assert.equal(receipt.html.includes('실제 입금 내역을 확인한 뒤'), transferRequest);
    assert.ok(h.calls.updates[0].receipt_email_sent_at);
  });
}

test('후원 전용 메일은 정확한 후원 source와 일반 문의 조합에서만 선택된다', async () => {
  const general = loadIntake({ program_key: undefined, category: '일반 문의', source: 'support:other' });
  assert.equal((await general.invoke()).status, 200);
  assert.match(general.calls.emails[1].html, /등록·결제 안내/);
  const course = loadIntake({ source: 'support:scholarship' });
  assert.equal((await course.invoke()).status, 200);
  assert.match(course.calls.emails[1].html, /등록|기본과정/);
  assert.doesNotMatch(course.calls.emails[1].html, /장학 후원 문의를 받았습니다/);
});
