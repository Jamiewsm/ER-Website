// 공개 평가 API의 요청 검증·권한 경계·검증 토큰·중복 및 저장 실패를 가상 환경에서 검증한다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../supabase/functions/submit-assessment-feedback/index.ts', import.meta.url), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
const key = (row) => `${row.attempt_id}:${row.revision}`;
function payload() {
  return {
    attempt_id: '10000000-0000-4000-8000-000000000001', revision: 0,
    result: { core: 4, core_resolved: true, subtype: 'sp', wing: 5, candidate_types: [4, 6, 9] },
    versions: { assessment: 'word-narrative-v2', instructions: 'v1', questions: 'v2', scoring: 'v2', report: 'v1', survey: 'v1' },
    variant: 'word', rating: 4, deferred: false, matching_parts: ['core'], mismatching_parts: ['description'], difficulties: ['words'],
    consent_version: '2026-09-28-feedback-v1', consent_accepted: true, turnstile_token: 'synthetic-challenge',
  };
}

function harness(options = {}) {
  const environment = { SUPABASE_URL: 'https://database.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', TURNSTILE_SECRET_KEY: 'synthetic-secret', ...options.environment };
  const rows = options.rows || new Map();
  const calls = { lookup: [], insert: [], verification: [], clients: [] };
  let handler;
  const context = vm.createContext({
    Request, Response, Headers, URL, TextEncoder, TextDecoder, Uint8Array, AbortSignal, crypto: webcrypto, console,
    Deno: { env: { get: (name) => environment[name] }, serve: (callback) => { handler = callback; } },
    createClient(url, serviceKey, settings) {
      calls.clients.push({ url, serviceKey, settings: plain(settings) });
      assert.equal(serviceKey, environment.SUPABASE_SERVICE_ROLE_KEY);
      return {
        from(table) {
          assert.equal(table, 'diagnostic_result_feedback');
          const filters = {};
          return {
            select(columns) { assert.equal(columns, 'body_fingerprint,challenge_fingerprint'); return this; },
            eq(name, value) { filters[name] = value; return this; },
            async maybeSingle() {
              calls.lookup.push({ ...filters });
              if (options.lookupError) return { data: null, error: { message: 'sensitive database diagnostics' } };
              const row = rows.get(key(filters));
              return { data: row ? { body_fingerprint: row.body_fingerprint, challenge_fingerprint: row.challenge_fingerprint } : null, error: null };
            },
            async insert(row) {
              row = plain(row);
              calls.insert.push(row);
              if (options.insertThrow) throw new Error('secret internal failure');
              if (options.insertError) return { error: { code: 'XX000', message: 'private diagnostics' } };
              if (options.race) {
                rows.set(key(row), options.race === 'same' ? row : { ...row, body_fingerprint: 'f'.repeat(64) });
                return { error: { code: '23505' } };
              }
              if (rows.has(key(row)) || [...rows.values()].some((prior) => prior.challenge_fingerprint === row.challenge_fingerprint)) return { error: { code: '23505' } };
              rows.set(key(row), row);
              return { error: null };
            },
          };
        },
      };
    },
    async fetch(url, init) {
      assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify', '외부 요청은 전부 mock이어야 한다');
      calls.verification.push(JSON.parse(init.body));
      assert.ok(init.signal instanceof AbortSignal);
      if (options.verifyThrow) throw new Error('private provider diagnostics');
      if (options.verifyMalformed) return new Response('broken json');
      return new Response(JSON.stringify(options.challenge || { success: true, action: 'assessment-feedback', hostname: 'er-coaching.com' }), { status: options.verifyStatus || 200 });
    },
  });
  vm.runInContext(stripTypeScriptTypes(source).replace(/^import .*;\s*$/gm, ''), context);
  return {
    calls, rows,
    invoke(body = payload(), options = {}) {
      return handler(new Request('https://function.example.invalid', {
        method: options.method || 'POST',
        headers: { Origin: 'https://er-coaching.com', 'Content-Type': 'application/json', ...options.headers },
        ...(['GET', 'OPTIONS'].includes(options.method) ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
      }));
    },
    handle: (request) => handler(request),
  };
}

test('valid opt-in feedback stores only normalized contract fields and hashes', async () => {
  const h = harness();
  const response = await h.invoke();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { saved: true });
  assert.equal(h.rows.size, 1);
  const row = [...h.rows.values()][0];
  assert.equal(row.rating, 4);
  assert.match(row.body_fingerprint, /^[a-f0-9]{64}$/);
  assert.match(row.challenge_fingerprint, /^[a-f0-9]{64}$/);
  for (const forbidden of ['turnstile_token', 'name', 'email', 'responses', 'user_agent', 'ip']) assert.equal(Object.hasOwn(row, forbidden), false);
  assert.deepEqual(Object.keys(row).sort(), [...Object.keys(payload()).filter((field) => field !== 'turnstile_token'), 'body_fingerprint', 'challenge_fingerprint'].sort());
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://er-coaching.com');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Vary'), 'Origin');
  assert.deepEqual(h.calls.clients[0].settings, { auth: { persistSession: false, autoRefreshToken: false } });
  assert.equal(Object.hasOwn(h.calls.verification[0], 'remoteip'), false);
});

test('pending type and deferred rating remain null rather than guessed', async () => {
  const h = harness();
  const body = payload();
  body.result = { ...body.result, core: null, core_resolved: false, subtype: null, wing: null };
  body.rating = null; body.deferred = true;
  assert.equal((await h.invoke(body)).status, 200);
  assert.equal([...h.rows.values()][0].result.core, null);
  assert.equal([...h.rows.values()][0].rating, null);
});

test('revision 21 and the PostgreSQL integer maximum are valid', async () => {
  for (const revision of [21, 2147483647]) {
    const h = harness(); const body = payload(); body.revision = revision;
    assert.equal((await h.invoke(body)).status, 200);
    assert.equal([...h.rows.values()][0].revision, revision);
  }
});

test('invalid enums, unknown fields, incompatible results and ratings never reach DB or verification', async () => {
  const mutations = [
    (p) => { p.name = 'not collected'; }, (p) => { p.result.email = 'not collected'; }, (p) => { p.versions.extra = 'v1'; },
    (p) => { p.attempt_id = 'invalid'; }, (p) => { p.revision = -1; }, (p) => { p.revision = 2147483648; }, (p) => { p.revision = 1.5; },
    (p) => { p.rating = 0; }, (p) => { p.rating = 6; }, (p) => { p.rating = '4'; }, (p) => { p.rating = null; },
    (p) => { p.deferred = true; }, (p) => { p.deferred = 'false'; },
    (p) => { p.variant = 'legacy'; }, (p) => { p.consent_accepted = false; }, (p) => { p.consent_version = 'old'; },
    (p) => { p.result.core = 0; }, (p) => { p.result.core_resolved = false; }, (p) => { p.result.core = 5; },
    (p) => { p.result.subtype = 'unknown'; }, (p) => { p.result.wing = 6; }, (p) => { p.result.wing = '5'; },
    (p) => { p.result.candidate_types = [4, 6]; }, (p) => { p.result.candidate_types = [4, 6, 6]; }, (p) => { p.result.candidate_types = [4, 6, 10]; },
    (p) => { p.matching_parts = ['private']; }, (p) => { p.matching_parts = ['core', 'core']; }, (p) => { p.mismatching_parts = ['core']; },
    (p) => { p.difficulties = ['none', 'words']; }, (p) => { p.difficulties = ['words', 'words']; }, (p) => { p.difficulties = 'words'; },
    (p) => { p.versions.scoring = 'a'.repeat(65); }, (p) => { p.versions.survey = ''; }, (p) => { p.versions.report = 'private free text'; },
    (p) => { p.turnstile_token = ''; }, (p) => { p.turnstile_token = 'a'.repeat(2049); }, (p) => { delete p.rating; },
  ];
  for (const mutate of mutations) {
    const h = harness(); const body = payload(); mutate(body);
    const response = await h.invoke(body);
    assert.equal(response.status, 400, mutate.toString());
    assert.deepEqual(await response.json(), { error: 'invalid_payload' });
    assert.equal(h.calls.lookup.length + h.calls.insert.length + h.calls.verification.length, 0);
  }
});

test('circular wings and four unique candidates are allowed', async () => {
  for (const [core, wing] of [[1, 9], [9, 1]]) {
    const h = harness(); const body = payload();
    body.result = { core, core_resolved: true, wing, subtype: null, candidate_types: [1, 4, 6, 9] };
    assert.equal((await h.invoke(body)).status, 200);
  }
});

test('same normalized body and verified token acknowledge a lost response without consuming the token again', async () => {
  const h = harness(); const body = payload();
  body.matching_parts = ['core', 'wing'];
  assert.equal((await h.invoke(body)).status, 200);
  body.matching_parts.reverse(); body.result.candidate_types.reverse();
  const duplicate = await h.invoke(body);
  assert.deepEqual(await duplicate.json(), { saved: true, duplicate: true });
  assert.equal(h.calls.verification.length, 1);
  assert.equal(h.calls.insert.length, 1);
});

test('a fresh token verifies before acknowledging a duplicate or rejecting a changed revision', async () => {
  const h = harness(); const body = payload();
  await h.invoke(body);
  body.turnstile_token = 'new-challenge';
  assert.deepEqual(await (await h.invoke(body)).json(), { saved: true, duplicate: true });
  body.rating = 2;
  const conflict = await h.invoke(body);
  assert.equal(conflict.status, 409);
  assert.deepEqual(await conflict.json(), { error: 'revision_conflict' });
  assert.equal([...h.rows.values()][0].rating, 4);
  assert.equal(h.calls.insert.length, 1);
});

test('same token with changed body conflicts without changing stored data', async () => {
  const h = harness(); const body = payload(); await h.invoke(body); body.rating = 1;
  assert.equal((await h.invoke(body)).status, 409);
  assert.equal(h.calls.verification.length, 1);
  assert.equal(h.rows.size, 1);
});

test('concurrent unique-key races acknowledge identical content and reject conflicting content', async () => {
  for (const [race, status] of [['same', 200], ['different', 409]]) {
    const h = harness({ race }); const response = await h.invoke();
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), race === 'same' ? { saved: true, duplicate: true } : { error: 'revision_conflict' });
    assert.equal(h.rows.size, 1);
  }
});

test('a challenge cannot write two revisions even if a verification provider mistakenly accepts it again', async () => {
  const h = harness(); const body = payload(); await h.invoke(body); body.revision = 1;
  assert.equal((await h.invoke(body)).status, 403);
  assert.equal(h.rows.size, 1);
  body.turnstile_token = 'second-real-challenge';
  assert.equal((await h.invoke(body)).status, 200);
  assert.equal(h.rows.size, 2);
});

test('origin, media type, method and local opt-in protect the request boundary', async () => {
  for (const origin of ['', 'null', 'http://er-coaching.com', 'https://er-coaching.com.evil.invalid', 'http://localhost:8768']) {
    const h = harness(); const response = await h.invoke(payload(), { headers: { Origin: origin } });
    assert.equal(response.status, 403); assert.equal(response.headers.has('Access-Control-Allow-Origin'), false);
    assert.equal(h.calls.clients.length + h.calls.verification.length, 0);
  }
  const h = harness();
  assert.equal((await h.invoke(undefined, { method: 'GET' })).status, 405);
  assert.equal((await h.invoke(undefined, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
  const preflight = await h.invoke(undefined, { method: 'OPTIONS' });
  assert.equal(preflight.status, 204); assert.equal(await preflight.text(), '');
  const local = harness({ environment: { ASSESSMENT_FEEDBACK_LOCAL_ORIGINS: 'http://localhost:8768' }, challenge: { success: true, action: 'assessment-feedback', hostname: 'localhost' } });
  assert.equal((await local.invoke(undefined, { headers: { Origin: 'http://localhost:8768' } })).status, 200);
  const invalidConfig = harness({ environment: { ASSESSMENT_FEEDBACK_LOCAL_ORIGINS: 'https://evil.invalid' } });
  assert.equal((await invalidConfig.invoke()).status, 503);
  const www = harness({ challenge: { success: true, action: 'assessment-feedback', hostname: 'www.er-coaching.com' } });
  assert.equal((await www.invoke(undefined, { headers: { Origin: 'https://www.er-coaching.com' } })).status, 200);
});

test('missing secrets fail closed and provider success must match action and exact requesting hostname', async () => {
  for (const key of ['TURNSTILE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    const h = harness({ environment: { [key]: '' } });
    assert.deepEqual(await (await h.invoke()).json(), { error: 'server_not_configured' });
    assert.equal(h.calls.clients.length + h.calls.verification.length, 0);
  }
  for (const challenge of [{ success: false }, { success: true, action: 'submit-application', hostname: 'er-coaching.com' }, { success: true, action: 'assessment-feedback', hostname: 'evil.invalid' }, { success: true, action: 'assessment-feedback' }]) {
    const h = harness({ challenge }); const response = await h.invoke();
    assert.equal(response.status, 403); assert.deepEqual(await response.json(), { error: 'turnstile_failed' }); assert.equal(h.calls.insert.length, 0);
  }
});

test('oversized declared and streamed requests, malformed JSON and primitive bodies are rejected', async () => {
  const cases = [
    [payload(), { headers: { 'Content-Length': '13000' } }, 413],
    [' '.repeat(13000), {}, 413], ['{bad', {}, 400], ['null', {}, 400], ['[]', {}, 400],
  ];
  for (const [body, options, status] of cases) {
    const h = harness(); assert.equal((await h.invoke(body, options)).status, status); assert.equal(h.calls.clients.length, 0);
  }
});

test('provider and storage failures use safe errors and never report unsaved feedback as saved', async () => {
  for (const option of ['verifyThrow', 'verifyMalformed', 'lookupError', 'insertError', 'insertThrow']) {
    const h = harness({ [option]: true }); const response = await h.invoke();
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: option.startsWith('verify') ? 'verification_unavailable' : 'storage_unavailable' });
    assert.equal(h.rows.size, 0);
  }
  assert.equal((await harness({ verifyStatus: 503 }).invoke()).status, 503);
});

test('verification retry identifiers stay stable only for the exact normalized body and token', async () => {
  const h = harness({ insertError: true }); const body = payload();
  await h.invoke(body); await h.invoke(body);
  assert.equal(h.calls.verification[0].idempotency_key, h.calls.verification[1].idempotency_key);
  assert.match(h.calls.verification[0].idempotency_key, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-8[a-f0-9]{3}-[a-f0-9]{12}$/);
  body.rating = 2; await h.invoke(body);
  assert.notEqual(h.calls.verification[0].idempotency_key, h.calls.verification[2].idempotency_key);
});

test('deployment config keeps this endpoint public while the existing shared helper is not imported', () => {
  const config = readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  assert.match(config, /\[functions\.submit-assessment-feedback\]\s*verify_jwt = false/);
  assert.doesNotMatch(source, /_shared\/turnstile|diagnostic_experiment_sessions|\.upsert\(|\.update\(/);
});
