// 전용 스케줄러 비밀키로 미제출자만 조회하고 제한된 알림을 발송한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { deliverEducationOnboardingEmail, onboardingDeliverySettings } from '../_shared/education-onboarding-delivery.ts';
import type { OnboardingKind } from '../_shared/education-onboarding-email.ts';

async function sameReminderSecret(supplied: string, configured: string): Promise<boolean> {
  if (!configured || !supplied) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([supplied, configured].map(async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))));
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

Deno.serve(async (req) => {
  const respond = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
  if (req.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);
  const configuredSecret = Deno.env.get('EDUCATION_REMINDER_SECRET') || '';
  if (!configuredSecret) return respond({ error: 'scheduler_not_configured' }, 503);
  if (!await sameReminderSecret(req.headers.get('X-Education-Reminder-Secret') || '', configuredSecret)) {
    return respond({ error: 'unauthorized' }, 401);
  }
  let body;
  try { body = await req.json(); } catch { return respond({ error: 'invalid_payload' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => key !== 'dry_run')
    || (body.dry_run !== undefined && typeof body.dry_run !== 'boolean')) {
    return respond({ error: 'invalid_payload' }, 400);
  }
  const dryRun = body.dry_run !== false;
  try {
    const url = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!url || !serviceKey) return respond({ error: 'server_not_configured' }, 503);
    let settings;
    if (!dryRun) {
      try { settings = onboardingDeliverySettings(); } catch { return respond({ error: 'email_not_configured' }, 503); }
    }
    const client = createClient(url, serviceKey);
    const { data, error } = await client.rpc('edu_onboarding_reminder_candidates', { p_limit: 50 });
    if (error || !Array.isArray(data)) return respond({ error: 'candidate_lookup_failed' }, 500);
    if (data.length > 50 || data.some((candidate) => !candidate.application_id || !['reminder_3d', 'reminder_1d'].includes(candidate.kind))) {
      return respond({ error: 'invalid_candidates' }, 500);
    }
    if (dryRun) return respond({ ok: true, dry_run: true, eligible: data.length });
    const summary = { eligible: data.length, sent: 0, skipped: 0, failed: 0 };
    for (const candidate of data) {
      // 같은 Resend 계정을 쓰는 다른 메일에 여유를 두고 일괄 발송을 초당 한 건으로 제한한다.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = await deliverEducationOnboardingEmail(client, candidate.application_id, candidate.kind as OnboardingKind, null, settings!);
      if (result.body.ok && !result.body.email?.skipped) summary.sent++;
      else if (result.status === 409 || result.body.email?.skipped) summary.skipped++;
      else summary.failed++;
    }
    return respond({ ok: summary.failed === 0, dry_run: false, ...summary }, summary.failed ? 502 : 200);
  } catch {
    console.error('education reminder run failed');
    return respond({ error: 'internal_error' }, 500);
  }
});
