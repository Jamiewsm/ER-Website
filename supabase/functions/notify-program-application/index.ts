// 헤드 코치: 등록 확정·수료 안내 등 후속 메일 발송
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  basicCourseGraduationUpsellHtml,
  basicCoursePreSurveyHtml,
  basicCourseRegistrationHtml,
} from '../_shared/email-templates.ts';
import { extractEmailFromContact, sendResendEmail } from '../_shared/resend.ts';

type NotifyEvent = 'registration' | 'pre_survey' | 'graduation';

type NotifyPayload = {
  application_id?: string;
  event?: NotifyEvent;
};

async function requireHeadCoach(req: Request, supabaseUrl: string, anonKey: string) {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    throw new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: profile, error: profileError } = await userClient
    .from('coach_profiles')
    .select('role, is_active')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'head_coach' || !profile.is_active) {
    throw new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return userData.user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    await requireHeadCoach(req, supabaseUrl, anonKey);

    const body = (await req.json()) as NotifyPayload;
    const applicationId = String(body.application_id || '').trim();
    const event = body.event;
    if (!applicationId || !event) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: app, error: fetchError } = await supabase
      .from('program_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (fetchError || !app) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const applicantEmail = extractEmailFromContact(app.contact);
    if (!applicantEmail) {
      return new Response(JSON.stringify({ error: 'no_email_on_contact' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') || '';
    const fromEmail = Deno.env.get('APPLICATION_FROM_EMAIL') || 'ER <enrollment@er-coaching.com>';
    const replyTo = Deno.env.get('APPLICATION_REPLY_TO') || 'json@er-coaching.com';

    let subject = '';
    let html = '';

    if (event === 'registration') {
      const paypalEmail = Deno.env.get('PAYPAL_BUSINESS_EMAIL') || '';
      const zelleContact = Deno.env.get('ZELLE_CONTACT') || '';
      if (!paypalEmail || !zelleContact) {
        return new Response(JSON.stringify({ error: 'payment_env_missing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      subject = '[ER] 7월 기본과정 등록·결제 안내';
      html = basicCourseRegistrationHtml({
        name: app.name,
        payment: {
          paypalBusinessEmail: paypalEmail,
          zelleContact,
          earlyBirdDeadline: '2026년 6월 24일(수)',
          regularPriceUsd: 300,
          earlyBirdPriceUsd: 270,
        },
      });
    } else if (event === 'pre_survey') {
      const preSurveyUrl = Deno.env.get('BASIC_COURSE_PRE_SURVEY_URL') || '';
      if (!preSurveyUrl) {
        return new Response(JSON.stringify({ error: 'pre_survey_url_missing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      subject = '[ER] 기본과정 사전 성찰 설문';
      html = basicCoursePreSurveyHtml({ name: app.name, preSurveyUrl });
      await supabase
        .from('program_applications')
        .update({ pre_survey_sent_at: new Date().toISOString() })
        .eq('id', applicationId);
    } else if (event === 'graduation') {
      const applyUrl = Deno.env.get('EXPERT_COHORT_APPLY_URL') || 'https://er-coaching.com/#apply?track=paid';
      const testimonialUrl = Deno.env.get('BASIC_COURSE_TESTIMONIAL_URL') || 'mailto:json@er-coaching.com?subject=기본과정%20수료%20후기';
      subject = '[ER] 기본과정 수료를 축하드립니다';
      html = basicCourseGraduationUpsellHtml({
        name: app.name,
        expertCohortLabel: '전문가 양성반 6기 (2026년 9월 개강)',
        applyUrl,
        testimonialUrl,
      });
    } else {
      return new Response(JSON.stringify({ error: 'invalid_event' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await sendResendEmail({
      apiKey: resendKey,
      from: fromEmail,
      to: applicantEmail,
      replyTo,
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true, email: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error(err);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
