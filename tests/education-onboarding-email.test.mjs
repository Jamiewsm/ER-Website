// 실제 안내 메일 핸들러를 가상 DB·메일 경계에서 실행해 수동 발송과 중복 차단을 검증한다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { webcrypto } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import test from 'node:test';

const applicationId = '10000000-0000-4000-8000-000000000001';
const actorId = '20000000-0000-4000-8000-000000000001';
const deliveryId = '30000000-0000-4000-8000-000000000001';
const payload = {
  ok: true, delivery_id: deliveryId, application_id: applicationId,
  recipient: 'student@example.invalid', name: '가상 학생', course_title: 'ER 기본과정',
  cohort_title: '2026년 10월', class_title: '화요일반', starts_at: '2026-10-06T10:00:00Z',
  due_at: '2026-10-05T14:59:00Z',
};

function harness(options = {}) {
  const environment = {
    SUPABASE_URL: 'https://database.example.invalid', SUPABASE_ANON_KEY: 'synthetic-anon',
    SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', RESEND_API_KEY: 'synthetic-resend',
    EDUCATION_REMINDER_SECRET: 'synthetic-purpose-limited-secret', ...options.environment,
  };
  const state = options.state || { deliveries: new Map() };
  const calls = { rpc: [], emails: [], delays: [] };
  let handler;
  const context = vm.createContext({
    Request, Response, Headers, URL, TextEncoder, crypto: webcrypto,
    setTimeout(callback, milliseconds) { calls.delays.push(milliseconds); callback(); },
    console: { warn() {}, error() {} },
    Deno: { env: { get: (key) => environment[key] }, serve: (value) => { handler = value; } },
    createClient(url, key) {
      assert.equal(url, environment.SUPABASE_URL);
      return {
        auth: { getUser: async () => ({ data: { user: options.noUser ? null : { id: actorId } }, error: null }) },
        from(table) {
          assert.equal(table, 'coach_profiles');
          return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { role: options.role || 'head_coach', is_active: !options.inactive }, error: null }) };
        },
        async rpc(name, args) {
          assert.equal(key, environment.SUPABASE_SERVICE_ROLE_KEY);
          calls.rpc.push({ name, args: JSON.parse(JSON.stringify(args)) });
          if (name === 'edu_onboarding_reminder_candidates') {
            assert.deepEqual(JSON.parse(JSON.stringify(args)), { p_limit: 50 });
            return { data: options.candidates || [{ application_id: applicationId, kind: 'reminder_3d' }], error: options.candidateError || null };
          }
          if (name === 'edu_claim_onboarding_email') {
            assert.equal(args.p_application_id, applicationId);
            assert.equal(args.p_actor, options.reminders ? null : actorId);
            const previous = state.deliveries.get(args.p_kind);
            if (previous) return { data: { ok: false, reason: previous === 'sent' ? 'already_sent' : 'delivery_uncertain', delivery_id: deliveryId }, error: null };
            if (options.claimError) return { data: null, error: { message: 'claim failure' } };
            if (options.notReady) return { data: { ok: false, reason: options.notReady }, error: null };
            state.deliveries.set(args.p_kind, 'claimed');
            state.kind = args.p_kind;
            return { data: { ...payload, ...options.payload }, error: null };
          }
          if (name === 'edu_check_onboarding_email') {
            assert.equal(args.p_delivery_id, deliveryId);
            return { data: options.changed ? { ok: false, reason: options.changed } : { ...payload, ...options.payload }, error: options.checkError || null };
          }
          if (name === 'edu_finish_onboarding_email') {
            assert.equal(args.p_delivery_id, deliveryId);
            if (options.recordError) return { data: null, error: { message: 'record failure' } };
            state.deliveries.set(state.kind, args.p_provider_id ? 'sent' : 'uncertain');
            return { data: { ok: true }, error: null };
          }
          assert.fail(`Unexpected RPC ${name}`);
        },
      };
    },
    async fetch(url, init) {
      assert.equal(url, 'https://api.resend.com/emails', 'all network requests stay mocked');
      calls.emails.push({ headers: init.headers, body: JSON.parse(init.body) });
      if (options.providerError) throw new Error('synthetic timeout after provider acceptance');
      return new Response(JSON.stringify(options.missingId ? {} : { id: 'synthetic-provider-id' }), { status: 200 });
    },
  });
  for (const path of [
    '_shared/cors.ts', '_shared/head-coach.ts', '_shared/resend.ts', '_shared/education-onboarding-email.ts',
    '_shared/education-onboarding-delivery.ts',
    options.reminders ? 'education-onboarding-reminders/index.ts' : 'education-onboarding-email/index.ts',
  ]) {
    const source = readFileSync(new URL(`../supabase/functions/${path}`, import.meta.url), 'utf8');
    vm.runInContext(stripTypeScriptTypes(source).replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, ''), context, { filename: path });
  }
  return {
    calls, state,
    invoke(body = options.reminders ? {} : { application_id: applicationId }, extra = {}) {
      return handler(new Request('https://function.example.invalid', {
        method: extra.method || 'POST',
        headers: { Authorization: 'Bearer synthetic-jwt', 'Content-Type': 'application/json', 'X-Education-Reminder-Secret': environment.EDUCATION_REMINDER_SECRET, ...extra.headers },
        ...(extra.method && extra.method !== 'POST' ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
      }));
    },
  };
}

test('head chooses one student and sends a short portal welcome using DB-derived address', async () => {
  const h = harness();
  const response = await h.invoke();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).email.id, 'synthetic-provider-id');
  assert.equal(h.calls.emails.length, 1);
  const { body, headers } = h.calls.emails[0];
  assert.deepEqual(body.to, ['student@example.invalid']);
  assert.equal(headers['Idempotency-Key'], `education-onboarding/${deliveryId}`);
  for (const content of [body.html, body.text]) {
    assert.match(content, /등록.*확정|등록이 완료/);
    assert.match(content, /강의계획안/);
    assert.match(content, /자기관찰보고서/);
    assert.match(content, /회원가입/);
    assert.match(content, /인증 메일/);
    assert.match(content, /student@example.invalid/);
    assert.match(content, /https:\/\/coach.er-coaching.com\/education.html/);
    assert.match(content, /한국 시간/);
    assert.doesNotMatch(content, /myjiji82|작성을 돕는 질문|surveys|첨부/);
  }
  assert.equal(h.calls.rpc.at(-1).args.p_provider_id, 'synthetic-provider-id');
});

for (const options of [{ role: 'coach' }, { inactive: true }, { noUser: true }]) {
  test(`unauthorized actor cannot create a durable claim ${JSON.stringify(options)}`, async () => {
    const h = harness(options);
    assert.ok([401, 403].includes((await h.invoke()).status));
    assert.equal(h.calls.rpc.length, 0);
    assert.equal(h.calls.emails.length, 0);
  });
}

for (const body of [{ application_id: applicationId, to: 'attacker@example.invalid' }, { application_id: 'bad' }, { application_id: applicationId, event: 'reminder_1d' }, '{bad', null]) {
  test(`invalid manual input never reaches DB ${JSON.stringify(body)}`, async () => {
    const h = harness();
    assert.equal((await h.invoke(body)).status, 400);
    assert.equal(h.calls.rpc.length, 0);
  });
}

for (const environment of [{ RESEND_API_KEY: '' }, { EDUCATION_PORTAL_URL: 'javascript:alert(1)' }, { EDUCATION_PORTAL_URL: 'https://student:password@portal.example.invalid' }]) {
  test(`missing or invalid send configuration preserves ability to send later ${JSON.stringify(environment)}`, async () => {
    const h = harness({ environment });
    assert.equal((await h.invoke()).status, 503);
    assert.equal(h.calls.rpc.length, 0);
  });
}

for (const reason of ['payment_not_confirmed', 'registration_inactive', 'preparation_not_ready']) {
  test(`DB eligibility gate ${reason} prevents welcome`, async () => {
    const h = harness({ notReady: reason });
    assert.equal((await h.invoke()).status, 409);
    assert.equal(h.calls.emails.length, 0);
  });
}

test('repeated and concurrent manual clicks send exactly once', async () => {
  const h = harness();
  const responses = await Promise.all([h.invoke(), h.invoke(), h.invoke()]);
  assert.ok(responses.some((response) => response.status === 200));
  assert.equal(h.calls.emails.length, 1);
  const repeated = await h.invoke();
  assert.equal((await repeated.json()).email.reason, 'already_sent');
  assert.equal(h.calls.emails.length, 1);
});

for (const options of [{ providerError: true }, { missingId: true }, { recordError: true }]) {
  test(`uncertain outcomes permanently block automatic resend ${JSON.stringify(options)}`, async () => {
    const h = harness(options);
    assert.ok([500, 502].includes((await h.invoke()).status));
    assert.equal((await h.invoke()).status, 409);
    assert.equal(h.calls.emails.length, 1);
  });
}

for (const reason of ['registration_inactive', 'already_submitted']) {
  test(`immediate recheck blocks email after ${reason}`, async () => {
    const h = harness({ changed: reason });
    assert.equal((await h.invoke()).status, 409);
    assert.equal(h.calls.emails.length, 0);
    assert.equal(h.calls.rpc.at(-1).args.p_error, 'ineligible_before_send');
  });
}

test('eligibility read failure fails closed and leaves durable attempt', async () => {
  const h = harness({ checkError: true });
  assert.equal((await h.invoke()).status, 500);
  assert.equal(h.calls.emails.length, 0);
  assert.equal((await h.invoke()).status, 409);
});

test('email escapes student/course content and omits unknown first class dates', async () => {
  const h = harness({ payload: { name: '<img src=x onerror=alert(1)>', course_title: 'A & B', starts_at: null } });
  assert.equal((await h.invoke()).status, 200);
  assert.match(h.calls.emails[0].body.html, /&lt;img/);
  assert.match(h.calls.emails[0].body.html, /A &amp; B/);
  assert.doesNotMatch(h.calls.emails[0].body.html, /<img src=x/);
  assert.match(h.calls.emails[0].body.text, /내 교실에서 일정을 확인/);
});

test('scheduler defaults to read-only dry run and emits aggregate counts only', async () => {
  const h = harness({ reminders: true, environment: { RESEND_API_KEY: '' } });
  const response = await h.invoke();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, dry_run: true, eligible: 1 });
  assert.equal(h.calls.rpc.length, 1);
  assert.equal(h.calls.emails.length, 0);
  assert.deepEqual(h.calls.delays, []);
});

test('scheduler refuses head JWT without its purpose-limited secret', async () => {
  const h = harness({ reminders: true });
  assert.equal((await h.invoke({}, { headers: { 'X-Education-Reminder-Secret': '' } })).status, 401);
  assert.equal(h.calls.rpc.length, 0);
});

test('scheduler cannot accept arbitrary recipient, application or nonboolean live toggle', async () => {
  const h = harness({ reminders: true });
  for (const body of [{ to: 'a@example.invalid' }, { application_id: applicationId }, { dry_run: 'false' }]) {
    assert.equal((await h.invoke(body)).status, 400);
  }
  assert.equal(h.calls.rpc.length, 0);
});

test('enabled scheduler sends a portal reminder without answer contents', async () => {
  const h = harness({ reminders: true });
  const response = await h.invoke({ dry_run: false });
  assert.deepEqual(await response.json(), { ok: true, dry_run: false, eligible: 1, sent: 1, skipped: 0, failed: 0 });
  assert.equal(h.calls.rpc.find((call) => call.name === 'edu_claim_onboarding_email').args.p_kind, 'reminder_3d');
  assert.match(h.calls.emails[0].body.text, /아직 자기관찰보고서 제출이 확인되지 않아/);
  assert.doesNotMatch(h.calls.emails[0].body.text, /가장 중요한 가치|어린 시절|회원가입/);
  assert.deepEqual(h.calls.delays, [1000]);
});

test('scheduler paces every candidate and avoids sleeping on an empty batch', async () => {
  const h = harness({ reminders: true, candidates: [
    { application_id: applicationId, kind: 'reminder_3d' },
    { application_id: applicationId, kind: 'reminder_1d' },
  ] });
  assert.equal((await h.invoke({ dry_run: false })).status, 200);
  assert.deepEqual(h.calls.delays, [1000, 1000]);
  const empty = harness({ reminders: true, candidates: [] });
  assert.equal((await empty.invoke({ dry_run: false })).status, 200);
  assert.deepEqual(empty.calls.delays, []);
});

test('scheduler skips a submission that arrived after candidate selection', async () => {
  const h = harness({ reminders: true, changed: 'already_submitted' });
  assert.deepEqual(await (await h.invoke({ dry_run: false })).json(), { ok: true, dry_run: false, eligible: 1, sent: 0, skipped: 1, failed: 0 });
  assert.equal(h.calls.emails.length, 0);
});

test('scheduler fails visibly when provider outcome is uncertain', async () => {
  const h = harness({ reminders: true, providerError: true });
  const response = await h.invoke({ dry_run: false });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).failed, 1);
});

test('daily scheduler has explicit enable gate, dry run default, no retry and limited credential', () => {
  const workflow = readFileSync(new URL('../.github/workflows/education-reminders.yml', import.meta.url), 'utf8');
  assert.match(workflow, /cron: '0 0 \* \* \*'/);
  assert.match(workflow, /EDUCATION_REMINDERS_ENABLED == 'true'/);
  assert.match(workflow, /default: true/);
  assert.match(workflow, /X-Education-Reminder-Secret/);
  assert.doesNotMatch(workflow, /SERVICE_ROLE|--retry|set -x/);
  const config = readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  assert.match(config, /\[functions.education-onboarding-email\]\s+verify_jwt = true/);
  assert.match(config, /\[functions.education-onboarding-reminders\]\s+verify_jwt = false/);
});

function runReminderWorkflow(responses, dryRun = false) {
  const workflow = readFileSync(new URL('../.github/workflows/education-reminders.yml', import.meta.url), 'utf8');
  const script = workflow.split('        run: |\n')[1].split('\n').map((line) => line.startsWith('          ') ? line.slice(10) : line).join('\n');
  const directory = mkdtempSync(join(tmpdir(), 'education-reminder-workflow-'));
  try {
    writeFileSync(join(directory, 'responses.json'), JSON.stringify(responses));
    // 실제 워크플로의 Bash·jq 분기를 실행하며 curl 경계만 합성 응답으로 대체한다.
    writeFileSync(join(directory, 'curl'), `#!/usr/bin/env node\nconst fs=require('node:fs');const path=require('node:path');const root=process.env.WORKFLOW_TEST_DIR;const counter=path.join(root,'count');const n=fs.existsSync(counter)?Number(fs.readFileSync(counter,'utf8')):0;fs.writeFileSync(counter,String(n+1));const rows=JSON.parse(fs.readFileSync(path.join(root,'responses.json'),'utf8'));if(!rows[n])process.exit(99);const row=rows[n];if(row.networkError)process.exit(28);const args=process.argv.slice(2);fs.writeFileSync(args[args.indexOf('--output')+1],typeof row.body==='string'?row.body:JSON.stringify(row.body));process.stdout.write(String(row.status));\n`, { mode: 0o755 });
    const result = spawnSync('bash', ['-c', script], {
      encoding: 'utf8', timeout: 10000,
      env: { ...process.env, PATH: directory + ':' + process.env.PATH, WORKFLOW_TEST_DIR: directory,
        SUPABASE_URL: 'https://synthetic.supabase.co', EDUCATION_REMINDER_SECRET: 'synthetic-secret', DRY_RUN: String(dryRun) },
    });
    assert.equal(result.error, undefined);
    return { ...result, calls: Number(readFileSync(join(directory, 'count'), 'utf8')) };
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

const batch = (eligible, failed = 0) => ({ status: failed ? 502 : 200, body: { ok: !failed, dry_run: false, eligible, sent: eligible - failed, skipped: 0, failed } });

test('workflow processes later batches after a structured delivery failure then reports failure', () => {
  const result = runReminderWorkflow([batch(50, 1), batch(50, 2), batch(2)]);
  assert.equal(result.calls, 3);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /3 failed deliveries/);
});

test('workflow stops at ten batches and makes remaining work visible', () => {
  const result = runReminderWorkflow(Array.from({ length: 10 }, () => batch(50)));
  assert.equal(result.calls, 10);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /daily safety limit/);
});

test('workflow stops rather than burning more claims when no delivery succeeds', () => {
  const result = runReminderWorkflow([batch(50, 50), batch(1)]);
  assert.equal(result.calls, 1);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No deliveries succeeded.*50 failed deliveries/);
});

test('workflow completes cleanly after draining a full and partial batch', () => {
  const result = runReminderWorkflow([batch(50), batch(2)]);
  assert.equal(result.calls, 2);
  assert.equal(result.status, 0);
});

for (const response of [{ networkError: true }, { status: 502, body: '{bad' }, { status: 502, body: { error: 'internal_error' } }, { status: 200, body: { ok: true, dry_run: false, eligible: 50, sent: 2, skipped: 0, failed: 0 } }]) {
  test(`workflow stops immediately on transport or invalid aggregate data ${JSON.stringify(response)}`, () => {
    const result = runReminderWorkflow([response, batch(1)]);
    assert.equal(result.calls, 1);
    assert.notEqual(result.status, 0);
  });
}

test('workflow dry run stops after one read even if its candidate batch is full', () => {
  const result = runReminderWorkflow([{ status: 200, body: { ok: true, dry_run: true, eligible: 50 } }], true);
  assert.equal(result.calls, 1);
  assert.equal(result.status, 0);
});
