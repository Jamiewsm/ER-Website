// 웹사이트 신청 폼 접수 — DB 저장 + 관리자·신청자 이메일 (Resend)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import {
  adminApplicationNoticeHtml,
  applicantReceivedHtml,
  basicCourseRegistrationHtml,
} from '../_shared/email-templates.ts';
import { extractEmailFromContact, sendResendEmail } from '../_shared/resend.ts';
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
  country?: string;
  preferred_time?: string;
  enneagram_experience?: string;
  referral_source?: string;
  referral_name?: string;
  covenant_agreed?: boolean;
};

function inferProgramKey(payload: ApplyPayload): string {
  const explicit = String(payload.program_key || '').trim();
  if (explicit) return explicit;
  const category = String(payload.category || '').toLowerCase();
  if (category.includes('기본과정') || category.includes('basic')) return 'enneagram_basic_july';
  if (category.includes('parenting') || category.includes('양육')) return 'parenting_workshop';
  return 'general';
}

function parseApplySource(source: string): string {
  const parts = String(source || '').split(':');
  return parts.length >= 3 ? parts[2] : parts[parts.length - 1] || '';
}

function programLabel(programKey: string, category: string): string {
  if (programKey === 'enneagram_basic_july') return 'ER 성경적 에니어그램 기본과정 8주 (2026년 7월)';
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

    const { data: row, error: insertError } = await supabase
      .from('program_applications')
      .insert({
        program_key: programKey,
        status: 'received',
        name,
        contact,
        category,
        message,
        country: payload.country || null,
        preferred_time: payload.preferred_time || null,
        enneagram_experience: payload.enneagram_experience || null,
        referral_source: payload.referral_source || null,
        referral_name: payload.referral_name || null,
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
    const label = programLabel(programKey, category);

    await sendResendEmail({
      apiKey: resendKey,
      from: fromEmail,
      to: notifyEmail,
      replyTo: contact,
      subject: `[ER 신청] ${label} — ${name}`,
      html: adminApplicationNoticeHtml({
        name,
        contact,
        programKey,
        category,
        message,
        source,
        applicationId: row.id,
      }),
    });

    const applicantEmail = extractEmailFromContact(contact);
    if (applicantEmail) {
      const isBasic = programKey === 'enneagram_basic_july';
      const paypalEmail = Deno.env.get('PAYPAL_BUSINESS_EMAIL') || '';
      const zelleContact = Deno.env.get('ZELLE_CONTACT') || '';
      const sendRegistrationNow = isBasic && paypalEmail && zelleContact;

      await sendResendEmail({
        apiKey: resendKey,
        from: fromEmail,
        to: applicantEmail,
        replyTo,
        subject: sendRegistrationNow
          ? '[ER] 7월 기본과정 등록·결제 안내'
          : `[ER] ${label} 신청 접수 확인`,
        html: sendRegistrationNow
          ? basicCourseRegistrationHtml({
            name,
            payment: {
              paypalBusinessEmail: paypalEmail,
              zelleContact,
              earlyBirdDeadline: '2026년 6월 24일(수)',
              regularPriceUsd: 300,
              earlyBirdPriceUsd: 270,
            },
          })
          : applicantReceivedHtml({ name, programLabel: label }),
      });

      if (sendRegistrationNow) {
        await supabase
          .from('program_applications')
          .update({ status: 'payment_pending' })
          .eq('id', row.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, id: row.id }), {
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
