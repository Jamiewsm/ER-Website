// 수석코치가 직접 확정한 학생에게만 내 교실 이용 안내를 발송한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { requireHeadCoach } from '../_shared/head-coach.ts';
import { deliverEducationOnboardingEmail, onboardingDeliverySettings } from '../_shared/education-onboarding-delivery.ts';

Deno.serve(async (req) => {
  const respond = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!url || !anonKey || !serviceKey) return respond({ error: 'server_not_configured' }, 503);
    const actor = await requireHeadCoach(req, url, anonKey);
    let body;
    try { body = await req.json(); } catch { return respond({ error: 'invalid_payload' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => key !== 'application_id')
      || typeof body.application_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.application_id)) {
      return respond({ error: 'invalid_payload' }, 400);
    }
    let settings;
    try { settings = onboardingDeliverySettings(); } catch { return respond({ error: 'email_not_configured' }, 503); }
    const result = await deliverEducationOnboardingEmail(createClient(url, serviceKey), body.application_id, 'welcome', actor.id, settings);
    return respond(result.body, result.status);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('education onboarding request failed');
    return respond({ error: 'internal_error' }, 500);
  }
});
