// 헤드 코치: 등록·결제 안내·사전 성찰·수료 안내 메일 발송
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  basicCourseGraduationHtml,
  basicCoursePreSurveyHtml,
  basicCourseRegistrationHtml,
} from '../_shared/email-templates.ts';
import { requireHeadCoach } from '../_shared/head-coach.ts';
import {
  BASIC_COURSE_MAX_SEATS,
  BASIC_COURSE_OCTOBER_2026_COHORT_KEY,
  BASIC_COURSE_PROGRAM_KEY,
  basicCourseManualPaymentFromEnv,
  basicCourseOctoberPricing,
} from '../_shared/program-pricing.ts';
import { extractEmailFromContact, sendResendEmail } from '../_shared/resend.ts';

type NotifyEvent = 'registration' | 'pre_survey' | 'graduation';

type NotifyPayload = {
  application_id?: string;
  event?: NotifyEvent;
};

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
    const authHeader = req.headers.get('Authorization') || '';

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
    const adminSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
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
    let sentAtColumn = '';

    if (event === 'registration') {
      if (app.program_key !== BASIC_COURSE_PROGRAM_KEY) {
        return new Response(JSON.stringify({ error: 'unsupported_program' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const pricing = basicCourseOctoberPricing();
      const hasKoreanPreference = app.payment_preference === 'kr_bank';
      const hasKoreanCountry = /(한국|korea|south korea)/i.test(String(app.country || ''));
      const paymentRegion: 'KR' | 'OVERSEAS' = app.payment_region === 'KR'
        || (app.payment_region !== 'OVERSEAS' && (hasKoreanPreference || hasKoreanCountry))
        ? 'KR'
        : 'OVERSEAS';
      const paymentCurrency = paymentRegion === 'KR' ? 'KRW' : 'USD';
      const { data: prepared, error: prepareError } = await adminSupabase
        .rpc('admin_prepare_program_application_registration', {
          p_id: applicationId,
          p_cohort_key: app.cohort_key || BASIC_COURSE_OCTOBER_2026_COHORT_KEY,
          p_max_seats: BASIC_COURSE_MAX_SEATS,
          p_payment_region: paymentRegion,
          p_payment_currency: paymentCurrency,
          p_payment_amount_usd: paymentRegion === 'OVERSEAS' ? pricing.amountUsd : null,
          p_payment_amount_krw: paymentRegion === 'KR' ? pricing.amountKrw : null,
        });
      if (prepareError) {
        console.error('registration preparation failed', prepareError);
        return new Response(JSON.stringify({ error: 'registration_prepare_failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (prepared?.status === 'waitlisted') {
        return new Response(JSON.stringify({ error: 'seats_full' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      subject = '[ER] 10월 기본과정 등록·결제 안내';
      html = basicCourseRegistrationHtml({
        name: app.name,
        pricing: {
          overseasPriceUsd: pricing.overseasPriceUsd,
          bankTransferPriceKrw: pricing.bankTransferPriceKrw,
          amountUsd: pricing.amountUsd,
          amountKrw: pricing.amountKrw,
        },
        payment: basicCourseManualPaymentFromEnv(app.name),
        paymentRegion,
        paymentPreference: app.payment_preference || undefined,
        installmentPreference: app.installment_preference || undefined,
      });
      sentAtColumn = 'registration_email_sent_at';
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
      sentAtColumn = 'pre_survey_sent_at';
    } else if (event === 'graduation') {
      const testimonialUrl = Deno.env.get('BASIC_COURSE_TESTIMONIAL_URL') || 'mailto:json@er-coaching.com?subject=기본과정%20수료%20후기';
      subject = '[ER] 기본과정 수료를 축하드립니다';
      html = basicCourseGraduationHtml({
        name: app.name,
        testimonialUrl,
      });
      sentAtColumn = 'graduation_email_sent_at';
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

    if (!result.skipped && sentAtColumn) {
      const { error: sentAtError } = await supabase
        .from('program_applications')
        .update({ [sentAtColumn]: new Date().toISOString() })
        .eq('id', applicationId);
      if (sentAtError) console.error('email sent timestamp update failed', sentAtError);
    }

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
