// 웹사이트 신청 폼 접수 — DB 저장 + 관리자·신청자 이메일 (Resend)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  adminApplicationNoticeHtml,
  applicantReceivedHtml,
  programApplicationConfirmationHtml,
} from '../_shared/email-templates.ts';
import { extractEmailFromContact, sendResendEmail } from '../_shared/resend.ts';
import {
  BASIC_COURSE_OCTOBER_2026_COHORT_KEY,
  BASIC_COURSE_PROGRAM_KEY,
  basicCourseManualPaymentFromEnv,
  basicCourseOctoberPricing,
  growthCoursePricing,
  isGrowthCourseProgram,
} from '../_shared/program-pricing.ts';
import { verifyTurnstileToken } from '../_shared/turnstile.ts';

type ApplyPayload = {
  name?: string;
  contact?: string;
  category?: string;
  message?: string;
  source?: string;
  user_id?: string | null;
  turnstile_token?: string;
  program_key?: string;
  cohort_key?: string;
  phone?: string;
  country?: string;
  preferred_time?: string;
  enneagram_experience?: string;
  referral_source?: string;
  referral_name?: string;
  payment_region?: string;
  payment_preference?: string;
  installment_preference?: string;
  covenant_agreed?: boolean;
};

function inferProgramKey(payload: ApplyPayload): string {
  const explicit = String(payload.program_key || '').trim();
  if (['enneagram_basic_october', 'basic_course_october', 'enneagram_basic'].includes(explicit)) {
    return BASIC_COURSE_PROGRAM_KEY;
  }
  if (explicit) return explicit;
  const category = String(payload.category || '').toLowerCase();
  if (category.includes('기본과정') || category.includes('basic')) return BASIC_COURSE_PROGRAM_KEY;
  if (category.includes('parenting') || category.includes('양육')) return 'parenting_workshop';
  return 'general';
}

function normalizePaymentRegion(payload: ApplyPayload, isBasicCourse: boolean): 'KR' | 'OVERSEAS' | null {
  if (!isBasicCourse) return null;
  const explicit = String(payload.payment_region || '').trim().toUpperCase();
  if (explicit === 'KR' || explicit === 'OVERSEAS') return explicit;
  const country = String(payload.country || '').trim();
  return /(한국|korea|south korea)/i.test(country) ? 'KR' : 'OVERSEAS';
}

function allowedValue(value: unknown, allowed: string[]): string | null {
  const normalized = String(value || '').trim();
  return allowed.includes(normalized) ? normalized : null;
}

function parseApplySource(source: string): string {
  const parts = String(source || '').split(':');
  return parts.length >= 3 ? parts[2] : parts[parts.length - 1] || '';
}

function programLabel(programKey: string, category: string): string {
  if (programKey === BASIC_COURSE_PROGRAM_KEY) return 'ER 성경적 에니어그램 기본과정 8주 (2026년 10월)';
  if (programKey === 'parenting_workshop') return 'Enneagram for Parenting 4주 워크샵';
  return category || 'ER 프로그램';
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
    const payload = (await req.json()) as ApplyPayload;
    const name = String(payload.name || '').trim();
    const contact = String(payload.contact || '').trim();
    const category = String(payload.category || '').trim();
    const message = String(payload.message || '').trim();
    const source = String(payload.source || 'website').trim();

    if (!name || !contact || !category) {
      return new Response(JSON.stringify({ error: 'missing_required_fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const turnstileOk = await verifyTurnstileToken(
      String(payload.turnstile_token || ''),
      Deno.env.get('TURNSTILE_SECRET_KEY') || '',
      req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined,
    );
    if (!turnstileOk) {
      return new Response(JSON.stringify({ error: 'turnstile_failed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceKey);

    const programKey = inferProgramKey(payload);
    const applySource = parseApplySource(source);
    const isBasicCourse = programKey === BASIC_COURSE_PROGRAM_KEY;
    let growthCourse: { id: string; title: string } | null = null;
    if (isGrowthCourseProgram(programKey)) {
      const { data: course, error: courseError } = await supabase.from('edu_courses')
        .select('id,code,title,kind').eq('code', programKey).maybeSingle();
      if (courseError) throw courseError;
      if (!course || course.kind !== 'growth') {
        return new Response(JSON.stringify({ error: 'unsupported_program', message: '신청 가능한 심화과정을 확인해 주세요.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const requestedCohort = String(payload.cohort_key || '').trim();
      const { data: cohort, error: cohortError } = await supabase.from('edu_cohorts')
        .select('id,course_id').eq('application_cohort_key', requestedCohort).maybeSingle();
      if (cohortError) throw cohortError;
      if (!requestedCohort || !cohort || cohort.course_id !== course.id) {
        return new Response(JSON.stringify({ error: 'cohort_confirmation_required', message: '신청할 심화과정의 기수를 확인해 주세요. 기수가 확인되기 전에는 접수하거나 결제를 안내하지 않습니다.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      growthCourse = course;
    }
    const pricing = isBasicCourse ? basicCourseOctoberPricing(message)
      : growthCourse ? growthCoursePricing(message) : null;
    const phone = String(payload.phone || '').trim();
    if (isBasicCourse && !phone) {
      return new Response(JSON.stringify({ error: 'missing_phone' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const cohortKey = isBasicCourse ? BASIC_COURSE_OCTOBER_2026_COHORT_KEY
      : growthCourse ? String(payload.cohort_key || '').trim() || null : null;
    const paymentRegion = growthCourse ? 'KR' : normalizePaymentRegion(payload, isBasicCourse);
    const paymentCurrency = paymentRegion === 'KR' ? 'KRW' : (paymentRegion === 'OVERSEAS' ? 'USD' : null);
    const paymentPreference = allowedValue(payload.payment_preference, [
      'kr_bank', 'zelle', 'venmo',
    ]);
    const installmentPreference = allowedValue(payload.installment_preference, [
      'full', 'split_consult',
    ]);

    const { data: row, error: insertError } = await supabase
      .from('program_applications')
      .insert({
        program_key: programKey,
        cohort_key: cohortKey,
        status: 'received',
        name,
        contact,
        phone: phone || null,
        category,
        message,
        country: payload.country || null,
        preferred_time: payload.preferred_time || null,
        enneagram_experience: payload.enneagram_experience || null,
        referral_source: payload.referral_source || null,
        referral_name: payload.referral_name || null,
        payment_region: paymentRegion,
        payment_currency: paymentCurrency,
        payment_amount_krw: paymentRegion === 'KR' ? pricing?.amountKrw : null,
        payment_amount_usd: paymentRegion === 'OVERSEAS' ? pricing?.amountUsd : null,
        payment_preference: paymentPreference,
        installment_preference: installmentPreference,
        covenant_agreed: Boolean(payload.covenant_agreed),
        source,
        apply_source: applySource || null,
        user_id: payload.user_id || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('insert failed', insertError);
      return new Response(JSON.stringify({ error: 'db_insert_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') || '';
    const fromEmail = Deno.env.get('APPLICATION_FROM_EMAIL') || 'ER <enrollment@er-coaching.com>';
    const notifyEmail = Deno.env.get('APPLICATION_NOTIFY_EMAIL') || 'json@er-coaching.com';
    const replyTo = Deno.env.get('APPLICATION_REPLY_TO') || 'json@er-coaching.com';
    const label = growthCourse?.title || programLabel(programKey, category);
    const applicantEmail = extractEmailFromContact(contact);

    try {
      await sendResendEmail({
        apiKey: resendKey,
        from: fromEmail,
        to: notifyEmail,
        replyTo: applicantEmail || undefined,
        subject: `[ER 신청] ${label} — ${name}`,
        html: adminApplicationNoticeHtml({
          name,
          contact,
          programKey,
          category,
          message,
          source,
          applicationId: row.id,
          cohortKey: cohortKey || undefined,
          paymentRegion: paymentRegion || undefined,
          paymentPreference: paymentPreference || undefined,
          installmentPreference: installmentPreference || undefined,
          pricing: pricing || undefined,
        }),
      });
    } catch (emailErr) {
      console.error('admin notify email failed', emailErr);
    }

    let receiptWarning: string | undefined;
    let confirmationAttemptStarted = false;
    if (applicantEmail) {
      try {
        if (pricing && resendKey) {
          const { data: claimed, error: claimError } = await supabase.from('program_applications')
            .update({ confirmation_email_attempted_at: new Date().toISOString() })
            .eq('id', row.id).is('confirmation_email_attempted_at', null).is('confirmation_email_sent_at', null)
            .select('id').maybeSingle();
          if (claimError) throw new Error('email_delivery_claim_failed');
          if (!claimed) throw new Error('email_delivery_uncertain');
          confirmationAttemptStarted = true;
        }
        const receiptResult = await sendResendEmail({
          apiKey: resendKey,
          from: fromEmail,
          to: applicantEmail,
          replyTo,
          subject: pricing ? `[ER] ${label} 신청 접수 및 등록 안내` : `[ER] ${label} 신청 접수 확인`,
          idempotencyKey: `application-confirmation/${row.id}`,
          html: pricing
            ? programApplicationConfirmationHtml({
              name,
              programLabel: label,
              paymentRegion: paymentRegion || undefined,
              paymentPreference: paymentPreference || undefined,
              installmentPreference: installmentPreference || undefined,
              pricing,
              payment: {
                ...basicCourseManualPaymentFromEnv(name),
                ...(growthCourse ? { memoHint: `ER Growth - ${name}` } : {}),
              },
            })
            : applicantReceivedHtml({ name, programLabel: label }),
        });
        if (!receiptResult.skipped) {
          const { error: receiptRecordError } = await supabase
            .from('program_applications')
            .update({ receipt_email_sent_at: new Date().toISOString(), ...(pricing ? { confirmation_email_sent_at: new Date().toISOString() } : {}) })
            .eq('id', row.id);
          if (receiptRecordError) {
            console.error('receipt sent but timestamp update failed', receiptRecordError);
            receiptWarning = 'email_sent_record_failed';
          }
        }
      } catch (emailErr) {
        receiptWarning = confirmationAttemptStarted ? 'email_delivery_uncertain'
          : emailErr instanceof Error && ['email_delivery_claim_failed', 'email_delivery_uncertain'].includes(emailErr.message) ? emailErr.message : 'receipt_email_failed';
        console.error('applicant receipt email failed', emailErr);
      }
    }

    return new Response(JSON.stringify({ ok: true, id: row.id, cohort_key: cohortKey, ...(receiptWarning ? { warning: receiptWarning, warning_message: '신청은 접수되었습니다. 안내 메일의 발송 기록 확인이 필요하므로 재신청하지 말고 담당자에게 문의해 주세요.' } : {}) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
