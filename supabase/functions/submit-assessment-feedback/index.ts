// 공개 검사 결과의 선택형 평가를 검증하고 실명 실험과 분리해 저장한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MAX_BODY_BYTES = 12 * 1024;
const CONSENT_VERSION = '2026-09-28-feedback-v1';
const PARTS = ['core', 'subtype', 'wing', 'description'];
const DIFFICULTIES = ['words', 'context', 'multiple', 'none_fit', 'length', 'none'];
const VERSION_KEYS = ['assessment', 'instructions', 'questions', 'scoring', 'report', 'survey'];
const PRODUCTION_ORIGINS = ['https://er-coaching.com', 'https://www.er-coaching.com'];

type Feedback = {
  attempt_id: string;
  revision: number;
  result: { core: number | null; core_resolved: boolean; subtype: string | null; wing: number | null; candidate_types: number[] };
  versions: Record<string, string>;
  variant: string;
  rating: number | null;
  deferred: boolean;
  matching_parts: string[];
  mismatching_parts: string[];
  difficulties: string[];
  consent_version: string;
  consent_accepted: boolean;
};

function exactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function typeNumber(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 9;
}

function choiceArray(value: unknown, allowed: string[]): value is string[] {
  return Array.isArray(value) && value.length <= allowed.length
    && value.every((item) => typeof item === 'string' && allowed.includes(item))
    && new Set(value).size === value.length;
}

function validatePayload(input: unknown): { feedback: Feedback; token: string } | null {
  if (!exactKeys(input, ['attempt_id', 'revision', 'result', 'versions', 'variant', 'rating', 'deferred', 'matching_parts', 'mismatching_parts', 'difficulties', 'consent_version', 'consent_accepted', 'turnstile_token'])) return null;
  if (typeof input.attempt_id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(input.attempt_id)) return null;
  if (!Number.isInteger(input.revision) || Number(input.revision) < 0 || Number(input.revision) > 2147483647) return null;
  if (input.variant !== 'word' || input.consent_version !== CONSENT_VERSION || input.consent_accepted !== true) return null;
  if (typeof input.deferred !== 'boolean') return null;
  if (input.deferred ? input.rating !== null : !Number.isInteger(input.rating) || Number(input.rating) < 1 || Number(input.rating) > 5) return null;
  if (typeof input.turnstile_token !== 'string' || input.turnstile_token.length < 1 || input.turnstile_token.length > 2048 || input.turnstile_token.trim() !== input.turnstile_token) return null;
  const versions = input.versions;
  if (!exactKeys(versions, VERSION_KEYS) || !VERSION_KEYS.every((key) => typeof versions[key] === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(versions[key] as string))) return null;
  if (!choiceArray(input.matching_parts, PARTS) || !choiceArray(input.mismatching_parts, PARTS) || !choiceArray(input.difficulties, DIFFICULTIES)) return null;
  if (input.matching_parts.some((part) => (input.mismatching_parts as string[]).includes(part))) return null;
  if (input.difficulties.includes('none') && input.difficulties.length !== 1) return null;

  const result = input.result;
  if (!exactKeys(result, ['core', 'core_resolved', 'subtype', 'wing', 'candidate_types']) || typeof result.core_resolved !== 'boolean') return null;
  if (!Array.isArray(result.candidate_types) || ![3, 4].includes(result.candidate_types.length)
    || !result.candidate_types.every(typeNumber) || new Set(result.candidate_types).size !== result.candidate_types.length) return null;
  if (result.subtype !== null && !['sp', 'sx', 'so'].includes(result.subtype as string)) return null;
  if (result.core_resolved) {
    if (!typeNumber(result.core) || !result.candidate_types.includes(result.core)) return null;
    const wings = [result.core === 1 ? 9 : result.core - 1, result.core === 9 ? 1 : result.core + 1];
    if (result.wing !== null && !wings.includes(result.wing as number)) return null;
  } else if (result.core !== null || result.subtype !== null || result.wing !== null) return null;

  // 명시한 필드만 새 객체에 담고 집합 응답 순서를 정규화해 중복 판정을 안정화한다.
  return {
    token: input.turnstile_token,
    feedback: {
      attempt_id: input.attempt_id.toLowerCase(), revision: input.revision as number,
      result: { core: result.core as number | null, core_resolved: result.core_resolved, subtype: result.subtype as string | null, wing: result.wing as number | null, candidate_types: [...result.candidate_types].sort((a, b) => a - b) },
      versions: Object.fromEntries(VERSION_KEYS.map((key) => [key, versions[key] as string])),
      variant: 'word', rating: input.rating as number | null, deferred: input.deferred,
      matching_parts: [...input.matching_parts].sort(), mismatching_parts: [...input.mismatching_parts].sort(), difficulties: [...input.difficulties].sort(),
      consent_version: CONSENT_VERSION, consent_accepted: true,
    },
  };
}

function allowedOrigins(): string[] {
  const local = (Deno.env.get('ASSESSMENT_FEEDBACK_LOCAL_ORIGINS') || '').split(',').map((entry) => entry.trim()).filter(Boolean);
  for (const origin of local) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.origin !== origin) throw new Error('invalid_local_origin');
  }
  return [...PRODUCTION_ORIGINS, ...local];
}

function respond(origin: string | null, status: number, body: Record<string, unknown> | null): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Origin',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info' } : {}),
    },
  });
}

async function boundedJson(req: Request): Promise<unknown> {
  const declared = req.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) throw new Error('request_too_large');
  if (!req.body) throw new Error('invalid_json');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error('request_too_large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error('invalid_json'); }
}

async function digest(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))))
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function verifyChallenge(token: string, secret: string, hostname: string, fingerprint: string): Promise<'valid' | 'invalid' | 'unavailable'> {
  // 같은 본문·토큰만 같은 검증 키를 사용한다. 저장 실패 후 재시도도 토큰을 다른 요청에 재사용하지 않는다.
  const hash = await digest(`${fingerprint}:${token}`);
  const retryKey = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, idempotency_key: retryKey }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return 'unavailable';
    const result = await response.json();
    return result.success === true && result.action === 'assessment-feedback' && result.hostname === hostname ? 'valid' : 'invalid';
  } catch { return 'unavailable'; }
}

Deno.serve(async (req: Request) => {
  let origins: string[];
  try { origins = allowedOrigins(); }
  catch { return respond(null, 503, { error: 'server_not_configured' }); }
  const origin = req.headers.get('origin');
  if (!origin || !origins.includes(origin)) return respond(null, 403, { error: 'origin_not_allowed' });
  if (req.method === 'OPTIONS') return respond(origin, 204, null);
  if (req.method !== 'POST') return respond(origin, 405, { error: 'method_not_allowed' });
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return respond(origin, 415, { error: 'unsupported_media_type' });

  const secret = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
  const url = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!secret.trim() || !url.trim() || !serviceKey.trim()) return respond(origin, 503, { error: 'server_not_configured' });

  let input: unknown;
  try { input = await boundedJson(req); }
  catch (error) {
    const code = error instanceof Error && error.message === 'request_too_large' ? 'request_too_large' : 'invalid_json';
    return respond(origin, code === 'request_too_large' ? 413 : 400, { error: code });
  }
  const validated = validatePayload(input);
  if (!validated) return respond(origin, 400, { error: 'invalid_payload' });
  const { feedback, token } = validated;

  try {
    const bodyFingerprint = await digest(JSON.stringify(feedback));
    const challengeFingerprint = await digest(token);
    const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const findExisting = () => db.from('diagnostic_result_feedback')
      .select('body_fingerprint,challenge_fingerprint').eq('attempt_id', feedback.attempt_id).eq('revision', feedback.revision).maybeSingle();
    const { data: existing, error: lookupError } = await findExisting();
    if (lookupError) return respond(origin, 503, { error: 'storage_unavailable' });
    // 이미 검증해 저장한 본문과 토큰에 한해 재전송을 승인하며 토큰 원문은 저장하지 않는다.
    if (existing && existing.challenge_fingerprint === challengeFingerprint) {
      return existing.body_fingerprint === bodyFingerprint
        ? respond(origin, 200, { saved: true, duplicate: true })
        : respond(origin, 409, { error: 'revision_conflict' });
    }

    const challenge = await verifyChallenge(token, secret, new URL(origin).hostname, bodyFingerprint);
    if (challenge !== 'valid') return respond(origin, challenge === 'unavailable' ? 503 : 403, { error: challenge === 'unavailable' ? 'verification_unavailable' : 'turnstile_failed' });
    if (existing) return existing.body_fingerprint === bodyFingerprint
      ? respond(origin, 200, { saved: true, duplicate: true })
      : respond(origin, 409, { error: 'revision_conflict' });

    const { error } = await db.from('diagnostic_result_feedback').insert({ ...feedback, body_fingerprint: bodyFingerprint, challenge_fingerprint: challengeFingerprint });
    if (error?.code === '23505') {
      const { data: concurrent, error: readError } = await findExisting();
      if (readError) return respond(origin, 503, { error: 'storage_unavailable' });
      if (!concurrent) return respond(origin, 403, { error: 'turnstile_failed' });
      return concurrent.body_fingerprint === bodyFingerprint
        ? respond(origin, 200, { saved: true, duplicate: true })
        : respond(origin, 409, { error: 'revision_conflict' });
    }
    if (error) return respond(origin, 503, { error: 'storage_unavailable' });
    return respond(origin, 200, { saved: true });
  } catch {
    return respond(origin, 503, { error: 'storage_unavailable' });
  }
});
