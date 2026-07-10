// 프로그램 결제 완료 처리 — PayPal·Stripe webhook 공통

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { basicCoursePreSurveyHtml } from './email-templates.ts';
import { BASIC_COURSE_JULY_MAX_SEATS } from './program-pricing.ts';
import { extractEmailFromContact, sendResendEmail } from './resend.ts';

export type ConfirmProgramPaymentInput = {
  applicationId: string;
  programKey: string;
  provider: 'paypal' | 'stripe';
  externalId: string;
  amountUsd: number;
  currency: string;
  customerEmail: string;
  paymentMethod: string;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  rawMetadata?: Record<string, unknown>;
};

export type ConfirmProgramPaymentResult = {
  duplicate: boolean;
  confirmed: boolean;
  waitlisted: boolean;
};

export async function confirmProgramPayment(
  supabase: SupabaseClient,
  input: ConfirmProgramPaymentInput,
): Promise<ConfirmProgramPaymentResult> {
  const { data: existingEvent } = await supabase
    .from('payment_events')
    .select('id')
    .eq('provider', input.provider)
    .eq('external_id', input.externalId)
    .maybeSingle();

  if (existingEvent) {
    return { duplicate: true, confirmed: false, waitlisted: false };
  }

  const { data: app, error: fetchError } = await supabase
    .from('program_applications')
    .select('*')
    .eq('id', input.applicationId)
    .maybeSingle();

  if (fetchError || !app) {
    throw new Error('application_not_found');
  }

  if (app.status === 'confirmed') {
    await supabase.from('payment_events').insert({
      application_id: input.applicationId,
      program_key: input.programKey,
      provider: input.provider,
      external_id: input.externalId,
      amount_usd: input.amountUsd,
      currency: input.currency,
      customer_email: input.customerEmail,
      customer_name: app.name,
      paid_at: new Date().toISOString(),
      raw_metadata: { already_confirmed: true, ...(input.rawMetadata || {}) },
    });
    return { duplicate: true, confirmed: true, waitlisted: false };
  }

  const paidAt = new Date().toISOString();
  const customerEmail = input.customerEmail || extractEmailFromContact(app.contact) || '';

  const { count: confirmedCount } = await supabase
    .from('program_applications')
    .select('id', { count: 'exact', head: true })
    .eq('program_key', input.programKey)
    .eq('status', 'confirmed');

  const seatsFull = (confirmedCount ?? 0) >= BASIC_COURSE_JULY_MAX_SEATS;

  if (seatsFull) {
    await supabase
      .from('program_applications')
      .update({
        status: 'waitlisted',
        paid_at: paidAt,
        payment_method: input.paymentMethod,
        payment_amount_usd: input.amountUsd,
        paypal_order_id: input.paypalOrderId || app.paypal_order_id || null,
        paypal_capture_id: input.paypalCaptureId || null,
        checkout_url: null,
      })
      .eq('id', input.applicationId);

    await supabase.from('payment_events').insert({
      application_id: input.applicationId,
      program_key: input.programKey,
      provider: input.provider,
      external_id: input.externalId,
      amount_usd: input.amountUsd,
      currency: input.currency,
      customer_email: customerEmail,
      customer_name: app.name,
      paid_at: paidAt,
      raw_metadata: { waitlisted: true, ...(input.rawMetadata || {}) },
    });

    return { duplicate: false, confirmed: false, waitlisted: true };
  }

  const { error: updateError } = await supabase
    .from('program_applications')
    .update({
      status: 'confirmed',
      confirmed_at: paidAt,
      paid_at: paidAt,
      payment_amount_usd: input.amountUsd,
      payment_method: input.paymentMethod,
      paypal_order_id: input.paypalOrderId || app.paypal_order_id || null,
      paypal_capture_id: input.paypalCaptureId || null,
      checkout_url: null,
    })
    .eq('id', input.applicationId);

  if (updateError) {
    console.error(updateError);
    throw new Error('db_update_failed');
  }

  const { error: ledgerError } = await supabase.from('payment_events').insert({
    application_id: input.applicationId,
    program_key: input.programKey,
    provider: input.provider,
    external_id: input.externalId,
    amount_usd: input.amountUsd,
    currency: input.currency,
    customer_email: customerEmail,
    customer_name: app.name,
    paid_at: paidAt,
    raw_metadata: input.rawMetadata || {},
  });

  if (ledgerError) {
    console.error(ledgerError);
  }

  const preSurveyUrl = Deno.env.get('BASIC_COURSE_PRE_SURVEY_URL') || '';
  const resendKey = Deno.env.get('RESEND_API_KEY') || '';
  const fromEmail = Deno.env.get('APPLICATION_FROM_EMAIL') || 'ER <enrollment@er-coaching.com>';
  const replyTo = Deno.env.get('APPLICATION_REPLY_TO') || 'json@er-coaching.com';

  if (preSurveyUrl && customerEmail && !app.pre_survey_sent_at) {
    try {
      await sendResendEmail({
        apiKey: resendKey,
        from: fromEmail,
        to: customerEmail,
        replyTo,
        subject: '[ER] 기본과정 사전 성찰 설문',
        html: basicCoursePreSurveyHtml({ name: app.name, preSurveyUrl }),
      });
      await supabase
        .from('program_applications')
        .update({ pre_survey_sent_at: paidAt })
        .eq('id', input.applicationId);
    } catch (mailErr) {
      console.error('pre_survey email failed', mailErr);
    }
  }

  return { duplicate: false, confirmed: true, waitlisted: false };
}
