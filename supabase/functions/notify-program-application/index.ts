// 수석코치가 등록을 준비하고 강의계획안·자기관찰보고서·수료 안내를 발송한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  basicCourseGraduationHtml,
  programApplicationConfirmationHtml,
} from '../_shared/email-templates.ts';
import { buildBasicCourseWelcomeHtml, buildBasicCourseWelcomeText } from '../_shared/basic-course-welcome.ts';
import { requireHeadCoach } from '../_shared/head-coach.ts';
import {
  BASIC_COURSE_MAX_SEATS,
  BASIC_COURSE_OCTOBER_2026_COHORT_KEY,
  BASIC_COURSE_PROGRAM_KEY,
  basicCourseManualPaymentFromEnv,
  basicCourseOctoberPricing,
  basicCourseOctoberProductName,
  growthCoursePricing,
  isGrowthCourseProgram,
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

  let confirmationAttemptStarted = false;
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
    let plainText: string | undefined;
    let sentAtColumn = '';
    let registration: { prepared: boolean; status: string } | undefined;

    if (event === 'registration') {
      const isBasicCourse = app.program_key === BASIC_COURSE_PROGRAM_KEY;
      const isGrowthCandidate = isGrowthCourseProgram(app.program_key);
      if (!isBasicCourse && !isGrowthCandidate) {
        return new Response(JSON.stringify({ error: 'unsupported_program' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 기본과정 가격은 10월 전용이다. 접수일이나 예전 program_key로 기수를 추정하지 않는다.
      if (isBasicCourse && app.cohort_key !== BASIC_COURSE_OCTOBER_2026_COHORT_KEY) {
        return new Response(JSON.stringify({
          error: 'cohort_confirmation_required',
          message: '신청 기수를 확인해 주세요. 2026년 10월 기수가 명시된 신청에만 이 등록·결제 안내를 보낼 수 있습니다.',
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let growthCourse: { id: string; title: string } | null = null;
      if (isGrowthCandidate) {
        const { data: course, error: courseError } = await supabase.from('edu_courses')
          .select('id,code,title,kind').eq('code', app.program_key).maybeSingle();
        if (courseError) throw courseError;
        if (!course || course.kind !== 'growth') {
          return new Response(JSON.stringify({ error: 'unsupported_program' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const { data: cohort, error: cohortError } = await supabase.from('edu_cohorts')
          .select('id,course_id').eq('application_cohort_key', app.cohort_key || '').maybeSingle();
        if (cohortError) throw cohortError;
        if (!cohort || cohort.course_id !== course.id) {
          return new Response(JSON.stringify({ error: 'cohort_confirmation_required', message: '신청 과정에 맞는 교육 기수를 확인해 주세요.' }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        growthCourse = course;
      }
      const pricing = growthCourse ? growthCoursePricing(app.message) : basicCourseOctoberPricing(app.message);
      const hasKoreanPreference = app.payment_preference === 'kr_bank';
      const hasKoreanCountry = /(한국|korea|south korea)/i.test(String(app.country || ''));
      const paymentRegion: 'KR' | 'OVERSEAS' = growthCourse || app.payment_region === 'KR'
        || (app.payment_region !== 'OVERSEAS' && (hasKoreanPreference || hasKoreanCountry))
        ? 'KR'
        : 'OVERSEAS';
      const paymentCurrency = paymentRegion === 'KR' ? 'KRW' : 'USD';
      const { data: prepared, error: prepareError } = await adminSupabase
        .rpc('admin_prepare_program_application_registration', {
          p_id: applicationId,
          p_cohort_key: app.cohort_key,
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

      registration = { prepared: true, status: prepared?.status || 'payment_pending' };
      if (app.confirmation_email_sent_at || app.registration_email_sent_at || (isBasicCourse && app.receipt_email_sent_at)) {
        return new Response(JSON.stringify({ ok: true, registration, email: { skipped: true, reason: 'already_sent' } }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (resendKey) {
        const { data: claimed, error: claimError } = await supabase.from('program_applications')
          .update({ confirmation_email_attempted_at: new Date().toISOString() })
          .eq('id', applicationId).is('confirmation_email_attempted_at', null).is('confirmation_email_sent_at', null)
          .select('id').maybeSingle();
        if (claimError) {
          return new Response(JSON.stringify({ error: 'email_delivery_claim_failed', message: '메일 발송 준비 기록을 저장하지 못했습니다. 메일은 발송하지 않았습니다.', registration }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (!claimed) {
          // 다른 요청의 발송 진행 중이거나 결과 저장에 실패한 상태일 수 있으므로 재발송하지 않는다.
          const { data: delivery, error: deliveryError } = await supabase.from('program_applications')
            .select('confirmation_email_sent_at').eq('id', applicationId).maybeSingle();
          if (!deliveryError && delivery?.confirmation_email_sent_at) {
            return new Response(JSON.stringify({ ok: true, registration, email: { skipped: true, reason: 'already_sent' } }), {
              status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ error: 'email_delivery_uncertain', message: '이 안내 메일의 발송 시도 기록이 있으나 완료 여부를 확인하지 못했습니다. 중복 발송을 막기 위해 재발송하지 않았습니다. 운영자가 메일 발송 기록을 확인해 주세요.', registration }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      confirmationAttemptStarted = Boolean(resendKey);
      const label = growthCourse?.title || basicCourseOctoberProductName();
      subject = `[ER] ${label} 신청 접수 및 등록 안내`;
      html = programApplicationConfirmationHtml({
        name: app.name,
        programLabel: label,
        pricing,
        payment: {
          ...basicCourseManualPaymentFromEnv(app.name),
          ...(growthCourse ? { memoHint: `ER Growth - ${app.name}` } : {}),
        },
        paymentRegion,
        paymentPreference: app.payment_preference || undefined,
        installmentPreference: app.installment_preference || undefined,
      });
      sentAtColumn = 'registration_email_sent_at';
    } else if (event === 'pre_survey') {
      if (app.program_key !== BASIC_COURSE_PROGRAM_KEY) {
        return new Response(JSON.stringify({ error: 'unsupported_program' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (app.cohort_key !== BASIC_COURSE_OCTOBER_2026_COHORT_KEY) {
        return new Response(JSON.stringify({ error: 'cohort_confirmation_required', message: '2026년 10월 기본과정 신청자에게만 이 강의계획안을 보낼 수 있습니다.' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      subject = '[ER] 기본과정 강의계획안 및 자기관찰보고서 안내';
      html = buildBasicCourseWelcomeHtml({ name: app.name });
      plainText = buildBasicCourseWelcomeText({ name: app.name });
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
      text: plainText,
      ...(event === 'registration' ? { idempotencyKey: `application-confirmation/${applicationId}` } : {}),
    });

    if (!result.skipped && sentAtColumn) {
      const { error: sentAtError } = await supabase
        .from('program_applications')
        .update({ [sentAtColumn]: new Date().toISOString(), ...(event === 'registration' ? { confirmation_email_sent_at: new Date().toISOString() } : {}) })
        .eq('id', applicationId);
      if (sentAtError) {
        console.error('email sent timestamp update failed', sentAtError);
        return new Response(JSON.stringify({ error: 'email_sent_record_failed', message: '메일은 발송되었지만 발송 기록을 저장하지 못했습니다. 다시 발송하기 전에 기록을 확인해 주세요.', email: result, registration }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, email: result, ...(registration ? { registration } : {}) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error(err);
    if (confirmationAttemptStarted) {
      return new Response(JSON.stringify({ error: 'email_delivery_uncertain', message: '메일 발송을 시도했지만 결과를 확인하지 못했습니다. 중복 발송을 막기 위해 재시도를 차단했습니다. 운영자가 실제 발송 기록을 확인해 주세요.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
